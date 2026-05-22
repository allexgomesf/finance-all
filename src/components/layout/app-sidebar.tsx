"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useMobileNav } from "./mobile-nav";
import { SidebarNav } from "./sidebar-nav";
import type { UserCargo } from "@/lib/nav";

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      href="/dashboard"
      onClick={onClick}
      aria-label="FinanceAll — Início"
      className="flex items-center transition-opacity hover:opacity-90"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-financeall.svg"
        alt="FinanceAll"
        className="h-9 w-auto select-none"
        draggable={false}
      />
    </Link>
  );
}

export function AppSidebar({ cargo }: { cargo?: UserCargo | null }) {
  const { open, setOpen } = useMobileNav();
  const pathname = usePathname();

  // Fecha o drawer ao navegar.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  return (
    <>
      {/* Sidebar fixa — desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-sidebar-border px-5">
          <Logo />
        </div>
        <SidebarNav cargo={cargo} />
      </aside>

      {/* Drawer — mobile */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          open ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-[1px] transition-opacity duration-200",
            open ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[268px] flex-col bg-sidebar text-sidebar-foreground shadow-2xl transition-transform duration-200 ease-out",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-5">
            <Logo onClick={() => setOpen(false)} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-white/10 hover:text-sidebar-foreground"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <SidebarNav cargo={cargo} onNavigate={() => setOpen(false)} />
        </aside>
      </div>
    </>
  );
}
