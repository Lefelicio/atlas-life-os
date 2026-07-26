import type { BudgetConfig, BudgetGroup } from "./types";
import { GROUP_ORDER, GROUP_LABELS } from "./types";
import type { Category, Transaction } from "@/features/finance/types";
import { currency, computePeriod, inRange } from "@/features/finance/utils";

export interface GroupSummary {
  group: BudgetGroup;
  budget: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "ok" | "warning" | "over";
}

export function computeGroupSpending(
  group: BudgetGroup,
  transactions: Transaction[],
  categories: Category[],
  categoryMappings: Record<string, BudgetGroup>,
): number {
  const groupCategoryIds = categories
    .filter((c) => categoryMappings[c.id] === group)
    .map((c) => c.id);

  return transactions
    .filter((t) => t.kind === "expense" && t.categoryId && groupCategoryIds.includes(t.categoryId))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function computeInvestmentContributions(
  transactions: Transaction[],
  categories: Category[],
  categoryMappings: Record<string, BudgetGroup>,
): number {
  const investCategoryIds = categories
    .filter((c) => categoryMappings[c.id] === "investimentos")
    .map((c) => c.id);

  return transactions
    .filter((t) => t.kind === "expense" && t.categoryId && investCategoryIds.includes(t.categoryId))
    .reduce((sum, t) => sum + t.amount, 0);
}

export function computeGroupSummary(
  group: BudgetGroup,
  config: BudgetConfig,
  transactions: Transaction[],
  categories: Category[],
  categoryMappings: Record<string, BudgetGroup>,
): GroupSummary {
  const budget = (config.monthlyIncome * config.percentages[group]) / 100;
  const spent = computeGroupSpending(group, transactions, categories, categoryMappings);
  const remaining = budget - spent;
  const percentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  let status: GroupSummary["status"] = "ok";
  if (percentage > 100) status = "over";
  else if (percentage >= 80) status = "warning";
  return { group, budget, spent, remaining, percentage, status };
}

export function monthTransactions(transactions: Transaction[]) {
  const range = computePeriod("30d");
  return transactions.filter((t) => inRange(t.date, range));
}

export function healthMessages(summaries: GroupSummary[]): string[] {
  const messages: string[] = [];
  for (const s of summaries) {
    if (s.budget <= 0) continue;
    const label = GROUP_LABELS[s.group];
    if (s.status === "over") {
      messages.push(`Você ultrapassou ${currency(Math.abs(s.remaining))} do orçamento ${label.toLowerCase()}.`);
    } else if (s.status === "warning") {
      messages.push(`Atenção: você usou ${s.percentage}% do orçamento ${label.toLowerCase()}.`);
    } else if (s.group === "investimentos") {
      if (s.remaining > 0) {
        messages.push(`Faltam ${currency(s.remaining)} para atingir sua meta de investimentos.`);
      } else {
        messages.push(`Você atingiu sua meta de investimentos.`);
      }
    } else {
      messages.push(`Você está dentro do orçamento ${label.toLowerCase()}.`);
    }
  }
  return messages;
}
