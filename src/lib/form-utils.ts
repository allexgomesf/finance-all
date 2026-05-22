import { onlyDigits } from "@/lib/format";

/** Helpers para ler campos de `FormData` em Server Actions. */

export function getStr(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Texto ou `null` quando vazio. */
export function getText(formData: FormData, key: string): string | null {
  return getStr(formData, key) || null;
}

/** Somente dígitos (CPF, CNPJ, telefone, CEP) ou `null`. */
export function getDigits(formData: FormData, key: string): string | null {
  return onlyDigits(getStr(formData, key)) || null;
}

/** Número ou `null` quando vazio/ inválido. */
export function getNumber(formData: FormData, key: string): number | null {
  const raw = getStr(formData, key);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Booleano a partir de checkbox/switch. */
export function getBool(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}
