import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    drop: ["console"],
  },
  build: {
    outDir: "../wp-plugin/trail-trivia/assets/player",
    emptyOutDir: true,
    copyPublicDir: false,  // ponytail: public dir assets are not part of the WP plugin bundle
    rollupOptions: {
      output: {
        format: "iife",
        name: "TrailTrivia",
        entryFileNames: "index.js",
        assetFileNames: "index[extname]",
      },
    },
  },
});
