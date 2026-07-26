import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { AssetEntry } from "./types";
import { ASSET_CATEGORY_LABELS } from "./types";
import { currency } from "@/features/finance/utils";

export function monthEntries(entries: AssetEntry[], ref = new Date()): AssetEntry[] {
  const start = startOfMonth(ref);
  const end = endOfMonth(ref);
  return entries.filter((e) =>
    isWithinInterval(parseISO(e.date), { start, end }),
  );
}

export function yearEntries(entries: AssetEntry[], ref = new Date()): AssetEntry[] {
  const y = ref.getFullYear();
  return entries.filter((e) => parseISO(e.date).getFullYear() === y);
}

export function sumEntries(entries: AssetEntry[]): number {
  return entries.reduce((s, e) => s + e.amount, 0);
}

export interface MonthlyHistory {
  month: string;
  total: number;
}

export function monthlyHistory(entries: AssetEntry[], months = 12): MonthlyHistory[] {
  const now = new Date();
  const result: MonthlyHistory[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = format(d, "MMM/yy", { locale: ptBR });
    const monthTotal = sumEntries(monthEntries(entries, d));
    result.push({ month: monthKey, total: monthTotal });
  }
  return result;
}

export interface CategoryUsage {
  category: string;
  count: number;
  total: number;
}

export function topCategories(entries: AssetEntry[], limit = 5): CategoryUsage[] {
  const map = new Map<string, { count: number; total: number }>();
  for (const e of entries) {
    const label = ASSET_CATEGORY_LABELS[e.category];
    const existing = map.get(label) ?? { count: 0, total: 0 };
    existing.count++;
    existing.total += e.amount;
    map.set(label, existing);
  }
  return Array.from(map.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export { currency };
