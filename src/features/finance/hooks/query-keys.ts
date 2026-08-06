/**
 * Central React Query key registry for all finance-related data.
 *
 * Every finance hook uses these keys and the `invalidateAllFinance` helper
 * so that any mutation (create / edit / delete transaction, account, card,
 * category, fatura) refreshes every dependent module automatically:
 *   Financeiro, Contas, Cartões, Planejamento, Dashboard, Patrimônio,
 *   Relatórios, Indicadores, Insights.
 *
 * Keys are hierarchical under a shared `["finance"]` parent so a single
 * `invalidateQueries({ queryKey: ["finance"] })` call refetches everything.
 */
export const FINANCE_KEYS = {
  all: ["finance"] as const,
  transactions: ["finance", "transactions"] as const,
  accounts: ["finance", "accounts"] as const,
  cards: ["finance", "cards"] as const,
  categories: ["finance", "categories"] as const,
  faturas: ["finance", "faturas"] as const,
  tags: ["finance", "tags"] as const,
};

/**
 * Every key that must be invalidated when underlying financial data changes.
 * Used by every mutation's `onSuccess` so a single create/edit/delete
 * refreshes all modules consistently.
 */
export const ALL_FINANCE_QUERY_KEYS = [
  FINANCE_KEYS.transactions,
  FINANCE_KEYS.accounts,
  FINANCE_KEYS.cards,
  FINANCE_KEYS.categories,
  FINANCE_KEYS.faturas,
  FINANCE_KEYS.tags,
] as const;
