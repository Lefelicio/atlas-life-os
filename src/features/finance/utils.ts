import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  endOfDay,
  endOfYear,
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type {
  Account,
  Card,
  Installment,
  PeriodKey,
  PeriodRange,
  Recurrence,
  Transaction,
} from "./types";

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

// ============ Cards ============

export function cardUsage(card: Card, installments: Installment[], plans: { id: string; cardId: string }[]) {
  const planIds = new Set(plans.filter((p) => p.cardId === card.id).map((p) => p.id));
  const used = installments
    .filter((i) => planIds.has(i.planId) && i.status !== "canceled" && i.status !== "paid")
    .reduce((s, i) => s + i.amount, 0);
  return { used, available: Math.max(0, card.limit - used) };
}

// ============ Recurrences ============

function nextDate(iso: string, r: Recurrence): string {
  const d = parseISO(iso);
  switch (r.frequency) {
    case "weekly":
      return format(addWeeks(d, 1), "yyyy-MM-dd");
    case "monthly":
      return format(addMonths(d, 1), "yyyy-MM-dd");
    case "yearly":
      return format(addYears(d, 1), "yyyy-MM-dd");
    case "custom":
      return format(addDays(d, Math.max(1, r.intervalDays ?? 1)), "yyyy-MM-dd");
  }
}

export function materializeRecurrences(
  recurrences: Recurrence[],
  _existing: Transaction[],
): { newTx: Transaction[]; updates: Record<string, string> } {
  const today = new Date();
  const newTx: Transaction[] = [];
  const updates: Record<string, string> = {};
  const nowIso = new Date().toISOString();

  for (const r of recurrences) {
    if (!r.active) continue;
    let cursor = r.lastRun ? nextDate(r.lastRun, r) : r.firstDate;
    let guard = 0;
    while (
      !isAfter(parseISO(cursor), today) &&
      (!r.endDate || !isAfter(parseISO(cursor), parseISO(r.endDate))) &&
      guard < 500
    ) {
      newTx.push({
        id: uid(),
        kind: r.kind,
        date: cursor,
        accountId: r.accountId,
        toAccountId: r.toAccountId,
        categoryId: r.categoryId,
        description: r.description,
        amount: r.amount,
        tagIds: r.tagIds,
        recurrenceId: r.id,
        createdAt: nowIso,
      });
      updates[r.id] = cursor;
      cursor = nextDate(cursor, r);
      guard++;
    }
  }
  return { newTx, updates };
}

// ============ Quick Add parser ============

export interface ParsedQuick {
  kind: "income" | "expense";
  amount: number;
  description: string;
  categoryHint?: string;
}

const INCOME_HINTS = [
  "salário",
  "salario",
  "receita",
  "freela",
  "freelance",
  "bônus",
  "bonus",
  "pix recebido",
  "reembolso",
  "vendi",
  "venda",
  "rendimento",
  "dividendo",
];

const CATEGORY_HINTS: Record<string, string[]> = {
  Alimentação: [
    "pizza",
    "mercado",
    "restaurante",
    "almoço",
    "jantar",
    "lanche",
    "café",
    "ifood",
    "supermercado",
    "padaria",
  ],
  Transporte: ["uber", "99", "taxi", "combustível", "gasolina", "ônibus", "metrô", "estacionamento"],
  Moradia: ["aluguel", "condomínio", "luz", "água", "gás", "internet"],
  Lazer: ["cinema", "show", "bar", "netflix", "spotify", "steam", "jogo", "viagem"],
  Saúde: ["farmácia", "remédio", "consulta", "médico", "academia", "dentista"],
  Educação: ["curso", "livro", "faculdade", "escola", "udemy"],
  Salário: ["salário", "salario"],
  Freelance: ["freela", "freelance"],
};

export function parseQuickAdd(input: string): ParsedQuick | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // extract last number (supports comma or dot)
  const match = trimmed.match(/(-?\d+(?:[.,]\d+)?)(?!.*\d)/);
  if (!match) return null;
  const amount = Math.abs(Number(match[1].replace(",", ".")));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const description = (trimmed.slice(0, match.index).trim() +
    " " +
    trimmed.slice((match.index ?? 0) + match[0].length).trim())
    .trim()
    .replace(/\s+/g, " ");
  const lower = trimmed.toLowerCase();
  const isIncome = INCOME_HINTS.some((h) => lower.includes(h));
  let categoryHint: string | undefined;
  for (const [cat, hints] of Object.entries(CATEGORY_HINTS)) {
    if (hints.some((h) => lower.includes(h))) {
      categoryHint = cat;
      break;
    }
  }
  return {
    kind: isIncome ? "income" : "expense",
    amount,
    description: description || (categoryHint ?? "Lançamento"),
    categoryHint,
  };
}

// ============ Smart history suggestion ============

export interface HistorySuggestion {
  accountId?: string;
  categoryId?: string;
  amount?: number;
  tagIds?: string[];
  notes?: string;
}

export function suggestFromHistory(
  query: string,
  transactions: Transaction[],
): HistorySuggestion | null {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return null;
  const match = transactions.find(
    (t) => t.description && t.description.toLowerCase().includes(q),
  );
  if (!match) return null;
  return {
    accountId: match.accountId,
    categoryId: match.categoryId,
    amount: match.amount,
    tagIds: match.tagIds,
    notes: match.notes,
  };
}

// ============ Dashboard helpers ============

export function currentMonthRange(): PeriodRange {
  const now = new Date();
  return {
    key: "custom",
    from: format(startOfMonth(now), "yyyy-MM-dd"),
    to: format(now, "yyyy-MM-dd"),
  };
}

export function upcomingDueDates(cards: Card[], within = 14) {
  const today = new Date();
  const soon = addDays(today, within);
  return cards
    .filter((c) => c.active)
    .map((c) => {
      const d = new Date(today.getFullYear(), today.getMonth(), c.dueDay);
      const next = isBefore(d, today) ? addMonths(d, 1) : d;
      return { card: c, dueDate: next };
    })
    .filter((x) => isBefore(x.dueDate, soon))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function monthInstallments(
  installments: Installment[],
  ref = new Date(),
) {
  const y = ref.getFullYear();
  const m = ref.getMonth();
  return installments.filter((i) => {
    const d = parseISO(i.dueDate);
    return d.getFullYear() === y && d.getMonth() === m && i.status !== "canceled";
  });
}
