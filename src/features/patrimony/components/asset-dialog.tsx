import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePatrimony } from "@/features/patrimony/store";
import {
  ASSET_CATEGORIES,
  ASSET_CATEGORY_LABELS,
  type AssetCategory,
} from "@/features/patrimony/types";
import { todayISO } from "@/features/finance/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function AssetDialog({ open, onOpenChange }: Props) {
  const { addEntry } = usePatrimony();
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState<AssetCategory>("reserva");
  const [institution, setInstitution] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    const num = Number(amount.replace(/[^\d.,]/g, "").replace(",", "."));
    if (!num || num <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    if (!institution.trim()) {
      toast.error("Informe a instituição.");
      return;
    }
    addEntry({
      amount: num,
      date,
      category,
      institution: institution.trim(),
      notes: notes.trim() || undefined,
    });
    setAmount("");
    setInstitution("");
    setNotes("");
    setCategory("reserva");
    toast.success("Aporte registrado.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo aporte</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="R$ 1.000,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Data</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as AssetCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASSET_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {ASSET_CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Instituição</Label>
            <Input
              placeholder="Ex: Nubank, XP, Banco do Brasil"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Observação</Label>
            <Textarea
              placeholder="Opcional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Registrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
