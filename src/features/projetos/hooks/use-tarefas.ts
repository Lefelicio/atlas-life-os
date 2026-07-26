import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useActivity } from "@/features/activity/store";
import type { Task, TaskInput, TaskStatus } from "../types";

const KEY = "tasks";

export interface TarefaRow {
  id: string;
  projeto_id: string | null;
  objetivo_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function toTask(r: TarefaRow): Task {
  return {
    id: r.id,
    projectId: r.projeto_id ?? undefined,
    objetivoId: r.objetivo_id ?? undefined,
    title: r.title,
    description: r.description ?? undefined,
    status: (r.status || "pending") as TaskStatus,
    priority: (r.priority || "media") as Task["priority"],
    dueDate: r.due_date ?? undefined,
    completedAt: r.completed_at ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function fromInput(input: TaskInput): Record<string, unknown> {
  return {
    projeto_id: input.projectId ?? null,
    objetivo_id: input.objetivoId ?? null,
    title: input.title,
    description: input.description ?? null,
    status: input.status,
    priority: input.priority,
    due_date: input.dueDate ?? null,
  };
}

export function useTasks() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as TarefaRow[]).map(toTask);
    },
  });

  const create = useMutation({
    mutationFn: async (input: TaskInput) => {
      const { data, error } = await supabase
        .from("tarefas")
        .insert(fromInput(input))
        .select()
        .single();
      if (error) throw error;
      useActivity.getState().log({
        type: "project",
        action: "Nova tarefa criada",
        description: input.title,
        source: "tarefas-hook",
      });
      return toTask(data as TarefaRow);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskInput> }) => {
      const patch: Record<string, unknown> = {};
      if (data.title !== undefined) patch.title = data.title;
      if (data.description !== undefined) patch.description = data.description ?? null;
      if (data.status !== undefined) patch.status = data.status;
      if (data.priority !== undefined) patch.priority = data.priority;
      if (data.dueDate !== undefined) patch.due_date = data.dueDate ?? null;
      if (data.projectId !== undefined) patch.projeto_id = data.projectId ?? null;
      if (data.objetivoId !== undefined) patch.objetivo_id = data.objetivoId ?? null;
      if (data.status === "completed") patch.completed_at = new Date().toISOString();
      if (data.status && data.status !== "completed") patch.completed_at = null;
      const { error } = await supabase.from("tarefas").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tarefas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    tasks: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    addTask: create.mutateAsync,
    updateTask: update.mutateAsync,
    removeTask: remove.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}
