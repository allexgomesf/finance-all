"use client";

import Link from "next/link";
import { PlusIcon, PresentationIcon } from "lucide-react";

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
import { StageBadge, StatusBadge } from "@/components/shared/status-badge";
import { thClass, tdClass } from "@/components/shared/table-styles";
import { deleteProjeto } from "@/lib/actions/projetos";
import type { ProjetoListItem } from "@/lib/data/projetos";
import { projetoClienteNome } from "@/lib/display";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProjetosTable({ projetos }: { projetos: ProjetoListItem[] }) {
  const addButton = (
    <Link
      href="/dashboard/projetos/novo"
      className={cn(buttonVariants({ size: "lg" }), "h-10")}
    >
      <PlusIcon />
      Adicionar projeto
    </Link>
  );

  return (
    <DataList
      items={projetos}
      pageSize={8}
      searchPlaceholder="Pesquisar projeto"
      searchableText={(p) =>
        `${projetoClienteNome(p)} ${p.vendedor?.nome_completo ?? ""} ${
          p.responsavel?.nome_completo ?? ""
        } ${p.estagio_projeto ?? ""} ${p.status_projeto ?? ""}`
      }
      toolbar={addButton}
      emptyState={
        <EmptyState
          icon={PresentationIcon}
          title="Nenhum projeto cadastrado"
          description="Cadastre um projeto para acompanhar o funil de vendas."
          action={addButton}
        />
      }
      renderTable={(items) => (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={thClass}>Criado em</TableHead>
              <TableHead className={thClass}>Cliente</TableHead>
              <TableHead className={thClass}>Vendedor</TableHead>
              <TableHead className={thClass}>Responsável</TableHead>
              <TableHead className={cn(thClass, "text-right")}>
                Valor previsto
              </TableHead>
              <TableHead className={thClass}>Estágio</TableHead>
              <TableHead className={thClass}>Status</TableHead>
              <TableHead className={cn(thClass, "text-right")}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((projeto) => (
              <TableRow key={projeto.id}>
                <TableCell
                  className={cn(tdClass, "tabular-nums text-muted-foreground")}
                >
                  {formatDate(projeto.created_at)}
                </TableCell>
                <TableCell className={cn(tdClass, "font-medium text-foreground")}>
                  {projetoClienteNome(projeto)}
                </TableCell>
                <TableCell className={cn(tdClass, "text-muted-foreground")}>
                  {projeto.vendedor?.nome_completo || "—"}
                </TableCell>
                <TableCell className={cn(tdClass, "text-muted-foreground")}>
                  {projeto.responsavel?.nome_completo || "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    tdClass,
                    "text-right font-medium tabular-nums text-foreground",
                  )}
                >
                  {formatCurrency(projeto.valor_previsto)}
                </TableCell>
                <TableCell className={tdClass}>
                  <StageBadge stage={projeto.estagio_projeto} />
                </TableCell>
                <TableCell className={tdClass}>
                  <StatusBadge status={projeto.status_projeto} />
                </TableCell>
                <TableCell className={tdClass}>
                  <RowActions
                    viewHref={`/dashboard/projetos/${projeto.id}`}
                    editHref={`/dashboard/projetos/${projeto.id}/editar`}
                    onDelete={() => deleteProjeto(projeto.id)}
                    confirmTitle="Excluir projeto"
                    confirmDescription="O projeto será removido permanentemente."
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
