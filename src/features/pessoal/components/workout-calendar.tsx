import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Dumbbell } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePessoal } from "../store";
import { ACTIVITY_LABELS, type Workout } from "../types";
import { WorkoutDialog } from "./workout-dialog";

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

export function WorkoutCalendar() {
  const { workouts, addWorkout, removeWorkout } = usePessoal();
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const days = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursor]);

  const workoutsByDate = useMemo(() => {
    const map = new Map<string, Workout[]>();
    for (const w of workouts) {
      const list = map.get(w.date) ?? [];
      list.push(w);
      map.set(w.date, list);
    }
    return map;
  }, [workouts]);

  const selectedWorkouts = selectedDate
    ? workoutsByDate.get(selectedDate) ?? []
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Calendário
        </p>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Novo treino
        </Button>
      </div>

      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold capitalize">
              {format(cursor, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setCursor(subMonths(cursor, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setCursor(new Date())}>
                Hoje
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setCursor(addMonths(cursor, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d, i) => (
              <div key={i} className="pb-1 text-[10px] font-medium uppercase text-muted-foreground">
                {d}
              </div>
            ))}
            {days.map((day) => {
              const iso = format(day, "yyyy-MM-dd");
              const inMonth = isSameMonth(day, cursor);
              const dayWorkouts = workoutsByDate.get(iso) ?? [];
              const hasWorkout = dayWorkouts.length > 0;
              const isSelected = selectedDate === iso;
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  className={cn(
                    "relative flex aspect-square flex-col items-center justify-center rounded-md text-xs transition",
                    !inMonth && "text-muted-foreground/40",
                    inMonth && "text-foreground hover:bg-muted/40",
                    isSelected && "bg-primary/15 ring-1 ring-primary/30",
                    isToday && !isSelected && "ring-1 ring-primary/40",
                  )}
                >
                  <span className={cn(isToday && "font-bold text-primary")}>
                    {format(day, "d")}
                  </span>
                  {hasWorkout && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-5">
            <p className="text-sm font-semibold capitalize">
              {format(parseISO(selectedDate), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            {selectedWorkouts.length === 0 ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Dumbbell className="h-4 w-4" />
                <span>Nenhum treino neste dia.</span>
                <Button size="sm" variant="secondary" className="ml-2 h-7" onClick={() => setDialogOpen(true)}>
                  <Plus className="h-3 w-3" /> Adicionar
                </Button>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {selectedWorkouts.map((w) => (
                  <div key={w.id} className="group flex items-center justify-between rounded-md border border-border/40 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium">
                          {ACTIVITY_LABELS[w.activity]}
                          {w.activity === "outro" && w.name && ` — ${w.name}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {w.duration ? `${w.duration} min` : ""}
                          {w.muscleGroups && w.muscleGroups.length > 0 ? ` · ${w.muscleGroups.join(", ")}` : ""}
                          {w.professor ? ` · Prof. ${w.professor}` : ""}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeWorkout(w.id)}
                      className="text-xs text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <WorkoutDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addWorkout} />
    </div>
  );
}
