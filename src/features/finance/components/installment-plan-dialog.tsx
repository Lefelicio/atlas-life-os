import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinance } from "../store";
import { currency, todayISO } from "../utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultCardId?: string;
}

export function InstallmentPlanDialog({ open, onOpenChange, defaultCardId }: Props) {
  const { cards, categories, createInstallmentPlan } = useFinance();
  const [cardId, setCardId] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [installments, setInstallments] = useState("12");
  const [firstDate, setFirstDate] = useState(todayISO());

  const expenseCats = categories.filter((c) => c.kind === "expense");

  useEffect(() => {
    if (open) {
      setCardId(defaultCardId ?? cards[0]?.id ?? "");
      setDescription("");
      setCategoryId("");
      setTotalAmount("");
      setInstallments("12");
      setFirstDate(todayISO());
    }
  }, [open, defaultCardId, cards]);

  const total = Number(totalAmount) || 0;
  const n = Math.max(1, Number(installments) || 1);
  const per = total / n;
  const canSave = cardId && total > 0 && n > 0 && description.trim();

  const submit = () => {
    if (!canSave) return;
    createInstallmentPlan({
      cardId,
      description: description.trim(),
      categoryId: categoryId || undefined,
      totalAmount: total,
      installments: n,
      firstDate,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova compra parcelada</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Descrição</Label>
            <Input autoFocus value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notebook, iPhone…" />
          </div>
          <div>
            <Label className="text-xs">Cartão</Label>
            <Select value={cardId} onValueChange={setCardId}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>
                {cards.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
              <SelectContent>
                {expenseCats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Valor total</Label>
            <Input type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Parcelas</Label>
            <Input type="number" min={1} value={installments} onChange={(e) => setInstallments(e.target.value)} />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">1ª parcela</Label>
            <Input type="date" value={firstDate} onChange={(e) => setFirstDate(e.target.value)} />
          </div>
          {total > 0 && (
            <div className="col-span-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              {n}x de <span className="font-semibold text-foreground">{currency(per)}</span>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!canSave}>Criar parcelamento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
