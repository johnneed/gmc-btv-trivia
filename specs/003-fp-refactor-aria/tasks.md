# Tasks: FP Refactor & ARIA Compliance

**Input**: Design documents from `specs/003-fp-refactor-aria/`

**Prerequisites**: plan.md ✓ · spec.md ✓ · research.md ✓ · data-model.md ✓ · contracts/internal.md ✓

## Format: `[ID] [P?] [Story] [Type?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1, US2, US3)
- **[Type]**: `[test]` write-and-fail-first · `[a11y]` ARIA/axe · `[arch]` layer-boundary fix · `[coverage]` gate check · `[soc]` separation-of-concerns fix

---

## Phase 1: Setup

**Purpose**: Install the one missing dev dependency needed to run the axe audit gate.

- [x] T001 Install @axe-core/cli as dev dependency — run `npm install -D @axe-core/cli` in `react-app/`

---

## Phase 2: Foundational — Layer Migration

**Purpose**: Fix all architecture boundary violations so `tsc --noEmit` passes and the data layer is correct before any test writing begins. Includes TDD for the two new functions that the loader thunk depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete and T014 (tsc gate) passes.

- [x] T002 [test] [arch] Write failing test for `fetchTrivia` in `react-app/src/data/trivia-api.test.ts` — assert: calls `VITE_API_URL + "trivia.json"`; throws when env var absent; returns `Quiz[]` directly (no sorting/filtering); no `console.log` (TDD red)
- [x] T003 [arch] Create `react-app/src/data/trivia-api.ts` — move fetch from `loader-api.ts`; remove all `R.compose` transform logic and `console.log`; import `Quiz` from `../../domain/types`; behavior spec is in T002's test file (TDD green for T002)
- [x] T004 [test] [arch] Write failing tests for `filterPublished` and `filterByStatus` in `react-app/src/domain/transforms/quiz.transforms.test.ts` — add cases to existing test file; assert filtering by future date, past date, status field (TDD red)
- [x] T005 [arch] Add `filterPublished` and `filterByStatus` to `react-app/src/domain/transforms/quiz.transforms.ts` using Ramda (TDD green for T004)
- [x] T006 [arch] [soc] Update `react-app/src/features/loader/loader-slice.ts` — (1) change `fetchTrivia` import to `../../data/trivia-api`; (2) import `filterPublished` and `sortByDateDesc` from `../../domain/transforms/quiz.transforms` (direct file path — barrel is not yet created); (3) apply `filterPublished` + `sortByDateDesc` in the `fetchQuizzes.fulfilled` case; (4) remove `questionTags`, `selectedQuestionTags` state fields, `extractQuestionTags` function, and `addQuestionTag` / `removeQuestionTag` / `clearQuestionTags` actions and selectors; (5) update `Question`/`Quiz` type imports to `../../domain/types`; (6) **verify** the `fetchQuizzes.rejected` case dispatches an error state visible to the user — add one if the existing slice does not surface fetch failures
- [x] T007 [P] [arch] Update `react-app/src/components/choice-button/choice-button.tsx` — change `Choice` import from `../../models/types` → `../../domain/types`
- [x] T008 [P] [arch] Update `react-app/src/components/carousel/carousel.tsx` — change `Question`/`Quiz` imports from `../../models/types` → `../../domain/types`
- [x] T009 [P] [arch] Update `react-app/src/features/quiz/index.tsx` — change `Quiz` import from `../../models/types` → `../../domain/types`
- [x] T010 Delete `react-app/src/features/loader/loader-api.ts`
- [x] T011 Delete `react-app/src/models/` directory (entire tree — types, factories, all files)
- [x] T012 Delete `react-app/src/react-app-env.d.ts` (CRA leftover referencing removed `react-scripts`)
- [x] T013 Verify `npm run test -- --run` exits 0 (existing tests — factories, transforms, slices — must still pass after import changes)
- [x] T014 Gate — run `npx tsc --noEmit` in `react-app/`; must exit 0 before proceeding to user story phases

