import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_shell/projetos")({
  component: ProjetosPage,
  head: () => ({ meta: [{ title: "Projetos — Atlas" }] }),
});

function ProjetosPage() {
  return (
    <ModulePlaceholder
      eyebrow="Módulo"
      title="Projetos"
      description="Iniciativas pessoais e profissionais, tarefas, sprints e entregas."
      submodules={["Ativos", "Backlog", "Concluídos", "Tarefas"]}
    />
  );
}
