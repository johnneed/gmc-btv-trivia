---

description: "Task list for Phase 0 — Monorepo Scaffold & Domain Finalization"
---

# Tasks: Monorepo Scaffold & Domain Finalization

**Input**: `specs/001-scaffold-domain/plan.md`, `spec.md`, `data-model.md`, `contracts/`

**TDD mandate** (Principle X): every `[test]` task MUST be run and observed FAILING before the paired implementation task starts. A test that passes before implementation is a broken test — fix it first.

**Ponytail**: fewest files, shortest diff, no scaffolding for later.
**Caveman**: task names are short — action + file path, no filler.

## Format: `[ID] [P?] [Story] [Type?] Description`

- `[P]` — parallelizable (different files, no unresolved deps)
- `[US1..4]` — maps to user story in spec.md
- `[test]` — TDD test file, written and observed failing BEFORE implementation
- `[coverage]` — coverage gate check

---

## Phase 1: Setup

**Purpose**: Monorepo structure + test runner in place. Blocks everything else.

- [ ] T001 `git mv gmc-btv-trivia react-app` at repo root — verify gmc-btv-trivia/ absent, react-app/ present
- [ ] T002 In `react-app/package.json` add `vitest` to devDependencies; run `npm install`
- [ ] T003 Create `react-app/vitest.config.ts` — minimal config, include `src/domain/**/*.test.ts` only

```typescript
// react-app/vitest.config.ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['src/domain/**/*.test.ts'] } });
```

**Checkpoint**: `ls react-app/ && npx vitest --version` both succeed.

---

## Phase 2: Foundational

**Purpose**: tsconfig updated so `tsc --noEmit` can run. Blocks US1.

⚠️ CRITICAL: T004 must complete before any type files are created.

- [ ] T004 Update `react-app/tsconfig.json` in place — add `"strict": true`, set `"include": ["src"]`, remove CRA-only options (`react-app/jsconfig.json` shims, injected types); do NOT add Vite path aliases (Phase 1)
- [ ] T005 Create `react-app/src/domain/types/index.ts` — empty barrel file (populated in US1)

**Checkpoint**: `cd react-app && npx tsc --noEmit` exits 0 (on empty domain dir).

---

## Phase 3: User Story 1 — Domain Types (Priority: P1)

**Goal**: `tsc --noEmit` exits 0; all 5 types exist with correct shape.

**Independent Test**: `cd react-app && npx tsc --noEmit` → exit 0.

*T006–T010 are fully parallel — different files, no deps between them.*

- [ ] T006 [P] [US1] Create `react-app/src/domain/types/choice.type.ts` — `id: string`, `text: string`; no extra fields
- [ ] T007 [P] [US1] Create `react-app/src/domain/types/question.type.ts` — fields: `id`, `questionText`, `choices: Choice[]`, `correctAnswerIndex: number`, `answerText: string`, `answerImage?`, `answerImageAlt?`, `answerImageCaption?`; NO `tags` field
- [ ] T008 [P] [US1] Create `react-app/src/domain/types/quiz.type.ts` — fields: `id`, `title`, `subtitle?`, `author`, `authorId: number`, `publishDate: number`, `status: 'draft'|'published'`, `questions: Question[]`, `tags: string[]`; NO `image` field
- [ ] T009 [P] [US1] Create `react-app/src/domain/types/app-user.type.ts` — `WPRole` union type + `AppUser`: `id: number`, `displayName: string`, `roles: WPRole[]`, `isTriviaSmith: boolean`
- [ ] T010 [P] [US1] Create `react-app/src/domain/types/plugin-settings.type.ts` — two types: `PluginSettings { gamesPerPage: number }` and `PluginInfo { version: string; wpMinimum: string; phpMinimum: string }`
- [ ] T011 [US1] Fill `react-app/src/domain/types/index.ts` — export `Choice`, `Question`, `Quiz`, `WPRole`, `AppUser`, `PluginSettings`, `PluginInfo`
- [ ] T012 [US1] Run `cd react-app && npx tsc --noEmit` — confirm exit 0 (US1 gate ✓)

