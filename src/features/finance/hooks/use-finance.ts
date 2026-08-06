import { useCallback } from "react";
import { useFinanceLocal } from "../store";
import { useFinanceData } from "./use-finance-data";
import { materializeRecurrences } from "../utils";
import { useTransactions } from "./use-transactions";

/**
 * Combined hook that provides both Supabase-backed data (accounts, categories,
 * transactions, cards, faturas, tags) and local-only state (installments,
 * recurrences, favorites) in a single object.
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
      await tx.create(t);
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
    tags: data.tags,
    cards: data.cards,
    faturas: data.faturas,
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
    addTag: data.addTag,
    updateTag: data.updateTag,
    removeTag: data.removeTag,
    addCard: data.addCard,
    updateCard: data.updateCard,
    removeCard: data.removeCard,
    payFatura: data.payFatura,
    upsertFatura: data.upsertFatura,

    // Local-only (installments, recurrences, favorites)
    plans: local.plans,
    installments: local.installments,
    recurrences: local.recurrences,
    favorites: local.favorites,
    hydrated: local.hydrated,

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