**Checkpoint**: Layer violations cleared. `src/models/` deleted. `src/data/trivia-api.ts` exists. All types flow through `src/domain/`. Existing tests pass.

> **⚠️ Barrel import note**: All Phase 2 and Phase 3 transform imports use **direct file paths** (`../../domain/transforms/quiz.transforms`, not `../../domain/transforms/`). The barrel (`src/domain/transforms/index.ts`) is created in T039 (Phase 4) once `question.transforms.ts` exists. Do not use barrel imports before T039 is complete.

---

## Phase 3: User Story 1 — Accessible Quiz for All Players (Priority: P1) 🎯 MVP

**Goal**: Any player using a keyboard only, screen reader, or reduced-motion preference can complete a full 5-question quiz end-to-end.

**Independent Test**: `npx axe http://localhost:4321 --exit` returns 0 violations on the served build. Manual keyboard walkthrough (quickstart.md Step 10) passes. Manual reduced-motion check (quickstart.md Step 11) passes.

### Progress Bar (new component — TDD required)

- [x] T015 [test] [P] [US1] [a11y] Write failing test for `ProgressBar` in `react-app/src/components/progress-bar/progress-bar.test.tsx` — assert: has `role="progressbar"`; `aria-valuenow` equals `current` prop; `aria-valuemin=1`; `aria-valuemax` equals `total` prop; `aria-label` defaults to "Question N of M"; no Redux imports (TDD red)
- [x] T016 [P] [US1] [a11y] Create `react-app/src/components/progress-bar/progress-bar.tsx` — dumb component, props: `current: number`, `total: number`, `label?: string`; renders width as `(current/total)*100%`; no store/data/domain imports (TDD green for T015)
- [x] T017 [P] [US1] [a11y] Create `react-app/src/components/progress-bar/styles.module.css` — progress bar track and fill styles
- [x] T018 [P] [US1] [a11y] Create `react-app/src/components/progress-bar/index.ts` — barrel re-export

### Question ARIA (structural change to carousel — TDD required)

- [x] T019 [test] [US1] [a11y] Write failing test for `QuestionComponent` in `react-app/src/components/carousel/carousel.test.tsx` — assert: question text renders inside an `<h2>`; choice buttons are inside a container with `role="group"`; that container has `aria-labelledby` matching the `<h2>`'s `id`; each choice button is keyboard-activatable (TDD red)
- [x] T020 [US1] [a11y] Modify `QuestionComponent` in `react-app/src/components/carousel/carousel.tsx` — change `<div className={styles.question_text}>` to `<h2 id={\`question-\${question.id}\`} className={styles.question_text}>`; add `role="group"` and `aria-labelledby={\`question-\${question.id}\`}` to the choices `<div>` (TDD green for T019)

### Integrate ProgressBar into quiz screen

- [x] T021 [US1] [a11y] Modify `react-app/src/features/quiz/index.tsx` — import `ProgressBar` from `../../components/progress-bar`; add `<ProgressBar current={qIndex + 1} total={quiz.questions.length} />` above the `Carousel` in the quiz layout

### Reduced-motion guards

- [x] T022 [US1] [a11y] Modify `Carousel` in `react-app/src/components/carousel/carousel.tsx` — import `useReducedMotion` from `framer-motion`; when `useReducedMotion()` is true, replace `motion.div` animate props with instant (zero-duration) variants or `animate={false}`
- [x] T023 [P] [US1] [a11y] Modify `react-app/src/features/home/index.tsx` — add `useReducedMotion()` guard on `motion.div`; when reduced, strip `initial`/`animate` props
- [x] T024 [P] [US1] [a11y] Modify `react-app/src/features/quiz-list/index.tsx` — same reduced-motion guard as T023
- [x] T025 [P] [US1] [a11y] Modify `react-app/src/features/score/index.tsx` — same reduced-motion guard as T023

### aria-live regions

