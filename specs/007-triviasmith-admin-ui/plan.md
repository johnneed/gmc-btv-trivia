# Implementation Plan: TriviaSmith Admin UI

**Branch**: `007-triviasmith-admin-ui` | **Date**: 2026-06-26 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/007-triviasmith-admin-ui/spec.md`

## Summary

Phase 5 delivers a full React SPA embedded in the WP admin: game list (filterable, searchable, paginated), game editor (accordion, image preview, lightbox, drag-to-reorder, publish gate, autosave, preview modal), and settings page (TriviaSmith access grant/revoke, gamesPerPage, About). Two parallel workstreams: (A) the React admin app at `react-app/src/admin/` with its own Redux store and Vite build, and (B) the PHP wiring (`class-admin-ui.php`, WP menu registration, asset enqueueing). The preview modal shares player source components from `src/features/` via a mini seeded Redux store.

## Technical Context

**Language/Version**: TypeScript 5.x · PHP 8.0+ · WordPress 6.4–6.5

**Primary Dependencies**: Vite 5 · React 18 · Redux Toolkit 2 · React Router 6 · `@dnd-kit/core` + `@dnd-kit/sortable` (NEW)

**Storage**: No new WP storage — uses existing CPT + REST API from Phase 4. Admin Redux store is in-memory only.

**Testing**: WP-CLI + curl integration tests · axe-core audit · browser smoke tests

**Architecture layers**: `react-app/src/admin/` (new React SPA) · `wp-plugin/trail-trivia/includes/class-admin-ui.php` · minor addition to `class-rest-api.php` (pagination)

## Constitution Check

*GATE: Must pass before opening the implementation PR.*

- [ ] **I. FP** — Admin Redux slices: no `let`/`var` outside reducers; Ramda for transforms.
- [ ] **II. Layered Architecture** — Admin REST calls in `src/admin/data/`; admin Smart in `src/admin/features/`; admin Dumb in `src/admin/components/`; preview imports player features read-only.
- [ ] **III. Test Coverage** — Existing ≥ 90% threshold maintained on `src/domain/`, `src/store/`, `src/components/`, `src/features/`. Every `.ts`/`.tsx` file in `src/admin/` MUST have a corresponding unit test file (Constitution Principle III is unconditional). `src/admin/` is excluded from the existing Vitest threshold configuration but test files are still required per-file; they will be added to coverage reporting in a follow-up.
- [ ] **IV. Accessibility** — axe-core 0 violations on game list + settings; dnd-kit `KeyboardSensor` provides keyboard drag; all interactive elements have accessible names.
- [ ] **V. YAGNI** — No multi-user conflict resolution; no undo/redo; no Phase 6 shortcode changes.
- [ ] **VI. Separation of Concerns** — `class-admin-ui.php` handles only menu + enqueue; REST pagination change is additive-only.
- [ ] **VII. Smart/Dumb** — Admin feature components (Smart) in `features/`; reusable components (Dumb) in `components/`; no Redux in Dumb.
- [ ] **VIII. One Component Per File** — Admin components follow same rule as player.
- [ ] **IX. Naming** — PHP: `Trail_Trivia_Admin_UI`; `trail_trivia_` prefix; `TRAIL_TRIVIA_` constants. TypeScript: all component files use **kebab-case** (`game-list.tsx`, `question-card.tsx`, `publish-sidebar.tsx`, etc.) per Principle IX — PascalCase filenames are a blocking defect in PR review.
- [ ] **X. TDD** — Every non-trivial admin TypeScript unit has a paired unit test file written before implementation (red → green → refactor). See tasks.md for `T-test` tasks inserted before each implementation task.
- [ ] **Phase shell tests** — All MIGRATION_PLAN.md Phase 5 commands exit 0.

## Project Structure

### Documentation

```text
specs/007-triviasmith-admin-ui/
├── plan.md, research.md, data-model.md
├── contracts/admin-ui.md
├── quickstart.md
└── tasks.md
```

### Source Code Changes

```text
react-app/
  package.json                    ← add build:admin; add @dnd-kit/* deps
  vite.admin.config.ts            ← CREATE: ESM build → assets/admin
  src/
    admin/
      index.tsx                   ← entry point
      App.tsx                     ← HashRouter + routes
      store/                      ← games, editor, settings slices
      features/
        game-list/
        game-editor/
        settings/
        preview/                  ← mini player store + player component import
      components/
        question-card/
        image-preview/ + Lightbox
        tag-input/
        publish-sidebar/
        confirmation-dialog/
      data/admin-api.ts           ← all REST calls

wp-plugin/trail-trivia/
  trail-trivia.php                ← add Trail_Trivia_Admin_UI bootstrap
  templates/admin-page.php        ← CREATE: mount point
  assets/admin/.gitkeep           ← CREATE
  assets/admin/index.js           ← GENERATE
  assets/admin/index.css          ← GENERATE
  includes/
    class-admin-ui.php            ← IMPLEMENT: stub → full
    class-rest-api.php            ← MODIFY: pagination on GET /games/all
```

## Implementation Order

### Track A — Build Infrastructure (start immediately; parallel with Track B)

1. `npm install @dnd-kit/core @dnd-kit/sortable`
2. Create `react-app/vite.admin.config.ts` — ESM, `outDir: '../wp-plugin/trail-trivia/assets/admin'`, `copyPublicDir: false`, `esbuild.drop: ['console']`
3. Add `"build:admin"` to `react-app/package.json`
4. Create `wp-plugin/trail-trivia/assets/admin/.gitkeep`
5. Create stub `react-app/src/admin/index.tsx` — minimal React mount; gate: `npm run build:admin` exits 0

### Track B — PHP Wiring (parallel with Track A)

6. Create `wp-plugin/trail-trivia/templates/admin-page.php` — `<div class="wrap"><div id="trail-trivia-admin-root"></div></div>`
7. Implement `Trail_Trivia_Admin_UI` in `class-admin-ui.php` — `register()` on `admin_menu`, `enqueue_scripts()` on `admin_enqueue_scripts`
8. Wire `Trail_Trivia_Admin_UI` into `trail-trivia.php` bootstrap
9. Add `page` + `per_page` pagination to `GET /games/all` in `class-rest-api.php`; add `X-WP-Total` response header
10. PHP syntax check gate

### Track C — Admin Data Layer + Redux Store (requires Track A step 5)

11. Create `src/admin/data/admin-api.ts` — all REST functions using `window.trailTriviaAdminConfig`
12. Create `src/admin/store/` — `games.slice.ts`, `editor.slice.ts`, `settings.slice.ts`, `store/index.ts`

### Track D — Game List (requires Track C)

13. `game-list.tsx` — table, filter tabs, submit-triggered search, numbered pagination
14. Connect to Redux `games` slice; thunks call `admin-api.ts`
15. Row actions: Edit (navigate to editor), Trash (confirmation then delete)
16. "Add New Game" button

### Track E — Admin Shared Components (parallel with Track D)

17. `question-card.tsx` — collapsed preview + expanded form fields
18. `image-preview.tsx` — 160×120 thumbnail on `onInput`
19. `lightbox.tsx` — full-screen overlay; closes on click-outside / Escape / ×
20. `tag-input.tsx` — chip input
21. `publish-sidebar.tsx` — status, date, author, Save Draft, Publish/Update (gated), Trash icon, Preview button
22. `confirmation-dialog.tsx` — modal confirm/cancel

### Track F — Game Editor (requires Tracks C + E)

23. `game-editor.tsx` — title, subtitle, 5-card dnd-kit sortable accordion, PublishSidebar, TagInput, autosave `setInterval`
24. Wire `editor.slice.ts` — load game, sync form state, compute `publishGateOpen` via `isComplete()`
25. `preview-modal.tsx` — mini store seeded from `editor.game`, mounts player components in isolated `<Provider>` + `<MemoryRouter>`
26. Autosave implementation — 60s interval, POST on new game / PUT on existing

### Track G — Settings Page (parallel with Track F)

27. `settings-page.tsx` with 3 panels:
    - General: `gamesPerPage` input + save
    - TriviaSmith Access: grant/revoke table, error on unknown username, "Always Active" for Admins
    - About: read-only version/compatibility info

### Track H — Accessibility + Final Build

28. Add ARIA attributes throughout; verify dnd-kit `KeyboardSensor` keyboard activation
29. Run `npm run build:admin` — final build; commit `assets/admin/index.js` and `index.css`
30. Axe audit: 0 violations on game list and settings pages
31. Full MIGRATION_PLAN.md Phase 5 deterministic test block — all exit 0

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| `@dnd-kit/core` + `@dnd-kit/sortable` (new dependencies) | Drag-to-reorder with keyboard accessibility (FR-032, FR-013); cannot achieve with HTML5 DnD alone | HTML5 DnD has no keyboard support; `react-beautiful-dnd` is deprecated |
| Mini Redux store for preview (non-trivial pattern) | Player Smart components use `useSelector` — preview needs them rendering with editor form state | Refactoring player to Dumb is a large cross-phase change; iframe cannot show unsaved state |
| ESM admin bundle (requires `wp_script_add_data`) | Admin SPA size + code splitting benefit; IIFE disables Rollup splitting | IIFE produces 1 large file; WP 6.4+ supports `type="module"` natively |
