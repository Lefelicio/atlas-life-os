import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import {
  CATEGORY_LABELS,
  AUTO_METRIC_LABELS,
  AUTO_METRIC_AVAILABLE,
  type ObjectiveCategory,
  type ProgressType,
  type AutoMetric,
  type ObjectiveInput,
} from "../types";

const CATEGORY_ICONS: Record<ObjectiveCategory, string> = {
  financeiro: "Wallet",
  saude: "HeartPulse",
  estudos: "GraduationCap",
  profissional: "Briefcase",
  viagem: "Plane",
  pessoal: "User",
  outro: "Circle",
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (data: ObjectiveInput) => void;
}

export function ObjectiveDialog({ open, onOpenChange, onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ObjectiveCategory>("pessoal");
  const [deadline, setDeadline] = useState("");
  const [progressType, setProgressType] = useState<ProgressType>("manual");
  const [metric, setMetric] = useState<AutoMetric>("finance_balance");
  const [manualCurrent, setManualCurrent] = useState("");
  const [manualTarget, setManualTarget] = useState("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("pessoal");
    setDeadline("");
    setProgressType("manual");
    setMetric("finance_balance");
    setManualCurrent("");
    setManualTarget("");
  };

  const submit = () => {
    if (!title.trim()) return;
    onCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      deadline: deadline || undefined,
      icon: CATEGORY_ICONS[category],
      progressType,
      metric: progressType === "auto" ? metric : undefined,
      manualCurrent: progressType === "manual" ? Number(manualCurrent) || 0 : undefined,
      manualTarget: progressType === "manual" ? Number(manualTarget) || 0 : Number(manualTarget) || undefined,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo objetivo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-xs">Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Atingir 80 kg" autoFocus />
          </div>
          <div>
            <Label className="text-xs">Descrição (opcional)</Label>
            <Textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Categoria</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as ObjectiveCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as ObjectiveCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Prazo (opcional)</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Progresso automático</Label>
              <Switch
                checked={progressType === "auto"}
                onCheckedChange={(c) => setProgressType(c ? "auto" : "manual")}
              />
            </div>

            {progressType === "auto" ? (
              <div>
                <Label className="text-xs">Conectar com métrica</Label>
                <Select value={metric} onValueChange={(v) => setMetric(v as AutoMetric)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(AUTO_METRIC_LABELS) as AutoMetric[]).map((m) => (
                      <SelectItem key={m} value={m} disabled={!AUTO_METRIC_AVAILABLE[m]}>
                        {AUTO_METRIC_LABELS[m]}
                        {!AUTO_METRIC_AVAILABLE[m] && " (em breve)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  <Label className="text-xs">Meta final</Label>
                  <Input type="number" step="0.01" value={manualTarget} onChange={(e) => setManualTarget(e.target.value)} placeholder="Ex: 5000" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Valor atual</Label>
                  <Input type="number" step="0.01" value={manualCurrent} onChange={(e) => setManualCurrent(e.target.value)} placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs">Meta final</Label>
                  <Input type="number" step="0.01" value={manualTarget} onChange={(e) => setManualTarget(e.target.value)} placeholder="100" />
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit} disabled={!title.trim()}>Criar objetivo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
