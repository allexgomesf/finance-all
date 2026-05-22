"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOutIcon } from "lucide-react";

import { accountNav, isNavActive, primaryNav, type NavItem, type UserCargo } from "@/lib/nav";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = isNavActive(pathname, item);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
          : "text-sidebar-foreground/65 hover:bg-white/[0.06] hover:text-sidebar-foreground",
      )}
    >
      {active && (
        <span className="absolute top-1/2 -left-3 h-7 w-[3px] -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
      )}
      <Icon
        className={cn(
          "size-[18px] shrink-0 transition-colors",
          active
            ? "text-sidebar-primary"
            : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground",
        )}
      />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function SidebarNav({
  onNavigate,
  cargo,
}: {
  onNavigate?: () => void;
  cargo?: UserCargo | null;
}) {
  const visibleNav = primaryNav.filter(
    (item) => !item.roles || (cargo != null && item.roles.includes(cargo)),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {visibleNav.map((item, index) => (
          <div
            key={item.href}
            className="animate-in fade-in slide-in-from-left-3 fill-mode-both"
            style={{ animationDelay: `${index * 45}ms`, animationDuration: "400ms" }}
          >
            <NavLink item={item} onNavigate={onNavigate} />
          </div>
        ))}
      </nav>

      <div className="space-y-1 border-t border-sidebar-border px-3 py-4">
        {accountNav.map((item) => (
          <NavLink key={item.href} item={item} onNavigate={onNavigate} />
        ))}
        <form action={logout}>
          <button
            type="submit"
            className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/65 transition-colors hover:bg-white/[0.06] hover:text-sidebar-foreground"
          >
            <LogOutIcon className="size-[18px] shrink-0 text-sidebar-foreground/55 group-hover:text-sidebar-foreground" />
            <span>Sair</span>
          </button>
        </form>
      </div>
    </div>
  );
}
