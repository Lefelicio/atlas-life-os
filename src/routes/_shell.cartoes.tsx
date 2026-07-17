import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_shell/cartoes")({
  component: CartoesPage,
  head: () => ({ meta: [{ title: "Cartões — Atlas" }] }),
});

function CartoesPage() {
  return (
    <ModulePlaceholder
      eyebrow="Módulo"
      title="Cartões"
      description="Gestão de cartões de crédito, faturas, limites e ciclos."
      submodules={["Cartões", "Faturas", "Limites", "Alertas"]}
    />
  );
}
