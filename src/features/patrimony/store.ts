import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/features/finance/utils";
import { useActivity } from "@/features/activity/store";
import type { AssetEntry, AssetInput } from "./types";

interface PatrimonyState {
  entries: AssetEntry[];
  hydrated: boolean;

  addEntry: (data: AssetInput) => void;
  removeEntry: (id: string) => void;
}

export const usePatrimony = create<PatrimonyState>()(
  persist(
    (set) => ({
      entries: [],
      hydrated: false,

      addEntry: (data) =>
        set((s) => {
          useActivity.getState().log({
            type: "patrimony",
            action: "Aporte registrado",
            description: `${data.institution} · ${data.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
            source: "patrimony-store",
          });
          return {
            entries: [
              { ...data, id: uid(), createdAt: new Date().toISOString() },
              ...s.entries,
            ],
          };
        }),

      removeEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    {
      name: "atlas-patrimony-v1",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
