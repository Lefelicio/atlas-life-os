import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ProfileCard } from "@/features/pessoal/components/profile-card";
import { WeightTracker } from "@/features/pessoal/components/weight-tracker";
import { WorkoutCalendar } from "@/features/pessoal/components/workout-calendar";
import { StatsPanel } from "@/features/pessoal/components/stats-panel";
import { Timeline } from "@/features/pessoal/components/timeline";

export const Route = createFileRoute("/_shell/pessoal")({
  component: PessoalPage,
  head: () => ({ meta: [{ title: "Pessoal — Atlas" }] }),
});

function PessoalPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Módulo"
        title="Pessoal"
        description="Acompanhe sua evolução física e registre seus treinos ao longo do tempo."
      />

      <ProfileCard />

      <Tabs defaultValue="saude" className="w-full">
        <TabsList>
          <TabsTrigger value="saude">Saúde</TabsTrigger>
          <TabsTrigger value="treinos">Treinos</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          <TabsTrigger value="linha-do-tempo">Linha do tempo</TabsTrigger>
        </TabsList>

        <TabsContent value="saude" className="mt-6">
          <WeightTracker />
        </TabsContent>

        <TabsContent value="treinos" className="mt-6">
          <WorkoutCalendar />
        </TabsContent>

        <TabsContent value="estatisticas" className="mt-6">
          <StatsPanel />
        </TabsContent>

        <TabsContent value="linha-do-tempo" className="mt-6">
          <Timeline />
        </TabsContent>
      </Tabs>
    </div>
  );
}
