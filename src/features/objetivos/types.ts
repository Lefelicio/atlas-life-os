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

// Legacy progress type (kept for backward compatibility with existing data)
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

// ============ Sprint 7: Objective Types ============

export type ObjectiveKind =
  | "financeiro"
  | "quantidade"
  | "recorrente"
  | "checkin"
  | "personalizado"
  | "auto"
  | "manual"; // legacy

export const KIND_LABELS: Record<ObjectiveKind, string> = {
  financeiro: "Financeiro",
  quantidade: "Quantidade",
  recorrente: "Recorrente",
  checkin: "Check-in",
  personalizado: "Personalizado",
  auto: "Automático",
  manual: "Manual",
};

export const KIND_DESCRIPTIONS: Record<ObjectiveKind, string> = {
  financeiro: "Acompanhe metas financeiras com valor e prazo.",
  quantidade: "Conte coisas: livros, treinos, cursos, filmes.",
  recorrente: "Crie hábitos com frequência e meta por período.",
  checkin: "Registre apenas se fez ou não fez cada dia.",
  personalizado: "Defina seus próprios campos e acompanhamento.",
  auto: "Conecta automaticamente com métricas do Atlas.",
  manual: "Progresso manual com valor atual e meta.",
};

export type RecurrenceFrequency = "diaria" | "semanal" | "mensal" | "anual";

export const FREQUENCY_LABELS: Record<RecurrenceFrequency, string> = {
  diaria: "Diária",
  semanal: "Semanal",
  mensal: "Mensal",
  anual: "Anual",
};

export interface ObjectiveHistoryEntry {
  id: string;
  period: string; // "2026-07" for monthly, "2026-W29" for weekly, "2026" for yearly, "2026-07-23" for daily
  current: number;
  target: number;
  percentage: number;
  date: string;
}

export interface ObjectiveTemplate {
  kind: ObjectiveKind;
  title: string;
  category: ObjectiveCategory;
  description?: string;
}

export const OBJECTIVE_TEMPLATES: ObjectiveTemplate[] = [
  { kind: "quantidade", title: "Ler livros", category: "estudos", description: "Quantos livros quer ler este ano." },
  { kind: "quantidade", title: "Ganhar massa muscular", category: "saude", description: "Acompanhe treinos e progressão." },
  { kind: "financeiro", title: "Criar reserva financeira", category: "financeiro", description: "Construa sua reserva de emergência." },
  { kind: "recorrente", title: "Aprender inglês", category: "estudos", description: "Estudar inglês diariamente." },
  { kind: "recorrente", title: "Aprender espanhol", category: "estudos", description: "Estudar espanhol diariamente." },
  { kind: "financeiro", title: "Viajar", category: "viagem", description: "Economize para sua próxima viagem." },
  { kind: "checkin", title: "Emagrecer", category: "saude", description: "Acompanhe hábitos para emagrecer." },
  { kind: "recorrente", title: "Estudar", category: "estudos", description: "Rotina de estudos." },
  { kind: "financeiro", title: "Economizar", category: "financeiro", description: "Reduza gastos desnecessários." },
  { kind: "personalizado", title: "Outro", category: "outro", description: "Crie um objetivo totalmente personalizado." },
];

export interface ObjectiveTimelineEvent {
  id: string;
  type:
    | "created"
    | "target_changed"
    | "completed"
    | "progress_milestone"
    | "status_changed"
    | "custom"
    | "period_reset"
    | "checkin_done"
    | "checkin_missed";
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
  progressType: ProgressType; // legacy
  kind: ObjectiveKind;
  status: ObjectiveStatus;
  metric?: AutoMetric;
  manualCurrent?: number;
  manualTarget?: number;
  // Financeiro
  currentValue?: number;
  targetValue?: number;
  // Quantidade
  unit?: string;
  currentCount?: number;
  targetCount?: number;
  // Recorrente
  frequency?: RecurrenceFrequency;
  perPeriodTarget?: number;
  checkinDates?: string[]; // ISO dates when checkin was done
  // Check-in
  // (uses checkinDates too)
  // History
  history: ObjectiveHistoryEntry[];
  timeline: ObjectiveTimelineEvent[];
  lastUpdated: string;
  createdAt: string;
}

export type ObjectiveInput = Omit<
  Objective,
  "id" | "createdAt" | "timeline" | "history" | "lastUpdated" | "status"
> & { status?: ObjectiveStatus };
