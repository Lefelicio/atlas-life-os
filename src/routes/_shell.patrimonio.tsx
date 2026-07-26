import { createFileRoute } from "@tanstack/react-router";

import { PatrimonyPanel } from "@/features/patrimony/components/patrimony-panel";

export const Route = createFileRoute("/_shell/patrimonio")({
  component: PatrimonioPage,
  head: () => ({ meta: [{ title: "Patrimônio — Atlas" }] }),
});

function PatrimonioPage() {
  return <PatrimonyPanel />;
}
