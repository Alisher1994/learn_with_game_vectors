import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: path.resolve(import.meta.dirname),
  resolve: {
    alias: {
      "@shared": path.resolve(import.meta.dirname, "../shared"),
    },
  },
  optimizeDeps: {
    include: ["qrcode"],
  },
  server: {
    port: 5173,
    proxy: {
      "/socket.io": { target: "http://127.0.0.1:3001", ws: true },
      "/api": { target: "http://127.0.0.1:3001" },
    },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
});
