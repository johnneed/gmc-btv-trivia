# Tasks: WP Plugin — CPT, Taxonomy & REST API

**Input**: Design documents from `specs/005-wp-plugin-cpt-rest-api/`

**Prerequisites**: plan.md ✓ · spec.md ✓ · research.md ✓ · data-model.md ✓ · contracts/rest-api.md ✓

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files or independent methods)
- **[Story]**: User story (US1, US2, US3)

All file paths are relative to `wp-plugin/trail-trivia/`.

---

## Phase 1: Setup — Bootstrap Wiring

**Purpose**: Connect the existing class stubs to WordPress action hooks so the plugin does something when activated.

- [x] T001 Add bootstrap wiring to `trail-trivia.php` — after the `require_once` block, add: (1) an anonymous function hooked to `'init'` that instantiates `Trail_Trivia_Post_Type` and calls `->register()`, instantiates `Trail_Trivia_Settings` and calls `->register()`; (2) an anonymous function hooked to `'rest_api_init'` that instantiates `Trail_Trivia_REST_API` and calls `->register_routes()`; `Trail_Trivia_Capabilities` needs no hook — it is a stateless helper instantiated inline

---

## Phase 2: Foundational — Registration Layer

**Purpose**: CPT, taxonomy, capability helper, and settings storage — the shared infrastructure that all three user stories depend on. No REST API code yet.

**⚠️ CRITICAL**: T005 (activation gate) must pass before any REST API tasks begin.

- [x] T002 [P] Implement `Trail_Trivia_Post_Type::register()` in `includes/class-post-type.php` — call `register_post_type('trail_trivia_game', [...])` with: `'public' => false`, `'show_in_rest' => false` (REST handled manually), `'supports' => ['title', 'excerpt', 'author', 'custom-fields']`, `'labels'` array; then call `register_taxonomy('trivia_tag', 'trail_trivia_game', ['hierarchical' => false, 'show_in_nav_menus' => false, 'show_tagcloud' => false, 'show_in_rest' => false])`
- [x] T003 [P] Implement `Trail_Trivia_Capabilities::has_manage_cap()` in `includes/class-capabilities.php` — add a single public static method: `public static function has_manage_cap(): bool { return current_user_can('manage_trail_trivia'); }` — Administrators always pass this check due to WordPress's wildcard capability handling
- [x] T004 [P] Implement `Trail_Trivia_Settings` in `includes/class-settings.php` — add: (1) `public function register()` — calls `register_setting('trail_trivia', 'trail_trivia_settings', ['type' => 'array', 'default' => ['gamesPerPage' => 10]])` hooked to `'init'`; (2) `public function get_settings(): array` — returns `get_option('trail_trivia_settings', ['gamesPerPage' => 10])`; (3) `public function get_plugin_info(): array` — returns `['version' => TRAIL_TRIVIA_VERSION, 'wpMinimum' => '6.4', 'phpMinimum' => '8.0']`; (4) `public function update_settings(array $data): bool|WP_Error` — validates only `gamesPerPage` key accepted (returns `new WP_Error('invalid_settings_field', ...)` on any other key), sanitizes with `absint()`, calls `update_option()`
- [ ] T005 Gate — run `php -l wp-plugin/trail-trivia/trail-trivia.php wp-plugin/trail-trivia/includes/class-post-type.php wp-plugin/trail-trivia/includes/class-capabilities.php wp-plugin/trail-trivia/includes/class-settings.php`; activate plugin with WP-CLI; verify CPT and taxonomy appear in `wp post-type list` and `wp taxonomy list`

**Checkpoint**: Plugin activates cleanly. CPT and taxonomy registered. Settings helper available. T005 must exit 0.

---

## Phase 3: User Story 1 — Players Retrieve Published Games (Priority: P1) 🎯 MVP

**Goal**: Unauthenticated HTTP GET to `/wp-json/trail-trivia/v1/games` returns published games in the correct JSON shape. Draft games are excluded. An empty install returns `[]`.

**Independent Test**: `curl -s http://localhost/wp-json/trail-trivia/v1/games` returns `[]` on fresh install. After creating a published game via WP-CLI + `update_post_meta`, the same curl returns the game with correct shape. A draft game does not appear.

