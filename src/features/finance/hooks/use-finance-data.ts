import { useCallback } from "react";
import { useAccounts } from "./use-accounts";
import { useCategories } from "./use-categories";
import { useTransactions } from "./use-transactions";
import { useTags } from "./use-tags";
import type { Account, Category, Transaction, Tag } from "../types";

export function useFinanceData() {
  const accountsHook = useAccounts();
  const categoriesHook = useCategories();
  const transactionsHook = useTransactions();
  const tagsHook = useTags();

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

  return {
    accounts: accountsHook.accounts,
    categories: categoriesHook.categories,
    transactions: transactionsHook.transactions,
    tags: tagsHook.tags,
    loading: accountsHook.loading || categoriesHook.loading || transactionsHook.loading || tagsHook.loading,
    error: accountsHook.error || categoriesHook.error || transactionsHook.error || tagsHook.error,

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

    refreshAll: () => {
      accountsHook.refresh();
      categoriesHook.refresh();
      transactionsHook.refresh();
      tagsHook.refresh();
    },
  };
}
