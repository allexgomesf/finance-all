import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ProjetosTable } from "@/components/projetos/projetos-table";
import { getProjetos } from "@/lib/data/projetos";
import { getPageTexts } from "@/lib/data/page-texts";

export const metadata: Metadata = { title: "Projetos" };

export default async function ProjetosPage() {
  const [projetos, pageTexts] = await Promise.all([getProjetos(), getPageTexts()]);
  const t = pageTexts["projetos"];

  return (
    <>
      <PageHeader
        title={t?.title ?? "Projetos"}
        subtitle={t?.subtitle ?? "Gerencie os projetos cadastrados na sua empresa"}
      />
      <ProjetosTable projetos={projetos} />
    </>
  );
}
