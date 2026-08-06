import { useMemo, useState } from "react";
import { Settings2, TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { usePlanning } from "@/features/planning/store";
import { useFinance } from "@/features/finance/hooks/use-finance";
import {
  computeGroupSummary,
  healthMessages,
  type GroupSummary,
} from "@/features/planning/utils";
import { monthTransactions } from "@/features/finance/finance-rules";
import { GROUP_LABELS, GROUP_ORDER } from "@/features/planning/types";
import { currency } from "@/features/finance/utils";
import { PlanningConfigDialog } from "./planning-config-dialog";
import { CategoryMapping } from "./category-mapping";

const STATUS_STYLES: Record<GroupSummary["status"], string> = {
  ok: "text-success",
  warning: "text-warning",
  over: "text-destructive",
};

const STATUS_LABELS: Record<GroupSummary["status"], string> = {
  ok: "Dentro do orçamento",
  warning: "Atenção",
  over: "Acima do orçamento",
};

const STATUS_BAR: Record<GroupSummary["status"], string> = {
  ok: "[&>div]:bg-success",
  warning: "[&>div]:bg-warning",
  over: "[&>div]:bg-destructive",
};

function TrendIcon({ percentage }: { percentage: number }) {
  if (percentage > 100)
    return <TrendingUp className="h-3.5 w-3.5 text-destructive" />;
  if (percentage >= 80)
    return <TrendingUp className="h-3.5 w-3.5 text-warning" />;
  return <Minus className="h-3.5 w-3.5 text-success" />;
}

function GroupCard({ summary }: { summary: GroupSummary }) {
  const label = GROUP_LABELS[summary.group];
  const isInvestment = summary.group === "investimentos";
  const diff = summary.budget - summary.spent;
  const positive = diff >= 0;

  return (
    <Card className="border-border/40 bg-card/40">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{label}</h3>
          <div className="flex items-center gap-1.5">
            <TrendIcon percentage={summary.percentage} />
            <Badge
              variant="secondary"
              className={cn("text-[11px]", STATUS_STYLES[summary.status])}
            >
              {STATUS_LABELS[summary.status]}
            </Badge>
          </div>
        </div>

        {/* Previsto vs Realizado */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/30 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Previsto
            </p>
            <p className="text-base font-semibold tabular-nums">
              {currency(summary.budget)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-2.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {isInvestment ? "Aportado" : "Realizado"}
            </p>
            <p className="text-base font-semibold tabular-nums">
              {currency(summary.spent)}
            </p>
          </div>
        </div>

        {/* Restante e % */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Restante
            </p>
            <p
              className={cn(
                "font-medium tabular-nums",
                positive ? "text-success" : "text-destructive",
              )}
            >
              {currency(Math.abs(diff))}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              % utilizado
            </p>
            <p
              className={cn(
                "font-medium tabular-nums",
                summary.percentage > 100
                  ? "text-destructive"
                  : summary.percentage >= 80
                    ? "text-warning"
                    : "text-success",
              )}
            >
              {summary.percentage}%
            </p>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="space-y-1.5">
          <Progress
            value={Math.min(100, summary.percentage)}
            className={cn("h-2", STATUS_BAR[summary.status])}
          />
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PlanningPanel() {
  const { config, categoryMappings } = usePlanning();
  const { transactions, categories } = useFinance();
  const [configOpen, setConfigOpen] = useState(false);

  const summaries = useMemo<GroupSummary[]>(() => {
    const monthTxs = monthTransactions(transactions);
    return GROUP_ORDER.map((g) =>
      computeGroupSummary(g, config, monthTxs, categories, categoryMappings),
    );
  }, [config, categoryMappings, transactions, categories]);

  const messages = useMemo(() => healthMessages(summaries), [summaries]);

  if (config.monthlyIncome <= 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Planejamento Financeiro</h2>
            <p className="text-sm text-muted-foreground">
              Configure sua renda e distribuição para começar.
            </p>
          </div>
        </div>
        <Card className="border-border/40 bg-card/40">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Você ainda não configurou seu planejamento financeiro.
            </p>
            <Button onClick={() => setConfigOpen(true)}>
              <Settings2 className="h-4 w-4" /> Configurar agora
            </Button>
          </CardContent>
        </Card>
        <PlanningConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Planejamento Financeiro</h2>
          <p className="text-sm text-muted-foreground">
            Renda mensal: {currency(config.monthlyIncome)}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setConfigOpen(true)}>
          <Settings2 className="h-4 w-4" /> Editar
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((s) => (
          <GroupCard key={s.group} summary={s} />
        ))}
      </div>

      {/* Resumo detalhado */}
      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-5">
          <h3 className="mb-3 text-sm font-medium">Resumo do Planejamento</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 text-left font-medium">Grupo</th>
                  <th className="pb-2 text-right font-medium">Previsto</th>
                  <th className="pb-2 text-right font-medium">Realizado</th>
                  <th className="pb-2 text-right font-medium">Restante</th>
                  <th className="pb-2 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {summaries.map((s) => {
                  const diff = s.budget - s.spent;
                  return (
                    <tr key={s.group} className="border-b border-border/20 last:border-0">
                      <td className="py-2.5 font-medium">{GROUP_LABELS[s.group]}</td>
                      <td className="py-2.5 text-right tabular-nums">{currency(s.budget)}</td>
                      <td className="py-2.5 text-right tabular-nums">{currency(s.spent)}</td>
                      <td
                        className={cn(
                          "py-2.5 text-right tabular-nums font-medium",
                          diff >= 0 ? "text-success" : "text-destructive",
                        )}
                      >
                        {currency(Math.abs(diff))}
                      </td>
                      <td
                        className={cn(
                          "py-2.5 text-right tabular-nums font-medium",
                          s.percentage > 100
                            ? "text-destructive"
                            : s.percentage >= 80
                              ? "text-warning"
                              : "text-success",
                        )}
                      >
                        {s.percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mapeamento de categorias */}
      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-5">
          <h3 className="mb-1 text-sm font-medium">Classificação de Categorias</h3>
          <p className="mb-3 text-[11px] text-muted-foreground">
            Cada categoria deve pertencer a um grupo. Isso alimenta automaticamente o
            planejamento, dashboard e relatórios.
          </p>
          <CategoryMapping />
        </CardContent>
      </Card>

      {/* Saúde financeira */}
      <Card className="border-border/40 bg-card/40">
        <CardContent className="space-y-2 p-5">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Saúde financeira
          </p>
          {messages.length > 0 ? (
            messages.map((m, i) => (
              <p key={i} className="text-sm text-foreground">
                {m}
              </p>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              Configure seu planejamento para ver insights.
            </p>
          )}
        </CardContent>
      </Card>

      <PlanningConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </div>
  );
}
