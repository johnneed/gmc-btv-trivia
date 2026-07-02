# Copilot Instructions — GMC BTV Trail Trivia

## Repository Overview

This is a **WordPress plugin + React SPA** project. The plugin (`wp-plugin/trail-trivia/`) provides a custom post type, REST API, and shortcode. The React app (`react-app/`) builds two separate bundles — a **player** (public quiz viewer) and an **admin** (TriviaSmith editor) — that are deployed into the plugin's `assets/` folder.

## Commands

All commands run from `react-app/`.

| Purpose | Command |
|---|---|
| Dev server | `npm start` |
| Test (watch) | `npm test` |
| Test (run once) | `npm run test -- --run` |
| Test single file/dir | `npm run test -- --run src/domain` or `vitest run path/to/file.test.ts` |
| Test with coverage | `npm run test:coverage` |
| Domain tests only | `npm run test:domain` |
| Lint | `npm run lint` |
| Build both bundles | `npm run build:player && npm run build:admin` |

Build outputs go directly into `wp-plugin/trail-trivia/assets/player/` and `wp-plugin/trail-trivia/assets/admin/` (flat: `index.js` + `index.css`).

## Architecture

### Two separate React apps

- **Player** (`src/index.tsx` entry): public-facing quiz. Uses `src/app/store.ts` (Redux: `loader` + `score` slices). Bundled as IIFE for embedding via WP shortcode.
- **Admin** (`src/admin/index.tsx` entry): TriviaSmith editor. Has its own Redux store at `src/admin/store/index.ts` (slices: `gamesAdmin`, `editor`, `settingsAdmin`). Separate Redux store — do not mix with player store.

### Domain layer (`src/domain/`)

Pure TypeScript, zero React/Redux dependencies:
- `types/` — canonical types: `Quiz`, `Question`, `Choice`, `MediaAttachment`, `AppUser`, `PluginSettings`
- `factories/` — `createQuiz()`, `createQuestion()`, `createChoice()` — use these when creating new objects, never construct raw literals
- `transforms/` — pure Ramda pipelines (sorting, filtering, validation). `isComplete(question)` gates publish.

### Data layer

- **Player**: `src/data/trivia-api.ts` — public WP REST endpoints (no auth)
- **Admin**: `src/admin/data/admin-api.ts` — authenticated REST endpoints via `X-WP-Nonce`. Config injected by PHP into `window.ttAdmin` (falls back to `window.trailTriviaAdminConfig`).

### WordPress plugin (`wp-plugin/trail-trivia/`)

PHP 8.0+, WordPress 6.4+. Key classes:
- `class-post-type.php` — registers `trail_trivia` CPT + `trivia_image_type` attachment taxonomy
- `class-rest-api.php` — all REST routes under `/trail-trivia/v1/`; `Trail_Trivia_Capabilities::manage_trail_trivia` permission required for write operations
- `class-settings.php`, `class-shortcode.php`, `class-admin-ui.php`

Games are stored as WP posts with questions serialized as JSON in `_trivia_questions` post meta. PHP resolves `answerImageId` → URL on every GET response.

## Key Conventions

### Functional programming (strict)
- No `let`/`var` in TypeScript — use `const` only
- No in-place mutation — use spread or Ramda
- No new classes in TypeScript
- Ramda (`R.*`) for data transforms, not hand-rolled loops

### Component architecture (smart/dumb split)
- **Dumb components** (in `src/components/` and `src/admin/components/`) receive all data via props — zero Redux imports
- **Smart components** / feature pages own Redux `dispatch` and selectors
- One component per file; component folder name matches file name (e.g., `answer-image-uploader/answer-image-uploader.tsx`)

### Redux slices
- All API calls live in `*-api.ts` data files, not inside components
- Thunks live in slice files alongside their reducers
- Selectors are named `select*` and exported from slice files

### Testing (Vitest + @testing-library/react)
- Test files: `*.test.ts` / `*.test.tsx` / `*.spec.ts`
- Domain tests use **no mocks** — pure function inputs/outputs only
- Coverage thresholds: **90% lines + 90% branches** for `src/domain/`, `src/features/`, `src/components/`, `src/store/`
- `src/app/**` (root wiring) excluded from 90% gate
- Run `npm run test:coverage` to verify thresholds

### Quiz rules (domain constraints)
- A quiz has exactly **5 questions** to be publishable
- A question has exactly **4 choices**
- `isComplete(question)` from `src/domain/transforms/question.transforms.ts` is the canonical completeness check
- `publishGateOpen` in editor state reflects `game.questions.length === 5 && game.questions.every(isComplete)`

### Formatting
- Double quotes for strings (ESLint enforced)
- Semicolons required
- Prettier runs on pre-commit via husky + lint-staged

### Specs / feature work
Active feature specs live in `specs/<NNN>-feature-name/`. Each spec folder has `plan.md`, `spec.md`, `tasks.md`. The current active spec is referenced in `CLAUDE.md`.
