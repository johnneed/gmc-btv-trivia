# Tasks: TriviaSmith Admin UI

**Input**: Design documents from `specs/007-triviasmith-admin-ui/`

**Prerequisites**: plan.md ✓ · spec.md ✓ · research.md ✓ · data-model.md ✓ · contracts/admin-ui.md ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no incomplete dependencies)
- **[Story]**: US1–US5 (maps to spec.md user stories)
- All paths relative to repo root

---

## Phase 1: Setup — Build Infrastructure

**Purpose**: `npm run build:admin` produces `assets/admin/index.js`. Blocks all admin React work.

- [x] T001 Install `@dnd-kit/core` and `@dnd-kit/sortable` — run `npm install @dnd-kit/core @dnd-kit/sortable` in `react-app/`
- [x] T002 Create `react-app/vite.admin.config.ts` — ESM format (default, no `format:'iife'`), `build.outDir: '../wp-plugin/trail-trivia/assets/admin'`, `build.copyPublicDir: false`, `build.rollupOptions.input: 'src/admin/index.tsx'`, `build.rollupOptions.output.entryFileNames: 'index.js'`, `build.rollupOptions.output.assetFileNames: 'index[extname]'`, `esbuild.drop: ['console']`; same plugins block as `vite.config.ts`
- [x] T003 Add `"build:admin": "vite build --config vite.admin.config.ts"` to `react-app/package.json` scripts
- [x] T004 Create `wp-plugin/trail-trivia/assets/admin/.gitkeep`
- [x] T005 Create stub `react-app/src/admin/index.tsx` — minimal: `import React from 'react'; import { createRoot } from 'react-dom/client'; const el = document.getElementById('trail-trivia-admin-root'); if (el) createRoot(el).render(<div>Admin</div>);`
- [x] T006 Gate — run `npm run build:admin` in `react-app/`; must exit 0; confirm `wp-plugin/trail-trivia/assets/admin/index.js` exists

**Checkpoint**: Admin bundle builds. Assets directory committed.

---

## Phase 2: Foundational — PHP Wiring + Admin Data Layer

**Purpose**: WP admin menu registered; admin page renders mount point; REST pagination added; admin Redux store and API client in place. Blocks all story phases.

**⚠️ CRITICAL**: T018 (browser integration gate, Phase 3) requires a running WordPress + WP-CLI. T012 (Redux store), T013 (admin-api.ts), and T014 (App shell) are pure TypeScript and do NOT require WordPress.

