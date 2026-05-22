"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getDigits, getStr, getText } from "@/lib/form-utils";

export type PerfilFormState = { ok?: boolean; error?: string };

export async function updatePerfil(
  _prev: PerfilFormState,
  formData: FormData,
): Promise<PerfilFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sessão expirada. Entre novamente." };

  const { error } = await supabase
    .from("profiles")
    .update({
      nome_completo: getText(formData, "nome_completo"),
      telefone: getDigits(formData, "telefone"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível salvar o perfil." };
  }

  revalidatePath("/dashboard/perfil");
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

export type SenhaFormState = { ok?: boolean; error?: string };

export async function updateSenha(
  _prev: SenhaFormState,
  formData: FormData,
): Promise<SenhaFormState> {
  const password = getStr(formData, "password");
  const confirm = getStr(formData, "confirm");

  if (password.length < 6) {
    return { error: "A senha deve ter ao menos 6 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "Não foi possível alterar a senha." };
  }

  return { ok: true };
}
