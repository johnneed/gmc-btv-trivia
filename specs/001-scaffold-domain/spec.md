# Feature Specification: Monorepo Scaffold & Domain Finalization

**Feature Branch**: `001-scaffold-domain`

**Created**: 2026-06-26

**Status**: Draft

**Source**: MIGRATION_PLAN.md — Phase 0

---

## User Scenarios & Testing

### User Story 1 — Domain Types Compile Clean (Priority: P1)

A developer starting work on any subsequent phase runs the TypeScript compiler
against the domain layer and sees zero errors. Every domain contract (Choice,
Question, Quiz, AppUser, PluginSettings) exists as a correctly typed structure
with all fields specified in the migration plan.

**Why this priority**: All future React work — player, admin UI, Redux slices —
imports from the domain layer. A broken type contract blocks every other phase.

**Independent Test**: Run `npx tsc --noEmit` from `react-app/`. Command exits 0.

**Acceptance Scenarios**:

1. **Given** the domain types directory exists, **When** the TypeScript compiler runs, **Then** it exits 0 with no errors or warnings.
2. **Given** the `Quiz` type, **When** a developer inspects it, **Then** it contains `status: 'draft' | 'published'` and `authorId: number`, and does NOT contain an `image` field.
3. **Given** the `Choice` type, **When** a developer inspects it, **Then** it contains `id: string` alongside `text: string`.
4. **Given** the `Question` type, **When** a developer inspects it, **Then** it contains `answerImageAlt?: string` as an optional field.

---

### User Story 2 — Factory Functions Produce Valid Objects (Priority: P1)

A developer calls a factory function with no arguments (or minimal arguments)
and receives a complete, structurally valid domain object with sensible defaults
for every required field. Factory unit tests confirm this without any mocks.

**Why this priority**: Factories are the normalisation boundary used everywhere
data enters the system. They must exist before any data-layer or Redux work begins.

**Independent Test**: Run `npx vitest run src/domain/factories/` from `react-app/`. All tests pass.

**Acceptance Scenarios**:

1. **Given** `createChoice()` is called with no arguments, **When** the result is inspected, **Then** it has a non-empty `id` (UUID) and an empty-string `text`.
2. **Given** `createQuestion()` is called, **When** the result is inspected, **Then** it has a valid `id`, exactly 4 `choices` (each created via `createChoice`), `correctAnswerIndex` of 0, and empty-string `answerText`.
3. **Given** `createQuiz()` is called, **When** the result is inspected, **Then** it has a valid `id`, `status: 'draft'`, a numeric `publishDate`, `authorId: 0`, and an empty `questions` array.
4. **Given** factory output, **When** it is passed to `tsc` as a value of the corresponding type, **Then** no type errors occur.

---

### User Story 3 — WordPress Plugin Activates Cleanly (Priority: P2)

A WordPress administrator opens the Plugins screen, sees "Trail Trivia" listed
with a valid name and description, and activates it without receiving any PHP
error notices. Deactivating and re-activating leaves no orphan data or warnings.

**Why this priority**: The plugin scaffold must be clean before any PHP feature
code is added. A warning-free baseline prevents noise from masking real errors
in later phases.

**Independent Test**: Run `wp plugin activate trail-trivia --allow-root`; exits 0.
Check WP debug log for notices/warnings; count is 0.

**Acceptance Scenarios**:

1. **Given** the plugin is installed, **When** a WordPress admin opens the Plugins list, **Then** "Trail Trivia" appears with a valid name, description, and version number.
2. **Given** WordPress is in debug mode (`WP_DEBUG=true`), **When** the plugin is activated, **Then** `wp-content/debug.log` contains zero new PHP notices, warnings, or fatal errors.
3. **Given** the plugin is active, **When** it is deactivated and immediately re-activated, **Then** no duplicate data is created and the debug log remains clean.
4. **Given** all PHP files in the plugin, **When** each is passed to `php -l`, **Then** every file reports "No syntax errors".

---

### User Story 4 — All Phase 0 Shell Tests Pass (Priority: P1)

A developer runs every deterministic test block listed in MIGRATION_PLAN.md
Phase 0 and every command exits with code 0. This is the phase gate: Phase 1
MUST NOT begin until this story is complete.

**Why this priority**: The shell tests are the definition of done for this phase.
Passing them is the only accepted signal that the scaffold is complete and correct.

