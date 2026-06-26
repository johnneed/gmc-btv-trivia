/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
        "src/setupTests.ts",
        "src/react-app-env.d.ts",
        "src/index.tsx",
      ],
      // ponytail: thresholds deferred to Phase 2 when feature/component tests are added
    },
  },
});
