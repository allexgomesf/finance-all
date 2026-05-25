import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { UsuariosTable } from "@/components/usuarios/usuarios-table";
import { getUsuarios } from "@/lib/data/profiles";
import { getCurrentProfile } from "@/lib/data/session";
import { getPageTexts } from "@/lib/data/page-texts";

export const metadata: Metadata = { title: "Usuários" };

export default async function UsuariosPage() {
  const profile = await getCurrentProfile();
  if (profile?.cargo !== "Admin") {
    redirect("/dashboard");
  }

  const [usuarios, pageTexts] = await Promise.all([getUsuarios(), getPageTexts()]);
  const t = pageTexts["usuarios"];

  return (
    <>
      <PageHeader
        title={t?.title ?? "Usuários"}
        subtitle={t?.subtitle ?? "Gerencie os usuários cadastrados na sua empresa"}
      />
      <UsuariosTable usuarios={usuarios} />
    </>
  );
}
