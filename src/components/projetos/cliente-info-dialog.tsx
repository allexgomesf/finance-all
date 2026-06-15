"use client";

import { UserIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ClienteInfo = {
  id: string;
  nome: string | null;
  razao_social: string | null;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  cnpj: string | null;
  rg: string | null;
  orgao_expedidor: string | null;
  nome_mae: string | null;
  data_nascimento: string | null;
  data_abertura_empresa: string | null;
  socio_nome: string | null;
  socio_data_nascimento: string | null;
  socio_nome_mae: string | null;
  renda_mensal: number | null;
  faturamento_empresa: number | null;
  cep: string | null;
  logradouro: string | null;
  numero_end: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  is_empresa: boolean | null;
};

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <Input value={value} className="h-9" disabled readOnly />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
      {children}
    </p>
  );
}

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCPF(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = value.replace(/\D/g, "");
  if (d.length !== 11) return value;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatCNPJ(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = value.replace(/\D/g, "");
  if (d.length !== 14) return value;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

function formatPhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = value.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return value;
}

function formatCEP(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = value.replace(/\D/g, "");
  if (d.length === 8) return `${d.slice(0, 5)}-${d.slice(5)}`;
  return value;
}

export function ClienteInfoDialog({
  cliente,
  displayName,
}: {
  cliente: ClienteInfo;
  displayName: string;
}) {
  const isPJ = !!cliente.is_empresa;

  const enderecoPartes = [
    cliente.logradouro,
    cliente.numero_end ? `nº ${cliente.numero_end}` : null,
    cliente.complemento,
    cliente.bairro,
  ].filter(Boolean);

  const hasEndereco =
    cliente.cep || cliente.logradouro || cliente.cidade || cliente.estado;

  return (
    <Dialog>
      <DialogTrigger
        render={
          <button
            type="button"
            className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-md border border-input bg-muted/50 px-3 text-sm text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        }
      >
        <UserIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-left">{displayName}</span>
        <span className="shrink-0 text-xs text-muted-foreground">Ver dados</span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dados do cliente</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Identificação */}
          <SectionTitle>Identificação</SectionTitle>

          {isPJ ? (
            <>
              <InfoRow label="Razão social" value={cliente.razao_social} />
              {cliente.nome && <InfoRow label="Nome fantasia" value={cliente.nome} />}
              <InfoRow label="CNPJ" value={formatCNPJ(cliente.cnpj)} />
              <InfoRow label="CPF do responsável" value={formatCPF(cliente.cpf)} />
              <InfoRow label="Data de abertura" value={formatDate(cliente.data_abertura_empresa)} />
              <InfoRow label="Faturamento mensal" value={formatCurrency(cliente.faturamento_empresa)} />

              {(cliente.socio_nome ||
                cliente.socio_data_nascimento ||
                cliente.socio_nome_mae) && (
                <>
                  <SectionTitle>Sócio</SectionTitle>
                  <InfoRow label="Nome do sócio" value={cliente.socio_nome} />
                  <InfoRow
                    label="Data de nascimento"
                    value={formatDate(cliente.socio_data_nascimento)}
                  />
                  <InfoRow label="Nome da mãe" value={cliente.socio_nome_mae} />
                </>
              )}
            </>
          ) : (
            <>
              <InfoRow label="Nome" value={cliente.nome} />
              <InfoRow label="CPF" value={formatCPF(cliente.cpf)} />
              <InfoRow label="Data de nascimento" value={formatDate(cliente.data_nascimento)} />
              <InfoRow label="RG" value={cliente.rg} />
              <InfoRow label="Órgão expedidor" value={cliente.orgao_expedidor} />
              <InfoRow label="Nome da mãe" value={cliente.nome_mae} />
              <InfoRow label="Renda mensal" value={formatCurrency(cliente.renda_mensal)} />
            </>
          )}

          {/* Contato */}
          {(cliente.email || cliente.telefone) && (
            <>
              <SectionTitle>Contato</SectionTitle>
              <InfoRow label="E-mail" value={cliente.email} />
              <InfoRow label="Telefone" value={formatPhone(cliente.telefone)} />
            </>
          )}

          {/* Endereço */}
          {hasEndereco && (
            <>
              <SectionTitle>Endereço</SectionTitle>
              <InfoRow label="CEP" value={formatCEP(cliente.cep)} />
              {enderecoPartes.length > 0 && (
                <InfoRow label="Logradouro" value={enderecoPartes.join(", ")} />
              )}
              <InfoRow label="Bairro" value={cliente.bairro} />
              <InfoRow
                label="Cidade / Estado"
                value={[cliente.cidade, cliente.estado].filter(Boolean).join(" / ") || null}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
