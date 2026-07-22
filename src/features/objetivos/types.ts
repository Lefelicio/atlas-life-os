export type ObjectiveCategory =
  | "financeiro"
  | "saude"
  | "estudos"
  | "profissional"
  | "viagem"
  | "pessoal"
  | "outro";

export const CATEGORY_LABELS: Record<ObjectiveCategory, string> = {
  financeiro: "Financeiro",
  saude: "Saúde",
  estudos: "Estudos",
  profissional: "Profissional",
  viagem: "Viagem",
  pessoal: "Pessoal",
  outro: "Outro",
};

export type ObjectiveStatus = "active" | "completed" | "paused";

export const STATUS_LABELS: Record<ObjectiveStatus, string> = {
  active: "Em andamento",
  completed: "Concluído",
  paused: "Pausado",
};

export type ProgressType = "auto" | "manual";

export type AutoMetric =
  | "finance_balance"
  | "finance_reserve"
  | "health_weight"
  | "health_workouts"
  | "study_days"
  | "tasks_done";

export const AUTO_METRIC_LABELS: Record<AutoMetric, string> = {
  finance_balance: "Saldo financeiro",
  finance_reserve: "Reserva financeira",
  health_weight: "Peso atual",
  health_workouts: "Quantidade de treinos",
  study_days: "Dias de estudo",
  tasks_done: "Tarefas concluídas",
};

export const AUTO_METRIC_AVAILABLE: Record<AutoMetric, boolean> = {
  finance_balance: true,
  finance_reserve: true,
  health_weight: true,
  health_workouts: true,
  study_days: false,
  tasks_done: false,
};

export interface ObjectiveTimelineEvent {
  id: string;
  type:
    | "created"
    | "target_changed"
    | "completed"
    | "progress_milestone"
    | "status_changed"
    | "custom";
  title: string;
  description?: string;
  date: string;
  metadata?: Record<string, string | number>;
}

export interface Objective {
  id: string;
  title: string;
  description?: string;
  category: ObjectiveCategory;
  deadline?: string;
  icon?: string;
  progressType: ProgressType;
  status: ObjectiveStatus;
  metric?: AutoMetric;
  manualCurrent?: number;
  manualTarget?: number;
  timeline: ObjectiveTimelineEvent[];
  lastUpdated: string;
  createdAt: string;
}

export type ObjectiveInput = Omit<
  Objective,
  "id" | "createdAt" | "timeline" | "lastUpdated" | "status"
> & { status?: ObjectiveStatus };
