import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Target } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

import { useObjetivos } from "@/features/objetivos/store";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  type Objective,
  type ObjectiveStatus,
  type ObjectiveCategory,
} from "@/features/objetivos/types";
import { ObjectiveDialog } from "@/features/objetivos/components/objective-dialog";
import { ObjectiveCard } from "@/features/objetivos/components/objective-card";
import { ObjectiveDetail } from "@/features/objetivos/components/objective-detail";
import { ObjectiveStats } from "@/features/objetivos/components/objective-stats";

export const Route = createFileRoute("/_shell/objetivos")({
  component: ObjetivosPage,
  head: () => ({ meta: [{ title: "Objetivos — Atlas" }] }),
});

type StatusFilter = "all" | ObjectiveStatus;
type CategoryFilter = "all" | ObjectiveCategory;

function ObjetivosPage() {
  const { objectives, addObjective, setStatus, removeObjective } = useObjetivos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Objective | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return objectives.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (categoryFilter !== "all" && o.category !== categoryFilter) return false;
      if (search && !o.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [objectives, statusFilter, categoryFilter, search]);

  const selectedObj = selected
    ? objectives.find((o) => o.id === selected.id) ?? null
    : null;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Módulo"
        title="Objetivos"
        description="Acompanhe tudo o que você está construindo."
        actions={
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Novo objetivo
          </Button>
        }
      />

      <ObjectiveStats objectives={objectives} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar objetivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "active", "completed", "paused"] as StatusFilter[]).map((f) => (
            <FilterChip
              key={f}
              active={statusFilter === f}
              onClick={() => setStatusFilter(f)}
            >
              {f === "all" ? "Todos" : STATUS_LABELS[f]}
            </FilterChip>
          ))}
        </div>
        <Select
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={objectives.length === 0 ? "Nenhum objetivo criado" : "Nenhum resultado"}
          description={
            objectives.length === 0
              ? "Defina seu primeiro objetivo e acompanhe sua evolução automaticamente."
              : "Tente ajustar os filtros ou a busca."
          }
          icon={<Target className="h-4 w-4" />}
          action={
            objectives.length === 0 ? (
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4" /> Criar primeiro objetivo
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((o) => (
            <ObjectiveCard
              key={o.id}
              objective={o}
              onOpen={() => setSelected(o)}
              onSetStatus={(s) => setStatus(o.id, s)}
              onRemove={() => removeObjective(o.id)}
            />
          ))}
        </div>
      )}

      <ObjectiveDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={addObjective} />
      <ObjectiveDetail
        objective={selectedObj}
        onClose={() => setSelected(null)}
        onSetStatus={setStatus}
        onRemove={removeObjective}
      />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted/40 text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function Select({
  value,
  onChange,
}: {
  value: CategoryFilter;
  onChange: (v: CategoryFilter) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as CategoryFilter)}
      className="h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none focus:border-primary"
    >
      <option value="all">Todas categorias</option>
      {(Object.keys(CATEGORY_LABELS) as ObjectiveCategory[]).map((c) => (
        <option key={c} value={c}>
          {CATEGORY_LABELS[c]}
        </option>
      ))}
    </select>
  );
}
