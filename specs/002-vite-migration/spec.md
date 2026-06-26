# Feature Specification: Vite Migration & Dependency Upgrade

**Feature Branch**: `002-vite-migration`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "read MIGRATION_PLAN.md We need to complete phase 1."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Player Experiences No Regression (Priority: P1)

A visitor to the GMC Burlington Trail Trivia page plays a trivia game. After the build-tool migration, the game loads, displays all questions, accepts answers, shows results, and completes without any error — identical behavior to before the migration.

**Why this priority**: The player experience is the reason this project exists. If the migration breaks gameplay, it breaks the product. Everything else is internal.

**Independent Test**: Load the built `dist/index.html` in a browser and complete a full quiz end-to-end — game list → select quiz → answer 5 questions → see score screen.

**Acceptance Scenarios**:

1. **Given** a freshly built `dist/` output, **When** a player opens the app and completes a quiz, **Then** all 5 questions display, choices are selectable, results show correctly, and no runtime errors appear in the browser console.
2. **Given** the built app, **When** the player navigates using only a keyboard, **Then** all interactive elements are reachable and operable (no regression from current ARIA state).

---

### User Story 2 - Developer Builds & Tests With New Toolchain (Priority: P2)

A developer running `npm run build` and `npm run test` in `react-app/` uses Vite and Vitest instead of CRA/react-scripts. All existing tests pass. The build completes without TypeScript errors. The dev server starts quickly.

**Why this priority**: The developer workflow is the direct deliverable of this phase. A broken build or failing tests block all subsequent phases.

**Independent Test**: Run `npm run build && npm run test -- --run` from `react-app/`; both commands exit 0 with no CRA tooling present.

**Acceptance Scenarios**:

1. **Given** `react-app/` with Vite configuration, **When** `npm run build` is run, **Then** it exits 0, outputs to `dist/`, and produces zero TypeScript errors.
2. **Given** Vitest configured as the test runner, **When** `npm run test -- --run` is run, **Then** all existing tests pass and no Jest-specific APIs are invoked.
3. **Given** the dev environment, **When** `npm run dev` is run, **Then** the server is ready in under 5 seconds on a cold start.
4. **Given** the upgraded dependency set, **When** `node_modules/.bin/react-scripts` is checked, **Then** it does not exist.

---

### User Story 3 - Env Vars Are Consistent With Vite Convention (Priority: P3)

All environment variables previously named `REACT_APP_*` are renamed to `VITE_*`. No source file references the old prefix. `.env` files and all `src/` references are updated together so the app reads the correct values at build time and runtime.

**Why this priority**: Without this, the Vite build silently drops env values — the API URL and site URL become `undefined`, breaking data loading. Must be done as part of the same migration.

**Independent Test**: `grep -r "REACT_APP_" src/` returns 0 results after migration.

**Acceptance Scenarios**:

1. **Given** env var references migrated to `VITE_*`, **When** the built app tries to fetch game data, **Then** `import.meta.env.VITE_API_URL` resolves to the correct value (not `undefined`).
2. **Given** the src directory, **When** `grep -r "REACT_APP_" src/` is run, **Then** it returns 0 results.

---

### Edge Cases

