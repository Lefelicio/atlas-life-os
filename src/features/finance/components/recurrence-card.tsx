import { Repeat, Trash2, Power } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinance } from "../store";
import { currency, formatShortDate } from "../utils";
import type { Recurrence } from "../types";

const FREQ_LABEL: Record<Recurrence["frequency"], string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
  custom: "Personalizado",
};

interface Props {
  recurrence: Recurrence;
}

export function RecurrenceCard({ recurrence }: Props) {
  const { accounts, categories, updateRecurrence, removeRecurrence } = useFinance();
  const acc = accounts.find((a) => a.id === recurrence.accountId);
  const to = recurrence.toAccountId ? accounts.find((a) => a.id === recurrence.toAccountId) : null;
  const cat = categories.find((c) => c.id === recurrence.categoryId);
  const kindLabel = recurrence.kind === "income" ? "Receita" : recurrence.kind === "expense" ? "Despesa" : "Transferência";
  const nextDate = recurrence.lastRun ?? recurrence.firstDate;

  return (
    <Card className="border-border/60 bg-card/60">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <p className="truncate text-sm font-semibold">{recurrence.description}</p>
              {!recurrence.active && <Badge variant="outline" className="text-[10px]">Pausada</Badge>}
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {kindLabel} · {FREQ_LABEL[recurrence.frequency]} · Próxima {formatShortDate(nextDate)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {acc?.name}{to ? ` → ${to.name}` : ""}{cat ? ` · ${cat.name}` : ""}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-sm font-semibold tabular-nums">{currency(recurrence.amount)}</p>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => updateRecurrence(recurrence.id, { active: !recurrence.active })}
                title={recurrence.active ? "Pausar" : "Ativar"}
              >
                <Power className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={() => removeRecurrence(recurrence.id)}
              >
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
