import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ClienteForm } from "@/components/clientes/cliente-form";
import { getClienteById } from "@/lib/data/clientes";
import { getProfileOptions } from "@/lib/data/profiles";

export const metadata: Metadata = { title: "Editar cliente" };

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cliente, vendedores] = await Promise.all([
    getClienteById(id),
    getProfileOptions(),
  ]);
  if (!cliente) notFound();

  return (
    <>
      <PageHeader
        title="Editar cliente"
        subtitle="Atualize os dados do cliente"
      />
      <div className="mx-auto max-w-3xl">
        <ClienteForm mode="edit" cliente={cliente} vendedores={vendedores} />
      </div>
    </>
  );
}
