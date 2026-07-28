import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error("Supabase env vars missing");
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: "atlas-auth",
  },
});

export type Profile = {
  id: string;
  name: string;
  height: number | null;
  target_weight: number | null;
  avatar_url: string | null;
};
