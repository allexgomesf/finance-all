"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { registerWithInvite, type InviteState } from "@/lib/actions/invite";
import { formatPhone } from "@/lib/format";

const initialState: InviteState = {};

export function ConviteForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(registerWithInvite, initialState);
  const [telefone, setTelefone] = useState("");

  if (state.ok) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro realizado!</CardTitle>
          <CardDescription>
            Sua conta foi criada com sucesso. Faça login para acessar a
            plataforma.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/login" className={buttonVariants({ className: "w-full" })}>
            Ir para o login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Criar conta</CardTitle>
        <CardDescription>Preencha os dados para criar seu acesso.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="token" value={token} />
        <CardContent className="flex flex-col gap-4">
          <Field label="Nome completo" htmlFor="convite-nome" required>
            <Input
              id="convite-nome"
              name="nome_completo"
              placeholder="Seu nome completo"
              autoComplete="name"
              required
            />
          </Field>

          <Field label="Celular" htmlFor="convite-telefone">
            <Input
              id="convite-telefone"
              name="telefone"
              value={telefone}
              onChange={(e) =>
                setTelefone(formatPhone(e.target.value).replace("—", ""))
              }
              placeholder="(00) 00000-0000"
              autoComplete="tel"
            />
          </Field>

          <Field label="E-mail" htmlFor="convite-email" required>
            <Input
              id="convite-email"
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              autoComplete="email"
              required
            />
          </Field>

          <Field
            label="Senha"
            htmlFor="convite-password"
            required
            hint="Mínimo de 6 caracteres."
          >
            <Input
              id="convite-password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </Field>

          <Field label="Confirmar senha" htmlFor="convite-confirm" required>
            <Input
              id="convite-confirm"
              name="confirm"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </Field>

          {state.error && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-2">
          <SubmitButton className="w-full" pendingLabel="Criando conta...">
            Criar conta
          </SubmitButton>
        </CardFooter>
      </form>
    </Card>
  );
}