- [x] T006 [US1] Add `Trail_Trivia_REST_API::register_routes()` in `includes/class-rest-api.php` — add the public method that calls `register_rest_route('trail-trivia/v1', ...)` for all 9 routes; each route specifies `'methods'`, `'callback'`, and `'permission_callback'` (public routes use `__return_true`; write routes use a nonce+cap check); stub all handler methods as `return new WP_REST_Response([], 200);` — they will be implemented in later tasks
- [x] T007 [US1] Implement `build_game_response(WP_Post $post): array` private method in `includes/class-rest-api.php` — reads `_trivia_original_id`, `_trivia_questions`, `_trivia_tags` post meta; maps `post_status` to `status` (`'publish'`→`'published'`, `'draft'`→`'draft'`); converts `post_date` to Unix ms via `strtotime(get_post_field('post_date', $post->ID)) * 1000`; returns array matching the Quiz shape from `data-model.md`; author display name from `get_the_author_meta('display_name', $post->post_author)`
- [x] T008 [P] [US1] Implement `get_games_handler(WP_REST_Request $request): WP_REST_Response` in `includes/class-rest-api.php` — `WP_Query` with `'post_type' => 'trail_trivia_game'`, `'post_status' => 'publish'`, `'date_query' => [['before' => 'now', 'inclusive' => true]]`, `'posts_per_page' => -1`; map posts through `build_game_response()`; return `new WP_REST_Response($games, 200)`
- [x] T009 [P] [US1] Implement `get_game_handler(WP_REST_Request $request): WP_REST_Response|WP_Error` in `includes/class-rest-api.php` — extract `id` from `$request->get_param('id')`; use `get_game_by_uuid($id)` helper to find the post; return 404 `WP_Error` if not found or not published; return `new WP_REST_Response(build_game_response($post), 200)` on success
- [x] T010 [US1] Implement `get_game_by_uuid(string $uuid): WP_Post|null` private helper in `includes/class-rest-api.php` — `WP_Query` with `'meta_key' => '_trivia_original_id'`, `'meta_value' => $uuid`, `'post_status' => ['publish', 'draft']`; returns first result or null
- [x] T011 [US1] Implement `get_all_games_handler(WP_REST_Request $request): WP_REST_Response|WP_Error` in `includes/class-rest-api.php` — capability check `Trail_Trivia_Capabilities::has_manage_cap()`; returns 403 `WP_Error` if false; `WP_Query` with `'post_status' => ['publish', 'draft']`; maps through `build_game_response()`
- [ ] T012 [US1] Gate — `curl -s http://localhost/wp-json/trail-trivia/v1/games` returns `[]`; manually insert a post via `wp post create --post_type=trail_trivia_game --post_status=publish`; add `_trivia_original_id` meta; confirm curl returns the game; confirm `publishDate` is an integer; confirm `curl GET /games/{uuid}` returns 200 and `GET /games/nonexistent` returns 404

**Checkpoint**: Public read path works. Players can retrieve published games. Drafts are hidden.

---

## Phase 4: User Story 2 — TriviaSmith Contributors Manage Games (Priority: P2)

**Goal**: Authenticated users with `manage_trail_trivia` can create, update, patch, and delete games. Unauthenticated or unprivileged requests are rejected. Malformed `questions` return HTTP 400.

**Independent Test**: Unauthenticated POST returns 401. POST with valid data + nonce returns 201 with UUID `id`. POST with 3-item questions array returns 400. DELETE moves to trash (WP post still exists, not in public list).

### Private helpers (blocking all write handlers)

- [x] T013 [US2] Implement `validate_questions(array $questions): true|WP_Error` private method in `includes/class-rest-api.php` — must be exactly 5 items; each item must have non-empty `questionText` (string), `choices` array of exactly 4 items each with non-empty `text` (string), `correctAnswerIndex` (int 0–3), non-empty `answerText` (string); return `new WP_Error('invalid_questions', 'descriptive message', ['status' => 400])` on any violation; return `true` on success
- [x] T014 [P] [US2] Implement `save_game_data(int $post_id, array $data): void` private method in `includes/class-rest-api.php` — saves `_trivia_questions` (JSON-encoded array; ensure each question has a UUID via `wp_generate_uuid4()` if `id` absent; same for each choice); saves `_trivia_tags` (JSON-encoded array); syncs taxonomy via `wp_set_object_terms($post_id, $tags, 'trivia_tag')`; sets `_trivia_schema_version` to `"1.0"` on creation (check if meta exists first)
- [x] T015 [P] [US2] Implement `verify_nonce(WP_REST_Request $request): bool` private method in `includes/class-rest-api.php` — reads `X-WP-Nonce` header via `$request->get_header('X-WP-Nonce')`; returns `(bool) wp_verify_nonce($nonce, 'wp_rest')`

### Game write handlers

