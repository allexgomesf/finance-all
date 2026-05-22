import {
  HomeIcon,
  Building2Icon,
  UsersIcon,
  PresentationIcon,
  BriefcaseIcon,
  UserCogIcon,
  UserPenIcon,
  KeyRoundIcon,
  type LucideIcon,
} from "lucide-react";

export type UserCargo = "Admin" | "Gerente" | "Vendedor";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Quando true, só fica ativo em correspondência exata da rota. */
  exact?: boolean;
  /** Cargos que podem ver este item. Indefinido = todos os cargos. */
  roles?: UserCargo[];
};

/** Navegação principal — espelha a sidebar dos mockups. */
export const primaryNav: NavItem[] = [
  { label: "Início", href: "/dashboard", icon: HomeIcon, exact: true },
  { label: "Empresa", href: "/dashboard/empresa", icon: Building2Icon },
  { label: "Clientes", href: "/dashboard/clientes", icon: UsersIcon },
  { label: "Projetos", href: "/dashboard/projetos", icon: PresentationIcon },
  { label: "Vendedores", href: "/dashboard/vendedores", icon: BriefcaseIcon, roles: ["Admin", "Gerente"] },
  { label: "Usuários", href: "/dashboard/usuarios", icon: UserCogIcon, roles: ["Admin"] },
];

/** Itens de conta — rodapé da sidebar. */
export const accountNav: NavItem[] = [
  { label: "Editar perfil", href: "/dashboard/perfil", icon: UserPenIcon },
  { label: "Alterar senha", href: "/dashboard/senha", icon: KeyRoundIcon },
];

export function isNavActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
