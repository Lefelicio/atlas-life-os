import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO, subMonths, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

import { useFinance } from "@/features/finance/hooks/use-finance";
import { usePlanning } from "@/features/planning/store";
import { useObjetivos } from "@/features/objetivos/hooks/use-objetivos";
import { usePatrimony } from "@/features/patrimony/store";
import { usePessoal } from "@/features/pessoal/store";
import { useGoals } from "@/features/goals/store";

import { currency, sumIncome, sumExpense, inRange, computePeriod } from "@/features/finance/utils";
import { monthEntries, sumEntries, yearEntries } from "@/features/patrimony/utils";
import { computeGroupSummary, healthMessages } from "@/features/planning/utils";
import { GROUP_ORDER, GROUP_LABELS } from "@/features/planning/types";
import { ACTIVITY_LABELS, type WeightEntry } from "@/features/pessoal/types";
import { KIND_LABELS } from "@/features/objetivos/types";
import {
  computeBalance,
  computeDelta,
  computeIMC,
  computePlanningHealth,
  monthRange,
  prevMonthRange,
  monthLabel,
  monthlyFlowSeries,
  topCategories,
  monthTransactions,
  objectiveProgressPct,
  type MetricDelta,
} from "@/features/finance/finance-rules";
import { objectiveProgress } from "@/features/objetivos/resolver";

// MetricDelta and computeDelta are now imported from finance-rules.ts
export type { MetricDelta } from "@/features/finance/finance-rules";

export interface ExecutiveSummary {
  income: number;
  expense: number;
  savings: number;
  balance: number;
  investments: number;
  planningHealth: string[];
  weight: number | null;
  imc: number | null;
  workoutsThisMonth: number;
  activeObjectives: number;
  completedObjectives: number;
  activeProjects: number;
  highlights: string[];
}

export function useExecutiveSummary(): ExecutiveSummary {
  const { accounts, transactions, categories } = useFinance();
  const { config, categoryMappings } = usePlanning();
  const { objectives } = useObjetivos();
  const { entries } = usePatrimony();
  const { weights, workouts, profile } = usePessoal();
  const { goals } = useGoals();

  return useMemo(() => {
    const now = new Date();
    const range = monthRange(now);
    const monthTx = monthTransactions(transactions, now);

    const income = sumIncome(monthTx);
    const expense = sumExpense(monthTx);
    const savings = income - expense;
    const balance = computeBalance(accounts, transactions);

    const monthAssetEntries = monthEntries(entries, now);
    const investments = sumEntries(monthAssetEntries);

    const planningHealth = computePlanningHealth(config, monthTx, categories, categoryMappings).messages;

    const sortedWeights = [...weights].sort((a, b) => b.date.localeCompare(a.date));
    const weight = sortedWeights.length > 0 ? sortedWeights[0].weight : null;
    const imc = computeIMC(weight, profile.height);

    const workoutsThisMonth = workouts.filter((w) => inRange(w.date, range)).length;

    const activeObjectives = objectives.filter((o) => o.status === "active").length;
    const completedObjectives = objectives.filter((o) => o.status === "completed").length;
    const activeProjects = goals.filter((g) => !g.archived).length;

    const highlights: string[] = [];
    if (savings > 0) highlights.push(`Você economizou ${currency(savings)} este mês.`);
    if (investments > 0) highlights.push(`Você investiu ${currency(investments)} este mês.`);
    if (workoutsThisMonth > 0) highlights.push(`${workoutsThisMonth} treinos registrados este mês.`);
    if (completedObjectives > 0) highlights.push(`${completedObjectives} objetivo${completedObjectives > 1 ? "s" : ""} concluído${completedObjectives > 1 ? "s" : ""}.`);
    if (highlights.length === 0 && transactions.length > 0) highlights.push("Continue registrando para acompanhar sua evolução.");

    return {
      income, expense, savings, balance, investments,
      planningHealth, weight, imc, workoutsThisMonth,
      activeObjectives, completedObjectives, activeProjects,
      highlights,
    };
  }, [accounts, transactions, categories, config, categoryMappings, objectives, entries, weights, workouts, profile, goals]);
}

export interface FinancialReport {
  income: number;
  expense: number;
  savings: number;
  balance: number;
  investments: number;
  prevIncome: number;
  prevExpense: number;
  prevSavings: number;
  incomeDelta: MetricDelta;
  expenseDelta: MetricDelta;
  savingsDelta: MetricDelta;
  topCategories: { name: string; amount: number; pct: number }[];
  groupSummaries: { group: string; label: string; budget: number; spent: number; percentage: number; status: string }[];
  monthlyFlow: { month: string; income: number; expense: number }[];
}

