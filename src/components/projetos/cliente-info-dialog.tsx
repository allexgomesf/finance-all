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

export function ClienteInfoDialog({
  cliente,
  displayName,
}: {
  cliente: ClienteInfo;
  displayName: string;
}) {
  const localidade = [cliente.cidade, cliente.estado].filter(Boolean).join(" / ");

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Dados do cliente</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          <InfoRow
            label={cliente.is_empresa ? "Razão social" : "Nome"}
            value={cliente.is_empresa ? cliente.razao_social : cliente.nome}
          />
          {cliente.is_empresa && cliente.nome && (
            <InfoRow label="Nome fantasia" value={cliente.nome} />
          )}
          <InfoRow label="E-mail" value={cliente.email} />
          <InfoRow label="Telefone" value={cliente.telefone} />
          {cliente.is_empresa && <InfoRow label="CNPJ" value={cliente.cnpj} />}
          <InfoRow label="CPF" value={cliente.cpf} />
          {localidade && <InfoRow label="Cidade / Estado" value={localidade} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
