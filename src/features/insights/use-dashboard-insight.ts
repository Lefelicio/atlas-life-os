import { useMemo } from "react";
import type { InsightMessage } from "@/components/insight";
import type { Account, Transaction } from "@/features/finance/types";
import { sumExpense, sumIncome, todayISO } from "@/features/finance/utils";

interface Input {
  accounts: Account[];
  transactions: Transaction[];
  monthly: Transaction[];
}

/**
 * Rule-based insight generator. Swap the body for an AI call later —
 * the return shape (`InsightMessage`) is intentionally stable so the UI
 * doesn't need to change when we plug in Lovable AI Gateway.
 *
 * Future signature idea:
 *   useAiInsight({ accounts, transactions, monthly }) => InsightMessage
 */
export function useDashboardInsight({
  accounts,
  transactions,
  monthly,
}: Input): InsightMessage {
  return useMemo<InsightMessage>(() => {
    if (accounts.length === 0) {
      return {
        id: "no-accounts",
        text: "Cadastre sua primeira conta para começar.",
        tone: "attention",
        source: "rule",
      };
    }
    if (transactions.length === 0) {
      return {
        id: "no-tx",
        text: "Registre seu primeiro lançamento e o Atlas cuida do resto.",
        tone: "attention",
        source: "rule",
      };
    }

    const today = todayISO();
    const todays = transactions.filter((t) => t.date === today);
    if (todays.length === 0) {
      return {
        id: "no-tx-today",
        text: "Você ainda não registrou movimentações hoje.",
        tone: "neutral",
        source: "rule",
      };
    }

    const income = sumIncome(monthly);
    const expense = sumExpense(monthly);
    if (income > 0 && expense <= income * 0.6) {
      return {
        id: "healthy-month",
        text: "Seu mês começou muito bem — despesas sob controle.",
        tone: "positive",
        source: "rule",
      };
    }
    if (expense > income && income > 0) {
      return {
        id: "over-budget",
        text: "Suas despesas passaram das receitas neste período.",
        tone: "attention",
        source: "rule",
      };
    }

    return {
      id: "keep-going",
      text: "Continue registrando suas movimentações.",
      tone: "neutral",
      source: "rule",
    };
  }, [accounts.length, transactions, monthly]);
}
