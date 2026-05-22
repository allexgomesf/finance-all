"use server";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export type Notificacao = Tables<"notificacoes">;

/** Lista as notificações do usuário logado (RLS escopa por `user_id`). */
export async function getNotifications(): Promise<Notificacao[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notificacoes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}

/** Marca uma notificação como lida. */
export async function markNotificationRead(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("notificacoes").update({ is_lida: true }).eq("id", id);
}

/** Marca todas as notificações do usuário como lidas. */
export async function markAllNotificationsRead(): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("notificacoes")
    .update({ is_lida: true })
    .eq("is_lida", false);
}