- [x] T016 [US2] Implement `create_game_handler(WP_REST_Request $request): WP_REST_Response|WP_Error` in `includes/class-rest-api.php` — verify nonce (401 if invalid); check `has_manage_cap()` (403 if false); validate `questions` (400 on failure); validate `publishDate` is integer (400 if not); call `wp_insert_post()` with sanitized title/excerpt/author/status/date; generate UUID via `wp_generate_uuid4()` and store as `_trivia_original_id`; call `save_game_data()`; return `new WP_REST_Response(build_game_response(get_post($post_id)), 201)`
- [x] T017 [US2] Implement `update_game_handler(WP_REST_Request $request): WP_REST_Response|WP_Error` in `includes/class-rest-api.php` — nonce+cap check; find post by UUID (404 if missing); validate all required fields; call `wp_update_post()` for post fields; call `save_game_data()` for meta+tags; return 200 with updated game
- [x] T018 [US2] Implement `patch_game_handler(WP_REST_Request $request): WP_REST_Response|WP_Error` in `includes/class-rest-api.php` — nonce+cap check; find post by UUID (404 if missing); accept only `status`, `title`, `tags` from body (ignore all others); update post via `wp_update_post()` for status/title; sync tags via `wp_set_object_terms()` and `update_post_meta()` for `_trivia_tags`; return 200 with full updated game
- [x] T019 [US2] Implement `delete_game_handler(WP_REST_Request $request): WP_REST_Response|WP_Error` in `includes/class-rest-api.php` — nonce+cap check; find post by UUID (404 if missing or already trashed); call `wp_trash_post($post_id)` — NOT `wp_delete_post()`; return `new WP_REST_Response(['deleted' => true, 'id' => $uuid], 200)`

### Settings write handler

- [x] T020 [P] [US2] Implement `get_settings_handler(WP_REST_Request $request): WP_REST_Response|WP_Error` in `includes/class-rest-api.php` — check `current_user_can('manage_options')` (403 if false); instantiate `Trail_Trivia_Settings`; return merged `get_settings() + get_plugin_info()` as 200 response
- [x] T021 [P] [US2] Implement `put_settings_handler(WP_REST_Request $request): WP_REST_Response|WP_Error` in `includes/class-rest-api.php` — nonce check; check `current_user_can('manage_options')` (403); get body as array; check for any key other than `gamesPerPage` (return `new WP_Error('invalid_settings_field', "Unknown or read-only field: $key", ['status' => 400])`); call `Trail_Trivia_Settings->update_settings($body)` (returns WP_Error on failure); return 200 with full settings

- [ ] T022 [US2] Gate — verify: unauth POST returns 401; auth POST with empty questions returns 400; valid POST returns 201 with UUID `id`; GET `/games/all` with nonce returns all games; DELETE moves game to `post_status = 'trash'` (not permanently deleted); settings GET returns `gamesPerPage` as int; settings PUT with `version` field returns 400

**Checkpoint**: Full CRUD works. Security enforced at API level. Trash is soft-delete.

---

## Phase 5: User Story 3 — Game Data Stored Correctly (Priority: P3)

**Goal**: Response JSON matches the `Quiz` TypeScript type exactly. `publishDate` is Unix ms. Tags sync to both taxonomy and meta.

**Independent Test**: Create a game with tags and questions; retrieve it; verify every field name, type, and value against the `Quiz` shape in `data-model.md`. Verify `_trivia_tags` post meta and `trivia_tag` taxonomy terms both contain the submitted tags.

- [ ] T023 [P] [US3] Verify `build_game_response()` shape — inspect the response of `GET /games/{id}` against the exact Quiz shape: `id` (string UUID), `title` (string), `subtitle` (string, empty string not null when absent), `author` (string display name), `authorId` (int), `publishDate` (int Unix ms), `status` ("published" or "draft"), `questions` (array of exactly 5), `tags` (string array); fix any field name mismatches or type errors in `includes/class-rest-api.php`
- [ ] T024 [P] [US3] Verify `publishDate` round-trip — create a game with `publishDate: 1703822400000`; retrieve it; assert returned `publishDate` equals `1703822400000` (not off by timezone offset or ms/s confusion); fix conversion in `build_game_response()` if needed in `includes/class-rest-api.php`
- [ ] T025 [P] [US3] Verify tag sync — create a game with `tags: ["hiking", "trail"]`; run `wp term list trivia_tag --allow-root`; confirm "hiking" and "trail" exist as taxonomy terms; run `wp post meta get {post_id} _trivia_tags --allow-root`; confirm `["hiking","trail"]` in meta; fix `save_game_data()` in `includes/class-rest-api.php` if either is missing
- [x] T026 Update `uninstall.php` — replace the comment with: (1) `delete_option('trail_trivia_settings')`; (2) loop all users and `$user->remove_cap('manage_trail_trivia')` for any user who has the explicit cap grant

