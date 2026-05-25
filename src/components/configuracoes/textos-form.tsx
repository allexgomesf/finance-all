"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { upsertPageText, type PageTextState } from "@/lib/actions/page-texts";
import type { PageTextsMap } from "@/lib/data/page-texts";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";

const PAGES = [
  {
    key: "login",
    label: "Login",
    description: "Painel lateral decorativo da página de entrada",
    defaultTitle: "Suas finanças, sob controle.",
    defaultSubtitle: "Gerencie projetos, clientes e receitas em um só lugar.",
  },
  {
    key: "inicio",
    label: "Início",
    description: "/dashboard",
    defaultTitle: "Início",
    defaultSubtitle: "Dados gerais",
  },
  {
    key: "empresa",
    label: "Empresa",
    description: "/dashboard/empresa",
    defaultTitle: "Empresa",
    defaultSubtitle: "Gerencie os dados da sua empresa",
  },
  {
    key: "clientes",
    label: "Clientes",
    description: "/dashboard/clientes",
    defaultTitle: "Clientes",
    defaultSubtitle: "Gerencie os clientes cadastrados na sua empresa",
  },
  {
    key: "projetos",
    label: "Projetos",
    description: "/dashboard/projetos",
    defaultTitle: "Projetos",
    defaultSubtitle: "Gerencie os projetos cadastrados na sua empresa",
  },
  {
    key: "vendedores",
    label: "Vendedores",
    description: "/dashboard/vendedores",
    defaultTitle: "Vendedores",
    defaultSubtitle: "Equipe de vendas da sua empresa",
  },
  {
    key: "usuarios",
    label: "Usuários",
    description: "/dashboard/usuarios",
    defaultTitle: "Usuários",
    defaultSubtitle: "Gerencie os usuários cadastrados na sua empresa",
  },
  {
    key: "perfil",
    label: "Perfil",
    description: "/dashboard/perfil",
    defaultTitle: "Editar perfil",
    defaultSubtitle: "Atualize seus dados pessoais",
  },
  {
    key: "senha",
    label: "Alterar senha",
    description: "/dashboard/senha",
    defaultTitle: "Alterar senha",
    defaultSubtitle: "Defina uma nova senha de acesso",
  },
] as const;

function PageSection({
  pageKey,
  label,
  description,
  defaultTitle,
  defaultSubtitle,
  current,
}: {
  pageKey: string;
  label: string;
  description: string;
  defaultTitle: string;
  defaultSubtitle: string;
  current: { title: string | null; subtitle: string | null } | undefined;
}) {
  const [state, formAction] = useActionState<PageTextState, FormData>(upsertPageText, {});

  useEffect(() => {
    if (state.ok) toast.success(`Textos de "${label}" salvos.`);
    else if (state.error) toast.error(state.error);
  }, [state, label]);

  return (
    <Card className="p-5">
      <div className="mb-4">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="page_key" value={pageKey} />
        <Field label="Título" htmlFor={`title-${pageKey}`}>
          <Input
            id={`title-${pageKey}`}
            name="title"
            defaultValue={current?.title ?? ""}
            placeholder={defaultTitle}
            className="h-10"
          />
        </Field>
        <Field label="Subtítulo" htmlFor={`subtitle-${pageKey}`}>
          <Input
            id={`subtitle-${pageKey}`}
            name="subtitle"
            defaultValue={current?.subtitle ?? ""}
            placeholder={defaultSubtitle || "Opcional"}
            className="h-10"
          />
        </Field>
        <div className="flex justify-end">
          <SubmitButton size="sm" pendingLabel="Salvando…">
            Salvar
          </SubmitButton>
        </div>
      </form>
    </Card>
  );
}

export function TextosForm({ pageTexts }: { pageTexts: PageTextsMap }) {
  return (
    <div className="space-y-4">
      {PAGES.map((page) => (
        <PageSection
          key={page.key}
          pageKey={page.key}
          label={page.label}
          description={page.description}
          defaultTitle={page.defaultTitle}
          defaultSubtitle={page.defaultSubtitle}
          current={pageTexts[page.key]}
        />
      ))}
    </div>
  );
}
