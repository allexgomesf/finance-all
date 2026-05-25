import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { EmpresaForm } from "@/components/empresa/empresa-form";
import { getEmpresa } from "@/lib/data/empresa";
import { getPageTexts } from "@/lib/data/page-texts";
import { getCurrentProfile } from "@/lib/data/session";

export const metadata: Metadata = { title: "Empresa" };

export default async function EmpresaPage() {
  const profile = await getCurrentProfile();
  if (profile?.cargo !== "Admin") {
    redirect("/dashboard");
  }

  const [empresa, pageTexts] = await Promise.all([getEmpresa(), getPageTexts()]);
  const t = pageTexts["empresa"];

  return (
    <>
      <PageHeader title={t?.title ?? "Empresa"} subtitle={t?.subtitle ?? "Gerencie os dados da sua empresa"} />
      <div className="mx-auto max-w-3xl">
        <EmpresaForm empresa={empresa} />
      </div>
    </>
  );
}
