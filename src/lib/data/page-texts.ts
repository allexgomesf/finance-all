import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type PageText = { title: string | null; subtitle: string | null };
export type PageTextsMap = Record<string, PageText>;

export async function getPageTexts(): Promise<PageTextsMap> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("page_texts")
    .select("page_key, title, subtitle");

  if (!data) return {};

  return Object.fromEntries(
    data.map((row) => [row.page_key, { title: row.title, subtitle: row.subtitle }]),
  );
}

export async function getLoginPageText(): Promise<PageText> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("page_texts")
    .select("title, subtitle")
    .eq("page_key", "login")
    .limit(1)
    .maybeSingle();

  return { title: data?.title ?? null, subtitle: data?.subtitle ?? null };
}