- [x] T007 [P] Create `wp-plugin/trail-trivia/templates/admin-page.php` — content: `<div class="wrap"><div id="trail-trivia-admin-root"></div></div>`
- [x] T008 [P] Implement `Trail_Trivia_Admin_UI` in `wp-plugin/trail-trivia/includes/class-admin-ui.php` — add: `register()` method called on `admin_menu` that calls `add_menu_page('Trail Trivia', 'Trail Trivia', 'manage_trail_trivia', 'trail-trivia', [$this,'render_page'])` and two `add_submenu_page()` calls (All Games with `manage_trail_trivia`, Settings with `manage_options`); `render_page()` includes `TRAIL_TRIVIA_PLUGIN_DIR.'templates/admin-page.php'`; `enqueue_scripts($hook)` method: returns early if `$hook` is not a trail-trivia page, calls `wp_enqueue_script('trail-trivia-admin', TRAIL_TRIVIA_PLUGIN_URL.'assets/admin/index.js', [], TRAIL_TRIVIA_VERSION, true)`, calls `wp_script_add_data('trail-trivia-admin', 'type', 'module')`, calls `wp_add_inline_script()` to inject `window.trailTriviaAdminConfig`, calls `wp_enqueue_style('trail-trivia-admin', TRAIL_TRIVIA_PLUGIN_URL.'assets/admin/index.css', [], TRAIL_TRIVIA_VERSION)`
- [x] T009 [P] Wire `Trail_Trivia_Admin_UI` in `wp-plugin/trail-trivia/trail-trivia.php` — `Trail_Trivia_Admin_UI::register()` should hook BOTH `admin_menu` and `admin_enqueue_scripts` internally (single responsibility); then one line in the `init` closure suffices: `(new Trail_Trivia_Admin_UI())->register();`; no separate `add_action` call in `trail-trivia.php`
- [x] T010 [P] Add pagination to `GET /games/all` in `wp-plugin/trail-trivia/includes/class-rest-api.php` — update `get_all_games_handler()`: read `page` (default 1) and `per_page` (default from settings) from `$request->get_param()`; apply `'posts_per_page' => $per_page, 'paged' => $page` to `WP_Query`; add `$response->header('X-WP-Total', $query->found_posts)` and `$response->header('X-WP-TotalPages', $query->max_num_pages)` to the response
- [x] T011 PHP syntax check — `find wp-plugin/trail-trivia -name "*.php" -exec php -l {} \;`; all "No syntax errors"
- [x] T012 [P] Create admin Redux store — `react-app/src/admin/store/index.ts` (configureStore with games, editor, settings reducers); `react-app/src/admin/store/games/games.slice.ts` (GamesAdminState: items, total, page, perPage, statusFilter, searchQuery, status); `react-app/src/admin/store/editor/editor.slice.ts` (EditorState: game, savedGame, isDirty, autosaveStatus, autosaveTimestamp, publishGateOpen); `react-app/src/admin/store/settings/settings.slice.ts` (SettingsAdminState: gamesPerPage, version, wpMinimum, phpMinimum, TriviaSmiths, status)
- [x] T013 Create `react-app/src/admin/data/admin-api.ts` — implement: `fetchAllGames(page, perPage, statusFilter, searchQuery)` → `GET /games/all?page=&per_page=&status=&search=`; `createGame(data)` → `POST /games`; `updateGame(id, data)` → `PUT /games/{id}`; `patchGame(id, fields)` → `PATCH /games/{id}`; `deleteGame(id)` → `DELETE /games/{id}`; `fetchSettings()` → `GET /settings` (returns `gamesPerPage`, `version`, etc.); `updateSettings(data)` → `PUT /settings`; `fetchTriviaSmiths()` → `GET /settings/access` (dedicated endpoint — H2 decision: embed list in separate endpoint rather than polluting settings response); `grantAccess(username)` → `POST /settings/access`; `revokeAccess(userId)` → `DELETE /settings/access/{userId}`; all functions read `window.trailTriviaAdminConfig.apiBase` and `nonce`
- [x] T014 [P] Create admin App shell — `react-app/src/admin/App.tsx` (HashRouter with routes: `/` → GameList, `/games/new` → GameEditor, `/games/:id/edit` → GameEditor, `/settings` → SettingsPage); update `react-app/src/admin/index.tsx` to mount `<Provider store={adminStore}><App/></Provider>`

> **Note on grant/revoke endpoints**: `grantAccess` and `revokeAccess` require two new REST endpoints in `class-rest-api.php`: `POST /settings/access` (body: `{username}`) and `DELETE /settings/access/{userId}`. These must be registered in `register_routes()` during Track B.

**Checkpoint**: PHP wiring done; admin Redux store and API client exist; `npm run build:admin` still exits 0 with the expanded admin app.

---

## Phase 3: User Story 1 — TriviaSmith Finds and Acts on Games (P1) 🎯 MVP

**Goal**: TriviaSmith sees the game list with filter tabs, submit-triggered search, paginated table, and row actions. Non-TriviaSmith sees no menu.

**Independent test**: Navigate to Trail Trivia → All Games as TriviaSmith. Filter by Draft — only drafts show. Search for partial title — correct games appear. Hover a row — Edit and Trash actions visible. Click Add New Game — editor opens. Log in as non-TriviaSmith — no menu visible.

