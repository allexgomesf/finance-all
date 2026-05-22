"use client";

import { useMemo, useState } from "react";
import { SearchXIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { SearchInput } from "./search-input";
import { Pagination } from "./pagination";

/**
 * Casca genérica de listagem: busca + paginação no cliente sobre um conjunto
 * de itens já carregados pelo Server Component. `renderTable` recebe apenas a
 * página atual.
 */
export function DataList<T>({
  items,
  searchableText,
  searchPlaceholder,
  pageSize = 8,
  toolbar,
  emptyState,
  renderTable,
}: {
  items: T[];
  searchableText: (item: T) => string;
  searchPlaceholder: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
  emptyState: React.ReactNode;
  renderTable: (pageItems: T[]) => React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => searchableText(item).toLowerCase().includes(q));
    // searchableText é uma função pura estável vinda do componente pai.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={query}
          onChange={(value) => {
            setQuery(value);
            setPage(1);
          }}
          placeholder={searchPlaceholder}
        />
        {toolbar}
      </div>

      {items.length === 0 ? (
        emptyState
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-14 text-center">
          <SearchXIcon className="size-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nenhum resultado para “{query}”.
          </p>
        </Card>
      ) : (
        <>
          <Card className="gap-0 overflow-hidden p-0">
            {renderTable(pageItems)}
          </Card>
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
