export type AssetCategory =
  | "reserva"
  | "tesouro"
  | "cdb"
  | "lci_lca"
  | "etf"
  | "fii"
  | "acoes"
  | "cripto"
  | "previdencia"
  | "outro";

export const ASSET_CATEGORY_LABELS: Record<AssetCategory, string> = {
  reserva: "Reserva",
  tesouro: "Tesouro",
  cdb: "CDB",
  lci_lca: "LCI/LCA",
  etf: "ETF",
  fii: "FII",
  acoes: "Ações",
  cripto: "Cripto",
  previdencia: "Previdência",
  outro: "Outro",
};

export const ASSET_CATEGORIES = Object.keys(ASSET_CATEGORY_LABELS) as AssetCategory[];

export interface AssetEntry {
  id: string;
  amount: number;
  date: string;
  category: AssetCategory;
  institution: string;
  notes?: string;
  createdAt: string;
}

export type AssetInput = Omit<AssetEntry, "id" | "createdAt">;