- [x] T015 [US1] Create `react-app/src/admin/features/game-list/game-list.tsx` — table with columns (Title+Subtitle, Status badge, Question count, Author, Date); status filter tabs (All/Published/Draft) that set `games.statusFilter` in Redux; submit-triggered search input + button that sets `games.searchQuery`; numbered pagination controls; "Add New Game" button that navigates to `#/games/new`
- [x] T016 [US1] Connect `game-list.tsx` to Redux `games` slice — `fetchGamesThunk` dispatches `fetchAllGames(page, perPage, statusFilter, searchQuery)` from `admin-api.ts`; results populate `games.items`, `games.total`, `games.page`
- [x] T017 [US1] Add row actions to `game-list.tsx` — on row hover, show "Edit" link (navigate to `#/games/{id}/edit`) and "Trash" action (dispatches `deleteGame(id)` thunk after confirmation dialog; removes row from list on success)
- [x] T018 [US1] Gate — WP: as TriviaSmith, `curl -s http://localhost/wp-admin/admin.php?page=trail-trivia` returns HTML with `trail-trivia-admin-root`; as Contributor (no cap), no Trail Trivia menu visible; game list renders in browser with filter tabs and pagination

**Checkpoint**: Game list works end-to-end for TriviaSmith. Capability gate enforced.

---

## Phase 4: User Story 2 — TriviaSmith Creates and Edits Game Content (P2)

**Goal**: Game editor has title, subtitle, 5-question accordion (draggable, image preview, lightbox), tag input, and ← All Games navigation.

**Independent test**: Create new game, expand question 1, paste image URL — thumbnail appears. Click thumbnail — lightbox opens. Press Escape — closes. Drag question 3 above question 2 — renumbers 01–05. Add "hiking" tag — chip appears. Remove tag. Click ← All Games — returns to list.

### Shared components (parallel — different files)

- [x] T019 [P] [US2] Create `react-app/src/admin/components/question-card/question-card.tsx` — accordion item: collapsed shows question text preview + correct answer preview; expanded shows question text input, 4 choice inputs with radio for correct answer, answer explanation input, optional image URL input, image alt text input, image caption input; props: `question: Question`, `index: number`, `onChange: (q: Question) => void`, `onMove: (from: number, to: number) => void`
- [x] T020 [P] [US2] Create `react-app/src/admin/components/image-preview/image-preview.tsx` — renders a 160×120 px `<img>` when URL prop is non-empty; uses `onError` to show broken-image state; update fires on every `onInput` event from the URL field (passed as prop `url: string`); no debounce — updates on each keystroke
- [x] T021 [P] [US2] Create `react-app/src/admin/components/lightbox/lightbox.tsx` — full-screen overlay renders when `open: boolean` prop is true; shows `<img>` at natural size (max viewport); closes when: user clicks outside image, presses Escape (keydown listener), or clicks the `×` button; prop: `src: string`, `alt: string`, `onClose: () => void`; uses `role="dialog"` and `aria-modal="true"`; separate from `image-preview/` directory (M4 fix: lightbox is a standalone reusable component)
- [x] T022 [P] [US2] Create `react-app/src/admin/components/tag-input/tag-input.tsx` — chip input: typing and pressing Enter adds a chip to `tags: string[]`; clicking chip's × removes it; props: `tags: string[]`, `onChange: (tags: string[]) => void`; each chip has `role="listitem"` and × has `aria-label="Remove {tag}"`
- [x] T023 [P] [US2] Create `react-app/src/admin/components/confirmation-dialog/confirmation-dialog.tsx` — modal dialog; props: `open: boolean`, `message: string`, `onConfirm: () => void`, `onCancel: () => void`; uses `role="alertdialog"`, `aria-modal="true"`, focus trapped inside while open

### Game editor

