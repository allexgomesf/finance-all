import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ProjetoForm } from "@/components/projetos/projeto-form";
import { EstagioSelector } from "@/components/projetos/estagio-selector";
import { AnexosSection } from "@/components/projetos/anexos-section";
import { ObservacoesSection } from "@/components/projetos/observacoes-section";
import { getProjetoById, getObservacoesByProjetoId, getSignedAnexoUrls } from "@/lib/data/projetos";
import { getClienteOptions } from "@/lib/data/clientes";
import { getProfileOptions } from "@/lib/data/profiles";
import { getCurrentProfile } from "@/lib/data/session";
import { projetoClienteNome } from "@/lib/display";

export const metadata: Metadata = { title: "Projeto" };

export default async function ProjetoViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [projeto, clientes, profiles, observacoes, currentProfile] = await Promise.all([
    getProjetoById(id),
    getClienteOptions(),
    getProfileOptions(),
    getObservacoesByProjetoId(id),
    getCurrentProfile(),
  ]);
  if (!projeto) notFound();

  const signedAnexos = await getSignedAnexoUrls(projeto.anexos ?? []);

  return (
    <>
      <PageHeader
        title={`Projeto · ${projetoClienteNome(projeto)}`}
        subtitle="Detalhes do projeto"
      />
      <div className="mx-auto max-w-5xl space-y-5">
        <EstagioSelector projetoId={projeto.id} estagioAtual={projeto.estagio_projeto} />
        <ProjetoForm
          mode="view"
          projeto={projeto}
          clientes={clientes}
          profiles={profiles}
          currentProfile={currentProfile}
        />
        <AnexosSection projetoId={projeto.id} signedUrls={signedAnexos} />
        <ObservacoesSection projetoId={projeto.id} observacoes={observacoes} />
      </div>
    </>
  );
}
