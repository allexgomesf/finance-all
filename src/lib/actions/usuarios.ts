"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentEmpresaId } from "@/lib/data/session";
import { getDigits, getStr, getText } from "@/lib/form-utils";

export type UsuarioFormState = { ok?: boolean; error?: string };

const CARGOS = ["Admin", "Gerente", "Vendedor"] as const;

function getCargo(formData: FormData): (typeof CARGOS)[number] | null {
  const value = getStr(formData, "cargo");
  return (CARGOS as readonly string[]).includes(value)
    ? (value as (typeof CARGOS)[number])
    : null;
}

export async function createUsuario(
  _prev: UsuarioFormState,
  formData: FormData,
): Promise<UsuarioFormState> {
  const email = getStr(formData, "email").toLowerCase();
  const password = getStr(formData, "password");
  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }
  if (password.length < 6) {
    return { error: "A senha deve ter ao menos 6 caracteres." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Service key do Supabase não configurada." };
  }

  const empresaId = await getCurrentEmpresaId();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    return { error: error?.message ?? "Não foi possível criar o usuário." };
  }

  // O trigger `on_auth_user_created` já criou o profile; completa os dados.
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      empresa_id: empresaId,
      nome_completo: getText(formData, "nome_completo"),
      telefone: getDigits(formData, "telefone"),
      cargo: getCargo(formData),
    })
    .eq("id", data.user.id);
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "Não foi possível criar o perfil do usuário." };
  }

  revalidatePath("/dashboard/usuarios");
  revalidatePath("/dashboard/vendedores");
  return { ok: true };
}

export async function updateUsuario(
  _prev: UsuarioFormState,
  formData: FormData,
): Promise<UsuarioFormState> {
  const id = getStr(formData, "id");
  if (!id) return { error: "Usuário inválido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      nome_completo: getText(formData, "nome_completo"),
      telefone: getDigits(formData, "telefone"),
      cargo: getCargo(formData),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Não foi possível salvar o usuário." };
  }

  revalidatePath("/dashboard/usuarios");
  revalidatePath("/dashboard/vendedores");
  return { ok: true };
}

export async function deleteUsuario(id: string): Promise<void> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return;
  }
  await admin.from("profiles").delete().eq("id", id);
  try {
    await admin.auth.admin.deleteUser(id);
  } catch {
    // usuário de auth já removido ou inexistente.
  }
  revalidatePath("/dashboard/usuarios");
  revalidatePath("/dashboard/vendedores");
}
