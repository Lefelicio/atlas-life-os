import { useEffect, useMemo } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFinance } from "@/features/finance/hooks/use-finance";
import { usePlanning } from "@/features/planning/store";
import { GROUP_LABELS, GROUP_ORDER, type BudgetGroup } from "@/features/planning/types";

export function CategoryMapping() {
  const { categories } = useFinance();
  const { categoryMappings, setCategoryGroup, autoMapCategories } = usePlanning();

  useEffect(() => {
    autoMapCategories(categories.map((c) => ({ id: c.id, name: c.name })));
  }, [categories, autoMapCategories]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.kind === "expense"),
    [categories],
  );

  return (
    <div className="space-y-3">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
        Mapeamento de categorias
      </p>
      <div className="space-y-2">
        {expenseCategories.map((cat) => {
          const group: BudgetGroup = categoryMappings[cat.id] ?? "pessoal";
          return (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/40 bg-card/30 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm">{cat.name}</span>
              </div>
              <Select
                value={group}
                onValueChange={(v) => setCategoryGroup(cat.id, v as BudgetGroup)}
              >
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_ORDER.map((g) => (
                    <SelectItem key={g} value={g}>
                      {GROUP_LABELS[g]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
