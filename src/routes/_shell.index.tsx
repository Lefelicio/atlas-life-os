import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowRight,
  Plus,
  ChevronRight,
  Target,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Greeting } from "@/components/greeting";
import { Insight } from "@/components/insight";
import { EmptyState } from "@/components/empty-state";

import { useFinance } from "@/features/finance/store";
import {
  computePeriod,
  currency,
  inRange,
  sumExpense,
  sumIncome,
  totalBalance,
} from "@/features/finance/utils";
import { useGoals, goalProgress, goalRemaining } from "@/features/goals/store";
import { TransactionsList } from "@/features/finance/components/transactions-list";
import { TransactionDialog } from "@/features/finance/components/transaction-dialog";
import { useDashboardInsight } from "@/features/insights/use-dashboard-insight";
import { useDashboardActions } from "@/features/insights/use-dashboard-actions";

export const Route = createFileRoute("/_shell/")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Central de Comando — Atlas" },
      {
        name: "description",
        content: "Sua visão pessoal e inteligente do dia — Atlas Life OS.",
      },
    ],
  }),
});

function DashboardPage() {
  const { accounts, transactions, cards, runRecurrences } = useFinance();
  const { goals } = useGoals();
  const [txOpen, setTxOpen] = useState(false);

  useEffect(() => {
    runRecurrences();
  }, [runRecurrences]);

  const range = useMemo(() => computePeriod("30d"), []);
  const monthly = useMemo(
    () => transactions.filter((t) => inRange(t.date, range)),
    [transactions, range],
  );

  const insight = useDashboardInsight({ accounts, transactions, monthly, goals });
  const actions = useDashboardActions({ accounts, transactions, cards, goals });

  // Balance
  const total = totalBalance(accounts, transactions);
  const hasAccounts = accounts.length > 0;

  // Previous month comparison
  const prevMonthSavings = useMemo(() => {
    const now = new Date();
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const prevRange = {
      key: "custom" as const,
      from: prevStart.toISOString().slice(0, 10),
      to: prevEnd.toISOString().slice(0, 10),
    };
    const prevTx = transactions.filter((t) => inRange(t.date, prevRange));
    return sumIncome(prevTx) - sumExpense(prevTx);
  }, [transactions]);

  const currentSavings = sumIncome(monthly) - sumExpense(monthly);
  const savingsDiff = currentSavings - prevMonthSavings;
  const hasPrevData = prevMonthSavings !== 0 || transactions.length > 0;

  // Primary goal
  const activeGoals = goals.filter((g) => !g.archived);
  const primaryGoal = activeGoals.find((g) => g.isPrimary) ?? activeGoals[0];

  // Recent transactions
  const recent = transactions.slice(0, 5);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* 1. Greeting */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <Greeting />
        <Button
          size="lg"
          onClick={() => setTxOpen(true)}
          disabled={!hasAccounts}
          className="gap-1.5 shadow-elegant ring-1 ring-primary/40 hover:ring-primary/60"
        >
          <Plus className="h-4 w-4" />
          Novo lançamento
          <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
        </Button>
      </div>

      {/* 2. Insight of the day */}
      <Insight message={insight} className="rounded-xl" />

      {/* 3. General balance */}
      <Link to="/financas" className="block">
        <Card className="group border-border/40 bg-card/40 transition-colors hover:border-border">
          <CardContent className="p-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Saldo geral
            </p>
            <p className="mt-3 text-4xl font-semibold tracking-tight tabular-nums">
              {hasAccounts ? currency(total) : "—"}
            </p>
            {hasAccounts && hasPrevData && savingsDiff !== 0 && (
              <div className="mt-3 flex items-center gap-1.5 text-sm">
                {savingsDiff > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-success">
                      +{currency(savingsDiff)}
                    </span>
                    <span className="text-muted-foreground">vs. mês anterior</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">
                      {currency(savingsDiff)}
                    </span>
                    <span className="text-muted-foreground">vs. mês anterior</span>
                  </>
                )}
              </div>
            )}
            {!hasAccounts && (
              <p className="mt-3 text-sm text-muted-foreground">
                Comece adicionando uma conta.
              </p>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* 4. Primary goal */}
      {primaryGoal ? (
        <Link to="/metas" className="block">
          <Card className="group border-border/40 bg-card/40 transition-colors hover:border-border">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  Meta principal
                </p>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-3 text-xl font-semibold tracking-tight">
                {primaryGoal.title}
              </p>
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-3xl font-semibold tabular-nums">
                  {goalProgress(primaryGoal)}%
                </span>
                <span className="text-sm text-muted-foreground">
                  {currency(primaryGoal.currentAmount)} / {currency(primaryGoal.targetAmount)}
                </span>
              </div>
              <Progress
                value={goalProgress(primaryGoal)}
                className="mt-3 h-2"
                style={{ backgroundColor: "var(--muted)" }}
              />
              <p className="mt-3 text-sm text-muted-foreground">
                Faltam {currency(goalRemaining(primaryGoal))}
              </p>
            </CardContent>
          </Card>
        </Link>
      ) : (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Meta principal
              </p>
              <Target className="h-4 w-4 text-muted-foreground" />
            </div>
            <EmptyState
              className="mt-4"
              title="Nenhuma meta definida"
              description="Defina um objetivo para acompanhar seu progresso aqui."
              action={
                <Link to="/metas">
                  <Button size="sm" variant="secondary">
                    Criar meta <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* 5. Upcoming actions */}
      {actions.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Próximas ações
          </p>
          <div className="space-y-2">
            {actions.map((action) => (
              <Link key={action.id} to={action.href} className="block">
                <div className="group flex items-center gap-3 rounded-lg border border-border/40 bg-card/30 px-4 py-3 transition-colors hover:border-border hover:bg-card/50">
                  {action.tone === "attention" ? (
                    <CircleAlert className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="flex-1 text-sm text-foreground">
                    {action.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 6. Recent activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Atividade recente
          </p>
          {transactions.length > 0 && (
            <Link
              to="/financas"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Ver tudo →
            </Link>
          )}
        </div>
        {transactions.length > 0 ? (
          <Card className="border-border/40 bg-card/40">
            <CardContent className="p-4">
              <TransactionsList transactions={recent} compact />
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border/40 bg-card/40">
            <CardContent className="p-8">
              <EmptyState
                title="Nenhum lançamento ainda"
                description="Quando você registrar o primeiro, ele aparece aqui."
              />
            </CardContent>
          </Card>
        )}
      </div>

      <TransactionDialog open={txOpen} onOpenChange={setTxOpen} />
    </div>
  );
}
