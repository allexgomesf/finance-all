"use client";

import Link from "next/link";
import { PlusIcon, UsersRoundIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataList } from "@/components/shared/data-list";
import { EmptyState } from "@/components/shared/empty-state";
import { RowActions } from "@/components/shared/row-actions";
import { thClass, tdClass } from "@/components/shared/table-styles";
import { deleteCliente } from "@/lib/actions/clientes";
import type { Cliente } from "@/lib/data/clientes";
import { clienteNome } from "@/lib/display";
import { formatCNPJ, formatCPF, formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ClientesTable({ clientes }: { clientes: Cliente[] }) {
  const addButton = (
    <Link
      href="/dashboard/clientes/novo"
      className={cn(buttonVariants({ size: "lg" }), "h-10")}
    >
      <PlusIcon />
      Adicionar cliente
    </Link>
  );

  return (
    <DataList
      items={clientes}
      pageSize={8}
      searchPlaceholder="Pesquisar clientes"
      searchableText={(c) =>
        `${clienteNome(c)} ${c.email ?? ""} ${c.cpf ?? ""} ${c.cnpj ?? ""} ${
          c.telefone ?? ""
        }`
      }
      toolbar={addButton}
      emptyState={
        <EmptyState
          icon={UsersRoundIcon}
          title="Nenhum cliente cadastrado"
          description="Cadastre seu primeiro cliente para começar a criar projetos."
          action={addButton}
        />
      }
      renderTable={(items) => (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={thClass}>Nome</TableHead>
              <TableHead className={thClass}>E-mail</TableHead>
              <TableHead className={thClass}>Telefone</TableHead>
              <TableHead className={thClass}>CPF / CNPJ</TableHead>
              <TableHead className={cn(thClass, "text-right")}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell className={cn(tdClass, "font-medium text-foreground")}>
                  {clienteNome(cliente)}
                </TableCell>
                <TableCell className={cn(tdClass, "text-muted-foreground")}>
                  {cliente.email || "—"}
                </TableCell>
                <TableCell
                  className={cn(tdClass, "tabular-nums text-muted-foreground")}
                >
                  {cliente.telefone ? formatPhone(cliente.telefone) : "—"}
                </TableCell>
                <TableCell
                  className={cn(tdClass, "tabular-nums text-muted-foreground")}
                >
                  {cliente.is_empresa
                    ? formatCNPJ(cliente.cnpj)
                    : formatCPF(cliente.cpf)}
                </TableCell>
                <TableCell className={tdClass}>
                  <RowActions
                    viewHref={`/dashboard/clientes/${cliente.id}`}
                    editHref={`/dashboard/clientes/${cliente.id}/editar`}
                    onDelete={() => deleteCliente(cliente.id)}
                    confirmTitle="Excluir cliente"
                    confirmDescription={`O cliente ${clienteNome(
                      cliente,
                    )} será removido permanentemente.`}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    />
  );
}
