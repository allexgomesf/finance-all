import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ProjetoForm } from "@/components/projetos/projeto-form";
import { getProjetoById } from "@/lib/data/projetos";
import { getClienteOptions } from "@/lib/data/clientes";
import { getProfileOptions } from "@/lib/data/profiles";
import { getCurrentProfile } from "@/lib/data/session";

export const metadata: Metadata = { title: "Editar projeto" };

export default async function EditarProjetoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [projeto, clientes, profiles, currentProfile] = await Promise.all([
    getProjetoById(id),
    getClienteOptions(),
    getProfileOptions(),
    getCurrentProfile(),
  ]);
  if (!projeto) notFound();

  return (
    <>
      <PageHeader
        title="Editar projeto"
        subtitle="Atualize os dados do projeto"
      />
      <div className="mx-auto max-w-3xl">
        <ProjetoForm
          mode="edit"
          projeto={projeto}
          clientes={clientes}
          profiles={profiles}
          currentProfile={currentProfile}
        />
      </div>
    </>
  );
}
