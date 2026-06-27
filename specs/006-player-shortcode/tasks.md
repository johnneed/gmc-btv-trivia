# Tasks: Player Shortcode Integration

**Input**: `specs/006-player-shortcode/`

**Skills active**: TDD (red→green every non-trivial unit) · Ponytail (minimal diff, YAGNI) · Caveman (terse)

## Format: `[ID] [P?] [Story] [type?] Description`

- `[test]` = write failing check FIRST, observe red, then implement
- `[P]` = parallel (different files)
- All paths relative to repo root

---

## Phase 1: Setup — Vite Player Build

**Purpose**: `npm run build:player` produces `assets/player/index.js` + `index.css`. Blocks all WP tasks.

- [x] T001 [test] Red gate — add `"build:player": "vite build --config vite.player.config.ts"` to `react-app/package.json` scripts; run it; confirm it fails (config missing). Red confirmed = proceed to T002
- [x] T002 Create `react-app/vite.player.config.ts` — IIFE format, `outDir: '../wp-plugin/trail-trivia/assets/player'`, `emptyOutDir: true`, `entryFileNames: 'index.js'`, `assetFileNames: 'index[extname]'`, `esbuild.drop: ['console']`; ponytail: copy the plugins/esbuild block from `vite.config.ts`, add only the `build` key
- [x] T003 Create `wp-plugin/trail-trivia/assets/player/.gitkeep` — establishes directory in version control
- [x] T004 Green gate — run `cd react-app && npm run build:player`; verify exits 0; confirm `wp-plugin/trail-trivia/assets/player/index.js` and `index.css` exist and are non-empty

**Checkpoint**: Player bundle built. Assets directory committed.

---

## Phase 2: Foundational — PHP Shortcode

**Purpose**: `[trail_trivia]` registered. Assets enqueued on shortcode pages only. Blocks US1/US2/US3 WP tests.

**⚠️ CRITICAL**: T006 (plugin activation gate) requires a running WordPress + WP-CLI.

- [ ] T005 [test] Red gate — activate plugin; run `wp eval "echo (int)shortcode_exists('trail_trivia');" --allow-root`; expect `0` (shortcode not yet registered). Document the red result, then proceed to T006
- [x] T006 Implement `Trail_Trivia_Shortcode` in `wp-plugin/trail-trivia/includes/class-shortcode.php` — `register()` calls `add_shortcode('trail_trivia', [$this, 'render'])`; `render(): string` calls private `enqueue_assets()` then returns `'<div id="trail-trivia-root"></div>'`; `enqueue_assets()` calls: `wp_enqueue_script('trail-trivia-player', TRAIL_TRIVIA_PLUGIN_URL.'assets/player/index.js', [], TRAIL_TRIVIA_VERSION, true)`, `wp_add_inline_script('trail-trivia-player', 'window.trailTriviaConfig='.wp_json_encode(['apiBase'=>rest_url('trail-trivia/v1'),'nonce'=>wp_create_nonce('wp_rest')]).';', 'before')`, `wp_enqueue_style('trail-trivia-player', TRAIL_TRIVIA_PLUGIN_URL.'assets/player/index.css', [], TRAIL_TRIVIA_VERSION)`; ponytail: 3 methods, ~25 lines total, zero abstraction
- [x] T007 Add `(new Trail_Trivia_Shortcode())->register();` to the existing `'init'` hook closure in `wp-plugin/trail-trivia/trail-trivia.php`; one line added to the existing closure — no new hook
- [ ] T008 [test] Green gate — reactivate plugin; run `wp eval "echo (int)shortcode_exists('trail_trivia');" --allow-root`; expect `1`; run `php -l wp-plugin/trail-trivia/includes/class-shortcode.php`; expect "No syntax errors"

**Checkpoint**: Shortcode registered. PHP clean. T008 must pass before story phases.

---

## Phase 3: US1 — Visitor Plays Quiz End-to-End (P1) 🎯 MVP

**Goal**: Page with `[trail_trivia]` shows player; full quiz playthrough works.

**Independent test**: `id="trail-trivia-root"` in source (×1); `trailTriviaConfig` in source (×1); zero console errors during full quiz.

- [ ] T009 [test] [US1] Red gate — create WP page with `[trail_trivia]`; `curl -s $PAGE_URL | grep -c 'trail-trivia-root'`; expect `0` (before T007 applies / player missing mount); document red; page will show mount after full setup — this step confirms testing infra works
- [ ] T010 [US1] Run `npm run build:player` (if not already done); activate plugin; create test page: `wp post create --post_type=page --post_title="Trail Trivia" --post_content="[trail_trivia]" --post_status=publish --porcelain`
- [ ] T011 [US1] [test] Green gate — `curl -s $PAGE_URL | grep -c 'id="trail-trivia-root"'` = 1; `curl -s $PAGE_URL | grep -c 'trailTriviaConfig'` = 1; `curl -s $PAGE_URL | grep -c 'trail-trivia-player'` ≥ 1
- [ ] T012 [US1] Browser smoke test — open page; complete quiz (list → question × 5 → score); confirm zero `console.error`/`console.warn` in DevTools Console

