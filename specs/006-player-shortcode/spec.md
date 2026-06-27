# Feature Specification: Player Shortcode Integration

**Feature Branch**: `006-player-shortcode`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "execute phase 6 of MIGRATION_PLAN.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor Plays a Quiz on the GMC Website (Priority: P1)

Any visitor who lands on a WordPress page that contains the `[trail_trivia]` shortcode sees the Trail Trivia player load and can complete a full quiz — browse the game list, select a quiz, answer all 5 questions, and reach the score screen — without any special login or configuration.

**Why this priority**: This is the end-to-end public-facing integration. Until this works, the entire migration (Phases 0–5) has no visible impact on the real website. A visitor landing on `gmcburlington.org/trail-trivia/` must see the same game experience they saw before the migration, with live data from WordPress rather than the static JSON file.

**Independent Test**: Activate the plugin on a WordPress site. Create a page, add `[trail_trivia]` to the content, publish it, and visit the page as a logged-out user. Verify: the player mounts and shows a game list; clicking a game navigates to the question screen; answering all 5 questions reaches the score screen; the browser shows zero console errors throughout.

**Acceptance Scenarios**:

1. **Given** a published WordPress page contains `[trail_trivia]`, **When** a logged-out visitor loads the page, **Then** the page source contains `<div id="trail-trivia-root">` exactly once.
2. **Given** at least one published game exists in WordPress, **When** the player loads on the shortcode page, **Then** the player displays the game in its list without a page reload.
3. **Given** a visitor selects a game, **When** they answer all 5 questions, **Then** they reach the score screen and their score is displayed.
4. **Given** the player is loaded, **When** the browser's developer console is open, **Then** zero `console.error` or `console.warn` messages appear during normal playthrough.
5. **Given** the page uses the Twenty Twenty-Four WordPress default theme, **When** the player renders, **Then** the player layout is not broken by theme styles (fonts, colors, and spacing are controlled by the player's own CSS).

---

### User Story 2 - Player Assets Load Correctly Without Conflicts (Priority: P2)

The player's JavaScript and CSS are loaded by WordPress's asset management system exactly once per page, with no hardcoded `<script>` or `<link>` tags in the PHP output, and with no duplicate loading.

**Why this priority**: Hardcoded script tags bypass WordPress's dependency resolution and caching, causing duplicate loads when other plugins or themes also enqueue scripts. Using the WordPress enqueueing system is the standard integration contract that prevents conflicts with caching plugins, CDN optimizations, and other WordPress tools the site may use now or in the future.

**Independent Test**: Load the shortcode page in a browser. Inspect the page source: exactly one `<script>` referencing the player JS and exactly one `<link>` referencing the player CSS. Inspect the browser's Network tab: the player JS loads exactly once, with no duplicate requests.

**Acceptance Scenarios**:

1. **Given** the shortcode page is loaded, **When** the page source is inspected, **Then** the player JavaScript and CSS are loaded via WordPress enqueue mechanism — no raw `<script src>` or `<link rel="stylesheet">` hardcoded in the PHP shortcode output.
2. **Given** the shortcode appears on a page, **When** the page is rendered, **Then** the player script is referenced exactly once in the HTML output (no duplicate script tags).
3. **Given** the plugin is active, **When** a page WITHOUT the `[trail_trivia]` shortcode is loaded, **Then** the player JavaScript and CSS are NOT loaded on that page (no unnecessary asset loading).

---

### User Story 3 - WordPress Admin Embeds the Player on Any Page (Priority: P3)

A WordPress administrator or editor can embed the Trail Trivia player on any WordPress page by typing `[trail_trivia]` in the page content editor, with no additional configuration required.

**Why this priority**: The shortcode is the zero-configuration embedding mechanism. Any page, any theme, any post type — one tag is all it takes. This is the standard WordPress content embedding pattern that content editors already understand.

**Independent Test**: Log in to WordPress as an Editor (not an Administrator). Create a new Page, type `[trail_trivia]` in the content, publish, and visit the page. The player loads identically to what an Administrator would see.

**Acceptance Scenarios**:

1. **Given** any logged-in user with page editing access, **When** they add `[trail_trivia]` to a page's content and publish, **Then** the player appears on the published page without any additional PHP or configuration.
2. **Given** the shortcode is added to a page, **When** the page is published and visited by an anonymous user, **Then** the player loads and displays the game list.
3. **Given** the page configuration object is injected by the shortcode, **When** the player JavaScript initializes, **Then** it reads the correct API base URL and nonce from `window.trailTriviaConfig` without any manual configuration by the admin.

---

### Edge Cases

- What happens when the `[trail_trivia]` shortcode appears twice on the same page? The player mount point `<div id="trail-trivia-root">` should appear twice (WordPress standard shortcode behavior), but the JS and CSS must still be enqueued only once.
- What happens when the player JS or CSS asset files do not exist at the expected plugin path? The shortcode renders the mount point HTML but the assets fail to load; the player shows its error state or blank content — it does not produce a PHP fatal error.
- What happens when the WordPress site has no published games? The player loads and shows an empty state (no error, no crash) — same behavior as the development fallback for an empty API response.
- What happens when a caching plugin caches the shortcode page? The `window.trailTriviaConfig` nonce will be stale after 12 hours. This is an operational concern handled by caching plugin configuration (exclude nonce pages from full-page caching), not a plugin responsibility.
- What happens when the Twenty Twenty-Four theme's CSS resets affect the player? The player's own CSS must override theme resets for its root element to prevent layout breakage.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The plugin MUST register a `[trail_trivia]` WordPress shortcode that outputs a player mount point and enqueues the player assets.
- **FR-002**: The shortcode output MUST include a single `<div id="trail-trivia-root"></div>` element where the player mounts.
- **FR-003**: The shortcode MUST inject a `window.trailTriviaConfig` JavaScript configuration object into the page before the player script loads, containing at minimum: `apiBase` (the full REST API base URL) and `nonce` (a WordPress REST nonce valid for the current page load).
- **FR-004**: The player JavaScript bundle MUST be enqueued via WordPress's `wp_enqueue_script()` function, not output as a hardcoded `<script>` tag. The version parameter MUST be `TRAIL_TRIVIA_VERSION` (the plugin's declared version constant) to provide cache-busting when the plugin is updated.
- **FR-005**: The player CSS bundle MUST be enqueued via WordPress's `wp_enqueue_style()` function, not output as a hardcoded `<link>` tag. The version parameter MUST also be `TRAIL_TRIVIA_VERSION`.
- **FR-006**: The player assets MUST be enqueued only on pages that contain the `[trail_trivia]` shortcode — not globally on every WordPress page.
- **FR-007**: The React player MUST use `HashRouter` (URL hash-based navigation). The plugin MUST NOT register any WordPress URL rewrite rules for the player.
- **FR-008**: The `window.trailTriviaConfig` injection MUST use `wp_add_inline_script()` to attach the configuration before the player script — not a hardcoded `<script>` block in the PHP output.
- **FR-009**: The player bundle MUST be built from the React app's Vite build and placed in the plugin's `assets/player/` directory with fixed, deterministic filenames: `index.js` (JavaScript) and `index.css` (styles). No content-hash suffix in the filenames — the WordPress enqueue system handles cache-busting via the plugin version parameter.
- **FR-010**: The Vite build configuration MUST support a `build:player` npm script that sets the build output directory directly to `../wp-plugin/trail-trivia/assets/player` (relative to `react-app/`), with filename hashing disabled, producing `index.js` and `index.css` in that directory as a single command with no intermediate copy step.
- **FR-011**: The player MUST render without any `console.error` or `console.warn` output during normal playthrough in a browser.
- **FR-012**: A PHP syntax check on all modified plugin files MUST produce no errors.

