import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useFinance } from "@/features/finance/store";
import {
  computePeriod,
  currency,
  inRange,
  sumExpense,
  sumIncome,
  todayISO,
} from "@/features/finance/utils";
import type { PeriodKey } from "@/features/finance/types";
import { PeriodFilter } from "@/features/finance/components/period-filter";
import { TransactionsList } from "@/features/finance/components/transactions-list";
import { TransactionDialog } from "@/features/finance/components/transaction-dialog";
import { AccountsPanel } from "@/features/finance/components/accounts-panel";
import { CategoryManager } from "@/features/finance/components/category-manager";
import {
  ExpenseByCategoryChart,
  MonthlyChart,
} from "@/features/finance/components/charts";

export const Route = createFileRoute("/_shell/financas")({
  component: FinancasPage,
  head: () => ({
    meta: [
      { title: "Finanças — Atlas" },
      {
        name: "description",
        content:
          "Controle simples e rápido de contas, receitas, despesas e transferências.",
      },
    ],
  }),
});

function FinancasPage() {
  const { transactions, accounts } = useFinance();
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [custom, setCustom] = useState({ from: todayISO(), to: todayISO() });
  const [query, setQuery] = useState("");
  const [txOpen, setTxOpen] = useState(false);

  const range = useMemo(
    () => computePeriod(period, custom),
    [period, custom],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => inRange(t.date, range))
      .filter((t) => {
        if (!q) return true;
        return (
          t.description.toLowerCase().includes(q) ||
          (t.notes ?? "").toLowerCase().includes(q) ||
          String(t.amount).includes(q)
        );
      });
  }, [transactions, range, query]);

  const income = sumIncome(filtered);
  const expense = sumExpense(filtered);
  const savings = income - expense;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Módulo"
        title="Finanças"
        description="Cadastre lançamentos em segundos. Contas, categorias e saldos sempre atualizados."
        actions={
          <Button
            size="sm"
            onClick={() => setTxOpen(true)}
            disabled={accounts.length === 0}
          >
            <Plus className="h-4 w-4" /> Lançamento
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar lançamento…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-9"
          />
        </div>
        <PeriodFilter
          value={period}
          onChange={setPeriod}
          custom={custom}
          onCustomChange={setCustom}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              Receitas
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-success">
              {currency(income)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              Despesas
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-destructive">
              {currency(expense)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              Economia
            </p>
            <p className="mt-2 text-xl font-semibold tabular-nums">
              {currency(savings)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Lançamentos</TabsTrigger>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <Card className="border-border/60 bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">
                {filtered.length} lançamento{filtered.length === 1 ? "" : "s"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TransactionsList
                transactions={filtered}
                emptyLabel={
                  accounts.length === 0
                    ? "Cadastre uma conta para começar"
                    : "Nenhum lançamento no período"
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          <AccountsPanel />
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <CategoryManager />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseByCategoryChart transactions={filtered} />
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Últimos 6 meses</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyChart />
          </CardContent>
        </Card>
      </div>

      <TransactionDialog open={txOpen} onOpenChange={setTxOpen} />
    </div>
  );
}
