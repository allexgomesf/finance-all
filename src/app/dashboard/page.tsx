import type { Metadata } from "next";
import {
  BriefcaseIcon,
  PresentationIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { getDashboardCounts } from "@/lib/data/dashboard";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = { title: "Início" };

export default async function DashboardHomePage() {
  const counts = await getDashboardCounts();

  return (
    <>
      <PageHeader title="Início" subtitle="Dados gerais" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          index={0}
          label="Clientes"
          value={counts.clientes}
          icon={UsersIcon}
          href="/dashboard/clientes"
          hint="Total cadastrado"
        />
        <StatCard
          index={1}
          label="Projetos"
          value={counts.projetos}
          icon={PresentationIcon}
          href="/dashboard/projetos"
          hint="Total cadastrado"
        />
        <StatCard
          index={2}
          label="Vendedores"
          value={counts.vendedores}
          icon={BriefcaseIcon}
          href="/dashboard/vendedores"
          hint="Equipe de vendas"
        />
        <StatCard
          index={3}
          label="Valor previsto"
          value={formatCurrency(counts.valorPrevisto)}
          icon={TrendingUpIcon}
          hint="Soma dos projetos"
        />
      </div>
    </>
  );
}