export function useFinancialReport(): FinancialReport {
  const { accounts, transactions, categories } = useFinance();
  const { config, categoryMappings } = usePlanning();
  const { entries } = usePatrimony();

  return useMemo(() => {
    const now = new Date();
    const range = monthRange(now);
    const monthTx = transactions.filter((t) => inRange(t.date, range));

    const income = sumIncome(monthTx);
    const expense = sumExpense(monthTx);
    const savings = income - expense;
    const balance = computeBalance(accounts, transactions);
    const investments = sumEntries(monthEntries(entries, now));

    const prevRange = prevMonthRange(now);
    const prevTx = transactions.filter((t) => inRange(t.date, prevRange));
    const prevIncome = sumIncome(prevTx);
    const prevExpense = sumExpense(prevTx);
    const prevSavings = prevIncome - prevExpense;

    const topCats = topCategories(monthTx, categories);

    const groupSummaries = GROUP_ORDER.map((g) => {
      const s = computeGroupSummary(g, config, monthTx, categories, categoryMappings);
      return { group: g, label: GROUP_LABELS[g], budget: s.budget, spent: s.spent, percentage: s.percentage, status: s.status };
    });

    const monthlyFlow = monthlyFlowSeries(transactions, 6, now);

    return {
      income, expense, savings, balance, investments,
      prevIncome, prevExpense, prevSavings,
      incomeDelta: computeDelta(income, prevIncome),
      expenseDelta: computeDelta(expense, prevExpense),
      savingsDelta: computeDelta(savings, prevSavings),
      topCategories: topCats, groupSummaries, monthlyFlow,
    };
  }, [accounts, transactions, categories, config, categoryMappings, entries]);
}

export interface PersonalReport {
  currentWeight: number | null;
  prevWeight: number | null;
  weightDelta: MetricDelta | null;
  imc: number | null;
  weightHistory: { date: string; weight: number }[];
  workoutsThisMonth: number;
  workoutsPrevMonth: number;
  workoutDelta: MetricDelta;
  daysTrained: number;
  muscleGroups: { group: string; count: number }[];
  jiuJitsuCount: number;
  activitiesBreakdown: { activity: string; count: number }[];
  weightEvolution: WeightEvolution;
}

export interface WeightEvolution {
  total: number;
  min: number | null;
  max: number | null;
  monthly: { month: string; avg: number; gain: number }[];
}

export function usePersonalReport(): PersonalReport {
  const { weights, workouts, profile } = usePessoal();

  return useMemo(() => {
    const now = new Date();
    const range = monthRange(now);

    const sortedWeights = [...weights].sort((a, b) => a.date.localeCompare(b.date));
    const currentWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight : null;
    const prevWeightEntry = sortedWeights.length > 1 ? sortedWeights[sortedWeights.length - 2] : null;
    const prevWeight = prevWeightEntry?.weight ?? null;

    const imc = computeIMC(currentWeight, profile.height);

    const monthWorkouts = workouts.filter((w) => inRange(w.date, range));
    const workoutsThisMonth = monthWorkouts.length;

    const prevRange = prevMonthRange(now);
    const workoutsPrevMonth = workouts.filter((w) => inRange(w.date, prevRange)).length;

    const daysTrained = new Set(monthWorkouts.map((w) => w.date)).size;

    const mgMap = new Map<string, number>();
    for (const w of monthWorkouts) {
      for (const mg of w.muscleGroups ?? []) {
        mgMap.set(mg, (mgMap.get(mg) ?? 0) + 1);
      }
    }
    const muscleGroups = Array.from(mgMap.entries())
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count);

    const jiuJitsuCount = monthWorkouts.filter((w) => w.activity === "jiu-jitsu").length;

    const actMap = new Map<string, number>();
    for (const w of monthWorkouts) {
      const label = ACTIVITY_LABELS[w.activity] ?? w.activity;
      actMap.set(label, (actMap.get(label) ?? 0) + 1);
    }
    const activitiesBreakdown = Array.from(actMap.entries())
      .map(([activity, count]) => ({ activity, count }))
      .sort((a, b) => b.count - a.count);

    const weightHistory = sortedWeights.slice(-6).map((w) => ({ date: w.date, weight: w.weight }));

    const weightEvolution = computeWeightEvolution(weights);

    return {
      currentWeight, prevWeight,
      weightDelta: currentWeight && prevWeight ? computeDelta(currentWeight, prevWeight) : null,
      imc, weightHistory,
      workoutsThisMonth, workoutsPrevMonth,
      workoutDelta: computeDelta(workoutsThisMonth, workoutsPrevMonth),
      daysTrained, muscleGroups, jiuJitsuCount, activitiesBreakdown,
      weightEvolution,
    };
  }, [weights, workouts, profile]);
}

