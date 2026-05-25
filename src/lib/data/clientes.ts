import "server-only";
import { createClient } from "@/lib/supabase/server";
import { clienteNome } from "@/lib/display";
import { getCurrentProfile } from "@/lib/data/session";
import type { Tables } from "@/lib/database.types";

export type Cliente = Tables<"clientes">;

export async function getClientes(): Promise<Cliente[]> {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  let query = supabase.from("clientes").select("*");

  if (profile?.cargo === "Vendedor") {
    query = query.eq("vendedor_id", profile.id);
  }

  const { data } = await query.order("created_at", { ascending: false });
  return data ?? [];
}

export async function getClienteById(id: string): Promise<Cliente | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return data;
}

/** Opções de cliente para selects de formulário. */
export async function getClienteOptions(): Promise<
  { id: string; nome: string }[]
> {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  let query = supabase.from("clientes").select("id, nome, razao_social, is_empresa");

  if (profile?.cargo === "Vendedor") {
    query = query.eq("vendedor_id", profile.id);
  }

  const { data } = await query;
  return (data ?? [])
    .map((cliente: Pick<Cliente, "id" | "nome" | "razao_social" | "is_empresa">) => ({
      id: cliente.id,
      nome: clienteNome(cliente),
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
