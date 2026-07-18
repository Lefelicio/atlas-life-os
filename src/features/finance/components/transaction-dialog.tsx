import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useFinance } from "../store";
import { todayISO } from "../utils";
import type { TxKind } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  defaultKind?: TxKind;
}

export function TransactionDialog({ open, onOpenChange, defaultKind = "expense" }: Props) {
  const { accounts, categories, addTransaction } = useFinance();
  const [kind, setKind] = useState<TxKind>(defaultKind);
  const [date, setDate] = useState(todayISO());
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) {
      setKind(defaultKind);
      setDate(todayISO());
      setAccountId(accounts[0]?.id ?? "");
      setToAccountId(accounts[1]?.id ?? "");
      setCategoryId("");
      setDescription("");
      setAmount("");
      setNotes("");
    }
  }, [open, defaultKind, accounts]);

  const filteredCats = categories.filter(
    (c) => c.kind === (kind === "income" ? "income" : "expense"),
  );

  const canSave =
    accountId &&
    Number(amount) > 0 &&
    (kind === "transfer" ? toAccountId && toAccountId !== accountId : true);

  const submit = () => {
    if (!canSave) return;
    addTransaction({
      kind,
      date,
      accountId,
      toAccountId: kind === "transfer" ? toAccountId : undefined,
      categoryId: kind === "transfer" ? undefined : categoryId || undefined,
      description: description || (kind === "transfer" ? "Transferência" : ""),
      amount: Number(amount),
      notes: notes || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo lançamento</DialogTitle>
        </DialogHeader>

        <Tabs value={kind} onValueChange={(v) => setKind(v as TxKind)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expense">Despesa</TabsTrigger>
            <TabsTrigger value="income">Receita</TabsTrigger>
            <TabsTrigger value="transfer">Transferência</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3 pt-2">
          <div>
            <Label className="text-xs">Valor</Label>
            <Input
              autoFocus
              inputMode="decimal"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-11 text-lg font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">
                {kind === "transfer" ? "De" : "Conta"}
              </Label>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {kind === "transfer" ? (
            <div>
              <Label className="text-xs">Para</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {accounts
                    .filter((a) => a.id !== accountId)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label className="text-xs">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label className="text-xs">Descrição</Label>
            <Input
              placeholder="Ex.: Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs">Observações</Label>
            <Textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