### Key Entities

- **Shortcode** (`[trail_trivia]`): WordPress content tag that triggers player rendering. Registered once; usable in any post, page, or widget that supports shortcodes.
- **Player Mount Point** (`<div id="trail-trivia-root">`): The DOM element the React app attaches to. Created by the shortcode; must exist before the player JS runs.
- **Page Configuration** (`window.trailTriviaConfig`): JavaScript object injected per page load by the shortcode PHP. Contains `apiBase` (REST API base URL) and `nonce` (WordPress REST nonce). Read by the React app at startup; replaced on each page reload.
- **Player Bundle**: The compiled output of the React player app — `index.js` (JavaScript) and `index.css` (styles) — built via Vite and stored in `wp-plugin/trail-trivia/assets/player/`. These files are committed to the plugin directory and deployed with it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Adding `[trail_trivia]` to a WordPress page and visiting that page as a logged-out user results in the player loading and displaying the game list within one normal page load.
- **SC-002**: The page source of a shortcode page contains `id="trail-trivia-root"` exactly once and contains `trailTriviaConfig` exactly once.
- **SC-003**: The page source contains zero raw `<script src` references to the player JS (all player script loading goes through WordPress enqueue).
- **SC-004**: A page WITHOUT the shortcode contains zero references to the player JS or CSS assets.
- **SC-005**: A full quiz playthrough (list → game → 5 questions → score screen) completes without any browser `console.error` or `console.warn`.
- **SC-006**: The full Phase 6 deterministic test block from `MIGRATION_PLAN.md` exits 0 on every command.
- **SC-006a**: The player script URL in the page source contains `?ver=1.0.0` (or the current `TRAIL_TRIVIA_VERSION` value) as the cache-bust query parameter.
- **SC-007**: The player renders without layout breakage when the Twenty Twenty-Four theme is active.

