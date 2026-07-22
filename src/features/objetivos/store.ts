import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/features/finance/utils";
import type {
  Objective,
  ObjectiveInput,
  ObjectiveStatus,
  ObjectiveTimelineEvent,
} from "./types";
import { objectiveProgress } from "./resolver";

interface ObjetivosState {
  objectives: Objective[];
  hydrated: boolean;

  addObjective: (data: ObjectiveInput) => void;
  updateObjective: (id: string, data: Partial<ObjectiveInput>) => void;
  removeObjective: (id: string) => void;
  setStatus: (id: string, status: ObjectiveStatus) => void;
  addTimelineEvent: (id: string, event: Omit<ObjectiveTimelineEvent, "id">) => void;
}

function makeEvent(
  type: ObjectiveTimelineEvent["type"],
  title: string,
  description?: string,
  metadata?: Record<string, string | number>,
): Omit<ObjectiveTimelineEvent, "id"> {
  return { type, title, description, date: new Date().toISOString(), metadata };
}

export const useObjetivos = create<ObjetivosState>()(
  persist(
    (set, get) => ({
      objectives: [],
      hydrated: false,

      addObjective: (data) =>
        set((s) => {
          const now = new Date().toISOString();
          const obj: Objective = {
            ...data,
            id: uid(),
            status: data.status ?? "active",
            timeline: [
              { ...makeEvent("created", "Objetivo criado", data.description), id: uid() },
            ],
            lastUpdated: now,
            createdAt: now,
          };
          return { objectives: [obj, ...s.objectives] };
        }),

      updateObjective: (id, data) =>
        set((s) => ({
          objectives: s.objectives.map((o) => {
            if (o.id !== id) return o;
            const events = [...o.timeline];
            const now = new Date().toISOString();

            if (data.manualTarget !== undefined && data.manualTarget !== o.manualTarget) {
              events.push({
                ...makeEvent(
                  "target_changed",
                  "Meta alterada",
                  `Nova meta: ${data.manualTarget}`,
                  { from: o.manualTarget ?? 0, to: data.manualTarget },
                ),
                id: uid(),
              });
            }

            const updated: Objective = {
              ...o,
              ...data,
              timeline: events,
              lastUpdated: now,
            };

            const prevPct = objectiveProgress(o);
            const newPct = objectiveProgress(updated);
            if (newPct >= 100 && prevPct < 100 && updated.status === "active") {
              updated.status = "completed";
              events.push({
                ...makeEvent("completed", "Objetivo concluído!", "Você alcançou sua meta."),
                id: uid(),
              });
            } else if (
              (newPct >= 25 && prevPct < 25) ||
              (newPct >= 50 && prevPct < 50) ||
              (newPct >= 75 && prevPct < 75)
            ) {
              events.push({
                ...makeEvent("progress_milestone", `${newPct}% concluído`),
                id: uid(),
              });
            }

            return updated;
          }),
        })),

      removeObjective: (id) =>
        set((s) => ({ objectives: s.objectives.filter((o) => o.id !== id) })),

      setStatus: (id, status) =>
        set((s) => ({
          objectives: s.objectives.map((o) => {
            if (o.id !== id) return o;
            const events = [...o.timeline];
            if (o.status !== status) {
              events.push({
                ...makeEvent(
                  "status_changed",
                  `Status: ${status === "active" ? "Em andamento" : status === "completed" ? "Concluído" : "Pausado"}`,
                ),
                id: uid(),
              });
            }
            if (status === "completed" && o.status !== "completed") {
              events.push({
                ...makeEvent("completed", "Objetivo concluído!"),
                id: uid(),
              });
            }
            return {
              ...o,
              status,
              timeline: events,
              lastUpdated: new Date().toISOString(),
            };
          }),
        })),

      addTimelineEvent: (id, event) =>
        set((s) => ({
          objectives: s.objectives.map((o) =>
            o.id === id
              ? {
                  ...o,
                  timeline: [...o.timeline, { ...event, id: uid() }].sort(
                    (a, b) => b.date.localeCompare(a.date),
                  ),
                }
              : o,
          ),
        })),
    }),
    {
      name: "atlas-objetivos-v1",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
