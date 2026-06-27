import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    drop: ["console"],
  },
  build: {
    outDir: "../wp-plugin/trail-trivia/assets/admin",
    emptyOutDir: true,
    copyPublicDir: false,
    rollupOptions: {
      input: "src/admin/index.tsx",
      output: {
        entryFileNames: "index.js",
        assetFileNames: "index[extname]",
      },
    },
  },
});
