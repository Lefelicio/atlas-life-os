import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsConfigPaths()],
  base: "./",
  server: {
    host: true,
    port: 5173,
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          "router-vendor": ["@tanstack/react-router", "@tanstack/react-query"],
          "supabase-vendor": ["@supabase/supabase-js"],
          "ui-vendor": ["lucide-react", "cmdk", "vaul", "sonner"],
          "chart-vendor": ["recharts"],
          "form-vendor": ["react-hook-form", "zod", "@hookform/resolvers"],
          "date-vendor": ["date-fns"],
        },
      },
    },
  },
});