- [x] T026 [US1] [a11y] Modify `react-app/src/features/loader/index.tsx` — wrap loading content in `<div aria-live="polite" aria-busy={isLoading}>` so screen readers announce loading state without interruption
- [x] T027 [US1] [a11y] Modify `react-app/src/features/score/index.tsx` — wrap the score result `<p>` in `<div aria-live="assertive">` so screen readers immediately announce the final result

### Route changes: document.title + focus management

- [x] T028 [US1] [a11y] Modify `react-app/src/App.tsx` — add `<main id="main-content" tabIndex={-1}>` landmark wrapping the router outlet; add a router listener (`useEffect` + `useLocation`) that calls `document.getElementById("main-content")?.focus()` on each route change
- [x] T029 [P] [US1] [a11y] Add `useEffect(() => { document.title = "Trail Trivia"; }, [])` to `react-app/src/features/home/index.tsx`
- [x] T030 [P] [US1] [a11y] Add `useEffect(() => { document.title = "Trail Trivia — Archives"; }, [])` to `react-app/src/features/quiz-list/index.tsx`
- [x] T031 [P] [US1] [a11y] Add `useEffect(() => { document.title = quiz ? \`Trail Trivia — \${quiz.title}\` : "Trail Trivia"; }, [quiz])` to `react-app/src/features/quiz/index.tsx`
- [x] T032 [P] [US1] [a11y] Add `useEffect(() => { document.title = "Trail Trivia — Your Score"; }, [])` to `react-app/src/features/score/index.tsx`

### US1 validation gates

- [ ] T033 [US1] [a11y] Run axe-core audit — `npm run build && npx serve dist -p 4321 &` then `npx axe http://localhost:4321 --exit`; must report 0 critical/serious violations
- [ ] T034 [US1] [a11y] Manual keyboard walkthrough per quickstart.md Step 10 — Tab through full quiz, answer all 5 questions, reach score screen without mouse
- [ ] T035 [US1] [a11y] Manual reduced-motion check per quickstart.md Step 11 — Chrome DevTools → Rendering → "Emulate prefers-reduced-motion"; confirm no animations play

**Checkpoint**: All players can complete a full quiz without a mouse. axe reports 0 violations. Reduced-motion confirmed working.

---

## Phase 4: User Story 2 — Predictable, Testable Codebase (Priority: P2)

**Goal**: Every `.ts`/`.tsx` file in `react-app/src/` has a test file; coverage on `domain/`, `store/`, `components/`, `features/` ≥ 90% lines and branches.

**Independent Test**: `npm run test -- --run --coverage` exits 0; the per-layer coverage check script (T055) reports `lines.pct ≥ 90` and `branches.pct ≥ 90` for `domain/`, `store/`, `components/`, `features/`. `src/app/` is excluded from the threshold.

### New transform files (TDD required — new code)

- [x] T036 [test] [P] [US2] Write failing test for `isComplete` in `react-app/src/domain/transforms/question.transforms.test.ts` — cases: complete question (all fields non-empty) returns true; empty `questionText` returns false; any choice with empty `text` returns false; exactly 4 choices required (TDD red)
- [x] T037 [P] [US2] Create `react-app/src/domain/transforms/question.transforms.ts` — export `isComplete(question: Question): boolean` using Ramda (`R.allPass` / `R.pipe`); no side effects (TDD green for T036)
- [x] T038 [test] [P] [US2] Write failing test for transforms barrel in `react-app/src/domain/transforms/index.test.ts` — assert `sortByDateDesc`, `filterPublished`, `filterByStatus`, `isComplete` are all named exports (smoke test)
- [x] T039 [P] [US2] Create `react-app/src/domain/transforms/index.ts` — barrel re-exporting all named exports from `quiz.transforms` and `question.transforms` (TDD green for T038)

### Component tests (existing components — write tests, verify pass)

