import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Category } from "../types";

const KEY = "categories";

export interface CategoryRow {
  id: string;
  name: string;
  kind: string;
  color: string;
}

function toCategory(r: CategoryRow): Category {
  return {
    id: r.id,
    name: r.name,
    kind: r.kind === "income" ? "income" : "expense",
    color: r.color,
  };
}

export function useCategories() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as CategoryRow[]).map(toCategory);
    },
  });

  const create = useMutation({
    mutationFn: async (input: Omit<Category, "id">) => {
      const { data, error } = await supabase
        .from("categorias")
        .insert({ name: input.name, kind: input.kind, color: input.color })
        .select()
        .single();
      if (error) throw error;
      return toCategory(data as CategoryRow);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Category> }) => {
      const patch: Record<string, unknown> = {};
      if (data.name !== undefined) patch.name = data.name;
      if (data.color !== undefined) patch.color = data.color;
      if (data.kind !== undefined) patch.kind = data.kind;
      const { error } = await supabase.from("categorias").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categorias").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    categories: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    create: create.mutateAsync,
    update: update.mutateAsync,
    delete: remove.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}
