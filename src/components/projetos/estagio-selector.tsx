"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateEstagioAction } from "@/lib/actions/projetos";

export const ESTAGIOS_PROJETO = [
  "Pré-análise de crédito",
  "Consultas",
  "Cadastro do cliente",
  "Documentação",
  "Orçamento",
  "Notas Fiscais",
  "Contrato",
  "Pagamento",
] as const;

export type EstagioProjeto = (typeof ESTAGIOS_PROJETO)[number];

export function EstagioSelector({
  projetoId,
  estagioAtual,
}: {
  projetoId: string;
  estagioAtual: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  function handleSelect(estagio: string) {
    if (estagio === estagioAtual || isPending) return;
    startTransition(async () => {
      const result = await updateEstagioAction(projetoId, estagio);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Estágio atualizado para "${estagio}"`);
      }
    });
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {ESTAGIOS_PROJETO.map((estagio) => {
        const isActive = estagio === estagioAtual;
        return (
          <button
            key={estagio}
            type="button"
            disabled={isPending}
            onClick={() => handleSelect(estagio)}
            className={cn(
              "cursor-pointer rounded-xl border px-3 py-4 text-center text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5",
              isPending && "cursor-not-allowed opacity-60",
            )}
          >
            {estagio}
          </button>
        );
      })}
    </div>
  );
}
