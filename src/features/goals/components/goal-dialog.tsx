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
import { Switch } from "@/components/ui/switch";
import { useGoals } from "../store";
import { PALETTE } from "@/features/finance/utils";
import type { Goal } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  goal?: Goal | null;
}

export function GoalDialog({ open, onOpenChange, goal }: Props) {
  const { addGoal, updateGoal } = useGoals();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(goal?.title ?? "");
      setDescription(goal?.description ?? "");
      setTargetAmount(goal ? String(goal.targetAmount) : "");
      setCurrentAmount(goal ? String(goal.currentAmount) : "0");
      setDeadline(goal?.deadline ?? "");
      setColor(goal?.color ?? PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      setIsPrimary(goal?.isPrimary ?? false);
    }
  }, [open, goal]);

  const canSave = title.trim().length > 0 && Number(targetAmount) > 0;

  const submit = () => {
    if (!canSave) return;
    const data = {
      title: title.trim(),
      description: description || undefined,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      deadline: deadline || undefined,
      color,
      isPrimary,
      archived: false,
    };
    if (goal) updateGoal(goal.id, data);
    else addGoal(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{goal ? "Editar meta" : "Nova meta"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Viagem Vietnã, Reserva de emergência…"
            />
          </div>
          <div>
            <Label className="text-xs">Descrição (opcional)</Label>
            <Textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Valor da meta</Label>
              <Input
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Já guardado</Label>
              <Input
                type="number"
                step="0.01"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Prazo (opcional)</Label>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <div>
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
          <div className="flex items-center justify-between rounded-md border border-border/60 px-3 py-2.5">
            <div>
              <Label className="text-xs">Meta principal</Label>
              <p className="text-[11px] text-muted-foreground">
                Destaca no Dashboard
              </p>
            </div>
            <Switch checked={isPrimary} onCheckedChange={setIsPrimary} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!canSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
