"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { addObservacaoAction, type ObservacaoFormState } from "@/lib/actions/projetos";
import type { Observacao } from "@/lib/data/projetos";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/shared/submit-button";

const initialState: ObservacaoFormState = {};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export function ObservacoesSection({
  projetoId,
  observacoes,
}: {
  projetoId: string;
  observacoes: Observacao[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<ObservacaoFormState, FormData>(
    addObservacaoAction,
    initialState,
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    } else if (state !== initialState) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-sm font-semibold text-foreground">Observações</h2>

      {observacoes.length > 0 && (
        <div className="space-y-3">
          {observacoes.map((obs) => (
            <Card key={obs.id} className="px-4 py-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {obs.autor?.nome_completo ?? "Usuário"}
                </span>
                <span>·</span>
                <span>{formatDate(obs.created_at)}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground">{obs.observacao}</p>
            </Card>
          ))}
        </div>
      )}

      <form ref={formRef} action={formAction} className="flex gap-2">
        <input type="hidden" name="projeto_id" value={projetoId} />
        <Input
          name="observacao"
          placeholder="Escreva uma observação"
          className="h-11 flex-1"
          required
        />
        <SubmitButton pendingLabel="Enviando…" className="h-11 shrink-0">
          Enviar
        </SubmitButton>
      </form>
    </div>
  );
}
