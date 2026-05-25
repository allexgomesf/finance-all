import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PerfilForm } from "@/components/perfil/perfil-form";
import { getCurrentProfile } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";
import { getPageTexts } from "@/lib/data/page-texts";

export const metadata: Metadata = { title: "Editar perfil" };

export default async function PerfilPage() {
  const supabase = await createClient();
  const [profile, pageTexts, { data: { user } }] = await Promise.all([
    getCurrentProfile(),
    getPageTexts(),
    supabase.auth.getUser(),
  ]);
  const t = pageTexts["perfil"];

  return (
    <>
      <PageHeader title={t?.title ?? "Editar perfil"} subtitle={t?.subtitle ?? "Atualize seus dados pessoais"} />
      <div className="mx-auto max-w-2xl">
        <PerfilForm profile={profile} email={user?.email ?? ""} />
      </div>
    </>
  );
}
