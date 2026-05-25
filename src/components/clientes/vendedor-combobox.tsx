"use client";

import { SearchableSelect } from "@/components/ui/searchable-select";

type Option = { id: string; nome: string };

export function VendedorCombobox({
  vendedores,
  defaultValue = "",
  disabled = false,
}: {
  vendedores: Option[];
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <SearchableSelect
      name="vendedor_id"
      options={vendedores}
      defaultValue={defaultValue}
      disabled={disabled}
      emptyLabel="Sem vendedor"
      placeholder="Selecione o vendedor…"
      searchPlaceholder="Pesquisar vendedor…"
    />
  );
}
