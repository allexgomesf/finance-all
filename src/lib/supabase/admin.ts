import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a chave service_role.
 *
 * ATENÇÃO: ignora completamente as políticas de RLS e tem acesso total ao
 * banco. Use APENAS em código server-side (Route Handlers, Server Actions),
 * nunca em Client Components. O import "server-only" garante o erro de build
 * caso este arquivo seja importado no cliente.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
