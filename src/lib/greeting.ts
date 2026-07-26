import { firstName } from "@/features/user/store";

export interface Greeting {
  title: string;
  subtitle: string;
}

export function getGreeting(name: string | null | undefined, now: Date = new Date()): Greeting {
  const hour = now.getHours();
  let label: string;
  let subtitle: string;

  if (hour >= 5 && hour < 12) {
    label = "Bom dia";
    subtitle = "Vamos começar o dia?";
  } else if (hour >= 12 && hour < 18) {
    label = "Boa tarde";
    subtitle = "Veja como está seu progresso hoje.";
  } else {
    label = "Boa noite";
    subtitle = "Confira como foi o seu dia.";
  }

  const first = firstName(name);
  const title = first ? `${label}, ${first}!` : `${label}!`;

  return { title, subtitle };
}
