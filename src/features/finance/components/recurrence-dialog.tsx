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
import type { RecurrenceFrequency } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function RecurrenceDialog({ open, onOpenChange }: Props) {
  const { accounts, categories, addRecurrence, runRecurrences } = useFinance();
  const [kind, setKind] = useState<"expense" | "income" | "transfer">("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("monthly");
  const [intervalDays, setIntervalDays] = useState("30");
  const [firstDate, setFirstDate] = useState(todayISO());
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (open) {
      setKind("expense");
      setDescription("");
      setAmount("");
      setAccountId(accounts[0]?.id ?? "");
      setToAccountId(accounts[1]?.id ?? "");
      setCategoryId("");
      setFrequency("monthly");
      setIntervalDays("30");
      setFirstDate(todayISO());
      setEndDate("");
    }
  }, [open, accounts]);

  const filteredCats = categories.filter(
    (c) => c.kind === (kind === "income" ? "income" : "expense"),
  );

  const canSave =
    accountId &&
    Number(amount) > 0 &&
    description.trim() &&
    (kind === "transfer" ? toAccountId && toAccountId !== accountId : true);

  const submit = () => {
    if (!canSave) return;
    addRecurrence({
      kind,
      description: description.trim(),
      amount: Number(amount),
      accountId,
      toAccountId: kind === "transfer" ? toAccountId : undefined,
      categoryId: kind === "transfer" ? undefined : categoryId || undefined,
      frequency,
      intervalDays: frequency === "custom" ? Number(intervalDays) || 30 : undefined,
      firstDate,
      endDate: endDate || undefined,
      active: true,
    });
    runRecurrences();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova recorrência</DialogTitle>
        </DialogHeader>

        <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="expense">Despesa</TabsTrigger>
            <TabsTrigger value="income">Receita</TabsTrigger>
            <TabsTrigger value="transfer">Transferência</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="col-span-2">
            <Label className="text-xs">Descrição</Label>
            <Input autoFocus value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Netflix, Aluguel…" />
          </div>
          <div>
            <Label className="text-xs">Valor</Label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">{kind === "transfer" ? "De" : "Conta"}</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {kind === "transfer" ? (
            <div className="col-span-2">
              <Label className="text-xs">Para</Label>
              <Select value={toAccountId} onValueChange={setToAccountId}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  {accounts.filter((a) => a.id !== accountId).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="col-span-2">
              <Label className="text-xs">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  {filteredCats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="text-xs">Frequência</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurrenceFrequency)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {frequency === "custom" && (
            <div>
              <Label className="text-xs">Intervalo (dias)</Label>
              <Input type="number" min={1} value={intervalDays} onChange={(e) => setIntervalDays(e.target.value)} />
            </div>
          )}
          <div>
            <Label className="text-xs">1ª execução</Label>
            <Input type="date" value={firstDate} onChange={(e) => setFirstDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Última (opcional)</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!canSave}>Criar recorrência</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
