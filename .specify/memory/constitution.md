<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.2.0
Bump rationale: MINOR — new "Architecture" section added between Core Principles and
Technology Stack Constraints. No principles modified or removed.

Added sections:
  - Architecture (Monorepo Layout, React App Structure, WordPress Plugin Structure,
    Integration Boundary, Build Flow, Data Flow)

Modified principles: none
Removed sections: none

Templates requiring updates:
  ✅ .specify/memory/constitution.md (this file)
  ✅ .specify/templates/plan-template.md — Technical Context pre-filled with project defaults;
       Project Structure updated to reference monorepo layout
  ✅ .specify/templates/spec-template.md — Architecture Constraints note added to Requirements
  ✅ .specify/templates/tasks-template.md — [arch] task type added
  ⚠  .specify/templates/commands/*.md — no commands/ dir present; skip silently

Follow-up TODOs: none — all placeholders resolved.
-->

# GMC Burlington Trail Trivia Constitution

## Core Principles

### I. Functional Programming (NON-NEGOTIABLE)

All TypeScript source in `react-app/src/` MUST follow functional paradigms:

- **Immutability**: `const` everywhere; `let` is forbidden outside Redux reducer bodies and Vitest `it`/`describe` blocks.
  `var` is unconditionally banned.
- **No in-place mutation**: `.push()`, `.splice()`, `.sort()` (in-place), and direct index assignment are forbidden outside Redux reducers.
- **Ramda for transforms**: All data transforms (filter, map, sort, compose, etc.) MUST use `import * as R from 'ramda'`.
  Native Array methods that mutate are not a substitute.
- **Side-effect isolation**: Network calls and all I/O MUST live in `src/data/` or Redux thunks.
  Domain transforms and components MUST be pure.
- **No classes**: `class` declarations are forbidden in application code.
  Use plain data structures + factory functions instead.
- **Functional composition**: Prefer `R.compose` / `R.pipe` over nested imperative calls.

*Rationale*: Functional code is easier to test, reason about, and parallelize.
The current codebase already uses Ramda and Redux; this principle codifies and enforces what is already the intended direction.

### II. Layered Architecture & Component Discipline

The React app MUST maintain a strict three-layer separation:

| Layer | Location | Allowed | Forbidden |
|-------|----------|---------|-----------|
| Data | `src/data/` | `fetch`, `AbortController`, WP nonce headers | Business logic, UI |
| Domain | `src/domain/` | Types, factories, Ramda transforms | Side effects, UI |
| Presentation | `src/components/`, `src/features/` | React, Redux selectors/dispatch | Direct `fetch`, `console.log` |

Component rules (see Principles VII and VIII for detailed enforcement):
- **Smart** components (state + dispatch) MUST live in `src/features/`.
- **Dumb** components (props in, JSX out) MUST live in `src/components/`.
- **One component per file** — no multiple default exports.
- A Dumb component MUST NOT import from Redux or call `useDispatch`/`useSelector`.

WordPress Plugin rule: PHP MUST follow single-responsibility — each class and each public method has exactly one reason to change.
One class per file in `includes/`.

*Rationale*: Layer discipline is the main defence against the codebase collapsing into an
unstructured "smart everything" glob as features accumulate.

### III. Test Coverage (NON-NEGOTIABLE)

- Every `.ts` and `.tsx` file in `react-app/src/` MUST have a corresponding unit test file.
- Coverage gate: **lines ≥ 90%, branches ≥ 90%** — enforced by CI on every PR.
  PRs that drop either metric below 90% MUST NOT be merged.
- Test runner: **Vitest** (not Jest / react-scripts).
- Coverage provider: `@vitest/coverage-v8`.
- For WordPress plugin PHP: each `class-*.php` file MUST have at least a smoke test
  verifiable by WP-CLI (see MIGRATION_PLAN.md Phase tests).
- End-to-end gate: each migration phase ends with a block of deterministic shell commands
  documented in `MIGRATION_PLAN.md`. Phase MUST NOT close until all shell tests exit 0.
- See Principle X for the required TDD workflow that produces this coverage.

*Rationale*: The current codebase has minimal test coverage.
The 90% gate is the only reliable way to catch regressions introduced during the CRA→Vite
migration and the data-source swap (trivia.json → WP REST API).

### IV. Accessibility & Error Handling (NON-NEGOTIABLE)

**Accessibility**:
- All interactive elements MUST have an accessible name (visible text, `aria-label`, or
  `aria-labelledby`).
- All `<img>` elements MUST have a non-empty `alt` attribute (or `alt=""` if purely
  decorative, with intent documented inline).
- Choice button groups MUST use `role="group"` + `aria-labelledby` pointing at the question heading.
- Progress indicators MUST use `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- Screen changes MUST update `document.title` and move focus to the main content region.
- `@media (prefers-reduced-motion: reduce)` MUST suppress all framer-motion animations.
- axe-core CLI MUST report 0 critical/serious violations before any phase closes.
- WordPress admin UIs MUST meet the same ARIA / WCAG 2.1 AA standard.

**Error Handling**:
- No error may be silently swallowed. Every `catch` block MUST either:
  (a) dispatch a Redux error action that surfaces to the user, OR
  (b) re-throw for the nearest `ErrorBoundary` to catch.
- `console.log` is stripped from production builds via Vite `define`.
  `console.error` is retained and treated as a monitoring signal.
- PHP: all failures MUST return `WP_Error` with a descriptive `code` and `message`.
  `wp_die()` is reserved for fatal, unrecoverable errors only.
- REST API write endpoints MUST return HTTP 400 on malformed input with a
  machine-readable `code` field.

*Rationale*: Silent errors in a publicly-facing game erode trust with no trace for
debugging. Accessibility is non-negotiable for a community site that must serve all users.

### V. YAGNI & Simplicity

- **No code exists without a current requirement.** Speculative code, scaffolding "for later",
  and abstractions with one implementation are forbidden.
- **Deletion over addition.** If a requirement disappears, the code disappears with it.
- **Boring over clever.** Code that a colleague decodes at 3am is preferred over elegant
  one-liners that obscure intent.
- **No premature abstraction.** Three identical call-sites justify a helper; two do not.
- Ponytail mode is active: the shortest diff that satisfies the requirement wins.

*Rationale*: Trail Trivia is a focused community tool. Complexity accumulates faster than
it is removed; this principle is the primary defence.

### VI. Separation of Concerns

Every module, class, function, and component MUST have exactly one reason to change.

**TypeScript rules**:
- A function that validates AND persists AND logs MUST be split into three functions.
- Data fetching belongs in `src/data/` only.
- Data transforms belong in `src/domain/` only.
- Rendering belongs in `src/components/` or `src/features/` only.
- No file may import across non-adjacent layers (e.g. a component MUST NOT import
  directly from `src/data/`; it reaches data only through Redux state or a thunk).

**PHP rules**:
- Each `class-*.php` file encapsulates exactly one responsibility.
- No class mixes REST request handling with database persistence logic.
  `class-rest-api.php` delegates to helper functions or separate classes for persistence;
  it does not call `get_post_meta()` or `update_post_meta()` directly.
- No function both validates input AND writes to the database.

**Detection**:
- A function/class with more than one of {validate, persist, transform, render, log, fetch}
  in its body is a Separation of Concerns violation and MUST be refactored before merge.

*Rationale*: Single-responsibility makes every unit independently testable and replaceable.
It is the structural rule that makes Principles I–III achievable at scale.

### VII. Smart/Dumb Component Pattern

This principle provides the detailed enforcement rules for the high-level boundary
stated in Principle II.

**Smart components** (`src/features/`):
- Own Redux state: MUST use `useSelector` and/or `useDispatch`.
- Own business logic: call thunks, compute derived values from store state.
- May render markup directly or delegate entirely to Dumb children.
- Receive no data via props from a parent that already owns a Redux subscription
  (avoid prop-drilling store values through two Smart layers).

**Dumb components** (`src/components/`):
- Receive ALL data via props. Emit ALL events via callback props (`onXxx: () => void`).
- MUST NOT import from `src/store/`, `src/data/`, or `src/domain/`.
- MUST NOT call `useSelector`, `useDispatch`, or any Redux hook.
- MUST NOT call `useEffect` to fetch data — data arrives via props only.
- MAY use local `useState` for purely UI state (open/closed, hover, focus) with no
  business meaning.

**Enforcement**:
- Import linting (ESLint `no-restricted-imports` rule) configured to ban `src/store/**`,
  `src/data/**`, and `src/domain/**` from any file under `src/components/`.
- PR review MUST reject any Dumb component that imports outside its permitted scope.

*Rationale*: Without an enforced boundary, Dumb components acquire Redux dependencies
incrementally until every component is effectively Smart and none are independently testable.

### VIII. One Component Per File

- Every React component MUST live in its own file.
- A file MUST export exactly **one** default component.
- Named helper sub-components that are used only within that file are permitted as
  local `const` declarations in the same file but MUST NOT be exported (named or default).
- `index.ts` barrel files MAY re-export the default component for import convenience
  but MUST NOT define any component themselves.
- Co-located files (`.test.tsx`, `styles.module.css`) are permitted alongside the
  component file; they do not violate this rule.

**File naming**: component files use kebab-case (see Principle IX).
`QuizCard` lives in `quiz-card.tsx`, not `QuizCard.tsx` or `index.tsx`.

**Detection**:
- Any `.tsx` file with more than one `export default` statement is a violation.
- Any `index.ts` file containing JSX is a violation.

*Rationale*: One component per file makes grep, code review, and import tracing
unambiguous. It also prevents the "grab-bag component file" anti-pattern where
related but distinct components merge over time.

### IX. Naming Conventions

Consistent naming is non-optional. Reviewers MUST reject names that violate this
principle, treating them as blocking defects.

#### TypeScript / React

| Symbol | Convention | Example |
|--------|-----------|---------|
| Types and interfaces | `PascalCase` | `Quiz`, `Question`, `AppUser` |
| React components | `PascalCase` | `QuizCard`, `ChoiceButton` |
| Factory functions | `camelCase`, verb-noun | `createQuiz()`, `createChoice()` |
| Factory return values | `PascalCase` (they are domain types) | — |
| Variables and functions | `camelCase` | `publishDate`, `sortQuizzes()` |
| React hooks | `camelCase`, prefix `use` | `useAppSelector`, `useQuizState` |
| Redux selectors | `camelCase`, prefix `select` | `selectQuizzes`, `selectLatestQuiz` |
| Redux thunks | `camelCase`, verb-noun | `fetchGames`, `deleteGame` |
| Module-level constants | `SCREAMING_SNAKE_CASE` | `MAX_CHOICES`, `API_TIMEOUT_MS` |
| File names | `kebab-case` | `quiz-card.tsx`, `quiz.factory.ts` |
| Test files | mirror source + `.test.` | `quiz.factory.test.ts` |
| CSS Module files | `styles.module.css` | same filename for every component |

**No abbreviations** unless universally understood: `id`, `url`, `api`, `html`, `css` are
permitted. Everything else is spelled out: `question` not `q`, `publishDate` not `pubDt`.

#### PHP

| Symbol | Convention | Example |
|--------|-----------|---------|
| Class names | `PascalCase` with underscores for namespacing | `Trail_Trivia_REST_API` |
| Functions (public/global) | `snake_case`, prefixed `trail_trivia_` | `trail_trivia_register_cpt()` |
| Functions (private/internal) | `snake_case`, no prefix | `build_game_response()` |
| Variables | `snake_case` | `$game_id`, `$publish_date` |
| Constants | `SCREAMING_SNAKE_CASE`, prefixed `TRAIL_TRIVIA_` | `TRAIL_TRIVIA_VERSION` |
| File names | `class-kebab-case.php` | `class-rest-api.php`, `class-post-type.php` |

**No abbreviations** except those standard in WP core: `wp_`, `$post`, `$meta_key`.

*Rationale*: Consistent naming removes the cognitive load of remembering per-author
conventions and makes grep reliable: `grep -r "selectQuiz"` returns exactly what it should.

### X. Test-Driven Development

Tests are written before implementation for every non-trivial TypeScript unit.

**Workflow (Red → Green → Refactor)**:

1. Write the test. Run it. Confirm it **fails** (red) — a test that passes before
   implementation is a broken test.
2. Write the minimum production code to make the test pass (green).
3. Refactor — improve structure without changing behaviour; tests remain green.
4. Commit the test and implementation together in the same commit.

**Test file placement**: adjacent to source.

```
src/domain/factories/quiz.factory.ts
src/domain/factories/quiz.factory.test.ts   ← same directory
```

**Test naming**: describe behaviour, not implementation.

```ts
// CORRECT
it('returns quizzes sorted newest-first when publishDate differs')

// WRONG
it('tests sortQuizzes')
it('sortQuizzes works')
```

**Mock policy**:
- `src/domain/` units are pure functions — tested with **no mocks**.
  If a domain test needs a mock, the function has a Separation of Concerns violation (Principle VI).
- `src/data/` units are tested with **fetch mocks only** (MSW or `vi.fn()` on `fetch`).
- React components are tested with **`@testing-library/react`**. Enzyme is banned.
- Redux slices are tested by dispatching actions against the real reducer and asserting state.
  No mock store.

**PHP**:
- Each `class-*.php` file MUST have at least one WP-CLI-runnable smoke test documented
  in `MIGRATION_PLAN.md` for its phase.
- REST endpoint tests use `curl` against a running WP instance (see MIGRATION_PLAN.md phases).

*Rationale*: TDD is the only workflow that guarantees tests exist and are meaningful.
A test written after implementation tends to be written to pass, not to describe
requirements. Coupling TDD to Principle III (90% coverage gate) closes the loop.

## Architecture

This section documents the structural decisions that govern the entire project.
Deviations require a MINOR constitution amendment; they are not left to per-PR discretion.

### Monorepo Layout

```
/                               ← repo root
  react-app/                    ← Vite/React/TypeScript (player + TriviaSmith admin UI)
  wp-plugin/
    trail-trivia/               ← WordPress plugin
  MIGRATION_PLAN.md             ← phase-gated implementation driver
  .specify/                     ← spec-kit artifacts (constitution, specs, plans, tasks)
  prototype/                    ← static HTML design prototype (reference only)
```

The two application directories are independent build units.
Neither imports from the other. They communicate exclusively through the REST API
(see Integration Boundary below).

### React App Internal Structure

```
react-app/src/
  data/           ← API clients only. All fetch() calls. AbortController timeouts.
  domain/
    types/        ← Pure TypeScript types. No functions.
    factories/    ← createQuiz(), createQuestion(), createChoice(). Pure, no side effects.
    transforms/   ← Ramda-based sort/filter/normalize. Pure, no side effects.
  store/
    games/        ← games.slice.ts, games.selectors.ts, games.thunks.ts
    session/      ← session.slice.ts, session.selectors.ts (active quiz + score)
    index.ts      ← configureStore export
  components/     ← Dumb/presentational. No Redux. No src/data imports.
  features/       ← Smart/stateful. useSelector, useDispatch, thunk calls.
  app/            ← App.tsx, router.tsx, ErrorBoundary.tsx. Root wiring only.
```

Layer import rule (enforced by ESLint `no-restricted-imports`):

```
data      → (no imports from project src)
domain    → (no imports from project src)
store     → data, domain
components → (no imports from store, data, domain)
features  → store, domain, components
app       → features, components, store
```

No layer may import from a layer above it. `components/` is the sole exception to
the vertical stack — it imports nothing except React and its own CSS modules.

### WordPress Plugin Internal Structure

```
wp-plugin/trail-trivia/
  trail-trivia.php          ← Plugin header + bootstrap (require_once all includes/)
  uninstall.php             ← Removes caps, options, CPT data on uninstall
  includes/
    class-post-type.php     ← CPT trail_trivia_game + trivia_tag taxonomy registration
    class-rest-api.php      ← REST route registration + request handlers;
                               delegates all get_post_meta/update_post_meta calls
                               to helper functions — does NOT call them inline
    class-capabilities.php  ← manage_trail_trivia cap definition + Users screen UI
    class-settings.php      ← register_setting(), sanitization, settings page render
    class-admin-ui.php      ← wp_enqueue_script() for admin bundle + WP admin menu item
    class-shortcode.php     ← [trail_trivia] shortcode + wp_enqueue_script() for player
    class-cli-command.php   ← WP-CLI: wp trail-trivia import <file>
  assets/
    player/                 ← Built React player bundle (index.js, index.css)
    admin/                  ← Built React admin bundle (index.js, index.css)
  templates/
    shortcode.php           ← <div id="trail-trivia-root"> + window.trailTriviaConfig inject
    admin-page.php          ← <div id="trail-trivia-admin-root"> + config inject
  languages/
    trail-trivia.pot        ← Translation template
```

One class per file. No class touches more than one of {routing, persistence, capability,
settings, asset-loading}. See Principle VI.

### Integration Boundary

The React applications and the PHP plugin communicate **exclusively** through the
WP REST API at `/wp-json/trail-trivia/v1/`.

Rules that MUST NOT be violated:

- PHP MUST NOT render React JSX or inline application state as HTML.
- React MUST NOT `require()` or `import` any PHP file or WP global directly.
- The plugin injects **one** configuration object per page load via an inline `<script>`
  in the PHP template:
  ```php
  wp_add_inline_script(
      'trail-trivia-player',
      'window.trailTriviaConfig = ' . wp_json_encode([
          'apiBase' => rest_url('trail-trivia/v1'),
          'nonce'   => wp_create_nonce('wp_rest'),
      ]) . ';',
      'before'
  );
  ```
- Everything beyond `apiBase` and `nonce` crosses the REST boundary as JSON.
- The REST API response shape MUST match the `Quiz` TypeScript type exactly
  (field names, casing, nesting). No client-side field remapping.

### Build Flow

```
react-app/          →  npm run build:player  →  wp-plugin/trail-trivia/assets/player/
react-app/          →  npm run build:admin   →  wp-plugin/trail-trivia/assets/admin/
```

- Two independent Vite builds produce `index.js` + `index.css` bundles.
- Bundles are **committed** to `assets/` in the plugin directory so the plugin ships
  as a self-contained directory with no Node.js dependency at runtime.
- The plugin enqueues both via `wp_enqueue_script()` / `wp_enqueue_style()`.
  No inline `<script src>` tags in PHP templates.
- Node.js is a **build-time** dependency only. WordPress hosts require no Node.js.

### Data Flow

**Player (read path)**:
```
Player browser
  → GET /wp-json/trail-trivia/v1/games
  → class-rest-api.php  (permission: public)
  → get_posts() + get_post_meta()
  → JSON response (Quiz[])
  → Redux games slice
  → React feature components → dumb components → DOM
```

**TriviaSmith (write path)**:
```
TriviaSmith browser
  → POST/PUT/DELETE /wp-json/trail-trivia/v1/games/{id}
    (X-WP-Nonce header)
  → class-rest-api.php
    → wp_verify_nonce()
    → current_user_can('manage_trail_trivia')
    → sanitize inputs
    → wp_insert_post() / wp_update_post() / wp_delete_post()
    → update_post_meta('_trivia_questions', ...)
  → JSON response (Quiz | WP_Error)
  → Redux games slice update
  → Admin UI re-render
```

## Technology Stack Constraints

These choices are locked for the life of the current migration. Amendments require a
MAJOR version bump and a documented migration plan.

### React Application

| Concern | Mandated choice | Banned alternatives |
|---------|----------------|---------------------|
| Build tool | Vite 5.x | react-scripts (CRA), webpack (standalone) |
| Language | TypeScript 5.x | plain JS |
| State | Redux Toolkit 2.x + react-redux 9.x | MobX, Zustand, Context-only |
| Routing | React Router 6.x | React Router 5.x, Next.js |
| Data transforms | Ramda 0.30.x | Lodash, native Array mutation |
| Styling | Plain CSS + CSS Modules | Tailwind, styled-components, Emotion, any CSS-in-JS |
| Animation | framer-motion 11.x | GSAP, anime.js, CSS-in-JS animations |
| Test runner | Vitest | Jest, react-scripts test |
| Coverage | @vitest/coverage-v8 | Istanbul (standalone) |

### WordPress Plugin (PHP)

| Concern | Mandated choice |
|---------|----------------|
| Data storage | Custom Post Type `trail_trivia_game` + post meta — no custom tables |
| API | WP REST API under `/wp-json/trail-trivia/v1/` |
| PHP minimum | 8.0 |
| WP compatibility | 6.4 and 6.5 (last two major versions) |
| Security | `wp_verify_nonce()` on all writes; `current_user_can()` before mutations; `sanitize_text_field()` / `wp_kses_post()` on all inputs; `esc_html()` / `esc_attr()` on all outputs |
| Asset loading | `wp_enqueue_script()` + `wp_enqueue_style()` — no inline `<script>` dumps |

## WordPress Plugin Constraints

The following rules apply exclusively to `wp-plugin/trail-trivia/` and
govern how the plugin integrates with WordPress core:

1. **Backward compatibility**: Plugin MUST activate and operate correctly on WP 6.4 and WP 6.5.
   Breaking changes to WP core behavior in these versions MUST be handled with version detection.
2. **Capability model**: A single custom capability `manage_trail_trivia` gates all game CRUD.
   Administrators always pass this check without needing the explicit grant.
   No other custom capabilities are introduced.
3. **No front-end routing changes**: The player React app uses `HashRouter`.
   The plugin MUST NOT register any WP rewrite rules for the player.
4. **Idempotent activation**: Plugin activation and deactivation MUST be safe to run multiple
   times with no duplicate data, no orphan capabilities, and no PHP warnings in `debug.log`.
5. **WP-CLI import**: The migration command `wp trail-trivia import <file>` MUST be idempotent
   (re-running skips already-imported games) and MUST report `Imported: N, Skipped: M, Failed: 0`.
6. **No custom tables**: All data lives in WP posts + post meta.
   This trades some query flexibility for zero schema migration burden.

## Quality Gates & Development Workflow

Every pull request MUST pass all of the following before merge:

1. **TypeScript**: `npx tsc --noEmit` exits 0.
2. **FP lint**: `grep -rn "\bvar\b\|\blet\b" src/` (excluding reducers and test blocks) returns 0 lines. *(Principle I)*
3. **Import lint**: No file under `src/components/` imports from `src/store/`, `src/data/`, or `src/domain/`. *(Principle VII)*
4. **One component per file**: No `.tsx` file has more than one `export default`. *(Principle VIII)*
5. **Tests red-first**: PR description MUST confirm tests were observed failing before implementation. *(Principle X)*
6. **Tests green**: `npm run test -- --run` exits 0. *(Principles III, X)*
7. **Coverage**: lines ≥ 90%, branches ≥ 90% (verified via `coverage/coverage-summary.json`). *(Principle III)*
8. **Accessibility**: `npx axe-core-cli http://localhost:<port> --exit` returns 0 violations. *(Principle IV)*
9. **Naming**: All new symbols follow Principle IX (kebab-case files, PascalCase types,
   camelCase functions, `trail_trivia_` PHP prefix). Reviewed manually.
10. **PHP syntax**: `find wp-plugin -name "*.php" -exec php -l {} \;` reports no syntax errors.
11. **Phase shell tests**: All deterministic tests in the relevant `MIGRATION_PLAN.md` phase exit 0.

Development follows the 7-phase sequence in `MIGRATION_PLAN.md`.
No phase begins before its predecessor's shell tests pass.
The spec-kit workflow (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`)
MUST be used to drive implementation within each phase.

## Governance

- This constitution supersedes all other written or verbal practices.
- All code review MUST verify compliance with Principles I–X before approval.
- Amendments:
  - **MAJOR** (e.g. removing a principle, changing a mandated technology): requires written
    rationale, team approval, and a migration plan committed alongside the amendment.
  - **MINOR** (e.g. adding a principle or material expansion of guidance): requires written
    rationale committed alongside the amendment.
  - **PATCH** (e.g. wording clarification, typo): no approval required; amend and increment.
- Complexity introduced in violation of Principle V MUST be justified in the PR description
  with a specific current requirement it satisfies.
- Runtime development guidance lives in `MIGRATION_PLAN.md`.
  When this constitution and the migration plan conflict, the constitution wins.

**Version**: 1.2.0 | **Ratified**: 2026-06-26 | **Last Amended**: 2026-06-26
