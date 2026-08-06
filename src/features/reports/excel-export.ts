import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";
import { format, parseISO, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  accountBalance,
  currency,
  sumExpense,
  sumIncome,
  totalBalance,
} from "@/features/finance/utils";
import type {
  Account,
  Card,
  Category,
  Transaction,
  Tag,
  PaymentMethod,
  CardBrand,
} from "@/features/finance/types";
import { PAYMENT_METHOD_LABELS } from "@/features/finance/types";

interface PatrimonyItem {
  id: string;
  name: string;
  category: string;
  value: number;
  date: string;
}

interface ObjetivoItem {
  id: string;
  title: string;
  status: string;
  kind: string;
  progress: number;
}

interface PesoItem {
  date: string;
  weight: number;
}

interface Profile {
  name: string;
  height: number | null;
}

function fmtDateBR(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return iso;
  }
}

function autoWidth(ws: XLSX.WorkSheet, data: unknown[][]) {
  const colWidths: { wch: number }[] = [];
  for (const row of data) {
    for (let i = 0; i < row.length; i++) {
      const cell = row[i];
      const len = cell !== null && cell !== undefined ? String(cell).length : 0;
      colWidths[i] = colWidths[i] || { wch: 10 };
      if (len > colWidths[i].wch) colWidths[i].wch = Math.min(len + 2, 50);
    }
  }
  ws["!cols"] = colWidths;
}

function styleHeaderRow(ws: XLSX.WorkSheet, rowIdx: number, colCount: number) {
  for (let c = 0; c < colCount; c++) {
    const addr = XLSX.utils.encode_cell({ r: rowIdx, c });
    if (ws[addr]) {
      ws[addr].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E40AF" } },
        alignment: { horizontal: "center" },
      };
    }
  }
}

async function fetchAllData() {
  const [accountsRes, categoriesRes, transactionsRes, cardsRes, tagsRes, patrimonyRes, objetivosRes, pesosRes, profilesRes] =
    await Promise.all([
      supabase.from("contas").select("*").order("created_at"),
      supabase.from("categorias").select("*").order("name"),
      supabase.from("transacoes").select("*").order("date", { ascending: false }),
      supabase.from("cartoes").select("*").order("created_at"),
      supabase.from("tags").select("*").order("name"),
      supabase.from("patrimonio").select("*").order("name"),
      supabase.from("objetivos").select("*").order("created_at"),
      supabase.from("pesos").select("*").order("date", { ascending: true }),
      supabase.from("profiles").select("name,height").maybeSingle(),
    ]);

  const accounts: Account[] = (accountsRes.data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    color: r.color as string,
    initialBalance: Number(r.initial_balance) ?? 0,
    createdAt: r.created_at as string,
  }));

  const categories: Category[] = (categoriesRes.data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    kind: r.kind as "income" | "expense",
    color: r.color as string,
  }));

  const transactions: Transaction[] = (transactionsRes.data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    kind: r.kind as "income" | "expense" | "transfer",
    date: r.date as string,
    accountId: r.conta_id as string,
    categoryId: (r.categoria_id as string) ?? undefined,
    description: r.description as string,
    amount: Number(r.amount) ?? 0,
    notes: (r.notes as string) ?? undefined,
    paymentMethod: ((r.payment_method as string) ?? "debit") as PaymentMethod,
    cardId: (r.card_id as string) ?? undefined,
    createdAt: r.created_at as string,
  })) as Transaction[];

  const cards: Card[] = (cardsRes.data ?? []).map((r: Record<string, unknown>) => ({
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
  }));

  const tags: Tag[] = (tagsRes.data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    color: r.color as string,
  }));

  const patrimony: PatrimonyItem[] = (patrimonyRes.data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    category: (r.category as string) ?? "Outros",
    value: Number(r.value) ?? 0,
    date: (r.date as string) ?? r.created_at as string,
  }));

  const objetivos: ObjetivoItem[] = (objetivosRes.data ?? []).map((r: Record<string, unknown>) => {
    const current = Number(r.current_value ?? r.current_count ?? 0);
    const target = Number(r.target_value ?? r.target_count ?? 1);
    const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return {
      id: r.id as string,
      title: r.title as string,
      status: r.status as string,
      kind: r.kind as string,
      progress,
    };
  });

  const pesos: PesoItem[] = (pesosRes.data ?? []).map((r: Record<string, unknown>) => ({
    date: r.date as string,
    weight: Number(r.weight) ?? 0,
  }));

  const profile: Profile = {
    name: (profilesRes.data as Record<string, unknown>)?.name ? String((profilesRes.data as Record<string, unknown>).name) : "Usuário",
    height: (profilesRes.data as Record<string, unknown>)?.height ? Number((profilesRes.data as Record<string, unknown>).height) : null,
  };

  return { accounts, categories, transactions, cards, tags, patrimony, objetivos, pesos, profile };
}

