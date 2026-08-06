import { supabase } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ATLAS_VERSION,
  ATLAS_BUILD_DATE,
} from "@/features/backup/backup";
import {
  accountBalance,
  currency,
  sumExpense,
  sumIncome,
  totalBalance,
  totalOpenFaturas,
} from "@/features/finance/utils";
import type {
  Account,
  Card,
  Category,
  Transaction,
  Fatura,
  PaymentMethod,
  CardBrand,
} from "@/features/finance/types";

interface PatrimonyItem {
  id: string;
  name: string;
  category: string;
  value: number;
}

interface ObjetivoItem {
  id: string;
  title: string;
  status: string;
  progress: number;
}

interface ProjetoItem {
  id: string;
  title: string;
  tasksTotal: number;
  tasksDone: number;
}

interface PesoItem {
  date: string;
  weight: number;
}

export interface PdfReportData {
  userName: string;
  generatedAt: string;
  // General summary
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  patrimonyTotal: number;
  openFaturas: number;
  objetivosCount: number;
  projetosCount: number;
  currentWeight: number | null;
  imc: number | null;
  // Finance
  accounts: { name: string; balance: number }[];
  categories: { name: string; kind: string; total: number }[];
  cards: { name: string; brand: string; limit: number; used: number }[];
  faturas: { cardName: string; month: string; amount: number; status: string }[];
  transactions: { date: string; description: string; amount: number; kind: string }[];
  // Patrimony
  patrimony: PatrimonyItem[];
  // Objetivos
  objetivos: ObjetivoItem[];
  // Projetos
  projetos: ProjetoItem[];
  // Minha Vida
  weightHistory: PesoItem[];
  // Statistics
  biggestIncome: number | null;
  biggestExpense: number | null;
  txCount: number;
  projetosCountTotal: number;
  objetivosCountTotal: number;
  monthlyBalance: number;
}

async function fetchFinanceData(): Promise<{
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  cards: Card[];
  faturas: Fatura[];
}> {
  const [accountsRes, categoriesRes, transactionsRes, cardsRes, faturasRes] =
    await Promise.all([
      supabase.from("contas").select("*").order("created_at"),
      supabase.from("categorias").select("*").order("name"),
      supabase.from("transacoes").select("*").order("date", { ascending: false }),
      supabase.from("cartoes").select("*").order("created_at"),
      supabase.from("faturas").select("*").order("competence_month", { ascending: false }),
    ]);

  return {
    accounts: (accountsRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: r.name as string,
      color: r.color as string,
      initialBalance: Number(r.initial_balance) ?? 0,
      createdAt: r.created_at as string,
    })),
    categories: (categoriesRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: r.name as string,
      kind: r.kind as "income" | "expense",
      color: r.color as string,
    })),
    transactions: (transactionsRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      kind: r.kind as "income" | "expense" | "transfer",
      date: r.date as string,
      accountId: r.conta_id as string,
      categoryId: (r.categoria_id as string) ?? undefined,
      description: r.description as string,
      amount: Number(r.amount) ?? 0,
      paymentMethod: ((r.payment_method as string) ?? "debit") as PaymentMethod,
      cardId: (r.card_id as string) ?? undefined,
      createdAt: r.created_at as string,
    })) as Transaction[],
    cards: (cardsRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      accountId: r.account_id as string,
      name: r.name as string,
      bank: r.bank as string,
      brand: r.brand as CardBrand,
      limit: Number(r.limit_amount) ?? 0,
      closingDay: r.closing_day as number,
      dueDay: r.due_day as number,
      color: r.color as string,
      active: r.active as boolean,
      createdAt: r.created_at as string,
    })),
    faturas: (faturasRes.data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      cardId: r.card_id as string,
      competenceMonth: r.competence_month as string,
      dueDate: (r.due_date as string) ?? undefined,
      amount: Number(r.amount) ?? 0,
      status: r.status as "open" | "paid",
      paidAmount: Number(r.paid_amount) ?? 0,
      createdAt: r.created_at as string,
    })),
  };
}

async function fetchPatrimony(): Promise<PatrimonyItem[]> {
  const { data } = await supabase.from("patrimonio").select("*").order("name");
  if (!data) return [];
  return data.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    category: (r.category as string) ?? "Outros",
    value: Number(r.value) ?? 0,
  }));
}

