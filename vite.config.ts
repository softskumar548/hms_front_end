import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxy replaces the same-origin nginx setup locally: the UI calls /api/*
// and Vite forwards to the backend. In staging/prod, nginx serves both on one
// origin (hms.zensynq.com) so no CORS is ever needed.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET || "http://localhost:8000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
});
