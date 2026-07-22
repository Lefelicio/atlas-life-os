import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Profile,
  WeightEntry,
  Workout,
  TimelineEvent,
  TimelineEventType,
  WorkoutInput,
} from "./types";
import { uid } from "@/features/finance/utils";

interface PessoalState {
  profile: Profile;
  weights: WeightEntry[];
  workouts: Workout[];
  timeline: TimelineEvent[];
  hydrated: boolean;

  // profile
  updateProfile: (data: Partial<Profile>) => void;

  // weight
  addWeight: (data: { date: string; weight: number; notes?: string }) => void;
  removeWeight: (id: string) => void;

  // workouts
  addWorkout: (data: WorkoutInput) => void;
  removeWorkout: (id: string) => void;

  // timeline
  addTimelineEvent: (data: Omit<TimelineEvent, "id">) => void;
  removeTimelineEvent: (id: string) => void;
}

function checkTimelineForWeight(
  prev: WeightEntry[] | undefined,
  next: WeightEntry[],
  timeline: TimelineEvent[],
  addEvent: (e: Omit<TimelineEvent, "id">) => void,
) {
  if (!prev || prev.length === 0) return;
  const oldCurrent = [...prev].sort((a, b) => b.date.localeCompare(a.date))[0];
  const newCurrent = [...next].sort((a, b) => b.date.localeCompare(a.date))[0];
  if (oldCurrent && newCurrent) {
    const diff = Math.round((newCurrent.weight - oldCurrent.weight) * 10) / 10;
    if (Math.abs(diff) >= 0.1) {
      addEvent({
        type: "weight-change",
        title: `Peso ${diff > 0 ? "+" : ""}${diff.toFixed(1).replace(".", ",")} kg`,
        description: `De ${oldCurrent.weight.toFixed(1)} kg para ${newCurrent.weight.toFixed(1)} kg`,
        date: new Date().toISOString(),
        metadata: { from: oldCurrent.weight, to: newCurrent.weight },
      });
    }
  }
}

function checkGoalReached(
  weight: number,
  goal: number | undefined,
  timeline: TimelineEvent[],
  addEvent: (e: Omit<TimelineEvent, "id">) => void,
) {
  if (goal === undefined) return;
  const already = timeline.some(
    (e) => e.type === "goal-reached" && e.metadata?.goal === goal,
  );
  const tolerance = 0.5;
  if (!already && Math.abs(weight - goal) <= tolerance) {
    addEvent({
      type: "goal-reached",
      title: "Meta de peso atingida!",
      description: `Você alcançou seu peso objetivo de ${goal.toFixed(1)} kg`,
      date: new Date().toISOString(),
      metadata: { goal },
    });
  }
}

export const usePessoal = create<PessoalState>()(
  persist(
    (set, get) => ({
      profile: { name: "" },
      weights: [],
      workouts: [],
      timeline: [],
      hydrated: false,

      updateProfile: (data) =>
        set((s) => {
          const prevGoal = s.profile.weightGoal;
          const newGoal = data.weightGoal ?? prevGoal;
          const events = [...s.timeline];

          if (newGoal !== undefined && prevGoal !== newGoal && prevGoal === undefined) {
            events.push({
              id: uid(),
              type: "new-goal",
              title: "Novo objetivo definido",
              description: `Peso objetivo: ${newGoal.toFixed(1)} kg`,
              date: new Date().toISOString(),
              metadata: { goal: newGoal },
            });
          }

          return { profile: { ...s.profile, ...data }, timeline: events };
        }),

      addWeight: (data) =>
        set((s) => {
          const entry: WeightEntry = {
            ...data,
            id: uid(),
            createdAt: new Date().toISOString(),
          };
          const next = [...s.weights, entry].sort((a, b) =>
            a.date.localeCompare(b.date),
          );
          const events = [...s.timeline];
          const addEvent = (e: Omit<TimelineEvent, "id">) => events.push({ ...e, id: uid() });
          checkTimelineForWeight(s.weights, next, s.timeline, addEvent);
          if (s.profile.weightGoal !== undefined) {
            checkGoalReached(entry.weight, s.profile.weightGoal, s.timeline, addEvent);
          }
          return { weights: next, timeline: events };
        }),

      removeWeight: (id) =>
        set((s) => ({ weights: s.weights.filter((w) => w.id !== id) })),

      addWorkout: (data) =>
        set((s) => {
          const workout: Workout = {
            ...data,
            id: uid(),
            createdAt: new Date().toISOString(),
          };
          const events = [...s.timeline];
          if (s.workouts.length === 0) {
            events.push({
              id: uid(),
              type: "first-workout",
              title: "Primeiro treino registrado!",
              description: `Você registrou seu primeiro treino. Começou uma nova jornada.`,
              date: new Date().toISOString(),
            });
          }
          const total = s.workouts.length + 1;
          if (total === 10 || total === 25 || total === 50 || total === 100) {
            events.push({
              id: uid(),
              type: "workout-milestone",
              title: `${total} treinos completos!`,
              description: `Você alcançou ${total} treinos registrados.`,
              date: new Date().toISOString(),
              metadata: { count: total },
            });
          }
          return {
            workouts: [workout, ...s.workouts],
            timeline: events,
          };
        }),

      removeWorkout: (id) =>
        set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),

      addTimelineEvent: (data) =>
        set((s) => ({
          timeline: [
            { ...data, id: uid() },
            ...s.timeline,
          ].sort((a, b) => b.date.localeCompare(a.date)),
        })),

      removeTimelineEvent: (id) =>
        set((s) => ({ timeline: s.timeline.filter((e) => e.id !== id) })),
    }),
    {
      name: "atlas-pessoal-v1",
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    },
  ),
);