function computeWeightEvolution(weights: WeightEntry[]): WeightEvolution {
  if (weights.length === 0) return { total: 0, min: null, max: null, monthly: [] };
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const min = Math.min(...sorted.map((w) => w.weight));
  const max = Math.max(...sorted.map((w) => w.weight));
  const now = new Date();
  const monthly: { month: string; avg: number; gain: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const mRange = monthRange(d);
    const mWeights = sorted.filter((w) => inRange(w.date, mRange));
    if (mWeights.length === 0) {
      monthly.push({ month: monthLabel(d), avg: 0, gain: 0 });
      continue;
    }
    const avg = Math.round((mWeights.reduce((s, w) => s + w.weight, 0) / mWeights.length) * 10) / 10;
    const gain = Math.round((mWeights[mWeights.length - 1].weight - mWeights[0].weight) * 10) / 10;
    monthly.push({ month: monthLabel(d), avg, gain });
  }
  return { total: sorted.length, min, max, monthly };
}

export interface ObjectivesReport {
  active: number;
  completed: number;
  paused: number;
  avgProgress: number;
  closest: { title: string; progress: number }[];
  monthlyHistory: { month: string; completed: number; created: number }[];
}

export function useObjectivesReport(): ObjectivesReport {
  const { objectives } = useObjetivos();

  return useMemo(() => {
    const active = objectives.filter((o) => o.status === "active").length;
    const completed = objectives.filter((o) => o.status === "completed").length;
    const paused = objectives.filter((o) => o.status === "paused").length;

    const withProgress = objectives.filter((o) => o.status === "active");
    const avgProgress = withProgress.length > 0
      ? Math.round(withProgress.reduce((s, o) => s + objectiveProgressPct(o), 0) / withProgress.length)
      : 0;

    const closest = withProgress
      .map((o) => ({ title: o.title, progress: objectiveProgressPct(o) }))
      .sort((a, b) => b.progress - a.progress)
      .slice(0, 5);

    const now = new Date();
    const monthlyHistory: { month: string; completed: number; created: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const mRange = monthRange(d);
      const created = objectives.filter((o) => inRange(o.createdAt.slice(0, 10), mRange)).length;
      const comp = objectives.filter((o) => {
        if (o.status !== "completed") return false;
        const lastEvent = o.timeline.find((e) => e.type === "completed");
        return lastEvent && inRange(lastEvent.date.slice(0, 10), mRange);
      }).length;
      monthlyHistory.push({ month: monthLabel(d), completed: comp, created });
    }

    return { active, completed, paused, avgProgress, closest, monthlyHistory };
  }, [objectives]);
}

export interface ProjectsReport {
  active: number;
  completed: number;
  avgProgress: number;
  recentUpdates: { title: string; date: string }[];
}

export function useProjectsReport(): ProjectsReport {
  const { goals } = useGoals();

  return useMemo(() => {
    const active = goals.filter((g) => !g.archived).length;
    const completed = goals.filter((g) => g.archived).length;
    const avgProgress = goals.length > 0
      ? Math.round(goals.reduce((s, g) => s + Math.min(100, (g.currentAmount / g.targetAmount) * 100), 0) / goals.length)
      : 0;

    const recentUpdates = [...goals]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 5)
      .map((g) => ({ title: g.title, date: g.createdAt.slice(0, 10) }));

    return { active, completed, avgProgress, recentUpdates };
  }, [goals]);
}

export interface ComparisonData {
  income: MetricDelta;
  expense: MetricDelta;
  investments: MetricDelta;
  weight: MetricDelta | null;
  workouts: MetricDelta;
  objectives: MetricDelta;
  projects: MetricDelta;
}