- [x] T040 [P] [US2] Write `react-app/src/components/action-button/action-button.test.tsx` — renders with text prop; calls `onClick` on click; renders as `<Link>` when `to` prop provided; applies variant class
- [x] T041 [P] [US2] Write `react-app/src/components/choice-button/choice-button.test.tsx` — renders choice text; calls `onClick(true)` when correct; calls `onClick(false)` when incorrect; button disabled after incorrect selection; correct selection does not disable
- [x] T042 [P] [US2] Write `react-app/src/components/logo-spinner/logo-spinner.test.tsx` — renders without crashing; no Redux imports
- [x] T043 [P] [US2] Write `react-app/src/components/quiz-card/quiz-card.test.tsx` — renders quiz title; renders link with correct `/quiz/{id}` href; renders `children` slot
- [x] T044 [P] [US2] Write `react-app/src/components/social-buttons/social-buttons.test.tsx` — renders share links; all links have accessible names

### Feature tests (write tests, verify pass)

- [x] T045 [P] [US2] Write `react-app/src/features/home/home.test.tsx` — render with store containing one quiz; shows quiz title; shows Play button; renders reduced-motion safe (no animation crash)
- [x] T046 [P] [US2] Write `react-app/src/features/loader/loader.test.tsx` — render in loading state; asserts `aria-live="polite"` region present; render in idle state; asserts no busy indicator
- [x] T047 [P] [US2] Write `react-app/src/features/quiz/quiz.test.tsx` — render with valid `qid` param; shows `ProgressBar`; shows first question; render with unknown `qid`; shows not-found message
- [x] T048 [P] [US2] Write `react-app/src/features/quiz-list/quiz-list.test.tsx` — render with multiple quizzes in store; correct number of `QuizCard` components rendered; "Back" button present
- [x] T049 [P] [US2] Write `react-app/src/features/score/score.test.tsx` — render with score in store; shows correct score text; `aria-live="assertive"` region wraps result; share buttons present

### Data layer test (write test, verify pass)

- [x] T050 [P] [US2] Extend `react-app/src/data/trivia-api.test.ts` — add edge-case coverage to the file created in T002; do not overwrite T002's tests; add cases: response body parse error (malformed JSON), network failure (fetch rejects), empty array response

### Lib tests

- [x] T051 [P] [US2] Write `react-app/src/libs/string-helpers.test.ts` — `splitOnCarriageReturn`: splits on `\n`; single string returns single-element array; empty string returns `[""]`
- [x] T052 [P] [US2] Write `react-app/src/libs/window-helpers.test.ts` — spy on `window.scrollTo`; call `scrollTop()`; assert `window.scrollTo(0, 0)` was called

### App layer smoke tests (excluded from 90% gate)

- [x] T053 [P] [US2] Write `react-app/src/app/hooks.test.ts` — smoke: `useAppDispatch` and `useAppSelector` are exported functions (no runtime invocation needed; just import and typeof check)
- [x] T054 [P] [US2] Write `react-app/src/app/store.test.ts` — smoke: import `store`; assert `store.getState()` returns object with `loader` and `score` keys

### Coverage gate

- [x] T055 [US2] [coverage] Run coverage gate — `npm run test -- --run --coverage` exits 0; run coverage check node script: `lines.pct ≥ 90` and `branches.pct ≥ 90` in `coverage/coverage-summary.json` for `domain/`, `store/`, `components/`, `features/` layers; `src/app/` excluded from threshold

**Checkpoint**: Every `.ts`/`.tsx` in `src/` has a test file. Coverage gate passes on the four layers.

---

## Phase 5: User Story 3 — Side-Effect Isolation Verification (Priority: P3)

**Goal**: Confirm that all network I/O is in `src/data/` only; no side effects in domain transforms or components.

**Independent Test**: Three grep commands from quickstart.md Step 5 all return 0 lines.

