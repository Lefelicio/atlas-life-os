import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dumbbell,
  Scale,
  Target,
  Trophy,
  Flag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePessoal } from "../store";
import type { TimelineEventType } from "../types";

const ICONS: Partial<Record<TimelineEventType, LucideIcon>> = {
  "first-workout": Dumbbell,
  "weight-change": Scale,
  "goal-reached": Trophy,
  "new-goal": Target,
  "workout-milestone": Flag,
  custom: Sparkles,
};

const TONES: Partial<Record<TimelineEventType, string>> = {
  "first-workout": "bg-primary/10 text-primary",
  "goal-reached": "bg-success/10 text-success",
  "weight-change": "bg-blue-500/10 text-blue-500",
  "new-goal": "bg-amber-500/10 text-amber-500",
  "workout-milestone": "bg-primary/10 text-primary",
  custom: "bg-muted text-muted-foreground",
};

export function Timeline() {
  const { timeline } = usePessoal();

  const sorted = [...timeline].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Linha do tempo
      </p>

      {sorted.length === 0 ? (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Sua linha do tempo começará com o primeiro evento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-0">
          <div className="absolute bottom-0 left-[19px] top-2 w-px bg-border/60" />
          {sorted.map((event) => {
            const Icon = ICONS[event.type] ?? Sparkles;
            const tone = TONES[event.type] ?? "bg-muted text-muted-foreground";
            return (
              <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                <div className={cn("relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full ring-4 ring-background", tone)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 pt-1.5">
                  <p className="text-sm font-medium">{event.title}</p>
                  {event.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {format(parseISO(event.date), "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
