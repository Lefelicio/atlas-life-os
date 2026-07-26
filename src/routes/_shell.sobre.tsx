import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Database,
  Calendar,
  Server,
  Tag,
  ArrowRight,
  Layers,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ATLAS_VERSION,
  ATLAS_BUILD_DATE,
  ATLAS_DB,
  ATLAS_DB_VERSION,
  ATLAS_TECHS,
} from "@/features/backup/backup";
import { supabase } from "@/lib/supabase";
import { triggerHelpOpen } from "@/features/help/help-events";

export const Route = createFileRoute("/_shell/sobre")({
  component: SobrePage,
  head: () => ({
    meta: [
      { title: "Sobre — Atlas" },
      {
        name: "description",
        content: "Conheça o Atlas, seu sistema operacional pessoal.",
      },
    ],
  }),
});

const FEATURES = [
  { title: "Dashboard inteligente", desc: "Saudação dinâmica, indicadores financeiros e mensagens inteligentes em um só lugar." },
  { title: "Finanças completas", desc: "Contas, lançamentos, cartões, categorias, recorrências, favoritos e parcelamentos." },
  { title: "Objetivos e metas", desc: "Defina metas financeiras, de quantidade, recorrentes ou de check-in com progresso automático." },
  { title: "Projetos e tarefas", desc: "Acompanhe iniciativas com valor alvo e tarefas vinculadas a cada projeto." },
  { title: "Pessoal e saúde", desc: "Controle peso, IMC, treinos e acompanhe sua evolução corporal ao longo do tempo." },
  { title: "Patrimônio", desc: "Registre aportes e acompanhe a evolução do seu patrimônio por categoria." },
  { title: "Planejamento 50/30/20", desc: "Distribua sua renda entre essenciais, investimentos e pessoal com mapeamento de categorias." },
  { title: "Relatórios e exportação", desc: "Gere relatórios em PDF, Excel e CSV com comparativos entre períodos." },
  { title: "Central de Ajuda", desc: "Documentação completa com busca, tutoriais, guias e atalhos de teclado." },
  { title: "Backup e segurança", desc: "Exporte e importe seus dados a qualquer momento. RLS protege cada tabela." },
  { title: "Tema claro e escuro", desc: "Escolha entre claro, escuro ou sistema. A preferência é salva automaticamente." },
  { title: "PWA instalável", desc: "Instale o Atlas no seu dispositivo e use como aplicativo, com suporte offline básico." },
];

function SobrePage() {
  const [dbStatus, setDbStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    let cancelled = false;
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .limit(1)
      .then(({ error }) => {
        if (!cancelled) setDbStatus(error ? "offline" : "online");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Atlas Life OS"
        title="Sobre o Atlas"
        description="Um sistema operacional pessoal para acompanhar sua evolução financeira, pessoal e profissional."
        onHelp={triggerHelpOpen}
      />

      <Card className="border-border/40 bg-card/40">
        <CardContent className="space-y-4 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <span className="text-2xl font-bold">A</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Atlas — Life OS</h2>
              <p className="text-sm text-muted-foreground">
                Versão {ATLAS_VERSION} · MVP
              </p>
            </div>
          </div>
          <Separator />
          <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              O Atlas nasceu da ideia de que sua vida merece um sistema organizado —
              não uma pilha de planilhas e aplicativos soltos. Ele reúne finanças,
              objetivos, projetos, saúde e patrimônio em uma única interface, com
              indicadores claros e mensagens inteligentes que ajudam você a tomar
              decisões melhores todos os dias.
            </p>
            <p>
              O objetivo é simples: que você consiga entender sua situação completa
              em segundos, sem precisar abrir cinco abas. Tudo o que você cadastra
              pertence a você, fica protegido por segurança em nível de linha e pode
              ser exportado quando quiser.
            </p>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Principais funcionalidades
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="border-border/40 bg-card/40">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-foreground">{f.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Informações do sistema
        </h3>
        <Card className="mt-3 border-border/40 bg-card/40">
          <CardContent className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
            <InfoRow icon={<Tag className="h-3.5 w-3.5" />} label="Versão do Atlas" value={ATLAS_VERSION} />
            <InfoRow icon={<Calendar className="h-3.5 w-3.5" />} label="Data da build" value={ATLAS_BUILD_DATE} />
            <InfoRow icon={<Database className="h-3.5 w-3.5" />} label="Banco de dados" value={ATLAS_DB} />
            <InfoRow icon={<Database className="h-3.5 w-3.5" />} label="Versão do banco" value={ATLAS_DB_VERSION} />
            <InfoRow
              icon={<Server className="h-3.5 w-3.5" />}
              label="Status da conexão"
              value={
                dbStatus === "checking"
                  ? "Verificando…"
                  : dbStatus === "online"
                    ? "Online"
                    : "Offline"
              }
              status={dbStatus}
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Tecnologias utilizadas
        </h3>
        <Card className="mt-3 border-border/40 bg-card/40">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {ATLAS_TECHS.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-2.5 py-1 text-xs font-medium text-foreground"
                >
                  <Layers className="h-3 w-3 text-muted-foreground" />
                  {tech}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild variant="outline" className="gap-1.5">
          <Link to="/configuracoes">
            Abrir Configurações
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <Button variant="ghost" onClick={triggerHelpOpen} className="gap-1.5">
          Abrir Central de Ajuda
        </Button>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  status,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  status?: "checking" | "online" | "offline";
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {status === "online" && <CheckCircle2 className="h-4 w-4 text-success" />}
        {status === "offline" && <CircleAlert className="h-4 w-4 text-destructive" />}
        <p className="text-sm font-medium tabular-nums">{value}</p>
      </div>
    </div>
  );
}
