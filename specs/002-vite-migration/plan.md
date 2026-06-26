# Implementation Plan: Vite Migration & Dependency Upgrade

**Branch**: `002-vite-migration` | **Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-vite-migration/spec.md`

## Summary

Replace CRA (`react-scripts 5.0.1`) with Vite 5, upgrade all dependencies to target versions (Section 2.2 of MIGRATION_PLAN.md), configure Vitest to cover all test files with jsdom + globals, migrate ESLint off CRA presets, and rename `REACT_APP_*` env vars to `VITE_*`. The existing game must play without regression after a clean `npm run build`.

TDD approach: establish the red baseline (current `vitest run src/` fails), then fix config artifacts and source files iteratively until `npm run test -- --run` exits 0, before switching `package.json` scripts.

## Technical Context

**Language/Version**: TypeScript 5.5.x (React app only — no PHP changes in this phase)

**Primary Dependencies**:
- Vite 5.x (replaces react-scripts)
- @vitejs/plugin-react (JSX + Fast Refresh)
- React 18.3.x · Redux Toolkit 2.x · react-redux 9.x · React Router 6.x latest
- Ramda 0.30.x · framer-motion 11.x
- Vitest 1.x · @vitest/coverage-v8 (already installed)
- @testing-library/react 14.x · @testing-library/jest-dom (already installed)
- ESLint plugins: @typescript-eslint/parser, @typescript-eslint/eslint-plugin, eslint-plugin-react, eslint-plugin-react-hooks

**Storage**: N/A — no data storage changes

**Testing**: Vitest + jsdom + @vitest/coverage-v8 · `globals: true` · setupFiles via `src/setupTests.ts`

**Target Platform**: Modern browsers (ES2020+) · Node.js 18+ (build-time only)

**Project Type**: React SPA — build tooling only; no WordPress plugin changes

**Performance Goals**: Player JS bundle ≤ 512 KB gzipped (SC-004) · Dev server cold start ≤ 5 s (SC-006)

**Constraints**: Zero test file import changes (globals mode) · No path aliases (YAGNI — none exist) · All 8 existing tests must pass unchanged

**Architecture layer for this feature**: `react-app/` build config + devDeps only — no changes to `src/data/`, `src/domain/`, `src/store/`, `src/components/`, `src/features/`, or `wp-plugin/`

## Constitution Check

*GATE: Must pass before opening implementation PR.*

- [x] **I. Functional Programming** — No new TypeScript production code written; config files (`.ts`) use no `let`/`var`/classes.
- [x] **II. Layered Architecture** — No layer boundaries changed; only build/test configuration and two env-var string replacements.
- [ ] **III. Test Coverage** — `npm run test -- --run --coverage` exits 0; lines ≥ 90%, branches ≥ 90%. *Gate: verify post-implementation.*
- [x] **IV. Accessibility & Errors** — No UI changes; existing axe-core baseline unchanged.
- [x] **V. YAGNI** — No new abstractions; no path aliases added; no scaffolding for future phases.
- [x] **VI. Separation of Concerns** — Config files only; no cross-layer imports introduced.
- [x] **VII. Smart/Dumb** — No component changes.
- [x] **VIII. One Component Per File** — No component changes.
- [x] **IX. Naming** — `vite.config.ts`, `.eslintrc.cjs`, `index.html` follow project conventions.
- [ ] **X. TDD** — PR description must confirm `vitest run src/` was observed failing (red) before vitest.config.ts was updated. *Gate: document in PR.*
- [ ] **Phase shell tests** — All Phase 1 deterministic tests in `MIGRATION_PLAN.md` exit 0. *Gate: run quickstart.md validation script.*

## Project Structure

### Documentation (this feature)

```text
specs/002-vite-migration/
├── plan.md              # This file
├── research.md          # Dependency audit + decisions
├── data-model.md        # Config artifact definitions
├── quickstart.md        # Validation script + manual smoke test
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit-tasks — not yet created)
```

### Source Code (react-app/)

Files **created**:
```text
react-app/
├── index.html                            ← moved from public/index.html + Vite edits
├── vite.config.ts                        ← new; replaces CRA webpack config
└── .eslintrc.cjs                         ← new; replaces inline eslintConfig in package.json
```

Files **modified**:
```text
react-app/
├── vitest.config.ts                      ← expand include glob + jsdom + globals + setupFiles
├── tsconfig.json                         ← target ES2020, moduleResolution bundler
├── package.json                          ← deps/devDeps + scripts (start→vite, build→vite build, test→vitest) + remove eslintConfig
├── src/
│   ├── react-app-env.d.ts                ← reference types: react-scripts → vite/client
│   ├── index.tsx                         ← remove reportWebVitals import + call
│   ├── features/loader/loader-api.ts     ← REACT_APP_API_URL → VITE_API_URL
│   └── components/social-buttons/
│       └── social-buttons.tsx            ← REACT_APP_URL → VITE_URL
```

Files **deleted**:
```text
react-app/
├── src/reportWebVitals.ts                ← dead code
└── public/index.html                     ← content moved to root index.html
```

**Structure Decision**: Single `react-app/` project; no new directories. All changes are configuration files and two one-line source edits. The WordPress plugin (`wp-plugin/`) is untouched.

## Implementation Order (TDD sequence)

The order matters. Switching scripts too early breaks the TDD red baseline.

1. **Confirm red baseline** — run `npx vitest run src/` and verify it fails
2. **Update `vitest.config.ts`** — jsdom + globals + setupFiles + expanded include
3. **Run vitest** — confirm App.test.tsx now found; may still fail on imports/TS
4. **Upgrade deps** (`npm install --legacy-peer-deps` or direct version pins)
5. **Update `tsconfig.json`** — ES2020 + bundler moduleResolution
6. **Create `vite.config.ts`**
7. **Migrate `index.html`** — move from public/, strip %PUBLIC_URL%, add script tag
8. **Update `src/react-app-env.d.ts`**
9. **Delete `src/reportWebVitals.ts`** + update `src/index.tsx`
10. **Migrate env vars** in loader-api.ts + social-buttons.tsx
11. **Update `package.json` scripts** — swap react-scripts → vite/vitest
12. **Create `.eslintrc.cjs`** + remove `eslintConfig` from package.json
13. **Run `npm run test -- --run`** — confirm GREEN
14. **Run `npm run build`** — confirm exit 0 + dist/ output
15. **Run full quickstart.md validation script** — all checks pass

## Complexity Tracking

> No Constitution Check violations. No complexity to justify.
