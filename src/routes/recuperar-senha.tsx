import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AuthLayout, AuthBrand } from "@/features/auth/auth-layout";
import { useAuth } from "@/features/auth/auth-context";
import { PublicRouteGuard } from "@/features/auth/public-route-guard";

export const Route = createFileRoute("/recuperar-senha")({
  component: RecuperarSenhaPage,
  head: () => ({
    meta: [
      { title: "Recuperar senha — Atlas" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function RecuperarSenhaPage() {
  return (
    <PublicRouteGuard>
      <RecuperarSenhaPageInner />
    </PublicRouteGuard>
  );
}

function RecuperarSenhaPageInner() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao enviar e-mail.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout>
        <AuthBrand />
        <div className="text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Verifique seu e-mail
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enviamos um link de recuperação para{" "}
            <span className="font-medium text-foreground">{email}</span>.
            Acesse o link para definir uma nova senha.
          </p>
          <Button className="mt-6 w-full" asChild>
            <Link to="/login" search={{}}>Voltar para o login</Link>
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthBrand />

      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Recuperar senha
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full gap-1.5" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          Enviar link de recuperação
        </Button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            ou
          </span>
          <Separator className="flex-1" />
        </div>

        <Button type="button" variant="outline" className="w-full gap-1.5" asChild>
          <Link to="/login">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