**Checkpoint**: T012 exits 0. US1 independently complete.

---

## Phase 4: User Story 2 — Factories TDD (Priority: P1)

**Goal**: `npx vitest run src/domain/factories/` and `src/domain/transforms/` exit 0; coverage ≥ 90%.

**TDD rule**: ALL `[test]` tasks (T013–T016) run first. Confirm FAIL. Then implement (T017–T020). Confirm PASS.

**Independent Test**: `cd react-app && npx vitest run src/domain/factories/ src/domain/transforms/` → exit 0.

### Test files (write first, observe failing)

*T013–T016 are parallel — different test files.*

- [ ] T013 [P] [US2] [test] Write `react-app/src/domain/factories/choice.factory.test.ts` — 5 cases from `contracts/factory-signatures.ts`; run `npx vitest run src/domain/factories/choice.factory.test.ts`; confirm ALL FAIL (red)
- [ ] T014 [P] [US2] [test] Write `react-app/src/domain/factories/question.factory.test.ts` — 8 cases from contracts; run; confirm ALL FAIL (red)
- [ ] T015 [P] [US2] [test] Write `react-app/src/domain/factories/quiz.factory.test.ts` — 8 cases from contracts including "has no `image` field" case; run; confirm ALL FAIL (red)
- [ ] T016 [P] [US2] [test] Write `react-app/src/domain/transforms/quiz.transforms.test.ts` — 5 cases from contracts; run; confirm ALL FAIL (red)

### Implementation (after observing red)

- [ ] T017 [P] [US2] Implement `react-app/src/domain/factories/choice.factory.ts` — `createChoice(overrides?)` using `v4` from `uuid`; run T013 tests; confirm ALL PASS (green)
- [ ] T018 [P] [US2] Implement `react-app/src/domain/factories/question.factory.ts` — `createQuestion(overrides?)` always produces exactly 4 choices via `createChoice`; run T014 tests; confirm ALL PASS (green)
- [ ] T019 [P] [US2] Implement `react-app/src/domain/factories/quiz.factory.ts` — `createQuiz(overrides?)` default `questions:[]`, `status:'draft'`; run T015 tests including no-`image` assertion; confirm ALL PASS (green)
- [ ] T020 [US2] Implement `react-app/src/domain/transforms/quiz.transforms.ts` — `sortByDateDesc` via `R.sort(R.descend(R.prop('publishDate')))`; run T016 tests; confirm ALL PASS (green)
- [ ] T021 [US2] Create `react-app/src/domain/factories/index.ts` — re-export `createChoice`, `createQuestion`, `createQuiz`
- [ ] T022 [US2] [coverage] Run `cd react-app && npx vitest run --coverage src/domain/` — confirm lines ≥ 90%, branches ≥ 90%

**Checkpoint**: T022 passes. US2 independently complete.

---

## Phase 5: User Story 3 — WordPress Plugin Scaffold (Priority: P2)

**Goal**: `wp plugin activate trail-trivia` exits 0; debug log clean.

**Independent Test**: `wp plugin activate trail-trivia --allow-root` → exit 0; `debug.log` has 0 new notices.

*T023–T025 are parallel — different files in wp-plugin/.*

- [ ] T023 [P] [US3] Create `wp-plugin/trail-trivia/uninstall.php` — ABSPATH guard + empty body
- [ ] T024 [P] [US3] Create 7 PHP stub classes in `wp-plugin/trail-trivia/includes/`:
  - `class-post-type.php` → `Trail_Trivia_Post_Type`
  - `class-rest-api.php` → `Trail_Trivia_REST_API`
  - `class-capabilities.php` → `Trail_Trivia_Capabilities`
  - `class-settings.php` → `Trail_Trivia_Settings`
  - `class-admin-ui.php` → `Trail_Trivia_Admin_UI`
  - `class-shortcode.php` → `Trail_Trivia_Shortcode`
  - `class-cli-command.php` → `Trail_Trivia_CLI_Command`

  Each: ABSPATH guard + empty class body. No constructor, no methods.

