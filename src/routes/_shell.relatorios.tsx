import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  HeartPulse,
  Crosshair,
  FolderKanban,
  GitCompare,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  CircleAlert,
  Info,
  FileText,
} from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { currency } from "@/features/finance/utils";
import {
  useExecutiveSummary,
  useFinancialReport,
  usePersonalReport,
  useObjectivesReport,
  useProjectsReport,
  useComparison,
  useReportInsights,
  type MetricDelta,
} from "@/features/reports/hooks";
import { exportReport, type ExportFormat } from "@/features/reports/export";
import { MONTHLY_REPORT_STATUS } from "@/features/reports/monthly";
import { triggerHelpOpen } from "@/features/help/help-events";

export const Route = createFileRoute("/_shell/relatorios")({
  component: RelatoriosPage,
  head: () => ({ meta: [{ title: "Relatórios — Atlas" }] }),
});

type Tab = "executive" | "financial" | "personal" | "objectives" | "projects" | "comparatives" | "monthly";

const TABS: { key: Tab; label: string; icon: typeof Wallet }[] = [
  { key: "executive", label: "Resumo Executivo", icon: LayoutDashboard },
  { key: "financial", label: "Financeiro", icon: Wallet },
  { key: "personal", label: "Pessoal", icon: HeartPulse },
  { key: "objectives", label: "Objetivos", icon: Crosshair },
  { key: "projects", label: "Projetos", icon: FolderKanban },
  { key: "comparatives", label: "Comparativos", icon: GitCompare },
  { key: "monthly", label: "Relatório Mensal", icon: FileText },
];

function RelatoriosPage() {
  const [tab, setTab] = useState<Tab>("executive");
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Análises"
        title="Relatórios"
        description="Informações úteis para tomada de decisão."
        onHelp={triggerHelpOpen}
        actions={
          <Button variant="outline" className="gap-2" onClick={() => setExportOpen(true)}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === t.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "executive" && <ExecutiveSummary />}
      {tab === "financial" && <FinancialReport />}
      {tab === "personal" && <PersonalReport />}
      {tab === "objectives" && <ObjectivesReport />}
      {tab === "projects" && <ProjectsReport />}
      {tab === "comparatives" && <Comparatives />}
      {tab === "monthly" && <MonthlyReport />}

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} tab={tab} />
    </div>
  );
}

function DeltaIndicator({ delta, invertColors }: { delta: MetricDelta; invertColors?: boolean }) {
  const isGood = invertColors ? delta.trend === "down" : delta.trend === "up";
  const isBad = invertColors ? delta.trend === "up" : delta.trend === "down";
  const Icon = delta.trend === "up" ? TrendingUp : delta.trend === "down" ? TrendingDown : Minus;
  const color = delta.previous === 0 && delta.current === 0
    ? "text-muted-foreground"
    : isGood ? "text-success"
    : isBad ? "text-destructive"
    : "text-muted-foreground";

  return (
    <span className={`flex items-center gap-1 text-xs ${color}`}>
      <Icon className="h-3 w-3" />
      {delta.previous === 0 && delta.current === 0
        ? "Sem dados"
        : `${delta.delta > 0 ? "+" : ""}${delta.deltaPct.toFixed(0)}%`}
    </span>
  );
}

