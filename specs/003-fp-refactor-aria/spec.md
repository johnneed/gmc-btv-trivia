# Feature Specification: FP Refactor & ARIA Compliance

**Feature Branch**: `003-fp-refactor-aria`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "read MIGRATION_PLAN.md  We need to execute phase 2 of the plan"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accessible Quiz for All Players (Priority: P1)

Any player, including those using a keyboard only, screen reader, or with a motion-sensitivity preference, can complete a full quiz end-to-end without encountering inaccessible controls or missing information.

**Why this priority**: The GMC Burlington Trail Trivia is a community tool. Excluding players with disabilities violates the community trust and WCAG 2.1 AA, which the project is committed to meeting. Accessibility work surfaces broken ARIA patterns that would otherwise remain hidden until a real user encounters them.

**Independent Test**: Open the built app in a browser. Disconnect the mouse. Using only Tab, Shift+Tab, Enter, and Space: navigate to a quiz, answer all 5 questions, and reach the score screen. Every interactive element must have a visible focus indicator and an accessible name readable by a screen reader. Result: zero critical/serious axe-core violations on the served build.

**Acceptance Scenarios**:

1. **Given** a player uses a screen reader, **When** they navigate to a question, **Then** the choice buttons are announced as a group with the question text as the group label.
2. **Given** a player has "prefers-reduced-motion" enabled in their OS, **When** the app loads, **Then** all framer-motion animations are suppressed with no visual jank.
3. **Given** a question card contains an answer image, **When** the page renders, **Then** the image has a non-empty `alt` attribute describing the image content.
4. **Given** a player navigates to a new quiz screen, **When** the route changes, **Then** the page title updates and focus moves to the main content region.
5. **Given** a loading state is active, **When** the screen reader reaches the live region, **Then** the loading announcement is polite (does not interrupt the current reading).
6. **Given** a score result is announced, **When** it appears, **Then** the live region uses assertive mode so the screen reader interrupts to announce the result.
7. **Given** a player uses keyboard only, **When** they tab through choice buttons, **Then** all four buttons receive focus in order and are activatable via Enter or Space.

---

### User Story 2 - Predictable, Testable Codebase for Developers (Priority: P2)

A developer working on any `.ts` or `.tsx` file in `react-app/src/` can immediately locate the correct layer (data, domain, component, feature), run its tests in isolation, and trust that 90% of lines and branches are covered.

**Why this priority**: The Vite migration (Phase 1) changed the build toolchain. Phase 2 must complete the structural realignment — removing mutable state patterns and enforcing the Smart/Dumb boundary — so that future phases (API client, WP plugin) can be added without contaminating existing layers. High coverage is the safety net for all subsequent phases.

**Independent Test**: Run `npm run test -- --run --coverage` in `react-app/`. The coverage summary reports lines ≥ 90% and branches ≥ 90% with zero test failures.

**Acceptance Scenarios**:

1. **Given** a developer searches for `var` or `let` in `src/` (excluding Redux reducer bodies and test describe/it blocks), **When** the search completes, **Then** zero results are found.
2. **Given** a developer opens any file under `src/domain/transforms/`, **When** they inspect the imports, **Then** every transform file imports from `ramda`.
3. **Given** a developer opens any file under `src/components/`, **When** they inspect the imports, **Then** no file imports from `src/store/`, `src/data/`, or `src/domain/`.
4. **Given** a developer runs the full test suite, **When** the coverage report is generated, **Then** total line coverage ≥ 90% and total branch coverage ≥ 90%.
5. **Given** a new `question.transforms.ts` file is created, **When** a developer runs its unit tests in isolation, **Then** the tests pass with no mocks (pure function, no side effects).
6. **Given** a Smart component exists in `src/features/`, **When** a developer inspects it, **Then** it uses `useSelector` and/or `useDispatch`; it does not fetch data directly.
7. **Given** a Dumb component exists in `src/components/`, **When** a developer inspects it, **Then** it accepts all data via props and emits all events via callbacks; it has no Redux hooks or fetch calls.

---

### User Story 3 - Side-Effect Isolation (Priority: P3)

Any developer can identify exactly where network calls and I/O happen by looking only at `src/data/` and Redux thunks — no other layer initiates side effects.

**Why this priority**: Side-effect isolation is what makes the domain layer purely unit-testable without mocks (per Principle X). It also ensures that when the data source switches from `trivia.json` to the WP REST API in Phase 3, only `src/data/` needs to change.

