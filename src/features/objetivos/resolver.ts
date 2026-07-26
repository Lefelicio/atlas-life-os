import { format, startOfWeek, startOfMonth, startOfYear, startOfDay, parseISO, isWithinInterval, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFinanceLocal } from "@/features/finance/store";
import { queryClient } from "@/router";
import { totalBalance } from "@/features/finance/utils";
import type { Account, Transaction } from "@/features/finance/types";
import { usePessoal } from "@/features/pessoal/store";
import { currentWeight } from "@/features/pessoal/utils";
import type { AutoMetric, Objective, ObjectiveKind, RecurrenceFrequency } from "./types";

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
      const accounts = (queryClient.getQueryData(["accounts"]) as Account[] | undefined) ?? [];
      const transactions = (queryClient.getQueryData(["transactions"]) as Transaction[] | undefined) ?? [];
      const bal = totalBalance(accounts, transactions);
      return {
        current: bal,
        target: objective.manualTarget ?? objective.targetValue ?? null,
        unit: "R$",
        available: true,
      };
    }
    case "finance_reserve": {
      const accounts = (queryClient.getQueryData(["accounts"]) as Account[] | undefined) ?? [];
      const transactions = (queryClient.getQueryData(["transactions"]) as Transaction[] | undefined) ?? [];
      const bal = totalBalance(accounts, transactions);
      return {
        current: Math.max(0, bal),
        target: objective.manualTarget ?? objective.targetValue ?? null,
        unit: "R$",
        available: true,
      };
    }
    case "health_weight": {
      const { weights } = usePessoal.getState();
      const wt = currentWeight(weights);
      return {
        current: wt,
        target: objective.manualTarget ?? objective.targetValue ?? null,
        unit: "kg",
        available: wt !== null,
      };
    }
    case "health_workouts": {
      const { workouts } = usePessoal.getState();
      return {
        current: workouts.length,
        target: objective.manualTarget ?? objective.targetCount ?? null,
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

export function currentPeriodKey(freq: RecurrenceFrequency, ref = new Date()): string {
  switch (freq) {
    case "diaria":
      return format(ref, "yyyy-MM-dd");
    case "semanal":
      return format(startOfWeek(ref, { locale: ptBR }), "yyyy-'W'II");
    case "mensal":
      return format(ref, "yyyy-MM");
    case "anual":
      return format(ref, "yyyy");
  }
}

export function periodStart(freq: RecurrenceFrequency, ref = new Date()): Date {
  switch (freq) {
    case "diaria":
      return startOfDay(ref);
    case "semanal":
      return startOfWeek(ref, { locale: ptBR });
    case "mensal":
      return startOfMonth(ref);
    case "anual":
      return startOfYear(ref);
  }
}

export function isInCurrentPeriod(
  dateISO: string,
  freq: RecurrenceFrequency,
  ref = new Date(),
): boolean {
  const d = parseISO(dateISO);
  const start = periodStart(freq, ref);
  const end = new Date();
  return isWithinInterval(d, { start, end: endOfDay(end) }) && isWithinInterval(d, { start, end: endOfDay(end) });
}

export function countCheckinsInCurrentPeriod(
  checkinDates: string[] | undefined,
  freq: RecurrenceFrequency | undefined,
  ref = new Date(),
): number {
  if (!checkinDates || !freq) return 0;
  const start = periodStart(freq, ref);
  const end = endOfDay(ref);
  return checkinDates.filter((d) => {
    const date = parseISO(d);
    return isWithinInterval(date, { start, end });
  }).length;
}

export function objectiveProgress(objective: Objective): number {
  if (objective.status === "completed") return 100;
  const kind = objective.kind ?? (objective.progressType === "auto" ? "auto" : "manual");

  let current: number | null = null;
  let target: number | null = null;

  switch (kind) {
    case "financeiro":
      current = objective.currentValue ?? objective.manualCurrent ?? 0;
      target = objective.targetValue ?? objective.manualTarget ?? 0;
      break;
    case "quantidade":
      current = objective.currentCount ?? 0;
      target = objective.targetCount ?? 0;
      break;
    case "recorrente":
      current = countCheckinsInCurrentPeriod(objective.checkinDates, objective.frequency);
      target = objective.perPeriodTarget ?? 0;
      break;
    case "checkin": {
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfDay(now);
      const done = (objective.checkinDates ?? []).filter((d) => {
        const date = parseISO(d);
        return isWithinInterval(date, { start, end });
      }).length;
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      current = done;
      target = daysInMonth;
      break;
    }
    case "auto":
      if (objective.metric) {
        const r = resolveMetric(objective.metric, objective);
        current = r.current;
        target = r.target;
      }
      break;
    case "manual":
    case "personalizado":
    default:
      current = objective.manualCurrent ?? 0;
      target = objective.manualTarget ?? 0;
      break;
  }

  if (current === null || target === null || target <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((current / target) * 100)));
}

export function objectiveCurrentValue(objective: Objective): number | null {
  const kind = objective.kind ?? (objective.progressType === "auto" ? "auto" : "manual");
  switch (kind) {
    case "financeiro":
      return objective.currentValue ?? objective.manualCurrent ?? null;
    case "quantidade":
      return objective.currentCount ?? null;
    case "recorrente":
      return countCheckinsInCurrentPeriod(objective.checkinDates, objective.frequency);
    case "checkin": {
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfDay(now);
      return (objective.checkinDates ?? []).filter((d) => {
        const date = parseISO(d);
        return isWithinInterval(date, { start, end });
      }).length;
    }
    case "auto":
      if (objective.metric) return resolveMetric(objective.metric, objective).current;
      return objective.manualCurrent ?? null;
    case "manual":
    case "personalizado":
    default:
      return objective.manualCurrent ?? null;
  }
}

export function objectiveTargetValue(objective: Objective): number | null {
  const kind = objective.kind ?? (objective.progressType === "auto" ? "auto" : "manual");
  switch (kind) {
    case "financeiro":
      return objective.targetValue ?? objective.manualTarget ?? null;
    case "quantidade":
      return objective.targetCount ?? null;
    case "recorrente":
      return objective.perPeriodTarget ?? null;
    case "checkin": {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    }
    case "auto":
      if (objective.metric) return resolveMetric(objective.metric, objective).target;
      return objective.manualTarget ?? null;
    case "manual":
    case "personalizado":
    default:
      return objective.manualTarget ?? null;
  }
}

export function objectiveUnit(objective: Objective): string {
  const kind = objective.kind ?? (objective.progressType === "auto" ? "auto" : "manual");
  switch (kind) {
    case "financeiro":
      return "R$";
    case "quantidade":
      return objective.unit ?? "un";
    case "recorrente":
      return "x";
    case "checkin":
      return "dias";
    case "auto":
      if (objective.metric) return resolveMetric(objective.metric, objective).unit;
      return "";
    default:
      return "";
  }
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
