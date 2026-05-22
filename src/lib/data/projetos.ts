import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Tables } from "@/lib/database.types";

/** Projeto com cliente / vendedor / responsável já resolvidos. */
export type ProjetoListItem = Tables<"projetos"> & {
  cliente: { id: string; nome: string | null; razao_social: string | null; email: string | null } | null;
  vendedor: { id: string; nome_completo: string | null } | null;
  responsavel: { id: string; nome_completo: string | null } | null;
};

export type Observacao = Tables<"observacoes"> & {
  autor: { nome_completo: string | null } | null;
};

export type AnexoSigned = { path: string; url: string; name: string };

const PROJETO_SELECT = `
  *,
  cliente:clientes!projetos_cliente_id_fkey(id, nome, razao_social, email),
  vendedor:profiles!projetos_vendedor_id_fkey(id, nome_completo),
  responsavel:profiles!projetos_responsavel_id_fkey(id, nome_completo)
`;

export async function getProjetos(): Promise<ProjetoListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projetos")
    .select(PROJETO_SELECT)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ProjetoListItem[];
}

export async function getProjetoById(
  id: string,
): Promise<ProjetoListItem | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projetos")
    .select(PROJETO_SELECT)
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as unknown as ProjetoListItem | null;
}

export async function getObservacoesByProjetoId(
  projetoId: string,
): Promise<Observacao[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("observacoes")
    .select("*, autor:profiles!observacoes_user_id_fkey(nome_completo)")
    .eq("projeto_id", projetoId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as Observacao[];
}

export async function getSignedAnexoUrls(
  paths: string[],
): Promise<AnexoSigned[]> {
  if (paths.length === 0) return [];
  const admin = createAdminClient();
  const results = await Promise.all(
    paths.map(async (path) => {
      const { data } = await admin.storage
        .from("projeto-anexos")
        .createSignedUrl(path, 3600);
      const name = path.split("/").pop() ?? path;
      return { path, url: data?.signedUrl ?? "", name };
    }),
  );
  return results.filter((r) => r.url !== "");
}
