/**
 * Sync incremental Bubble -> Supabase.
 *
 * Calcula `since` por tabela a partir de `max(updated_at)` no Supabase (com
 * 10 min de margem) e busca no Bubble apenas registros com `Modified Date >
 * since`. Faz upsert por `bubble_id` (ou por `id` em profiles).
 *
 * Idempotente: rodar de novo sem dados novos é no-op. Deleções no Bubble não
 * são propagadas.
 *
 * Uso:  npm run sync:bubble
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
const SAFETY_BUFFER_MIN = 10;

// ----------------------------------------------------------------------------
// Helpers (mesma lógica de migrate-bubble-to-supabase.mjs)
// ----------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(`[${new Date().toISOString()}]`, ...a);

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
function date(v) {
  if (!v) return null;
  const s = String(v);
  return s.length >= 10 ? s.slice(0, 10) : null;
}
const cargo = (v) => (["Admin", "Gerente", "Vendedor"].includes(v) ? v : null);
const status = (v) => (["Pendente", "Pré-aprovado", "Reprovado"].includes(v) ? v : null);

/** GET /api/1.1/obj/{type} paginando, com filtro `Modified Date > sinceIso`. */
async function fetchSince(type, sinceIso) {
  const constraints = JSON.stringify([
    { key: "Modified Date", constraint_type: "greater than", value: sinceIso },
  ]);
  const rows = [];
  let cursor = 0;
  for (;;) {
    const url = `${BUBBLE_BASE}/${type}?limit=100&cursor=${cursor}&constraints=${encodeURIComponent(constraints)}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${BUBBLE_TOKEN}` } });
    if (!res.ok) throw new Error(`Bubble ${type}: HTTP ${res.status} ${await res.text()}`);
    const { response } = await res.json();
    rows.push(...response.results);
    if ((response.remaining ?? 0) <= 0) break;
    cursor += response.results.length;
  }
  return rows;
}

async function upsertBatch(table, rows, onConflict) {
  for (let i = 0; i < rows.length; i += INSERT_BATCH) {
    const slice = rows.slice(i, i + INSERT_BATCH);
    const { error } = await supabase.from(table).upsert(slice, { onConflict });
    if (error) throw new Error(`upsert ${table} [${i}..${i + slice.length}]: ${error.message}`);
  }
}

async function buildIdMap(table) {
  const m = new Map();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase.from(table).select("id,bubble_id").range(from, from + PAGE - 1);
    if (error) throw new Error(`idMap ${table}: ${error.message}`);
    for (const r of data) if (r.bubble_id) m.set(r.bubble_id, r.id);
    if (data.length < PAGE) break;
  }
  return m;
}

