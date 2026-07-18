import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinance } from "../store";
import { currency, formatDate } from "../utils";
import type { Transaction } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  transactions: Transaction[];
  emptyLabel?: string;
  compact?: boolean;
}

export function TransactionsList({
  transactions,
  emptyLabel = "Nenhum lançamento",
  compact,
}: Props) {
  const { accounts, categories, removeTransaction } = useFinance();

  if (transactions.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border/70 bg-muted/20 text-xs text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border/50">
      {transactions.map((t) => {
        const acc = accounts.find((a) => a.id === t.accountId);
        const to = t.toAccountId ? accounts.find((a) => a.id === t.toAccountId) : null;
        const cat = categories.find((c) => c.id === t.categoryId);
        const Icon =
          t.kind === "income"
            ? ArrowDownLeft
            : t.kind === "expense"
              ? ArrowUpRight
              : ArrowLeftRight;
        const iconClass =
          t.kind === "income"
            ? "text-success bg-success/10"
            : t.kind === "expense"
              ? "text-destructive bg-destructive/10"
              : "text-muted-foreground bg-muted";

        return (
          <li
            key={t.id}
            className={cn(
              "group flex items-center gap-3 py-2.5",
              compact ? "px-1" : "px-2",
            )}
          >
            <div
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                iconClass,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {t.description || (t.kind === "transfer" ? "Transferência" : cat?.name || "—")}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {formatDate(t.date)} · {acc?.name ?? "—"}
                {to ? ` → ${to.name}` : ""}
                {cat && t.kind !== "transfer" ? ` · ${cat.name}` : ""}
              </p>
            </div>
            <div
              className={cn(
                "text-right text-sm font-semibold tabular-nums",
                t.kind === "income" && "text-success",
                t.kind === "expense" && "text-destructive",
              )}
            >
              {t.kind === "expense" ? "-" : t.kind === "income" ? "+" : ""}
              {currency(t.amount)}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 opacity-0 group-hover:opacity-100"
              onClick={() => removeTransaction(t.id)}
              aria-label="Excluir"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
