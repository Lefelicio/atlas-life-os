import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Account,
  Card,
  Category,
  Favorite,
  Installment,
  InstallmentPlan,
  Recurrence,
  Tag,
  Transaction,
} from "./types";
import { PALETTE, materializeRecurrences, uid } from "./utils";

interface FinanceState {
  accounts: Account[];
  categories: Category[];
  tags: Tag[];
  transactions: Transaction[];
  cards: Card[];
  plans: InstallmentPlan[];
  installments: Installment[];
  recurrences: Recurrence[];
  favorites: Favorite[];
  hydrated: boolean;

  // accounts
  addAccount: (data: Omit<Account, "id" | "createdAt">) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  removeAccount: (id: string) => void;

  // categories
  addCategory: (data: Omit<Category, "id">) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  removeCategory: (id: string) => void;

  // tags
  addTag: (data: Omit<Tag, "id">) => Tag;
  updateTag: (id: string, data: Partial<Tag>) => void;
  removeTag: (id: string) => void;

  // transactions
  addTransaction: (data: Omit<Transaction, "id" | "createdAt">) => Transaction;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;

  // cards
  addCard: (data: Omit<Card, "id" | "createdAt">) => void;
  updateCard: (id: string, data: Partial<Card>) => void;
  removeCard: (id: string) => void;

  // installments
  createInstallmentPlan: (
    plan: Omit<InstallmentPlan, "id" | "createdAt">,
  ) => void;
  updateInstallment: (id: string, data: Partial<Installment>) => void;
  payInstallment: (id: string) => void;
  cancelFutureInstallments: (planId: string, fromIndex: number) => void;
  removeInstallmentPlan: (planId: string) => void;

  // recurrences
  addRecurrence: (data: Omit<Recurrence, "id" | "createdAt">) => void;
  updateRecurrence: (id: string, data: Partial<Recurrence>) => void;
  removeRecurrence: (id: string) => void;
  runRecurrences: () => void;

  // favorites
  addFavorite: (data: Omit<Favorite, "id" | "createdAt">) => void;
  updateFavorite: (id: string, data: Partial<Favorite>) => void;
  removeFavorite: (id: string) => void;
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
    (set, get) => ({
      accounts: [],
      categories: seedCategories(),
      tags: [],
      transactions: [],
      cards: [],
      plans: [],
      installments: [],
      recurrences: [],
      favorites: [],
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

      addTag: (data) => {
        const tag: Tag = { ...data, id: uid() };
        set((s) => ({ tags: [...s.tags, tag] }));
        return tag;
      },
      updateTag: (id, data) =>
        set((s) => ({
          tags: s.tags.map((t) => (t.id === id ? { ...t, ...data } : t)),
        })),
      removeTag: (id) =>
        set((s) => ({
          tags: s.tags.filter((t) => t.id !== id),
          transactions: s.transactions.map((t) => ({
            ...t,
            tagIds: t.tagIds?.filter((x) => x !== id),
          })),
        })),

      addTransaction: (data) => {
        const tx: Transaction = {
          ...data,
          id: uid(),
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ transactions: [tx, ...s.transactions] }));
        return tx;
      },
      updateTransaction: (id, data) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
        })),
      removeTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

      addCard: (data) =>
        set((s) => ({
          cards: [
            ...s.cards,
            { ...data, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateCard: (id, data) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      removeCard: (id) =>
        set((s) => ({
          cards: s.cards.filter((c) => c.id !== id),
          plans: s.plans.filter((p) => p.cardId !== id),
          installments: s.installments.filter(
            (i) => !s.plans.some((p) => p.id === i.planId && p.cardId === id),
          ),
        })),

      createInstallmentPlan: (plan) => {
        const id = uid();
        const created: InstallmentPlan = {
          ...plan,
          id,
          createdAt: new Date().toISOString(),
        };
        const per = Math.round((plan.totalAmount / plan.installments) * 100) / 100;
        const first = new Date(plan.firstDate);
        const installments: Installment[] = Array.from(
          { length: plan.installments },
          (_, i) => {
            const d = new Date(first);
            d.setMonth(d.getMonth() + i);
            // adjust last parcel to compensate rounding
            const amount =
              i === plan.installments - 1
                ? Math.round((plan.totalAmount - per * (plan.installments - 1)) * 100) /
                  100
                : per;
            return {
              id: uid(),
              planId: id,
              index: i + 1,
              dueDate: d.toISOString().slice(0, 10),
              amount,
              status: "pending",
            };
          },
        );
        set((s) => ({
          plans: [created, ...s.plans],
          installments: [...s.installments, ...installments],
        }));
      },
      updateInstallment: (id, data) =>
        set((s) => ({
          installments: s.installments.map((i) =>
            i.id === id ? { ...i, ...data } : i,
          ),
        })),
      payInstallment: (id) =>
        set((s) => ({
          installments: s.installments.map((i) =>
            i.id === id ? { ...i, status: "paid" } : i,
          ),
        })),
      cancelFutureInstallments: (planId, fromIndex) =>
        set((s) => ({
          installments: s.installments.map((i) =>
            i.planId === planId && i.index >= fromIndex && i.status === "pending"
              ? { ...i, status: "canceled" }
              : i,
          ),
        })),
      removeInstallmentPlan: (planId) =>
        set((s) => ({
          plans: s.plans.filter((p) => p.id !== planId),
          installments: s.installments.filter((i) => i.planId !== planId),
        })),

      addRecurrence: (data) =>
        set((s) => ({
          recurrences: [
            ...s.recurrences,
            { ...data, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateRecurrence: (id, data) =>
        set((s) => ({
          recurrences: s.recurrences.map((r) =>
            r.id === id ? { ...r, ...data } : r,
          ),
        })),
      removeRecurrence: (id) =>
        set((s) => ({
          recurrences: s.recurrences.filter((r) => r.id !== id),
        })),
      runRecurrences: () => {
        const { recurrences, transactions } = get();
        const result = materializeRecurrences(recurrences, transactions);
        if (result.newTx.length === 0) return;
        set((s) => ({
          transactions: [...result.newTx, ...s.transactions],
          recurrences: s.recurrences.map((r) => {
            const upd = result.updates[r.id];
            return upd ? { ...r, lastRun: upd } : r;
          }),
        }));
      },

      addFavorite: (data) =>
        set((s) => ({
          favorites: [
            ...s.favorites,
            { ...data, id: uid(), createdAt: new Date().toISOString() },
          ],
        })),
      updateFavorite: (id, data) =>
        set((s) => ({
          favorites: s.favorites.map((f) => (f.id === id ? { ...f, ...data } : f)),
        })),
      removeFavorite: (id) =>
        set((s) => ({ favorites: s.favorites.filter((f) => f.id !== id) })),
    }),
    {
      name: "atlas-finance-v2",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hydrated = true;
          // Try to materialize pending recurrences on load
          setTimeout(() => state.runRecurrences?.(), 0);
        }
      },
    },
  ),
);
