import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Card, CardBrand } from "../types";

const KEY = "cards";

export interface CardRow {
  id: string;
  account_id: string;
  name: string;
  bank: string;
  brand: string;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  color: string;
  active: boolean;
  notes: string | null;
  created_at: string;
}

function toCard(r: CardRow): Card {
  return {
    id: r.id,
    accountId: r.account_id,
    name: r.name,
    bank: r.bank,
    brand: r.brand as CardBrand,
    limit: Number(r.limit_amount) ?? 0,
    closingDay: r.closing_day,
    dueDay: r.due_day,
    color: r.color,
    active: r.active,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  };
}

export function useCards() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cartoes")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as CardRow[]).map(toCard);
    },
  });

  const create = useMutation({
    mutationFn: async (input: Omit<Card, "id" | "createdAt">) => {
      const { data, error } = await supabase
        .from("cartoes")
        .insert({
          account_id: input.accountId,
          name: input.name,
          bank: input.bank,
          brand: input.brand,
          limit_amount: input.limit,
          closing_day: input.closingDay,
          due_day: input.dueDay,
          color: input.color,
          active: input.active,
          notes: input.notes ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return toCard(data as CardRow);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Card> }) => {
      const patch: Record<string, unknown> = {};
      if (data.name !== undefined) patch.name = data.name;
      if (data.bank !== undefined) patch.bank = data.bank;
      if (data.brand !== undefined) patch.brand = data.brand;
      if (data.limit !== undefined) patch.limit_amount = data.limit;
      if (data.closingDay !== undefined) patch.closing_day = data.closingDay;
      if (data.dueDay !== undefined) patch.due_day = data.dueDay;
      if (data.color !== undefined) patch.color = data.color;
      if (data.active !== undefined) patch.active = data.active;
      if (data.notes !== undefined) patch.notes = data.notes ?? null;
      if (data.accountId !== undefined) patch.account_id = data.accountId;
      const { error } = await supabase.from("cartoes").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cartoes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["faturas"] });
    },
  });

  return {
    cards: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    create: create.mutateAsync,
    update: update.mutateAsync,
    delete: remove.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}
