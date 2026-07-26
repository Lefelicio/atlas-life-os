import { createFileRoute } from "@tanstack/react-router";

import { PlanningPanel } from "@/features/planning/components/planning-panel";
import { CategoryMapping } from "@/features/planning/components/category-mapping";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/_shell/planejamento")({
  component: PlanejamentoPage,
  head: () => ({ meta: [{ title: "Planejamento Financeiro — Atlas" }] }),
});

function PlanejamentoPage() {
  return (
    <div className="space-y-8">
      <PlanningPanel />
      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-5">
          <CategoryMapping />
        </CardContent>
      </Card>
    </div>
  );
}
