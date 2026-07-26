import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useActivity } from "@/features/activity/store";
import type { WeightEntry } from "../types";

const KEY = "weights";

export interface WeightRow {
  id: string;
  date: string;
  weight: number;
  notes: string | null;
  created_at: string;
}

function toWeight(r: WeightRow): WeightEntry {
  return {
    id: r.id,
    date: r.date,
    weight: Number(r.weight),
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  };
}

export function useWeights() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pesos")
        .select("*")
        .order("date", { ascending: true });
      if (error) throw error;
      return (data as WeightRow[]).map(toWeight);
    },
  });

  const create = useMutation({
    mutationFn: async (input: { date: string; weight: number; notes?: string }) => {
      const { data, error } = await supabase
        .from("pesos")
        .insert({
          date: input.date,
          weight: input.weight,
          notes: input.notes ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return toWeight(data as WeightRow);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      useActivity.getState().log({
        type: "weight",
        action: "Peso registrado",
        description: `${variables.weight} kg`,
        source: "pessoal-hooks",
      });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("pesos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    weights: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    addWeight: create.mutateAsync,
    removeWeight: remove.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}