async function fetchObjetivos(): Promise<ObjetivoItem[]> {
  const { data } = await supabase.from("objetivos").select("*").order("created_at");
  if (!data) return [];
  return data.map((r: Record<string, unknown>) => {
    const current = Number(r.current_value ?? r.current_count ?? 0);
    const target = Number(r.target_value ?? r.target_count ?? 1);
    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return {
      id: r.id as string,
      title: r.title as string,
      status: r.status as string,
      progress,
    };
  });
}

async function fetchProjetos(): Promise<ProjetoItem[]> {
  const { data: projetos } = await supabase.from("projetos").select("*").order("created_at");
  if (!projetos) return [];
  const { data: tarefas } = await supabase.from("tarefas").select("projeto_id,status");
  const taskMap = new Map<string, { total: number; done: number }>();
  for (const t of tarefas ?? []) {
    const pid = (t as Record<string, unknown>).projeto_id as string;
    if (!pid) continue;
    if (!taskMap.has(pid)) taskMap.set(pid, { total: 0, done: 0 });
    const entry = taskMap.get(pid)!;
    entry.total++;
    if ((t as Record<string, unknown>).status === "done") entry.done++;
  }
  return projetos.map((r: Record<string, unknown>) => {
    const pid = r.id as string;
    const stats = taskMap.get(pid) ?? { total: 0, done: 0 };
    return {
      id: pid,
      title: r.title as string,
      tasksTotal: stats.total,
      tasksDone: stats.done,
    };
  });
}

async function fetchWeights(): Promise<PesoItem[]> {
  const { data } = await supabase.from("pesos").select("*").order("date", { ascending: true });
  if (!data) return [];
  return data.map((r: Record<string, unknown>) => ({
    date: r.date as string,
    weight: Number(r.weight) ?? 0,
  }));
}

async function fetchProfile(): Promise<{ name: string; height: number | null }> {
  const { data } = await supabase.from("profiles").select("name,height").maybeSingle();
  if (!data) return { name: "Usuário", height: null };
  return {
    name: (data as Record<string, unknown>).name as string || "Usuário",
    height: (data as Record<string, unknown>).height ? Number((data as Record<string, unknown>).height) : null,
  };
}

export async function gatherReportData(): Promise<PdfReportData> {
  const [finance, patrimony, objetivos, projetos, weights, profile] = await Promise.all([
    fetchFinanceData(),
    fetchPatrimony(),
    fetchObjetivos(),
    fetchProjetos(),
    fetchWeights(),
    fetchProfile(),
  ]);

  const { accounts, categories, transactions, cards, faturas } = finance;

  const total = totalBalance(accounts, transactions);
  const totalIncome = sumIncome(transactions);
  const totalExpense = sumExpense(transactions);
  const patrimonyTotal = patrimony.reduce((s, p) => s + p.value, 0);
  const openFaturas = totalOpenFaturas(faturas);

  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
  const imc = currentWeight && profile.height ? currentWeight / Math.pow(profile.height / 100, 2) : null;

  // Category totals
  const catTotals = categories.map((c) => {
    const catTxs = transactions.filter((t) => t.categoryId === c.id);
    const total = catTxs.reduce((s, t) => s + t.amount, 0);
    return { name: c.name, kind: c.kind, total };
  });

  // Card usage
  const cardStats = cards.map((c) => {
    const used = transactions
      .filter((t) => t.paymentMethod === "credit" && t.cardId === c.id && t.kind === "expense" && !t.faturaId)
      .reduce((s, t) => s + t.amount, 0);
    return { name: c.name, brand: c.brand, limit: c.limit, used };
  });

  // Fatura list
  const faturaList = faturas.map((f) => {
    const card = cards.find((c) => c.id === f.cardId);
    return {
      cardName: card?.name ?? "—",
      month: f.competenceMonth,
      amount: f.amount,
      status: f.status,
    };
  });

  // Transactions (last 50)
  const txList = transactions.slice(0, 50).map((t) => ({
    date: t.date,
    description: t.description,
    amount: t.amount,
    kind: t.kind,
  }));

  // Weight history
  const weightHistory = weights.slice(-20).map((w) => ({
    date: w.date,
    weight: w.weight,
  }));

  // Statistics
  const incomes = transactions.filter((t) => t.kind === "income");
  const expenses = transactions.filter((t) => t.kind === "expense");
  const biggestIncome = incomes.length > 0 ? Math.max(...incomes.map((t) => t.amount)) : null;
  const biggestExpense = expenses.length > 0 ? Math.max(...expenses.map((t) => t.amount)) : null;

  // Monthly balance (current month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
  const monthTxs = transactions.filter((t) => t.date >= monthStart && t.date <= monthEnd);
  const monthlyBalance = sumIncome(monthTxs) - sumExpense(monthTxs);

  return {
    userName: profile.name,
    generatedAt: new Date().toISOString(),
    totalBalance: total,
    totalIncome,
    totalExpense,
    patrimonyTotal,
    openFaturas,
    objetivosCount: objetivos.filter((o) => o.status === "active").length,
    projetosCount: projetos.length,
    currentWeight,
    imc,
    accounts: accounts.map((a) => ({ name: a.name, balance: accountBalance(a, transactions) })),
    categories: catTotals,
    cards: cardStats,
    faturas: faturaList,
    transactions: txList,
    patrimony,
    objetivos,
    projetos,
    weightHistory,
    biggestIncome,
    biggestExpense,
    txCount: transactions.length,
    projetosCountTotal: projetos.length,
    objetivosCountTotal: objetivos.length,
    monthlyBalance,
  };
}

