import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFinance } from "../store";
import { currency } from "../utils";
import type { Transaction } from "../types";

export function ExpenseByCategoryChart({ transactions }: { transactions: Transaction[] }) {
  const { categories } = useFinance();
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.kind !== "expense") continue;
      const key = t.categoryId ?? "__none";
      map.set(key, (map.get(key) ?? 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([id, value]) => {
        const c = categories.find((x) => x.id === id);
        return {
          name: c?.name ?? "Sem categoria",
          value,
          color: c?.color ?? "#64748b",
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-xs text-muted-foreground">
        Sem despesas no período
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="h-56 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              strokeWidth={0}
            >
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => currency(v)}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-1.5 text-xs">
        {data.slice(0, 6).map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="flex-1 truncate">{d.name}</span>
            <span className="tabular-nums text-muted-foreground">
              {currency(d.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MonthlyChart() {
  const { transactions } = useFinance();
  const data = useMemo(() => {
    const months: { key: string; label: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = startOfMonth(subMonths(new Date(), i));
      months.push({
        key: format(d, "yyyy-MM"),
        label: format(d, "MMM", { locale: ptBR }),
        income: 0,
        expense: 0,
      });
    }
    for (const t of transactions) {
      if (t.kind === "transfer") continue;
      const k = format(parseISO(t.date), "yyyy-MM");
      const m = months.find((x) => x.key === k);
      if (!m) continue;
      if (t.kind === "income") m.income += t.amount;
      else m.expense += t.amount;
    }
    return months;
  }, [transactions]);

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <XAxis
            dataKey="label"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => currency(v)}
          />
          <Bar dataKey="income" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
