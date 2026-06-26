# Research: Vite Migration & Dependency Upgrade

**Feature**: 002-vite-migration  
**Date**: 2026-06-26

## Decision Log

### 1. Vite Configuration Strategy

**Decision**: Use `@vitejs/plugin-react` (Babel transform), not `@vitejs/plugin-react-swc`.  
**Rationale**: Babel is the stable default; SWC is faster but has occasional edge cases with decorators and some emotion/styled-components patterns. This app uses plain CSS modules — no reason to take on SWC risk.  
**Alternatives considered**: `@vitejs/plugin-react-swc` — rejected; speed gain irrelevant at this codebase size.

**Decision**: No `resolve.alias` path aliases in `vite.config.ts`.  
**Rationale**: Current `tsconfig.json` has no `paths` defined; source files use relative imports. YAGNI — adding aliases now would require updating every import and adds no Phase 1 value.  
**Alternatives considered**: `@/` alias for `src/` — deferred to Phase 2 if desired.

### 2. TypeScript 5.5.x Configuration

**Decision**: Update `tsconfig.json` with `"target": "ES2020"`, `"moduleResolution": "bundler"`.  
**Rationale**: CRA compiled to ES5 (webpack handled transpilation). Vite targets modern browsers natively; ES2020 is the baseline Vite target. `"bundler"` is the correct `moduleResolution` for Vite/ESM-first projects in TypeScript 5.x and properly handles `"exports"` fields in package.json.  
**Alternatives considered**: Keep `"node"` — produces wrong module resolution warnings with TypeScript 5.x; `"node16"`/`"nodenext"` — require explicit `.js` extensions; wrong for browser code.

**Decision**: Remove `"isolatedModules": true` from tsconfig.  
**Rationale**: Vite already processes each file in isolation (same guarantee). Keeping it is redundant and can cause false errors with `declare const` patterns.

### 3. Vitest Configuration

**Decision**: `globals: true` + `environment: 'jsdom'` + `setupFiles: ['src/setupTests.ts']`.  
**Rationale**: All 8 existing test files use Jest globals (`test`, `describe`, `it`, `expect`, `beforeEach`) without imports. Changing them all to explicit imports is Phase 2 work (when TDD-first new tests are written). `globals: true` makes the migration zero-test-file-churn.

`src/setupTests.ts` already contains `import "@testing-library/jest-dom"` — wiring it via `setupFiles` is the minimum change to make `toBeInTheDocument()` available (used in `App.test.tsx`).

**Decision**: Expand `vitest.config.ts` to include `'src/**/*.{test,spec}.{ts,tsx}'`.  
**Rationale**: Current config only covers `src/domain/**/*.test.ts`. The app has 4 test files outside domain (`App.test.tsx`, `libs/date-helpers.test.ts`, `features/score/score-slice.spec.ts`, `features/loader/loader-slice.spec.ts`) that must pass under Vitest to satisfy SC-002.

**Decision**: Keep Vitest at 1.x (currently `^1.6.0`), do not upgrade to 2.x in Phase 1.  
**Rationale**: Phase 1 goal is zero regressions. Vitest 2.x has breaking changes to snapshot serialization and `expect.extend`. Upgrade is deferred to Phase 2 or a dedicated maintenance task.

### 4. Dependency Compatibility Audit

| Package | Current | Target | Breaking changes for this app |
|---------|---------|--------|-------------------------------|
| react / react-dom | 18.2.0 | 18.3.x | None — minor version |
| @reduxjs/toolkit | 1.9.6 | 2.x | None — `configureStore` already used; no `getDefaultMiddleware` |
| react-redux | 8.1.2 | 9.x | None — hooks API unchanged |
| react-router-dom | 6.16.0 | 6.x latest | None — `Routes`, `Route`, `Navigate`, `useLocation` all stable |
| ramda + @types/ramda | 0.29.0 | 0.30.x | None — pure FP API stable |
| typescript | 4.9.5 | 5.5.x | `moduleResolution` must change (see §2); strict inferred predicates may surface new TS errors — run `tsc --noEmit` and fix |
| framer-motion | 10.16.16 | 11.x | `exitBeforeEnter` removed from `AnimatePresence` — **not used in codebase**; `motion` and `AnimatePresence` still exported from `'framer-motion'` unchanged |
| @testing-library/react | 13.4.0 | 14.x | `render` API unchanged; `act` wrapper more strict — tests may need `await` on user events |
| @vitejs/plugin-react | — (new) | latest | N/A |

