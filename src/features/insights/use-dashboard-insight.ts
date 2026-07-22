import { useMemo } from "react";
import type { InsightMessage } from "@/components/insight";
import type { Account, Transaction } from "@/features/finance/types";
import type { Goal } from "@/features/goals/types";
import {
  sumExpense,
  sumIncome,
  todayISO,
  currency,
  currentMonthRange,
  inRange,
} from "@/features/finance/utils";
import { goalRemaining, goalProgress } from "@/features/goals/store";

interface Input {
  accounts: Account[];
  transactions: Transaction[];
  monthly: Transaction[];
  goals: Goal[];
}

/**
 * Rule-based insight generator. Returns a single InsightMessage.
 *
 * The return shape is intentionally stable so the UI doesn't need to
 * change when we plug in Lovable AI Gateway — just swap the body for
 * an async AI call returning the same `InsightMessage`.
 *
 * Future: useAiInsight({ accounts, transactions, monthly, goals })
 */
export function useDashboardInsight({
  accounts,
  transactions,
  monthly,
  goals,
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

    // Primary goal insight
    const activeGoals = goals.filter((g) => !g.archived);
    const primaryGoal = activeGoals.find((g) => g.isPrimary) ?? activeGoals[0];
    if (primaryGoal) {
      const remaining = goalRemaining(primaryGoal);
      const pct = goalProgress(primaryGoal);
      if (pct >= 80) {
        return {
          id: "goal-almost",
          text: `Você está a ${currency(remaining)} de concluir "${primaryGoal.title}".`,
          tone: "positive",
          source: "rule",
        };
      }
      if (remaining > 0) {
        return {
          id: "goal-progress",
          text: `Faltam ${currency(remaining)} para sua meta "${primaryGoal.title}".`,
          tone: "neutral",
          source: "rule",
        };
      }
    }

    // Financial health
    const income = sumIncome(monthly);
    const expense = sumExpense(monthly);

    // Compare with previous month
    const prevMonthRange = (() => {
      const now = new Date();
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        key: "custom" as const,
        from: prev.toISOString().slice(0, 10),
        to: prevEnd.toISOString().slice(0, 10),
      };
    })();
    const prevMonthTx = transactions.filter((t) => inRange(t.date, prevMonthRange));
    const prevExpense = sumExpense(prevMonthTx);

    if (income > 0 && expense <= income * 0.6) {
      return {
        id: "healthy-month",
        text: "Seu mês começou muito bem — despesas sob controle.",
        tone: "positive",
        source: "rule",
      };
    }
    if (prevExpense > 0 && expense < prevExpense * 0.85) {
      return {
        id: "spending-down",
        text: `Você gastou menos que no mês passado. Continue assim!`,
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
  }, [accounts.length, transactions, monthly, goals]);
}
