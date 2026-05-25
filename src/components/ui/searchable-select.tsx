"use client";

import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronsUpDownIcon, SearchIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = { id: string; nome: string };

export function SearchableSelect({
  name,
  options,
  defaultValue = "",
  disabled = false,
  required = false,
  placeholder = "Selecione…",
  emptyLabel = "Nenhum",
  searchPlaceholder = "Pesquisar…",
}: {
  name: string;
  options: SearchableSelectOption[];
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  emptyLabel?: string;
  searchPlaceholder?: string;
}) {
  const NONE: SearchableSelectOption = { id: "", nome: emptyLabel };
  const all = [NONE, ...options];
  const initial = all.find((o) => o.id === defaultValue) ?? NONE;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SearchableSelectOption>(initial);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = all.filter((o) =>
    o.nome.toLowerCase().includes(search.toLowerCase()),
  );

  function select(option: SearchableSelectOption) {
    setSelected(option);
    setOpen(false);
    setSearch("");
  }

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selected.id} required={required} />

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors",
          "hover:border-ring focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          selected.id === "" && "text-muted-foreground",
        )}
      >
        <span className="truncate">
          {selected.id === "" ? placeholder : selected.nome}
        </span>
        <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-popover shadow-md">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {search && (
              <button type="button" onClick={() => setSearch("")}>
                <XIcon className="size-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-muted-foreground">
                Nenhum resultado.
              </li>
            ) : (
              filtered.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => select(option)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      selected.id === option.id && "font-medium",
                    )}
                  >
                    <CheckIcon
                      className={cn(
                        "size-4 shrink-0",
                        selected.id === option.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    <span className="truncate">{option.nome}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
