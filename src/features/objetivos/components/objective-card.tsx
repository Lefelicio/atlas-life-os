import { format, parseISO, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Wallet,
  HeartPulse,
  GraduationCap,
  Briefcase,
  Plane,
  User,
  Circle,
  MoreVertical,
  Pause,
  Play,
  Check,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import type { Objective, ObjectiveCategory, ObjectiveStatus } from "../types";
import { CATEGORY_LABELS, STATUS_LABELS } from "../types";
import { objectiveProgress } from "../resolver";

const CATEGORY_ICONS: Record<ObjectiveCategory, LucideIcon> = {
  financeiro: Wallet,
  saude: HeartPulse,
  estudos: GraduationCap,
  profissional: Briefcase,
  viagem: Plane,
  pessoal: User,
  outro: Circle,
};

const STATUS_COLORS: Record<ObjectiveStatus, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  paused: "bg-muted text-muted-foreground",
};

interface Props {
  objective: Objective;
  onOpen: () => void;
  onSetStatus: (status: ObjectiveStatus) => void;
  onRemove: () => void;
}

export function ObjectiveCard({ objective, onOpen, onSetStatus, onRemove }: Props) {
  const Icon = CATEGORY_ICONS[objective.category];
  const pct = objectiveProgress(objective);
  const deadline = objective.deadline ? parseISO(objective.deadline) : null;
  const daysLeft = deadline ? differenceInDays(deadline, new Date()) : null;
  const updated = format(parseISO(objective.lastUpdated), "dd/MM/yyyy", { locale: ptBR });

  return (
    <Card
      className={cn(
        "group relative cursor-pointer border-border/40 bg-card/40 transition hover:border-border hover:shadow-sm",
        objective.status === "paused" && "opacity-60",
        objective.status === "completed" && "border-success/30",
      )}
      onClick={onOpen}
    >
      {objective.status === "completed" && (
        <div className="absolute inset-x-0 top-0 h-1 bg-success" />
      )}
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{objective.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {CATEGORY_LABELS[objective.category]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_COLORS[objective.status])}>
              {STATUS_LABELS[objective.status]}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {objective.status === "paused" ? (
                  <DropdownMenuItem onClick={() => onSetStatus("active")}>
                    <Play className="h-3.5 w-3.5" /> Retomar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onSetStatus("paused")}>
                    <Pause className="h-3.5 w-3.5" /> Pausar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onSetStatus("completed")}>
                  <Check className="h-3.5 w-3.5" /> Concluir
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-semibold tabular-nums">{pct}%</span>
            {deadline && (
              <span className="text-[11px] text-muted-foreground">
                {daysLeft !== null && daysLeft >= 0
                  ? `${daysLeft} dias restantes`
                  : daysLeft !== null && daysLeft < 0
                    ? `${Math.abs(daysLeft)} dias atrás`
                    : format(deadline, "dd/MM/yyyy", { locale: ptBR })}
              </span>
            )}
          </div>
          <Progress value={pct} className="mt-2" />
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Atualizado em {updated}
        </p>
      </CardContent>
    </Card>
  );
}
