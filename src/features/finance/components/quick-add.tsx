import { useEffect, useMemo, useState } from "react";
import { Sparkles, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinance } from "../store";
import { currency, parseQuickAdd, todayISO } from "../utils";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function QuickAdd({ open, onOpenChange }: Props) {
  const { accounts, categories, transactions, addTransaction } = useFinance();
  const [input, setInput] = useState("");
  const [accountId, setAccountId] = useState("");

  useEffect(() => {
    if (open) {
      setInput("");
      setAccountId(accounts[0]?.id ?? "");
    }
  }, [open, accounts]);

  const parsed = useMemo(() => parseQuickAdd(input), [input]);

  const suggestion = useMemo(() => {
    if (!parsed) return null;
    const desc = parsed.description.toLowerCase();
    const previous = transactions.find(
      (t) => t.description && desc && t.description.toLowerCase().includes(desc),
    );
    const cat =
      (previous && categories.find((c) => c.id === previous.categoryId)) ||
      (parsed.categoryHint
        ? categories.find(
            (c) =>
              c.name.toLowerCase() === parsed.categoryHint!.toLowerCase() &&
              c.kind === parsed.kind,
          )
        : undefined);
    return {
      accountId: previous?.accountId ?? accountId,
      categoryId: cat?.id,
      categoryName: cat?.name,
    };
  }, [parsed, transactions, categories, accountId]);

  const canSave =
    parsed && (suggestion?.accountId || accountId) && parsed.amount > 0;

  const submit = () => {
    if (!parsed || !canSave) return;
    addTransaction({
      kind: parsed.kind,
      date: todayISO(),
      accountId: suggestion?.accountId ?? accountId,
      categoryId: suggestion?.categoryId,
      description: parsed.description,
      amount: parsed.amount,
    });
    toast.success(
      `${parsed.kind === "income" ? "Receita" : "Despesa"} registrada — ${currency(parsed.amount)}`,
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Quick Add
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            autoFocus
            placeholder='Ex.: "Pizza 82", "Uber 25", "Salário 5200"'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canSave) submit();
            }}
            className="h-12 text-base"
          />

          {parsed ? (
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    {parsed.kind === "income" ? "Receita" : "Despesa"} · Hoje
                  </p>
                  <p className="mt-1 font-medium">{parsed.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {suggestion?.categoryName ?? "Categoria: —"}
                  </p>
                </div>
                <p
                  className={
                    "text-xl font-semibold tabular-nums " +
                    (parsed.kind === "income" ? "text-success" : "text-destructive")
                  }
                >
                  {parsed.kind === "income" ? "+" : "-"}
                  {currency(parsed.amount)}
                </p>
              </div>

              {!suggestion?.accountId && (
                <div className="mt-3">
                  <Select value={accountId} onValueChange={setAccountId}>
                    <SelectTrigger><SelectValue placeholder="Selecionar conta" /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Digite descrição + valor. Ex.: <span className="font-mono">Mercado 189,90</span>
            </p>
          )}

          <div className="flex justify-end">
            <Button onClick={submit} disabled={!canSave}>
              <Zap className="h-4 w-4" /> Lançar
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground">
            O interpretador de linguagem natural está preparado para receber IA (Lovable AI Gateway) e enriquecer sugestões futuras.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
