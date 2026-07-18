import {
  endOfDay,
  endOfYear,
  format,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfYear,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Account, PeriodKey, PeriodRange, Transaction } from "./types";

export const currency = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);

export const formatDate = (iso: string) =>
  format(parseISO(iso), "dd MMM yyyy", { locale: ptBR });

export const formatShortDate = (iso: string) =>
  format(parseISO(iso), "dd/MM", { locale: ptBR });

export const todayISO = () => format(new Date(), "yyyy-MM-dd");

export function computePeriod(
  key: PeriodKey,
  custom?: { from: string; to: string },
): PeriodRange {
  const now = new Date();
  const to = format(now, "yyyy-MM-dd");
  switch (key) {
    case "today":
      return { key, from: to, to };
    case "7d":
      return { key, from: format(subDays(now, 6), "yyyy-MM-dd"), to };
    case "30d":
      return { key, from: format(subDays(now, 29), "yyyy-MM-dd"), to };
    case "90d":
      return { key, from: format(subDays(now, 89), "yyyy-MM-dd"), to };
    case "year":
      return {
        key,
        from: format(startOfYear(now), "yyyy-MM-dd"),
        to: format(endOfYear(now), "yyyy-MM-dd"),
      };
    case "custom":
      return { key, from: custom?.from ?? to, to: custom?.to ?? to };
  }
}

export function inRange(iso: string, range: PeriodRange) {
  const d = parseISO(iso);
  return isWithinInterval(d, {
    start: startOfDay(parseISO(range.from)),
    end: endOfDay(parseISO(range.to)),
  });
}

export function accountBalance(account: Account, txs: Transaction[]) {
  let bal = account.initialBalance;
  for (const t of txs) {
    if (t.kind === "income" && t.accountId === account.id) bal += t.amount;
    else if (t.kind === "expense" && t.accountId === account.id) bal -= t.amount;
    else if (t.kind === "transfer") {
      if (t.accountId === account.id) bal -= t.amount;
      if (t.toAccountId === account.id) bal += t.amount;
    }
  }
  return bal;
}

export function totalBalance(accounts: Account[], txs: Transaction[]) {
  return accounts.reduce((s, a) => s + accountBalance(a, txs), 0);
}

export function sumIncome(txs: Transaction[]) {
  return txs.filter((t) => t.kind === "income").reduce((s, t) => s + t.amount, 0);
}

export function sumExpense(txs: Transaction[]) {
  return txs.filter((t) => t.kind === "expense").reduce((s, t) => s + t.amount, 0);
}

export const PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#6366f1",
  "#f43f5e",
  "#84cc16",
];

export const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36));