**Independent Test**: `grep -rn "fetch\|XMLHttpRequest\|localStorage\|console.log" src/` returns hits only in `src/data/` and Redux thunk files, never in `src/domain/` or `src/components/`.

**Acceptance Scenarios**:

1. **Given** a developer searches `src/domain/` and `src/components/` for `fetch(`, **When** the search completes, **Then** zero results are found.
2. **Given** any Redux thunk in `src/store/` calls a network operation, **When** the thunk is inspected, **Then** it delegates the actual fetch to a function imported from `src/data/`.
3. **Given** any component in `src/components/` needs data, **When** it renders, **Then** data arrives via props, not via `useEffect` + fetch.

---

### Edge Cases

- What happens when an answer image URL is an empty string? `alt` should still be present (empty string is valid for decorative, but the image must not render broken).
- What happens when `prefers-reduced-motion` is toggled while the app is running? Motion suppression must react to the media query dynamically.
- What happens if a Redux reducer body uses `let` for a local variable? This is the one permitted exception; the grep gate must exclude reducer bodies.
- What happens when a test file contains `let` in a `describe` or `it` block? This is permitted; the lint gate must exclude test files.
- What happens when `src/domain/transforms/index.ts` is missing? Downstream imports in features and store break; the barrel must re-export all named exports from `quiz.transforms.ts` and `question.transforms.ts`.
- How does a Dumb component handle loading state? It receives a boolean prop from the Smart parent; it never calls `useSelector` to derive it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All interactive elements in the player app MUST have an accessible name (visible text, `aria-label`, or `aria-labelledby`).
- **FR-002**: All `<img>` elements MUST have an `alt` attribute; the attribute MUST be non-empty for informative images and empty-string for decorative images.
- **FR-003**: Choice button groups MUST be wrapped in a `role="group"` container with `aria-labelledby` pointing to the question heading, so screen readers announce the group context before each button.
- **FR-004**: The progress indicator MUST use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes kept in sync with quiz state.
- **FR-005**: Loading states MUST use an `aria-live="polite"` region so screen readers announce progress without interrupting the current reading flow.
- **FR-006**: Score results MUST use an `aria-live="assertive"` region so screen readers immediately announce the final result.
- **FR-007**: Route changes MUST update `document.title` to reflect the current view and MUST move focus to the main content region.
- **FR-008**: All framer-motion animations MUST be suppressed when the user's OS preference is `prefers-reduced-motion: reduce`.
- **FR-009**: The axe-core accessibility audit on the served production build MUST report zero critical or serious violations.
- **FR-010**: All data transforms (sort, filter, normalize) MUST live exclusively in `react-app/src/domain/transforms/` and MUST use Ramda — no native in-place Array methods.
- **FR-011**: `react-app/src/domain/transforms/question.transforms.ts` MUST be created with a single Ramda-based `isComplete(question: Question): boolean` predicate that returns `true` when `questionText` is non-empty and all 4 `choices` have non-empty `text`. No other transforms are included (YAGNI — additional question transforms are deferred to the phase that requires them).
- **FR-012**: `react-app/src/domain/transforms/index.ts` MUST be created as a barrel exporting all named exports from `quiz.transforms.ts` and `question.transforms.ts`.
- **FR-013**: All source files in `react-app/src/` (excluding Redux reducer bodies and Vitest test blocks) MUST use `const` for all declarations; `let` and `var` are forbidden.
- **FR-014**: No in-place array mutation (`.push()`, `.splice()`, `.sort()`) is permitted in `src/domain/` or `src/components/`.
- **FR-015**: All network I/O and side effects MUST be isolated to `src/data/` and Redux thunks; domain transforms and components MUST be pure.
- **FR-016**: Smart components (those using `useSelector` or `useDispatch`) MUST live only in `src/features/`; Dumb components (props-in, JSX-out) MUST live only in `src/components/`.
- **FR-017**: No file under `src/components/` MAY import from `src/store/`, `src/data/`, or `src/domain/`.
- **FR-018**: Every `.ts` and `.tsx` file in `react-app/src/` MUST have a corresponding unit test file, including files in `src/app/`.
- **FR-019**: The test suite MUST achieve ≥ 90% line coverage and ≥ 90% branch coverage across `src/domain/`, `src/store/`, `src/components/`, and `src/features/`. Files in `src/app/` (`App.tsx`, `router.tsx`, `ErrorBoundary.tsx`) are excluded from the coverage threshold — they require test files (FR-018) but root-wiring coverage is validated by the E2E smoke test rather than the unit coverage gate.
- **FR-020**: Each component MUST be in its own file with exactly one default export; no file may export more than one component.

