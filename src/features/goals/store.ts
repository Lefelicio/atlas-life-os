import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Goal, GoalInput } from "./types";
import { uid } from "@/features/finance/utils";

interface GoalsState {
  goals: Goal[];
  hydrated: boolean;

  addGoal: (data: GoalInput) => void;
  updateGoal: (id: string, data: Partial<GoalInput>) => void;
  removeGoal: (id: string) => void;
  setPrimary: (id: string) => void;
  archiveGoal: (id: string) => void;
  contribute: (id: string, amount: number) => void;
}

export const useGoals = create<GoalsState>()(
  persist(
    (set) => ({
      goals: [],
      hydrated: false,

      addGoal: (data) =>
        set((s) => {
          const newGoal: Goal = {
            ...data,
            id: uid(),
            createdAt: new Date().toISOString(),
          };
          if (newGoal.isPrimary) {
            return {
              goals: [
                ...s.goals.map((g) => (g.isPrimary ? { ...g, isPrimary: false } : g)),
                newGoal,
              ],
            };
          }
          return { goals: [...s.goals, newGoal] };
        }),

      updateGoal: (id, data) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, ...data } : g,
          ),
        })),

      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      setPrimary: (id) =>
        set((s) => ({
          goals: s.goals.map((g) => ({
            ...g,
            isPrimary: g.id === id,
          })),
        })),

      archiveGoal: (id) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id ? { ...g, archived: !g.archived } : g,
          ),
        })),

      contribute: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) }
              : g,
          ),
        })),
    }),
    {
      name: "atlas-goals-v1",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export function goalProgress(goal: Goal): number {
  if (goal.targetAmount <= 0) return 0;
  return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
}

export function goalRemaining(goal: Goal): number {
  return Math.max(0, goal.targetAmount - goal.currentAmount);
}
