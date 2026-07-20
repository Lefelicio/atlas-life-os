import { useMemo } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinance } from "../store";
import { currency, formatShortDate } from "../utils";
import type { InstallmentPlan } from "../types";

interface Props {
  plan: InstallmentPlan;
}

export function InstallmentPlanCard({ plan }: Props) {
  const {
    installments,
    cards,
    payInstallment,
    cancelFutureInstallments,
    removeInstallmentPlan,
  } = useFinance();
  const items = useMemo(
    () => installments.filter((i) => i.planId === plan.id).sort((a, b) => a.index - b.index),
    [installments, plan.id],
  );
  const card = cards.find((c) => c.id === plan.cardId);
  const pending = items.filter((i) => i.status === "pending");
  const paid = items.filter((i) => i.status === "paid");
  const remaining = pending.reduce((s, i) => s + i.amount, 0);
  const current = paid.length + 1;

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{plan.description}</p>
            <p className="text-[11px] text-muted-foreground">
              {card?.name ?? "—"} · Total {currency(plan.totalAmount)}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => removeInstallmentPlan(plan.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground">Parcela</p>
            <p className="text-sm font-semibold">{Math.min(current, items.length)}/{items.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Restantes</p>
            <p className="text-sm font-semibold">{pending.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Restante</p>
            <p className="text-sm font-semibold tabular-nums">{currency(remaining)}</p>
          </div>
        </div>

        <ul className="divide-y divide-border/50 rounded-md border border-border/60">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-2 px-2 py-1.5 text-xs">
              <span className="w-8 text-muted-foreground">{i.index}/{items.length}</span>
              <span className="flex-1 text-muted-foreground">{formatShortDate(i.dueDate)}</span>
              <span className="tabular-nums font-medium">{currency(i.amount)}</span>
              <Badge
                variant="outline"
                className={
                  i.status === "paid"
                    ? "text-success"
                    : i.status === "canceled"
                      ? "text-muted-foreground"
                      : ""
                }
              >
                {i.status === "paid" ? "Paga" : i.status === "canceled" ? "Cancelada" : "Aberta"}
              </Badge>
              {i.status === "pending" && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => payInstallment(i.id)}
                    title="Quitar"
                  >
                    <Check className="h-3.5 w-3.5 text-success" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={() => cancelFutureInstallments(plan.id, i.index)}
                    title="Cancelar desta em diante"
                  >
                    <X className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
