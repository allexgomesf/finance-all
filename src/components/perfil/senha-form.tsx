"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { updateSenha } from "@/lib/actions/perfil";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";

export function SenhaForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(updateSenha, {});

  useEffect(() => {
    if (state.ok) {
      toast.success("Senha alterada com sucesso.");
      formRef.current?.reset();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <Card className="p-6">
        <Field
          label="Nova senha"
          htmlFor="password"
          required
          hint="Mínimo de 6 caracteres."
        >
          <Input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            placeholder="••••••••"
            className="h-11"
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirmar nova senha" htmlFor="confirm" required>
          <Input
            id="confirm"
            name="confirm"
            type="password"
            minLength={6}
            required
            placeholder="••••••••"
            className="h-11"
            autoComplete="new-password"
          />
        </Field>
      </Card>

      <div className="flex justify-end">
        <SubmitButton size="lg" pendingLabel="Alterando…">
          Alterar senha
        </SubmitButton>
      </div>
    </form>
  );
}
