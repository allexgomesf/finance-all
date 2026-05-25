"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId, getCurrentProfile } from "@/lib/data/session";
import { getText, getStr } from "@/lib/form-utils";

export type PageTextState = { ok?: boolean; error?: string };

const PAGE_REVALIDATE: Record<string, string[]> = {
  login: ["/login"],
  inicio: ["/dashboard"],
  empresa: ["/dashboard/empresa"],
  clientes: ["/dashboard/clientes"],
  projetos: ["/dashboard/projetos"],
  vendedores: ["/dashboard/vendedores"],
  usuarios: ["/dashboard/usuarios"],
  perfil: ["/dashboard/perfil"],
  senha: ["/dashboard/senha"],
};

export async function upsertPageText(
  _prev: PageTextState,
  formData: FormData,
): Promise<PageTextState> {
  const profile = await getCurrentProfile();
  if (profile?.cargo !== "Admin") {
    return { error: "Apenas administradores podem alterar textos." };
  }

  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { error: "Empresa não encontrada." };

  const pageKey = getStr(formData, "page_key");
  if (!pageKey || !(pageKey in PAGE_REVALIDATE)) {
    return { error: "Página inválida." };
  }

  const title = getText(formData, "title");
  const subtitle = getText(formData, "subtitle");

  const supabase = await createClient();
  const { error } = await supabase.from("page_texts").upsert(
    { empresa_id: empresaId, page_key: pageKey, title, subtitle, updated_at: new Date().toISOString() },
    { onConflict: "empresa_id,page_key" },
  );

  if (error) {
    return { error: "Não foi possível salvar o texto." };
  }

  for (const path of PAGE_REVALIDATE[pageKey]) {
    revalidatePath(path);
  }
  revalidatePath("/dashboard/configuracoes/textos");

  return { ok: true };
}
