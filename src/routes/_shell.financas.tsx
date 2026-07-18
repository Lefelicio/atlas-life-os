import { createFileRoute } from "@tanstack/react-router";
import { ModulePlaceholder } from "@/components/module-placeholder";

export const Route = createFileRoute("/_shell/financas")({
  component: FinancasPage,
  head: () => ({
    meta: [{ title: "Finanças — Atlas" }],
  }),
});

function FinancasPage() {
  return (
    <ModulePlaceholder
      eyebrow="Módulo"
      title="Finanças"
      description="Central de fluxo de caixa, orçamento, receitas, despesas e investimentos."
      submodules={["Contas", "Transações", "Orçamento", "Investimentos", "Patrimônio"]}
    />
  );
}
