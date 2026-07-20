import { Star, Trash2, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "../store";
import { currency, todayISO } from "../utils";
import type { Favorite } from "../types";
import { toast } from "sonner";

interface Props {
  favorite: Favorite;
  onEdit?: () => void;
}

export function FavoriteCard({ favorite, onEdit }: Props) {
  const { accounts, categories, addTransaction, removeFavorite } = useFinance();
  const acc = accounts.find((a) => a.id === favorite.accountId);
  const cat = categories.find((c) => c.id === favorite.categoryId);

  const quick = () => {
    if (!favorite.accountId || !favorite.amount) {
      toast.error("Favorito incompleto — edite para incluir conta e valor");
      return;
    }
    addTransaction({
      kind: favorite.kind,
      date: todayISO(),
      accountId: favorite.accountId,
      toAccountId: favorite.toAccountId,
      categoryId: favorite.kind === "transfer" ? undefined : favorite.categoryId,
      description: favorite.description || favorite.label,
      amount: favorite.amount,
      tagIds: favorite.tagIds,
    });
    toast.success(`${favorite.label} registrado`);
  };

  return (
    <Card className="group border-border/60 bg-card/60 transition hover:border-primary/40">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <button type="button" onClick={quick} className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-primary" />
              <span className="truncate text-sm font-medium">{favorite.label}</span>
            </div>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              {favorite.amount ? currency(favorite.amount) : "sem valor"}
              {acc ? ` · ${acc.name}` : ""}
              {cat ? ` · ${cat.name}` : ""}
            </p>
          </button>
          <div className="flex items-center gap-0.5 opacity-0 transition group-hover:opacity-100">
            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={quick} title="Lançar">
              <Zap className="h-3 w-3 text-primary" />
            </Button>
            {onEdit && (
              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={onEdit}>
                <Star className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={() => removeFavorite(favorite.id)}
            >
              <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