- [ ] T025 [P] [US3] Create `wp-plugin/trail-trivia/trail-trivia.php` — valid WP plugin header (Plugin Name, Description, Version: 1.0.0, Requires at least: 6.4, Requires PHP: 8.0, Author) + `require_once` for each of the 7 stub files
- [ ] T026 [US3] Run `find wp-plugin -name "*.php" | xargs php -l` — confirm no output (all syntax clean)
- [ ] T027 [US3] Run `wp plugin activate trail-trivia --allow-root`; deactivate; re-activate — confirm exit 0 both times and 0 new debug.log entries

**Checkpoint**: T027 passes. US3 independently complete.

---

## Phase 6: User Story 4 — Phase Gate (Priority: P1)

**Goal**: ALL 5 deterministic test blocks from MIGRATION_PLAN.md Phase 0 exit 0.

**Independent Test**: Run every shell block in MIGRATION_PLAN.md Phase 0 — every `echo "exit: $?"` prints 0.

- [ ] T028 [US4] Run all Phase 0 shell tests from `MIGRATION_PLAN.md` sequentially from repo root:
  1. `cd react-app && npx tsc --noEmit` → exit 0
  2. `npx vitest run src/domain/factories/` → exit 0
  3. `find wp-plugin -name "*.php" | xargs php -l | grep -v "No syntax errors"` → empty
  4. `wp plugin activate trail-trivia --allow-root && wp plugin deactivate trail-trivia --allow-root && wp plugin activate trail-trivia --allow-root` → exit 0
  5. `tail -20 wp-content/debug.log | grep -ci "fatal\|warning\|notice"` → 0

  All 5 must print the expected result. Phase 1 MUST NOT begin until T028 passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No deps — start immediately
- **Foundational (Phase 2)**: T001 must complete — blocks US1
- **US1 (Phase 3)**: T004, T005 must complete — blocks US2
- **US2 (Phase 4)**: T011 (types barrel) + T003 (vitest) must complete — then test/impl pairs
- **US3 (Phase 5)**: T001 must complete (wp-plugin/ dir exists) — independent of TS work
- **US4 (Phase 6)**: T012 (US1 gate) + T022 (US2 coverage gate) + T027 (US3 WP gate) all complete

### Within US2: TDD pairing order

```
T013 (test) → T017 (impl)   ← choice factory pair
T014 (test) → T018 (impl)   ← question factory pair (also needs T017 done)
T015 (test) → T019 (impl)   ← quiz factory pair (also needs T017 done)
T016 (test) → T020 (impl)   ← transform pair
T017 + T018 + T019 done → T021 (barrel) → T022 (coverage gate)
```

### Parallel opportunities

```bash
# After T004+T005: all type files in parallel
T006 & T007 & T008 & T009 & T010

# After T011+T003: all test files in parallel
T013 & T014 & T015 & T016

# After tests confirmed red: choice impl first, then question+quiz in parallel
T017
T018 & T019   # both need T017 done; T020 independent

# US3 can run in parallel with US1+US2
T023 & T024 & T025
```

---

## Implementation Strategy

### MVP (US1 + US4 only)
1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1 (all types compile)
4. Run T012 — validate independently
5. **Stop and validate**: `tsc --noEmit` exits 0

### Full Phase 0
1. Complete Phases 1–3 above
2. Phase 4: US2 (factories, strict TDD)
3. Phase 5: US3 (PHP scaffold — can run in parallel with Phase 4)
4. Phase 6: US4 gate — all 5 shell tests pass

---

## Notes

- `[P]` tasks = different files, no incomplete dependencies — safe to parallelize
- TDD pairs: test file ALWAYS committed and observed failing before implementation file is written
- No task writes to the same file as another concurrent `[P]` task
- `quiz.factory.test.ts` MUST include a test asserting the returned object has no `image` property
- `question.factory.test.ts` MUST include a test asserting the returned object has no `tags` property
- Commit test + implementation together in the same commit (Principle X)
