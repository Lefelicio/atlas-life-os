import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  LineChart,
  PieChart,
  Target,
  Wallet,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { PlaceholderCard } from "@/components/placeholder-card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_shell/")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — Atlas" },
      {
        name: "description",
        content: "Visão geral da sua evolução financeira, pessoal e profissional.",
      },
    ],
  }),
});

function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Visão geral"
        title="Bem-vindo ao Atlas"
        description="Sua central de comando pessoal. Os módulos abaixo serão preenchidos à medida que a fundação evolui."
        actions={
          <Button size="sm" className="gap-1.5">
            Novo registro
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PlaceholderCard title="Patrimônio" icon={<Wallet className="h-4 w-4" />} height="h-24" />
        <PlaceholderCard title="Gasto do mês" icon={<CreditCard className="h-4 w-4" />} height="h-24" />
        <PlaceholderCard title="Metas ativas" icon={<Target className="h-4 w-4" />} height="h-24" />
        <PlaceholderCard title="Score Atlas" icon={<Activity className="h-4 w-4" />} height="h-24" />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <PlaceholderCard
          title="Evolução patrimonial"
          icon={<LineChart className="h-4 w-4" />}
          className="lg:col-span-2"
          height="h-72"
        />
        <PlaceholderCard
          title="Distribuição"
          icon={<PieChart className="h-4 w-4" />}
          height="h-72"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PlaceholderCard title="Missões da semana" height="h-56" />
        <PlaceholderCard title="Hábitos" height="h-56" />
      </section>
    </div>
  );
}
