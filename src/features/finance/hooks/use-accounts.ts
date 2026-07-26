import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Account } from "../types";

const KEY = "accounts";

export interface AccountRow {
  id: string;
  name: string;
  color: string;
  initial_balance: number;
  kind: string;
  created_at: string;
}

function toAccount(r: AccountRow): Account {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    initialBalance: Number(r.initial_balance) ?? 0,
    createdAt: r.created_at,
  };
}

function fromAccount(a: Omit<Account, "id" | "createdAt">): Record<string, unknown> {
  return {
    name: a.name,
    color: a.color,
    initial_balance: a.initialBalance,
    kind: "conta",
  };
}

export function useAccounts() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as AccountRow[]).map(toAccount);
    },
  });

  const create = useMutation({
    mutationFn: async (input: Omit<Account, "id" | "createdAt">) => {
      const { data, error } = await supabase
        .from("contas")
        .insert(fromAccount(input))
        .select()
        .single();
      if (error) throw error;
      return toAccount(data as AccountRow);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Account> }) => {
      const patch: Record<string, unknown> = {};
      if (data.name !== undefined) patch.name = data.name;
      if (data.color !== undefined) patch.color = data.color;
      if (data.initialBalance !== undefined) patch.initial_balance = data.initialBalance;
      const { error } = await supabase.from("contas").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });

  return {
    accounts: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    create: create.mutateAsync,
    update: update.mutateAsync,
    delete: remove.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}
