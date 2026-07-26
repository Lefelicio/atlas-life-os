import { format, isToday, isYesterday, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ActivityEntry } from "./store";

export function groupByDate(entries: ActivityEntry[]): { label: string; items: ActivityEntry[] }[] {
  const groups: Record<string, ActivityEntry[]> = {};
  for (const e of entries) {
    const d = parseISO(e.timestamp);
    let label: string;
    if (isToday(d)) label = "Hoje";
    else if (isYesterday(d)) label = "Ontem";
    else if (differenceInDays(new Date(), d) <= 7) label = "Últimos 7 dias";
    else label = format(d, "dd 'de' MMMM", { locale: ptBR });
    if (!groups[label]) groups[label] = [];
    groups[label].push(e);
  }
  return Object.entries(groups).map(([label, items]) => ({ label, items }));
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), "HH:mm", { locale: ptBR });
}