- [x] T024 [US2] Create `react-app/src/admin/features/game-editor/game-editor.tsx` — large title input; subtitle input; dnd-kit `<SortableContext>` wrapping 5 `QuestionCard` components (each with sortable item via `useSortable`); `DndContext` with `onDragEnd` handler that reorders questions and re-numbers 01–05; `TagInput` component; "← All Games" link in toolbar; loads existing game via `fetchGame(id)` thunk on mount; saves changes to `editor.game` in Redux on each field change
- [x] T025 [US2] Wire `game-editor.tsx` to `editor.slice.ts` — on mount: dispatch `loadGameThunk(id)` (calls `fetchGame(id)` via `GET /games/{id}`, populates `editor.game` and `editor.savedGame`); on form change: update `editor.game` and set `editor.isDirty = true`; compute `publishGateOpen` by applying `isComplete(q)` from `src/domain/transforms/question.transforms.ts` to all 5 questions
- [x] T026 [US2] Gate — in browser: open editor for existing game; expand question 1; fill image URL; confirm thumbnail appears; click thumbnail; confirm lightbox opens; press Escape; confirm closes; drag question 3; confirm renumber 01–05; add/remove tag

**Checkpoint**: Editor renders all content fields. Drag-to-reorder works. Image preview and lightbox work. Tags work.

---

## Phase 5: User Story 3 — TriviaSmith Publishes, Previews, and Manages Games (P3)

**Goal**: Publish gate disables button when questions incomplete; preview modal shows live editor state; autosave fires every 60s; trash with confirmation; unpublish with no confirmation.

**Independent test**: New game: Publish/Update disabled (tooltip explains). Complete all questions: button enables. Click Preview: modal shows player UI with current (unsaved) data. Click "Change" on Published status: immediately toggles to Draft, no dialog. Click trash icon: confirmation dialog appears; confirm; game trashed.

