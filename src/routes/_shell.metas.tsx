import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Target, Star, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/empty-state";

import { useGoals, goalProgress, goalRemaining } from "@/features/goals/store";
import { currency } from "@/features/finance/utils";
import { GoalDialog } from "@/features/goals/components/goal-dialog";
import type { Goal } from "@/features/goals/types";

export const Route = createFileRoute("/_shell/metas")({
  component: MetasPage,
  head: () => ({ meta: [{ title: "Metas — Atlas" }] }),
});

function MetasPage() {
  const { goals, removeGoal, setPrimary, archiveGoal, contribute } = useGoals();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);

  const active = goals.filter((g) => !g.archived);
  const archived = goals.filter((g) => g.archived);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Módulo"
        title="Metas"
        description="Objetivos de curto, médio e longo prazo com progresso mensurável."
        actions={
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> Nova meta
          </Button>
        }
      />

      {active.length === 0 ? (
        <EmptyState
          title="Nenhuma meta criada"
          description="Defina seu primeiro objetivo e acompanhe seu progresso no Dashboard."
          icon={<Target className="h-4 w-4" />}
          action={
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" /> Criar primeira meta
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {active.map((g) => {
            const pct = goalProgress(g);
            const remaining = goalRemaining(g);
            return (
              <Card
                key={g.id}
                className="group relative overflow-hidden border-border/60 bg-card/60"
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: g.color }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">{g.title}</p>
                        {g.isPrimary && (
                          <Badge
                            variant="secondary"
                            className="gap-1 bg-primary/15 text-primary"
                          >
                            <Star className="h-3 w-3" /> Principal
                          </Badge>
                        )}
                      </div>
                      {g.description && (
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {g.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setPrimary(g.id)}
                        title="Definir como principal"
                      >
                        <Star
                          className={cn(
                            "h-3.5 w-3.5",
                            g.isPrimary ? "fill-primary text-primary" : "text-muted-foreground",
                          )}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => {
                          setEditing(g);
                          setOpen(true);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => archiveGoal(g.id)}
                      >
                        <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => removeGoal(g.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-semibold tabular-nums">{pct}%</span>
                      <span className="text-xs text-muted-foreground">
                        {currency(g.currentAmount)} / {currency(g.targetAmount)}
                      </span>
                    </div>
                    <Progress value={pct} className="mt-2" />
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      Faltam {currency(remaining)}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs"
                      onClick={() => contribute(g.id, 100)}
                    >
                      + R$ 100
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs"
                      onClick={() => contribute(g.id, 500)}
                    >
                      + R$ 500
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {archived.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Arquivadas
          </p>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {archived.map((g) => (
              <Card key={g.id} className="border-border/60 bg-card/30 opacity-60">
                <CardContent className="flex items-center justify-between p-3">
                  <span className="truncate text-sm">{g.title}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => archiveGoal(g.id)}
                    >
                      <ArchiveRestore className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => removeGoal(g.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <GoalDialog open={open} onOpenChange={setOpen} goal={editing} />
    </div>
  );
}