- What happens if a `REACT_APP_*` var is referenced in a test file that's not yet updated? Test should fail with a clear error, not silently pass with `undefined`.
- How does the system handle the `process.env` → `import.meta.env` API difference during the transition? All references must be updated atomically — no mixed usage.
- What if the gzipped bundle size exceeds 512 KB after upgrading framer-motion 10→11? Build must fail the size check; investigate tree-shaking or lazy loading before proceeding.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The build tool MUST be Vite 5.x; `react-scripts` MUST be removed from dependencies and `node_modules`.
- **FR-002**: The test runner MUST be Vitest (replacing `react-scripts test`); all existing tests MUST pass under Vitest.
- **FR-003**: `vitest.config.ts` MUST configure jsdom as the test environment and MUST enable `globals: true` so existing test files require no import changes.
- **FR-004**: `vite.config.ts` MUST include `@vitejs/plugin-react`. No path aliases are required; none exist in the current tsconfig and none are added (YAGNI).
- **FR-005**: All dependencies MUST be at the target versions specified in MIGRATION_PLAN.md Section 2.2: React 18.3.x, @reduxjs/toolkit 2.x, react-redux 9.x, react-router-dom 6.x latest, ramda 0.30.x, TypeScript 5.5.x, framer-motion 11.x.
- **FR-006**: Every occurrence of `REACT_APP_*` in `src/` and `.env*` files MUST be renamed to `VITE_*`; all `process.env.REACT_APP_*` references MUST be replaced with `import.meta.env.VITE_*`.
- **FR-007**: `npm run build` MUST output to `dist/` and exit 0 with zero TypeScript errors.
- **FR-008**: `npm run test` MUST invoke Vitest (not react-scripts); exit 0 with all tests passing.
- **FR-009**: `npm run dev` MUST start the Vite dev server (not react-scripts start) and be ready in under 5 seconds on a cold start.
- **FR-010**: The gzipped total size of `dist/assets/*.js` MUST be under 512 KB.
- **FR-011**: `npx tsc --noEmit` MUST exit 0 across all of `react-app/src/` after the TypeScript upgrade to 5.5.x.
- **FR-012**: `@types/jest` MUST be removed from `devDependencies`; its type declarations conflict with Vitest globals and cause TypeScript errors under `globals: true`.
- **FR-013**: The ESLint configuration MUST be migrated away from `react-app` and `react-app/jest` CRA presets (which are removed with `react-scripts`) to a standalone config in Phase 1; `npm run lint` (or equivalent) MUST exit 0.
- **FR-014**: `web-vitals` MUST be removed from dependencies; it is CRA-specific dead code with no wiring after `react-scripts` is removed.
- **FR-015**: `@testing-library/react` MUST be upgraded to 14.x.
- **FR-016**: `@testing-library/jest-dom` MUST be registered in `vitest.config.ts` `setupFiles` so its custom matchers (e.g., `toBeInTheDocument`) are available in all test files without explicit imports.

### Key Entities

- **Build Configuration** (`vite.config.ts`): Defines plugins and build output directory. Replaces CRA's internal webpack config. No path aliases.
- **Test Configuration** (`vitest.config.ts`): Defines test environment (jsdom), coverage provider, and test file patterns. Replaces CRA's internal Jest config.
- **Environment Variables** (`.env`, `.env.production.bak`, `.env.production.local`): Three files with `REACT_APP_*` vars that must be renamed to `VITE_*`. Consumed via `import.meta.env` in source.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `npm run build` exits 0 with zero TypeScript errors on the first run after migration.
- **SC-002**: All tests that passed before migration continue to pass under Vitest (`npm run test -- --run` exits 0).
- **SC-003**: No `react-scripts` binary present in `node_modules/.bin/` after migration.
- **SC-004**: Total gzipped JavaScript bundle size is under 512 KB.
- **SC-005**: Zero occurrences of `REACT_APP_` in `src/` and `.env*` files (verified by `grep -r "REACT_APP_" src/ && grep "REACT_APP_" .env* 2>/dev/null`; both return empty output).
- **SC-006**: Dev server ready in under 5 seconds on cold start (verified by timing `npm run dev`).
- **SC-007**: A complete quiz playthrough (list → questions → score) completes without runtime errors after loading `dist/`.

## Clarifications

### Session 2026-06-26

- Q: Should Vitest use `globals: true` or require explicit imports in existing test files? → A: `globals: true` — existing test files need no import changes; explicit imports are for Phase 2 new tests.
- Q: Should `@types/jest` and CRA ESLint presets be removed in Phase 1? → A: Yes — remove `@types/jest` and replace `react-app/*` ESLint presets with a standalone config in Phase 1.
- Q: Should `web-vitals`, `@testing-library/react` upgrade, and `@testing-library/jest-dom` Vitest wiring be handled in Phase 1? → A: Yes — remove `web-vitals`, upgrade `@testing-library/react` to 14.x, and add `@testing-library/jest-dom` to `vitest.config.ts` `setupFiles` in Phase 1.

## Assumptions

- Phase 0 (domain types, factories, plugin scaffold) is complete and its shell tests all exit 0 before this phase begins.
- The existing test suite is small enough that individual test file compatibility with Vitest can be verified without a large test migration effort.
- `vitest.config.ts` already partially exists in `react-app/` (Vitest 1.6 and `@vitest/coverage-v8` are already in `devDependencies`); Phase 1 completes and standardizes this setup for all tests.
- No new React features beyond 18.3.x are required; the upgrade is a minor version bump with backward-compatible API.
- The `react-error-boundary` package (already installed) remains in use; it is compatible with React 18.3.x.
- `@types/react-router-dom` can be removed since react-router-dom 6.x ships its own types.
