import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { TextosForm } from "@/components/configuracoes/textos-form";
import { getPageTexts } from "@/lib/data/page-texts";
import { getCurrentProfile } from "@/lib/data/session";

export const metadata: Metadata = { title: "Textos do App" };

export default async function TextosPage() {
  const profile = await getCurrentProfile();
  if (profile?.cargo !== "Admin") {
    redirect("/dashboard");
  }

  const pageTexts = await getPageTexts();

  return (
    <>
      <PageHeader
        title="Textos do App"
        subtitle="Personalize os títulos e subtítulos de cada tela"
      />
      <div className="mx-auto max-w-3xl">
        <TextosForm pageTexts={pageTexts} />
      </div>
    </>
  );
}
