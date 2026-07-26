import { useCallback } from "react";
import { useFinanceLocal } from "../store";
import { useFinanceData } from "./use-finance-data";
import { materializeRecurrences } from "../utils";
import { useTransactions } from "./use-transactions";

/**
 * Combined hook that provides both Supabase-backed data (accounts, categories,
 * transactions) and local-only state (cards, tags, installments, recurrences,
 * favorites) in a single object, matching the shape that existing components
 * expect from the old useFinance() store.
 */
export function useFinance() {
  const local = useFinanceLocal();
  const data = useFinanceData();
  const tx = useTransactions();

  const runRecurrences = useCallback(async () => {
    const { newTx, updates } = materializeRecurrences(
      local.recurrences,
      data.transactions,
    );
    if (newTx.length === 0) return;

    for (const t of newTx) {
      const { toAccountId, tagIds, installmentPlanId, recurrenceId, createdAt, ...rest } = t;
      await tx.create(rest);
    }

    for (const [id, lastRun] of Object.entries(updates)) {
      local.updateRecurrence(id, { lastRun });
    }
  }, [local, data.transactions, tx]);

  return {
    // Supabase-backed
    accounts: data.accounts,
    categories: data.categories,
    transactions: data.transactions,
    loading: data.loading,
    error: data.error,

    addAccount: data.addAccount,
    updateAccount: data.updateAccount,
    removeAccount: data.removeAccount,
    addCategory: data.addCategory,
    updateCategory: data.updateCategory,
    removeCategory: data.removeCategory,
    addTransaction: data.addTransaction,
    updateTransaction: data.updateTransaction,
    removeTransaction: data.removeTransaction,

    // Supabase-backed (including tags)
    tags: data.tags,
    cards: local.cards,
    plans: local.plans,
    installments: local.installments,
    recurrences: local.recurrences,
    favorites: local.favorites,
    hydrated: local.hydrated,

    addTag: data.addTag,
    updateTag: data.updateTag,
    removeTag: data.removeTag,
    addCard: local.addCard,
    updateCard: local.updateCard,
    removeCard: local.removeCard,
    createInstallmentPlan: local.createInstallmentPlan,
    updateInstallment: local.updateInstallment,
    payInstallment: local.payInstallment,
    cancelFutureInstallments: local.cancelFutureInstallments,
    removeInstallmentPlan: local.removeInstallmentPlan,
    addRecurrence: local.addRecurrence,
    updateRecurrence: local.updateRecurrence,
    removeRecurrence: local.removeRecurrence,
    addFavorite: local.addFavorite,
    updateFavorite: local.updateFavorite,
    removeFavorite: local.removeFavorite,

    runRecurrences,
  };
}
