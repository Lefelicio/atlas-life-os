import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_shell/minha-vida")({
  component: MinhaVidaPage,
  head: () => ({ meta: [{ title: "Minha Vida — Atlas" }] }),
});

function MinhaVidaPage() {
  return (
    <ModulePlaceholder
      eyebrow="Módulo"
      title="Minha Vida"
      description="Hábitos, missões, estudos, idiomas, viagens e bem-estar."
      submodules={["Hábitos", "Missões", "Estudos", "Idiomas", "Viagens"]}
    />
  );
}