### Key Entities

- **Transform**: A pure function in `src/domain/transforms/` that takes domain data (Quiz or Question arrays) and returns new data without mutation. No side effects, no imports from outside `ramda` or the domain type files.
- **Smart Component**: A React component in `src/features/` that owns Redux subscriptions (`useSelector`) and dispatches actions (`useDispatch`). The single source of business logic for its feature area.
- **Dumb Component**: A React component in `src/components/` that receives all data via props and emits all events via callback props. Has no knowledge of Redux, the store, or the network.
- **Coverage Report**: The `coverage/coverage-summary.json` produced by Vitest + `@vitest/coverage-v8` after a `--coverage` run. The `total.lines.pct` and `total.branches.pct` values are the gating metrics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: axe-core CLI reports 0 critical or serious violations when run against the served production build at `http://localhost:4321`.
- **SC-002**: Keyboard-only navigation (Tab, Shift+Tab, Enter, Space) can complete a full 5-question quiz from the home screen to the score screen without requiring a mouse.
- **SC-003**: `npm run test -- --run --coverage` exits 0, and the per-layer coverage check script (see T055) confirms `lines.pct ≥ 90` and `branches.pct ≥ 90` for each of `domain/`, `store/`, `components/`, and `features/`. `src/app/` is excluded from the threshold; its smoke tests run but do not count toward the gate.
- **SC-004**: `grep -rn "\bvar\b\|\blet\b" src/ | grep -v "\.test\.\|\.spec\.\|// "` returns 0 lines (outside the permitted reducer and test-block exceptions).
- **SC-005**: `grep -rn "\.push(\|\.splice(\|\.sort(" src/domain/ src/components/` returns 0 lines.
- **SC-006**: `grep -rn "<img" src/ | grep -v 'alt='` returns 0 lines.
- **SC-007**: `grep -rn "from \"ramda\"" src/domain/transforms/` returns at least 2 results (one per transform file).
- **SC-008**: The full Phase 2 deterministic test block from `MIGRATION_PLAN.md` exits 0 on every command.

## Clarifications

### Session 2026-06-26

- Q: What transforms should live in `question.transforms.ts`? → A: `isComplete(question): boolean` only — pure Ramda predicate checking non-empty `questionText` and all 4 choices filled. Additional question transforms deferred to the phase that needs them (YAGNI).
- Q: Does the 90% coverage gate apply to `src/app/` files? → A: No. `src/app/` files require test files (FR-018) but are excluded from the ≥ 90% threshold. Root-wiring coverage is validated by E2E smoke test.
- Q: For files touched in Phase 2, must tests be written red-first (TDD), or do existing passing tests count? → A: New files and files with structural changes (layer moves, Smart/Dumb splits) follow TDD (red→green→refactor). Existing passing tests for files with minor changes (ARIA attributes, `const`/`let` swaps) count as-is if they cover the changed lines.

## Assumptions

- Phase 1 (Vite Migration & Dependency Upgrade) has been completed and all Phase 1 acceptance criteria pass before Phase 2 work begins.
- TDD applies in full (red→green→refactor) for new files and structurally changed files (layer moves, Smart/Dumb splits). Existing passing tests for files receiving only minor changes (ARIA attributes, `const`/`let` substitutions) count toward coverage without requiring a red-first cycle.
- The existing component structure may contain mixed Smart/Dumb code that will need to be split and relocated; the volume of this work is unknown until the current codebase is audited.
- `quiz.transforms.ts` already exists (created in Phase 0 with `sortByDateDesc`); Phase 2 extends it with additional transforms (filter by status, filter by tags) per the target architecture in `MIGRATION_PLAN.md`.
- `question.transforms.ts` does not yet exist and must be created from scratch.
- The axe-core CLI tool (`npx axe-core-cli`) is available in the dev environment or can be installed as a dev dependency without adding a production dependency.
- Manual keyboard-navigation testing is performed by a developer, not by an automated tool — automated axe covers structural ARIA violations; end-to-end keyboard flow is the manual gate.
- Framer-motion 11.x supports `prefers-reduced-motion` via its `useReducedMotion` hook or CSS media query — no custom polyfill is needed.
