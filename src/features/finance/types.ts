export type TxKind = "income" | "expense" | "transfer";

export type PaymentMethod = "debit" | "credit" | "pix" | "cash" | "boleto";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  debit: "Débito",
  credit: "Crédito",
  pix: "PIX",
  cash: "Dinheiro",
  boleto: "Boleto",
};

export interface Account {
  id: string;
  name: string;
  color: string;
  initialBalance: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  kind: "income" | "expense";
  color: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Transaction {
  id: string;
  kind: TxKind;
  date: string; // ISO date (yyyy-mm-dd)
  accountId: string;
  toAccountId?: string; // for transfers
  categoryId?: string; // not required for transfers
  description: string;
  amount: number; // positive number
  notes?: string;
  tagIds?: string[];
  cardId?: string; // optional link to card (for cash-back tracking, receipts, etc.)
  installmentPlanId?: string; // when this tx was materialized from a plan
  recurrenceId?: string; // when materialized from a recurring rule
  paymentMethod?: PaymentMethod; // defaults to "debit" for old transactions
  faturaId?: string; // when belongs to a paid invoice
  competenceMonth?: string; // e.g. "2026-07" for credit billing cycle
  createdAt: string;
}

export type CardBrand =
  | "Visa"
  | "Mastercard"
  | "Elo"
  | "American Express"
  | "Hipercard"
  | "Outros";

export interface Card {
  id: string;
  name: string;
  bank: string;
  brand: CardBrand;
  limit: number;
  color: string;
  closingDay: number; // 1..31
  dueDay: number; // 1..31
  active: boolean;
  notes?: string;
  accountId?: string; // links card to its parent account
  createdAt: string;
}

export interface InstallmentPlan {
  id: string;
  cardId: string;
  description: string;
  categoryId?: string;
  totalAmount: number;
  installments: number; // total count
  firstDate: string; // ISO date of installment 1
  tagIds?: string[];
  createdAt: string;
}

export type InstallmentStatus = "pending" | "paid" | "canceled";

export interface Installment {
  id: string;
  planId: string;
  index: number; // 1..N
  dueDate: string; // ISO
  amount: number;
  status: InstallmentStatus;
}

export type RecurrenceFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "bimonthly"
  | "quarterly"
  | "semiannual"
  | "yearly"
  | "custom";

export const RECURRENCE_FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  daily: "Diário",
  weekly: "Semanal",
  biweekly: "Quinzenal",
  monthly: "Mensal",
  bimonthly: "Bimestral",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  yearly: "Anual",
  custom: "Personalizado",
};

export interface Recurrence {
  id: string;
  kind: "income" | "expense" | "transfer";
  description: string;
  amount: number;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  tagIds?: string[];
  frequency: RecurrenceFrequency;
  intervalDays?: number; // for custom
  firstDate: string; // ISO
  endDate?: string; // ISO optional
  lastRun?: string; // ISO date already materialized
  active: boolean;
  paymentMethod?: PaymentMethod;
  cardId?: string;
  createdAt: string;
}

export interface Favorite {
  id: string;
  label: string;
  kind: "income" | "expense" | "transfer";
  accountId?: string;
  toAccountId?: string;
  categoryId?: string;
  amount?: number;
  description?: string;
  tagIds?: string[];
  createdAt: string;
}

export type FaturaStatus = "open" | "paid";

export interface Fatura {
  id: string;
  cardId: string;
  competenceMonth: string; // "2026-07"
  dueDate?: string;
  closingDate?: string;
  amount: number;
  status: FaturaStatus;
  paidAt?: string;
  paidFromAccountId?: string;
  paidAmount: number;
  createdAt: string;
}

export type PeriodKey = "today" | "7d" | "30d" | "90d" | "year" | "custom";

export interface PeriodRange {
  key: PeriodKey;
  from: string;
  to: string;
}
