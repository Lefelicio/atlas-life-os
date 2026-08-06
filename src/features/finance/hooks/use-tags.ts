import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Tag } from "@/features/finance/types";
import { FINANCE_KEYS, ALL_FINANCE_QUERY_KEYS } from "./query-keys";

const KEY = FINANCE_KEYS.tags;

export interface TagRow {
  id: string;
  name: string;
  color: string;
}

function toTag(r: TagRow): Tag {
  return { id: r.id, name: r.name, color: r.color };
}

export function useTags() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as TagRow[]).map(toTag);
    },
  });

  const create = useMutation({
    mutationFn: async (input: Omit<Tag, "id">) => {
      const { data, error } = await supabase
        .from("tags")
        .insert({ name: input.name, color: input.color })
        .select()
        .single();
      if (error) throw error;
      return toTag(data as TagRow);
    },
    onSuccess: () => ALL_FINANCE_QUERY_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: [...k] })),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Tag> }) => {
      const patch: Record<string, unknown> = {};
      if (data.name !== undefined) patch.name = data.name;
      if (data.color !== undefined) patch.color = data.color;
      const { error } = await supabase.from("tags").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => ALL_FINANCE_QUERY_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: [...k] })),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => ALL_FINANCE_QUERY_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: [...k] })),
  });

  return {
    tags: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    addTag: create.mutateAsync,
    updateTag: update.mutateAsync,
    removeTag: remove.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}