**Independent Test**: Execute all test blocks from MIGRATION_PLAN.md Phase 0
sequentially; every `echo "exit: $?"` prints 0.

**Acceptance Scenarios**:

1. **Given** the monorepo, **When** all Phase 0 shell tests are run, **Then** every command exits 0.
2. **Given** a fresh clone of the repository, **When** Phase 0 tests are run without local state, **Then** they still all pass.

---

### Edge Cases

- Factory called with partial overrides (e.g., `createQuiz({ title: 'AT in Maine' })`) MUST merge overrides with defaults without losing unspecified fields.
- `createQuestion()` MUST always produce exactly 4 choices — no more, no fewer.
- Plugin activation with `WP_DEBUG_LOG=true` MUST still produce a clean debug log even if the log file did not previously exist.
- PHP stub classes (empty bodies) MUST not trigger "Class not found" or "Abstract method not implemented" errors on activation.

---

## Requirements

<!-- Constitution alignment (v1.2.0): this phase touches react-app/src/domain/ and wp-plugin/includes/. -->

### Functional Requirements

- **FR-001**: The repository MUST contain a `react-app/` directory (created by `git mv gmc-btv-trivia react-app`) and a `wp-plugin/trail-trivia/` directory at its root. The `gmc-btv-trivia/` directory MUST NOT exist after this operation.
- **FR-002**: `react-app/src/domain/types/` MUST contain exactly these five files, each exporting one type: `choice.type.ts`, `question.type.ts`, `quiz.type.ts`, `app-user.type.ts`, `plugin-settings.type.ts`.
- **FR-003**: The `Choice` type MUST include `id: string` and `text: string`.
- **FR-004**: The `Question` type MUST include `id`, `questionText`, `choices: Choice[]`, `correctAnswerIndex: number`, `answerText: string`, `answerImageAlt?: string`, `answerImageCaption?: string`, `answerImage?: string`. The `Question` type MUST NOT include a `tags` field — per-question tagging is not implemented.
- **FR-005**: The `Quiz` type MUST include `id`, `title`, `subtitle?: string`, `author: string`, `authorId: number`, `publishDate: number`, `status: 'draft' | 'published'`, `questions: Question[]`, `tags: string[]`. The `Quiz` type MUST NOT include an `image` field — there is no featured image for games. The `questions` array invariant is exactly 5 elements; the factory default is an empty array but runtime validation enforces 5.
- **FR-006**: The `AppUser` type MUST include `id: number`, `displayName: string`, `roles: WPRole[]`, `isTriviaSmith: boolean`.
- **FR-007**: The `PluginSettings` type MUST include only `gamesPerPage: number` — this is the sole user-editable setting. A companion read-only `PluginInfo` type MUST include `version: string`, `wpMinimum: string`, and `phpMinimum: string`; it is returned by `GET /settings` alongside `PluginSettings` but is never written by `PUT /settings`.
- **FR-008**: `react-app/src/domain/factories/` MUST contain `createChoice()`, `createQuestion()`, and `createQuiz()` factory functions, each accepting optional partial overrides and returning a complete, valid domain object.
- **FR-009**: `createQuestion()` MUST always return exactly 4 choices in its `choices` array.
- **FR-010**: All factory functions MUST be tested with at least one unit test each; tests MUST run without any mocks (pure function inputs only).
- **FR-011**: `react-app/src/domain/transforms/` MUST contain `quiz.transforms.ts` exporting at least `sortByDateDesc` (sorts `Quiz[]` newest-first by `publishDate`). `question.transforms.ts` and the `index.ts` barrel are explicitly out of scope for Phase 0; they are deliverables of Phase 2.
- **FR-012**: `npx tsc --noEmit` run from `react-app/` MUST exit 0. The existing `tsconfig.json` (moved with the directory) MUST be updated in place: `strict: true` added, `include` paths corrected to cover `src/`, and any CRA-specific compiler options that cause errors under a standard `tsc` invocation removed. A full tsconfig overhaul (path aliases, Vite references) is deferred to Phase 1.
- **FR-013**: `wp-plugin/trail-trivia/trail-trivia.php` MUST contain a valid WordPress plugin header (Plugin Name, Description, Version, Requires at least, Requires PHP, Author).
- **FR-014**: `wp-plugin/trail-trivia/includes/` MUST contain stub files for: `class-post-type.php`, `class-rest-api.php`, `class-capabilities.php`, `class-settings.php`, `class-admin-ui.php`, `class-shortcode.php`, `class-cli-command.php` — each with an empty PHP class body.
- **FR-015**: `wp-plugin/trail-trivia/uninstall.php` MUST exist and be valid PHP.
- **FR-016**: Every `.php` file in `wp-plugin/` MUST pass `php -l` with no syntax errors.
- **FR-017**: The plugin MUST activate via WP-CLI (`wp plugin activate trail-trivia`) with exit code 0.
- **FR-018**: The WordPress debug log MUST contain zero new PHP notices, warnings, or fatal errors after plugin activation.

