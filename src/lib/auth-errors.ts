const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Você precisa confirmar seu e-mail antes de entrar.",
  "User already registered": "Este e-mail já está cadastrado.",
  "Password should be at least 6 characters.":
    "A senha deve ter pelo menos 6 caracteres.",
  "Unable to send password reset email": "Não foi possível enviar o e-mail de recuperação. Verifique o endereço informado.",
  "Email rate limit exceeded": "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.",
  "For security purposes, you can only request this after 60 seconds.":
    "Aguarde 60 segundos antes de solicitar novamente.",
  "New password should be different from the old password.":
    "A nova senha deve ser diferente da senha atual.",
  "Token has expired or is invalid": "O link de recuperação expirou. Solicite um novo.",
  "session_not_found": "Sua sessão expirou. Faça login novamente.",
  "session_missing": "Sua sessão expirou. Faça login novamente.",
  "Auth session missing!": "Sua sessão expirou. Faça login novamente.",
  "User not found": "Usuário não encontrado. Verifique o e-mail informado.",
  "Signups not allowed for this instance": "O cadastro não está disponível no momento.",
  "Password is too weak": "Senha muito fraca. Use pelo menos 6 caracteres com letras e números.",
};

const NETWORK_ERRORS = new Set([
  "Failed to fetch",
  "NetworkError when attempting to fetch resource.",
  "Network request failed",
  "fetch failed",
]);

export function translateAuthError(message: string): string {
  if (!message) return "Ocorreu um erro inesperado. Tente novamente.";

  for (const [key, val] of Object.entries(ERROR_MAP)) {
    if (message.includes(key)) return val;
  }

  if (NETWORK_ERRORS.has(message)) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }

  if (message.toLowerCase().includes("rate limit")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns minutos.";
  }

  return "Ocorreu um erro inesperado. Tente novamente.";
}