---

## Phase 6: Polish & Full Validation

**Purpose**: PHP syntax check, both WP version test runs, and final shape verification.

- [x] T027 PHP syntax check — `find wp-plugin/trail-trivia -name "*.php" -exec php -l {} \;` — must produce only "No syntax errors detected" lines; zero parse errors or fatal errors
- [ ] T028 Run MIGRATION_PLAN.md Phase 4 deterministic test block on WP 6.4 — all commands must exit 0
- [ ] T029 Run MIGRATION_PLAN.md Phase 4 deterministic test block on WP 6.5 — all commands must exit 0
- [ ] T030 [P] Verify SC-007a — `curl -s -o /dev/null -w "%{http_code}" -X PUT .../settings -d '{"gamesPerPage":10,"version":"9.9.9"}'` returns 400
- [ ] T031 [P] Verify SC-006 — `publishDate` submitted as a non-integer string (e.g. `"2024-01-01"`) returns 400 from POST /games

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1. T002/T003/T004 can run in parallel. T005 gate must pass before Phase 3.
- **US1 (Phase 3)**: Depends on Foundational (T005 gate). T007 must precede T008/T009/T010/T011. T006 must precede all handlers.
- **US2 (Phase 4)**: Depends on US1 (Phase 3 complete). T013/T014/T015 (helpers) must precede T016-T021 (handlers). T016-T019 can run sequentially after helpers. T020/T021 are parallel to T016-T019.
- **US3 (Phase 5)**: Depends on US2. T023/T024/T025 are parallel verifications.
- **Polish (Phase 6)**: Depends on all user stories complete.

### Within Phase 2

```
T002 + T003 + T004 (parallel — different files)
  → T005 (gate — all three must complete first)
```

### Within Phase 3

```
T006 (register_routes stubs) → T007 (build_game_response)
T007 → T008 + T009 (parallel — different handlers)
T008 + T009 → T010 (get_game_by_uuid helper — needed by T009 but simpler to implement after)
T010 + T008 → T011 (get_all_games_handler)
T011 → T012 (gate)
```

### Within Phase 4

```
T013 + T014 + T015 (parallel — different private methods)
  → T016 → T017 → T018 → T019 (sequential — all write game handlers, share same file section)
  → T020 + T021 (parallel with T016-T019 — settings handlers, independent logic)
  → T022 (gate)
```

---

## Parallel Opportunities

**Phase 2**: T002, T003, T004 — three different PHP files.

**Phase 3**: T008 + T009 after T007 — different handler methods in same file but independent logic.

**Phase 4**: T013 + T014 + T015 — three different private helpers; T020 + T021 parallel with T016-T019.

**Phase 6**: T030 + T031 — different curl commands.

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1 (T001)
2. Complete Phase 2 (T002-T005)
3. Complete Phase 3: US1 (T006-T012) — public read path
4. **STOP and VALIDATE**: `curl GET /games` returns correct JSON; draft game not in public list
5. React player app (Phase 3) can now load live data

### Incremental Delivery

1. Foundation (T001-T005) → plugin activates; CPT/taxonomy registered
2. US1 (T006-T012) → public read path live; player app can load games
3. US2 (T013-T022) → full CRUD with security; admin API ready for Phase 5 UI
4. US3 (T023-T026) → data integrity verified; shape contract confirmed
5. Polish (T027-T031) → both WP versions pass; ready for Phase 5

---

## Notes

- All PHP files live under `wp-plugin/trail-trivia/` — no React or TypeScript changes in Phase 4
- `Trail_Trivia_Capabilities` is a stateless helper — no constructor injection needed; use static method or instantiate inline in the REST API class
- `wp_generate_uuid4()` is available since WP 4.7 — no third-party UUID library needed
- `Trail_Trivia_REST_API` class methods can access `Trail_Trivia_Settings` by creating a new instance inline — no DI container needed at this scope
- The `get_game_by_uuid()` helper searches `post_status => ['publish', 'draft']` — the individual handlers check whether the post is in the right status for the caller's permissions
- On PATCH: `tags` sync requires both `wp_set_object_terms()` (taxonomy) AND `update_post_meta()` for `_trivia_tags` — both must run or the denormalization is broken
- `uninstall.php` (T026) runs only when the plugin is deleted from WP admin — not on deactivate
- For WP 6.4/6.5 compatibility: avoid any function deprecated or introduced after WP 6.4; check `WP_REST_Request::get_header()` signature is stable across both versions (it is)
