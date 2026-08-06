import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useActivity } from "@/features/activity/store";
import type { Transaction, TxKind, PaymentMethod } from "../types";
import { computeCompetenceMonth } from "../utils";
import { FINANCE_KEYS, ALL_FINANCE_QUERY_KEYS } from "./query-keys";

const KEY = FINANCE_KEYS.transactions;

export interface TransactionRow {
  id: string;
  kind: string;
  date: string;
  conta_id: string;
  categoria_id: string | null;
  description: string;
  amount: number;
  notes: string | null;
  payment_method: string | null;
  card_id: string | null;
  fatura_id: string | null;
  competence_month: string | null;
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
    paymentMethod: (r.payment_method ?? "debit") as PaymentMethod,
    cardId: r.card_id ?? undefined,
    faturaId: r.fatura_id ?? undefined,
    competenceMonth: r.competence_month ?? undefined,
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
    payment_method: t.paymentMethod ?? "debit",
    card_id: t.cardId ?? null,
    fatura_id: t.faturaId ?? null,
    competence_month: t.competenceMonth ?? null,
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
      const enriched = { ...input };
      if (input.paymentMethod === "credit" && input.cardId && !input.competenceMonth) {
        const { data: card } = await supabase
          .from("cartoes")
          .select("closing_day")
          .eq("id", input.cardId)
          .single();
        const closingDay = (card as { closing_day: number } | null)?.closing_day ?? 1;
        enriched.competenceMonth = computeCompetenceMonth(input.date, closingDay);
      }
      const { data, error } = await supabase
        .from("transacoes")
        .insert(fromTransaction(enriched))
        .select()
        .single();
      if (error) throw error;
      return toTransaction(data as TransactionRow);
    },
    onSuccess: (_data, variables) => {
      ALL_FINANCE_QUERY_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: [...k] }));
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
      if (data.paymentMethod !== undefined) patch.payment_method = data.paymentMethod;
      if (data.cardId !== undefined) patch.card_id = data.cardId ?? null;
      if (data.faturaId !== undefined) patch.fatura_id = data.faturaId ?? null;
      if (data.competenceMonth !== undefined) patch.competence_month = data.competenceMonth;
      const { error } = await supabase.from("transacoes").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      ALL_FINANCE_QUERY_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: [...k] }));
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transacoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      ALL_FINANCE_QUERY_KEYS.forEach((k) => qc.invalidateQueries({ queryKey: [...k] }));
    },
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
