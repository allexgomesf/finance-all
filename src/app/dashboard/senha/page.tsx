import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { SenhaForm } from "@/components/perfil/senha-form";

export const metadata: Metadata = { title: "Alterar senha" };

export default function SenhaPage() {
  return (
    <>
      <PageHeader
        title="Alterar senha"
        subtitle="Defina uma nova senha de acesso"
      />
      <div className="mx-auto max-w-2xl">
        <SenhaForm />
      </div>
    </>
  );
}
