export type WorkoutActivity =
  | "musculacao"
  | "jiu-jitsu"
  | "corrida"
  | "caminhada"
  | "futebol"
  | "outro";

export const ACTIVITY_LABELS: Record<WorkoutActivity, string> = {
  musculacao: "Musculação",
  "jiu-jitsu": "Jiu-Jitsu",
  corrida: "Corrida",
  caminhada: "Caminhada",
  futebol: "Futebol",
  outro: "Outro",
};

export const ACTIVITY_ICONS: Record<WorkoutActivity, string> = {
  musculacao: "Dumbbell",
  "jiu-jitsu": "Swords",
  corrida: "Footprints",
  caminhada: "PersonStanding",
  futebol: "Volleyball",
  outro: "Activity",
};

export const MUSCLE_GROUPS = [
  "Peito",
  "Costas",
  "Perna",
  "Ombro",
  "Bíceps",
  "Tríceps",
  "Abdômen",
  "Cardio",
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export interface Profile {
  name: string;
  birthDate?: string; // ISO date
  height?: number; // cm
  weightGoal?: number; // kg
}

export interface WeightEntry {
  id: string;
  date: string; // ISO date
  weight: number; // kg
  notes?: string;
  createdAt: string;
}

export interface Workout {
  id: string;
  date: string; // ISO date (yyyy-MM-dd)
  activity: WorkoutActivity;
  name?: string; // for "outro"
  duration?: number; // minutes
  muscleGroups?: MuscleGroup[];
  professor?: string;
  notes?: string;
  createdAt: string;
}

export type TimelineEventType =
  | "first-workout"
  | "weight-change"
  | "goal-reached"
  | "new-goal"
  | "workout-milestone"
  | "custom";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  date: string; // ISO datetime
  metadata?: Record<string, string | number>;
}

export type WeightUnit = "kg";
