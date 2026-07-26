import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import type { Profile } from "../types";

const KEY = "profile";

export interface ProfileRow {
  id: string;
  name: string;
  height: number | null;
  target_weight: number | null;
  avatar_url: string | null;
  birth_date: string | null;
}

function toProfile(r: ProfileRow): Profile {
  return {
    name: r.name,
    height: r.height ? Number(r.height) : undefined,
    weightGoal: r.target_weight ? Number(r.target_weight) : undefined,
    birthDate: r.birth_date ?? undefined,
  };
}

export function useProfile() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, height, target_weight, avatar_url, birth_date")
        .maybeSingle();
      if (error) throw error;
      if (!data) return { name: "" } as Profile;
      return toProfile(data as ProfileRow);
    },
  });

  const upsert = useMutation({
    mutationFn: async (data: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Não autenticado.");
      const patch: Record<string, unknown> = {};
      if (data.name !== undefined) patch.name = data.name;
      if (data.height !== undefined) patch.height = data.height;
      if (data.weightGoal !== undefined) patch.target_weight = data.weightGoal;
      if (data.birthDate !== undefined) patch.birth_date = data.birthDate || null;
      const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      toast.success("Perfil atualizado com sucesso.");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    },
  });

  return {
    profile: query.data ?? { name: "" },
    loading: query.isLoading,
    error: query.error,
    updateProfile: upsert.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}
