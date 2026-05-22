import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ProjetosTable } from "@/components/projetos/projetos-table";
import { getProjetos } from "@/lib/data/projetos";

export const metadata: Metadata = { title: "Projetos" };

export default async function ProjetosPage() {
  const projetos = await getProjetos();

  return (
    <>
      <PageHeader
        title="Projetos"
        subtitle="Gerencie os projetos cadastrados na sua empresa"
      />
      <ProjetosTable projetos={projetos} />
    </>
  );
}
