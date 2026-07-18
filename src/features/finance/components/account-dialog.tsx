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
import { useFinance } from "../store";
import { PALETTE } from "../utils";
import type { Account } from "../types";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  account?: Account | null;
}

export function AccountDialog({ open, onOpenChange, account }: Props) {
  const { addAccount, updateAccount } = useFinance();
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");
  const [color, setColor] = useState(PALETTE[0]);

  useEffect(() => {
    if (open) {
      setName(account?.name ?? "");
      setInitialBalance(String(account?.initialBalance ?? 0));
      setColor(account?.color ?? PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    }
  }, [open, account]);

  const canSave = name.trim().length > 0;

  const submit = () => {
    if (!canSave) return;
    if (account) {
      updateAccount(account.id, {
        name: name.trim(),
        initialBalance: Number(initialBalance) || 0,
        color,
      });
    } else {
      addAccount({
        name: name.trim(),
        initialBalance: Number(initialBalance) || 0,
        color,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{account ? "Editar conta" : "Nova conta"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Nome</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nubank, Inter, Carteira…"
            />
          </div>
          <div>
            <Label className="text-xs">Saldo inicial</Label>
            <Input
              type="number"
              step="0.01"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
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
