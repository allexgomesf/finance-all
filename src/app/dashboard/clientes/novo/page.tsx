import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { getProfileOptions } from "@/lib/data/profiles";
import { getCurrentProfile } from "@/lib/data/session";

export const metadata: Metadata = { title: "Novo cliente" };

export default async function NovoClientePage() {
  const [vendedores, currentProfile] = await Promise.all([
    getProfileOptions(),
    getCurrentProfile(),
  ]);

  return (
    <>
      <PageHeader title="Novo cliente" subtitle="Cadastre um novo cliente" />
      <div className="mx-auto max-w-3xl">
        <ClienteForm mode="create" vendedores={vendedores} currentProfile={currentProfile} />
      </div>
    </>
  );
}
