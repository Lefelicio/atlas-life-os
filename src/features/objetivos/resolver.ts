import { useFinance } from "@/features/finance/store";
import { totalBalance } from "@/features/finance/utils";
import { usePessoal } from "@/features/pessoal/store";
import { currentWeight } from "@/features/pessoal/utils";
import type { AutoMetric, Objective } from "./types";

export interface ResolvedMetric {
  current: number | null;
  target: number | null;
  available: boolean;
  unit: string;
}

export interface MetricResolver {
  current: number | null;
  target: number | null;
  unit: string;
  available: boolean;
}

export function resolveMetric(
  metric: AutoMetric,
  objective: Objective,
): MetricResolver {
  switch (metric) {
    case "finance_balance": {
      const { accounts, transactions } = useFinance.getState();
      const bal = totalBalance(accounts, transactions);
      return {
        current: bal,
        target: objective.manualTarget ?? null,
        unit: "R$",
        available: true,
      };
    }
    case "finance_reserve": {
      const { accounts, transactions } = useFinance.getState();
      const bal = totalBalance(accounts, transactions);
      return {
        current: Math.max(0, bal),
        target: objective.manualTarget ?? null,
        unit: "R$",
        available: true,
      };
    }
    case "health_weight": {
      const { weights } = usePessoal.getState();
      const wt = currentWeight(weights);
      return {
        current: wt,
        target: objective.manualTarget ?? null,
        unit: "kg",
        available: wt !== null,
      };
    }
    case "health_workouts": {
      const { workouts } = usePessoal.getState();
      return {
        current: workouts.length,
        target: objective.manualTarget ?? null,
        unit: "treinos",
        available: true,
      };
    }
    case "study_days":
      return { current: null, target: null, unit: "dias", available: false };
    case "tasks_done":
      return { current: null, target: null, unit: "tarefas", available: false };
  }
}

export function objectiveProgress(objective: Objective): number {
  if (objective.status === "completed") return 100;
  let current: number | null = null;
  let target: number | null = null;

  if (objective.progressType === "manual") {
    current = objective.manualCurrent ?? 0;
    target = objective.manualTarget ?? 0;
  } else if (objective.metric) {
    const r = resolveMetric(objective.metric, objective);
    current = r.current;
    target = r.target;
  }

  if (current === null || target === null || target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
}

export function objectiveCurrentValue(objective: Objective): number | null {
  if (objective.progressType === "manual") return objective.manualCurrent ?? null;
  if (objective.metric) return resolveMetric(objective.metric, objective).current;
  return null;
}

export function objectiveTargetValue(objective: Objective): number | null {
  if (objective.progressType === "manual") return objective.manualTarget ?? null;
  if (objective.metric) return resolveMetric(objective.metric, objective).target;
  return null;
}

export function formatMetricValue(value: number | null, unit: string): string {
  if (value === null) return "—";
  if (unit === "R$") {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }
  return `${value.toLocaleString("pt-BR")} ${unit}`;
}
