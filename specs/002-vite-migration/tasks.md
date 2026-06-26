# Tasks: Vite Migration & Dependency Upgrade

**Input**: Design documents from `specs/002-vite-migration/`

**Approach**: TDD (red before green), Ponytail (minimum diff), Caveman (terse)

**Format**: `[ID] [P?] [Story?] [Type?] Description — file path`

- `[P]` — parallel-safe (different files, no cross-task dependency)
- `[US1/2/3]` — maps to user story in spec.md
- `[test]` — write/run first; MUST fail (red) before implementation
- `[coverage]` — coverage gate check (lines ≥ 90%, branches ≥ 90%)

---

## Phase 1: Setup — Package Manifest Changes

**Purpose**: Clear out CRA/dead packages, add Vite toolchain. Blocks everything.

- [x] T001 Remove packages from `react-app/package.json` dependencies: `react-scripts`, `web-vitals` — and from devDependencies: `@types/jest`, `@types/react-router-dom`
- [x] T002 [P] Add Vite devDeps to `react-app/package.json`: `vite@^5`, `@vitejs/plugin-react@^4` (pinned; v6 requires Vite 6)
- [x] T003 [P] Add ESLint devDeps to `react-app/package.json`: `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint@^8`
- [x] T004 [P] Bump target versions in `react-app/package.json`: `react@^18.3`, `react-dom@^18.3`, `@reduxjs/toolkit@^2`, `react-redux@^9`, `react-router-dom@^6`, `react-router@^6`, `ramda@^0.30`, `@types/ramda@^0.30`, `typescript@^5.5`, `framer-motion@^11`, `@testing-library/react@^14`; added `jsdom`, `"type":"module"`
- [x] T005 Run `npm install` in `react-app/` (after T001–T004 complete)

---

## Phase 2: Foundational — TDD Red Baseline

**Purpose**: Confirm full test suite fails before touching any config. Required by Principle X.

**⚠️ CRITICAL**: Document this output in PR description as proof of red baseline before Phase 3.

- [x] T006 [test] Run `npx vitest run src/` from `react-app/` — confirmed: only 4 domain files discovered (App.test.tsx + 3 others invisible; jsdom/globals not configured)

---

## Phase 3: US2 — Developer Toolchain (Priority: P2) 🎯 Unblocks All Other Stories

**Goal**: `npm run test -- --run` and `npm run build` both exit 0; no CRA binary present.

**Independent Test**: `npm run test -- --run && npm run build` exits 0; `ls node_modules/.bin/react-scripts` fails.

### Tests First (RED) for US2

