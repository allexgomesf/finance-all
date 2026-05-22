import "server-only";
import { createClient } from "@/lib/supabase/server";

export type DashboardCounts = {
  clientes: number;
  projetos: number;
  vendedores: number;
  valorPrevisto: number;
};

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const supabase = await createClient();

  const [clientes, projetos, vendedores, valores] = await Promise.all([
    supabase.from("clientes").select("id", { count: "exact", head: true }),
    supabase.from("projetos").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("cargo", "Vendedor"),
    supabase.from("projetos").select("valor_previsto"),
  ]);

  const valorPrevisto = (valores.data ?? []).reduce(
    (sum, row) => sum + (row.valor_previsto ?? 0),
    0,
  );

  return {
    clientes: clientes.count ?? 0,
    projetos: projetos.count ?? 0,
    vendedores: vendedores.count ?? 0,
    valorPrevisto,
  };
}
