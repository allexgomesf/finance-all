"use client";

import { BriefcaseIcon, EyeIcon, PencilIcon } from "lucide-react";

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
import {
  thClass,
  tdClass,
  iconAction,
  iconActionView,
  iconActionEdit,
} from "@/components/shared/table-styles";
import { UsuarioDialog } from "@/components/usuarios/usuario-dialog";
import type { ProfileWithEmail } from "@/lib/data/profiles";
import { formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";

export function VendedoresTable({
  vendedores,
}: {
  vendedores: ProfileWithEmail[];
}) {
  return (
    <DataList
      items={vendedores}
      pageSize={8}
      searchPlaceholder="Pesquisar vendedores"
      searchableText={(v) =>
        `${v.nome_completo ?? ""} ${v.email ?? ""} ${v.telefone ?? ""}`
      }
      emptyState={
        <EmptyState
          icon={BriefcaseIcon}
          title="Nenhum vendedor cadastrado"
          description="Usuários com o cargo Vendedor aparecem aqui automaticamente."
        />
      }
      renderTable={(items) => (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={thClass}>Nome</TableHead>
              <TableHead className={thClass}>E-mail</TableHead>
              <TableHead className={thClass}>Telefone</TableHead>
              <TableHead className={cn(thClass, "text-right")}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((vendedor) => (
              <TableRow key={vendedor.id}>
                <TableCell className={cn(tdClass, "font-medium text-foreground")}>
                  {vendedor.nome_completo || "—"}
                </TableCell>
                <TableCell className={cn(tdClass, "text-muted-foreground")}>
                  {vendedor.email || "—"}
                </TableCell>
                <TableCell
                  className={cn(tdClass, "tabular-nums text-muted-foreground")}
                >
                  {vendedor.telefone ? formatPhone(vendedor.telefone) : "—"}
                </TableCell>
                <TableCell className={tdClass}>
                  <div className="flex items-center justify-end gap-1.5">
                    <UsuarioDialog
                      mode="view"
                      usuario={vendedor}
                      trigger={
                        <button
                          type="button"
                          title="Visualizar"
                          aria-label="Visualizar"
                          className={cn(iconAction, iconActionView)}
                        >
                          <EyeIcon className="size-4" />
                        </button>
                      }
                    />
                    <UsuarioDialog
                      mode="edit"
                      usuario={vendedor}
                      trigger={
                        <button
                          type="button"
                          title="Editar"
                          aria-label="Editar"
                          className={cn(iconAction, iconActionEdit)}
                        >
                          <PencilIcon className="size-4" />
                        </button>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    />
  );
}
