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
  createdAt: string;
}

export type PeriodKey = "today" | "7d" | "30d" | "90d" | "year" | "custom";

export interface PeriodRange {
  key: PeriodKey;
  from: string; // ISO date
  to: string; // ISO date
}
