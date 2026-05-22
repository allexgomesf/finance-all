"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/brevo";
import { passwordResetEmail } from "@/lib/email/templates";

export type AuthState = {
  error?: string;
  message?: string;
};

/** Origem da aplicação (ex.: http://localhost:3000), usada em links de e-mail. */
async function getOrigin() {
  const h = await headers();
  return (
    h.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000"
  );
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "E-mail ou senha inválidos." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/** Mensagem genérica — não revela se o e-mail informado possui conta. */
const RESET_GENERIC_MESSAGE =
  "Se houver uma conta com este e-mail, você receberá um link para redefinir a senha.";

/**
 * Solicita a redefinição de senha. Gera o link de recuperação pelo Supabase
 * (sem disparar o e-mail nativo) e o envia pelo Brevo.
 */
export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Informe seu e-mail." };
  }

  const origin = await getOrigin();
  const admin = createAdminClient();

  // Gera o token de recuperação SEM enviar o e-mail padrão do Supabase —
  // o envio fica por conta do Brevo.
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  // E-mail sem conta: respondemos de forma genérica para não revelar
  // quais endereços estão cadastrados.
  if (error || !data.properties?.hashed_token) {
    return { message: RESET_GENERIC_MESSAGE };
  }

  // Reaproveita a rota /auth/confirm, que valida o token (verifyOtp) e
  // estabelece a sessão antes de seguir para a página de nova senha.
  const params = new URLSearchParams({
    token_hash: data.properties.hashed_token,
    type: "recovery",
    next: "/reset-password",
  });
  const resetUrl = `${origin}/auth/confirm?${params}`;

  try {
    const { subject, htmlContent, textContent } = passwordResetEmail(resetUrl);
    await sendEmail({ to: { email }, subject, htmlContent, textContent });
  } catch (sendError) {
    console.error("Falha ao enviar e-mail de recuperação via Brevo:", sendError);
    return {
      error:
        "Não foi possível enviar o e-mail agora. Tente novamente em instantes.",
    };
  }

  return { message: RESET_GENERIC_MESSAGE };
}

/**
 * Define a nova senha. Exige uma sessão ativa de recuperação, criada quando
 * o usuário acessa o link enviado por e-mail (`/auth/confirm`).
 */
export async function resetPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 6) {
    return { error: "A senha deve ter ao menos 6 caracteres." };
  }
  if (password !== confirm) {
    return { error: "As senhas não coincidem." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "Link inválido ou expirado. Solicite um novo e-mail de redefinição.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "Não foi possível redefinir a senha. Tente novamente." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
