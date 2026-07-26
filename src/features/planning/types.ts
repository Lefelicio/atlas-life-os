export type BudgetGroup = "essenciais" | "investimentos" | "pessoal";

export const GROUP_LABELS: Record<BudgetGroup, string> = {
  essenciais: "Essenciais",
  investimentos: "Investimentos",
  pessoal: "Pessoal",
};

export const GROUP_ORDER: BudgetGroup[] = ["essenciais", "investimentos", "pessoal"];

export interface BudgetConfig {
  monthlyIncome: number;
  percentages: Record<BudgetGroup, number>;
}

export interface CategoryGroupMapping {
  categoryId: string;
  group: BudgetGroup;
}

export interface PlanningState {
  config: BudgetConfig;
  categoryMappings: Record<string, BudgetGroup>;
  hydrated: boolean;

  setConfig: (config: Partial<BudgetConfig>) => void;
  setPercentages: (percentages: Record<BudgetGroup, number>) => void;
  setCategoryGroup: (categoryId: string, group: BudgetGroup) => void;
  autoMapCategories: (categoryNames: Array<{ id: string; name: string }>) => void;
}

const DEFAULT_KEYWORDS: Record<BudgetGroup, string[]> = {
  essenciais: [
    "mercado", "aluguel", "internet", "energia", "água", "gas", "gás",
    "condomínio", "transporte", "combustível", "gasolina", "academia",
    "saúde", "farmácia", "remédio", "médico", "escola", "educação",
    "curso", "seguro", "plano",
  ],
  investimentos: [
    "etf", "tesouro", "ações", "fiis", "fii", "cripto", "criptomoeda",
    "bitcoin", "cdb", "lci", "lca", "previdência", "renda fixa",
    "investimento", "reserva", "fundo",
  ],
  pessoal: [
    "cinema", "restaurante", "viagem", "lazer", "bar", "show",
    "netflix", "spotify", "jogo", "presente", "shopping", "hobby",
    "assinatura",
  ],
};

export function guessGroup(categoryName: string): BudgetGroup {
  const lower = categoryName.toLowerCase();
  for (const group of GROUP_ORDER) {
    if (DEFAULT_KEYWORDS[group].some((kw) => lower.includes(kw))) {
      return group;
    }
  }
  return "pessoal";
}
