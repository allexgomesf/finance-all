import { formatCNPJ } from "@/lib/format";
import type { Empresa } from "@/lib/data/empresa";

export function AppFooter({ empresa }: { empresa: Empresa | null }) {
  const razao = (empresa?.razao_social || empresa?.nome || "FinanceAll").trim();
  const cnpj = empresa?.cnpj ? formatCNPJ(empresa.cnpj) : null;

  return (
    <footer className="mt-auto border-t border-border/70 px-4 py-4 sm:px-6 lg:px-8">
      <p className="text-xs tracking-wide text-muted-foreground">
        {razao.toUpperCase()}
        {cnpj && (
          <span className="text-muted-foreground/70"> · CNPJ {cnpj}</span>
        )}
      </p>
    </footer>
  );
}
