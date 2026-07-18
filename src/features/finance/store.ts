import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Account, Category, Transaction } from "./types";
import { PALETTE, uid } from "./utils";

interface FinanceState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  hydrated: boolean;

  addAccount: (data: Omit<Account, "id" | "createdAt">) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  removeAccount: (id: string) => void;

  addCategory: (data: Omit<Category, "id">) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  removeCategory: (id: string) => void;

  addTransaction: (data: Omit<Transaction, "id" | "createdAt">) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
}

const seedCategories = (): Category[] => [
  { id: uid(), name: "Salário", kind: "income", color: PALETTE[5] },
  { id: uid(), name: "Freelance", kind: "income", color: PALETTE[6] },
  { id: uid(), name: "Investimentos", kind: "income", color: PALETTE[1] },
  { id: uid(), name: "Alimentação", kind: "expense", color: PALETTE[4] },
  { id: uid(), name: "Transporte", kind: "expense", color: PALETTE[0] },
  { id: uid(), name: "Moradia", kind: "expense", color: PALETTE[7] },
  { id: uid(), name: "Lazer", kind: "expense", color: PALETTE[2] },
  { id: uid(), name: "Saúde", kind: "expense", color: PALETTE[9] },
  { id: uid(), name: "Educação", kind: "expense", color: PALETTE[8] },
  { id: uid(), name: "Outros", kind: "expense", color: PALETTE[3] },
];

export const useFinance = create<FinanceState>()(
  persist(
    (set) => ({
      accounts: [],
      categories: seedCategories(),
      transactions: [],
      hydrated: false,

      addAccount: (data) =>
        set((s) => ({
          accounts: [
            ...s.accounts,
            { ...data, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateAccount: (id, data) =>
        set((s) => ({
          accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),
      removeAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          transactions: s.transactions.filter(
            (t) => t.accountId !== id && t.toAccountId !== id,
          ),
        })),

      addCategory: (data) =>
        set((s) => ({ categories: [...s.categories, { ...data, id: uid() }] })),
      updateCategory: (id, data) =>
        set((s) => ({
          categories: s.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      removeCategory: (id) =>
        set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      addTransaction: (data) =>
        set((s) => ({
          transactions: [
            { ...data, id: uid(), createdAt: new Date().toISOString() },
            ...s.transactions,
          ],
        })),
      updateTransaction: (id, data) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
        })),
      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
    }),
    {
      name: "atlas-finance-v1",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
