import { create } from "zustand";

interface UserState {
  name: string | null;
  setName: (name: string | null) => void;
}

export const useUser = create<UserState>()((set) => ({
  name: null,
  setName: (name) => set({ name }),
}));

export function firstName(full: string | null | undefined): string | null {
  if (!full) return null;
  const t = full.trim();
  if (!t) return null;
  return t.split(/\s+/)[0];
}
