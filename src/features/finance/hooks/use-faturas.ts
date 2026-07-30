import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useActivity } from "@/features/activity/store";
import type { Fatura, FaturaStatus, Transaction, PaymentMethod } from "../types";
import {
  computeCompetenceMonth,
  computeFaturaDueDate,
  computeFaturaClosingDate,
} from "../utils";

const KEY = "faturas";

export interface FaturaRow {
  id: string;
  card_id: string;
  competence_month: string;
  due_date: string | null;
  closing_date: string | null;
  amount: number;
  status: string;
  paid_at: string | null;
  paid_from_account_id: string | null;
  paid_amount: number;
  created_at: string;
}

function toFatura(r: FaturaRow): Fatura {
  return {
    id: r.id,
    cardId: r.card_id,
    competenceMonth: r.competence_month,
    dueDate: r.due_date ?? undefined,
    closingDate: r.closing_date ?? undefined,
    amount: Number(r.amount) ?? 0,
    status: r.status as FaturaStatus,
    paidAt: r.paid_at ?? undefined,
    paidFromAccountId: r.paid_from_account_id ?? undefined,
    paidAmount: Number(r.paid_amount) ?? 0,
    createdAt: r.created_at,
  };
}

export function useFaturas() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: [KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faturas")
        .select("*")
        .order("competence_month", { ascending: false });
      if (error) throw error;
      return (data as FaturaRow[]).map(toFatura);
    },
  });

  /**
   * Pay an invoice: reduces the paying account balance, marks the invoice as paid,
   * and creates a "Pagamento da Fatura" transaction.
   */
  const payFatura = useMutation({
    mutationFn: async (input: {
      faturaId: string;
      accountId: string;
      amount: number;
      date: string;
    }) => {
      // 1. Mark the invoice as paid
      const { data: faturaData, error: faturaError } = await supabase
        .from("faturas")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          paid_from_account_id: input.accountId,
          paid_amount: input.amount,
        })
        .eq("id", input.faturaId)
        .select()
        .single();
      if (faturaError) throw faturaError;

      const fatura = toFatura(faturaData as FaturaRow);

      // 2. Link all open credit transactions for this card+month to the paid invoice
      await supabase
        .from("transacoes")
        .update({ fatura_id: input.faturaId })
        .eq("card_id", fatura.cardId)
        .eq("competence_month", fatura.competenceMonth)
        .is("fatura_id", null);

      // 3. Create the "Pagamento da Fatura" transaction (reduces account balance)
      const { data: cardData } = await supabase
        .from("cartoes")
        .select("name")
        .eq("id", fatura.cardId)
        .single();

      const { error: txError } = await supabase.from("transacoes").insert({
        kind: "expense",
        date: input.date,
        conta_id: input.accountId,
        description: `Pagamento da Fatura — ${cardData?.name ?? "Cartão"}`,
        amount: input.amount,
        payment_method: "debit" as PaymentMethod,
        fatura_id: input.faturaId,
      });
      if (txError) throw txError;

      return fatura;
    },
    onSuccess: (fatura) => {
      qc.invalidateQueries({ queryKey: [KEY] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      useActivity.getState().log({
        type: "transaction",
        action: "Fatura paga",
        description: `Fatura ${fatura.competenceMonth} quitada`,
        source: "finance-hooks",
      });
      toast.success("Fatura paga com sucesso.");
    },
  });

  /**
   * Create or update an invoice for a card + competence month.
   * Called when a credit transaction is added/updated.
   */
  const upsertFatura = useMutation({
    mutationFn: async (input: {
      cardId: string;
      competenceMonth: string;
      dueDay: number;
      closingDay: number;
      amount: number;
    }) => {
      const dueDate = computeFaturaDueDate(input.competenceMonth, input.dueDay);
      const closingDate = computeFaturaClosingDate(input.competenceMonth, input.closingDay);

      const { data, error } = await supabase
        .from("faturas")
        .upsert(
          {
            card_id: input.cardId,
            competence_month: input.competenceMonth,
            due_date: dueDate,
            closing_date: closingDate,
            amount: input.amount,
            status: "open",
          },
          { onConflict: "card_id,competence_month" },
        )
        .select()
        .single();
      if (error) throw error;
      return toFatura(data as FaturaRow);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  });

  return {
    faturas: query.data ?? [],
    loading: query.isLoading,
    error: query.error,
    payFatura: payFatura.mutateAsync,
    upsertFatura: upsertFatura.mutateAsync,
    refresh: () => qc.invalidateQueries({ queryKey: [KEY] }),
  };
}

/**
 * Helper: compute the competence month for a credit transaction,
 * given the card's closing day.
 */
export function getCompetenceMonth(date: string, closingDay: number): string {
  return computeCompetenceMonth(date, closingDay);
}
