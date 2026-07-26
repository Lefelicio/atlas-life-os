import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/features/finance/utils";

export type ActivityType =
  | "transaction"
  | "account"
  | "card"
  | "category"
  | "goal"
  | "objective"
  | "project"
  | "patrimony"
  | "weight"
  | "workout"
  | "planning"
  | "theme"
  | "backup"
  | "system";

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  transaction: "Lançamento",
  account: "Conta",
  card: "Cartão",
  category: "Categoria",
  goal: "Meta",
  objective: "Objetivo",
  project: "Projeto",
  patrimony: "Patrimônio",
  weight: "Peso",
  workout: "Treino",
  planning: "Planejamento",
  theme: "Tema",
  backup: "Backup",
  system: "Sistema",
};

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  action: string;
  description?: string;
  source: string;
  timestamp: string;
}

interface ActivityState {
  entries: ActivityEntry[];
  hydrated: boolean;
  log: (entry: Omit<ActivityEntry, "id" | "timestamp">) => void;
  clear: () => void;
}

export const useActivity = create<ActivityState>()(
  persist(
    (set) => ({
      entries: [],
      hydrated: false,
      log: (entry) =>
        set((s) => ({
          entries: [
            { ...entry, id: uid(), timestamp: new Date().toISOString() },
            ...s.entries,
          ].slice(0, 500),
        })),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "atlas-activity-v1",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
