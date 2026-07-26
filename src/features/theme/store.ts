import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useActivity } from "@/features/activity/store";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeState {
  mode: ThemeMode;
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
  apply: () => void;
  init: () => void;
}

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") return systemPrefersDark() ? "dark" : "light";
  return mode;
}

function applyTheme(resolved: "light" | "dark") {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
  root.style.colorScheme = resolved;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "dark",
      resolved: "dark",

      setMode: (mode) => {
        const resolved = resolveTheme(mode);
        applyTheme(resolved);
        set({ mode, resolved });
        useActivity.getState().log({
          type: "theme",
          action: "Tema alterado",
          description: mode === "light" ? "Claro" : mode === "dark" ? "Escuro" : "Sistema",
          source: "theme-store",
        });
      },

      apply: () => {
        const { mode } = get();
        const resolved = resolveTheme(mode);
        applyTheme(resolved);
        set({ resolved });
      },

      init: () => {
        const { mode } = get();
        const resolved = resolveTheme(mode);
        applyTheme(resolved);
        set({ resolved });

        if (typeof window !== "undefined") {
          window
            .matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", () => {
              if (get().mode === "system") get().apply();
            });
        }
      },
    }),
    {
      name: "atlas-theme-v1",
    },
  ),
);
