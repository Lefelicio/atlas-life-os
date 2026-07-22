import { format, parseISO, differenceInYears, differenceInMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Profile, WeightEntry, Workout } from "./types";

export function calcAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  try {
    return differenceInYears(new Date(), parseISO(birthDate));
  } catch {
    return null;
  }
}

export function ageLabel(birthDate?: string): string {
  const age = calcAge(birthDate);
  if (age === null) return "—";
  return `${age} anos`;
}

export function calcBMI(weightKg?: number, heightCm?: number): number | null {
  if (!weightKg || !heightCm || heightCm <= 0) return null;
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function bmiCategory(bmi: number | null): {
  label: string;
  color: string;
} | null {
  if (bmi === null) return null;
  if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-blue-500" };
  if (bmi < 25) return { label: "Peso ideal", color: "text-success" };
  if (bmi < 30) return { label: "Sobrepeso", color: "text-amber-500" };
  return { label: "Obesidade", color: "text-destructive" };
}

export function currentWeight(entries: WeightEntry[]): number | null {
  if (entries.length === 0) return null;
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))[0].weight;
}

export function initialWeight(entries: WeightEntry[]): number | null {
  if (entries.length === 0) return null;
  return [...entries].sort((a, b) => a.date.localeCompare(b.date))[0].weight;
}

export function weightDiffToGoal(
  current: number | null,
  goal: number | undefined,
): number | null {
  if (current === null || goal === undefined) return null;
  return Math.round((goal - current) * 10) / 10;
}

export function formatWeight(kg: number): string {
  return `${kg.toFixed(1).replace(".", ",")} kg`;
}

export function formatDateBR(iso: string): string {
  try {
    return format(parseISO(iso), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

export function formatShortDateBR(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

export function workoutsThisMonth(workouts: Workout[]): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  return workouts.filter((w) => {
    const d = parseISO(w.date);
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;
}

export function trainingDaysThisMonth(workouts: Workout[]): number {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const days = new Set<string>();
  for (const w of workouts) {
    const d = parseISO(w.date);
    if (d.getFullYear() === y && d.getMonth() === m) {
      days.add(w.date);
    }
  }
  return days.size;
}

export function longestStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  const dates = [...new Set(workouts.map((w) => w.date))].sort();
  let max = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = parseISO(dates[i - 1]);
    const curr = parseISO(dates[i]);
    const diff = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff === 1) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 1;
    }
  }
  return max;
}

export function monthsBetween(birthDate: string): number {
  return differenceInMonths(new Date(), parseISO(birthDate));
}
