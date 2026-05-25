import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ClientesTable } from "@/components/clientes/clientes-table";
import { getClientes } from "@/lib/data/clientes";
import { getPageTexts } from "@/lib/data/page-texts";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientesPage() {
  const [clientes, pageTexts] = await Promise.all([getClientes(), getPageTexts()]);
  const t = pageTexts["clientes"];

  return (
    <>
      <PageHeader
        title={t?.title ?? "Clientes"}
        subtitle={t?.subtitle ?? "Gerencie os clientes cadastrados na sua empresa"}
      />
      <ClientesTable clientes={clientes} />
    </>
  );
}
