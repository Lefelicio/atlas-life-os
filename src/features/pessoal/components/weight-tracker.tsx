import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { usePessoal } from "../store";
import { calcBMI, currentWeight, initialWeight, weightDiffToGoal, formatWeight } from "../utils";
import { cn } from "@/lib/utils";

export function WeightTracker() {
  const { weights, profile, addWeight, removeWeight } = usePessoal();
  const [open, setOpen] = useState(false);

  const cur = currentWeight(weights);
  const init = initialWeight(weights);
  const diff = weightDiffToGoal(cur, profile.weightGoal);

  const chartData = useMemo(
    () =>
      [...weights]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((w) => ({
          date: w.date,
          label: format(parseISO(w.date), "dd/MM", { locale: ptBR }),
          weight: w.weight,
          bmi: calcBMI(w.weight, profile.height) ?? 0,
        })),
    [weights, profile.height],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Saúde
        </p>
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> Registrar peso
        </Button>
      </div>

      {weights.length === 0 ? (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <Scale className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhum registro de peso</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Registre seu peso semanalmente para acompanhar sua evolução.
            </p>
            <Button size="sm" onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Primeiro registro
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Peso inicial" value={init !== null ? formatWeight(init) : "—"} />
            <MiniStat label="Peso atual" value={cur !== null ? formatWeight(cur) : "—"} highlight />
            <MiniStat label="Peso objetivo" value={profile.weightGoal !== undefined ? formatWeight(profile.weightGoal) : "—"} />
            <MiniStat
              label="Até o objetivo"
              value={diff !== null ? `${diff > 0 ? "+" : ""}${formatWeight(Math.abs(diff))}` : "—"}
              icon={diff !== null && diff < 0 ? <TrendingDown className="h-3.5 w-3.5 text-success" /> : diff !== null && diff > 0 ? <TrendingUp className="h-3.5 w-3.5 text-amber-500" /> : <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
            />
          </div>

          {chartData.length >= 2 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Evolução do peso">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                    <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--popover-foreground)" }}
                      formatter={(v: number) => [formatWeight(v), "Peso"]}
                    />
                    <Line type="monotone" dataKey="weight" stroke="var(--primary)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Evolução do IMC">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                    <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
                    <Tooltip
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12, color: "var(--popover-foreground)" }}
                      formatter={(v: number) => [v.toFixed(1).replace(".", ","), "IMC"]}
                    />
                    <Line type="monotone" dataKey="bmi" stroke="var(--success)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          )}

          <Card className="border-border/40 bg-card/40">
            <CardContent className="p-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Histórico
              </p>
              <div className="space-y-1">
                {[...weights]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .slice(0, 8)
                  .map((w) => (
                    <div key={w.id} className="group flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/30">
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(w.date), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium tabular-nums">{formatWeight(w.weight)}</span>
                        {w.notes && <span className="hidden max-w-[200px] truncate text-xs text-muted-foreground sm:block">{w.notes}</span>}
                        <button
                          onClick={() => removeWeight(w.id)}
                          className="text-xs text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <WeightDialog open={open} onOpenChange={setOpen} onAdd={addWeight} />
    </div>
  );
}

function MiniStat({ label, value, highlight, icon }: { label: string; value: string; highlight?: boolean; icon?: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5">
        <p className={cn("text-sm font-semibold tabular-nums", highlight && "text-primary")}>{value}</p>
        {icon}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/40 bg-card/40">
      <CardContent className="p-5">
        <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">{title}</p>
        <div className="h-48">{children}</div>
      </CardContent>
    </Card>
  );
}

function WeightDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onAdd: (data: { date: string; weight: number; notes?: string }) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    const w = Number(weight);
    if (!date || !w || w <= 0) return;
    onAdd({ date, weight: w, notes: notes || undefined });
    setWeight("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar peso</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs">Peso (kg)</Label>
            <Input type="number" step="0.1" autoFocus value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="75.5" />
          </div>
          <div>
            <Label className="text-xs">Observações (opcional)</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!weight}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
