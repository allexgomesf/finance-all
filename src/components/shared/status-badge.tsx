import type { Enums } from "@/lib/database.types";
import { cn } from "@/lib/utils";

type ProjetoStatus = Enums<"projeto_status">;

const STATUS_STYLES: Record<ProjetoStatus, { dot: string; pill: string }> = {
  Pendente: {
    dot: "bg-warning",
    pill: "border-warning/25 bg-warning/10 text-warning",
  },
  "Pré-aprovado": {
    dot: "bg-success",
    pill: "border-success/25 bg-success/10 text-success",
  },
  Reprovado: {
    dot: "bg-destructive",
    pill: "border-destructive/25 bg-destructive/10 text-destructive",
  },
};

export function StatusBadge({
  status,
}: {
  status: ProjetoStatus | null | undefined;
}) {
  if (!status) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  const style = STATUS_STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        style.pill,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {status}
    </span>
  );
}

/** Pílula neutra para o estágio livre do projeto. */
export function StageBadge({ stage }: { stage: string | null | undefined }) {
  if (!stage) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
      {stage}
    </span>
  );
}
