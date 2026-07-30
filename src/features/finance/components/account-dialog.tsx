import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
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
import { useFinance } from "../hooks/use-finance";
import { PALETTE } from "../utils";
import type { Account, Card as CardT, CardBrand } from "../types";
import { cn } from "@/lib/utils";
import { Plus, Pencil, Trash2, CreditCard } from "lucide-react";

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
  account?: Account | null;
}

export function AccountDialog({ open, onOpenChange, account }: Props) {
  const { addAccount, updateAccount, cards, addCard, updateCard, removeCard } = useFinance();
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState("0");
  const [color, setColor] = useState(PALETTE[0]);
  const [saving, setSaving] = useState(false);

  // Card dialog state
  const [cardOpen, setCardOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CardT | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardBank, setCardBank] = useState("");
  const [cardBrand, setCardBrand] = useState<CardBrand>("Visa");
  const [cardLimit, setCardLimit] = useState("0");
  const [cardClosingDay, setCardClosingDay] = useState("1");
  const [cardDueDay, setCardDueDay] = useState("10");
  const [cardColor, setCardColor] = useState(PALETTE[0]);
  const [cardActive, setCardActive] = useState(true);
  const [cardNotes, setCardNotes] = useState("");
  const [cardSaving, setCardSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(account?.name ?? "");
      setInitialBalance(String(account?.initialBalance ?? 0));
      setColor(account?.color ?? PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    }
  }, [open, account]);

  const accountCards = useMemo(
    () => (account ? cards.filter((c) => c.accountId === account.id) : []),
    [cards, account],
  );

  const canSave = name.trim().length > 0;

  const submit = async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try {
      if (account) {
        await updateAccount(account.id, {
          name: name.trim(),
          initialBalance: Number(initialBalance) || 0,
          color,
        });
      } else {
        await addAccount({
          name: name.trim(),
          initialBalance: Number(initialBalance) || 0,
          color,
        });
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar conta.");
    } finally {
      setSaving(false);
    }
  };

  const openNewCard = () => {
    setEditingCard(null);
    setCardName("");
    setCardBank("");
    setCardBrand("Visa");
    setCardLimit("0");
    setCardClosingDay("1");
    setCardDueDay("10");
    setCardColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    setCardActive(true);
    setCardNotes("");
    setCardOpen(true);
  };

  const openEditCard = (card: CardT) => {
    setEditingCard(card);
    setCardName(card.name);
    setCardBank(card.bank);
    setCardBrand(card.brand);
    setCardLimit(String(card.limit));
    setCardClosingDay(String(card.closingDay));
    setCardDueDay(String(card.dueDay));
    setCardColor(card.color);
    setCardActive(card.active);
    setCardNotes(card.notes ?? "");
    setCardOpen(true);
  };

  const saveCard = async () => {
    if (!cardName.trim() || !account || cardSaving) return;
    setCardSaving(true);
    try {
      const cardData = {
        name: cardName.trim(),
        bank: cardBank.trim(),
        brand: cardBrand,
        limit: Number(cardLimit) || 0,
        closingDay: Math.min(31, Math.max(1, Number(cardClosingDay) || 1)),
        dueDay: Math.min(31, Math.max(1, Number(cardDueDay) || 1)),
        color: cardColor,
        active: cardActive,
        notes: cardNotes || undefined,
        accountId: account.id,
      };
      if (editingCard) {
        await updateCard(editingCard.id, cardData);
        toast.success("Cartão atualizado.");
      } else {
        await addCard(cardData);
        toast.success("Cartão adicionado.");
      }
      setCardOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar cartão.");
    } finally {
      setCardSaving(false);
    }
  };

  const deleteCard = async (id: string) => {
    try {
      await removeCard(id);
      toast.success("Cartão removido.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover cartão.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
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

            {account && (
              <div className="space-y-2 border-t border-border/40 pt-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Cartões de Crédito
                  </Label>
                  <Button size="sm" variant="ghost" className="h-7" onClick={openNewCard}>
                    <Plus className="h-3.5 w-3.5" /> Cartão
                  </Button>
                </div>
                {accountCards.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Nenhum cartão vinculado a esta conta.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {accountCards.map((c) => (
                      <div
                        key={c.id}
                        className="group flex items-center justify-between rounded-md border border-border/40 bg-muted/20 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="text-sm font-medium">{c.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {c.brand} · Limite {Number(c.limit).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </span>
                          {!c.active && (
                            <span className="text-[10px] uppercase text-muted-foreground">Inativo</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEditCard(c)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteCard(c.id)}>
                            <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={submit} disabled={!canSave || saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card sub-dialog */}
      <Dialog open={cardOpen} onOpenChange={setCardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCard ? "Editar cartão" : "Novo cartão"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Nome</Label>
              <Input autoFocus value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Nubank Ultravioleta" />
            </div>
            <div>
              <Label className="text-xs">Banco</Label>
              <Input value={cardBank} onChange={(e) => setCardBank(e.target.value)} placeholder="Nubank" />
            </div>
            <div>
              <Label className="text-xs">Bandeira</Label>
              <Select value={cardBrand} onValueChange={(v) => setCardBrand(v as CardBrand)}>
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
              <Input type="number" step="0.01" value={cardLimit} onChange={(e) => setCardLimit(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Fechamento (dia)</Label>
              <Input type="number" min={1} max={31} value={cardClosingDay} onChange={(e) => setCardClosingDay(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Vencimento (dia)</Label>
              <Input type="number" min={1} max={31} value={cardDueDay} onChange={(e) => setCardDueDay(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">Ativo</Label>
                <div className="pt-2"><Switch checked={cardActive} onCheckedChange={setCardActive} /></div>
              </div>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Cor</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCardColor(c)}
                    className={cn(
                      "h-6 w-6 rounded-full ring-offset-2 ring-offset-background transition",
                      cardColor === c && "ring-2 ring-foreground",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Observações</Label>
              <Textarea rows={2} value={cardNotes} onChange={(e) => setCardNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCardOpen(false)}>Cancelar</Button>
            <Button onClick={saveCard} disabled={!cardName.trim() || cardSaving}>
              {cardSaving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