### Key Entities

- **Choice**: An answer option for a trivia question. Has a unique identifier and display text.
- **Question**: A single trivia question. Contains the question text, exactly 4 choices, the index of the correct choice, explanatory answer text, and an optional image with alt text and caption. Has no per-question tags.
- **Quiz**: A published or draft collection of exactly 5 questions. Belongs to a WordPress author. Has a publish date and zero or more quiz-level tags. Has no featured image.
- **AppUser**: A WordPress user with a role (contributor, author, editor, administrator) and a boolean flag `isTriviaSmith` indicating TriviaSmith permission.
- **PluginSettings**: User-editable plugin configuration. Contains only `gamesPerPage: number`.
- **PluginInfo**: Read-only plugin metadata (version, WP minimum, PHP minimum). Returned alongside PluginSettings by `GET /settings` but never writable.

---

## Success Criteria

- **SC-001**: 100% of Phase 0 deterministic shell test commands exit with code 0 (5 test blocks, every assertion green).
- **SC-002**: TypeScript compilation on the domain layer completes in under 10 seconds with zero errors on a standard developer machine.
- **SC-003**: All factory unit tests pass on the first run without any environment setup beyond `npm install`.
- **SC-004**: WordPress plugin activation produces zero entries in the debug log attributable to the Trail Trivia plugin.
- **SC-005**: A developer completing Phase 0 can immediately begin Phase 1 work without any manual cleanup or remediation step.

---

## Assumptions

- A local WordPress installation with WP-CLI is available for plugin activation tests.
- PHP 8.0 or higher is installed and available on `$PATH` as `php`.
- Node.js (LTS) and npm are installed; `npx` is available.
- `gmc-btv-trivia/` is renamed to `react-app/` via `git mv` (single atomic operation) to preserve per-file git history. No copy-then-delete.
- `WP_DEBUG` and `WP_DEBUG_LOG` are set to `true` in the local WordPress `wp-config.php` for the duration of Phase 0 testing.
- Factory functions use `uuid` (already a project dependency) to generate `id` values.
- Vitest is the test runner for factory unit tests (installed as part of this phase, ahead of the full Vite migration in Phase 1).
- Empty PHP stub classes do not need to implement any interface or extend any base class in this phase.

## Clarifications

### Session 2026-06-26

- Q: Should `gmc-btv-trivia/` be moved (git mv) or copied to `react-app/`? → A: `git mv gmc-btv-trivia react-app` — single atomic rename preserving full per-file git history.
- Q: Should the `AppUser` boolean field be `isTriviaSsmith` (as written in MIGRATION_PLAN.md) or `isTriviaSmith`? → A: `isTriviaSmith` (single S) — fixes the typo before any code is written. MIGRATION_PLAN.md must also be corrected.
- Q: Should `react-app/tsconfig.json` be replaced or updated in place for Phase 0 `tsc --noEmit` to pass? → A: Update in place — add `strict: true`, fix `include` paths, remove CRA-only options that error under plain `tsc`. Full overhaul (path aliases, Vite references) deferred to Phase 1.
- Q: Should Phase 0 include `question.transforms.ts` and the `index.ts` barrel in addition to `quiz.transforms.ts`? → A: `quiz.transforms.ts` only (`sortByDateDesc`). `question.transforms.ts` and barrel are Phase 2 deliverables.

### Session 2026-06-26 (prototype reconciliation)

- Q: Does the MIGRATION_PLAN.md update removing `Question.tags`, `Quiz.image`, and `PluginSettings.version` affect this spec? → A: Yes — FR-004, FR-005, FR-007, Key Entities, and User Story 1 Scenario 2 were all updated to reflect the removal of these fields. No new fields were added to Phase 0 scope.
