import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Palette,
  Database,
  Settings2,
  Info,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  History,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/features/theme/theme-toggle";
import { useTheme } from "@/features/theme/store";
import { useActivity } from "@/features/activity/store";
import { groupByDate, formatTime } from "@/features/activity/utils";
import {
  downloadBackup,
  importBackup,
  validateBackup,
  type ImportResult,
  BACKUP_VERSION,
  BACKUP_SPRINT,
  ATLAS_VERSION,
  ATLAS_BUILD_DATE,
  ATLAS_DB,
  ATLAS_DB_VERSION,
} from "@/features/backup/backup";
import { triggerHelpOpen } from "@/features/help/help-events";

export const Route = createFileRoute("/_shell/configuracoes")({
  component: ConfiguracoesPage,
  head: () => ({ meta: [{ title: "Configurações — Atlas" }] }),
});

type Section = "aparencia" | "backup" | "sistema" | "sobre";

const SECTIONS: { key: Section; label: string; icon: typeof Palette }[] = [
  { key: "aparencia", label: "Aparência", icon: Palette },
  { key: "backup", label: "Backup", icon: Database },
  { key: "sistema", label: "Sistema", icon: Settings2 },
  { key: "sobre", label: "Sobre", icon: Info },
];

const CHANGELOG = [
  "Identidade visual do produto finalizada (logo, favicon, título)",
  "Suporte a PWA — instale o Atlas como aplicativo",
  "SEO básico com Open Graph e meta tags",
  "Página Sobre com informações do sistema e status da conexão",
  "Central de Ajuda completa com documentação de todos os módulos",
  "Animações suaves de entrada de página e transições",
  "Estados de loading padronizados em todos os formulários",
  "Estados vazios com orientação em todos os módulos",
];

function ConfiguracoesPage() {
  const [section, setSection] = useState<Section>("aparencia");
  const { mode } = useTheme();
  const { entries, clear } = useActivity();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{ raw: string; info: ImportResult } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleExport = () => {
    downloadBackup();
    toast.success("Backup exportado com sucesso.");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = String(reader.result);
      const backup = validateBackup(raw);
      if (!backup) {
        toast.error("Arquivo inválido. Selecione um backup do Atlas.");
        return;
      }
      const result = importBackup(raw);
      setImportPreview({ raw, info: result });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    const result = importBackup(importPreview.raw);
    if (result.ok) {
      toast.success(
        result.migrated
          ? `Backup restaurado (migrado da v${result.fromVersion} para v${BACKUP_VERSION}). Recarregando...`
          : "Backup restaurado com sucesso. Recarregando...",
      );
      setTimeout(() => window.location.reload(), 1500);
    } else {
      toast.error(result.error ?? "Erro ao importar backup.");
    }
    setImportPreview(null);
    setConfirmOpen(false);
  };

  const grouped = groupByDate(entries.slice(0, 50));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Preferências"
        title="Configurações"
        description="Gerencie aparência, backup, sistema e informações do Atlas."
        onHelp={triggerHelpOpen}
      />

      <div className="flex flex-wrap gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              section === s.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </div>

      {section === "aparencia" && (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="space-y-4 p-6">
            <div>
              <h3 className="text-sm font-semibold">Tema</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Escolha como o Atlas deve aparecer. A preferência é salva automaticamente.
              </p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Aparência</Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Modo atual: {mode === "light" ? "Claro" : mode === "dark" ? "Escuro" : "Sistema"}
                </p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>
      )}

      {section === "backup" && (
        <div className="space-y-4">
          <Card className="border-border/40 bg-card/40">
            <CardContent className="space-y-4 p-6">
              <div>
                <h3 className="text-sm font-semibold">Backup dos Dados</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Exporte todos os seus dados em um arquivo JSON ou restaure a partir de um backup.
                </p>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleExport} className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar Backup
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Importar Backup
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </CardContent>
          </Card>

          {importPreview && (
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="space-y-3 p-6">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                  <div>
                    <h3 className="text-sm font-semibold">Confirmar restauração</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {importPreview.info.migrated
                        ? `Backup da versão ${importPreview.info.fromVersion}. Será migrado automaticamente para a versão ${BACKUP_VERSION}.`
                        : "Os dados atuais serão substituídos pelos dados do backup."}
                    </p>
                    <p className="mt-1 text-xs font-medium text-foreground">
                      Esta ação não pode ser desfeita. A página será recarregada após a restauração.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { setConfirmOpen(true); }}>
                    Restaurar agora
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setImportPreview(null)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>Tem certeza?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground">
                Todos os dados atuais serão substituídos. Esta ação não pode ser desfeita.
              </p>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmImport} className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Sim, restaurar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {section === "sistema" && (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="space-y-4 p-6">
            <div>
              <h3 className="text-sm font-semibold">Histórico de Atividades</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Últimas ações registradas no Atlas.
              </p>
            </div>
            <Separator />
            {entries.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhuma atividade registrada ainda.
              </p>
            ) : (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {grouped.map((g) => (
                  <div key={g.label}>
                    <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {g.label}
                    </p>
                    <div className="space-y-1">
                      {g.items.map((e) => (
                        <div key={e.id} className="flex items-center gap-2 text-xs">
                          <span className="tabular-nums text-muted-foreground">
                            {formatTime(e.timestamp)}
                          </span>
                          <span className="font-medium">{e.action}</span>
                          {e.description && (
                            <span className="text-muted-foreground">· {e.description}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {entries.length > 0 && (
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={clear}>
                <History className="h-3.5 w-3.5" />
                Limpar histórico
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {section === "sobre" && (
        <Card className="border-border/40 bg-card/40">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                <span className="text-xl font-bold">A</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Atlas Life OS</h3>
                <p className="text-xs text-muted-foreground">Seu sistema de vida pessoal.</p>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Versão</p>
                <p className="mt-0.5 font-medium tabular-nums">{ATLAS_VERSION}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Sprint</p>
                <p className="mt-0.5 font-medium">{BACKUP_SPRINT}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Última atualização</p>
                <p className="mt-0.5 font-medium">{ATLAS_BUILD_DATE}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Banco de dados</p>
                <p className="mt-0.5 font-medium">{ATLAS_DB}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Versão do banco</p>
                <p className="mt-0.5 font-medium">{ATLAS_DB_VERSION}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Formato de backup</p>
                <p className="mt-0.5 font-medium">JSON v{BACKUP_VERSION}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                Novidades desta versão
              </p>
              <ul className="space-y-1.5">
                {CHANGELOG.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-success" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
