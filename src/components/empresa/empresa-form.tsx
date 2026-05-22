"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { updateEmpresa } from "@/lib/actions/empresa";
import type { Empresa } from "@/lib/data/empresa";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGrid } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "basicos", label: "Dados Básicos" },
  { id: "endereco", label: "Endereço" },
  { id: "bancarios", label: "Dados Bancários" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const inputClass = "h-11";

function bancoToText(banco: Empresa["banco"]): string {
  if (typeof banco === "string") return banco;
  if (banco && typeof banco === "object" && !Array.isArray(banco)) {
    const nome = (banco as Record<string, unknown>).nome;
    if (typeof nome === "string") return nome;
  }
  return "";
}

export function EmpresaForm({ empresa }: { empresa: Empresa | null }) {
  const [tab, setTab] = useState<TabId>("basicos");
  const [state, formAction] = useActionState(updateEmpresa, {});

  useEffect(() => {
    if (state.ok) toast.success("Dados da empresa salvos com sucesso.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={cn(
              "cursor-pointer rounded-full px-5 py-2.5 text-sm font-medium transition-all",
              tab === item.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-card text-muted-foreground ring-1 ring-foreground/10 hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card className="p-6">
        {/* Dados Básicos */}
        <div className={cn("space-y-4", tab !== "basicos" && "hidden")}>
          <Field label="Razão Social" htmlFor="razao_social">
            <Input
              id="razao_social"
              name="razao_social"
              defaultValue={empresa?.razao_social ?? ""}
              placeholder="Razão Social"
              className={inputClass}
            />
          </Field>
          <Field label="Nome Fantasia" htmlFor="nome">
            <Input
              id="nome"
              name="nome"
              defaultValue={empresa?.nome ?? ""}
              placeholder="Nome Fantasia"
              className={inputClass}
            />
          </Field>
          <Field label="CNPJ" htmlFor="cnpj">
            <Input
              id="cnpj"
              name="cnpj"
              defaultValue={empresa?.cnpj ?? ""}
              placeholder="00.000.000/0000-00"
              className={inputClass}
            />
          </Field>
        </div>

        {/* Endereço */}
        <div className={cn(tab !== "endereco" && "hidden")}>
          <FieldGrid columns={2}>
            <Field label="CEP" htmlFor="cep">
              <Input
                id="cep"
                name="cep"
                defaultValue={empresa?.cep ?? ""}
                placeholder="00000-000"
                className={inputClass}
              />
            </Field>
            <Field label="Estado" htmlFor="estado">
              <Input
                id="estado"
                name="estado"
                defaultValue={empresa?.estado ?? ""}
                placeholder="UF"
                className={inputClass}
              />
            </Field>
            <Field label="Cidade" htmlFor="cidade">
              <Input
                id="cidade"
                name="cidade"
                defaultValue={empresa?.cidade ?? ""}
                placeholder="Cidade"
                className={inputClass}
              />
            </Field>
            <Field label="Bairro" htmlFor="bairro">
              <Input
                id="bairro"
                name="bairro"
                defaultValue={empresa?.bairro ?? ""}
                placeholder="Bairro"
                className={inputClass}
              />
            </Field>
            <Field label="Número" htmlFor="end_numero">
              <Input
                id="end_numero"
                name="end_numero"
                defaultValue={empresa?.end_numero ?? ""}
                placeholder="Número"
                className={inputClass}
              />
            </Field>
            <Field label="Complemento" htmlFor="complemento">
              <Input
                id="complemento"
                name="complemento"
                defaultValue={empresa?.complemento ?? ""}
                placeholder="Complemento"
                className={inputClass}
              />
            </Field>
          </FieldGrid>
        </div>

        {/* Dados Bancários */}
        <div className={cn(tab !== "bancarios" && "hidden")}>
          <FieldGrid columns={2}>
            <Field label="Banco" htmlFor="banco" className="sm:col-span-2">
              <Input
                id="banco"
                name="banco"
                defaultValue={bancoToText(empresa?.banco ?? null)}
                placeholder="Nome do banco"
                className={inputClass}
              />
            </Field>
            <Field label="Agência" htmlFor="agencia_bancaria">
              <Input
                id="agencia_bancaria"
                name="agencia_bancaria"
                defaultValue={empresa?.agencia_bancaria ?? ""}
                placeholder="0000"
                className={inputClass}
              />
            </Field>
            <Field label="Conta" htmlFor="conta_bancaria">
              <Input
                id="conta_bancaria"
                name="conta_bancaria"
                defaultValue={empresa?.conta_bancaria ?? ""}
                placeholder="00000-0"
                className={inputClass}
              />
            </Field>
          </FieldGrid>
        </div>
      </Card>

      <div className="flex justify-end">
        <SubmitButton size="lg" pendingLabel="Salvando…">
          Salvar
        </SubmitButton>
      </div>
    </form>
  );
}
