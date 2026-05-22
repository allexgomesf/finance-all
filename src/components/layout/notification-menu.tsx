"use client";

import { useState, useTransition } from "react";
import { BellIcon, CheckCheckIcon, InboxIcon, Loader2Icon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getNotifications,
  markAllNotificationsRead,
  type Notificacao,
} from "@/lib/actions/notificacoes";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function NotificationMenu() {
  const [items, setItems] = useState<Notificacao[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();

  const unread = items.filter((n) => !n.is_lida).length;

  function handleOpenChange(next: boolean) {
    if (next && !loaded) {
      startTransition(async () => {
        setItems(await getNotifications());
        setLoaded(true);
      });
    }
  }

  function handleMarkAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, is_lida: true })));
    });
  }

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Notificações"
            className="relative inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        }
      >
        <BellIcon className="size-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-2.5 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-primary ring-2 ring-background" />
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={10} className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b px-3.5 py-2.5">
          <p className="font-heading text-sm font-semibold">Notificações</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-primary transition-opacity hover:opacity-70"
            >
              <CheckCheckIcon className="size-3.5" />
              Marcar todas como lidas
            </button>
          )}
        </div>

        <div className="max-h-[20rem] overflow-y-auto">
          {pending && !loaded ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Carregando…
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                <InboxIcon className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação por aqui.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-3.5 py-3 text-sm",
                    !n.is_lida && "bg-accent/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      n.is_lida ? "bg-border" : "bg-primary",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-foreground/90">{n.notificacao}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDateTime(n.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
