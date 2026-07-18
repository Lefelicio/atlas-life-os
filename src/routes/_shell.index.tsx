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

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { StatCard } from "@/features/finance/components/stat-card";
import { TransactionsList } from "@/features/finance/components/transactions-list";
import { TransactionDialog } from "@/features/finance/components/transaction-dialog";
import {
  ExpenseByCategoryChart,
  MonthlyChart,
} from "@/features/finance/components/charts";

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

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Visão geral"
        title="Bem-vindo ao Atlas"
        description="Sua central de comando pessoal. Últimos 30 dias em destaque."
        actions={
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setTxOpen(true)}
            disabled={accounts.length === 0}
          >
            Novo lançamento
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Saldo total"
          value={currency(total)}
          icon={<Wallet className="h-4 w-4" />}
          hint={`${accounts.length} conta${accounts.length === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Receitas 30d"
          value={currency(income)}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="success"
        />
        <StatCard
          label="Despesas 30d"
          value={currency(expense)}
          icon={<TrendingDown className="h-4 w-4" />}
          tone="destructive"
        />
        <StatCard
          label="Economia"
          value={currency(savings)}
          icon={<CreditCard className="h-4 w-4" />}
          hint={income > 0 ? `${((savings / income) * 100).toFixed(0)}% da receita` : "—"}
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Evolução mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart />
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseByCategoryChart transactions={monthly} />
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
            <TransactionsList
              transactions={recent}
              compact
              emptyLabel="Cadastre seu primeiro lançamento"
            />
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
            {accounts.length === 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border/70 bg-muted/20 text-center">
                <p className="text-xs text-muted-foreground">
                  Nenhuma conta cadastrada
                </p>
                <Link to="/financas">
                  <Button size="sm" variant="secondary">
                    <Plus className="h-3.5 w-3.5" /> Adicionar
                  </Button>
                </Link>
              </div>
            ) : (
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
