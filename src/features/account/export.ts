import { supabase } from "@/lib/supabase";

export interface ExportedData {
  version: number;
  sprint: string;
  exportedAt: string;
  data: {
    profile?: Record<string, unknown>;
    contas?: Record<string, unknown>[];
    categorias?: Record<string, unknown>[];
    transacoes?: Record<string, unknown>[];
    objetivos?: Record<string, unknown>[];
    projetos?: Record<string, unknown>[];
    tarefas?: Record<string, unknown>[];
    tags?: Record<string, unknown>[];
  };
}

async function fetchTable(table: string): Promise<Record<string, unknown>[]> {
  const { data, error } = await supabase.from(table).select("*");
  if (error) throw error;
  return (data ?? []) as Record<string, unknown>[];
}

export async function exportUserData(): Promise<ExportedData> {
  const [
    profileResult,
    contas,
    categorias,
    transacoes,
    objetivos,
    projetos,
    tarefas,
    tags,
  ] = await Promise.all([
    supabase.from("profiles").select("*").maybeSingle(),
    fetchTable("contas"),
    fetchTable("categorias"),
    fetchTable("transacoes"),
    fetchTable("objetivos"),
    fetchTable("projetos"),
    fetchTable("tarefas"),
    fetchTable("tags"),
  ]);

  return {
    version: 10,
    sprint: "Sprint 10.3",
    exportedAt: new Date().toISOString(),
    data: {
      profile: (profileResult.data as Record<string, unknown>) ?? undefined,
      contas,
      categorias,
      transacoes,
      objetivos,
      projetos,
      tarefas,
      tags,
    },
  };
}

export async function downloadUserData() {
  const exported = await exportUserData();
  const date = new Date().toISOString().slice(0, 10);
  const filename = `atlas-meus-dados-${date}.json`;
  const blob = new Blob([JSON.stringify(exported, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
