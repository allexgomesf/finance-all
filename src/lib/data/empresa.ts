import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type Empresa = Tables<"empresas">;

/**
 * Retorna a empresa do usuário logado. O RLS (`current_empresa_id()`) já
 * restringe a consulta à empresa correta — por isso um `select` simples basta.
 */
export async function getEmpresa(): Promise<Empresa | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("empresas")
    .select("*")
    .limit(1)
    .maybeSingle();
  return data;
}
