import { useMemo, useState } from "react";
import { Settings2 } from "lucide-react";

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
  monthTransactions,
  type GroupSummary,
} from "@/features/planning/utils";
import { GROUP_LABELS, GROUP_ORDER } from "@/features/planning/types";
import { currency } from "@/features/finance/utils";
import { PlanningConfigDialog } from "./planning-config-dialog";

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

function GroupCard({ summary }: { summary: GroupSummary }) {
  const label = GROUP_LABELS[summary.group];
  const isInvestment = summary.group === "investimentos";

  return (
    <Card className="border-border/40 bg-card/40">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">{label}</h3>
          <Badge
            variant="secondary"
            className={cn("text-[11px]", STATUS_STYLES[summary.status])}
          >
            {STATUS_LABELS[summary.status]}
          </Badge>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Meta
          </p>
          <p className="text-xl font-semibold tabular-nums">
            {currency(summary.budget)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {isInvestment ? "Aportado" : "Utilizado"}
            </p>
            <p className="font-medium tabular-nums">{currency(summary.spent)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {isInvestment ? "Falta aportar" : "Restante"}
            </p>
            <p
              className={cn(
                "font-medium tabular-nums",
                summary.remaining < 0 ? "text-destructive" : "",
              )}
            >
              {currency(Math.abs(summary.remaining))}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Progress
            value={Math.min(100, summary.percentage)}
            className={cn(
              "h-1.5",
              summary.status === "over" && "[&>div]:bg-destructive",
              summary.status === "warning" && "[&>div]:bg-warning",
            )}
          />
          <p className="text-[11px] text-muted-foreground">
            {summary.percentage}% utilizado
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PlanningPanel() {
  const { config, categoryMappings } = usePlanning();
  const { transactions, categories } = useFinance();
  const [configOpen, setConfigOpen] = usePlanningConfigOpen();

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

function usePlanningConfigOpen(): [boolean, (o: boolean) => void] {
  const [open, setOpen] = useState(false);
  return [open, setOpen];
}
