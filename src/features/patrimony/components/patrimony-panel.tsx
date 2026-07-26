import { useMemo, useState } from "react";
import { Plus, Trash2, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { ASSET_CATEGORY_LABELS } from "@/features/patrimony/types";
import { usePatrimony } from "@/features/patrimony/store";
import {
  monthEntries,
  monthlyHistory,
  sumEntries,
  topCategories,
  yearEntries,
  currency,
} from "@/features/patrimony/utils";
import { formatDate } from "@/features/finance/utils";
import { AssetDialog } from "./asset-dialog";

export function PatrimonyPanel() {
  const { entries, removeEntry } = usePatrimony();
  const [open, setOpen] = useState(false);

  const monthTotal = useMemo(() => sumEntries(monthEntries(entries)), [entries]);
  const yearTotal = useMemo(() => sumEntries(yearEntries(entries)), [entries]);
  const history = useMemo(() => monthlyHistory(entries), [entries]);
  const categories = useMemo(() => topCategories(entries), [entries]);
  const maxMonth = Math.max(...history.map((h) => h.total), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Módulo"
        title="Patrimônio"
        description="Registre aportes e acompanhe a evolução do seu patrimônio."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Novo aporte
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Aportes deste mês
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {currency(monthTotal)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Aportes do ano
            </p>
            <p className="mt-2 text-2xl font-semibold tabular-nums">
              {currency(yearTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="Nenhum aporte registrado"
          description="Comece a registrar seus aportes para acompanhar sua evolução."
          icon={<TrendingUp className="h-4 w-4" />}
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Registrar aporte
            </Button>
          }
        />
      ) : (
        <>
          <Card className="border-border/40 bg-card/40">
            <CardContent className="p-5">
              <p className="mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
                Histórico mensal
              </p>
              <div className="flex items-end gap-1.5">
                {history.map((h) => (
                  <div key={h.month} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-end" style={{ height: "80px" }}>
                      <div
                        className="w-full rounded-t bg-primary/20"
                        style={{
                          height: `${Math.max(2, (h.total / maxMonth) * 100)}%`,
                          minHeight: h.total > 0 ? "4px" : "0",
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{h.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40">
            <CardContent className="p-5">
              <p className="mb-4 text-[11px] uppercase tracking-wider text-muted-foreground">
                Categorias mais utilizadas
              </p>
              <div className="space-y-2">
                {categories.map((c) => (
                  <div
                    key={c.category}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-muted-foreground">{c.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[11px]">
                        {c.count}x
                      </Badge>
                      <span className="tabular-nums">{currency(c.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/40">
            <CardContent className="p-5">
              <p className="mb-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                Registros
              </p>
              <div className="space-y-2">
                {entries.slice(0, 20).map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/30 px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[11px]">
                          {ASSET_CATEGORY_LABELS[e.category]}
                        </Badge>
                        <span className="text-sm font-medium tabular-nums">
                          {currency(e.amount)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {formatDate(e.date)} · {e.institution}
                        {e.notes ? ` · ${e.notes}` : ""}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => removeEntry(e.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <AssetDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
