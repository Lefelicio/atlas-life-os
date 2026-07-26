import { Component, type ReactNode } from "react";
import { toast } from "sonner";

interface State {
  hasError: boolean;
  message: string;
}

const FRIENDLY_MESSAGES: { match: string; message: string }[] = [
  { match: "Failed to fetch", message: "Sem conexão com a internet. Verifique sua rede e tente novamente." },
  { match: "NetworkError", message: "Sem conexão com a internet. Verifique sua rede e tente novamente." },
  { match: "Network request failed", message: "Sem conexão com a internet. Verifique sua rede e tente novamente." },
  { match: "fetch failed", message: "Sem conexão com a internet. Verifique sua rede e tente novamente." },
  { match: "timeout", message: "A operação demorou demais. Tente novamente em instantes." },
  { match: "session_not_found", message: "Sua sessão expirou. Faça login novamente." },
  { match: "session_missing", message: "Sua sessão expirou. Faça login novamente." },
  { match: "JWT", message: "Sua sessão expirou. Faça login novamente." },
];

function friendlyMessage(error: Error): string {
  const msg = error.message || "";
  for (const { match, message } of FRIENDLY_MESSAGES) {
    if (msg.includes(match)) return message;
  }
  return "Algo deu errado. Tente novamente em instantes.";
}

export class GlobalErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: friendlyMessage(error) };
  }

  componentDidCatch(error: Error) {
    console.error("GlobalErrorBoundary:", error);
    toast.error(friendlyMessage(error));
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Atlas
            </p>
            <h1 className="mt-4 text-xl font-semibold tracking-tight text-foreground">
              {this.state.message}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Se o problema persistir, verifique sua conexão ou recarregue a página.
            </p>
            <button
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
