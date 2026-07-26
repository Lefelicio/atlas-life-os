import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Wallet,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Plane,
  User,
  Circle,
  Flag,
  TrendingUp,
  Check,
  Pause,
  Play,
  Trash2,
  CalendarCheck,
  type LucideIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { Objective, ObjectiveCategory, ObjectiveTimelineEvent } from "../types";
import { CATEGORY_LABELS, STATUS_LABELS, KIND_LABELS, FREQUENCY_LABELS } from "../types";
import {
  objectiveProgress,
  objectiveCurrentValue,
  objectiveTargetValue,
  objectiveUnit,
  formatMetricValue,
} from "../resolver";
import { useObjetivos } from "@/features/objetivos/hooks/use-objetivos";
import { todayISO } from "@/features/finance/utils";

const CATEGORY_ICONS: Record<ObjectiveCategory, LucideIcon> = {
  financeiro: Wallet,
  saude: HeartPulse,
  estudos: GraduationCap,
  profissional: Briefcase,
  viagem: Plane,
  pessoal: User,
  outro: Circle,
};

const EVENT_ICONS: Record<string, LucideIcon> = {
  created: Flag,
  target_changed: TrendingUp,
  completed: Check,
  progress_milestone: TrendingUp,
  status_changed: Pause,
  custom: Circle,
  period_reset: Flag,
  checkin_done: CalendarCheck,
  checkin_missed: Circle,
};

interface Props {
  objective: Objective | null;
  onClose: () => void;
  onSetStatus: (id: string, status: Objective["status"]) => void;
  onRemove: (id: string) => void;
}

export function ObjectiveDetail({ objective, onClose, onSetStatus, onRemove }: Props) {
  const { toggleCheckin, recordProgress } = useObjetivos();

  if (!objective) return null;
  const Icon = CATEGORY_ICONS[objective.category];
  const pct = objectiveProgress(objective);
  const cur = objectiveCurrentValue(objective);
  const tgt = objectiveTargetValue(objective);
  const unit = objectiveUnit(objective);
  const events = [...objective.timeline].sort((a, b) => b.date.localeCompare(a.date));
  const history = [...objective.history].sort((a, b) => b.period.localeCompare(a.period));

  const kind = objective.kind ?? (objective.progressType === "auto" ? "auto" : "manual");
  const isCheckinType = kind === "checkin" || kind === "recorrente";
  const today = todayISO();
  const hasCheckedInToday = (objective.checkinDates ?? []).includes(today);

  const handleCheckin = () => {
    // checkin dates are local-only (no DB column)
  };

  const handleProgressUpdate = () => {
    const input = prompt("Novo valor atual:", String(cur ?? 0));
    if (input !== null) {
      const num = Number(input.replace(/[^\d.,-]/g, "").replace(",", "."));
      if (!isNaN(num)) recordProgress(objective.id, num);
    }
  };

  return (
    <Dialog open={!!objective} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle>{objective.title}</DialogTitle>
              <p className="text-xs text-muted-foreground">
                {CATEGORY_LABELS[objective.category]} · {KIND_LABELS[kind]} · {STATUS_LABELS[objective.status]}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {objective.description && (
            <p className="text-sm text-muted-foreground">{objective.description}</p>
          )}

          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-semibold tabular-nums">{pct}%</span>
              <span className="text-xs text-muted-foreground">
                {formatMetricValue(cur, unit)} / {formatMetricValue(tgt, unit)}
              </span>
            </div>
            <Progress value={pct} className="mt-2" />
          </div>

          {isCheckinType && (
            <Button
              onClick={handleCheckin}
              variant={hasCheckedInToday ? "secondary" : "default"}
              className="w-full"
            >
              <CalendarCheck className="h-4 w-4" />
              {hasCheckedInToday ? "Check-in feito hoje" : "Fazer check-in hoje"}
            </Button>
          )}

          {(kind === "financeiro" || kind === "quantidade" || kind === "personalizado" || kind === "manual") && (
            <Button onClick={handleProgressUpdate} variant="outline" className="w-full">
              <TrendingUp className="h-4 w-4" /> Atualizar progresso
            </Button>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Tipo</p>
              <p className="mt-0.5 font-medium">{KIND_LABELS[kind]}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Prazo</p>
              <p className="mt-0.5 font-medium">
                {objective.deadline
                  ? format(parseISO(objective.deadline), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : "Sem prazo"}
              </p>
            </div>
            {kind === "recorrente" && objective.frequency && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Frequência</p>
                <p className="mt-0.5 font-medium">{FREQUENCY_LABELS[objective.frequency]}</p>
              </div>
            )}
            {kind === "quantidade" && objective.unit && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">Unidade</p>
                <p className="mt-0.5 font-medium">{objective.unit}</p>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                Histórico mensal
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between rounded-md border border-border/30 px-3 py-1.5 text-xs"
                  >
                    <span className="text-muted-foreground">{h.period}</span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums">
                        {formatMetricValue(h.current, unit)} / {formatMetricValue(h.target, unit)}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {h.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              Linha do tempo
            </p>
            <div className="relative space-y-0 max-h-48 overflow-y-auto">
              <div className="absolute bottom-0 left-[15px] top-2 w-px bg-border/60" />
              {events.map((e: ObjectiveTimelineEvent) => {
                const EIcon = EVENT_ICONS[e.type] ?? Circle;
                return (
                  <div key={e.id} className="relative flex gap-3 pb-4 last:pb-0">
                    <div className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted/40 ring-4 ring-background">
                      <EIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-xs font-medium">{e.title}</p>
                      {e.description && (
                        <p className="text-[11px] text-muted-foreground">{e.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {format(parseISO(e.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 border-t border-border/40 pt-4">
            {objective.status === "paused" ? (
              <Button size="sm" variant="secondary" onClick={() => onSetStatus(objective.id, "active")}>
                <Play className="h-3.5 w-3.5" /> Retomar
              </Button>
            ) : objective.status !== "completed" ? (
              <Button size="sm" variant="secondary" onClick={() => onSetStatus(objective.id, "paused")}>
                <Pause className="h-3.5 w-3.5" /> Pausar
              </Button>
            ) : null}
            {objective.status !== "completed" && (
              <Button size="sm" variant="secondary" onClick={() => onSetStatus(objective.id, "completed")}>
                <Check className="h-3.5 w-3.5" /> Concluir
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="ml-auto text-destructive hover:text-destructive"
              onClick={() => {
                onRemove(objective.id);
                onClose();
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Excluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
