import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CreditCard,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Greeting } from "@/components/greeting";
import { Insight } from "@/components/insight";
import { EmptyState } from "@/components/empty-state";
import { StatusCard } from "@/components/status-card";
import { PlaceholderCard } from "@/components/placeholder-card";

import { useFinance } from "@/features/finance/store";
import {
  accountBalance,
  computePeriod,
  currency,
  inRange,
  sumExpense,
  sumIncome,
  totalBalance,
} from "@/features/finance/utils";
import { TransactionsList } from "@/features/finance/components/transactions-list";
import { TransactionDialog } from "@/features/finance/components/transaction-dialog";
import {
  ExpenseByCategoryChart,
  MonthlyChart,
} from "@/features/finance/components/charts";
import { useDashboardInsight } from "@/features/insights/use-dashboard-insight";

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
  const { accounts, transactions } = useFinance();
  const [txOpen, setTxOpen] = useState(false);

  const range = useMemo(() => computePeriod("30d"), []);
  const monthly = useMemo(
    () => transactions.filter((t) => inRange(t.date, range)),
    [transactions, range],
  );
  const income = sumIncome(monthly);
  const expense = sumExpense(monthly);
  const savings = income - expense;
  const total = totalBalance(accounts, transactions);
  const recent = transactions.slice(0, 6);

  const insight = useDashboardInsight({ accounts, transactions, monthly });

  const hasAccounts = accounts.length > 0;
  const hasTx = transactions.length > 0;
  const hasMonthly = monthly.length > 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-border/60 pb-6">
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

      <Insight message={insight} />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          label="Saldo total"
          value={hasAccounts ? currency(total) : undefined}
          emptyText="Comece adicionando uma conta."
          icon={<Wallet className="h-4 w-4" />}
          hint={hasAccounts ? `${accounts.length} conta${accounts.length === 1 ? "" : "s"}` : undefined}
        />
        <StatusCard
          label="Receitas 30d"
          value={income > 0 ? currency(income) : undefined}
          emptyText="Cadastre sua primeira receita."
          icon={<TrendingUp className="h-4 w-4" />}
          tone="success"
        />
        <StatusCard
          label="Despesas 30d"
          value={expense > 0 ? currency(expense) : undefined}
          emptyText="Nenhuma despesa registrada."
          icon={<TrendingDown className="h-4 w-4" />}
          tone="destructive"
        />
        <StatusCard
          label="Economia"
          value={hasMonthly ? currency(savings) : undefined}
          emptyText="Sem dados no período."
          icon={<CreditCard className="h-4 w-4" />}
          hint={
            income > 0 ? `${((savings / income) * 100).toFixed(0)}% da receita` : undefined
          }
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Evolução mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {hasTx ? (
              <MonthlyChart />
            ) : (
              <EmptyState
                title="Sua linha do tempo aparece aqui"
                description="Registre lançamentos para visualizar sua evolução mês a mês."
              />
            )}
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expense > 0 ? (
              <ExpenseByCategoryChart transactions={monthly} />
            ) : (
              <EmptyState
                title="Sem despesas no período"
                description="Categorize seus gastos para descobrir padrões."
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Últimos lançamentos</CardTitle>
            <Link
              to="/financas"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Ver tudo →
            </Link>
          </CardHeader>
          <CardContent>
            {hasTx ? (
              <TransactionsList transactions={recent} compact />
            ) : (
              <EmptyState
                compact
                title="Nenhum lançamento por aqui ainda"
                description="Quando você registrar o primeiro, ele aparece nesta lista."
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Contas</CardTitle>
            <Link
              to="/financas"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Gerenciar →
            </Link>
          </CardHeader>
          <CardContent>
            {hasAccounts ? (
              <ul className="divide-y divide-border/50">
                {accounts.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 py-2.5">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: a.color }}
                    />
                    <span className="flex-1 truncate text-sm">{a.name}</span>
                    <span className="text-sm font-semibold tabular-nums">
                      {currency(accountBalance(a, transactions))}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                compact
                title="Nenhuma conta cadastrada"
                description="Adicione contas para acompanhar seus saldos."
                action={
                  <Link to="/financas">
                    <Button size="sm" variant="secondary">
                      <Plus className="h-3.5 w-3.5" /> Adicionar conta
                    </Button>
                  </Link>
                }
              />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PlaceholderCard title="Missões da semana" height="h-40" />
        <PlaceholderCard title="Hábitos" height="h-40" />
      </section>

      <TransactionDialog open={txOpen} onOpenChange={setTxOpen} />
    </div>
  );
}
