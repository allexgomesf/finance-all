import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

/** ID da empresa do usuário logado (via função SQL `current_empresa_id`). */
export async function getCurrentEmpresaId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("current_empresa_id");
  return (data as string | null) ?? null;
}

/** Perfil (`profiles`) do usuário logado. */
export async function getCurrentProfile(): Promise<Tables<"profiles"> | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
}
