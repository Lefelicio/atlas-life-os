import { useMemo } from "react";
import type { Account, Card, Transaction } from "@/features/finance/types";
import type { Goal } from "@/features/goals/types";
import {
  accountBalance,
  currency,
  todayISO,
  upcomingDueDates,
  monthInstallments,
} from "@/features/finance/utils";
import { goalRemaining } from "@/features/goals/store";

export interface DashboardAction {
  id: string;
  label: string;
  href: string;
  tone: "default" | "attention";
}

interface Input {
  accounts: Account[];
  transactions: Transaction[];
  cards: Card[];
  goals: Goal[];
}

/**
 * Generates up to 3 actionable items for the dashboard.
 * Structured so a future AI hook can return the same shape.
 */
export function useDashboardActions({ accounts, transactions, cards, goals }: Input): DashboardAction[] {
  return useMemo<DashboardAction[]>(() => {
    const actions: DashboardAction[] = [];
    const today = todayISO();

    // 1. No transactions today
    const hasTxToday = transactions.some((t) => t.date === today);
    if (!hasTxToday && accounts.length > 0) {
      actions.push({
        id: "log-today",
        label: "Registrar movimentações de hoje",
        href: "/financas",
        tone: "attention",
      });
    }

    // 2. Upcoming card due dates (within 3 days)
    const upcoming = upcomingDueDates(cards, 3);
    if (upcoming.length > 0) {
      const first = upcoming[0];
      actions.push({
        id: "card-due",
        label: `Cartão ${first.card.name} vence em breve`,
        href: "/cartoes",
        tone: "attention",
      });
    }

    // 3. No accounts yet
    if (accounts.length === 0) {
      actions.push({
        id: "add-account",
        label: "Cadastrar sua primeira conta",
        href: "/financas",
        tone: "attention",
      });
    }

    // 4. No goals yet
    const activeGoals = goals.filter((g) => !g.archived);
    if (activeGoals.length === 0) {
      actions.push({
        id: "create-goal",
        label: "Definir sua primeira meta",
        href: "/metas",
        tone: "default",
      });
    }

    // 5. Goal close to completion
    const primaryGoal = activeGoals.find((g) => g.isPrimary) ?? activeGoals[0];
    if (primaryGoal && primaryGoal.currentAmount > 0) {
      const remaining = goalRemaining(primaryGoal);
      const pct = (primaryGoal.currentAmount / primaryGoal.targetAmount) * 100;
      if (pct >= 80 && remaining > 0) {
        actions.push({
          id: "goal-close",
          label: `Faltam ${currency(remaining)} para "${primaryGoal.title}"`,
          href: "/metas",
          tone: "default",
        });
      }
    }

    return actions.slice(0, 3);
  }, [accounts, transactions, cards, goals]);
}
