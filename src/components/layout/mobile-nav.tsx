"use client";

import { createContext, useContext, useState } from "react";
import { MenuIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type MobileNavContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MobileNavContext = createContext<MobileNavContextValue | null>(null);

export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <MobileNavContext value={{ open, setOpen }}>{children}</MobileNavContext>
  );
}

export function useMobileNav(): MobileNavContextValue {
  const ctx = useContext(MobileNavContext);
  if (!ctx) {
    throw new Error("useMobileNav deve ser usado dentro de MobileNavProvider");
  }
  return ctx;
}

/** Botão hambúrguer que abre a sidebar no mobile. */
export function MobileNavTrigger({ className }: { className?: string }) {
  const { setOpen } = useMobileNav();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="Abrir menu"
      className={cn(
        "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <MenuIcon className="size-5" />
    </button>
  );
}
