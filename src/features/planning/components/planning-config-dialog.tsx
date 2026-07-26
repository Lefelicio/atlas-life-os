import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePlanning } from "@/features/planning/store";
import { validatePercentages } from "@/features/planning/store";
import { GROUP_LABELS, GROUP_ORDER } from "@/features/planning/types";
import { currency } from "@/features/finance/utils";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function PlanningConfigDialog({ open, onOpenChange }: Props) {
  const { config, setConfig, setPercentages } = usePlanning();
  const [income, setIncome] = useState(String(config.monthlyIncome || ""));
  const [pcts, setPcts] = useState(config.percentages);

  useEffect(() => {
    setIncome(String(config.monthlyIncome || ""));
    setPcts(config.percentages);
  }, [config, open]);

  const sum = GROUP_ORDER.reduce((a, g) => a + (pcts[g] || 0), 0);
  const valid = Math.abs(sum - 100) < 0.01;

  const handleSave = () => {
    const incomeNum = Number(income.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
    if (!valid) {
      toast.error("A soma dos percentuais deve ser 100%.");
      return;
    }
    setConfig({ monthlyIncome: incomeNum });
    setPercentages(pcts);
    toast.success("Configuração salva.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Planejamento Financeiro</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Salário líquido mensal</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="R$ 5.000,00"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label>Distribuição financeira</Label>
            {GROUP_ORDER.map((g) => (
              <div key={g} className="flex items-center gap-3">
                <span className="w-28 text-sm text-muted-foreground">
                  {GROUP_LABELS[g]}
                </span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={pcts[g]}
                  onChange={(e) =>
                    setPcts({ ...pcts, [g]: Number(e.target.value) || 0 })
                  }
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
                <span className="ml-auto text-sm tabular-nums text-muted-foreground">
                  {currency(
                    (Number(income.replace(/[^\d.,]/g, "").replace(",", ".")) || 0) *
                      (pcts[g] / 100),
                  )}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">Total</span>
              <span
                className={
                  valid
                    ? "text-sm font-medium text-success"
                    : "text-sm font-medium text-destructive"
                }
              >
                {sum}%
              </span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!valid}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
