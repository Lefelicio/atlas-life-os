import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  name: string | null;
  setName: (name: string | null) => void;
}

/**
 * Simple user store — placeholder for future auth integration.
 * When Lovable Cloud auth is wired up, replace this with a hook that
 * reads from the session (e.g. `useAuth().user?.user_metadata?.full_name`).
 */
export const useUser = create<UserState>()(
  persist(
    (set) => ({
      name: "Felício",
      setName: (name) => set({ name }),
    }),
    { name: "atlas-user-v1" },
  ),
);

export function firstName(full: string | null | undefined): string | null {
  if (!full) return null;
  const t = full.trim();
  if (!t) return null;
  return t.split(/\s+/)[0];
}
