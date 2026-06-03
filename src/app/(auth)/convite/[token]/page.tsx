import type { Metadata } from "next";
import Link from "next/link";

import { createAdminClient } from "@/lib/supabase/admin";
import { AuthCenteredLayout } from "@/components/auth-centered-layout";
import { ConviteForm } from "@/components/invite/convite-form";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "Criar conta" };

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const isValid = await validateToken(token);

  return (
    <AuthCenteredLayout>
      {isValid ? (
        <ConviteForm token={token} />
      ) : (
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Link inválido</CardTitle>
            <CardDescription>
              Este link de convite é inválido ou já foi utilizado.
              Solicite um novo link ao administrador.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", className: "w-full" })}
            >
              Voltar para o login
            </Link>
          </CardFooter>
        </Card>
      )}
    </AuthCenteredLayout>
  );
}

async function validateToken(token: string): Promise<boolean> {
  if (!token) return false;
  const admin = createAdminClient();
  const { data } = await admin
    .from("invite_tokens")
    .select("id")
    .eq("token", token)
    .is("used_at", null)
    .maybeSingle();
  return !!data;
}
