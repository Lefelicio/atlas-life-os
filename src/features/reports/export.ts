import * as XLSX from "xlsx";

export type ExportFormat = "csv" | "excel" | "pdf";

export interface ExportOptions {
  format: ExportFormat;
  period: { from: string; to: string };
  modules: string[];
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string | number): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export function exportCSV(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  options: ExportOptions,
) {
  const lines = [headers.map(escapeCSV).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCSV).join(","));
  }
  const meta = `# Atlas - ${title}\n# Período: ${options.period.from} a ${options.period.to}\n# Módulos: ${options.modules.join(", ")}\n# Gerado em: ${new Date().toLocaleString("pt-BR")}\n\n`;
  const date = new Date().toISOString().slice(0, 10);
  downloadBlob(meta + lines.join("\n"), `atlas-${title.toLowerCase().replace(/\s+/g, "-")}-${date}.csv`, "text/csv;charset=utf-8");
}

export function exportExcel(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  _options: ExportOptions,
) {
  const data: (string | number)[][] = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 2, 12) }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Relatório");
  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `atlas-${title.toLowerCase().replace(/\s+/g, "-")}-${date}.xlsx`);
}

export function exportPDF(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  options: ExportOptions,
) {
  const printWin = window.open("", "_blank");
  if (!printWin) return;
  printWin.document.write(`<html><head><title>Atlas - ${title}</title>
<style>
body { font-family: -apple-system, sans-serif; padding: 40px; color: #1a1a1a; }
h1 { font-size: 20px; margin-bottom: 4px; }
.meta { font-size: 12px; color: #666; margin-bottom: 24px; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; font-size: 11px; text-transform: uppercase; padding: 8px; border-bottom: 2px solid #333; }
td { padding: 8px; border-bottom: 1px solid #eee; font-size: 13px; }
.footer { margin-top: 32px; font-size: 10px; color: #999; }
</style></head><body>
<h1>Atlas - ${title}</h1>
<div class="meta">Período: ${options.period.from} a ${options.period.to}<br>Módulos: ${options.modules.join(", ")}<br>Gerado em: ${new Date().toLocaleString("pt-BR")}</div>
<table>
<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("\n")}
</table>
<div class="footer">Atlas Life OS — Relatório gerado automaticamente</div>
</body></html>`);
  printWin.document.close();
  setTimeout(() => printWin.print(), 300);
}

export function exportReport(
  title: string,
  headers: string[],
  rows: (string | number)[][],
  options: ExportOptions,
) {
  switch (options.format) {
    case "csv":
      return exportCSV(title, headers, rows, options);
    case "excel":
      return exportExcel(title, headers, rows, options);
    case "pdf":
      return exportPDF(title, headers, rows, options);
  }
}
