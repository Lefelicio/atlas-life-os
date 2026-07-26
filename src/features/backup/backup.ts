export const BACKUP_VERSION = 9;
export const BACKUP_SPRINT = "Sprint 11 — MVP";
export const ATLAS_VERSION = "1.0.0";
export const ATLAS_BUILD_DATE = "25 de julho de 2026";
export const ATLAS_DB = "Supabase (PostgreSQL)";
export const ATLAS_DB_VERSION = "PostgreSQL 15";
export const ATLAS_TECHS = [
  "React 19",
  "TypeScript 5",
  "TanStack Router",
  "TanStack Query",
  "Supabase (Auth + PostgreSQL)",
  "Tailwind CSS 4",
  "Vite 7",
  "Zustand",
  "Recharts",
];

export interface AtlasBackup {
  version: number;
  sprint: string;
  exportedAt: string;
  data: Record<string, unknown>;
}

const STORAGE_KEYS = [
  "atlas-finance-v2",
  "atlas-goals-v1",
  "atlas-objetivos-v1",
  "atlas-patrimony-v1",
  "atlas-planning-v1",
  "atlas-pessoal-v1",
  "atlas-theme-v1",
  "atlas-activity-v1",
  "atlas-user-v1",
];

export function exportBackup(): AtlasBackup {
  const data: Record<string, unknown> = {};
  for (const key of STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        data[key] = JSON.parse(raw);
      } catch {
        data[key] = raw;
      }
    }
  }
  return {
    version: BACKUP_VERSION,
    sprint: BACKUP_SPRINT,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function downloadBackup() {
  const backup = exportBackup();
  const date = new Date().toISOString().slice(0, 10);
  const filename = `atlas-backup-${date}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface ImportResult {
  ok: boolean;
  error?: string;
  migrated?: boolean;
  fromVersion?: number;
}

export function validateBackup(raw: string): AtlasBackup | null {
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    if (typeof parsed.version !== "number") return null;
    if (typeof parsed.data !== "object" || parsed.data === null) return null;
    return parsed as AtlasBackup;
  } catch {
    return null;
  }
}

export function importBackup(raw: string): ImportResult {
  const backup = validateBackup(raw);
  if (!backup) {
    return { ok: false, error: "Arquivo inválido. Selecione um backup do Atlas." };
  }

  if (backup.version > BACKUP_VERSION) {
    return {
      ok: false,
      error: `Este backup foi criado por uma versão mais recente do Atlas (v${backup.version}). Atualize o Atlas para importar.`,
      fromVersion: backup.version,
    };
  }

  const migrated = backup.version < BACKUP_VERSION;

  for (const [key, value] of Object.entries(backup.data)) {
    const storageKey = STORAGE_KEYS.includes(key) ? key : key;
    localStorage.setItem(storageKey, typeof value === "string" ? value : JSON.stringify(value));
  }

  return { ok: true, migrated, fromVersion: backup.version };
}
