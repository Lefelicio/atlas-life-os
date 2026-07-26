import { useMemo } from "react";
import { useFinance } from "@/features/finance/hooks/use-finance";
import { useGoals } from "@/features/goals/store";
import { useObjetivos } from "@/features/objetivos/hooks/use-objetivos";
import { usePatrimony } from "@/features/patrimony/store";
import { usePessoal } from "@/features/pessoal/store";
import { currency } from "@/features/finance/utils";
import { ASSET_CATEGORY_LABELS } from "@/features/patrimony/types";
import { CATEGORY_LABELS, KIND_LABELS } from "@/features/objetivos/types";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  url: string;
}

export function useGlobalSearch(query: string): SearchResult[] {
  const { accounts, cards, categories, transactions } = useFinance();
  const { goals } = useGoals();
  const { objectives } = useObjetivos();
  const { entries } = usePatrimony();
  const { weights, workouts } = usePessoal();

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    const results: SearchResult[] = [];

    for (const a of accounts) {
      if (a.name.toLowerCase().includes(q)) {
        results.push({ id: a.id, title: a.name, subtitle: "Conta", category: "Contas", url: "/financas" });
      }
    }

    for (const c of cards) {
      if (c.name.toLowerCase().includes(q) || c.bank.toLowerCase().includes(q)) {
        results.push({ id: c.id, title: c.name, subtitle: c.bank, category: "Cartões", url: "/cartoes" });
      }
    }

    for (const c of categories) {
      if (c.name.toLowerCase().includes(q)) {
        results.push({ id: c.id, title: c.name, subtitle: c.kind === "income" ? "Receita" : "Despesa", category: "Categorias", url: "/financas" });
      }
    }

    for (const t of transactions.slice(0, 200)) {
      const desc = t.description.toLowerCase();
      if (desc.includes(q)) {
        const cat = categories.find((c) => c.id === t.categoryId);
        results.push({
          id: t.id,
          title: t.description,
          subtitle: `${currency(t.amount)}${cat ? " · " + cat.name : ""}`,
          category: t.kind === "income" ? "Receitas" : "Despesas",
          url: "/financas",
        });
      }
    }

    for (const g of goals) {
      if (g.title.toLowerCase().includes(q) || g.description?.toLowerCase().includes(q)) {
        results.push({ id: g.id, title: g.title, subtitle: currency(g.targetAmount), category: "Metas", url: "/metas" });
      }
    }

    for (const o of objectives) {
      if (o.title.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q)) {
        results.push({ id: o.id, title: o.title, subtitle: KIND_LABELS[o.kind ?? "manual"], category: "Objetivos", url: "/objetivos" });
      }
    }

    for (const e of entries) {
      if (e.institution.toLowerCase().includes(q) || e.notes?.toLowerCase().includes(q)) {
        results.push({ id: e.id, title: e.institution, subtitle: `${currency(e.amount)} · ${ASSET_CATEGORY_LABELS[e.category]}`, category: "Patrimônio", url: "/patrimonio" });
      }
    }

    for (const w of weights) {
      if (String(w.weight).includes(q) || w.notes?.toLowerCase().includes(q)) {
        results.push({ id: w.id, title: `${w.weight} kg`, subtitle: w.date, category: "Peso", url: "/pessoal" });
      }
    }

    for (const w of workouts) {
      const name = w.name ?? w.activity;
      if (name.toLowerCase().includes(q) || w.notes?.toLowerCase().includes(q)) {
        results.push({ id: w.id, title: name, subtitle: w.date, category: "Treinos", url: "/pessoal" });
      }
    }

    return results.slice(0, 50);
  }, [query, accounts, cards, categories, transactions, goals, objectives, entries, weights, workouts]);
}
