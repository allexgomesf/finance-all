"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CircleAlertIcon, PencilIcon } from "lucide-react";
import { toast } from "sonner";

import {
  createCliente,
  updateCliente,
  type ClienteFormState,
} from "@/lib/actions/clientes";
import type { Cliente } from "@/lib/data/clientes";
import {
  formatCPF,
  formatCNPJ,
  formatPhone,
  formatCEP,
  onlyDigits,
} from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { Field, FieldGrid } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { VendedorCombobox } from "@/components/clientes/vendedor-combobox";
import { cn } from "@/lib/utils";

type Mode = "create" | "edit" | "view";
type Option = { id: string; nome: string };
type CurrentProfile = { id: string; nome_completo: string | null; cargo: string | null } | null;

const inputClass = "h-11";

function dateValue(value?: string | null): string {
  return value ? value.slice(0, 10) : "";
}
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

export function ClienteForm({
  mode,
  cliente,
  vendedores,
  currentProfile,
}: {
  mode: Mode;
  cliente?: Cliente;
  vendedores: Option[];
  currentProfile?: CurrentProfile;
}) {
  const readOnly = mode === "view";
  const isVendedor = currentProfile?.cargo === "Vendedor";

  const [isEmpresa, setIsEmpresa] = useState(cliente?.is_empresa ?? false);
  const [state, formAction] = useActionState<ClienteFormState, FormData>(
    mode === "create" ? createCliente : updateCliente,
    {},
  );

  // Masked field states
  const [cpf, setCpf] = useState(() => formatCPF(cliente?.cpf ?? "").replace("—", ""));
  const [cnpj, setCnpj] = useState(() => formatCNPJ(cliente?.cnpj ?? "").replace("—", ""));
  const [telefone, setTelefone] = useState(() => formatPhone(cliente?.telefone ?? "").replace("—", ""));
  const [cep, setCep] = useState(() => formatCEP(cliente?.cep ?? ""));

  // Address fields (auto-filled from ViaCEP)
  const [logradouro, setLogradouro] = useState(cliente?.logradouro ?? "");
  const [bairro, setBairro] = useState(cliente?.bairro ?? "");
  const [cidade, setCidade] = useState(cliente?.cidade ?? "");
  const [estado, setEstado] = useState(cliente?.estado ?? "");

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state]);

  async function handleCepChange(value: string) {
    const masked = formatCEP(value);
    setCep(masked);
    const digits = onlyDigits(masked);
    if (digits.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
        if (res.ok) {
          const data = await res.json();
          if (!data.erro) {
            setLogradouro(data.logradouro ?? "");
            setBairro(data.bairro ?? "");
            setCidade(data.localidade ?? "");
            setEstado(data.uf ?? "");
          }
        }
      } catch {
        // ViaCEP indisponível — usuário preenche manualmente
      }
    }
  }

  // Resolve vendor name for view mode
  const vendedorNome =
    vendedores.find((v) => v.id === cliente?.vendedor_id)?.nome ?? "Sem vendedor";

  return (
    <form action={readOnly ? undefined : formAction} className="space-y-5">
      <Link
        href="/dashboard/clientes"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Voltar para clientes
      </Link>

      {cliente && <input type="hidden" name="id" value={cliente.id} />}
      <input
        type="hidden"
        name="is_empresa"
        value={isEmpresa ? "true" : "false"}
      />

      {state.error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
          <CircleAlertIcon className="size-4 shrink-0" />
          {state.error}
        </div>
      )}

      <Section
        title="Identificação"
        description="Tipo de cliente e dados cadastrais."
      >
        <div className="space-y-4">
          <div className="inline-flex rounded-lg bg-muted p-1">
            {[
              { value: false, label: "Pessoa Física" },
              { value: true, label: "Pessoa Jurídica" },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                disabled={readOnly}
                onClick={() => setIsEmpresa(option.value)}
                className={cn(
                  "cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed",
                  isEmpresa === option.value
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Pessoa Física */}
          <div className={cn(isEmpresa && "hidden")}>
            <FieldGrid columns={2}>
              <Field label="Nome completo" htmlFor="nome" className="sm:col-span-2">
                <Input
                  id="nome"
                  name="nome"
                  defaultValue={cliente?.nome ?? ""}
                  placeholder="Nome completo"
                  className={inputClass}
                  disabled={readOnly || isEmpresa}
                />
              </Field>
              <Field label="CPF" htmlFor="cpf">
                <Input
                  id="cpf"
                  name="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value).replace("—", ""))}
                  placeholder="000.000.000-00"
                  className={inputClass}
                  disabled={readOnly || isEmpresa}
                />
              </Field>
              <Field label="Data de nascimento" htmlFor="data_nascimento">
                <Input
                  id="data_nascimento"
                  name="data_nascimento"
                  type="date"
                  defaultValue={dateValue(cliente?.data_nascimento)}
                  className={inputClass}
                  disabled={readOnly || isEmpresa}
                />
              </Field>
              <Field label="RG" htmlFor="rg">
                <Input
                  id="rg"
                  name="rg"
                  defaultValue={cliente?.rg ?? ""}
                  placeholder="RG"
                  className={inputClass}
                  disabled={readOnly || isEmpresa}
                />
              </Field>
              <Field label="Órgão expedidor" htmlFor="orgao_expedidor">
                <Input
                  id="orgao_expedidor"
                  name="orgao_expedidor"
                  defaultValue={cliente?.orgao_expedidor ?? ""}
                  placeholder="SSP"
                  className={inputClass}
                  disabled={readOnly || isEmpresa}
                />
              </Field>
              <Field label="Nome da mãe" htmlFor="nome_mae">
                <Input
                  id="nome_mae"
                  name="nome_mae"
                  defaultValue={cliente?.nome_mae ?? ""}
                  placeholder="Nome da mãe"
                  className={inputClass}
                  disabled={readOnly || isEmpresa}
                />
              </Field>
              <Field label="Renda mensal (R$)" htmlFor="renda_mensal">
                <Input
                  id="renda_mensal"
                  name="renda_mensal"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={numberValue(cliente?.renda_mensal)}
                  placeholder="0,00"
                  className={inputClass}
                  disabled={readOnly || isEmpresa}
                />
              </Field>
            </FieldGrid>
          </div>

          {/* Pessoa Jurídica */}
          <div className={cn(!isEmpresa && "hidden")}>
            <FieldGrid columns={2}>
              <Field
                label="Razão social"
                htmlFor="razao_social"
                className="sm:col-span-2"
              >
                <Input
                  id="razao_social"
                  name="razao_social"
                  defaultValue={cliente?.razao_social ?? ""}
                  placeholder="Razão social"
                  className={inputClass}
                  disabled={readOnly || !isEmpresa}
                />
              </Field>
              <Field label="CNPJ" htmlFor="cnpj">
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value).replace("—", ""))}
                  placeholder="00.000.000/0000-00"
                  className={inputClass}
                  disabled={readOnly || !isEmpresa}
                />
              </Field>
              <Field
                label="Data de abertura"
                htmlFor="data_abertura_empresa"
              >
                <Input
                  id="data_abertura_empresa"
                  name="data_abertura_empresa"
                  type="date"
                  defaultValue={dateValue(cliente?.data_abertura_empresa)}
                  className={inputClass}
                  disabled={readOnly || !isEmpresa}
                />
              </Field>
              <Field
                label="Faturamento mensal (R$)"
                htmlFor="faturamento_empresa"
                className="sm:col-span-2"
              >
                <Input
                  id="faturamento_empresa"
                  name="faturamento_empresa"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={numberValue(cliente?.faturamento_empresa)}
                  placeholder="0,00"
                  className={inputClass}
                  disabled={readOnly || !isEmpresa}
                />
              </Field>
            </FieldGrid>
          </div>
        </div>
      </Section>

      <Section title="Contato">
        <FieldGrid columns={2}>
          <Field label="E-mail" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={cliente?.email ?? ""}
              placeholder="email@exemplo.com"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
          <Field label="Telefone" htmlFor="telefone">
            <Input
              id="telefone"
              name="telefone"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value).replace("—", ""))}
              placeholder="(00) 00000-0000"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
        </FieldGrid>
      </Section>

      <Section title="Endereço">
        <FieldGrid columns={3}>
          <Field label="CEP" htmlFor="cep">
            <Input
              id="cep"
              name="cep"
              value={cep}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
          <Field
            label="Logradouro"
            htmlFor="logradouro"
            className="sm:col-span-1 lg:col-span-2"
          >
            <Input
              id="logradouro"
              name="logradouro"
              value={logradouro}
              onChange={(e) => setLogradouro(e.target.value)}
              placeholder="Rua / Avenida"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
          <Field label="Número" htmlFor="numero_end">
            <Input
              id="numero_end"
              name="numero_end"
              defaultValue={cliente?.numero_end ?? ""}
              placeholder="Número"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
          <Field label="Complemento" htmlFor="complemento">
            <Input
              id="complemento"
              name="complemento"
              defaultValue={cliente?.complemento ?? ""}
              placeholder="Complemento"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
          <Field label="Bairro" htmlFor="bairro">
            <Input
              id="bairro"
              name="bairro"
              value={bairro}
              onChange={(e) => setBairro(e.target.value)}
              placeholder="Bairro"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
          <Field label="Cidade" htmlFor="cidade">
            <Input
              id="cidade"
              name="cidade"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              placeholder="Cidade"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
          <Field label="Estado" htmlFor="estado">
            <Input
              id="estado"
              name="estado"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              placeholder="UF"
              className={inputClass}
              disabled={readOnly}
            />
          </Field>
        </FieldGrid>
      </Section>

      <Section title="Atendimento">
        <Field label="Vendedor responsável" htmlFor="vendedor_id">
          {readOnly ? (
            <Input
              id="vendedor_id"
              value={vendedorNome}
              className={inputClass}
              disabled
            />
          ) : isVendedor ? (
            <>
              <input type="hidden" name="vendedor_id" value={currentProfile!.id} />
              <Input
                id="vendedor_id"
                value={currentProfile!.nome_completo ?? ""}
                className={inputClass}
                disabled
              />
            </>
          ) : (
            <VendedorCombobox
              vendedores={vendedores}
              defaultValue={cliente?.vendedor_id ?? ""}
            />
          )}
        </Field>
      </Section>

      <div className="flex justify-end gap-3">
        {readOnly ? (
          <>
            <Link
              href="/dashboard/clientes"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Voltar
            </Link>
            {cliente && (
              <Link
                href={`/dashboard/clientes/${cliente.id}/editar`}
                className={buttonVariants({ size: "lg" })}
              >
                <PencilIcon />
                Editar cliente
              </Link>
            )}
          </>
        ) : (
          <>
            <Link
              href="/dashboard/clientes"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Cancelar
            </Link>
            <SubmitButton size="lg" pendingLabel="Salvando…">
              {mode === "create" ? "Cadastrar cliente" : "Salvar alterações"}
            </SubmitButton>
          </>
        )}
      </div>
    </form>
  );
}
