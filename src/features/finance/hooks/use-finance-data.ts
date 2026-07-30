import { useCallback } from "react";
import { useAccounts } from "./use-accounts";
import { useCategories } from "./use-categories";
import { useTransactions } from "./use-transactions";
import { useTags } from "./use-tags";
import { useCards } from "./use-cards";
import { useFaturas } from "./use-faturas";
import type { Account, Card, Category, Fatura, Transaction, Tag } from "../types";

export function useFinanceData() {
  const accountsHook = useAccounts();
  const categoriesHook = useCategories();
  const transactionsHook = useTransactions();
  const tagsHook = useTags();
  const cardsHook = useCards();
  const faturasHook = useFaturas();

  const addAccount = useCallback(
    async (data: Omit<Account, "id" | "createdAt">) => {
      await accountsHook.create(data);
    },
    [accountsHook],
  );

  const updateAccount = useCallback(
    async (id: string, data: Partial<Account>) => {
      await accountsHook.update({ id, data });
    },
    [accountsHook],
  );

  const removeAccount = useCallback(
    async (id: string) => {
      await accountsHook.delete(id);
    },
    [accountsHook],
  );

  const addCategory = useCallback(
    async (data: Omit<Category, "id">) => {
      await categoriesHook.create(data);
    },
    [categoriesHook],
  );

  const updateCategory = useCallback(
    async (id: string, data: Partial<Category>) => {
      await categoriesHook.update({ id, data });
    },
    [categoriesHook],
  );

  const removeCategory = useCallback(
    async (id: string) => {
      await categoriesHook.delete(id);
    },
    [categoriesHook],
  );

  const addTransaction = useCallback(
    async (data: Omit<Transaction, "id" | "createdAt">) => {
      await transactionsHook.create(data);
    },
    [transactionsHook],
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<Transaction>) => {
      await transactionsHook.update({ id, data });
    },
    [transactionsHook],
  );

  const removeTransaction = useCallback(
    async (id: string) => {
      await transactionsHook.delete(id);
    },
    [transactionsHook],
  );

  const addTag = useCallback(
    async (data: Omit<Tag, "id">) => {
      return await tagsHook.addTag(data);
    },
    [tagsHook],
  );

  const updateTag = useCallback(
    async (id: string, data: Partial<Tag>) => {
      await tagsHook.updateTag({ id, data });
    },
    [tagsHook],
  );

  const removeTag = useCallback(
    async (id: string) => {
      await tagsHook.removeTag(id);
    },
    [tagsHook],
  );

  const addCard = useCallback(
    async (data: Omit<Card, "id" | "createdAt">) => {
      await cardsHook.create(data);
    },
    [cardsHook],
  );

  const updateCard = useCallback(
    async (id: string, data: Partial<Card>) => {
      await cardsHook.update({ id, data });
    },
    [cardsHook],
  );

  const removeCard = useCallback(
    async (id: string) => {
      await cardsHook.delete(id);
    },
    [cardsHook],
  );

  return {
    accounts: accountsHook.accounts,
    categories: categoriesHook.categories,
    transactions: transactionsHook.transactions,
    tags: tagsHook.tags,
    cards: cardsHook.cards,
    faturas: faturasHook.faturas,
    loading: accountsHook.loading || categoriesHook.loading || transactionsHook.loading || tagsHook.loading || cardsHook.loading || faturasHook.loading,
    error: accountsHook.error || categoriesHook.error || transactionsHook.error || tagsHook.error || cardsHook.error || faturasHook.error,

    addAccount,
    updateAccount,
    removeAccount,
    addCategory,
    updateCategory,
    removeCategory,
    addTransaction,
    updateTransaction,
    removeTransaction,
    addTag,
    updateTag,
    removeTag,
    addCard,
    updateCard,
    removeCard,
    payFatura: faturasHook.payFatura,
    upsertFatura: faturasHook.upsertFatura,

    refreshAll: () => {
      accountsHook.refresh();
      categoriesHook.refresh();
      transactionsHook.refresh();
      tagsHook.refresh();
      cardsHook.refresh();
      faturasHook.refresh();
    },
  };
}
