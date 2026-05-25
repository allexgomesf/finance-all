import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { VendedoresTable } from "@/components/vendedores/vendedores-table";
import { getVendedores } from "@/lib/data/profiles";
import { getCurrentProfile } from "@/lib/data/session";
import { getPageTexts } from "@/lib/data/page-texts";

export const metadata: Metadata = { title: "Vendedores" };

export default async function VendedoresPage() {
  const profile = await getCurrentProfile();
  if (profile?.cargo !== "Admin" && profile?.cargo !== "Gerente") {
    redirect("/dashboard");
  }

  const [vendedores, pageTexts] = await Promise.all([getVendedores(), getPageTexts()]);
  const t = pageTexts["vendedores"];

  return (
    <>
      <PageHeader
        title={t?.title ?? "Vendedores"}
        subtitle={t?.subtitle ?? "Equipe de vendas da sua empresa"}
      />
      <VendedoresTable vendedores={vendedores} />
    </>
  );
}
