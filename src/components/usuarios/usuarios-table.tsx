"use client";

import { PencilIcon, PlusIcon, Trash2Icon, UserCogIcon } from "lucide-react";

import { InviteLinkButton } from "@/components/invite/invite-link-button";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  thClass,
  tdClass,
  iconAction,
  iconActionEdit,
  iconActionDelete,
} from "@/components/shared/table-styles";
import { UsuarioDialog } from "@/components/usuarios/usuario-dialog";
import { deleteUsuario } from "@/lib/actions/usuarios";
import type { ProfileWithEmail } from "@/lib/data/profiles";
import { formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";

export function UsuariosTable({ usuarios }: { usuarios: ProfileWithEmail[] }) {
  const addButton = (
    <UsuarioDialog
      mode="create"
      trigger={
        <Button type="button">
          <PlusIcon />
          Adicionar usuário
        </Button>
      }
    />
  );

  const toolbar = (
    <div className="flex items-center gap-2">
      <InviteLinkButton />
      {addButton}
    </div>
  );

  return (
    <DataList
      items={usuarios}
      pageSize={8}
      searchPlaceholder="Pesquisar usuários"
      searchableText={(u) =>
        `${u.nome_completo ?? ""} ${u.email ?? ""} ${u.telefone ?? ""} ${
          u.cargo ?? ""
        }`
      }
      toolbar={toolbar}
      emptyState={
        <EmptyState
          icon={UserCogIcon}
          title="Nenhum usuário cadastrado"
          description="Adicione usuários para dar acesso à plataforma."
          action={addButton}
        />
      }
      renderTable={(items) => (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={thClass}>Nome</TableHead>
              <TableHead className={thClass}>E-mail</TableHead>
              <TableHead className={thClass}>Celular</TableHead>
              <TableHead className={thClass}>Cargo</TableHead>
              <TableHead className={cn(thClass, "text-right")}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className={cn(tdClass, "font-medium text-foreground")}>
                  {usuario.nome_completo || "—"}
                </TableCell>
                <TableCell className={cn(tdClass, "text-muted-foreground")}>
                  {usuario.email || "—"}
                </TableCell>
                <TableCell
                  className={cn(tdClass, "tabular-nums text-muted-foreground")}
                >
                  {usuario.telefone ? formatPhone(usuario.telefone) : "—"}
                </TableCell>
                <TableCell className={tdClass}>
                  {usuario.cargo ? (
                    <Badge variant="secondary">{usuario.cargo}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className={tdClass}>
                  <div className="flex items-center justify-end gap-1.5">
                    <UsuarioDialog
                      mode="edit"
                      usuario={usuario}
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
                    <ConfirmDialog
                      destructive
                      title="Excluir usuário"
                      description={`${
                        usuario.nome_completo || "O usuário"
                      } perderá o acesso à plataforma.`}
                      confirmLabel="Excluir"
                      onConfirm={() => deleteUsuario(usuario.id)}
                      trigger={
                        <button
                          type="button"
                          title="Excluir"
                          aria-label="Excluir"
                          className={cn(iconAction, iconActionDelete)}
                        >
                          <Trash2Icon className="size-4" />
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
