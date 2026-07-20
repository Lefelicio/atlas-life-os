import { CreditCard, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Card as CardT, Installment, InstallmentPlan } from "../types";
import { cardUsage, currency } from "../utils";

interface Props {
  card: CardT;
  installments: Installment[];
  plans: InstallmentPlan[];
  onEdit: () => void;
  onDelete: () => void;
}

export function CardItem({ card, installments, plans, onEdit, onDelete }: Props) {
  const { used, available } = cardUsage(card, installments, plans);
  const pct = card.limit > 0 ? Math.min(100, (used / card.limit) * 100) : 0;

  return (
    <Card
      className="group relative overflow-hidden border-border/60 bg-card/80"
    >
      <div
        className="absolute inset-x-0 top-0 h-1"
        style={{ backgroundColor: card.color }}
      />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <p className="truncate text-sm font-semibold">{card.name}</p>
              {!card.active && (
                <Badge variant="outline" className="text-[10px]">Inativo</Badge>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {card.bank} · {card.brand}
            </p>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              Utilizado
            </span>
            <span className="text-sm font-semibold tabular-nums">{currency(used)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, backgroundColor: card.color }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Disponível: <span className="text-foreground tabular-nums">{currency(available)}</span></span>
            <span>Limite: <span className="text-foreground tabular-nums">{currency(card.limit)}</span></span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-3 text-[11px]">
          <div>
            <p className="uppercase tracking-[0.15em] text-muted-foreground">Fechamento</p>
            <p className="mt-0.5 text-sm font-medium">Dia {card.closingDay}</p>
          </div>
          <div>
            <p className="uppercase tracking-[0.15em] text-muted-foreground">Vencimento</p>
            <p className="mt-0.5 text-sm font-medium">Dia {card.dueDay}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
