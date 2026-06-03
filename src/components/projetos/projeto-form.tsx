"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CircleAlertIcon, PencilIcon } from "lucide-react";
import { ClienteInfoDialog } from "@/components/projetos/cliente-info-dialog";
import { toast } from "sonner";

import {
  createProjeto,
  updateProjeto,
  type ProjetoFormState,
} from "@/lib/actions/projetos";
import type { ProjetoListItem } from "@/lib/data/projetos";
import { ESTAGIOS_PROJETO } from "@/components/projetos/estagio-selector";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Field, FieldGrid } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";

type Mode = "create" | "edit" | "view";
type Option = { id: string; nome: string };
type CurrentProfile = { id: string; nome_completo: string | null; cargo: string | null } | null;

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

function LockedInput({ value }: { value: string }) {
  return (
    <Input value={value} className={inputClass} disabled readOnly />
  );
}

export function ProjetoForm({
  mode,
  projeto,
  clientes,
  profiles,
  currentProfile,
}: {
  mode: Mode;
  projeto?: ProjetoListItem;
  clientes: Option[];
  profiles: Option[];
  currentProfile?: CurrentProfile;
}) {
  const readOnly = mode === "view";
  const isVendedor = currentProfile?.cargo === "Vendedor";

  const [state, formAction] = useActionState<ProjetoFormState, FormData>(
    mode === "create" ? createProjeto : updateProjeto,
    {},
  );

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  // Resolve display names for view mode
  const clienteNome =
    clientes.find((c) => c.id === projeto?.cliente_id)?.nome ?? "—";
  const vendedorNome =
    profiles.find((p) => p.id === projeto?.vendedor_id)?.nome ?? "Sem vendedor";
  const responsavelNome =
    profiles.find((p) => p.id === projeto?.responsavel_id)?.nome ?? "Sem responsável";

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
          {/* Cliente */}
          <Field
            label="Cliente"
            htmlFor="cliente_id"
            required={!readOnly}
            className="sm:col-span-2"
          >
            {readOnly ? (
              projeto?.cliente ? (
                <ClienteInfoDialog
                  cliente={projeto.cliente}
                  displayName={clienteNome}
                />
              ) : (
                <LockedInput value={clienteNome} />
              )
            ) : (
              <SearchableSelect
                name="cliente_id"
                options={clientes}
                defaultValue={projeto?.cliente_id ?? ""}
                required
                placeholder="Selecione o cliente"
                emptyLabel=""
                searchPlaceholder="Pesquisar cliente…"
              />
            )}
          </Field>

          {/* Vendedor */}
          <Field label="Vendedor" htmlFor="vendedor_id">
            {readOnly ? (
              <LockedInput value={vendedorNome} />
            ) : isVendedor ? (
              <>
                <input type="hidden" name="vendedor_id" value={currentProfile!.id} />
                <LockedInput value={currentProfile!.nome_completo ?? ""} />
              </>
            ) : (
              <SearchableSelect
                name="vendedor_id"
                options={profiles}
                defaultValue={projeto?.vendedor_id ?? ""}
                emptyLabel="Sem vendedor"
                placeholder="Selecione o vendedor…"
                searchPlaceholder="Pesquisar vendedor…"
              />
            )}
          </Field>

          {/* Responsável */}
          <Field label="Responsável" htmlFor="responsavel_id">
            {readOnly ? (
              <LockedInput value={responsavelNome} />
            ) : isVendedor ? (
              <>
                <input type="hidden" name="responsavel_id" value={currentProfile!.id} />
                <LockedInput value={currentProfile!.nome_completo ?? ""} />
              </>
            ) : (
              <SearchableSelect
                name="responsavel_id"
                options={profiles}
                defaultValue={projeto?.responsavel_id ?? ""}
                emptyLabel="Sem responsável"
                placeholder="Selecione o responsável…"
                searchPlaceholder="Pesquisar responsável…"
              />
            )}
          </Field>

          {/* Estágio */}
          <Field label="Estágio" htmlFor="estagio_projeto">
            {isVendedor && !readOnly ? (
              <>
                <input type="hidden" name="estagio_projeto" value={projeto?.estagio_projeto ?? ""} />
                <LockedInput value={projeto?.estagio_projeto ?? "Nenhum"} />
              </>
            ) : (
              <NativeSelect
                id="estagio_projeto"
                name="estagio_projeto"
                defaultValue={projeto?.estagio_projeto ?? ""}
                disabled={readOnly}
              >
                <option value="">Selecione o estágio</option>
                {ESTAGIOS_PROJETO.map((estagio) => (
                  <option key={estagio} value={estagio}>
                    {estagio}
                  </option>
                ))}
              </NativeSelect>
            )}
          </Field>

          {/* Status */}
          <Field label="Status" htmlFor="status_projeto">
            {isVendedor && !readOnly ? (
              <>
                <input type="hidden" name="status_projeto" value={projeto?.status_projeto ?? ""} />
                <LockedInput value={projeto?.status_projeto ?? "Sem status"} />
              </>
            ) : (
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
            )}
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
