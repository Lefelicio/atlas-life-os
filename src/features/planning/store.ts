import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BudgetConfig, BudgetGroup, CategoryGroupMapping, PlanningState } from "./types";
import { guessGroup } from "./types";

const DEFAULT_CONFIG: BudgetConfig = {
  monthlyIncome: 0,
  percentages: { essenciais: 50, investimentos: 30, pessoal: 20 },
};

export const usePlanning = create<PlanningState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_CONFIG,
      categoryMappings: {},
      hydrated: false,

      setConfig: (partial) =>
        set((s) => ({ config: { ...s.config, ...partial } })),

      setPercentages: (percentages) => {
        const sum = Object.values(percentages).reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 100) > 0.01) return;
        set((s) => ({ config: { ...s.config, percentages } }));
      },

      setCategoryGroup: (categoryId, group) =>
        set((s) => ({
          categoryMappings: { ...s.categoryMappings, [categoryId]: group },
        })),

      autoMapCategories: (categories) =>
        set((s) => {
          const mappings = { ...s.categoryMappings };
          for (const c of categories) {
            if (!mappings[c.id]) {
              mappings[c.id] = guessGroup(c.name);
            }
          }
          return { categoryMappings: mappings };
        }),
    }),
    {
      name: "atlas-planning-v1",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);

export function groupBudget(config: BudgetConfig, group: BudgetGroup): number {
  return (config.monthlyIncome * config.percentages[group]) / 100;
}

export function validatePercentages(percentages: Record<BudgetGroup, number>): boolean {
  const sum = Object.values(percentages).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 100) < 0.01;
}
