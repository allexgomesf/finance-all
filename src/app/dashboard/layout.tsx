import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getEmpresa } from "@/lib/data/empresa";
import { MobileNavProvider } from "@/components/layout/mobile-nav";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppFooter } from "@/components/layout/app-footer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // O proxy já protege /dashboard; checagem extra por segurança.
  if (!user) {
    redirect("/login");
  }

  const [empresa, profileData] = await Promise.all([
    getEmpresa(),
    supabase.from("profiles").select("cargo").eq("id", user.id).maybeSingle(),
  ]);
  const cargo = profileData.data?.cargo ?? null;

  return (
    <MobileNavProvider>
      <div className="min-h-svh bg-background">
        <AppSidebar cargo={cargo} />
        <div className="flex min-h-svh flex-col lg:pl-60">
          <main className="flex-1 px-4 pb-12 sm:px-6 lg:px-8">{children}</main>
          <AppFooter empresa={empresa} />
        </div>
      </div>
    </MobileNavProvider>
  );
}