- [x] T056 [P] [US3] [arch] Verify fetch isolation — `grep -rn "\bfetch(" react-app/src/ | grep -v "src/data/\|\.test\.\|\.spec\."` must return 0 lines
- [x] T057 [P] [US3] [arch] Verify console.log removed — `grep -rn "console\.log" react-app/src/ | grep -v "\.test\.\|\.spec\."` must return 0 lines
- [x] T058 [P] [US3] [arch] Verify models/ is gone — `ls react-app/src/models/ 2>&1 | grep "No such file"` must succeed (directory deleted in T011)
- [x] T059 [US3] [arch] Verify transforms use Ramda — `grep -rn "from \"ramda\"" react-app/src/domain/transforms/` returns ≥ 2 lines (quiz.transforms + question.transforms)

**Checkpoint**: All three isolation gates pass. No fetch outside `src/data/`. No console.log in production source.

---

## Phase 6: Polish & Full Validation

**Purpose**: Run the complete MIGRATION_PLAN.md Phase 2 test block end-to-end and confirm the build is clean.

- [x] T060 Run full MIGRATION_PLAN.md Phase 2 deterministic test block — all commands must exit 0 (copy-paste the block from quickstart.md "Full Phase 2 Shell Block")
- [x] T061 Run `npx tsc --noEmit` in `react-app/` — must exit 0
- [x] T062 Run `npm run build` in `react-app/` — must exit 0; bundle ≤ 512 KB gzipped
- [x] T063 [P] Run grep gate for `let`/`var` — `grep -rn "\bvar\b\|\blet\b" react-app/src/ | grep -v "\.test\.\|\.spec\.\|// "` returns 0 lines
- [x] T064 [P] Run grep gate for in-place mutations — `grep -rn "\.push(\|\.splice(\|\.sort(" react-app/src/domain/ react-app/src/components/` returns 0 lines
- [x] T065 [P] Run SC-006 grep gate — `grep -rn "<img" react-app/src/ | grep -v 'alt='` returns 0 lines (FR-002 alt-text compliance)
- [x] T066 [P] Run FR-020 gate — `grep -rn "export default" react-app/src/ | grep "\.tsx$" | awk -F: '{print $1}' | sort | uniq -d` returns 0 lines (no file has more than one default export)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1. **Blocks all user story phases.** T014 (tsc gate) must pass before any Phase 3/4/5 task begins.
- **US1 (Phase 3)**: Depends on Foundational completion.
- **US2 (Phase 4)**: Depends on Foundational completion. T036–T039 (new transforms) are independent of US1. T040–T054 (tests for existing files) can run in parallel with US1.
- **US3 (Phase 5)**: Depends on Foundational completion. Verifications are all green once Track A is done; can run after T014.
- **Polish (Phase 6)**: Depends on US1 + US2 + US3 all complete.

### Within Foundational (Phase 2)

```
T002 → T003 (trivia-api TDD: test then impl)
T004 → T005 (quiz.transforms TDD: test then impl)
T003 + T005 → T006 (loader-slice update needs both)
T007, T008, T009 can run in parallel after T006
T010 → T011 → T012 (deletions in sequence)
T013 → T014 (test run then tsc gate)
```

### Within US1 (Phase 3)

```
T015 → T016 → T017 → T018 (ProgressBar: test→impl→css→barrel)
T019 → T020 (Carousel ARIA: test→impl)
T016 + T020 → T021 (integrate ProgressBar after both exist)
T022, T023, T024, T025 can run in parallel (different files)
T026, T027 can run in parallel (different files)
T028 → T029, T030, T031, T032 (App.tsx landmark first, then title hooks)
T033 → T034 → T035 (validation gates in order)
```

### Within US2 (Phase 4)

```
T036 → T037 (question.transforms TDD)
T038 → T039 (barrel TDD — depends on T037 for isComplete export)
T040–T054 all [P] — run in parallel (different test files)
T055 (coverage gate) — after all test files written
```

### Parallel Opportunities

**Phase 2** (after T006):
- T007, T008, T009 — three different component files

**Phase 3** (after T014):
- T015+T019 — ProgressBar test and Carousel test (different files)
- T023, T024, T025 — reduced-motion guards in three feature files
- T029, T030, T031, T032 — document.title updates in four feature files

