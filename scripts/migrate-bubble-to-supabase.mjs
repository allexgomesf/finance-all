/**
 * Migração de dados Bubble -> Supabase.
 *
 * Lê todas as tabelas da Data API do Bubble e popula o schema criado nas
 * migrations `bubble_01..05`. Cria um usuário no Supabase Auth para cada
 * registro `User` do Bubble (senha aleatória — exige reset pelo usuário).
 *
 * É idempotente: pode ser re-executado. Tabelas de dados usam upsert por
 * `bubble_id`; usuários de auth são reaproveitados por e-mail.
 *
 * Uso:  node scripts/migrate-bubble-to-supabase.mjs
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

// ----------------------------------------------------------------------------
// Configuração
// ----------------------------------------------------------------------------
const env = {};
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const BUBBLE_BASE = "https://app.financeall.tech/api/1.1/obj";
const BUBBLE_TOKEN = env.BUBBLE_API_TOKEN;
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

for (const [k, v] of Object.entries({ BUBBLE_API_TOKEN: BUBBLE_TOKEN, NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY })) {
  if (!v) throw new Error(`Variável ausente no .env.local: ${k}`);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const AUTH_CONCURRENCY = 5;
const INSERT_BATCH = 500;

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a);

async function fetchAll(type) {
  const rows = [];
  let cursor = 0;
  for (;;) {
    const res = await fetch(`${BUBBLE_BASE}/${type}?limit=100&cursor=${cursor}`, {
      headers: { Authorization: `Bearer ${BUBBLE_TOKEN}` },
    });
    if (!res.ok) throw new Error(`Bubble ${type}: HTTP ${res.status} ${await res.text()}`);
    const { response } = await res.json();
    rows.push(...response.results);
    if ((response.remaining ?? 0) <= 0) break;
    cursor += response.results.length;
  }
  return rows;
}

/** Converte string monetária do Bubble em número (ou null). */
function num(v) {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  let s = String(v).replace(/\s/g, "");
  if (!s) return null;
  if (s.includes(",") && s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}
function int(v) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
/** Bubble entrega timestamp ISO; coluna é `date`. */
function date(v) {
  if (!v) return null;
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : null;
}
const cargo = (v) => (["Admin", "Gerente", "Vendedor"].includes(v) ? v : null);
const status = (v) => (["Pendente", "Pré-aprovado", "Reprovado"].includes(v) ? v : null);

async function upsertBatch(table, rows, onConflict) {
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const slice = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase.from(table).upsert(slice, { onConflict });
    if (error) throw new Error(`upsert ${table} [${i}..${i + slice.length}]: ${error.message}`);
    log(`  ${table}: ${Math.min(i + slice.length, rows.length)}/${rows.length}`);
  }
}

/** Map bubble_id -> uuid lendo a tabela já populada. */
async function idMap(table) {
  const m = new Map();
  let from = 0;
  for (;;) {
    const { data, error } = await supabase.from(table).select("id,bubble_id").range(from, from + 999);
    if (error) throw new Error(`idMap ${table}: ${error.message}`);
    for (const r of data) m.set(r.bubble_id, r.id);
    if (data.length < 1000) break;
    from += 1000;
  }
  return m;
}