- [x] T027 [P] [US3] Create `react-app/src/admin/components/publish-sidebar/publish-sidebar.tsx` — displays: status indicator with "Change" link for toggle; publish date display; author name display (read-only from `editor.game.author`); "Save Draft" button (dispatches `saveGame` thunk with `status:'draft'`); "Publish/Update" button (dispatches `saveGame` thunk with `status:'published'`; `disabled` when `!editor.publishGateOpen`; `title` attribute explaining gate when disabled); trash icon button (opens confirmation-dialog.tsx); "Preview Game" button; autosave status text — must render THREE states: idle (blank), `'saved'` → "Draft saved at HH:MM:SS", `'failed'` → "Draft save failed — check your connection" in visually distinct (red/warning) style; props: all from `editor` slice via `useSelector`
- [x] T028 [P] [US3] Create `react-app/src/admin/features/preview/preview-modal.tsx` — opens when `open` prop is true; creates a temporary Redux store pre-seeded with `editor.game` as the active quiz (using a minimal store that satisfies the player's `selectQuizzes` selector); wraps in `<Provider store={previewStore}><MemoryRouter initialEntries={['/quiz/${editor.game.id}/0']}><QuizScreen/></MemoryRouter></Provider>`; imports `QuizScreen` from `../../../../features/quiz`; full-screen overlay with `role="dialog"`; close button dismisses
- [x] T029 [US3] Implement publish toggle (unpublish) — in `publish-sidebar.tsx`, clicking "Change" next to status immediately dispatches `patchGame(id, {status: 'draft'})` or `patchGame(id, {status: 'published'})` with NO confirmation dialog; `editor.game.status` updates in Redux; status indicator re-renders
- [x] T030 [US3] Implement trash flow — trash icon button in `publish-sidebar.tsx` opens `ConfirmationDialog`; on confirm: dispatch `deleteGame(id)` thunk (calls `DELETE /games/{id}`); on success: navigate to `#/games` (game list)
- [x] T031 [US3] Implement autosave — in `game-editor.tsx`: `useEffect` sets `setInterval(60000)` while mounted; each interval tick: if `editor.isDirty` is true, dispatch `autosaveThunk` — if `editor.game.id` is null (new game), calls `POST /games` first, stores the returned `id` in `editor.game.id`; then calls `PUT /games/{id}` with current form state; sets `editor.autosaveStatus = 'saved'` and `editor.autosaveTimestamp = Date.now()` on success, `'failed'` on error; `clearInterval` on unmount
- [x] T032 [US3] Gate — browser: new game; complete 5 questions; confirm Publish button enables; click Preview; confirm modal opens showing player with current data (no loading spinner expected — components are already bundled); close; click "Change" on Published; confirm no dialog and status changes; wait 60s in editor; confirm "Draft saved at HH:MM:SS" in toolbar; then simulate network failure (DevTools → Network → offline); wait another 60s; confirm "Draft save failed" message appears

**Checkpoint**: Full publish lifecycle works. Preview shows live state. Autosave fires. Trash is recoverable.

---

## Phase 6: User Story 4 — Administrator Controls TriviaSmith Access and Settings (P4)

**Goal**: Settings page with General, TriviaSmith Access, and About panels. Administrator can grant/revoke access. Non-Admin TriviaSmiths cannot see Settings.

**Independent test**: Admin: change gamesPerPage to 3, save; reload — persists. Grant "editor_user" — appears in table. Revoke — disappears. Grant non-existent username — error shown. Admin row shows "Always Active". Log in as TriviaSmith (non-admin) — no Settings sub-item visible.

- [x] T033 [P] [US4] Add `GET /settings/access`, `POST /settings/access`, and `DELETE /settings/access/{userId}` endpoints to `wp-plugin/trail-trivia/includes/class-rest-api.php` — `GET`: returns array of users with `manage_trail_trivia`, each as `{id, displayName, roles, isAdmin}`; `POST` body: `{username: string}`; validates username via `get_user_by('login', $username)` (returns 400 + `user_not_found` if null); checks that the user is NOT an Administrator (`current_user_can` for that user) — if admin, returns 400 + `is_administrator` code and message "Administrators always have access and cannot be added"; otherwise calls `$user->add_cap('manage_trail_trivia')`; returns `{success: true, user: {id, displayName, roles}}`; `DELETE` path param: `{userId: number}`; validates user exists and is not an Administrator; calls `$user->remove_cap('manage_trail_trivia')`; returns `{success: true}`; all three require `manage_options` cap + nonce
- [x] T034 [US4] Create `react-app/src/admin/features/settings/settings-page.tsx` with three panels: (1) **General** — `gamesPerPage` number input (min 1); Save Changes button that dispatches `updateSettings({gamesPerPage})` thunk; shows validation error if value < 1; (2) **TriviaSmith Access** — table of current TriviaSmith users (fetched via `GET /settings` or new endpoint); each row shows displayName, role badge, Revoke button (dispatches `revokeAccess(userId)`); Administrator rows show "Always Active" with no Revoke; username text input + Grant button (dispatches `grantAccess(username)`; shows error on `user_not_found` response); (3) **About** — read-only display of `settings.version`, `settings.wpMinimum`, `settings.phpMinimum`, and static data storage description text
- [x] T035 [US4] Connect `settings-page.tsx` to `settings.slice.ts` — on mount dispatch two thunks: `fetchSettingsThunk` (calls `GET /settings` for `gamesPerPage`, `version`, `wpMinimum`, `phpMinimum`) and `fetchTriviaSmiths` (calls `GET /settings/access` per T033, H2 decision); update reducers for `updateSettings`, `grantAccess` (shows `user_not_found` error OR `is_administrator` error from server), `revokeAccess`

- [x] T036 [US4] Gate — browser as Admin: change gamesPerPage to 3; save; reload; confirm 3 persists; grant valid username; confirm row appears; revoke; confirm removed; grant "nonexistent_xyz"; confirm error shown; confirm Admin row shows "Always Active"; log in as TriviaSmith (non-admin); confirm no Settings sub-item

**Checkpoint**: Settings page functional. Grant/revoke updates capability in real time.

---

## Phase 7: User Story 5 — Admin UI Accessible to All Users (P5)

**Goal**: axe-core 0 critical/serious violations on game list and settings pages. Keyboard drag works. All elements have accessible names.

**Independent test**: Run axe on game list and settings URLs. Both return 0 violations. Tab through editor: all accordion inputs reachable. Focus a grip handle and press Space — keyboard drag mode activates; arrow keys move item.

- [x] T037 [P] [US5] Add ARIA attributes to `game-list.tsx` — table has `role="table"` (or use semantic `<table>`); filter tabs use `role="tablist"`/`role="tab"` with `aria-selected`; search input has `aria-label="Search games"`; pagination buttons have `aria-label="Page N"`
- [x] T038 [P] [US5] Add ARIA attributes to `game-editor.tsx` and `question-card.tsx` — accordion items use `aria-expanded` on header button; dnd-kit `useSortable` is configured with `KeyboardSensor` using `sortableKeyboardCoordinates` so Space/Enter activates drag mode and arrow keys move items; each grip handle has `aria-label="Drag to reorder question {n}"`
- [x] T039 [P] [US5] Add ARIA attributes to `settings-page.tsx` — panels use appropriate section landmarks; Grant button has loading state `aria-busy`; error messages use `role="alert"`
- [x] T040 [US5] Run axe audit — `npx axe "http://localhost/wp-admin/admin.php?page=trail-trivia"` and `npx axe "http://localhost/wp-admin/admin.php?page=trail-trivia-settings"` (using `--chrome-path` and `--chromedriver-path` from quickstart.md); both must report 0 critical/serious violations

**Checkpoint**: Admin UI is WCAG 2.1 AA compliant. Keyboard drag works.

---

## Phase 8: Polish & Full Validation

- [x] T041 [P] Final `npm run build:admin` in `react-app/` — exits 0; commits `wp-plugin/trail-trivia/assets/admin/index.js` and `index.css`
- [x] T042 [P] PHP syntax check — `find wp-plugin/trail-trivia -name "*.php" -exec php -l {} \;` — all "No syntax errors" (final-pass repetition of T011; intentional quality gate)
- [x] T043 Run full MIGRATION_PLAN.md Phase 5 deterministic test block — all commands exit 0
- [x] T044 [P] SC-001 end-to-end timing test — log in as TriviaSmith; start timer; open game list → Add New Game → fill title + 5 questions → publish; confirm total elapsed < 5 minutes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 (T005 stub needed before T012/T014). T007–T010 (PHP) run parallel with T012–T014 (Redux). T013 gate requires WP; T012–T014 do not.
- **Phase 3 (US1)**: Depends on Phase 2 complete (T013 + T014 both done). T015–T017 sequential.
- **Phase 4 (US2)**: Depends on Phase 2 (store exists). T019–T023 (components) run parallel with each other. T024–T025 sequential after components.
- **Phase 5 (US3)**: Depends on Phase 4 (editor exists). T027–T028 parallel. T029–T031 sequential after T027.
- **Phase 6 (US4)**: Depends on Phase 2 (data layer). T033–T035 sequential. Can run parallel with Phase 5.
- **Phase 7 (US5)**: Depends on Phases 3–6 all complete.
- **Phase 8 (Polish)**: Depends on all story phases complete.

### Within Phase 2

```
T005 → T006 (build gate)
T006 → T012, T013, T014 (admin app needs build to confirm)
T007, T008, T009, T010 parallel (different PHP files)
T011 after T007-T010 (syntax check all PHP)
```

### Within Phase 4 (US2)

```
T019, T020, T021, T022, T023 parallel (5 different component files)
T024 after T019-T023 (GameEditor uses all components)
T025 after T024 (store wiring needs GameEditor)
T026 after T025 (integration gate)
```

---

## Parallel Opportunities

**Phase 2**: T007 + T008 + T009 + T010 (PHP files) parallel with T012 + T013 + T014 (TypeScript).

**Phase 4** (5 shared components): T019 + T020 + T021 + T022 + T023 — all separate files, all parallel.

**Phase 5 vs Phase 6**: T027–T031 (editor publish) and T033–T036 (settings) can run simultaneously — completely separate features.

**Phase 7**: T037 + T038 + T039 — three different components, fully parallel.

**Phase 8**: T041 + T042 + T044 — parallel.

---

## Implementation Strategy

### MVP (US1 only — stops at T018)

1. Phase 1 (T001–T006): build works
2. Phase 2 (T007–T014): PHP wiring + data layer
3. Phase 3 (T015–T018): game list visible, searchable, filterable
4. **STOP and VALIDATE**: TriviaSmith can see and navigate games; capability gate enforced

### Incremental Delivery

1. Foundation → game list visible
2. US2 → editor content fields work
3. US3 → publish lifecycle + preview + autosave
4. US4 → settings + grant/revoke
5. US5 → accessibility gate passes
6. Polish → Phase 5 shell block exits 0

---

## Notes

- All `react-app/src/admin/` files are new — no changes to existing `src/features/`, `src/components/`, `src/domain/`, or `src/store/`
- `preview-modal.tsx` (T028) imports from `../../../../features/quiz` (the player's existing `QuizScreen`) — this is the only cross-boundary import and is intentional (research Decision 4)
- The mini preview store in `preview-modal.tsx` must satisfy `selectQuizzes` returning an array with the preview quiz, and `selectStatus` returning `'idle'` — check the loader slice selectors for exact shape
- The dnd-kit `KeyboardSensor` in T024 should be configured with `sortableKeyboardCoordinates` from `@dnd-kit/sortable` — this provides arrow-key activation automatically (satisfies FR-032)
- T033 adds THREE REST endpoints (`GET`, `POST`, `DELETE /settings/access`) — all must be registered in `register_routes()` (already wired to `rest_api_init`)
- The `publishGateOpen` selector in T025 reuses `isComplete()` from `src/domain/transforms/question.transforms.ts` — import directly, no duplication
- **All component filenames use kebab-case** (`game-list.tsx`, `question-card.tsx`, etc.) per Constitution Principle IX — PascalCase filenames are a blocking defect in PR review
- `lightbox.tsx` lives in `src/admin/components/lightbox/` (its own directory), NOT inside `image-preview/` — it is a standalone reusable component (M4 fix)

---

## Required Test Files (C2 — TDD compliance, Constitution Principle III + X)

Every `.ts`/`.tsx` file in `src/admin/` MUST have a corresponding unit test file. The table below lists the test file paired with each implementation task. Tests MUST be written first (observed failing), then implementation (green), then commit together.

| Implementation task | Test file to create BEFORE implementation |
|---|---|
| T012 (Redux slices) | `src/admin/store/games/games.slice.test.ts`, `src/admin/store/editor/editor.slice.test.ts`, `src/admin/store/settings/settings.slice.test.ts` |
| T013 (admin-api.ts) | `src/admin/data/admin-api.test.ts` — mock fetch; assert URL + nonce header for each function |
| T015 (game-list.tsx) | `src/admin/features/game-list/game-list.test.tsx` — renders table; filter tabs change statusFilter; search form submit fires thunk |
| T019 (question-card.tsx) | `src/admin/components/question-card/question-card.test.tsx` — collapsed preview; expanded fields; onChange fires |
| T020 (image-preview.tsx) | `src/admin/components/image-preview/image-preview.test.tsx` — renders img when url non-empty; no img when empty |
| T021 (lightbox.tsx) | `src/admin/components/lightbox/lightbox.test.tsx` — renders when open; Escape key closes; × button closes |
| T022 (tag-input.tsx) | `src/admin/components/tag-input/tag-input.test.tsx` — adds chip on Enter; removes chip on × |
| T023 (confirmation-dialog.tsx) | `src/admin/components/confirmation-dialog/confirmation-dialog.test.tsx` — onConfirm called; onCancel called |
| T024 (game-editor.tsx) | `src/admin/features/game-editor/game-editor.test.tsx` — renders 5 cards; reorder fires onMove; "← All Games" link present |
| T027 (publish-sidebar.tsx) | `src/admin/components/publish-sidebar/publish-sidebar.test.tsx` — disabled when !publishGateOpen + shows tooltip; enabled when gate open; autosave status renders all 3 states |
| T028 (preview-modal.tsx) | `src/admin/features/preview/preview-modal.test.tsx` — renders when open; QuizScreen receives quiz from mini store |
| T034 (settings-page.tsx) | `src/admin/features/settings/settings-page.test.tsx` — renders 3 panels; gamesPerPage input; TriviaSmith table; About text |
