import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useActivity } from "@/features/activity/store";
import type {
  Objective,
  ObjectiveInput,
  ObjectiveStatus,
  ObjectiveKind,
  ObjectiveCategory,
  RecurrenceFrequency,
  AutoMetric,
} from "../types";

const KEY = "objectives";

export interface ObjetivoRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: string;
  kind: string;
  deadline: string | null;
  current_value: number | null;
  target_value: number | null;
  current_count: number | null;
  target_count: number | null;
  unit: string | null;
  created_at: string;
  updated_at: string;
}

function toObjective(r: ObjetivoRow): Objective {
  const kind = (r.kind || "manual") as ObjectiveKind;
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    category: (r.category || "pessoal") as ObjectiveCategory,
    status: (r.status || "active") as ObjectiveStatus,
    kind,
    deadline: r.deadline ?? undefined,
    progressType: "manual",
    currentValue: r.current_value ?? undefined,
    targetValue: r.target_value ?? undefined,
    currentCount: r.current_count ?? undefined,
    targetCount: r.target_count ?? undefined,
    unit: r.unit ?? undefined,
    manualCurrent: r.current_value ?? r.current_count ?? undefined,
    manualTarget: r.target_value ?? r.target_count ?? undefined,
    history: [],
    timeline: [],
    lastUpdated: r.updated_at,
    createdAt: r.created_at,
  };
}

function toRow(input: ObjectiveInput): Record<string, unknown> {
  const row: Record<string, unknown> = {
    title: input.title,
    description: input.description ?? null,
    category: input.category,
    kind: input.kind,
    deadline: input.deadline ?? null,
  };
  if (input.kind === "financeiro") {
    row.current_value = input.currentValue ?? input.manualCurrent ?? 0;
    row.target_value = input.targetValue ?? input.manualTarget ?? 0;
  } else if (input.kind === "quantidade") {
    row.current_count = input.currentCount ?? input.manualCurrent ?? 0;
    row.target_count = input.targetCount ?? input.manualTarget ?? 0;
    row.unit = input.unit ?? null;
  } else if (input.kind === "recorrente") {
    row.target_count = input.perPeriodTarget ?? input.manualTarget ?? 1;
  } else {
    row.current_value = input.manualCurrent ?? null;
    row.target_value = input.manualTarget ?? null;
  }
  return row;
}

export function useObjetivos() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("objetivos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as ObjetivoRow[]).map(toObjective);
    },
  });

  const create = useMutation({
    mutationFn: async (input: ObjectiveInput) => {
      const { data, error } = await supabase
        .from("objetivos")
        .insert(toRow(input))
        .select()
        .single();
      if (error) throw error;
      useActivity.getState().log({
        type: "objective",
        action: "Novo objetivo criado",
        description: input.title,
        source: "objetivos-hook",
      });
      return toObjective(data as ObjetivoRow);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ObjectiveInput> }) => {
      const patch: Record<string, unknown> = {};
      if (data.title !== undefined) patch.title = data.title;
      if (data.description !== undefined) patch.description = data.description ?? null;
      if (data.category !== undefined) patch.category = data.category;
      if (data.kind !== undefined) patch.kind = data.kind;
      if (data.deadline !== undefined) patch.deadline = data.deadline ?? null;
      if (data.manualCurrent !== undefined) {
        patch.current_value = data.manualCurrent;
        patch.current_count = data.manualCurrent;
      }
      if (data.manualTarget !== undefined) {
        patch.target_value = data.manualTarget;
        patch.target_count = data.manualTarget;
      }
      if (data.currentValue !== undefined) patch.current_value = data.currentValue;
      if (data.targetValue !== undefined) patch.target_value = data.targetValue;
      if (data.currentCount !== undefined) patch.current_count = data.currentCount;
      if (data.targetCount !== undefined) patch.target_count = data.targetCount;
      if (data.unit !== undefined) patch.unit = data.unit ?? null;
      const { error } = await supabase.from("objetivos").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ObjectiveStatus }) => {
      const { error } = await supabase
        .from("objetivos")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("objetivos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const recordProgress = useMutation({
    mutationFn: async ({ id, current }: { id: string; current: number }) => {
      const { error } = await supabase
        .from("objetivos")
        .update({ current_value: current, current_count: current })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    objectives: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    addObjective: create.mutateAsync,
    updateObjective: update.mutateAsync,
    setStatus: (id: string, status: ObjectiveStatus) =>
      setStatus.mutateAsync({ id, status }),
    removeObjective: remove.mutateAsync,
    recordProgress: (id: string, current: number) =>
      recordProgress.mutateAsync({ id, current }),
    toggleCheckin: async () => {},
    addTimelineEvent: async () => {},
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}