function fmtDateBR(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

function fmtDateTimeBR(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return iso;
  }
}

/**
 * Generates the PDF report by building an HTML document and opening the
 * browser's print dialog (which allows "Save as PDF").
 */
export async function exportPdfReport(): Promise<void> {
  const data = await gatherReportData();
  const html = buildReportHtml(data);

  const printWin = window.open("", "_blank");
  if (!printWin) {
    throw new Error("Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.");
  }
  printWin.document.open();
  printWin.document.write(html);
  printWin.document.close();
  setTimeout(() => {
    printWin.focus();
    printWin.print();
  }, 500);
}

function buildReportHtml(data: PdfReportData): string {
  const styles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; background: #f8f9fa; padding: 40px; }
    .cover { text-align: center; padding: 80px 40px; background: linear-gradient(135deg, #1e293b, #3b82f6); color: white; border-radius: 16px; margin-bottom: 32px; }
    .cover h1 { font-size: 32px; margin-bottom: 8px; }
    .cover .subtitle { font-size: 16px; opacity: 0.9; margin-bottom: 24px; }
    .cover .meta { font-size: 13px; opacity: 0.8; }
    .section { background: white; border-radius: 12px; padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .section h2 { font-size: 16px; font-weight: 700; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; color: #1e293b; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
    .stat { padding: 12px; background: #f8f9fa; border-radius: 8px; }
    .stat .label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
    .stat .value { font-size: 16px; font-weight: 600; color: #1e293b; }
    .stat .value.expense { color: #dc2626; }
    .stat .value.income { color: #16a34a; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th { text-align: left; padding: 8px 12px; background: #f1f5f9; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
    td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; }
    tr:last-child td { border-bottom: none; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600; }
    .badge.open { background: #fef3c7; color: #92400e; }
    .badge.paid { background: #d1fae5; color: #065f46; }
    .badge.active { background: #dbeafe; color: #1e40af; }
    .badge.done { background: #d1fae5; color: #065f46; }
    .progress-bar { height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: #3b82f6; border-radius: 3px; }
    .footer { text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; margin-top: 20px; }
    @media print { body { padding: 0; background: white; } .section { box-shadow: none; border: 1px solid #e2e8f0; page-break-inside: avoid; } }
  `;

  const coverHtml = `
    <div class="cover">
      <h1>Atlas Life OS</h1>
      <p class="subtitle">Relatório Geral</p>
      <div class="meta">
        <p><strong>${data.userName}</strong></p>
        <p>${fmtDateTimeBR(data.generatedAt)}</p>
        <p>Versão ${ATLAS_VERSION} · ${ATLAS_BUILD_DATE}</p>
      </div>
    </div>
  `;

  const summaryHtml = `
    <div class="section">
      <h2>Resumo Geral</h2>
      <div class="stats-grid">
        <div class="stat"><div class="label">Saldo Total</div><div class="value">${currency(data.totalBalance)}</div></div>
        <div class="stat"><div class="label">Receitas</div><div class="value income">${currency(data.totalIncome)}</div></div>
        <div class="stat"><div class="label">Despesas</div><div class="value expense">${currency(data.totalExpense)}</div></div>
        <div class="stat"><div class="label">Patrimônio</div><div class="value">${currency(data.patrimonyTotal)}</div></div>
        <div class="stat"><div class="label">Faturas em Aberto</div><div class="value expense">${currency(data.openFaturas)}</div></div>
        <div class="stat"><div class="label">Objetivos</div><div class="value">${data.objetivosCount}</div></div>
        <div class="stat"><div class="label">Projetos</div><div class="value">${data.projetosCount}</div></div>
        <div class="stat"><div class="label">Peso Atual</div><div class="value">${data.currentWeight !== null ? data.currentWeight.toFixed(1).replace(".", ",") + " kg" : "—"}</div></div>
        <div class="stat"><div class="label">IMC</div><div class="value">${data.imc !== null ? data.imc.toFixed(1).replace(".", ",") : "—"}</div></div>
      </div>
    </div>
  `;

  const accountsRows = data.accounts.map((a) =>
    `<tr><td>${a.name}</td><td style="text-align:right">${currency(a.balance)}</td></tr>`,
  ).join("");

  const categoriesRows = data.categories.map((c) =>
    `<tr><td>${c.name}</td><td>${c.kind === "income" ? "Receita" : "Despesa"}</td><td style="text-align:right">${currency(c.total)}</td></tr>`,
  ).join("");

  const cardsRows = data.cards.map((c) =>
    `<tr><td>${c.name}</td><td>${c.brand}</td><td style="text-align:right">${currency(c.limit)}</td><td style="text-align:right">${currency(c.used)}</td></tr>`,
  ).join("");

  const faturasRows = data.faturas.map((f) =>
    `<tr><td>${f.cardName}</td><td>${f.month}</td><td style="text-align:right">${currency(f.amount)}</td><td><span class="badge ${f.status}">${f.status === "paid" ? "Paga" : "Em aberto"}</span></td></tr>`,
  ).join("");

  const txRows = data.transactions.map((t) =>
    `<tr><td>${fmtDateBR(t.date)}</td><td>${t.description}</td><td style="text-align:right" class="${t.kind === "income" ? "income" : "expense"}">${t.kind === "income" ? "+" : "−"}${currency(t.amount)}</td></tr>`,
  ).join("");

  const financeHtml = `
    <div class="section">
      <h2>Financeiro</h2>
      <h3 style="font-size:13px;margin-bottom:8px;color:#475569">Contas</h3>
      <table><thead><tr><th>Conta</th><th style="text-align:right">Saldo</th></tr></thead><tbody>${accountsRows}</tbody></table>
      <h3 style="font-size:13px;margin:16px 0 8px;color:#475569">Categorias</h3>
      <table><thead><tr><th>Categoria</th><th>Tipo</th><th style="text-align:right">Total</th></tr></thead><tbody>${categoriesRows}</tbody></table>
      <h3 style="font-size:13px;margin:16px 0 8px;color:#475569">Cartões</h3>
      <table><thead><tr><th>Cartão</th><th>Bandeira</th><th style="text-align:right">Limite</th><th style="text-align:right">Utilizado</th></tr></thead><tbody>${cardsRows}</tbody></table>
      <h3 style="font-size:13px;margin:16px 0 8px;color:#475569">Faturas</h3>
      <table><thead><tr><th>Cartão</th><th>Competência</th><th style="text-align:right">Valor</th><th>Status</th></tr></thead><tbody>${faturasRows}</tbody></table>
      <h3 style="font-size:13px;margin:16px 0 8px;color:#475569">Histórico Financeiro (últimos ${data.transactions.length})</h3>
      <table><thead><tr><th>Data</th><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead><tbody>${txRows}</tbody></table>
    </div>
  `;

  const patrimonyRows = data.patrimony.map((p) =>
    `<tr><td>${p.name}</td><td>${p.category}</td><td style="text-align:right">${currency(p.value)}</td></tr>`,
  ).join("");

  const patrimonyHtml = `
    <div class="section">
      <h2>Patrimônio</h2>
      <table><thead><tr><th>Item</th><th>Categoria</th><th style="text-align:right">Valor</th></tr></thead><tbody>${patrimonyRows}</tbody></table>
      <p style="margin-top:12px;font-size:14px;font-weight:600">Total Patrimonial: ${currency(data.patrimonyTotal)}</p>
    </div>
  `;

  const objetivosRows = data.objetivos.map((o) =>
    `<tr><td>${o.title}</td><td><span class="badge ${o.status === "completed" ? "done" : "active"}">${o.status === "completed" ? "Concluído" : "Ativo"}</span></td><td><div class="progress-bar"><div class="progress-fill" style="width:${o.progress}%"></div></div></td><td style="text-align:right">${o.progress}%</td></tr>`,
  ).join("");

  const objetivosHtml = `
    <div class="section">
      <h2>Objetivos</h2>
      <table><thead><tr><th>Objetivo</th><th>Status</th><th>Progresso</th><th style="text-align:right">%</th></tr></thead><tbody>${objetivosRows}</tbody></table>
    </div>
  `;

  const projetosRows = data.projetos.map((p) =>
    `<tr><td>${p.title}</td><td style="text-align:center">${p.tasksDone}/${p.tasksTotal}</td><td style="text-align:right">${p.tasksTotal > 0 ? Math.round((p.tasksDone / p.tasksTotal) * 100) : 0}%</td></tr>`,
  ).join("");

  const projetosHtml = `
    <div class="section">
      <h2>Projetos</h2>
      <table><thead><tr><th>Projeto</th><th style="text-align:center">Tarefas</th><th style="text-align:right">Conclusão</th></tr></thead><tbody>${projetosRows}</tbody></table>
    </div>
  `;

  const weightRows = data.weightHistory.slice().reverse().map((w) =>
    `<tr><td>${fmtDateBR(w.date)}</td><td style="text-align:right">${w.weight.toFixed(1).replace(".", ",")} kg</td></tr>`,
  ).join("");

  const minhaVidaHtml = `
    <div class="section">
      <h2>Minha Vida</h2>
      <div class="stats-grid">
        <div class="stat"><div class="label">Perfil</div><div class="value">${data.userName}</div></div>
        <div class="stat"><div class="label">Peso Atual</div><div class="value">${data.currentWeight !== null ? data.currentWeight.toFixed(1).replace(".", ",") + " kg" : "—"}</div></div>
        <div class="stat"><div class="label">IMC</div><div class="value">${data.imc !== null ? data.imc.toFixed(1).replace(".", ",") : "—"}</div></div>
      </div>
      <h3 style="font-size:13px;margin:16px 0 8px;color:#475569">Histórico de Peso</h3>
      <table><thead><tr><th>Data</th><th style="text-align:right">Peso</th></tr></thead><tbody>${weightRows}</tbody></table>
    </div>
  `;

  const statsHtml = `
    <div class="section">
      <h2>Estatísticas</h2>
      <div class="stats-grid">
        <div class="stat"><div class="label">Maior Receita</div><div class="value income">${data.biggestIncome !== null ? currency(data.biggestIncome) : "—"}</div></div>
        <div class="stat"><div class="label">Maior Despesa</div><div class="value expense">${data.biggestExpense !== null ? currency(data.biggestExpense) : "—"}</div></div>
        <div class="stat"><div class="label">Lançamentos</div><div class="value">${data.txCount}</div></div>
        <div class="stat"><div class="label">Projetos</div><div class="value">${data.projetosCountTotal}</div></div>
        <div class="stat"><div class="label">Objetivos</div><div class="value">${data.objetivosCountTotal}</div></div>
        <div class="stat"><div class="label">Saldo Mensal</div><div class="value ${data.monthlyBalance >= 0 ? "income" : "expense"}">${currency(data.monthlyBalance)}</div></div>
      </div>
    </div>
  `;

  const footerHtml = `
    <div class="footer">
      <p>Gerado automaticamente pelo Atlas Life OS · Versão ${ATLAS_VERSION}</p>
    </div>
  `;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Relatório Atlas — ${data.userName}</title><style>${styles}</style></head><body>${coverHtml}${summaryHtml}${financeHtml}${patrimonyHtml}${objetivosHtml}${projetosHtml}${minhaVidaHtml}${statsHtml}${footerHtml}</body></html>`;
}
