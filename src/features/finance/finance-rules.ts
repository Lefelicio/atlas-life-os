import { format, startOfMonth, endOfMonth, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Account, Transaction, PeriodRange } from "./types";
import { totalBalance, sumIncome, sumExpense, inRange } from "./utils";
import type { Objective } from "@/features/objetivos/types";
import { objectiveProgress } from "@/features/objetivos/resolver";
import type { BudgetConfig, BudgetGroup } from "@/features/planning/types";
import type { Category } from "./types";
import { computeGroupSummary } from "@/features/planning/utils";
import { GROUP_ORDER } from "@/features/planning/types";
import { healthMessages } from "@/features/planning/utils";

// ============================================================
// Month / Period helpers — single source of truth for ranges
// ============================================================

export function monthRange(ref: Date = new Date()): PeriodRange {
  return {
    key: "custom",
    from: format(startOfMonth(ref), "yyyy-MM-dd"),
    to: format(endOfMonth(ref), "yyyy-MM-dd"),
  };
}

export function prevMonthRange(ref: Date = new Date()): PeriodRange {
  return monthRange(subMonths(ref, 1));
}

export function monthLabel(ref: Date): string {
  return format(ref, "MMM", { locale: ptBR });
}

// ============================================================
// Balance — the single canonical calculation
// Uses totalBalance from utils which correctly handles:
//   - credit expenses don't reduce balance until fatura is paid
//   - transfers move money between accounts
//   - fatura payment transactions reduce balance
// ============================================================

export function computeBalance(accounts: Account[], transactions: Transaction[]): number {
  return totalBalance(accounts, transactions);
}

// ============================================================
// Monthly flow series — shared by reports and dashboard
// ============================================================

export function monthlyFlowSeries(
  transactions: Transaction[],
  months = 6,
  ref: Date = new Date(),
): { month: string; income: number; expense: number }[] {
  const result: { month: string; income: number; expense: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = subMonths(ref, i);
    const range = monthRange(d);
    const mTx = transactions.filter((t) => inRange(t.date, range));
    result.push({
      month: monthLabel(d),
      income: sumIncome(mTx),
      expense: sumExpense(mTx),
    });
  }
  return result;
}

// ============================================================
// IMC — single calculation used by dashboard, reports, insights
// ============================================================

export function computeIMC(weightKg: number | null | undefined, heightCm: number | null | undefined): number | null {
  if (!weightKg || !heightCm) return null;
  return weightKg / Math.pow(heightCm / 100, 2);
}

// ============================================================
// Objective progress — single calculation used by reports and insights
// ============================================================

export function objectiveProgressPct(objective: Objective): number {
  return objectiveProgress(objective);
}

// ============================================================
// Planning summary — single entry point for budget health
// ============================================================

export function computePlanningHealth(
  config: BudgetConfig,
  transactions: Transaction[],
  categories: Category[],
  categoryMappings: Record<string, BudgetGroup>,
): { summaries: ReturnType<typeof computeGroupSummary>[]; messages: string[] } {
  if (config.monthlyIncome <= 0) return { summaries: [], messages: [] };
  const summaries = GROUP_ORDER.map((g) =>
    computeGroupSummary(g, config, transactions, categories, categoryMappings),
  );
  return { summaries, messages: healthMessages(summaries) };
}

// ============================================================
// Top categories — shared by reports and dashboard
// ============================================================

export function topCategories(
  transactions: Transaction[],
  categories: Category[],
  limit = 6,
): { name: string; amount: number; pct: number }[] {
  const expense = sumExpense(transactions);
  const catMap = new Map<string, number>();
  for (const t of transactions) {
    if (t.kind === "expense" && t.categoryId) {
      catMap.set(t.categoryId, (catMap.get(t.categoryId) ?? 0) + t.amount);
    }
  }
  return Array.from(catMap.entries())
    .map(([id, amount]) => {
      const cat = categories.find((c) => c.id === id);
      return {
        name: cat?.name ?? "Sem categoria",
        amount,
        pct: expense > 0 ? (amount / expense) * 100 : 0,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

// ============================================================
// Month transactions — filtered by calendar month (not rolling 30d)
// ============================================================

export function monthTransactions(transactions: Transaction[], ref: Date = new Date()): Transaction[] {
  const range = monthRange(ref);
  return transactions.filter((t) => inRange(t.date, range));
}

// ============================================================
// Delta calculation — shared by reports, dashboard, insights
// ============================================================

export interface MetricDelta {
  current: number;
  previous: number;
  delta: number;
  deltaPct: number;
  trend: "up" | "down" | "flat";
}

export function computeDelta(current: number, previous: number): MetricDelta {
  const delta = current - previous;
  const deltaPct = previous !== 0 ? (delta / Math.abs(previous)) * 100 : current > 0 ? 100 : 0;
  const trend: MetricDelta["trend"] = Math.abs(delta) < 0.01 ? "flat" : delta > 0 ? "up" : "down";
  return { current, previous, delta, deltaPct, trend };
}
