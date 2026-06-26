# Data Model: Vite Migration & Dependency Upgrade

**Feature**: 002-vite-migration  
**Date**: 2026-06-26

This feature has no new domain entities. It is a build-tool and dependency migration.
The data model documents the configuration artifacts that replace CRA's implicit configuration.

## Configuration Artifacts

### `vite.config.ts` (new, project root of `react-app/`)

```
Fields:
  plugins: [@vitejs/plugin-react()]          — JSX transform, Fast Refresh
  build.outDir: 'dist'                        — explicit (default); matches FR-007
  build.target: 'es2020'                      — modern browser baseline

Relationships:
  → index.html (root)                         — Vite discovers entry point via root index.html
  → src/index.tsx                             — referenced in index.html <script type="module">
  → tsconfig.json                             — TS compilation settings respected by Vite
```

### `vitest.config.ts` (updated, project root of `react-app/`)

```
Fields:
  plugins: [@vitejs/plugin-react()]          — required for TSX test files
  test.globals: true                          — injects describe/it/expect/vi without imports
  test.environment: 'jsdom'                   — DOM APIs available in all tests
  test.setupFiles: ['src/setupTests.ts']      — loads @testing-library/jest-dom matchers
  test.include: ['src/**/*.{test,spec}.{ts,tsx}']  — all 8 test files
  test.coverage.provider: 'v8'
  test.coverage.include: ['src/**/*.{ts,tsx}']
  test.coverage.exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/index.ts',
                           'src/setupTests.ts', 'src/react-app-env.d.ts',
                           'src/index.tsx', 'src/reportWebVitals.ts']
  test.coverage.thresholds.lines: 90
  test.coverage.thresholds.branches: 90

Relationships:
  → src/setupTests.ts                         — loaded before each test suite
  → @vitest/coverage-v8 (devDep)              — already installed
```

### `tsconfig.json` (updated)

```
Changed fields (delta from current):
  target:           "es5"        → "ES2020"
  moduleResolution: "node"       → "bundler"
  useDefineForClassFields: (absent) → true    — Vite requirement for class field semantics

Removed fields:
  isolatedModules: true          — redundant; Vite already isolates

Unchanged fields:
  strict: true
  jsx: "react-jsx"
  noEmit: true
  (all other fields preserved)

Relationships:
  → vite.config.ts               — Vite reads tsconfig for TS settings
  → vitest.config.ts             — Vitest inherits same TS settings
```

### `index.html` (new, project root of `react-app/`)

```
Source: public/index.html (moved + modified)

Changes:
  %PUBLIC_URL%/favicon.ico   → /favicon.ico
  %PUBLIC_URL%/logo192.png   → /logo192.png
  %PUBLIC_URL%/manifest.json → /manifest.json
  (added) <script type="module" src="/src/index.tsx"></script>

Relationships:
  → src/index.tsx              — module entry point
  → public/ directory          — Vite serves public/ contents at / automatically
```

### `.eslintrc.cjs` (new, project root of `react-app/`)

```
Replaces: inline eslintConfig in package.json

Fields:
  parser: '@typescript-eslint/parser'
  plugins: ['@typescript-eslint', 'react', 'react-hooks']
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ]
  settings.react.version: 'detect'
  rules:
    semi: [2, "always"]              — preserved from CRA config
    quotes: [2, "double", {avoidEscape: true}]  — preserved
    object-curly-spacing: ["error", "always"]   — preserved
    react/react-in-jsx-scope: "off"  — not needed with react-jsx transform

Relationships:
  → package.json (scripts.lint)  — invoked as "eslint src/"
```

## Packages Removed

| Package | Reason |
|---------|--------|
| `react-scripts` | Replaced by Vite + Vitest |
| `web-vitals` | Dead code after removing CRA's reportWebVitals wiring |
| `@types/jest` | Conflicts with Vitest globals type declarations |
| `@types/react-router-dom` | react-router-dom 6.x ships its own types |

## Packages Added

| Package | Location | Version |
|---------|----------|---------|
| `vite` | devDependencies | 5.x |
| `@vitejs/plugin-react` | devDependencies | latest |
| `@typescript-eslint/parser` | devDependencies | latest |
| `@typescript-eslint/eslint-plugin` | devDependencies | latest |
| `eslint-plugin-react` | devDependencies | latest |
| `eslint-plugin-react-hooks` | devDependencies | latest |

## Source Files Modified

| File | Change |
|------|--------|
| `src/react-app-env.d.ts` | `/// <reference types="react-scripts" />` → `/// <reference types="vite/client" />` |
| `src/index.tsx` | Remove `reportWebVitals` import and call |
| `src/features/loader/loader-api.ts` | `process.env.REACT_APP_API_URL` → `import.meta.env.VITE_API_URL` |
| `src/components/social-buttons/social-buttons.tsx` | `process.env.REACT_APP_URL` → `import.meta.env.VITE_URL` |

## Source Files Deleted

| File | Reason |
|------|--------|
| `src/reportWebVitals.ts` | Dead code; no replacement needed |
| `public/index.html` | Content moved to root `index.html` |
