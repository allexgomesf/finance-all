import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/data/session";

export type DashboardCounts = {
  clientes: number;
  projetos: number;
  vendedores: number;
  valorPrevisto: number;
  isVendedor: boolean;
};

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isVendedor = profile?.cargo === "Vendedor";

  let clientesQuery = supabase.from("clientes").select("id", { count: "exact", head: true });
  let projetosQuery = supabase.from("projetos").select("id", { count: "exact", head: true });
  let valoresQuery = supabase.from("projetos").select("valor_previsto");

  if (isVendedor && profile) {
    clientesQuery = clientesQuery.eq("vendedor_id", profile.id);
    projetosQuery = projetosQuery.eq("vendedor_id", profile.id);
    valoresQuery = valoresQuery.eq("vendedor_id", profile.id);
  }

  const [clientes, projetos, vendedores, valores] = await Promise.all([
    clientesQuery,
    projetosQuery,
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("cargo", "Vendedor"),
    valoresQuery,
  ]);

  const valorPrevisto = (valores.data ?? []).reduce(
    (sum, row) => sum + (row.valor_previsto ?? 0),
    0,
  );

  return {
    clientes: clientes.count ?? 0,
    projetos: projetos.count ?? 0,
    vendedores: isVendedor ? 0 : (vendedores.count ?? 0),
    valorPrevisto,
    isVendedor,
  };
}
