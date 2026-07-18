import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_shell/configuracoes")({
  component: ConfiguracoesPage,
  head: () => ({ meta: [{ title: "Configurações — Atlas" }] }),
});

function ConfiguracoesPage() {
  return (
    <ModulePlaceholder
      eyebrow="Preferências"
      title="Configurações"
      description="Perfil, tema, notificações, segurança e integrações."
      submodules={["Perfil", "Aparência", "Notificações", "Segurança", "Integrações"]}
    />
  );
}
