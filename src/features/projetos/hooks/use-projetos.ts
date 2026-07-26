import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useActivity } from "@/features/activity/store";
import type { Project, ProjectInput } from "../types";

const KEY = "projects";

export interface ProjetoRow {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

function toProject(r: ProjetoRow): Project {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? undefined,
    targetAmount: Number(r.target_amount) ?? 0,
    currentAmount: Number(r.current_amount) ?? 0,
    deadline: r.deadline ?? undefined,
    archived: r.archived,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function fromInput(input: ProjectInput): Record<string, unknown> {
  return {
    title: input.title,
    description: input.description ?? null,
    target_amount: input.targetAmount,
    current_amount: input.currentAmount,
    deadline: input.deadline ?? null,
    archived: input.archived ?? false,
  };
}

export function useProjects() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as ProjetoRow[]).map(toProject);
    },
  });

  const create = useMutation({
    mutationFn: async (input: ProjectInput) => {
      const { data, error } = await supabase
        .from("projetos")
        .insert(fromInput(input))
        .select()
        .single();
      if (error) throw error;
      useActivity.getState().log({
        type: "project",
        action: "Novo projeto criado",
        description: input.title,
        source: "projetos-hook",
      });
      return toProject(data as ProjetoRow);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProjectInput> }) => {
      const patch: Record<string, unknown> = {};
      if (data.title !== undefined) patch.title = data.title;
      if (data.description !== undefined) patch.description = data.description ?? null;
      if (data.targetAmount !== undefined) patch.target_amount = data.targetAmount;
      if (data.currentAmount !== undefined) patch.current_amount = data.currentAmount;
      if (data.deadline !== undefined) patch.deadline = data.deadline ?? null;
      if (data.archived !== undefined) patch.archived = data.archived;
      const { error } = await supabase.from("projetos").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projetos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    projects: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    addProject: create.mutateAsync,
    updateProject: update.mutateAsync,
    removeProject: remove.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}
