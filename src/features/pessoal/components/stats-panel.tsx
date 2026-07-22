import { Card, CardContent } from "@/components/ui/card";
import { usePessoal } from "../store";
import {
  workoutsThisMonth,
  trainingDaysThisMonth,
  longestStreak,
  currentWeight,
  calcBMI,
  formatWeight,
} from "../utils";

export function StatsPanel() {
  const { workouts, weights, profile } = usePessoal();

  const thisMonth = workoutsThisMonth(workouts);
  const daysTrained = trainingDaysThisMonth(workouts);
  const streak = longestStreak(workouts);
  const curWt = currentWeight(weights);
  const bmi = calcBMI(curWt, profile.height);

  const stats = [
    { label: "Treinos este mês", value: String(thisMonth) },
    { label: "Dias treinados", value: String(daysTrained) },
    { label: "Maior sequência", value: `${streak} ${streak === 1 ? "dia" : "dias"}` },
    { label: "Peso atual", value: curWt !== null ? formatWeight(curWt) : "—" },
    { label: "IMC", value: bmi !== null ? bmi.toFixed(1).replace(".", ",") : "—" },
  ];

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Estatísticas
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label} className="border-border/40 bg-card/40">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1.5 text-lg font-semibold tabular-nums">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