**Checkpoint**: Public player works end-to-end. US1 done.

---

## Phase 4: US2 — Assets Load Correctly, No Conflicts (P2)

**Goal**: Assets via WP enqueue only; once; not on other pages; no theme style breakage.

**Independent test**: No raw `<script src` for player JS; player script appears exactly once; non-shortcode pages have zero player assets; Twenty Twenty-Four theme shows no layout breakage.

- [ ] T013 [P] [US2] [test] Enqueue test — `curl -s $PAGE_URL | grep '<script src' | grep 'assets/player'`; expect 0 lines (WP enqueue uses `id` attrs, no raw PHP `<script src`); `curl -s $PAGE_URL | grep -c 'trail-trivia-player-js'`; expect 1
- [ ] T014 [P] [US2] [test] Non-shortcode page test — `curl -s $SITE_URL | grep -c 'trail-trivia-player'`; expect 0 (assets NOT on WP home page)
- [ ] T015 [US2] [test] Version param test — `curl -s $PAGE_URL | grep 'assets/player/index.js'`; confirm URL contains `?ver=` followed by `TRAIL_TRIVIA_VERSION`; ponytail: if version is "1.0.0" the URL must contain `?ver=1.0.0`
- [ ] T016 [US2] Theme test — switch to Twenty Twenty-Four; reload page; visually confirm player layout not broken (no overlapping elements, no invisible text, game list visible)

**Checkpoint**: Asset hygiene verified. Theme compatible.

---

## Phase 5: US3 — Any Editor Can Embed Player (P3)

**Goal**: WordPress Editor role can add `[trail_trivia]` to any page and it works.

**Independent test**: Editor user (non-Admin) embeds shortcode; page loads player identically to Admin's page.

- [ ] T017 [US3] [test] Editor role test — `EDITOR_ID=$(wp user create editor_test editor@test.com --role=editor --porcelain --allow-root)`; `PAGE_ID=$(wp post create --post_type=page --post_content="[trail_trivia]" --post_status=publish --post_author=$EDITOR_ID --porcelain --allow-root)`; `curl -s $(wp post get $PAGE_ID --field=guid --allow-root) | grep -c 'trail-trivia-root'`; expect 1
- [ ] T018 [US3] Config injection test — same page; `curl -s $PAGE_URL | grep 'trailTriviaConfig'`; expect config includes `apiBase` pointing to the WP REST API; ponytail: just grep for `trail-trivia/v1` in the output
- [ ] T019 [US3] Cleanup — `wp user delete $EDITOR_ID --yes --allow-root`; `wp post delete $PAGE_ID --force --allow-root`

**Checkpoint**: Shortcode works for Editor role. Config injected correctly.

---

## Phase 6: Polish & Full Validation

- [x] T020 [P] PHP syntax — `find wp-plugin/trail-trivia -name "*.php" -exec php -l {} \;`; expect all "No syntax errors"
- [x] T021 [P] Build clean — `cd react-app && npm run build:player`; exits 0; no TypeScript errors
- [ ] T022 Run full MIGRATION_PLAN.md Phase 6 deterministic test block; all commands exit 0

---

## Dependencies

```
T001 → T002 → T003 → T004 (sequential: TDD red→green→verify)
T004 + T006 + T007 → T008 (PHP gate needs both build done and class written)
T008 → T009–T022 (all WP tests need plugin active + assets built)
T013 + T014 + T015 parallel (different curl checks, same page)
T017 → T018 → T019 (sequential: create→test→cleanup)
T020 + T021 parallel (different tools)
```

---

## Parallel Opportunities

**Phase 1 + Phase 2 code** (T002 and T006 can run in parallel — different files):
```bash
# Simultaneously:
"Create react-app/vite.player.config.ts"   # T002
"Implement class-shortcode.php"             # T006
```

**Phase 4** (T013, T014, T015 — different curl endpoints):
```bash
# Simultaneously:
"Enqueue test"                  # T013
"Non-shortcode page test"       # T014
"Version param test"            # T015
```

---

## Implementation Strategy

### MVP (US1 only — stops at T012)

1. T001–T004: build works
2. T005–T008: shortcode registered, PHP clean
3. T009–T012: page shows player, quiz playthrough succeeds
4. ✅ Deploy — visitor can play

### Full delivery

1. MVP (T001–T012)
2. US2 (T013–T016): asset hygiene + theme compat
3. US3 (T017–T019): editor role confirmed
4. Polish (T020–T022): full validation block

---

## Ponytail notes

- `class-shortcode.php` target: 3 methods, ~25 lines. No base class, no interface, no factory.
- `vite.player.config.ts` target: ~20 lines. Copy esbuild block from `vite.config.ts`, add `build` key.
- Bootstrap addition: 1 line inside existing `init` closure in `trail-trivia.php`.
- Total new PHP: ~25 lines. Total new TS config: ~20 lines. Total new npm script: 1 line.
