import { useState, useRef, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  User,
  Mail,
  Lock,
  Palette,
  Database,
  Shield,
  LogOut,
  Download,
  Trash2,
  Camera,
  X,
  Monitor,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/features/auth/auth-context";
import { useTheme, type ThemeMode } from "@/features/theme/store";
import { supabase } from "@/lib/supabase";
import { downloadUserData } from "@/features/account/export";

export const Route = createFileRoute("/_shell/minha-conta")({
  component: MinhaContaPage,
  head: () => ({ meta: [{ title: "Minha Conta — Atlas" }] }),
});

type Section = "perfil" | "seguranca" | "preferencias" | "dados";

const SECTIONS: { key: Section; label: string; icon: typeof User }[] = [
  { key: "perfil", label: "Perfil", icon: User },
  { key: "seguranca", label: "Segurança", icon: Shield },
  { key: "preferencias", label: "Preferências", icon: Palette },
  { key: "dados", label: "Dados da Conta", icon: Database },
];

const CURRENCIES = [
  { value: "BRL", label: "Real (R$)" },
  { value: "USD", label: "Dólar ($)" },
  { value: "EUR", label: "Euro (€)" },
];

const TIMEZONES = [
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "America/New_York", label: "Nova York (GMT-5)" },
  { value: "Europe/London", label: "Londres (GMT+0)" },
  { value: "Asia/Tokyo", label: "Tóquio (GMT+9)" },
];

const LANGUAGES = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en-US", label: "English (US)" },
  { value: "es-ES", label: "Español" },
];

function MinhaContaPage() {
  const [section, setSection] = useState<Section>("perfil");

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHeader
        eyebrow="Conta"
        title="Minha Conta"
        description="Gerencie seu perfil, segurança, preferências e dados."
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

      {section === "perfil" && <ProfileSection />}
      {section === "seguranca" && <SecuritySection />}
      {section === "preferencias" && <PreferencesSection />}
      {section === "dados" && <DataSection />}
    </div>
  );
}

// ============================================================
// PROFILE SECTION
// ============================================================

