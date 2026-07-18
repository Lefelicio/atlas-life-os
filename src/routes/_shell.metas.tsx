import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_shell/metas")({
  component: MetasPage,
  head: () => ({ meta: [{ title: "Metas — Atlas" }] }),
});

function MetasPage() {
  return (
    <ModulePlaceholder
      eyebrow="Módulo"
      title="Metas"
      description="Objetivos de curto, médio e longo prazo com progresso mensurável."
      submodules={["Objetivos", "Milestones", "Progresso", "Histórico"]}
    />
  );
}
