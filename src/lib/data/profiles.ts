import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

/** O e-mail é uma coluna materializada em `profiles` (sincronizada com `auth.users`). */
export type ProfileWithEmail = Tables<"profiles">;

const PAGE_SIZE = 1000;

/**
 * Lê todos os perfis (a RLS já escopa por empresa), paginando para escapar do
 * teto de 1000 linhas do PostgREST.
 */
async function fetchAllProfiles(
  cargo?: NonNullable<Tables<"profiles">["cargo"]>,
): Promise<ProfileWithEmail[]> {
  const supabase = await createClient();
  const rows: ProfileWithEmail[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    let query = supabase.from("profiles").select("*");
    if (cargo) query = query.eq("cargo", cargo);

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error || !data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
  }

  return rows;
}

export async function getUsuarios(): Promise<ProfileWithEmail[]> {
  return fetchAllProfiles();
}

export async function getVendedores(): Promise<ProfileWithEmail[]> {
  return fetchAllProfiles("Vendedor");
}

export async function getProfileById(
  id: string,
): Promise<ProfileWithEmail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

/** Perfis usáveis como vendedor/responsável em selects de formulário. */
export async function getProfileOptions(): Promise<
  { id: string; nome: string }[]
> {
  const profiles = await fetchAllProfiles();
  return profiles
    .map((profile) => ({
      id: profile.id,
      nome: profile.nome_completo || "Sem nome",
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
