import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Finance All
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          Organize contas, receitas e despesas em um só lugar. Construído com
          Next.js e Supabase.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {user ? (
          <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
            Ir para o dashboard
          </Link>
        ) : (
          <Link href="/login" className={buttonVariants({ size: "lg" })}>
            Entrar
          </Link>
        )}
      </div>
    </main>
  );
}
