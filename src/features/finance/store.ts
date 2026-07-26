import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Card,
  Favorite,
  Installment,
  InstallmentPlan,
  Recurrence,
} from "./types";
import { PALETTE, materializeRecurrences, uid } from "./utils";

/**
 * Local-only state for finance features that are NOT backed by Supabase tables
 * in the current schema: cards, tags, installment plans, installments,
 * recurrences, and favorites.
 *
 * Accounts, categories, and transactions are handled by React Query hooks
 * (see hooks/use-accounts.ts, hooks/use-categories.ts, hooks/use-transactions.ts).
 */
interface FinanceLocalState {
  cards: Card[];
  plans: InstallmentPlan[];
  installments: Installment[];
  recurrences: Recurrence[];
  favorites: Favorite[];
  hydrated: boolean;

  // cards
  addCard: (data: Omit<Card, "id" | "createdAt">) => void;
  updateCard: (id: string, data: Partial<Card>) => void;
  removeCard: (id: string) => void;

  // installments
  createInstallmentPlan: (plan: Omit<InstallmentPlan, "id" | "createdAt">) => void;
  updateInstallment: (id: string, data: Partial<Installment>) => void;
  payInstallment: (id: string) => void;
  cancelFutureInstallments: (planId: string, fromIndex: number) => void;
  removeInstallmentPlan: (planId: string) => void;

  // recurrences
  addRecurrence: (data: Omit<Recurrence, "id" | "createdAt">) => void;
  updateRecurrence: (id: string, data: Partial<Recurrence>) => void;
  removeRecurrence: (id: string) => void;

  // favorites
  addFavorite: (data: Omit<Favorite, "id" | "createdAt">) => void;
  updateFavorite: (id: string, data: Partial<Favorite>) => void;
  removeFavorite: (id: string) => void;
}

export const useFinanceLocal = create<FinanceLocalState>()(
  persist(
    (set, get) => ({
      cards: [],
      plans: [],
      installments: [],
      recurrences: [],
      favorites: [],
      hydrated: false,

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
      name: "atlas-finance-local-v1",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

// Re-export for convenience
export { materializeRecurrences, PALETTE };