## Clarifications

### Session 2026-06-26

- Q: Should player bundle filenames be fixed or content-hashed? → A: Fixed (`index.js` / `index.css`) — PHP references constant paths; cache-busting via plugin version in `wp_enqueue_script`.
- Q: Should Vite write directly to `assets/player/` or build to `dist/` with a copy step? → A: Vite writes directly — `build:player` sets `outDir` to `../wp-plugin/trail-trivia/assets/player`; no copy step needed.
- Q: What version string should `wp_enqueue_script/style` use for cache-busting? → A: `TRAIL_TRIVIA_VERSION` — the plugin's declared version constant; bump the version when rebuilding the player bundle.

## Assumptions

- Phases 0–4 are complete: the plugin is active, the REST API returns published games, and the React player (Phase 3) already reads its API base URL from `window.trailTriviaConfig.apiBase` with fallback to `VITE_API_BASE_URL`.
- Phase 5 (TriviaSmith admin UI) is deferred — this phase implements the player shortcode only. The settings page, TriviaSmith capability grant UI, and game editor are not part of this phase.
- The built React player bundle (`assets/player/index.js` and `assets/player/index.css`) will be generated by running the Vite build and are committed alongside the PHP plugin files. Node.js is not required at runtime on the WordPress host.
- The `Class_Shortcode.php` stub already exists in `wp-plugin/trail-trivia/includes/` from Phase 0. This phase fills that stub with working code.
- The Vite build currently outputs to `dist/` inside `react-app/`. A separate Vite output configuration (`build:player` npm script) will copy the compiled player bundle to `wp-plugin/trail-trivia/assets/player/` for WordPress use.
- The `[trail_trivia]` shortcode does not accept parameters in Phase 6. Future phases may add parameters (e.g., a specific game ID) but that is out of scope here.
- WordPress REST nonces are valid for 12 hours. Page caching plugins should exclude the shortcode page from full-page caching, or use fragment caching, to keep the nonce fresh. This configuration is the site administrator's responsibility, not the plugin's.
