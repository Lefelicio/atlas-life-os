import type { ReactNode } from "react";
import { PageHeader } from "@/components/page-header";
import { PlaceholderCard } from "@/components/placeholder-card";
import { Badge } from "@/components/ui/badge";

interface ModulePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  submodules: string[];
  actions?: ReactNode;
}

export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  submodules,
  actions,
}: ModulePlaceholderProps) {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />

      <div className="flex flex-wrap gap-2">
        {submodules.map((s) => (
          <Badge
            key={s}
            variant="secondary"
            className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
          >
            {s}
          </Badge>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <PlaceholderCard title="Widget principal" height="h-48" />
        <PlaceholderCard title="Indicadores" height="h-48" />
        <PlaceholderCard title="Atividade recente" height="h-48" />
      </section>

      <PlaceholderCard title="Área de trabalho do módulo" height="h-96" />
    </div>
  );
}