function ProfileSection() {
  const { user, profile, updateProfile } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prefs = loadPrefs();
    setPhone(prefs.phone ?? "");
    setCity(prefs.city ?? "");
    setState(prefs.state ?? "");
    setCountry(prefs.country ?? "Brasil");
  }, []);

  const initials = (profile?.name ?? "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione apenas um arquivo de imagem.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      setPendingFile(file);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const uploadAvatar = async () => {
    if (!pendingFile || !user) return;
    setUploading(true);
    try {
      if (avatarUrl) {
        const oldPath = avatarUrl.split("/atlas-files/")[1];
        if (oldPath) {
          await supabase.storage.from("atlas-files").remove([oldPath]);
        }
      }
      const ext = pendingFile.name.split(".").pop() ?? "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("atlas-files")
        .upload(path, pendingFile, { contentType: pendingFile.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("atlas-files").getPublicUrl(path);
      const url = pub.publicUrl;
      await updateProfile({ avatar_url: url });
      setAvatarUrl(url);
      setPreviewUrl(null);
      setPendingFile(null);
      toast.success("Avatar atualizado com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar imagem.");
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    if (!user || !avatarUrl) return;
    setUploading(true);
    try {
      const oldPath = avatarUrl.split("/atlas-files/")[1];
      if (oldPath) {
        await supabase.storage.from("atlas-files").remove([oldPath]);
      }
      await updateProfile({ avatar_url: null });
      setAvatarUrl(null);
      setPreviewUrl(null);
      setPendingFile(null);
      toast.success("Avatar removido.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao remover imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("O nome é obrigatório.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ name: name.trim() });
      savePrefs({ phone, city, state, country });
      toast.success("Perfil atualizado com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Avatar */}
      <Card className="border-border/40 bg-card/40">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold">Avatar</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sua foto de perfil visível no cabeçalho e no dashboard.
          </p>
          <Separator className="my-4" />
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Preview" />
              ) : avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Avatar" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                {initials || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-3.5 w-3.5" />
                  {avatarUrl ? "Trocar" : "Enviar"}
                </Button>
                {avatarUrl && !previewUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-2 text-destructive"
                    onClick={removeAvatar}
                    disabled={uploading}
                  >
                    <X className="h-3.5 w-3.5" />
                    Remover
                  </Button>
                )}
                {previewUrl && (
                  <>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={uploadAvatar}
                      disabled={uploading}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Confirmar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setPreviewUrl(null);
                        setPendingFile(null);
                      }}
                      disabled={uploading}
                    >
                      Cancelar
                    </Button>
                  </>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                JPG, PNG ou GIF. Máximo 5 MB.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile fields */}
      <Card className="border-border/40 bg-card/40">
        <CardContent className="space-y-4 p-6">
          <div>
            <h3 className="text-sm font-semibold">Informações pessoais</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Atualize seus dados. O nome é salvo no banco; os demais campos ficam salvos localmente até integração futura.
            </p>
          </div>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <div>
              <Label className="text-xs">E-mail</Label>
              <Input value={user?.email ?? ""} disabled className="bg-muted/30" />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Para alterar o e-mail, use a aba Segurança.
              </p>
            </div>
            <div>
              <Label className="text-xs">Telefone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className="text-xs">Cidade</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="São Paulo" />
              </div>
              <div>
                <Label className="text-xs">Estado</Label>
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="SP" />
              </div>
              <div>
                <Label className="text-xs">País</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Brasil" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar perfil"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// SECURITY SECTION
// ============================================================

function SecuritySection() {
  const { user, session, signOut, updatePassword } = useAuth();
  const navigate = useNavigate();

  // Email change
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const handleEmailChange = async () => {
    if (!newEmail.trim() || !emailPassword.trim()) {
      toast.error("Preencha o novo e-mail e a senha atual.");
      return;
    }
    if (newEmail.trim() === user?.email) {
      toast.error("O novo e-mail é igual ao atual.");
      return;
    }
    setEmailLoading(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user?.email ?? "",
        password: emailPassword,
      });
      if (signInErr) throw new Error("Senha atual incorreta.");

      const { error: updateErr } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (updateErr) throw updateErr;

      toast.success("E-mail atualizado. Se a confirmação por e-mail estiver ativa, verifique sua caixa de entrada.");
      setNewEmail("");
      setEmailPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar e-mail.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      toast.error("Preencha todos os campos de senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A nova senha e a confirmação não coincidem.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    setPwLoading(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user?.email ?? "",
        password: currentPassword,
      });
      if (signInErr) throw new Error("Senha atual incorreta.");

      await updatePassword(newPassword);
      toast.success("Senha alterada com sucesso. Você continua autenticado.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao alterar senha.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sessão encerrada.");
      navigate({ to: "/login", search: {}, replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao sair.");
    }
  };

  const emailConfirmed = user?.email_confirmed_at != null;
  const sessionStart = session?.expires_at
    ? new Date(session.expires_at).toLocaleString("pt-BR")
    : "—";

  return (
    <div className="space-y-4">
      {/* Email change */}
      <Card className="border-border/40 bg-card/40">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">Alterar e-mail</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Confirme sua senha atual para alterar o e-mail da conta.
              </p>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label className="text-xs">E-mail atual</Label>
              <Input value={user?.email ?? ""} disabled className="bg-muted/30" />
            </div>
            <div>
              <Label className="text-xs">Novo e-mail</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="novo@email.com"
              />
            </div>
            <div>
              <Label className="text-xs">Senha atual</Label>
              <Input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleEmailChange} disabled={emailLoading}>
              {emailLoading ? "Alterando..." : "Alterar e-mail"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password change */}
      <Card className="border-border/40 bg-card/40">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">Alterar senha</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Mínimo de 6 caracteres. Você continua autenticado após a alteração.
              </p>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Senha atual</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label className="text-xs">Nova senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label className="text-xs">Confirmar nova senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handlePasswordChange} disabled={pwLoading}>
              {pwLoading ? "Alterando..." : "Alterar senha"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session */}
      <Card className="border-border/40 bg-card/40">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">Sessão</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Informações da sessão atual e gerenciamento de acesso.
              </p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Dispositivo</p>
              <p className="mt-1 text-sm font-medium">
                {navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop"} · {getBrowserName()}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Início da sessão</p>
              <p className="mt-1 text-sm font-medium">{sessionStart}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">E-mail verificado</p>
              <Badge variant={emailConfirmed ? "default" : "secondary"} className="mt-1">
                {emailConfirmed ? "Verificado" : "Pendente"}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LogOut className="h-4 w-4" />
              Encerrar sessão atual
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2">
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            O gerenciamento de múltiplas sessões estará disponível em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================
// PREFERENCES SECTION
// ============================================================

function PreferencesSection() {
  const { mode, setMode } = useTheme();
  const [language, setLanguage] = useState("pt-BR");
  const [currency, setCurrency] = useState("BRL");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");

  useEffect(() => {
    const prefs = loadPrefs();
    if (prefs.language) setLanguage(prefs.language);
    if (prefs.currency) setCurrency(prefs.currency);
    if (prefs.timezone) setTimezone(prefs.timezone);
  }, []);

  const handleSave = (key: string, value: string) => {
    const prefs = loadPrefs();
    savePrefs({ ...prefs, [key]: value });
  };

  return (
    <Card className="border-border/40 bg-card/40">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          <div>
            <h3 className="text-sm font-semibold">Preferências</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Personalize a aparência e o comportamento do Atlas. As preferências são salvas localmente.
            </p>
          </div>
        </div>
        <Separator />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Tema</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Modo atual: {mode === "light" ? "Claro" : mode === "dark" ? "Escuro" : "Sistema"}
              </p>
            </div>
            <Select
              value={mode}
              onValueChange={(v) => {
                setMode(v as ThemeMode);
                toast.success("Tema atualizado.");
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Idioma</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Estrutura preparada para múltiplos idiomas.</p>
            </div>
            <Select
              value={language}
              onValueChange={(v) => {
                setLanguage(v);
                handleSave("language", v);
                toast.success("Idioma salvo.");
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Moeda</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Moeda para exibição de valores.</p>
            </div>
            <Select
              value={currency}
              onValueChange={(v) => {
                setCurrency(v);
                handleSave("currency", v);
                toast.success("Moeda salva.");
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Fuso horário</Label>
              <p className="mt-0.5 text-xs text-muted-foreground">Fuso para datas e horários.</p>
            </div>
            <Select
              value={timezone}
              onValueChange={(v) => {
                setTimezone(v);
                handleSave("timezone", v);
                toast.success("Fuso horário salvo.");
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// DATA SECTION
// ============================================================

function DataSection() {
  const { user, profile } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR")
    : "—";
  const lastLogin = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString("pt-BR")
    : "—";
  const emailConfirmed = user?.email_confirmed_at != null;

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadUserData();
      toast.success("Dados exportados com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao exportar dados.");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    setDeleteOpen(false);
    setDeleteConfirm("");
    toast.info("A exclusão de conta será disponibilizada em breve. Nenhum dado foi removido.");
  };

  return (
    <div className="space-y-4">
      {/* Account info */}
      <Card className="border-border/40 bg-card/40">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">Informações da conta</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Dados carregados automaticamente do Supabase.
              </p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Nome</p>
              <p className="mt-1 text-sm font-medium">{profile?.name || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">E-mail</p>
              <p className="mt-1 text-sm font-medium">{user?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Data de criação</p>
              <p className="mt-1 text-sm font-medium">{createdAt}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Último login</p>
              <p className="mt-1 text-sm font-medium">{lastLogin}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Status do e-mail</p>
              <Badge variant={emailConfirmed ? "default" : "secondary"} className="mt-1">
                {emailConfirmed ? "Verificado" : "Pendente"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data export */}
      <Card className="border-border/40 bg-card/40">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">Meus dados</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Exporte todos os seus dados (perfil, contas, categorias, transações, objetivos, projetos, tarefas e tags) em um arquivo JSON.
              </p>
            </div>
          </div>
          <Separator />
          <Button onClick={handleExport} disabled={exporting} className="gap-2">
            <Download className="h-4 w-4" />
            {exporting ? "Exportando..." : "Exportar meus dados"}
          </Button>
        </CardContent>
      </Card>

      {/* Account deletion */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <div>
              <h3 className="text-sm font-semibold text-destructive">Excluir conta</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
              </p>
            </div>
          </div>
          <Separator />
          <Button variant="destructive" className="gap-2" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Excluir conta
          </Button>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setDeleteConfirm(""); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Excluir conta</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Para confirmar, digite exatamente: <strong>EXCLUIR</strong>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Digite EXCLUIR"
            className="mt-2"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDeleteOpen(false); setDeleteConfirm(""); }}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== "EXCLUIR"}
              onClick={handleDelete}
            >
              Excluir definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

const PREFS_KEY = "atlas-account-prefs-v1";

interface AccountPrefs {
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  language?: string;
  currency?: string;
  timezone?: string;
}

function loadPrefs(): AccountPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? (JSON.parse(raw) as AccountPrefs) : {};
  } catch {
    return {};
  }
}

function savePrefs(prefs: AccountPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Navegador";
}
