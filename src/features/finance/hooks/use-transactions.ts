import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useActivity } from "@/features/activity/store";
import type { Transaction, TxKind } from "../types";

const KEY = "transactions";

export interface TransactionRow {
  id: string;
  kind: string;
  date: string;
  conta_id: string;
  categoria_id: string | null;
  description: string;
  amount: number;
  notes: string | null;
  created_at: string;
}

function toTransaction(r: TransactionRow): Transaction {
  return {
    id: r.id,
    kind: r.kind as TxKind,
    date: r.date,
    accountId: r.conta_id,
    categoryId: r.categoria_id ?? undefined,
    description: r.description,
    amount: Number(r.amount) ?? 0,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  };
}

function fromTransaction(t: Omit<Transaction, "id" | "createdAt">): Record<string, unknown> {
  return {
    kind: t.kind,
    date: t.date,
    conta_id: t.accountId,
    categoria_id: t.categoryId ?? null,
    description: t.description,
    amount: t.amount,
    notes: t.notes ?? null,
  };
}

export function useTransactions() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transacoes")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as TransactionRow[]).map(toTransaction);
    },
  });

  const create = useMutation({
    mutationFn: async (input: Omit<Transaction, "id" | "createdAt">) => {
      const { data, error } = await supabase
        .from("transacoes")
        .insert(fromTransaction(input))
        .select()
        .single();
      if (error) throw error;
      return toTransaction(data as TransactionRow);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      useActivity.getState().log({
        type: "transaction",
        action:
          variables.kind === "income"
            ? "Nova receita cadastrada"
            : variables.kind === "expense"
              ? "Nova despesa cadastrada"
              : "Transferência cadastrada",
        description: `${variables.description} · ${variables.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
        source: "finance-hooks",
      });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Transaction> }) => {
      const patch: Record<string, unknown> = {};
      if (data.kind !== undefined) patch.kind = data.kind;
      if (data.date !== undefined) patch.date = data.date;
      if (data.accountId !== undefined) patch.conta_id = data.accountId;
      if (data.categoryId !== undefined) patch.categoria_id = data.categoryId ?? null;
      if (data.description !== undefined) patch.description = data.description;
      if (data.amount !== undefined) patch.amount = data.amount;
      if (data.notes !== undefined) patch.notes = data.notes ?? null;
      const { error } = await supabase.from("transacoes").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transacoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    transactions: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    create: create.mutateAsync,
    update: update.mutateAsync,
    delete: remove.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}