export async function exportExcelReport(): Promise<void> {
  const data = await fetchAllData();
  const wb = XLSX.utils.book_new();
  wb.Props = {
    Title: "Atlas Life OS — Relatório Completo",
    Author: data.profile.name,
    CreatedDate: new Date(),
  };

  // ===== Aba Financeiro =====
  const finRows: (string | number)[][] = [];

  // Receitas
  finRows.push(["=== RECEITAS ==="]);
  finRows.push(["Data", "Descrição", "Conta", "Categoria", "Forma de Pagamento", "Valor"]);
  const incomes = data.transactions.filter((t) => t.kind === "income");
  for (const t of incomes) {
    const acc = data.accounts.find((a) => a.id === t.accountId);
    const cat = data.categories.find((c) => c.id === t.categoryId);
    finRows.push([
      fmtDateBR(t.date),
      t.description,
      acc?.name ?? "—",
      cat?.name ?? "—",
      PAYMENT_METHOD_LABELS[t.paymentMethod ?? "debit"],
      t.amount,
    ]);
  }
  finRows.push(["", "", "", "", "Total de Receitas:", sumIncome(data.transactions)]);
  finRows.push([]);

  // Despesas
  finRows.push(["=== DESPESAS ==="]);
  finRows.push(["Data", "Descrição", "Conta", "Cartão", "Categoria", "Forma de Pagamento", "Valor"]);
  const expenses = data.transactions.filter((t) => t.kind === "expense");
  for (const t of expenses) {
    const acc = data.accounts.find((a) => a.id === t.accountId);
    const card = data.cards.find((c) => c.id === t.cardId);
    const cat = data.categories.find((c) => c.id === t.categoryId);
    finRows.push([
      fmtDateBR(t.date),
      t.description,
      acc?.name ?? "—",
      card?.name ?? "—",
      cat?.name ?? "—",
      PAYMENT_METHOD_LABELS[t.paymentMethod ?? "debit"],
      t.amount,
    ]);
  }
  finRows.push(["", "", "", "", "", "Total de Despesas:", sumExpense(data.transactions)]);
  finRows.push([]);

  // Transferências
  finRows.push(["=== TRANSFERÊNCIAS ==="]);
  finRows.push(["Data", "Descrição", "De", "Para", "Valor"]);
  const transfers = data.transactions.filter((t) => t.kind === "transfer");
  for (const t of transfers) {
    const fromAcc = data.accounts.find((a) => a.id === t.accountId);
    const toAcc = data.accounts.find((a) => a.id === t.toAccountId);
    finRows.push([
      fmtDateBR(t.date),
      t.description,
      fromAcc?.name ?? "—",
      toAcc?.name ?? "—",
      t.amount,
    ]);
  }
  finRows.push([]);

  // Contas
  finRows.push(["=== CONTAS ==="]);
  finRows.push(["Nome", "Saldo Inicial", "Saldo Atual"]);
  for (const a of data.accounts) {
    finRows.push([a.name, a.initialBalance, accountBalance(a, data.transactions)]);
  }
  finRows.push(["", "Saldo Total:", totalBalance(data.accounts, data.transactions)]);
  finRows.push([]);

  // Cartões
  finRows.push(["=== CARTÕES ==="]);
  finRows.push(["Nome", "Banco", "Bandeira", "Limite", "Fechamento", "Vencimento", "Ativo"]);
  for (const c of data.cards) {
    finRows.push([c.name, c.bank, c.brand, c.limit, `Dia ${c.closingDay}`, `Dia ${c.dueDay}`, c.active ? "Sim" : "Não"]);
  }
  finRows.push([]);

  // Categorias
  finRows.push(["=== CATEGORIAS ==="]);
  finRows.push(["Nome", "Tipo", "Total"]);
  for (const cat of data.categories) {
    const catTxs = data.transactions.filter((t) => t.categoryId === cat.id);
    const total = catTxs.reduce((s, t) => s + t.amount, 0);
    finRows.push([cat.name, cat.kind === "income" ? "Receita" : "Despesa", total]);
  }
  finRows.push([]);

  // Tags
  finRows.push(["=== TAGS ==="]);
  finRows.push(["Nome"]);
  for (const tag of data.tags) {
    finRows.push([tag.name]);
  }

  const wsFin = XLSX.utils.aoa_to_sheet(finRows);
  autoWidth(wsFin, finRows);
  XLSX.utils.book_append_sheet(wb, wsFin, "Financeiro");

  // ===== Aba Patrimônio =====
  const patRows: (string | number)[][] = [];
  patRows.push(["=== PATRIMÔNIO ==="]);
  patRows.push(["Nome", "Categoria", "Valor", "Data"]);
  for (const p of data.patrimony) {
    patRows.push([p.name, p.category, p.value, fmtDateBR(p.date)]);
  }
  patRows.push([]);
  patRows.push(["", "Total Patrimonial:", data.patrimony.reduce((s, p) => s + p.value, 0)]);

  // Evolução (últimos 6 meses)
  patRows.push([]);
  patRows.push(["=== EVOLUÇÃO PATRIMONIAL (6 meses) ==="]);
  patRows.push(["Mês", "Total"]);
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const mStart = format(startOfMonth(d), "yyyy-MM-dd");
    const mEnd = format(endOfMonth(d), "yyyy-MM-dd");
    const monthItems = data.patrimony.filter((p) => p.date <= mEnd);
    const total = monthItems.reduce((s, p) => s + p.value, 0);
    patRows.push([format(d, "MMMM 'de' yyyy", { locale: ptBR }), total]);
  }

  const wsPat = XLSX.utils.aoa_to_sheet(patRows);
  autoWidth(wsPat, patRows);
  XLSX.utils.book_append_sheet(wb, wsPat, "Patrimônio");

  // ===== Aba Objetivos =====
  const objRows: (string | number)[][] = [];
  objRows.push(["=== OBJETIVOS ==="]);
  objRows.push(["Título", "Tipo", "Status", "Progresso (%)"]);
  for (const o of data.objetivos) {
    objRows.push([
      o.title,
      o.kind,
      o.status === "active" ? "Ativo" : o.status === "completed" ? "Concluído" : "Pausado",
      o.progress,
    ]);
  }
  objRows.push([]);
  objRows.push(["", "Total de Objetivos:", data.objetivos.length]);

  const wsObj = XLSX.utils.aoa_to_sheet(objRows);
  autoWidth(wsObj, objRows);
  XLSX.utils.book_append_sheet(wb, wsObj, "Objetivos");

  // ===== Aba Peso =====
  const pesoRows: (string | number)[][] = [];
  pesoRows.push(["=== HISTÓRICO DE PESO ==="]);
  pesoRows.push(["Data", "Peso (kg)"]);
  for (const w of data.pesos) {
    pesoRows.push([fmtDateBR(w.date), w.weight]);
  }
  pesoRows.push([]);

  // Evolução
  pesoRows.push(["=== EVOLUÇÃO (6 meses) ==="]);
  pesoRows.push(["Mês", "Peso Médio", "Variação"]);
  const sortedPesos = [...data.pesos].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i);
    const mStart = format(startOfMonth(d), "yyyy-MM-dd");
    const mEnd = format(endOfMonth(d), "yyyy-MM-dd");
    const monthWeights = sortedPesos.filter((w) => w.date >= mStart && w.date <= mEnd);
    if (monthWeights.length === 0) {
      pesoRows.push([format(d, "MMMM", { locale: ptBR }), "—", "—"]);
      continue;
    }
    const avg = monthWeights.reduce((s, w) => s + w.weight, 0) / monthWeights.length;
    const gain = monthWeights[monthWeights.length - 1].weight - monthWeights[0].weight;
    pesoRows.push([format(d, "MMMM", { locale: ptBR }), Number(avg.toFixed(1)), Number(gain.toFixed(1))]);
  }

  const wsPeso = XLSX.utils.aoa_to_sheet(pesoRows);
  autoWidth(wsPeso, pesoRows);
  XLSX.utils.book_append_sheet(wb, wsPeso, "Peso");

  // ===== Aba Resumo =====
  const totalIncome = sumIncome(data.transactions);
  const totalExpense = sumExpense(data.transactions);
  const savings = totalIncome - totalExpense;
  const patrimonyTotal = data.patrimony.reduce((s, p) => s + p.value, 0);

  const resRows: (string | number)[][] = [];
  resRows.push(["=== RESUMO GERAL ==="]);
  resRows.push(["Indicador", "Valor"]);
  resRows.push(["Usuário", data.profile.name]);
  resRows.push(["Data de Emissão", new Date().toLocaleString("pt-BR")]);
  resRows.push([]);
  resRows.push(["Total de Receitas", totalIncome]);
  resRows.push(["Total de Despesas", totalExpense]);
  resRows.push(["Economia", savings]);
  resRows.push(["Patrimônio Total", patrimonyTotal]);
  resRows.push(["Saldo das Contas", totalBalance(data.accounts, data.transactions)]);
  resRows.push(["Quantidade de Lançamentos", data.transactions.length]);
  resRows.push(["Quantidade de Contas", data.accounts.length]);
  resRows.push(["Quantidade de Cartões", data.cards.length]);
  resRows.push(["Quantidade de Categorias", data.categories.length]);
  resRows.push(["Quantidade de Tags", data.tags.length]);
  resRows.push(["Quantidade de Objetivos", data.objetivos.length]);
  resRows.push(["Quantidade de Patrimônios", data.patrimony.length]);
  resRows.push(["Registros de Peso", data.pesos.length]);
  if (data.pesos.length > 0) {
    const currentWeight = sortedPesos[sortedPesos.length - 1].weight;
    resRows.push(["Peso Atual (kg)", currentWeight]);
    if (data.profile.height) {
      const imc = currentWeight / Math.pow(data.profile.height / 100, 2);
      resRows.push(["IMC", Number(imc.toFixed(1))]);
    }
  }

  const wsRes = XLSX.utils.aoa_to_sheet(resRows);
  autoWidth(wsRes, resRows);
  XLSX.utils.book_append_sheet(wb, wsRes, "Resumo");

  // Generate and download
  const date = new Date().toISOString().slice(0, 10);
  const filename = `atlas-relatorio-${date}.xlsx`;
  XLSX.writeFile(wb, filename);
}
