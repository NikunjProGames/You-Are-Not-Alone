import { defineConfig } from "vite";
import playgamaBridge from "@playgama/bridge/vite";

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE_PATH || (command === "build" ? "/You-Are-Not-Alone/" : "/"),
  plugins: [playgamaBridge({ mode: "local" })],
  build: {
    target: "es2022",
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
}));
