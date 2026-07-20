import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Star, Repeat } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/empty-state";

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
import { RecurrenceDialog } from "@/features/finance/components/recurrence-dialog";
import { RecurrenceCard } from "@/features/finance/components/recurrence-card";
import { FavoriteDialog } from "@/features/finance/components/favorite-dialog";
import { FavoriteCard } from "@/features/finance/components/favorite-card";

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
  const { transactions, accounts, tags, recurrences, favorites } = useFinance();
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [custom, setCustom] = useState({ from: todayISO(), to: todayISO() });
  const [query, setQuery] = useState("");
  const [txOpen, setTxOpen] = useState(false);
  const [recOpen, setRecOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);

  const range = useMemo(() => computePeriod(period, custom), [period, custom]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // support tag search via "#nome"
    const tagQuery = q.startsWith("#") ? q.slice(1) : null;
    const matchedTagIds = tagQuery
      ? tags.filter((t) => t.name.toLowerCase().includes(tagQuery)).map((t) => t.id)
      : null;

    return transactions
      .filter((t) => inRange(t.date, range))
      .filter((t) => {
        if (!q) return true;
        if (matchedTagIds) return t.tagIds?.some((id) => matchedTagIds.includes(id));
        return (
          t.description.toLowerCase().includes(q) ||
          (t.notes ?? "").toLowerCase().includes(q) ||
          String(t.amount).includes(q)
        );
      });
  }, [transactions, range, query, tags]);

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
            className="shadow-elegant ring-1 ring-primary/40 hover:ring-primary/60"
          >
            <Plus className="h-4 w-4" /> Lançamento
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar lançamento ou #tag…"
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
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Receitas</p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-success">{currency(income)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Despesas</p>
            <p className="mt-2 text-xl font-semibold tabular-nums text-destructive">{currency(expense)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Economia</p>
            <p className="mt-2 text-xl font-semibold tabular-nums">{currency(savings)}</p>
          </CardContent>
        </Card>
      </div>

      {favorites.length > 0 && (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Favoritos
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setFavOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Favorito
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            {favorites.map((f) => <FavoriteCard key={f.id} favorite={f} />)}
          </div>
        </section>
      )}

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Lançamentos</TabsTrigger>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
          <TabsTrigger value="recurrences">Recorrências</TabsTrigger>
          <TabsTrigger value="favorites">Favoritos</TabsTrigger>
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

        <TabsContent value="recurrences" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Assinaturas, aluguéis e transferências automáticas materializadas quando a data chega.
            </p>
            <Button size="sm" onClick={() => setRecOpen(true)} disabled={accounts.length === 0}>
              <Repeat className="h-4 w-4" /> Recorrência
            </Button>
          </div>
          {recurrences.length === 0 ? (
            <EmptyState
              title="Nenhuma recorrência ativa"
              description="Automatize lançamentos frequentes como Netflix, Aluguel ou aportes."
            />
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {recurrences.map((r) => <RecurrenceCard key={r.id} recurrence={r} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Atalhos de um clique para lançamentos recorrentes do seu dia a dia.
            </p>
            <Button size="sm" onClick={() => setFavOpen(true)}>
              <Star className="h-4 w-4" /> Favorito
            </Button>
          </div>
          {favorites.length === 0 ? (
            <EmptyState
              title="Sem favoritos ainda"
              description="Crie atalhos para Academia, Netflix, Mercado e reduza cliques."
            />
          ) : (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {favorites.map((f) => <FavoriteCard key={f.id} favorite={f} />)}
            </div>
          )}
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
      <RecurrenceDialog open={recOpen} onOpenChange={setRecOpen} />
      <FavoriteDialog open={favOpen} onOpenChange={setFavOpen} />
    </div>
  );
}
