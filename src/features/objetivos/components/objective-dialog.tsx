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
import { cn } from "@/lib/utils";

import {
  CATEGORY_LABELS,
  KIND_LABELS,
  KIND_DESCRIPTIONS,
  FREQUENCY_LABELS,
  OBJECTIVE_TEMPLATES,
  type ObjectiveCategory,
  type ObjectiveKind,
  type ObjectiveInput,
  type RecurrenceFrequency,
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

const KIND_ORDER: ObjectiveKind[] = [
  "financeiro",
  "quantidade",
  "recorrente",
  "checkin",
  "personalizado",
];

const KIND_ICONS: Record<ObjectiveKind, string> = {
  financeiro: "Wallet",
  quantidade: "Hash",
  recorrente: "Repeat",
  checkin: "CheckCircle",
  personalizado: "Settings2",
  auto: "Zap",
  manual: "Pencil",
};

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (data: ObjectiveInput) => void;
}

type Step = "type" | "form" | "template";

export function ObjectiveDialog({ open, onOpenChange, onCreate }: Props) {
  const [step, setStep] = useState<Step>("type");
  const [kind, setKind] = useState<ObjectiveKind | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ObjectiveCategory>("pessoal");
  const [deadline, setDeadline] = useState("");

  // Financeiro
  const [currentValue, setCurrentValue] = useState("");
  const [targetValue, setTargetValue] = useState("");

  // Quantidade
  const [unit, setUnit] = useState("un");
  const [currentCount, setCurrentCount] = useState("");
  const [targetCount, setTargetCount] = useState("");

  // Recorrente
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("diaria");
  const [perPeriodTarget, setPerPeriodTarget] = useState("");

  const reset = () => {
    setStep("type");
    setKind(null);
    setTitle("");
    setDescription("");
    setCategory("pessoal");
    setDeadline("");
    setCurrentValue("");
    setTargetValue("");
    setUnit("un");
    setCurrentCount("");
    setTargetCount("");
    setFrequency("diaria");
    setPerPeriodTarget("");
  };

  const selectType = (k: ObjectiveKind) => {
    setKind(k);
    setStep("form");
  };

  const selectTemplate = (t: (typeof OBJECTIVE_TEMPLATES)[number]) => {
    setKind(t.kind);
    setTitle(t.title);
    setDescription(t.description ?? "");
    setCategory(t.category);
    setStep("form");
  };

  const submit = () => {
    if (!title.trim() || !kind) return;
    const input: ObjectiveInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      deadline: deadline || undefined,
      icon: CATEGORY_ICONS[category],
      progressType: "manual",
      kind,
      checkinDates: [],
    };

    switch (kind) {
      case "financeiro":
        input.currentValue = Number(currentValue.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
        input.targetValue = Number(targetValue.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
        input.manualCurrent = input.currentValue;
        input.manualTarget = input.targetValue;
        break;
      case "quantidade":
        input.unit = unit.trim() || "un";
        input.currentCount = Number(currentCount) || 0;
        input.targetCount = Number(targetCount) || 0;
        input.manualCurrent = input.currentCount;
        input.manualTarget = input.targetCount;
        break;
      case "recorrente":
        input.frequency = frequency;
        input.perPeriodTarget = Number(perPeriodTarget) || 1;
        input.manualTarget = input.perPeriodTarget;
        break;
      case "checkin":
        break;
      case "personalizado":
        input.manualCurrent = Number(currentValue) || 0;
        input.manualTarget = Number(targetValue) || 0;
        break;
    }

    onCreate(input);
    reset();
    onOpenChange(false);
  };

  const handleClose = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "type" && (
          <>
            <DialogHeader>
              <DialogTitle>Qual tipo de objetivo deseja criar?</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {KIND_ORDER.map((k) => (
                <button
                  key={k}
                  onClick={() => selectType(k)}
                  className="flex w-full items-start gap-3 rounded-lg border border-border/50 bg-card/30 p-3 text-left transition hover:border-primary/40 hover:bg-card/50"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
                    {KIND_ICONS[k][0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{KIND_LABELS[k]}</p>
                    <p className="text-xs text-muted-foreground">
                      {KIND_DESCRIPTIONS[k]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-2">
              <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                Modelos prontos
              </p>
              <div className="flex flex-wrap gap-1.5">
                {OBJECTIVE_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => selectTemplate(t)}
                    className="rounded-full border border-border/40 bg-muted/30 px-2.5 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === "form" && kind && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button
                  onClick={() => setStep("type")}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  ←
                </button>
                Novo objetivo · {KIND_LABELS[kind]}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Atingir 80 kg"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-xs">Descrição (opcional)</Label>
                <Textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Categoria</Label>
                  <Select
                    value={category}
                    onValueChange={(v) => setCategory(v as ObjectiveCategory)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CATEGORY_LABELS) as ObjectiveCategory[]).map((c) => (
                        <SelectItem key={c} value={c}>
                          {CATEGORY_LABELS[c]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Prazo (opcional)</Label>
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>

              {kind === "financeiro" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Valor atual</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="R$ 0,00"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Valor desejado</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="R$ 10.000,00"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {kind === "quantidade" && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Unidade</Label>
                    <Input
                      placeholder="livros, treinos..."
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Atual</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={currentCount}
                      onChange={(e) => setCurrentCount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Meta</Label>
                    <Input
                      type="number"
                      placeholder="12"
                      value={targetCount}
                      onChange={(e) => setTargetCount(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {kind === "recorrente" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Frequência</Label>
                    <Select
                      value={frequency}
                      onValueChange={(v) => setFrequency(v as RecurrenceFrequency)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(Object.keys(FREQUENCY_LABELS) as RecurrenceFrequency[]).map(
                          (f) => (
                            <SelectItem key={f} value={f}>
                              {FREQUENCY_LABELS[f]}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Meta por período</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={perPeriodTarget}
                      onChange={(e) => setPerPeriodTarget(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {kind === "checkin" && (
                <p className="rounded-lg border border-border/40 bg-muted/20 p-3 text-xs text-muted-foreground">
                  Objetivos de check-in registram apenas "realizado" ou "não realizado".
                  Você fará o check-in diariamente na página do objetivo.
                </p>
              )}

              {kind === "personalizado" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Valor atual</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Meta</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={targetValue}
                      onChange={(e) => setTargetValue(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => handleClose(false)}>
                Cancelar
              </Button>
              <Button onClick={submit} disabled={!title.trim()}>
                Criar objetivo
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
