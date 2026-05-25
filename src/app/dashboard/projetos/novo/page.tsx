import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { ProjetoForm } from "@/components/projetos/projeto-form";
import { getClienteOptions } from "@/lib/data/clientes";
import { getProfileOptions } from "@/lib/data/profiles";

export const metadata: Metadata = { title: "Novo projeto" };

export default async function NovoProjetoPage() {
  const [clientes, profiles] = await Promise.all([
    getClienteOptions(),
    getProfileOptions(),
  ]);

  return (
    <>
      <PageHeader title="Novo projeto" subtitle="Cadastre um novo projeto" />
      <div className="mx-auto max-w-3xl">
        <ProjetoForm mode="create" clientes={clientes} profiles={profiles} />
      </div>
    </>
  );
}
