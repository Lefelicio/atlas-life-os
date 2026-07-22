import { Card, CardContent } from "@/components/ui/card";
import { Target, CheckCircle2, TrendingUp, Clock } from "lucide-react";
import type { Objective } from "../types";
import { objectiveProgress } from "../resolver";

interface Props {
  objectives: Objective[];
}

export function ObjectiveStats({ objectives }: Props) {
  const active = objectives.filter((o) => o.status === "active").length;
  const completed = objectives.filter((o) => o.status === "completed").length;

  const activeObjs = objectives.filter((o) => o.status === "active");
  const closest = activeObjs.length > 0
    ? activeObjs.reduce((max, o) =>
        objectiveProgress(o) > objectiveProgress(max) ? o : max,
      )
    : null;

  const recent = [...objectives]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;

  const stats = [
    { label: "Objetivos ativos", value: String(active), icon: <Target className="h-4 w-4" /> },
    { label: "Concluídos", value: String(completed), icon: <CheckCircle2 className="h-4 w-4" /> },
    {
      label: "Mais próximo",
      value: closest ? `${objectiveProgress(closest)}%` : "—",
      hint: closest?.title,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Mais recente",
      value: recent ? recent.title : "—",
      hint: recent ? new Date(recent.createdAt).toLocaleDateString("pt-BR") : undefined,
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label} className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="uppercase tracking-[0.15em]">{s.label}</span>
              {s.icon}
            </div>
            <p className="mt-1.5 truncate text-sm font-semibold tabular-nums">{s.value}</p>
            {s.hint && (
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{s.hint}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
