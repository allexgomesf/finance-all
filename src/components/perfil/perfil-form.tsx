"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { updatePerfil } from "@/lib/actions/perfil";
import type { Tables } from "@/lib/database.types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldGrid } from "@/components/shared/form-field";
import { SubmitButton } from "@/components/shared/submit-button";

export function PerfilForm({
  profile,
  email,
}: {
  profile: Tables<"profiles"> | null;
  email: string;
}) {
  const [state, formAction] = useActionState(updatePerfil, {});

  useEffect(() => {
    if (state.ok) toast.success("Perfil atualizado com sucesso.");
    else if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <Card className="p-6">
        <Field label="Nome completo" htmlFor="nome_completo">
          <Input
            id="nome_completo"
            name="nome_completo"
            defaultValue={profile?.nome_completo ?? ""}
            placeholder="Nome completo"
            className="h-11"
          />
        </Field>
        <FieldGrid columns={2}>
          <Field
            label="E-mail"
            htmlFor="email"
            hint="O e-mail não pode ser alterado por aqui."
          >
            <Input id="email" defaultValue={email} className="h-11" disabled />
          </Field>
          <Field label="Telefone" htmlFor="telefone">
            <Input
              id="telefone"
              name="telefone"
              defaultValue={profile?.telefone ?? ""}
              placeholder="(00) 00000-0000"
              className="h-11"
            />
          </Field>
        </FieldGrid>
        {profile?.cargo && (
          <Field label="Cargo" htmlFor="cargo">
            <Input
              id="cargo"
              defaultValue={profile.cargo}
              className="h-11"
              disabled
            />
          </Field>
        )}
      </Card>

      <div className="flex justify-end">
        <SubmitButton size="lg" pendingLabel="Salvando…">
          Salvar
        </SubmitButton>
      </div>
    </form>
  );
}
