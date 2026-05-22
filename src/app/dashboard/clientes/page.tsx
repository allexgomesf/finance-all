import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ClientesTable } from "@/components/clientes/clientes-table";
import { getClientes } from "@/lib/data/clientes";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <>
      <PageHeader
        title="Clientes"
        subtitle="Gerencie os clientes cadastrados na sua empresa"
      />
      <ClientesTable clientes={clientes} />
    </>
  );
}