function StatCard({ label, value, hint, delta, invertColors }: {
  label: string;
  value: string;
  hint?: string;
  delta?: MetricDelta;
  invertColors?: boolean;
}) {
  return (
    <Card className="border-border/40 bg-card/40">
      <CardContent className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums">{value}</p>
        {delta && <div className="mt-1"><DeltaIndicator delta={delta} invertColors={invertColors} /></div>}
        {hint && !delta && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function ExecutiveSummary() {
  const summary = useExecutiveSummary();
  const insights = useReportInsights();

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Receitas" value={currency(summary.income)} />
        <StatCard label="Despesas" value={currency(summary.expense)} />
        <StatCard label="Economia" value={currency(summary.savings)} hint={summary.savings >= 0 ? "Positivo" : "Negativo"} />
        <StatCard label="Investimentos" value={currency(summary.investments)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Peso" value={summary.weight ? `${summary.weight.toFixed(1)} kg` : "—"} hint={summary.weight ? "Atual" : "Sem registros"} />
        <StatCard label="IMC" value={summary.imc ? summary.imc.toFixed(1) : "—"} hint={summary.imc ? imcLabel(summary.imc) : "Cadastre sua altura"} />
        <StatCard label="Treinos" value={String(summary.workoutsThisMonth)} hint="Este mês" />
        <StatCard label="Objetivos" value={`${summary.activeObjectives} ativos`} hint={`${summary.completedObjectives} concluídos`} />
      </div>

      {summary.planningHealth.length > 0 && (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Planejamento Financeiro</p>
            <div className="mt-2 space-y-1">
              {summary.planningHealth.map((m, i) => (
                <p key={i} className="text-sm text-foreground">{m}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {insights.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Insights</p>
          {insights.map((ins) => (
            <div key={ins.id} className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm ${
              ins.tone === "positive" ? "border-success/20 bg-success/5" :
              ins.tone === "attention" ? "border-warning/20 bg-warning/5" :
              "border-border/40 bg-card/30"
            }`}>
              {ins.tone === "positive" ? <CheckCircle2 className="h-4 w-4 text-success" /> :
               ins.tone === "attention" ? <CircleAlert className="h-4 w-4 text-warning" /> :
               <Info className="h-4 w-4 text-muted-foreground" />}
              <span>{ins.text}</span>
            </div>
          ))}
        </div>
      )}

      {summary.highlights.length > 0 && (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Destaques do período</p>
            <ul className="mt-2 space-y-1.5">
              {summary.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                  {h}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function imcLabel(imc: number): string {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Saudável";
  if (imc < 30) return "Sobrepeso";
  return "Obesidade";
}

function FinancialReport() {
  const fin = useFinancialReport();

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Receitas" value={currency(fin.income)} delta={fin.incomeDelta} />
        <StatCard label="Despesas" value={currency(fin.expense)} delta={fin.expenseDelta} invertColors />
        <StatCard label="Economia" value={currency(fin.savings)} delta={fin.savingsDelta} />
        <StatCard label="Saldo" value={currency(fin.balance)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        <StatCard label="Investimentos" value={currency(fin.investments)} hint="Aportes do mês" />
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Comparação com mês anterior</p>
            <div className="mt-2 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Receitas</span>
                <span className="tabular-nums">{currency(fin.prevIncome)} → {currency(fin.income)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Despesas</span>
                <span className="tabular-nums">{currency(fin.prevExpense)} → {currency(fin.expense)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Economia</span>
                <span className="tabular-nums">{currency(fin.prevSavings)} → {currency(fin.savings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Planejado x Realizado (50/30/20)</p>
          <div className="mt-3 space-y-3">
            {fin.groupSummaries.map((g) => (
              <div key={g.group}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{g.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {currency(g.spent)} / {currency(g.budget)}
                  </span>
                </div>
                <Progress
                  value={Math.min(100, g.percentage)}
                  className="mt-1 h-2"
                  style={{ backgroundColor: "var(--muted)" }}
                />
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {g.percentage}% {g.status === "over" ? "— ultrapassou" : g.status === "warning" ? "— atenção" : "— dentro do orçamento"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Categorias com maiores gastos</p>
            {fin.topCategories.length > 0 ? (
              <div className="mt-3 space-y-2">
                {fin.topCategories.map((c) => (
                  <div key={c.name}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{c.name}</span>
                      <span className="tabular-nums text-muted-foreground">{currency(c.amount)}</span>
                    </div>
                    <Progress value={c.pct} className="mt-0.5 h-1.5" style={{ backgroundColor: "var(--muted)" }} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Nenhuma despesa registrada este mês.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fluxo financeiro (6 meses)</p>
            <div className="mt-3 space-y-2">
              {fin.monthlyFlow.map((m) => (
                <div key={m.month} className="flex items-center gap-2">
                  <span className="w-10 text-xs text-muted-foreground">{m.month}</span>
                  <div className="flex-1">
                    <div className="flex gap-0.5">
                      <div className="h-3 rounded-sm bg-success/60" style={{ width: `${Math.min(100, (m.income / Math.max(m.income, m.expense, 1)) * 50)}%` }} />
                      <div className="h-3 rounded-sm bg-destructive/60" style={{ width: `${Math.min(100, (m.expense / Math.max(m.income, m.expense, 1)) * 50)}%` }} />
                    </div>
                  </div>
                  <span className="w-16 text-right text-[10px] text-muted-foreground tabular-nums">
                    {currency(m.income - m.expense)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PersonalReport() {
  const p = usePersonalReport();

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Peso atual" value={p.currentWeight ? `${p.currentWeight.toFixed(1)} kg` : "—"} delta={p.weightDelta ?? undefined} />
        <StatCard label="IMC" value={p.imc ? p.imc.toFixed(1) : "—"} hint={p.imc ? imcLabel(p.imc) : "Cadastre sua altura"} />
        <StatCard label="Treinos" value={String(p.workoutsThisMonth)} delta={p.workoutDelta} hint="Este mês" />
        <StatCard label="Dias treinados" value={String(p.daysTrained)} hint="Dias distintos" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Histórico de peso</p>
            {p.weightHistory.length > 0 ? (
              <div className="mt-3 space-y-1.5">
                {p.weightHistory.map((w) => (
                  <div key={w.date} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{w.date}</span>
                    <span className="tabular-nums">{w.weight.toFixed(1)} kg</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Nenhum peso registrado.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Grupos musculares</p>
            {p.muscleGroups.length > 0 ? (
              <div className="mt-3 space-y-1.5">
                {p.muscleGroups.map((mg) => (
                  <div key={mg.group} className="flex justify-between text-sm">
                    <span>{mg.group}</span>
                    <span className="text-muted-foreground">{mg.count}x</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Nenhum grupo registrado este mês.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Atividades</p>
          {p.activitiesBreakdown.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {p.activitiesBreakdown.map((a) => (
                <div key={a.activity} className="flex justify-between text-sm">
                  <span>{a.activity}</span>
                  <span className="text-muted-foreground">{a.count} treino{a.count > 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Nenhum treino registrado este mês.</p>
          )}
        </CardContent>
      </Card>

      {p.jiuJitsuCount > 0 && (
        <StatCard label="Treinos de Jiu-Jitsu" value={String(p.jiuJitsuCount)} hint="Este mês" />
      )}

      {p.weightEvolution.total > 0 && (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Evolução do peso</p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatItem label="Peso mínimo" value={p.weightEvolution.min !== null ? `${p.weightEvolution.min.toFixed(1)} kg` : "—"} />
              <StatItem label="Peso máximo" value={p.weightEvolution.max !== null ? `${p.weightEvolution.max.toFixed(1)} kg` : "—"} />
              <StatItem label="Registros" value={String(p.weightEvolution.total)} />
              <StatItem label="Período" value={`${p.weightEvolution.monthly.length} meses`} />
            </div>
            <div className="mt-4 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Média mensal e variação</p>
              {p.weightEvolution.monthly.map((m) => (
                <div key={m.month} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground capitalize">{m.month}</span>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-muted-foreground">
                      {m.avg > 0 ? `${m.avg.toFixed(1)} kg` : "—"}
                    </span>
                    {m.gain !== 0 && m.avg > 0 && (
                      <span className={`flex items-center gap-0.5 text-xs tabular-nums ${m.gain < 0 ? "text-success" : "text-amber-500"}`}>
                        {m.gain > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {m.gain > 0 ? "+" : ""}{m.gain.toFixed(1).replace(".", ",")} kg
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function ObjectivesReport() {
  const o = useObjectivesReport();

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ativos" value={String(o.active)} />
        <StatCard label="Concluídos" value={String(o.completed)} />
        <StatCard label="Pausados" value={String(o.paused)} />
        <StatCard label="Progresso médio" value={`${o.avgProgress}%`} />
      </div>

      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Mais próximos da conclusão</p>
          {o.closest.length > 0 ? (
            <div className="mt-3 space-y-3">
              {o.closest.map((c) => (
                <div key={c.title}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{c.title}</span>
                    <span className="tabular-nums text-muted-foreground">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} className="mt-1 h-2" style={{ backgroundColor: "var(--muted)" }} />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Nenhum objetivo ativo.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Histórico mensal</p>
          <div className="mt-3 space-y-1.5">
            {o.monthlyHistory.map((m) => (
              <div key={m.month} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{m.month}</span>
                <span className="text-muted-foreground">{m.created} criados · {m.completed} concluídos</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectsReport() {
  const p = useProjectsReport();

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Projetos ativos" value={String(p.active)} />
        <StatCard label="Projetos concluídos" value={String(p.completed)} />
        <StatCard label="Progresso médio" value={`${p.avgProgress}%`} />
      </div>

      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Últimas atualizações</p>
          {p.recentUpdates.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {p.recentUpdates.map((u) => (
                <div key={u.title} className="flex justify-between text-sm">
                  <span>{u.title}</span>
                  <span className="text-muted-foreground">{u.date}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Nenhum projeto criado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Comparatives() {
  const [mode, setMode] = useState<"month" | "year" | "custom">("month");
  const [custom, setCustom] = useState({ from: "", to: "", prevFrom: "", prevTo: "" });
  const comp = useComparison(mode, mode === "custom" ? custom : undefined);

  const labels: Record<string, { label: string; value: MetricDelta; invert?: boolean; formatter?: (n: number) => string }> = {
    income: { label: "Receitas", value: comp.income, formatter: currency },
    expense: { label: "Despesas", value: comp.expense, invert: true, formatter: currency },
    investments: { label: "Investimentos", value: comp.investments, formatter: currency },
    workouts: { label: "Treinos", value: comp.workouts },
    objectives: { label: "Objetivos criados", value: comp.objectives },
    projects: { label: "Projetos criados", value: comp.projects },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={mode} onValueChange={(v) => setMode(v as typeof mode)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Mês atual x anterior</SelectItem>
            <SelectItem value="year">Ano atual x anterior</SelectItem>
            <SelectItem value="custom">Período personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {mode === "custom" && (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Período atual (de)</Label>
                <Input type="date" value={custom.from} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Período atual (até)</Label>
                <Input type="date" value={custom.to} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Período anterior (de)</Label>
                <Input type="date" value={custom.prevFrom} onChange={(e) => setCustom({ ...custom, prevFrom: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Período anterior (até)</Label>
                <Input type="date" value={custom.prevTo} onChange={(e) => setCustom({ ...custom, prevTo: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(labels).map(([key, { label, value, invert, formatter }]) => (
          <Card key={key} className="border-border/40 bg-card/40">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-xl font-semibold tabular-nums">
                  {formatter ? formatter(value.current) : String(value.current)}
                </p>
                <DeltaIndicator delta={value} invertColors={invert} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Anterior: {formatter ? formatter(value.previous) : String(value.previous)}
              </p>
            </CardContent>
          </Card>
        ))}

        {comp.weight && (
          <Card className="border-border/40 bg-card/40">
            <CardContent className="p-4">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Peso</p>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-xl font-semibold tabular-nums">{comp.weight.current.toFixed(1)} kg</p>
                <DeltaIndicator delta={comp.weight} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Anterior: {comp.weight.previous.toFixed(1)} kg
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MonthlyReport() {
  const summary = useExecutiveSummary();
  const objs = useObjectivesReport();
  const projs = useProjectsReport();
  const now = new Date();
  const period = `${now.toLocaleString("pt-BR", { month: "long" })} de ${now.getFullYear()}`;

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Relatório Mensal</p>
              <h3 className="mt-1 text-lg font-semibold capitalize">{period}</h3>
            </div>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <Separator className="my-4" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Receitas</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{currency(summary.income)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Despesas</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{currency(summary.expense)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Economia</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{currency(summary.savings)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Investimentos</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{currency(summary.investments)}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Peso</p>
              <p className="mt-1 text-lg font-semibold">{summary.weight ? `${summary.weight.toFixed(1)} kg` : "—"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Treinos</p>
              <p className="mt-1 text-lg font-semibold">{summary.workoutsThisMonth}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Objetivos concluídos</p>
              <p className="mt-1 text-lg font-semibold">{objs.completed}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Projetos concluídos</p>
              <p className="mt-1 text-lg font-semibold">{projs.completed}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-4">
          <div className="flex items-center gap-2.5">
            <Info className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{MONTHLY_REPORT_STATUS}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ExportDialog({ open, onOpenChange, tab }: { open: boolean; onOpenChange: (o: boolean) => void; tab: Tab }) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleExport = () => {
    const now = new Date();
    const period = {
      from: from || new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10),
      to: to || now.toISOString().slice(0, 10),
    };
    const modules = [TABS.find((t) => t.key === tab)?.label ?? "Relatório"];
    const title = `Relatório ${modules[0]}`;
    const headers = ["Indicador", "Valor"];
    const rows: (string | number)[][] = [["Período", `${period.from} a ${period.from}`], ["Gerado em", new Date().toLocaleString("pt-BR")]];
    exportReport(title, headers, rows, { format, period, modules });
    toast.success("Relatório exportado com sucesso.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Relatório</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm">Formato</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm">De</Label>
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm">Até</Label>
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Módulo: {TABS.find((t) => t.key === tab)?.label}
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
