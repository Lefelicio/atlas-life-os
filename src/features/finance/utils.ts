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
  Fatura,
  Installment,
  PaymentMethod,
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
    else if (t.kind === "expense" && t.accountId === account.id) {
      // Credit expenses do NOT reduce account balance until the invoice is paid.
      // The invoice payment itself is a separate "Pagamento da Fatura" transaction.
      if (t.paymentMethod === "credit" && !t.faturaId) continue;
      bal -= t.amount;
    } else if (t.kind === "transfer") {
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
    case "daily":
      return format(addDays(d, 1), "yyyy-MM-dd");
    case "weekly":
      return format(addWeeks(d, 1), "yyyy-MM-dd");
    case "biweekly":
      return format(addDays(d, 15), "yyyy-MM-dd");
    case "monthly":
      return format(addMonths(d, 1), "yyyy-MM-dd");
    case "bimonthly":
      return format(addMonths(d, 2), "yyyy-MM-dd");
    case "quarterly":
      return format(addMonths(d, 3), "yyyy-MM-dd");
    case "semiannual":
      return format(addMonths(d, 6), "yyyy-MM-dd");
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
        paymentMethod: r.paymentMethod,
        cardId: r.cardId,
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

// ============================================================
// Credit card invoice (fatura) helpers
// ============================================================

/**
 * Compute the competence month for a credit purchase.
 * If the purchase date is before the closing day, it goes on the current month's invoice.
 * If it's on or after the closing day, it rolls to the next month's invoice.
 */
export function computeCompetenceMonth(date: string, closingDay: number): string {
  const d = parseISO(date);
  const day = d.getDate();
  if (day >= closingDay) {
    return format(addMonths(d, 1), "yyyy-MM");
  }
  return format(d, "yyyy-MM");
}

/**
 * Compute the due date for a given competence month and due day.
 */
export function computeFaturaDueDate(competenceMonth: string, dueDay: number): string {
  const [year, month] = competenceMonth.split("-").map(Number);
  const d = new Date(year, month, dueDay);
  return format(d, "yyyy-MM-dd");
}

/**
 * Compute the closing date for a competence month.
 */
export function computeFaturaClosingDate(competenceMonth: string, closingDay: number): string {
  const [year, month] = competenceMonth.split("-").map(Number);
  const d = new Date(year, month - 1, closingDay);
  return format(d, "yyyy-MM-dd");
}

/**
 * Format a competence month as a readable label, e.g. "2026-07" -> "Julho 2026".
 */
export function formatCompetenceMonth(competenceMonth: string): string {
  const [year, month] = competenceMonth.split("-").map(Number);
  const d = new Date(year, month - 1, 1);
  return format(d, "MMMM 'de' yyyy", { locale: ptBR });
}

/**
 * Group credit transactions by competence month for a given card.
 * Returns sorted list of { month, transactions, total } from newest to oldest.
 */
export function groupCreditByCompetence(
  transactions: Transaction[],
  cardId: string,
): { month: string; transactions: Transaction[]; total: number }[] {
  const cardTxs = transactions.filter(
    (t) => t.paymentMethod === "credit" && t.cardId === cardId && t.kind === "expense",
  );
  const map = new Map<string, Transaction[]>();
  for (const t of cardTxs) {
    const month = t.competenceMonth ?? format(parseISO(t.date), "yyyy-MM");
    if (!map.has(month)) map.set(month, []);
    map.get(month)!.push(t);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, txs]) => ({
      month,
      transactions: txs.sort((a, b) => b.date.localeCompare(a.date)),
      total: txs.reduce((s, t) => s + t.amount, 0),
    }));
}

/**
 * Compute the total open (unpaid) invoices across all cards.
 */
export function totalOpenFaturas(faturas: Fatura[]): number {
  return faturas
    .filter((f) => f.status === "open")
    .reduce((s, f) => s + f.amount, 0);
}

/**
 * Compute the total available credit limit across all active cards.
 */
export function totalAvailableLimit(cards: Card[], transactions: Transaction[]): number {
  let used = 0;
  let limit = 0;
  for (const c of cards) {
    if (!c.active) continue;
    limit += c.limit;
    const cardTxs = transactions.filter(
      (t) => t.paymentMethod === "credit" && t.cardId === c.id && t.kind === "expense" && !t.faturaId,
    );
    used += cardTxs.reduce((s, t) => s + t.amount, 0);
  }
  return Math.max(0, limit - used);
}

/**
 * Find the next upcoming invoice due date across all cards.
 */
export function nextFaturaDueDate(
  cards: Card[],
  faturas: Fatura[],
): { card: Card; dueDate: string } | null {
  const today = new Date();
  const open = faturas.filter((f) => f.status === "open" && f.dueDate);
  if (open.length === 0) {
    // Compute from card due days
    const upcoming = cards
      .filter((c) => c.active)
      .map((c) => {
        const d = new Date(today.getFullYear(), today.getMonth(), c.dueDay);
        const next = isBefore(d, today) ? addMonths(d, 1) : d;
        return { card: c, dueDate: format(next, "yyyy-MM-dd") };
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return upcoming[0] ?? null;
  }
  const sorted = open
    .filter((f) => isAfter(parseISO(f.dueDate!), today))
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  if (sorted.length === 0) return null;
  const card = cards.find((c) => c.id === sorted[0].cardId);
  return card ? { card, dueDate: sorted[0].dueDate! } : null;
}
