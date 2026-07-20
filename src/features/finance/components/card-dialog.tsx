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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useFinance } from "../store";
import { PALETTE } from "../utils";
import type { Card as CardT, CardBrand } from "../types";
import { cn } from "@/lib/utils";

const BRANDS: CardBrand[] = [
  "Visa",
  "Mastercard",
  "Elo",
  "American Express",
  "Hipercard",
  "Outros",
];

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  card?: CardT | null;
}

export function CardDialog({ open, onOpenChange, card }: Props) {
  const { addCard, updateCard } = useFinance();
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [brand, setBrand] = useState<CardBrand>("Visa");
  const [limit, setLimit] = useState("0");
  const [closingDay, setClosingDay] = useState("1");
  const [dueDay, setDueDay] = useState("10");
  const [color, setColor] = useState(PALETTE[0]);
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setName(card?.name ?? "");
      setBank(card?.bank ?? "");
      setBrand(card?.brand ?? "Visa");
      setLimit(String(card?.limit ?? 0));
      setClosingDay(String(card?.closingDay ?? 1));
      setDueDay(String(card?.dueDay ?? 10));
      setColor(card?.color ?? PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      setActive(card?.active ?? true);
      setNotes(card?.notes ?? "");
    }
  }, [open, card]);

  const canSave = name.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    const data = {
      name: name.trim(),
      bank: bank.trim(),
      brand,
      limit: Number(limit) || 0,
      closingDay: Math.min(31, Math.max(1, Number(closingDay) || 1)),
      dueDay: Math.min(31, Math.max(1, Number(dueDay) || 1)),
      color,
      active,
      notes: notes || undefined,
    };
    if (card) updateCard(card.id, data);
    else addCard(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{card ? "Editar cartão" : "Novo cartão"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Nome</Label>
            <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nubank Ultravioleta" />
          </div>
          <div>
            <Label className="text-xs">Banco</Label>
            <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Nubank" />
          </div>
          <div>
            <Label className="text-xs">Bandeira</Label>
            <Select value={brand} onValueChange={(v) => setBrand(v as CardBrand)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {BRANDS.map((b) => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Limite</Label>
            <Input type="number" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Fechamento (dia)</Label>
            <Input type="number" min={1} max={31} value={closingDay} onChange={(e) => setClosingDay(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Vencimento (dia)</Label>
            <Input type="number" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="text-xs">Ativo</Label>
              <div className="pt-2"><Switch checked={active} onCheckedChange={setActive} /></div>
            </div>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Cor</Label>
            <div className="flex flex-wrap gap-2 pt-1">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-6 w-6 rounded-full ring-offset-2 ring-offset-background transition",
                    color === c && "ring-2 ring-foreground",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Observações</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!canSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