### 5. ESLint Migration

**Decision**: Replace inline `eslintConfig` in `package.json` (extending `react-app`, `react-app/jest`) with a standalone `.eslintrc.cjs` using direct plugins.

Packages needed:
- `@typescript-eslint/parser` — TypeScript AST parser
- `@typescript-eslint/eslint-plugin` — TS-aware lint rules
- `eslint-plugin-react` — React-specific rules
- `eslint-plugin-react-hooks` — hooks rules-of-hooks enforcement

**Rationale**: `react-app` and `react-app/jest` presets ship inside `react-scripts`. Removing `react-scripts` removes these presets; ESLint fails to start. Must replace before removing `react-scripts`.

**Decision**: Keep the 3 existing style rules (`semi`, `quotes`, `object-curly-spacing`) verbatim in the new config.  
**Rationale**: No reason to change code style during a build-tool migration.

### 6. CRA Artifacts to Remove or Replace

| File | Action | Reason |
|------|--------|--------|
| `src/react-app-env.d.ts` | Replace content with `/// <reference types="vite/client" />` | `react-scripts` type reference no longer valid; Vite client types provide `import.meta.env` typings |
| `src/reportWebVitals.ts` | Delete | CRA-specific performance reporting; `index.tsx` import removed simultaneously |
| `public/index.html` | Move to repo root as `index.html`; strip `%PUBLIC_URL%`; add module script entry | Vite expects `index.html` at project root; serves `public/` contents at `/` automatically |
| `src/setupTests.ts` | Keep as-is | Already correct; just needs wiring via `vitest.config.ts` `setupFiles` |

### 7. Env Var Migration

Two source files and three `.env` files reference `REACT_APP_*`:

**Source files** (`process.env.*` → `import.meta.env.*`):

| File | Old | New |
|------|-----|-----|
| `src/features/loader/loader-api.ts` | `process.env.REACT_APP_API_URL` | `import.meta.env.VITE_API_URL` |
| `src/components/social-buttons/social-buttons.tsx` | `process.env.REACT_APP_URL` | `import.meta.env.VITE_URL` |

**Env files** (key rename, value unchanged):

| File | Old key | New key |
|------|---------|---------|
| `.env` | `REACT_APP_API_URL` | `VITE_API_URL` |
| `.env.production.bak` | `REACT_APP_API_URL` | `VITE_API_URL` |
| `.env.production.bak` | `REACT_APP_URL` | `VITE_URL` |
| `.env.production.local` | `REACT_APP_API_URL` | `VITE_API_URL` |

Three `.env` files exist in `react-app/`: `.env` (dev, contains `REACT_APP_API_URL`), `.env.production.bak` (prod backup, contains `REACT_APP_API_URL` + `REACT_APP_URL`), `.env.production.local` (prod active, contains `REACT_APP_API_URL`). All three must be updated as part of the env-var migration (T020b).

### 8. TDD Application to Build Migration

The "red" state for this migration is: running `npx vitest run src/` with the current `vitest.config.ts` — it fails because:
- Only `src/domain/**/*.test.ts` is included (4 domain tests run, 4 others are invisible)
- No jsdom environment (component tests fail with "document is not defined")
- No setupFiles (toBeInTheDocument is undefined)
- App.test.tsx is outside the include glob

Red→Green sequence:
1. Run `npx vitest run src/` — confirm RED (missing tests, env errors)
2. Update `vitest.config.ts` with jsdom + globals + setupFiles + expanded include
3. Run again — confirm GREEN on config, may still have TS/import errors
4. Fix remaining errors (env vars, CRA artifacts, dep upgrades)
5. Run `npm run build` — GREEN on Vite build
6. Swap `package.json` scripts last (so `npm run test` always reflects the authoritative runner)
