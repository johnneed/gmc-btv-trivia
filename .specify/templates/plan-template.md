# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!-- Project defaults from constitution Architecture section (v1.2.0). Override per-feature only when this feature deviates from the standard stack. -->

**Language/Version**: TypeScript 5.x (React app) · PHP 8.0+ (plugin)

**Primary Dependencies**: Vite 5 · React 18 · Redux Toolkit 2 · React Router 6 · Ramda 0.30 · framer-motion 11 · WordPress 6.4/6.5

**Storage**: WordPress CPT `trail_trivia_game` + post meta (`_trivia_questions` JSON). No custom tables.

**Testing**: Vitest + @vitest/coverage-v8 (TS) · WP-CLI smoke tests (PHP) · axe-core-cli (a11y)

**Target Platform**: WordPress 6.4–6.5 · PHP 8.0+ · modern browsers (ES2020+)

**Project Type**: WordPress plugin embedding two React SPAs (player + TriviaSmith admin)

**Performance Goals**: Player JS bundle ≤ 500 KB gzipped · REST response ≤ 200 ms p95

**Constraints**: ARIA / WCAG 2.1 AA · No Node.js at runtime · HashRouter (no WP rewrite rules) · WP 6.4 + 6.5 backward compat

**Architecture layer for this feature**: [react-app/src/data | react-app/src/domain | react-app/src/store | react-app/src/components | react-app/src/features | wp-plugin/includes | both]
— see constitution Architecture section for layer import rules and integration boundary.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify every item before opening the implementation PR:

- [ ] **I. Functional Programming** — No `let`/`var` in new TypeScript; no in-place mutation; Ramda for all transforms; no new classes.
- [ ] **II. Layered Architecture** — API calls in `src/data/` only; domain transforms in `src/domain/` pure; Smart in `src/features/`, Dumb in `src/components/`.
- [ ] **III. Test Coverage** — `npm run test -- --run --coverage` exits 0; lines ≥ 90%, branches ≥ 90% in `coverage/coverage-summary.json`.
- [ ] **IV. Accessibility & Errors** — `axe-core-cli` reports 0 violations; no swallowed `catch`; PHP failures return `WP_Error`.
- [ ] **V. YAGNI** — No code without a current requirement; no abstraction with fewer than 3 call-sites.
- [ ] **VI. Separation of Concerns** — No function/class mixes validate + persist + log; no cross-layer imports (components MUST NOT import from `src/data/`).
- [ ] **VII. Smart/Dumb** — No Redux imports (`useSelector`, `useDispatch`, `src/store/**`) anywhere under `src/components/`; import linting passes.
- [ ] **VIII. One Component Per File** — No `.tsx` file has more than one `export default`; no JSX in any `index.ts`.
- [ ] **IX. Naming** — kebab-case file names; PascalCase types/components; camelCase functions/hooks/selectors; `SCREAMING_SNAKE_CASE` constants; PHP `trail_trivia_` prefix on public symbols; `TRAIL_TRIVIA_` constant prefix; no non-universal abbreviations.
- [ ] **X. TDD** — PR description confirms tests were observed failing (red) before implementation; test names describe behaviour; `src/domain/` tests use no mocks.
- [ ] **Phase shell tests** — All deterministic tests in `MIGRATION_PLAN.md` for this phase exit 0.

*If any item cannot be checked, the PR must document why under Complexity Tracking.*

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  Monorepo root layout (from constitution Architecture section v1.2.0):
    react-app/src/{data,domain,store,components,features,app}
    wp-plugin/trail-trivia/includes/class-*.php
  ACTION REQUIRED: Replace the placeholder tree below with the concrete paths
  for THIS feature only. Remove options that do not apply. The delivered plan
  must not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
