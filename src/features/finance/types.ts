export type TxKind = "income" | "expense" | "transfer";

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

export type RecurrenceFrequency = "weekly" | "monthly" | "yearly" | "custom";

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

export type PeriodKey = "today" | "7d" | "30d" | "90d" | "year" | "custom";

export interface PeriodRange {
  key: PeriodKey;
  from: string;
  to: string;
}
