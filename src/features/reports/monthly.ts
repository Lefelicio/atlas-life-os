export interface MonthlyReportData {
  period: string;
  income: number;
  expense: number;
  savings: number;
  investments: number;
  weight: number | null;
  workouts: number;
  objectivesCompleted: number;
  projectsCompleted: number;
  generatedAt: string | null;
}

export function buildMonthlyReportTemplate(data: MonthlyReportData): string {
  const lines = [
    `# Relatório Mensal — Atlas Life OS`,
    ``,
    `**Período:** ${data.period}`,
    `**Gerado em:** ${data.generatedAt ?? "Não gerado"}`,
    ``,
    `## Financeiro`,
    `- Receitas: ${data.income.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    `- Despesas: ${data.expense.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    `- Economia: ${data.savings.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    `- Investimentos: ${data.investments.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`,
    ``,
    `## Pessoal`,
    `- Peso: ${data.weight ? data.weight.toFixed(1) + " kg" : "Sem registro"}`,
    `- Treinos: ${data.workouts}`,
    ``,
    `## Objetivos e Projetos`,
    `- Objetivos concluídos: ${data.objectivesCompleted}`,
    `- Projetos concluídos: ${data.projectsCompleted}`,
    ``,
    `---`,
    `Relatório gerado automaticamente pelo Atlas Life OS`,
  ];
  return lines.join("\n");
}

export const MONTHLY_REPORT_STATUS = "Estrutura preparada. Geração automática disponível em futuras versões.";