/** Última `updated_at` do Supabase menos a margem; retorna ISO 8601. */
async function tableSince(table) {
  const { data, error } = await supabase
    .from(table)
    .select("updated_at")
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(1);
  if (error) throw new Error(`max(updated_at) ${table}: ${error.message}`);
  const latest = data?.[0]?.updated_at;
  if (!latest) return new Date(0).toISOString();
  const d = new Date(latest);
  d.setMinutes(d.getMinutes() - SAFETY_BUFFER_MIN);
  return d.toISOString();
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
// Main
// ----------------------------------------------------------------------------
async function main() {
  const tables = ["empresas", "profiles", "clientes", "projetos", "simulacoes", "observacoes"];
  const bubbleTypes = {
    empresas: "Empresa",
    profiles: "User",
    clientes: "Cliente",
    projetos: "Projeto",
    simulacoes: "Simulacao",
    observacoes: "Observacoes",
  };

  log("Calculando cutoffs (since) por tabela…");
  const since = {};
  for (const t of tables) {
    since[t] = await tableSince(t);
    log(`  since.${t} = ${since[t]}`);
  }

  log("Buscando deltas no Bubble…");
  const [empresas, users, clientes, projetos, simulacoes, observacoes] = await Promise.all([
    fetchSince(bubbleTypes.empresas, since.empresas),
    fetchSince(bubbleTypes.profiles, since.profiles),
    fetchSince(bubbleTypes.clientes, since.clientes),
    fetchSince(bubbleTypes.projetos, since.projetos),
    fetchSince(bubbleTypes.simulacoes, since.simulacoes),
    fetchSince(bubbleTypes.observacoes, since.observacoes),
  ]);
  const deltas = {
    empresas: empresas.length,
    profiles: users.length,
    clientes: clientes.length,
    projetos: projetos.length,
    simulacoes: simulacoes.length,
    observacoes: observacoes.length,
  };
  log(`  deltas: ${JSON.stringify(deltas)}`);

  const totalDelta = Object.values(deltas).reduce((a, b) => a + b, 0);
  if (totalDelta === 0) {
    log("Nada novo. Encerrando.");
    return;
  }

  log("Carregando mapas de FK do Supabase…");
  const [empMap, userMap, cliMap, projMap] = await Promise.all([
    buildIdMap("empresas"),
    buildIdMap("profiles"),
    buildIdMap("clientes"),
    buildIdMap("projetos"),
  ]);
  log(`  maps: empresas=${empMap.size} profiles=${userMap.size} clientes=${cliMap.size} projetos=${projMap.size}`);

  // 1. empresas (sem created_by; preenchido depois) -----------------------
  if (empresas.length) {
    log(`Upsert empresas (${empresas.length})…`);
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
    const fresh = await buildIdMap("empresas");
    for (const [k, v] of fresh) empMap.set(k, v);
  }

  // 2. profiles (auth + profile) -----------------------------------------
  let created = 0;
  let reused = 0;
  if (users.length) {
    log(`Sincronizando ${users.length} usuários…`);
    const existingAuth = await listAllAuthUsers();
    log(`  auth.users existentes: ${existingAuth.size}`);

    const authResults = await mapPool(users, AUTH_CONCURRENCY, async (u) => {
      const email = (u.authentication?.email?.email || "").trim().toLowerCase();
      if (!email) throw new Error(`User do Bubble sem e-mail: bubble_id=${u._id}`);
      let id = existingAuth.get(email) ?? userMap.get(u._id);
      if (id) {
        reused++;
      } else {
        const r = await createAuthUser(email, { bubble_id: u._id, full_name: u.nomeCompleto ?? null });
        if (r.id) {
          id = r.id;
          created++;
        } else {
          const fresh = await listAllAuthUsers();
          for (const [k, v] of fresh) if (!existingAuth.has(k)) existingAuth.set(k, v);
          id = existingAuth.get(email);
          if (!id) throw new Error(`auth user não encontrado após conflito: ${email}`);
          reused++;
        }
      }
      existingAuth.set(email, id);
      userMap.set(u._id, id);
      return id;
    });
    log(`  auth: criados=${created} reaproveitados=${reused}`);

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
  }

  // back-fill empresas.created_by (caso novas empresas tenham vindo no delta)
  if (empresas.length) {
    for (const e of empresas) {
      const cb = userMap.get(e["Created By"]);
      if (cb) {
        const { error } = await supabase.from("empresas").update({ created_by: cb }).eq("bubble_id", e._id);
        if (error) throw new Error(`update empresa ${e._id}: ${error.message}`);
      }
    }
  }

  // 3. clientes ----------------------------------------------------------
  if (clientes.length) {
    log(`Upsert clientes (${clientes.length})…`);
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
    const fresh = await buildIdMap("clientes");
    for (const [k, v] of fresh) cliMap.set(k, v);
  }

  // 4. projetos ----------------------------------------------------------
  if (projetos.length) {
    log(`Upsert projetos (${projetos.length})…`);
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
    const fresh = await buildIdMap("projetos");
    for (const [k, v] of fresh) projMap.set(k, v);
  }

  // 5. simulacoes --------------------------------------------------------
  if (simulacoes.length) {
    log(`Upsert simulacoes (${simulacoes.length})…`);
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
  }

  // 6. observacoes -------------------------------------------------------
  if (observacoes.length) {
    log(`Upsert observacoes (${observacoes.length})…`);
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
  }

  // resumo --------------------------------------------------------------
  log("Contagens pós-sync no Supabase…");
  console.log("\n=== RESUMO DO SYNC ===");
  for (const t of tables) {
    const { count, error } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (error) throw new Error(`count ${t}: ${error.message}`);
    console.log(`  ${t.padEnd(12)} bubble_delta=${String(deltas[t]).padStart(4)}  supabase_after=${String(count).padStart(5)}`);
  }
  if (users.length) console.log(`  auth.users  criados=${created} reaproveitados=${reused}`);
  console.log("=== FIM ===\n");
}

main()
  .then(() => {
    log("Sync concluído com sucesso.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("\nERRO NO SYNC:", err);
    process.exit(1);
  });
