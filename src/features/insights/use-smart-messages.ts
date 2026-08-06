import { useMemo } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { useFinance } from "@/features/finance/hooks/use-finance";
import { usePlanning } from "@/features/planning/store";
import { useObjetivos } from "@/features/objetivos/hooks/use-objetivos";
import { usePatrimony } from "@/features/patrimony/store";
import { usePessoal } from "@/features/pessoal/store";
import { computeGroupSummary, healthMessages } from "@/features/planning/utils";
import { GROUP_ORDER } from "@/features/planning/types";
import { monthEntries, sumEntries } from "@/features/patrimony/utils";
import { todayISO } from "@/features/finance/utils";
import { monthTransactions } from "@/features/finance/finance-rules";

export interface SmartMessage {
  id: string;
  text: string;
  tone: "positive" | "attention" | "neutral";
}

export function useSmartMessages(): SmartMessage[] {
  const { transactions, categories } = useFinance();
  const { config, categoryMappings } = usePlanning();
  const { objectives } = useObjetivos();
  const { entries: assetEntries } = usePatrimony();
  const { weights, workouts } = usePessoal();

  return useMemo<SmartMessage[]>(() => {
    const messages: SmartMessage[] = [];
    const today = todayISO();

    // Planning
    if (config.monthlyIncome > 0) {
      const monthTxs = monthTransactions(transactions);
      const summaries = GROUP_ORDER.map((g) =>
        computeGroupSummary(g, config, monthTxs, categories, categoryMappings),
      );
      const health = healthMessages(summaries);
      if (health.length > 0) {
        const first = health[0];
        const hasOver = summaries.some((s) => s.status === "over");
        messages.push({
          id: "planning",
          text: first,
          tone: hasOver ? "attention" : "positive",
        });
      }
    }

    // Patrimony
    const monthAssets = sumEntries(monthEntries(assetEntries));
    if (monthAssets === 0 && assetEntries.length === 0) {
      messages.push({
        id: "patrimony",
        text: "Você ainda não registrou aportes este mês.",
        tone: "neutral",
      });
    }

    // Weight
    if (weights.length > 0) {
      const last = [...weights].sort((a, b) => b.date.localeCompare(a.date))[0];
      const days = differenceInDays(new Date(), parseISO(last.date));
      if (days >= 10) {
        messages.push({
          id: "weight",
          text: `Seu peso não é atualizado há ${days} dias.`,
          tone: "attention",
        });
      }
    }

    // Workouts
    if (workouts.length > 0) {
      const last = [...workouts].sort((a, b) => b.date.localeCompare(a.date))[0];
      const days = differenceInDays(new Date(), parseISO(last.date));
      if (days >= 5) {
        messages.push({
          id: "workout",
          text: `Você não registra treinos há ${days} dias.`,
          tone: "attention",
        });
      }
    }

    // Objectives
    const active = objectives.filter((o) => o.status === "active");
    if (active.length === 0 && objectives.length === 0) {
      messages.push({
        id: "objectives",
        text: "Que tal criar seu primeiro objetivo?",
        tone: "neutral",
      });
    }

    return messages.slice(0, 4);
  }, [config, categoryMappings, transactions, categories, objectives, assetEntries, weights, workouts]);
}
