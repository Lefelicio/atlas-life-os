import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, CreditCard as CardIcon, Layers } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useFinance } from "@/features/finance/store";
import { CardDialog } from "@/features/finance/components/card-dialog";
import { CardItem } from "@/features/finance/components/card-item";
import { InstallmentPlanDialog } from "@/features/finance/components/installment-plan-dialog";
import { InstallmentPlanCard } from "@/features/finance/components/installment-plan-card";
import type { Card as CardT } from "@/features/finance/types";

export const Route = createFileRoute("/_shell/cartoes")({
  component: CartoesPage,
  head: () => ({ meta: [{ title: "Cartões — Atlas" }] }),
});

function CartoesPage() {
  const { cards, plans, installments, removeCard } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CardT | null>(null);
  const [planOpen, setPlanOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Módulo"
        title="Cartões"
        description="Gerencie cartões, limites e parcelamentos em um só lugar."
        actions={
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPlanOpen(true)}
              disabled={cards.length === 0}
            >
              <Layers className="h-4 w-4" /> Parcelar
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus className="h-4 w-4" /> Cartão
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards">Cartões</TabsTrigger>
          <TabsTrigger value="installments">Parcelamentos</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4">
          {cards.length === 0 ? (
            <EmptyState
              title="Nenhum cartão cadastrado"
              description="Adicione seus cartões para acompanhar limites, faturas e parcelamentos."
              icon={<CardIcon className="h-4 w-4" />}
              action={
                <Button size="sm" onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4" /> Adicionar cartão
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((c) => (
                <CardItem
                  key={c.id}
                  card={c}
                  installments={installments}
                  plans={plans}
                  onEdit={() => {
                    setEditing(c);
                    setOpen(true);
                  }}
                  onDelete={() => removeCard(c.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="installments" className="mt-4">
          {plans.length === 0 ? (
            <EmptyState
              title="Sem parcelamentos ativos"
              description="Registre compras parceladas para acompanhar o valor restante mês a mês."
              action={
                <Button
                  size="sm"
                  onClick={() => setPlanOpen(true)}
                  disabled={cards.length === 0}
                >
                  <Plus className="h-4 w-4" /> Nova compra parcelada
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {plans.map((p) => (
                <InstallmentPlanCard key={p.id} plan={p} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CardDialog open={open} onOpenChange={setOpen} card={editing} />
      <InstallmentPlanDialog open={planOpen} onOpenChange={setPlanOpen} />
    </div>
  );
}