export function useComparison(mode: "month" | "year" | "custom", custom?: { from: string; to: string; prevFrom: string; prevTo: string }): ComparisonData {
  const { transactions } = useFinance();
  const { entries } = usePatrimony();
  const { weights, workouts } = usePessoal();
  const { objectives } = useObjetivos();
  const { goals } = useGoals();

  return useMemo(() => {
    const now = new Date();
    let curRange: { from: string; to: string };
    let prevRange: { from: string; to: string };

    if (mode === "month") {
      const mr = monthRange(now);
      curRange = { from: mr.from, to: mr.to };
      const pr = prevMonthRange(now);
      prevRange = { from: pr.from, to: pr.to };
    } else if (mode === "year") {
      curRange = { from: format(startOfYear(now), "yyyy-MM-dd"), to: format(endOfYear(now), "yyyy-MM-dd") };
      const prevYear = now.getFullYear() - 1;
      prevRange = { from: format(startOfYear(new Date(prevYear, 0, 1)), "yyyy-MM-dd"), to: format(endOfYear(new Date(prevYear, 11, 31)), "yyyy-MM-dd") };
    } else {
      curRange = { from: custom?.from ?? "", to: custom?.to ?? "" };
      prevRange = { from: custom?.prevFrom ?? "", to: custom?.prevTo ?? "" };
    }

    const curR = { key: "custom" as const, ...curRange };
    const prevR = { key: "custom" as const, ...prevRange };

    const curTx = transactions.filter((t) => inRange(t.date, curR));
    const prevTx = transactions.filter((t) => inRange(t.date, prevR));

    const income = computeDelta(sumIncome(curTx), sumIncome(prevTx));
    const expense = computeDelta(sumExpense(curTx), sumExpense(prevTx));

    const curInvest = sumEntries(entries.filter((e) => inRange(e.date, curR)));
    const prevInvest = sumEntries(entries.filter((e) => inRange(e.date, prevR)));
    const investments = computeDelta(curInvest, prevInvest);

    const curWeights = weights.filter((w) => inRange(w.date, curR));
    const prevWeights = weights.filter((w) => inRange(w.date, prevR));
    const curWeight = curWeights.length > 0 ? [...curWeights].sort((a, b) => b.date.localeCompare(a.date))[0].weight : 0;
    const prevWeight = prevWeights.length > 0 ? [...prevWeights].sort((a, b) => b.date.localeCompare(a.date))[0].weight : 0;
    const weight = curWeight > 0 && prevWeight > 0 ? computeDelta(curWeight, prevWeight) : null;

    const workoutsDelta = computeDelta(
      workouts.filter((w) => inRange(w.date, curR)).length,
      workouts.filter((w) => inRange(w.date, prevR)).length,
    );

    const objectivesDelta = computeDelta(
      objectives.filter((o) => inRange(o.createdAt.slice(0, 10), curR)).length,
      objectives.filter((o) => inRange(o.createdAt.slice(0, 10), prevR)).length,
    );

    const projectsDelta = computeDelta(
      goals.filter((g) => inRange(g.createdAt.slice(0, 10), curR)).length,
      goals.filter((g) => inRange(g.createdAt.slice(0, 10), prevR)).length,
    );

    return { income, expense, investments, weight, workouts: workoutsDelta, objectives: objectivesDelta, projects: projectsDelta };
  }, [mode, custom, transactions, entries, weights, workouts, objectives, goals]);
}

export interface ReportInsight {
  id: string;
  text: string;
  tone: "positive" | "attention" | "neutral";
}

export function useReportInsights(): ReportInsight[] {
  const fin = useFinancialReport();
  const personal = usePersonalReport();
  const objs = useObjectivesReport();

  return useMemo(() => {
    const insights: ReportInsight[] = [];

    if (fin.expenseDelta.previous > 0) {
      if (fin.expenseDelta.trend === "down") {
        insights.push({ id: "expense-down", text: `Você reduziu suas despesas este mês (${fin.expenseDelta.deltaPct.toFixed(0)}% a menos).`, tone: "positive" });
      } else if (fin.expenseDelta.trend === "up" && fin.expenseDelta.deltaPct > 10) {
        insights.push({ id: "expense-up", text: `Suas despesas aumentaram ${fin.expenseDelta.deltaPct.toFixed(0)}% em relação ao mês anterior.`, tone: "attention" });
      }
    }

    if (fin.investments > 0) {
      if (fin.income > 0 && fin.investments >= fin.income * 0.2) {
        insights.push({ id: "invest-good", text: "Você aumentou seus investimentos. Continue assim!", tone: "positive" });
      }
    }

    if (personal.workoutsThisMonth > 0 && personal.workoutsPrevMonth > 0) {
      if (personal.workoutDelta.trend === "up" && personal.workoutsThisMonth >= personal.workoutsPrevMonth * 1.5) {
        insights.push({ id: "workout-peak", text: "Este foi seu mês com mais treinos.", tone: "positive" });
      }
    }

    if (personal.currentWeight && personal.prevWeight) {
      const diff = Math.abs(personal.currentWeight - personal.prevWeight);
      if (diff < 0.5) {
        insights.push({ id: "weight-stable", text: "Seu peso permanece estável.", tone: "neutral" });
      }
    }

    if (fin.savings > 0 && fin.groupSummaries.length > 0) {
      const allOk = fin.groupSummaries.every((g) => g.status === "ok");
      if (allOk) {
        insights.push({ id: "planning-ok", text: "Sua meta financeira está dentro do planejado.", tone: "positive" });
      }
    }

    if (objs.avgProgress >= 75) {
      insights.push({ id: "obj-progress", text: `Seus objetivos estão com ${objs.avgProgress}% de progresso médio.`, tone: "positive" });
    }

    return insights.slice(0, 6);
  }, [fin, personal, objs]);
}
