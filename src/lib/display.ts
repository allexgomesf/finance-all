import type { Cliente } from "@/lib/data/clientes";
import type { ProjetoListItem } from "@/lib/data/projetos";

/**
 * Helpers de exibição compartilhados entre Server e Client Components.
 * (As funções dos arquivos `data/` não podem ser importadas no cliente por
 * causa do `server-only`.)
 */

/** Nome de exibição do cliente: razão social para PJ, nome para PF. */
export function clienteNome(
  cliente: Pick<Cliente, "nome" | "razao_social" | "is_empresa">,
): string {
  if (cliente.is_empresa) {
    return cliente.razao_social || cliente.nome || "Sem nome";
  }
  return cliente.nome || cliente.razao_social || "Sem nome";
}

/** Nome do cliente associado a um projeto, com fallback no campo textual. */
export function projetoClienteNome(projeto: ProjetoListItem): string {
  return (
    projeto.cliente?.razao_social ||
    projeto.cliente?.nome ||
    projeto.nome_cliente ||
    "—"
  );
}
