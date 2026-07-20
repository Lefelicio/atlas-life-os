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
import type { Favorite } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  favorite?: Favorite | null;
}

export function FavoriteDialog({ open, onOpenChange, favorite }: Props) {
  const { accounts, categories, addFavorite, updateFavorite } = useFinance();
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<"expense" | "income" | "transfer">("expense");
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setLabel(favorite?.label ?? "");
      setKind(favorite?.kind ?? "expense");
      setAccountId(favorite?.accountId ?? accounts[0]?.id ?? "");
      setToAccountId(favorite?.toAccountId ?? accounts[1]?.id ?? "");
      setCategoryId(favorite?.categoryId ?? "");
      setAmount(favorite?.amount != null ? String(favorite.amount) : "");
      setDescription(favorite?.description ?? "");
    }
  }, [open, favorite, accounts]);

  const filteredCats = categories.filter(
    (c) => c.kind === (kind === "income" ? "income" : "expense"),
  );

  const canSave = label.trim();

  const submit = () => {
    if (!canSave) return;
    const data = {
      label: label.trim(),
      kind,
      accountId: accountId || undefined,
      toAccountId: kind === "transfer" ? toAccountId || undefined : undefined,
      categoryId: kind === "transfer" ? undefined : categoryId || undefined,
      amount: amount ? Number(amount) : undefined,
      description: description || undefined,
    };
    if (favorite) updateFavorite(favorite.id, data);
    else addFavorite(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{favorite ? "Editar favorito" : "Novo favorito"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Nome do atalho</Label>
            <Input autoFocus value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Academia, Netflix, Mercado…" />
          </div>
          <div className="col-span-2">
            <Tabs value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="expense">Despesa</TabsTrigger>
                <TabsTrigger value="income">Receita</TabsTrigger>
                <TabsTrigger value="transfer">Transferência</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div>
            <Label className="text-xs">Valor</Label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Opcional" />
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
          <div className="col-span-2">
            <Label className="text-xs">Descrição padrão</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
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
