import { defineConfig } from "vite";

export default defineConfig({
 base: "/you-are-not-alone/",
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
});