async function listAllAuthUsers() {
  const byEmail = new Map();
  let page = 1;
  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers: ${error.message}`);
    for (const u of data.users) if (u.email) byEmail.set(u.email.toLowerCase(), u.id);
    if (!data.users.length) break;
    page++;
  }
  return byEmail;
}

async function mapPool(items, concurrency, fn) {
  const results = new Array(items.length);
  let idx = 0;
  async function worker() {
    for (;;) {
      const i = idx++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

async function createAuthUser(email, meta) {
  for (let attempt = 1; ; attempt++) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      password: randomUUID() + randomUUID(),
      user_metadata: meta,
    });
    if (!error) return { id: data.user.id, existed: false };
    const msg = (error.message || "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      return { id: null, existed: true };
    }
    if (attempt >= 4) throw new Error(`createUser ${email}: ${error.message}`);
    await sleep(500 * attempt);
  }
}

// ----------------------------------------------------------------------------
// Migração
// ----------------------------------------------------------------------------
async function main() {
  log("1/8 Buscando dados do Bubble…");
  const [empresas, users, clientes, projetos, simulacoes, observacoes] = await Promise.all([
    fetchAll("Empresa"),
    fetchAll("User"),
    fetchAll("Cliente"),
    fetchAll("Projeto"),
    fetchAll("Simulacao"),
    fetchAll("Observacoes"),
  ]);
  log(`  Empresa=${empresas.length} User=${users.length} Cliente=${clientes.length} Projeto=${projetos.length} Simulacao=${simulacoes.length} Observacoes=${observacoes.length}`);

  // --- empresas (sem created_by; preenchido depois) -------------------------
  log("2/8 Inserindo empresas…");
  await upsertBatch(
    "empresas",
    empresas.map((e) => ({
      bubble_id: e._id,
      nome: e.nome ?? null,
      razao_social: e.razaoSocial ?? null,
      cnpj: e.cnpj ?? null,
      cep: e.cep ?? null,
      cidade: e.cidade ?? null,
      estado: e.estado ?? null,
      bairro: e.bairro ?? null,
      complemento: e.complemento ?? null,
      end_numero: e.endnumero ?? null,
      agencia_bancaria: e.agenciaBancaria ?? null,
      conta_bancaria: e.contaBancaria ?? null,
      banco: e.banco ?? null,
      created_at: e["Created Date"] ?? null,
      updated_at: e["Modified Date"] ?? null,
    })),
    "bubble_id",
  );
  const empMap = await idMap("empresas");

  // --- auth.users + profiles ------------------------------------------------
  log(`3/8 Criando usuários no Supabase Auth (${users.length})…`);
  const existing = await listAllAuthUsers();
  log(`  ${existing.size} usuários de auth já existentes (serão reaproveitados).`);
  let created = 0;
  let reused = 0;
  let refreshed = false;
  const userMap = new Map(); // bubble User._id -> auth uid

  const authResults = await mapPool(users, AUTH_CONCURRENCY, async (u) => {
    const email = (u.authentication?.email?.email || "").trim().toLowerCase();
    if (!email) throw new Error(`Usuário sem e-mail: bubble_id=${u._id}`);
    let id = existing.get(email);
    if (id) {
      reused++;
    } else {
      const r = await createAuthUser(email, { bubble_id: u._id, full_name: u.nomeCompleto ?? null });
      if (r.id) {
        id = r.id;
        created++;
      } else {
        // já existia mas não estava no map — atualiza o map uma vez
        if (!refreshed) {
          refreshed = true;
          const fresh = await listAllAuthUsers();
          for (const [k, v] of fresh) if (!existing.has(k)) existing.set(k, v);
        }
        id = existing.get(email);
        if (!id) throw new Error(`auth user não encontrado após conflito: ${email}`);
        reused++;
      }
    }
    existing.set(email, id);
    userMap.set(u._id, id);
    const done = created + reused;
    if (done % 200 === 0) log(`  auth: ${done}/${users.length} (criados=${created} reaproveitados=${reused})`);
    return id;
  });
  log(`  auth concluído: criados=${created} reaproveitados=${reused}`);

  log("4/8 Inserindo profiles…");
  await upsertBatch(
    "profiles",
    users.map((u, i) => ({
      id: authResults[i],
      bubble_id: u._id,
      nome_completo: u.nomeCompleto ?? null,
      telefone: u.telefone ?? null,
      cargo: cargo(u.cargo),
      permissoes: u.permissoes ?? null,
      empresa_id: empMap.get(u.empresa) ?? null,
      anexos: u.anexos ?? null,
      user_signed_up: u.user_signed_up ?? false,
      created_at: u["Created Date"] ?? null,
      updated_at: u["Modified Date"] ?? null,
    })),
    "id",
  );

  // --- back-fill empresas.created_by ---------------------------------------
  log("5/8 Preenchendo empresas.created_by…");
  for (const e of empresas) {
    const cb = userMap.get(e["Created By"]);
    if (cb) {
      const { error } = await supabase.from("empresas").update({ created_by: cb }).eq("bubble_id", e._id);
      if (error) throw new Error(`update empresa ${e._id}: ${error.message}`);
    }
  }

  // --- clientes -------------------------------------------------------------
  log("6/8 Inserindo clientes…");
  await upsertBatch(
    "clientes",
    clientes.map((c) => ({
      bubble_id: c._id,
      nome: c.nome ?? null,
      email: c.email ?? null,
      cpf: c.cpf ?? null,
      cnpj: c.cnpj ?? null,
      rg: c.rg ?? null,
      orgao_expedidor: c.orgaoExpedidor ?? null,
      data_nascimento: date(c.dtNascimento),
      nome_mae: c.nomeMae ?? null,
      telefone: c.telefone ?? null,
      renda_mensal: num(c.rendaMensal),
      cep: c.cep ?? null,
      logradouro: c.logradouro ?? null,
      numero_end: c.numeroEnd ?? null,
      complemento: c.complemento ?? null,
      bairro: c.bairro ?? null,
      cidade: c.cidade ?? null,
      estado: c.estado ?? null,
      comprovante_renda: c.comprovanteRenda ?? null,
      is_empresa: c.isEmpresa ?? false,
      razao_social: c.razaoSocial ?? null,
      data_abertura_empresa: date(c.dataAberturaEmpresa),
      faturamento_empresa: num(c.faturamentoEmpresa),
      empresa_id: empMap.get(c.empresa) ?? null,
      vendedor_id: userMap.get(c.vendedor) ?? null,
      created_by: userMap.get(c["Created By"]) ?? null,
      created_at: c["Created Date"] ?? null,
      updated_at: c["Modified Date"] ?? null,
    })),
    "bubble_id",
  );
  const cliMap = await idMap("clientes");

  // --- projetos -------------------------------------------------------------
  log("7/8 Inserindo projetos e simulacoes…");
  await upsertBatch(
    "projetos",
    projetos.map((p) => ({
      bubble_id: p._id,
      nome_cliente: p.nomeCliente ?? null,
      status_projeto: status(p.statusProjeto),
      estagio_projeto: p.estagioProjeto ?? null,
      valor_conta_de_luz: num(p.valorContaDeLuz),
      valor_kwp: num(p.valorKwp),
      valor_previsto: num(p.valorPrevisto),
      anexos: p.anexos ?? null,
      cliente_id: cliMap.get(p.cliente) ?? null,
      empresa_id: empMap.get(p.empresa) ?? null,
      vendedor_id: userMap.get(p.vendedor) ?? null,
      responsavel_id: userMap.get(p.responsavel) ?? null,
      created_by: userMap.get(p["Created By"]) ?? null,
      created_at: p["Created Date"] ?? null,
      updated_at: p["Modified Date"] ?? null,
    })),
    "bubble_id",
  );
  const projMap = await idMap("projetos");

  // --- simulacoes -----------------------------------------------------------
  await upsertBatch(
    "simulacoes",
    simulacoes.map((s) => ({
      bubble_id: s._id,
      id_simulacao: int(s.idSimulacao),
      parcelas_simulacao: s.parcelasSimulacao ?? null,
      calculo_juros: num(s.calculoJuros),
      taxa_juros: num(s.taxaJuros),
      valor_entrada: num(s.valorEntrada),
      valor_financiado: num(s.valorFinanciado),
      valor_parcelado: num(s.valorParcelado),
      valor_total: num(s.valorTotal),
      empresa_id: empMap.get(s.empresa) ?? null,
      created_by: userMap.get(s["Created By"]) ?? null,
      created_at: s["Created Date"] ?? null,
      updated_at: s["Modified Date"] ?? null,
    })),
    "bubble_id",
  );

  // --- observacoes ----------------------------------------------------------
  log("8/8 Inserindo observacoes…");
  await upsertBatch(
    "observacoes",
    observacoes.map((o) => ({
      bubble_id: o._id,
      observacao: o.observacao ?? null,
      projeto_id: projMap.get(o.projeto) ?? null,
      user_id: userMap.get(o.user) ?? null,
      created_by: userMap.get(o["Created By"]) ?? null,
      created_at: o["Created Date"] ?? null,
      updated_at: o["Modified Date"] ?? null,
    })),
    "bubble_id",
  );

  // --- resumo ---------------------------------------------------------------
  log("Verificando contagens no Supabase…");
  const tables = ["empresas", "profiles", "clientes", "projetos", "simulacoes", "observacoes"];
  const source = { empresas: empresas.length, profiles: users.length, clientes: clientes.length, projetos: projetos.length, simulacoes: simulacoes.length, observacoes: observacoes.length };
  console.log("\n=== RESUMO DA MIGRAÇÃO ===");
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (error) throw new Error(`count ${t}: ${error.message}`);
    const ok = count === source[t] ? "OK" : "DIVERGENTE";
    console.log(`  ${t.padEnd(12)} bubble=${String(source[t]).padStart(5)}  supabase=${String(count).padStart(5)}  ${ok}`);
  }
  console.log(`  auth.users  criados=${created} reaproveitados=${reused}`);
  console.log("=== FIM ===\n");
}

main()
  .then(() => {
    log("Migração concluída com sucesso.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\nERRO NA MIGRAÇÃO:", err);
    process.exit(1);
  });
