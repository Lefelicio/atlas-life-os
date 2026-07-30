import { useMemo, useState } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, Wallet, CheckCircle2, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";

import { useFinance } from "../hooks/use-finance";
import {
  currency,
  formatCompetenceMonth,
  groupCreditByCompetence,
  totalAvailableLimit,
  totalOpenFaturas,
  nextFaturaDueDate,
} from "../utils";
import type { Card as CardT, Fatura } from "../types";

export function FaturasPanel() {
  const { cards, transactions, faturas, accounts, payFatura } = useFinance();
  const [payDialog, setPayDialog] = useState<{
    fatura: Fatura;
    card: CardT;
  } | null>(null);

  const openTotal = totalOpenFaturas(faturas);
  const availableLimit = totalAvailableLimit(cards, transactions);
  const nextDue = nextFaturaDueDate(cards, faturas);

  if (cards.length === 0) {
    return (
      <EmptyState
        title="Nenhum cartão cadastrado"
        description="Adicione um cartão de crédito em uma conta para gerenciar faturas."
        icon={<CreditCard className="h-4 w-4" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Total das faturas em aberto
            </p>
            <p className="mt-1.5 text-xl font-semibold tabular-nums text-destructive">
              {currency(openTotal)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Limite disponível
            </p>
            <p className="mt-1.5 text-xl font-semibold tabular-nums text-success">
              {currency(availableLimit)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Próximo vencimento
            </p>
            <p className="mt-1.5 text-xl font-semibold tabular-nums">
              {nextDue ? format(parseISO(nextDue.dueDate), "dd/MM/yyyy", { locale: ptBR }) : "—"}
            </p>
            {nextDue && (
              <p className="text-[11px] text-muted-foreground">{nextDue.card.name}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-card invoices */}
      {cards.map((card) => (
        <CardFaturas
          key={card.id}
          card={card}
          transactions={transactions}
          faturas={faturas.filter((f) => f.cardId === card.id)}
          onPay={(fatura) => setPayDialog({ fatura, card })}
        />
      ))}

      {payDialog && (
        <PayFaturaDialog
          open={!!payDialog}
          onOpenChange={(o) => !o && setPayDialog(null)}
          fatura={payDialog.fatura}
          card={payDialog.card}
          accounts={accounts}
          onPay={payFatura}
        />
      )}
    </div>
  );
}

function CardFaturas({
  card,
  transactions,
  faturas,
  onPay,
}: {
  card: CardT;
  transactions: ReturnType<typeof useFinance>["transactions"];
  faturas: Fatura[];
  onPay: (fatura: Fatura) => void;
}) {
  const groups = useMemo(
    () => groupCreditByCompetence(transactions, card.id),
    [transactions, card.id],
  );

  // Compute used limit
  const usedLimit = useMemo(() => {
    const cardTxs = transactions.filter(
      (t) => t.paymentMethod === "credit" && t.cardId === card.id && t.kind === "expense" && !t.faturaId,
    );
    return cardTxs.reduce((s, t) => s + t.amount, 0);
  }, [transactions, card.id]);

  const availableLimit = Math.max(0, card.limit - usedLimit);

  return (
    <Card className="border-border/40 bg-card/40">
      <CardContent className="p-4">
        {/* Card header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: card.color }}
            />
            <div>
              <p className="text-sm font-medium">{card.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {card.brand} · {card.bank || "—"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Limite disponível
            </p>
            <p className="text-sm font-semibold tabular-nums text-success">
              {currency(availableLimit)}
            </p>
          </div>
        </div>

        {/* Card stats */}
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Limite</p>
            <p className="text-sm font-semibold tabular-nums">{currency(card.limit)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Utilizado</p>
            <p className="text-sm font-semibold tabular-nums text-destructive">{currency(usedLimit)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fechamento</p>
            <p className="text-sm font-semibold tabular-nums">Dia {card.closingDay}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Vencimento</p>
            <p className="text-sm font-semibold tabular-nums">Dia {card.dueDay}</p>
          </div>
        </div>

        {/* Invoices by competence */}
        {groups.length === 0 ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Nenhuma compra no crédito registrada para este cartão.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {groups.map((group) => {
              const fatura = faturas.find((f) => f.competenceMonth === group.month);
              const isPaid = fatura?.status === "paid";
              return (
                <div
                  key={group.month}
                  className="rounded-lg border border-border/40 bg-muted/20 p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">
                        {formatCompetenceMonth(group.month)}
                      </span>
                      {isPaid ? (
                        <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
                          <CheckCircle2 className="h-3 w-3" /> Paga
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-500">
                          <Clock className="h-3 w-3" /> Em aberto
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums">
                        {currency(group.total)}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {group.transactions.length} compra{group.transactions.length === 1 ? "" : "s"}
                      </span>
                      {!isPaid && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7"
                          onClick={() =>
                            onPay(
                              fatura ?? {
                                id: "",
                                cardId: card.id,
                                competenceMonth: group.month,
                                amount: group.total,
                                status: "open",
                                paidAmount: 0,
                                createdAt: "",
                              },
                            )
                          }
                        >
                          Pagar fatura
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* Purchase list */}
                  <div className="mt-2 space-y-1">
                    {group.transactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-muted-foreground">
                          {format(parseISO(t.date), "dd/MM", { locale: ptBR })} · {t.description}
                        </span>
                        <span className="tabular-nums">{currency(t.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PayFaturaDialog({
  open,
  onOpenChange,
  fatura,
  card,
  accounts,
  onPay,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  fatura: Fatura;
  card: CardT;
  accounts: ReturnType<typeof useFinance>["accounts"];
  onPay: (input: { faturaId: string; accountId: string; amount: number; date: string }) => Promise<unknown>;
}) {
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState(String(fatura.amount));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  useMemo(() => {
    if (open) {
      setAccountId(accounts[0]?.id ?? "");
      setAmount(String(fatura.amount));
      setDate(new Date().toISOString().slice(0, 10));
    }
  }, [open, fatura.amount, accounts]);

  const canPay = accountId && Number(amount) > 0 && !saving;

  const submit = async () => {
    if (!canPay) return;
    setSaving(true);
    try {
      await onPay({
        faturaId: fatura.id,
        accountId,
        amount: Number(amount),
        date,
      });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao pagar fatura.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Pagar fatura — {card.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Fatura</Label>
            <p className="text-sm font-medium capitalize">
              {formatCompetenceMonth(fatura.competenceMonth)}
            </p>
            <p className="text-lg font-semibold tabular-nums">{currency(fatura.amount)}</p>
          </div>
          <div>
            <Label className="text-xs">Conta pagadora</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Valor</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!canPay}>
            {saving ? "Pagando..." : "Confirmar pagamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