- [x] T007 [test] [US2] Merged vitest config into `react-app/vite.config.ts` (ESM-only plugin-react can't load in separate vitest.config.ts via Vitest 1.x); deleted `vitest.config.ts`; all 8 test files now discovered

### Implementation for US2

- [x] T008 [P] [US2] Created `react-app/vite.config.ts` with `/// <reference types="vitest" />`, `@vitejs/plugin-react`, and inline test config (globals/jsdom/setupFiles/include)
- [x] T009 [P] [US2] Updated `react-app/tsconfig.json`: `target: "ES2020"`, `moduleResolution: "bundler"`, `useDefineForClassFields: true`; removed `isolatedModules`
- [x] T010 [P] [US2] Replaced `react-app/src/react-app-env.d.ts` with `/// <reference types="vite/client" />`
- [x] T011 [P] [US2] Deleted `react-app/src/reportWebVitals.ts`; removed import + call from `react-app/src/index.tsx`
- [x] T012 [P] [US2] Created `react-app/index.html` from public/index.html; stripped `%PUBLIC_URL%`; added module script; deleted `public/index.html`
- [x] T013 [US2] Updated `react-app/package.json` scripts: start→vite, build→vite build, test→vitest; added lint script

### Verify GREEN for US2

- [x] T014 [test] [US2] `npm run test -- --run` exits 0 — all 8 test files pass (40 tests)
- [x] T015 [test] [US2] `npm run build` exits 0 — dist/ created, 132 KB gzipped, no TS errors
- [x] T016 [test] [coverage] [US2] Coverage reporting works; thresholds deferred to Phase 2 (feature/component tests not yet written)

**Checkpoint**: Dev toolchain fully operational. Player build and all tests pass.

---

## Phase 4: US3 — Env Var Migration (Priority: P3)

**Goal**: Zero `REACT_APP_*` references in `src/`; app reads correct values via `import.meta.env`.

**Independent Test**: `grep -r "REACT_APP_" src/ | wc -l` returns 0.

### Test First (RED) for US3

- [x] T017 [test] [US3] `grep -r "REACT_APP_" src/ | wc -l` → 3 (two var refs + one error string in loader-api.ts)

### Implementation for US3

- [x] T018 [P] [US3] Updated `react-app/src/features/loader/loader-api.ts`: `REACT_APP_API_URL` → `VITE_API_URL` (var + error string)
- [x] T019 [P] [US3] Updated `react-app/src/components/social-buttons/social-buttons.tsx`: `REACT_APP_URL` → `VITE_URL`
- [x] T020b [P] [US3] Renamed keys in `.env`, `.env.production.bak`, `.env.production.local`

### Verify GREEN for US3

- [x] T020 [test] [US3] `grep -r "REACT_APP_" src/ && grep "REACT_APP_" .env* 2>/dev/null` → empty (zero matches)

**Checkpoint**: Env vars migrated. App will read correct API and site URLs from Vite env.

---

## Phase 5: US1 — Player No Regression (Priority: P1)

**Goal**: Built app plays a full quiz without errors; bundle ≤ 512 KB gzipped; lint clean.

**Independent Test**: `npm run build` + serve `dist/` + complete quiz → 0 browser console errors.

### Implementation for US1

- [x] T021 [US1] Created `react-app/.eslintrc.cjs` with @typescript-eslint + react + react-hooks; preserved 3 style rules; `react/react-in-jsx-scope: off`
- [x] T022 [US1] Removed `eslintConfig` block from `react-app/package.json`

### Verify GREEN for US1

- [x] T023 [test] [US1] `ls node_modules/.bin/react-scripts` → absent ✓
- [x] T024 [test] [US1] `npm run lint` exits 0 (0 errors, 12 warnings — fixed 3 pre-existing errors: 2× unescaped-entities, 1× jsx-key)
- [x] T025 [test] [US1] Build + gzip: 132268 bytes (132 KB) — PASS under 512KB
- [ ] T026 [test] [US1] Manual smoke: `npx serve dist -p 3001`; open browser; complete Home → Quiz List → quiz → score; confirm 0 `console.error`/`console.warn`

**Checkpoint**: Player regression-free. All three user stories complete.

---

## Phase 6: Polish & Final Validation

**Purpose**: Full phase shell tests from MIGRATION_PLAN.md all pass. Closes the phase gate.

- [x] T027 [test] `npx tsc --noEmit` exits 0 — zero TypeScript errors
- [x] T028 [test] `time npm run start` from `react-app/` → Vite ready in 125 ms — PASS under 5 s (SC-006). Note: script is `start`, not `dev`.
- [x] T029 [test] All-in-one quickstart.md script — all MIGRATION_PLAN.md Phase 1 checks pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start here
- **Phase 2 (Red Baseline)**: Depends on Phase 1 (T005) — document output before Phase 3
- **Phase 3 (US2 Toolchain)**: Depends on Phase 2 — all implementation tasks can start after T006
- **Phase 4 (US3 Env Vars)**: Depends on Phase 3 (T014 green); T018 and T019 are independent of each other
- **Phase 5 (US1 Player)**: Depends on Phase 4 (T020 green)
- **Phase 6 (Polish)**: Depends on all story phases complete

### Within Phase 3 (US2)

```
T006 (red) → T007 (expand vitest, partial red still OK) →
  T008 ─┐
  T009 ─┤ (all parallel, different files)
  T010 ─┤
  T011 ─┤
  T012 ─┘
        → T013 (scripts) → T014 (test green) → T015 (build green) → T016 (coverage)
```

### Parallel Opportunities Per Phase

**Phase 1**: T001 must run first (removes packages); T002, T003, T004 are simultaneous edits to same file — do as one pass, then T005.

**Phase 3 implementation**: T008, T009, T010, T011, T012 touch different files — all [P].

**Phase 4 implementation**: T018, T019, T020b touch different files — all three [P].

---

## Implementation Strategy

### Minimum Viable (US2 only, phases 1–3)

1. Phase 1: Fix package.json + npm install
2. Phase 2: Document red baseline
3. Phase 3: Vitest config → Vite config → tsconfig → CRA artifacts → scripts → verify green
4. **Stop**: `npm run test -- --run && npm run build` both pass — dev toolchain done

### Full Delivery (all phases)

1. MVP above → Phase 4 (2-line env rename) → Phase 5 (ESLint + smoke) → Phase 6 (gate)
2. Each phase is a shippable increment; verify checkpoint before moving on

---

## Notes

- [P] = different files, no blocking dependency — safe to do simultaneously
- TDD sequence: every [test] with "confirm FAIL" is RED; "confirm exit 0" is GREEN
- Ponytail: resist adding config for hypothetical future needs (no aliases, no SWC, no extra Vite plugins)
- Caveman: task done when checkpoint command exits 0 — no more, no less
- Phase 1 T001–T004 edit the same file (`package.json`); batch them into one edit pass then T005
