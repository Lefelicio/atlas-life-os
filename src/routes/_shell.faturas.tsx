import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { FaturasPanel } from "@/features/finance/components/faturas-panel";
import { triggerHelpOpen } from "@/features/help/help-events";

export const Route = createFileRoute("/_shell/faturas")({
  component: FaturasPage,
  head: () => ({ meta: [{ title: "Faturas — Atlas" }] }),
});

function FaturasPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Módulo"
        title="Faturas"
        description="Gerencie faturas de cartões de crédito, acompanhe limites e pague com um clique."
        onHelp={triggerHelpOpen}
      />
      <FaturasPanel />
    </div>
  );
}
