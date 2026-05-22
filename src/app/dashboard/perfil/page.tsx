import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PerfilForm } from "@/components/perfil/perfil-form";
import { getCurrentProfile } from "@/lib/data/session";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Editar perfil" };

export default async function PerfilPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <PageHeader title="Editar perfil" subtitle="Atualize seus dados pessoais" />
      <div className="mx-auto max-w-2xl">
        <PerfilForm profile={profile} email={user?.email ?? ""} />
      </div>
    </>
  );
}