**Phase 4** (all test writing — 15 [P] tasks):
- T040–T054 can all run simultaneously (15 different test files)

---

## Parallel Example: Phase 4 Test Sprint

```bash
# After T014 gate passes, launch all 15 component/feature test files simultaneously:
"Write react-app/src/components/action-button/action-button.test.tsx"    # T040
"Write react-app/src/components/choice-button/choice-button.test.tsx"    # T041
"Write react-app/src/components/logo-spinner/logo-spinner.test.tsx"      # T042
"Write react-app/src/components/quiz-card/quiz-card.test.tsx"            # T043
"Write react-app/src/components/social-buttons/social-buttons.test.tsx"  # T044
"Write react-app/src/features/home/home.test.tsx"                        # T045
"Write react-app/src/features/loader/loader.test.tsx"                    # T046
"Write react-app/src/features/quiz/quiz.test.tsx"                        # T047
"Write react-app/src/features/quiz-list/quiz-list.test.tsx"              # T048
"Write react-app/src/features/score/score.test.tsx"                      # T049
"Write react-app/src/libs/string-helpers.test.ts"                        # T051
"Write react-app/src/libs/window-helpers.test.ts"                        # T052
"Write react-app/src/app/hooks.test.ts"                                  # T053
"Write react-app/src/app/store.test.ts"                                  # T054
# Then run T055 coverage gate once all above complete
```

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T014) — **REQUIRED, blocks everything**
3. Complete Phase 3: US1 — ARIA (T015–T035)
4. **STOP and VALIDATE**: axe reports 0 violations; keyboard walkthrough passes
5. Phase 2 ARIA deliverable is complete

### Incremental Delivery

1. Foundation (T001–T014) → layer violations cleared, build clean
2. US1 (T015–T035) → accessible for all players → axe + keyboard gates pass
3. US2 (T036–T055) → 90% coverage, all files tested → coverage gate passes
4. US3 (T056–T059) → isolation verified → grep gates pass
5. Polish (T060–T064) → full MIGRATION_PLAN.md Phase 2 block exits 0 → Phase 2 closed

---

## Notes

- All tasks under `react-app/src/` — no PHP/WP plugin changes in Phase 2
- `[test]` tasks MUST be written first and observed failing before their paired implementation task (Principles X and III)
- `src/app/` test files (T053, T054) are excluded from the ≥ 90% threshold — write them, but don't count them in the gate calculation
- `carousel.tsx` has two local sub-components (`QuestionComponent`, `AnswerComponent`) — these are not exported and do not violate Principle VIII; do not split into separate files
- After T011 (delete `src/models/`), running `npm run test -- --run` immediately validates that no stale import broke the existing test suite
- The `extractQuizTags` function in `loader-slice.ts` (T006) is kept; only `extractQuestionTags` and its associated state is removed (Question type has no `tags` field)
- **Reduced-motion guards (T022–T025)**: These are classified as "minor changes" under the spec's TDD clarification (Q3 2026-06-26) — no paired `[test]` task is required. T035 (manual reduced-motion check) is the gate. T019's carousel test covers T020's structural ARIA changes but not the motion guard added in T022; if the motion guard produces a testable rendered difference, add a test case to `carousel.test.tsx` during T022.
- **Slice rename deferred**: The Redux store currently uses `loader` and `score` slice names; the constitution Architecture section shows a future target of `games` and `session`. This rename is **not** part of Phase 2. T054's smoke test asserts `{ loader, score }` — this is correct for Phase 2 and does not constitute a constitution violation.
- **Alt text audit (FR-002)**: The codebase audit (research.md Decision 5) found all existing `<img>` elements already carry `alt` attributes (`alt={question.answerImageAlt}` in carousel; `alt={"preload"}` on prefetch images). No dedicated implementation task is needed for FR-002 beyond T033 (axe audit) and T065 (SC-006 grep gate).
