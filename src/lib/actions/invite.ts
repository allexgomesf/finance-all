"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getCurrentEmpresaId, getCurrentProfile } from "@/lib/data/session";
import { getStr, getText, getDigits } from "@/lib/form-utils";

export type InviteState = { ok?: boolean; error?: string };

async function getOrigin() {
  const h = await headers();
  return (
    h.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

export async function generateInviteLink(): Promise<
  { url: string } | { error: string }
> {
  const profile = await getCurrentProfile();
  if (profile?.cargo !== "Admin") {
    return { error: "Apenas administradores podem gerar links de convite." };
  }

  const empresaId = await getCurrentEmpresaId();
  if (!empresaId) return { error: "Empresa não encontrada." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const origin = await getOrigin();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("invite_tokens")
    .insert({
      empresa_id: empresaId,
      created_by: user.id,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    })
    .select("token")
    .single();

  if (error || !data) {
    return { error: "Não foi possível gerar o link de convite." };
  }

  return { url: `${origin}/convite/${(data as { token: string }).token}` };
}

export async function registerWithInvite(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const token = getStr(formData, "token");
  if (!token) return { error: "Token de convite ausente." };

  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: tokenData, error: tokenError } = await admin
    .from("invite_tokens")
    .select("*")
    .eq("token", token)
    .is("used_at", null)
    .gt("expires_at", now)
    .maybeSingle();

  if (tokenError || !tokenData) {
    return { error: "Link de convite inválido ou expirado." };
  }

  const nome = getText(formData, "nome_completo");
  const telefone = getDigits(formData, "telefone");
  const email = getStr(formData, "email").toLowerCase();
  const password = getStr(formData, "password");
  const confirm = getStr(formData, "confirm");

  if (!nome) return { error: "Informe seu nome completo." };
  if (!email) return { error: "Informe seu e-mail." };
  if (password.length < 6)
    return { error: "A senha deve ter ao menos 6 caracteres." };
  if (password !== confirm) return { error: "As senhas não coincidem." };

  const { data: userData, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (createError || !userData.user) {
    return { error: createError?.message ?? "Não foi possível criar a conta." };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      empresa_id: (tokenData as { empresa_id: string }).empresa_id,
      nome_completo: nome,
      telefone,
      cargo: "Vendedor",
    })
    .eq("id", userData.user.id);

  if (profileError) {
    await admin.auth.admin.deleteUser(userData.user.id);
    return { error: "Não foi possível criar o perfil." };
  }

  await admin
    .from("invite_tokens")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token);

  return { ok: true };
}
