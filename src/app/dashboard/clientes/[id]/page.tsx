import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { getClienteById } from "@/lib/data/clientes";
import { getProfileOptions } from "@/lib/data/profiles";
import { getCurrentProfile } from "@/lib/data/session";
import { clienteNome } from "@/lib/display";

export const metadata: Metadata = { title: "Cliente" };

export default async function ClienteViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cliente, vendedores, currentProfile] = await Promise.all([
    getClienteById(id),
    getProfileOptions(),
    getCurrentProfile(),
  ]);
  if (!cliente) notFound();

  return (
    <>
      <PageHeader title={clienteNome(cliente)} subtitle="Detalhes do cliente" />
      <div className="mx-auto max-w-3xl">
        <ClienteForm mode="view" cliente={cliente} vendedores={vendedores} currentProfile={currentProfile} />
      </div>
    </>
  );
}
