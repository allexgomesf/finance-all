import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { SenhaForm } from "@/components/perfil/senha-form";
import { getPageTexts } from "@/lib/data/page-texts";

export const metadata: Metadata = { title: "Alterar senha" };

export default async function SenhaPage() {
  const pageTexts = await getPageTexts();
  const t = pageTexts["senha"];

  return (
    <>
      <PageHeader
        title={t?.title ?? "Alterar senha"}
        subtitle={t?.subtitle ?? "Defina uma nova senha de acesso"}
      />
      <div className="mx-auto max-w-2xl">
        <SenhaForm />
      </div>
    </>
  );
}
