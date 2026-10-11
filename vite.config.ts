import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import playgamaBridge from "@playgama/bridge/vite";

export default defineConfig(({ command, mode }) => ({
  base: process.env.VITE_BASE_PATH || (command === "build" ? "/You-Are-Not-Alone/" : "/"),
  publicDir: mode === "playgama" ? false : "public",
  plugins: [
    playgamaBridge({ mode: "local" }),
    ...(mode === "playgama"
      ? [{
          name: "remove-site-information-from-playgama-build",
          transformIndexHtml(html: string) {
            return html
              .replace(/\s*<a href="#game-details">GAME INFO<\/a>/, "")
              .replace(
                /\s*<!-- PLAYGAMA_HIDE_SITE_INFO_START -->[\s\S]*?<!-- PLAYGAMA_HIDE_SITE_INFO_END -->\s*/,
                "\n",
              );
          },
          generateBundle(this: import("rollup").PluginContext) {
            for (const fileName of [
              "playgama-bridge-config.json",
              "PLAYGAMA-BRIDGE-LICENSE.txt",
              "THIRD-PARTY-NOTICES.txt",
            ]) {
              this.emitFile({
                type: "asset",
                fileName,
                source: readFileSync(new URL(`./public/${fileName}`, import.meta.url)),
              });
            }
          },
        }]
      : []),
  ],
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
