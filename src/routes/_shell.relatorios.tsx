import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_shell/relatorios")({
  component: RelatoriosPage,
  head: () => ({ meta: [{ title: "Relatórios — Atlas" }] }),
});

function RelatoriosPage() {
  return (
    <ModulePlaceholder
      eyebrow="Módulo"
      title="Relatórios"
      description="Análises consolidadas de todos os módulos, com insights e exportações."
      submodules={["Mensal", "Anual", "Comparativos", "Exportações"]}
    />
  );
}
