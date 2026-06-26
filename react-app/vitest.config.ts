import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/domain/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**/*.ts'],
      exclude: ['src/domain/**/*.test.ts', 'src/domain/**/index.ts'],
      thresholds: { lines: 90, branches: 90 },
    },
  },
});
