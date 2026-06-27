/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  esbuild: {
    // ponytail: drop removes our console.* calls; dependency console.log refs are pre-compiled
    drop: ["console"],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/setupTests.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.{test,spec}.{ts,tsx}",
        "src/**/index.ts",
        "src/**/index.tsx",   // barrel re-exports; not independently testable
        "src/setupTests.ts",
        "src/vite-env.d.ts",
        "src/index.tsx",
        // src/app/ excluded from 90% gate per spec clarification Q2 — root wiring tested by E2E
        "src/app/**",
        "src/assets/**",      // SVG/icon components; no logic to test
      ],
      thresholds: {
        "src/domain/**": { lines: 90, branches: 90 },
        "src/store/**": { lines: 90, branches: 90 },
        "src/components/**": { lines: 90, branches: 90 },
        "src/features/**": { lines: 90, branches: 90 },
      },
    },
  },
});
