"use client";

import Link from "next/link";
import { EyeIcon, PencilIcon, Trash2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./confirm-dialog";

const ACTION =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40";

export function RowActions({
  viewHref,
  editHref,
  onDelete,
  confirmTitle = "Excluir registro",
  confirmDescription,
}: {
  viewHref?: string;
  editHref?: string;
  onDelete?: () => void | Promise<void>;
  confirmTitle?: string;
  confirmDescription?: string;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {viewHref && (
        <Link
          href={viewHref}
          title="Visualizar"
          aria-label="Visualizar"
          className={cn(
            ACTION,
            "bg-secondary text-secondary-foreground hover:bg-muted-foreground/15",
          )}
        >
          <EyeIcon className="size-4" />
        </Link>
      )}
      {editHref && (
        <Link
          href={editHref}
          title="Editar"
          aria-label="Editar"
          className={cn(ACTION, "bg-primary/10 text-primary hover:bg-primary/20")}
        >
          <PencilIcon className="size-4" />
        </Link>
      )}
      {onDelete && (
        <ConfirmDialog
          onConfirm={onDelete}
          destructive
          title={confirmTitle}
          description={
            confirmDescription ??
            "Esta ação não pode ser desfeita. O registro será removido permanentemente."
          }
          confirmLabel="Excluir"
          trigger={
            <button
              type="button"
              title="Excluir"
              aria-label="Excluir"
              className={cn(
                ACTION,
                "bg-destructive/10 text-destructive hover:bg-destructive/20",
              )}
            >
              <Trash2Icon className="size-4" />
            </button>
          }
        />
      )}
    </div>
  );
}
