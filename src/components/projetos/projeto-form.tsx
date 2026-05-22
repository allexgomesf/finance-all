"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CircleAlertIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createProjeto,
  updateProjeto,
  type ProjetoFormState,
} from "@/lib/actions/projetos";
import type { ProjetoListItem } from "@/lib/data/projetos";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Field, FieldGrid } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";

type Mode = "create" | "edit" | "view";
type Option = { id: string; nome: string };

const inputClass = "h-11";
const STATUS = ["Pendente", "Pré-aprovado", "Reprovado"] as const;

function numberValue(value?: number | null): string {
  return value === null || value === undefined ? "" : String(value);
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="mb-5">
        <h2 className="font-heading text-sm font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </Card>
  );
}

export function ProjetoForm({
  mode,
  projeto,
  clientes,
  profiles,
}: {
  mode: Mode;
  projeto?: ProjetoListItem;
  clientes: Option[];
  profiles: Option[];
}) {
  const readOnly = mode === "view";
  const [state, formAction] = useActionState<ProjetoFormState, FormData>(
    mode === "create" ? createProjeto : updateProjeto,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={readOnly ? undefined : formAction} className="space-y-5">
      <Link
        href="/dashboard/projetos"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Voltar para projetos
      </Link>

      {projeto && <input type="hidden" name="id" value={projeto.id} />}

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          <CircleAlertIcon className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <Section
        title="Dados do projeto"
        description="Cliente, equipe e estágio no funil."
      >
        <FieldGrid columns={2}>
          <Field
            label="Cliente"
            htmlFor="cliente_id"
            required={!readOnly}
            className="sm:col-span-2"
          >
            <NativeSelect
              id="cliente_id"
              name="cliente_id"
              defaultValue={projeto?.cliente_id ?? ""}
              disabled={readOnly}
              required={!readOnly}
            >
              <option value="">Selecione o cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Vendedor" htmlFor="vendedor_id">
            <NativeSelect
              id="vendedor_id"
              name="vendedor_id"
              defaultValue={projeto?.vendedor_id ?? ""}
              disabled={readOnly}
            >
              <option value="">Sem vendedor</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.nome}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Responsável" htmlFor="responsavel_id">
            <NativeSelect
              id="responsavel_id"
              name="responsavel_id"
              defaultValue={projeto?.responsavel_id ?? ""}
              disabled={readOnly}
            >
              <option value="">Sem responsável</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.nome}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field
            label="Estágio"
            htmlFor="estagio_projeto"
            hint="Ex.: Consultas, Orçamento, Pré-análise de crédito."
          >
            <Input
              id="estagio_projeto"
              name="estagio_projeto"
              defaultValue={projeto?.estagio_projeto ?? ""}
              placeholder="Estágio do projeto"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
          <Field label="Status" htmlFor="status_projeto">
            <NativeSelect
              id="status_projeto"
              name="status_projeto"
              defaultValue={projeto?.status_projeto ?? ""}
              disabled={readOnly}
            >
              <option value="">Sem status</option>
              {STATUS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </FieldGrid>
      </Section>

      <Section title="Valores" description="Estimativas financeiras do projeto.">
        <FieldGrid columns={3}>
          <Field label="Valor previsto (R$)" htmlFor="valor_previsto">
            <Input
              id="valor_previsto"
              name="valor_previsto"
              type="number"
              step="0.01"
              min="0"
              defaultValue={numberValue(projeto?.valor_previsto)}
              placeholder="0,00"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
          <Field label="Potência (kWp)" htmlFor="valor_kwp">
            <Input
              id="valor_kwp"
              name="valor_kwp"
              type="number"
              step="0.01"
              min="0"
              defaultValue={numberValue(projeto?.valor_kwp)}
              placeholder="0,00"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
          <Field label="Conta de luz (R$)" htmlFor="valor_conta_de_luz">
            <Input
              id="valor_conta_de_luz"
              name="valor_conta_de_luz"
              type="number"
              step="0.01"
              min="0"
              defaultValue={numberValue(projeto?.valor_conta_de_luz)}
              placeholder="0,00"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
        </FieldGrid>
      </Section>

      <div className="flex justify-end gap-3">
        {readOnly ? (
          <>
            <Link
              href="/dashboard/projetos"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Voltar
            </Link>
            {projeto && (
              <Link
                href={`/dashboard/projetos/${projeto.id}/editar`}
                className={buttonVariants({ size: "lg" })}
              >
                <PencilIcon />
                Editar projeto
              </Link>
            )}
          </>
        ) : (
          <>
            <Link
              href="/dashboard/projetos"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Cancelar
            </Link>
            <SubmitButton size="lg" pendingLabel="Salvando…">
              {mode === "create" ? "Cadastrar projeto" : "Salvar alterações"}
            </SubmitButton>
          </>
        )}
      </div>
    </form>
  );
}
