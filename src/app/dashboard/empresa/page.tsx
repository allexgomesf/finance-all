import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { EmpresaForm } from "@/components/empresa/empresa-form";
import { getEmpresa } from "@/lib/data/empresa";

export const metadata: Metadata = { title: "Empresa" };

export default async function EmpresaPage() {
  const empresa = await getEmpresa();

  return (
    <>
      <PageHeader title="Empresa" subtitle="Gerencie os dados da sua empresa" />
      <div className="mx-auto max-w-3xl">
        <EmpresaForm empresa={empresa} />
      </div>
    </>
  );
}
