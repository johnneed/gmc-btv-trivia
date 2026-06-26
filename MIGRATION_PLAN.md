# GMC Burlington Trail Trivia — WordPress Plugin Migration Plan

> **Purpose:** Agentic development driver. Each phase is self-contained, ends with
> deterministic shell tests, and is ordered strictly by dependency. No phase should
> begin until its predecessor's tests pass.
>
> **Last updated:** 2026-06-26 (reconciled with prototype UI)

---

## Table of Contents

1. [Domain Objects & Schemas](#section-1-domain-objects--schemas)
2. [React App Upgrade & Refactor](#section-2-react-app-upgrade--refactor)
3. [WordPress Plugin Architecture](#section-3-wordpress-plugin-architecture)
4. [Phases](#phases)
   - [Phase 0 — Scaffold & Domain Finalization](#phase-0--scaffold--domain-finalization)
   - [Phase 1 — Vite Migration & Dependency Upgrade](#phase-1--vite-migration--dependency-upgrade)
   - [Phase 2 — FP Refactor & ARIA Compliance](#phase-2--fp-refactor--aria-compliance)
   - [Phase 3 — API Client Migration](#phase-3--api-client-migration)
   - [Phase 4 — WP Plugin: CPT, Taxonomy & REST API](#phase-4--wp-plugin-cpt-taxonomy--rest-api)
   - [Phase 5 — WP Plugin: Capabilities & TriviaSmith Admin UI](#phase-5--wp-plugin-capabilities--triviasmith-admin-ui)
   - [Phase 6 — Player Integration & Plugin Settings](#phase-6--player-integration--plugin-settings)
   - [Phase 7 — Data Migration & Launch](#phase-7--data-migration--launch)
5. [Appendix A — Capability Matrix](#appendix-a--capability-matrix)
6. [Appendix B — Target Directory Structure](#appendix-b--target-directory-structure)

---

## Section 1: Domain Objects & Schemas

### 1.1 TypeScript Domain Types (React App)

All types live in `react-app/src/domain/types/`. Every type is a plain data structure.
No classes. No methods on types.

#### `Choice`

```typescript
// choice.type.ts
type Choice = {
  id: string;    // UUID — missing from current data; factories must generate
  text: string;
};
```

#### `Question`

```typescript
// question.type.ts
type Question = {
  id: string;
  questionText: string;
  choices: Choice[];          // always exactly 4 — enforced by editor and factory
  correctAnswerIndex: number; // 0–3
  answerText: string;
  answerImage?: string;       // absolute URL or empty string
  answerImageAlt?: string;
  answerImageCaption?: string;
  // NOTE: no per-question tags — the editor exposes no tag UI at the question level
};
```

#### `Quiz`

```typescript
// quiz.type.ts
type Quiz = {
  id: string;
  title: string;
  subtitle?: string;
  author: string;             // WP display name (denormalized for player)
  authorId: number;           // WP user ID
  publishDate: number;        // Unix ms timestamp
  status: 'draft' | 'published';
  // NOTE: no featured image — the editor does not expose an image picker for the game itself
  questions: Question[];      // always exactly 5 — enforced by editor, factory, and publish gate
  tags: string[];             // quiz-level tags, managed via editor Tags metabox
};
```

#### `AppUser`

```typescript
// app-user.type.ts
type WPRole = 'contributor' | 'author' | 'editor' | 'administrator';

type AppUser = {
  id: number;
  displayName: string;
  roles: WPRole[];
  isTriviaSmith: boolean;     // has manage_trail_trivia cap
};
```

#### `PluginSettings`

```typescript
// plugin-settings.type.ts
type PluginSettings = {
  gamesPerPage: number;       // admin list pagination — the only user-editable setting
  // NOTE: plugin version is displayed read-only in the Settings > About panel;
  // it is not user-editable and is not included in PUT /settings request bodies.
};

// Separate read-only metadata returned by GET /settings alongside PluginSettings:
type PluginInfo = {
  version: string;            // from plugin header, read-only
  wpMinimum: string;          // "6.4"
  phpMinimum: string;         // "8.0"
};
```

### 1.2 WordPress Database Schema (PHP)

The plugin uses a **Custom Post Type** — no custom tables. WordPress core provides
drafts, revisions, authors, and publish-date management for free.

#### Custom Post Type: `trail_trivia_game`

| WP field         | Domain field         | Notes                                    |
|------------------|----------------------|------------------------------------------|
| `post_title`     | `Quiz.title`         |                                          |
| `post_excerpt`   | `Quiz.subtitle`      |                                          |
| `post_author`    | `Quiz.authorId`      | WP user ID                               |
| `post_status`    | `Quiz.status`        | `publish` → `published`, `draft` → `draft`, `trash` → soft delete (recoverable) |
| `post_date`      | `Quiz.publishDate`   | Stored as WP datetime; served as Unix ms |

#### Post Meta (per game)

| Key                      | PHP type | Description                                  |
|--------------------------|----------|----------------------------------------------|
| `_trivia_questions`      | string   | JSON-encoded `Question[]`                    |
| `_trivia_tags`           | string   | JSON-encoded `string[]` (quiz-level tags)    |
| `_trivia_schema_version` | string   | e.g. `"1.0"` — for future migrations        |
| `_trivia_original_id`    | string   | UUID from pre-migration `trivia.json`        |

#### Custom Taxonomy: `trivia_tag`

- Attached to `trail_trivia_game`
- Hierarchical: `false`
- Not shown in WP tag cloud or nav menus
- **Primary store for quiz-level tags** — enables WP-native `tax_query` filtering
- The `_trivia_tags` post meta (JSON array) is a denormalized copy kept in sync with
  the taxonomy terms on every save. The REST API reads from `_trivia_tags` for response
  speed; writes sync both the meta and the taxonomy terms.
- Per-question tags are **not** implemented — `Question` has no `tags` field.

#### User Capability

| Capability             | Who has it                               | What it grants                       |
|------------------------|------------------------------------------|--------------------------------------|
| `manage_trail_trivia`  | Explicitly granted users + Administrators | Full CRUD on any trail trivia game  |

Administrators always pass the capability check; the explicit grant is only needed
for Contributors, Authors, and Editors.

### 1.3 REST API Response Shape

The REST API response for `Quiz` must be identical to the TypeScript `Quiz` type.
The React app deserializes it directly; no client-side transformation of field names.

```json
{
  "id": "efe84224-...",
  "title": "The Continental Divide Trail",
  "subtitle": "The Third Jewel in the Triple Crown",
  "author": "John Need",
  "authorId": 1,
  "publishDate": 1703822400000,
  "status": "published",
  "questions": [
    {
      "id": "6f1edeb2-...",
      "questionText": "Which US states does the CDT pass through?",
      "choices": [
        { "id": "3cbd3b99-...", "text": "Nebraska, Idaho, Wyoming, Colorado, and New Mexico" },
        { "id": "3cbd3b99-...", "text": "Montana, Idaho, Wyoming, Colorado, and New Mexico" },
        { "id": "3cbd3b99-...", "text": "Montana, Idaho, Wyoming, Utah, Colorado, and New Mexico" },
        { "id": "3cbd3b99-...", "text": "Montana, Idaho, Wyoming, Colorado, and Arizona" }
      ],
      "correctAnswerIndex": 1,
      "answerText": "The Continental Divide Trail is about 3,028 miles...",
      "answerImage": "https://...",
      "answerImageAlt": "Map of the Continental Divide Trail",
      "answerImageCaption": "Map of the Continental Divide Trail"
    }
  ],
  "tags": []
}
```

> **Constraints reflected in shape:**
> - `questions` always contains exactly 5 items (the editor enforces this; the publish gate blocks publishing with < 5 complete questions)
> - No `image` field on `Quiz` — no featured image for games
> - No `tags` array on `Question` — per-question tags are not implemented

---

## Section 2: React App Upgrade & Refactor

### 2.1 Migration from CRA to Vite

**Remove:** `react-scripts`, `REACT_APP_*` env vars
**Add:** `vite`, `@vitejs/plugin-react`, `vitest`, `@vitest/coverage-v8`, `jsdom`

Rename all `REACT_APP_*` env vars to `VITE_*`. Update `src/` references accordingly.

### 2.2 Dependency Targets

| Package                 | Current   | Target     | Notes                                  |
|-------------------------|-----------|------------|----------------------------------------|
| react / react-dom       | 18.2.0    | 18.3.x     |                                        |
| @reduxjs/toolkit        | 1.9.6     | 2.x        | `createSlice` API unchanged            |
| react-redux             | 8.1.2     | 9.x        |                                        |
| react-router-dom        | 6.16.0    | 6.x latest |                                        |
| ramda + @types/ramda    | 0.29.0    | 0.30.x     |                                        |
| typescript              | 4.9.5     | 5.5.x      |                                        |
| framer-motion           | 10.16.16  | 11.x       |                                        |
| Build tool              | CRA       | Vite 5.x   |                                        |
| Test runner             | Jest/CRA  | Vitest     |                                        |

### 2.3 Layered Architecture

```
src/
  data/            ← API clients only. All network I/O. No transforms.
  domain/
    types/         ← Pure TypeScript types
    factories/     ← createQuiz(), createQuestion(), createChoice()
    transforms/    ← Pure Ramda transforms: sort, filter, normalize
  store/           ← Redux slices, selectors, thunks
  components/      ← Dumb / presentational. No dispatch. No selectors.
  features/        ← Smart. useSelector, useDispatch, business logic.
  app/             ← Root: store, router, Provider, ErrorBoundary
```

### 2.4 FP Paradigm Rules

These rules are enforced by linting + code review, not just convention.

| Rule | Allowed | Not Allowed |
|------|---------|-------------|
| Variable declarations | `const` | `let`, `var` (except Redux reducer bodies) |
| Data transforms | `R.map`, `R.filter`, `R.sort`, `R.compose` | `.push()`, `.splice()`, `.sort()` (in-place) |
| Side effects | `src/data/` and Redux thunks only | Inside components or domain transforms |
| Classes | None | `class Foo { ... }` |
| Component pattern | Smart in `features/`, Dumb in `components/` | Mixed concerns |
| Files per component | 1 | Multiple default exports per file |

### 2.5 ARIA Requirements

| Element | Requirement |
|---------|-------------|
| All `<img>` | Non-empty `alt` or `alt=""` if decorative |
| All `<button>` | Text content or `aria-label` |
| Choice buttons | Grouped with `role="group"` + `aria-labelledby` pointing to question |
| Progress bar | `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Loading state | `aria-live="polite"` region |
| Score screen | `aria-live="assertive"` on result announcement |
| Route changes | `document.title` updated; main content gets focus |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` suppresses framer-motion |

---

## Section 3: WordPress Plugin Architecture

### 3.1 Plugin File Structure

```
trail-trivia/
  trail-trivia.php          ← Plugin header + bootstrap (require_once all includes)
  uninstall.php             ← Remove caps, options, CPT posts on uninstall
  includes/
    class-post-type.php     ← CPT + taxonomy registration
    class-rest-api.php      ← All REST endpoint registration + handlers
    class-capabilities.php  ← manage_trail_trivia cap; admin user-management UI
    class-settings.php      ← register_setting, settings page, sanitization
    class-admin-ui.php      ← Enqueue admin React bundle + page menu registration
    class-shortcode.php     ← [trail_trivia] shortcode + player asset enqueueing
    class-cli-command.php   ← WP-CLI: wp trail-trivia import <file>
  assets/
    player/                 ← React player bundle (Vite build output)
      index.js
      index.css
    admin/                  ← React admin bundle (separate Vite build)
      index.js
      index.css
  templates/
    shortcode.php           ← Player mount point HTML
    admin-page.php          ← Admin mount point HTML
  languages/
    trail-trivia.pot        ← Translation template
```

### 3.2 REST API Endpoints

| Method   | Endpoint                               | Requires Cap             | Description                    |
|----------|----------------------------------------|--------------------------|--------------------------------|
| `GET`    | `/wp-json/trail-trivia/v1/games`       | none                     | List published games           |
| `GET`    | `/wp-json/trail-trivia/v1/games/{id}`  | none                     | Get single published game      |
| `GET`    | `/wp-json/trail-trivia/v1/games/all`   | `manage_trail_trivia`    | List all (incl. drafts)        |
| `POST`   | `/wp-json/trail-trivia/v1/games`       | `manage_trail_trivia`    | Create game                    |
| `PUT`    | `/wp-json/trail-trivia/v1/games/{id}`  | `manage_trail_trivia`    | Full update                    |
| `PATCH`  | `/wp-json/trail-trivia/v1/games/{id}`  | `manage_trail_trivia`    | Partial update (status, title) |
| `DELETE` | `/wp-json/trail-trivia/v1/games/{id}`  | `manage_trail_trivia`    | Move to Trash (`post_status = 'trash'`) — recoverable via WP admin |
| `GET`    | `/wp-json/trail-trivia/v1/settings`    | `manage_options`         | Get plugin settings            |
| `PUT`    | `/wp-json/trail-trivia/v1/settings`    | `manage_options`         | Update plugin settings         |

All write endpoints: verify `wp_verify_nonce` from `X-WP-Nonce` header.
All endpoints: sanitize input with `sanitize_text_field`, `wp_kses_post` as appropriate.
Malformed requests return `WP_Error` with HTTP 400 and a descriptive `code` + `message`.

### 3.3 WordPress Compatibility

Target: WordPress **6.4** and **6.5** (current − 2 major versions).
PHP minimum: **8.0** (required by WP 6.4).
Test matrix: WP 6.4 / PHP 8.0, WP 6.5 / PHP 8.2.

---

## Phases

---

### Phase 0 — Scaffold & Domain Finalization

**Goal:** Establish the monorepo structure, finalize all domain types, scaffold the
plugin directory, verify it activates in WordPress without errors.

**Estimated effort:** 1–2 days

#### Deliverables

- [ ] `gmc-btv-trivia/` renamed to `react-app/` via `git mv` (preserves per-file git history)
- [ ] `wp-plugin/trail-trivia/` directory created at repo root
- [ ] `react-app/src/domain/types/` — all 5 types (Choice, Question, Quiz, AppUser, PluginSettings)
- [ ] `react-app/src/domain/factories/` — createChoice, createQuestion, createQuiz factories
- [ ] `react-app/src/domain/transforms/quiz.transforms.ts` — exports `sortByDateDesc` only
- [ ] `react-app/tsconfig.json` updated in place: `strict: true` added, `include` paths corrected, CRA-only options removed (full Vite/path-alias overhaul deferred to Phase 1)
- [ ] `wp-plugin/trail-trivia/trail-trivia.php` — valid plugin header, activates cleanly
- [ ] All includes stubbed with empty class bodies

> **Out of scope for Phase 0:** `question.transforms.ts`, `src/domain/transforms/index.ts` barrel — deferred to Phase 2.

#### Acceptance Criteria

1. `Quiz` type includes `status: 'draft' | 'published'` and `authorId: number`; has no `image` field
2. `Quiz.questions` type is `Question[]` with a runtime length invariant of exactly 5
3. `Choice` type includes `id: string`
4. `Question` type includes `answerImageAlt?: string`; has no `tags` field
5. `AppUser` type uses `isTriviaSmith: boolean` (single S)
6. `PluginSettings` type has only `gamesPerPage: number` (no `version`)
7. All factory functions produce structurally valid domain objects
8. `createQuestion()` produces exactly 4 choices
9. `tsc --noEmit` passes across all of `react-app/src/`
10. Plugin appears in WP Plugins list, activates and deactivates without PHP notices/warnings
11. WP debug log is empty after activation

#### Deterministic Tests

```bash
# --- React: types compile ---
cd react-app
npx tsc --noEmit
echo "TSC exit: $?"          # must be 0

# --- React: factory unit tests ---
npx vitest run src/domain/factories/
echo "Factories exit: $?"    # must be 0

# --- PHP: syntax check ---
find wp-plugin -name "*.php" -exec php -l {} \; | grep -v "No syntax errors"
# Expected: empty output (no files with syntax errors)

# --- WP: activate/deactivate cycle ---
wp plugin activate trail-trivia --allow-root
echo "Activate exit: $?"     # must be 0
wp plugin deactivate trail-trivia --allow-root
wp plugin activate trail-trivia --allow-root

# --- WP: no errors in debug log ---
[ -f wp-content/debug.log ] && tail -20 wp-content/debug.log | grep -i "fatal\|warning\|notice" | wc -l || echo "0"
# Expected: 0
```

---

### Phase 1 — Vite Migration & Dependency Upgrade

**Goal:** Replace CRA with Vite, upgrade all deps, configure Vitest, confirm the
existing game plays without regression.

**Estimated effort:** 2–3 days

#### Deliverables

- [ ] `vite.config.ts` with `@vitejs/plugin-react` and path aliases
- [ ] `vitest.config.ts` (or inline in vite config) with jsdom environment
- [ ] All deps at target versions (see Section 2.2)
- [ ] All `REACT_APP_*` → `VITE_*` env vars
- [ ] Existing tests pass under Vitest
- [ ] `npm run build` outputs to `dist/` without type errors
- [ ] `npm run dev` starts in < 5 s on cold start

#### Acceptance Criteria

1. `npm run build` exits 0 with zero TypeScript errors
2. `npm run test` exits 0 (all existing tests pass under Vitest)
3. `node_modules/.bin/react-scripts` does not exist
4. `dist/assets/*.js.gz` total size < 512 KB
5. No `REACT_APP_` strings in `src/` (all converted to `VITE_`)

#### Deterministic Tests

```bash
cd react-app

# Build
npm run build
echo "Build exit: $?"          # must be 0

# Type check
npx tsc --noEmit
echo "TSC exit: $?"            # must be 0

# Tests
npm run test -- --run
echo "Test exit: $?"           # must be 0

# No CRA
ls node_modules/.bin/react-scripts 2>/dev/null \
  && echo "FAIL: react-scripts present" \
  || echo "PASS: react-scripts absent"

# Bundle size (gzipped)
npm run build
gzip -k dist/assets/*.js 2>/dev/null
TOTAL=$(ls dist/assets/*.js.gz | xargs wc -c | tail -1 | awk '{print $1}')
echo "Gzipped JS total: $TOTAL bytes"
[ "$TOTAL" -lt 524288 ] && echo "PASS: under 512KB" || echo "FAIL: over 512KB"

# No REACT_APP_ env references
grep -r "REACT_APP_" src/ | wc -l
# Expected: 0
```

---

### Phase 2 — FP Refactor & ARIA Compliance

**Goal:** Apply the FP paradigm throughout, enforce Smart/Dumb separation, hit 90%
test coverage, achieve WCAG 2.1 AA.

**Estimated effort:** 3–5 days

#### Deliverables

- [ ] All `let`/`var` removed from non-reducer source files
- [ ] `react-app/src/domain/transforms/question.transforms.ts` created (Ramda-based question transforms)
- [ ] `react-app/src/domain/transforms/index.ts` barrel exporting all transforms
- [ ] All data transforms in `src/domain/transforms/` using Ramda
- [ ] All side effects isolated to `src/data/` and Redux thunks
- [ ] Smart components only in `src/features/`, Dumb only in `src/components/`
- [ ] One component per file (no multi-export component files)
- [ ] Unit tests for every `.ts` and `.tsx` file
- [ ] Coverage report: ≥ 90% lines, ≥ 90% branches
- [ ] axe-core audit on built app: 0 critical/serious violations
- [ ] All images have `alt` attributes
- [ ] All interactive elements have accessible names

#### Acceptance Criteria

1. `grep -rn "\bvar\b\|\blet\b" src/` returns 0 results outside reducer bodies and test `it`/`describe` blocks
2. No `.push(`, `.splice(`, `.sort(` (in-place sort) in `src/domain/` or `src/components/`
3. All data-transform files import from `ramda`
4. Coverage report shows lines ≥ 90 and branches ≥ 90
5. `axe` CLI returns 0 violations on served `dist/index.html`
6. `grep -rn "<img" src/ | grep -v "alt="` returns 0 results
7. All `<button>` elements have visible text or `aria-label`
8. Keyboard-only navigation can complete a full quiz (manual verification step)

#### Deterministic Tests

```bash
cd react-app

# No var/let outside safe contexts
grep -rn --include="*.ts" --include="*.tsx" "\bvar\b" src/ \
  | grep -v "\.test\.\|\.spec\.\|// " \
  | wc -l
# Expected: 0

# No in-place array mutation in domain layer
grep -rn "\.push(\|\.splice(\|\.sort(" src/domain/ src/components/
# Expected: 0 lines

# Ramda imports present in transforms
grep -rn "from \"ramda\"" src/domain/transforms/ | wc -l
# Expected: at least 2 (quiz + question transforms)

# Coverage gate
npm run test -- --run --coverage
node -e "
  const c = require('./coverage/coverage-summary.json').total;
  console.log('Lines:', c.lines.pct + '%', '| Branches:', c.branches.pct + '%');
  if (c.lines.pct < 90 || c.branches.pct < 90) { console.error('FAIL: below 90%'); process.exit(1); }
  console.log('PASS');
"

# ARIA (serve built app first)
npm run build
npx serve dist -p 4321 &
SERVE_PID=$!
sleep 3
npx axe-core-cli http://localhost:4321 --exit
AXE_EXIT=$?
kill $SERVE_PID 2>/dev/null
echo "axe exit: $AXE_EXIT"    # must be 0

# Alt text on all images
grep -rn "<img" src/ | grep -v 'alt=' | grep -v '\.test\.\|\.spec\.'
# Expected: 0 lines
```

---

### Phase 3 — API Client Migration

**Goal:** Replace the static `trivia.json` fetch with calls to the WP REST API.
The Redux layer is unchanged — only `src/data/trivia-api.ts` changes.

**Estimated effort:** 1–2 days

#### Deliverables

- [ ] `src/data/trivia-api.ts` — `fetchGames()`, `fetchGame(id)`, `fetchAllGames()` (auth)
- [ ] `AbortController` with 10 s timeout on all fetch calls
- [ ] `VITE_API_BASE_URL` env var (`/wp-json/trail-trivia/v1` in production)
- [ ] `ErrorBoundary` wraps the app; catches fetch failures
- [ ] WP nonce read from `window.trailTriviaConfig.nonce` (injected by shortcode PHP)
- [ ] `console.log` stripped from production build via `vite.config.ts` define

#### Acceptance Criteria

1. `fetchGames()` calls `${VITE_API_BASE_URL}/games` — not `trivia.json`
2. Simulated 401 → Redux status `"unauthorized"` → UI shows "Sign in" message
3. Simulated 500 → ErrorBoundary catches → "Something went wrong. Try again." shown
4. Simulated network timeout (10 s) → AbortController fires → error state set
5. `grep "trivia.json" src/` returns 0 results
6. Production build contains no literal `console.log` strings

#### Deterministic Tests

```bash
cd react-app

# No trivia.json references
grep -rn "trivia.json" src/
# Expected: 0 lines

# Error boundary present
grep -rn "ErrorBoundary" src/app/ src/features/ | wc -l
# Expected: >= 1

# No console.log in prod build
npm run build
grep -r "console\.log" dist/assets/*.js | grep -v "sourceMappingURL"
# Expected: 0 lines

# AbortController used in API client
grep "AbortController" src/data/trivia-api.ts
# Expected: at least 1 match

# TSC clean
npx tsc --noEmit && echo "PASS" || echo "FAIL"
```

---

### Phase 4 — WP Plugin: CPT, Taxonomy & REST API

**Goal:** The plugin's data layer is fully functional. All REST endpoints work
correctly as verified by `curl` and WP-CLI.

**Estimated effort:** 3–4 days

#### Deliverables

- [ ] `trail_trivia_game` CPT registered (not public, no front-end archive)
- [ ] `trivia_tag` taxonomy registered and attached to CPT
- [ ] `manage_trail_trivia` capability defined
- [ ] All REST endpoints from Section 3.2 registered and returning correct shapes
- [ ] Input sanitization on all POST/PUT/PATCH endpoints
- [ ] Nonce verification (`check_ajax_referer` or `wp_verify_nonce`) on all writes
- [ ] Capability checks before any mutation
- [ ] JSON Schema validation of incoming `questions` array

#### Acceptance Criteria

1. `GET /wp-json/trail-trivia/v1/games` returns `[]` on fresh install (no auth)
2. `POST` to create without auth → 401
3. `POST` with `manage_trail_trivia` cap → creates game; subsequent `GET` returns it
4. `DELETE` without `manage_trail_trivia` → 403
5. `POST` with malformed questions array → 400 with descriptive `code`
6. `GET /games` never includes draft games without `manage_trail_trivia`
7. Response shape passes JSON Schema validation against the `Quiz` type schema
8. WP 6.4 and 6.5 both pass all tests

#### Deterministic Tests

```bash
# Activate
wp plugin activate trail-trivia --allow-root

# CPT registered
wp post-type list --format=csv | grep trail_trivia_game
# Expected: line containing "trail_trivia_game"

# Taxonomy registered
wp taxonomy list --format=csv | grep trivia_tag
# Expected: line containing "trivia_tag"

# REST: empty list without auth
GAMES=$(curl -s http://localhost/wp-json/trail-trivia/v1/games)
echo "$GAMES" | jq length
# Expected: 0

# REST: 401 on unauthenticated create
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  http://localhost/wp-json/trail-trivia/v1/games \
  -H "Content-Type: application/json" \
  -d '{"title":"Anon"}')
echo "Unauth POST: $HTTP_CODE"    # must be 401

# Create a game as admin via WP-CLI
GAME_ID=$(wp post create \
  --post_type=trail_trivia_game \
  --post_title="Test CDT" \
  --post_status=publish \
  --porcelain)
echo "Created ID: $GAME_ID"

# REST: game appears in list
curl -s http://localhost/wp-json/trail-trivia/v1/games | jq length
# Expected: 1

# Draft not in public list
wp post update $GAME_ID --post_status=draft
curl -s http://localhost/wp-json/trail-trivia/v1/games | jq length
# Expected: 0

# REST: 400 on malformed questions
ADMIN_NONCE=$(wp --allow-root eval 'echo wp_create_nonce("wp_rest");')
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT \
  "http://localhost/wp-json/trail-trivia/v1/games/$GAME_ID" \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: $ADMIN_NONCE" \
  --cookie "$(wp --allow-root eval 'echo "wordpress_logged_in_" . COOKIEHASH . "=...";')" \
  -d '{"questions":"not-an-array"}')
echo "Malformed questions: $HTTP_CODE"    # must be 400

# Cleanup
wp post delete $GAME_ID --force
```

---

### Phase 5 — WP Plugin: Capabilities & TriviaSmith Admin UI

**Goal:** The TriviaSmith permission system is live and the admin UI (React app
inside WP admin) lets TriviaSmiths manage games end-to-end.

**Estimated effort:** 4–6 days

#### Deliverables

**Game List**
- [ ] "Trail Trivia" → "All Games" menu item — visible only to users with `manage_trail_trivia` cap
- [ ] Game list table: Title (+ subtitle), Status badge, Question count, Author, Date
- [ ] Status filter tabs: All / Published / Draft
- [ ] Title search box
- [ ] Row actions on hover: Edit, Trash
- [ ] "Add New Game" button navigates to blank editor

**Game Editor**
- [ ] Title input (large display type) + Subtitle input
- [ ] Questions accordion: always exactly 5 question cards (no add/remove)
  - Each card collapsed: shows question text preview + correct answer preview
  - Each card expanded: Question text, 4 choice inputs with correct-answer radio,
    Answer explanation, Answer image URL with live 160×120px thumbnail preview,
    Image alt text, Image caption
  - Clicking thumbnail opens fullscreen image lightbox (close: click outside / Escape / ×)
- [ ] Drag-to-reorder questions via six-dot grip handle; cards auto-renumber 01–05 on drop
- [ ] Publish sidebar metabox: Status indicator, Publish date, Author (read-only display),
    Save Draft button, Publish/Update button, Move to Trash icon button
- [ ] Publish/Update button **disabled** until all 5 questions have non-empty `questionText`
    and all 4 choices filled; descriptive `title` tooltip explains gate when disabled
- [ ] Unpublish: clicking "Change" next to status immediately toggles draft/published —
    **no confirmation dialog** (unpublish is low-risk; undo via re-publish)
- [ ] Move to Trash: icon button (trash SVG, red border) opens confirmation dialog;
    confirmed → `DELETE` endpoint sets `post_status = 'trash'` (recoverable from WP Trash)
- [ ] Tags sidebar metabox: chip input to add/remove quiz-level tags
- [ ] Preview Game button (sidebar, above Publish box): opens full-screen player modal
    populated from the editor's live form state; shows game exactly as players see it
    (Henny Penny / Tilt Neon fonts, choice buttons, Huzzah! reveal, score screen)
- [ ] Auto-save draft every 60 s while editor is open; autosave indicator in toolbar
- [ ] "← All Games" back link in toolbar

**Settings Page** (Admins only — requires `manage_options`)
- [ ] Settings menu item hidden for users without `manage_options`
- [ ] General panel: `gamesPerPage` number input + Save Changes button
- [ ] TriviaSmith Access panel: table of current TriviaSmiths (role badge, Revoke button);
    "Grant access to" free-text username input validated server-side against `get_users()`;
    Administrators shown as always-active (cannot revoke)
- [ ] About panel: read-only display of plugin name, version, WP minimum, PHP minimum,
    data storage strategy

**General**
- [ ] Admin UI axe-core clean (0 critical/serious violations)

#### User Stories

| As a...                     | I want to...                                                         |
|-----------------------------|----------------------------------------------------------------------|
| TriviaSmith                 | See all games (draft + published) in a filterable, searchable list   |
| TriviaSmith                 | Create a new game and save it as a draft                             |
| TriviaSmith                 | Edit the title, subtitle, tags, and all 5 questions of any game      |
| TriviaSmith                 | Reorder questions by dragging the grip handle                        |
| TriviaSmith                 | See a live image preview when I paste an answer image URL            |
| TriviaSmith                 | Click an image preview thumbnail to see it full-screen               |
| TriviaSmith                 | Preview the game exactly as players will see it before publishing     |
| TriviaSmith                 | Know when Publish is available (gate clears when all 5 Qs complete)  |
| TriviaSmith                 | Publish or unpublish a game with a single click (no confirmation)    |
| TriviaSmith                 | Move a game to Trash with a confirmation dialog (recoverable)        |
| Admin                       | Grant TriviaSmith access to any WP user via the Settings page        |
| Admin                       | Revoke TriviaSmith access from any user via the Settings page        |
| Admin                       | Configure `gamesPerPage` and view plugin About info on Settings page |
| Non-TriviaSmith WP user     | Not see "Trail Trivia" anywhere in the WP admin menu                 |

#### Acceptance Criteria

1. User without `manage_trail_trivia`: no Trail Trivia admin menu item visible
2. User with `manage_trail_trivia`: menu visible; full CRUD of games works
3. Contributor without cap: REST `POST` returns 403
4. Author + `manage_trail_trivia`: can create, edit, and move to trash any game
5. Game editor always shows exactly 5 question cards; no add/remove controls present
6. Publish/Update button is `disabled` with descriptive `title` when any question has
   empty `questionText` or any choice input is empty; enables when all 5 are complete
7. Unpublish: clicking "Change" → "Draft" in the Publish metabox requires no confirmation
8. Move to Trash: confirmation dialog required; after confirm, `GET /games` omits the game;
   game is recoverable from WP Trash (not permanently deleted)
9. Drag-to-reorder: dropping a question card renumbers all cards 01–05 correctly
10. Live image preview appears within one `input` event of pasting a valid URL
11. Clicking a visible image thumbnail opens a fullscreen lightbox; Escape closes it
12. Preview Game modal opens with live editor data (unsaved changes visible in preview)
13. Auto-save fires once per 60 s idle; autosave indicator updates in editor toolbar
14. Settings page: HTTP 403 for any user without `manage_options`; Settings nav item hidden
15. TriviaSmith Access: grant/revoke updates `manage_trail_trivia` cap on the WP user object
16. Admin UI axe-core: 0 critical/serious violations on game list, editor, and settings pages

#### Deterministic Tests

```bash
# Create test users
CONTRIB=$(wp user create testcontrib testcontrib@test.com --role=contributor --porcelain)
AUTHOR=$(wp user create tsauthor tsauthor@test.com --role=author --porcelain)

# Contributor has no cap
wp user list-caps $CONTRIB | grep manage_trail_trivia | wc -l
# Expected: 0

# Grant cap to author
wp user add-cap $AUTHOR manage_trail_trivia
wp user list-caps $AUTHOR | grep "manage_trail_trivia"
# Expected: "manage_trail_trivia	1"

# Revoke cap
wp user remove-cap $AUTHOR manage_trail_trivia
wp user list-caps $AUTHOR | grep manage_trail_trivia | wc -l
# Expected: 0

# Move to Trash via REST (not hard delete)
GAME_ID=$(wp post create --post_type=trail_trivia_game --post_title="Test" --post_status=publish --porcelain)
# DELETE endpoint should set post_status=trash, not force-delete
curl -s -X DELETE "http://localhost/wp-json/trail-trivia/v1/games/$GAME_ID" \
  -H "X-WP-Nonce: $ADMIN_NONCE" ...
wp post get $GAME_ID --field=post_status
# Expected: "trash" (not 404 — post still exists in trash)
curl -s http://localhost/wp-json/trail-trivia/v1/games | jq 'map(select(.id == "'$GAME_ID'")) | length'
# Expected: 0 (trashed game absent from public list)

# Settings page: 403 for non-admin (via REST)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost/wp-json/trail-trivia/v1/settings \
  -H "X-WP-Nonce: $AUTHOR_NONCE")
echo "Author GET settings: $HTTP_CODE"    # must be 403

# Settings page: admin can read and write
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost/wp-json/trail-trivia/v1/settings \
  -H "X-WP-Nonce: $ADMIN_NONCE")
echo "Admin GET settings: $HTTP_CODE"     # must be 200

curl -s -X PUT http://localhost/wp-json/trail-trivia/v1/settings \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: $ADMIN_NONCE" \
  -d '{"gamesPerPage": 20}' | jq '.gamesPerPage'
# Expected: 20

# PUT /settings must reject version field (read-only)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -X PUT http://localhost/wp-json/trail-trivia/v1/settings \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: $ADMIN_NONCE" \
  -d '{"gamesPerPage": 10, "version": "9.9.9"}')
# Expected: 400 (version is not an accepted settings field)

# Questions constraint: REST rejects game with != 5 questions
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  http://localhost/wp-json/trail-trivia/v1/games \
  -H "Content-Type: application/json" \
  -H "X-WP-Nonce: $ADMIN_NONCE" \
  -d '{"title":"Bad","status":"draft","questions":[]}')
echo "Zero questions POST: $HTTP_CODE"    # must be 400

# axe on admin UI pages
npx axe "http://localhost/wp-admin/admin.php?page=trail-trivia" --exit
npx axe "http://localhost/wp-admin/admin.php?page=trail-trivia-settings" --exit
# Expected: 0 violations each

# Cleanup
wp user delete $CONTRIB --yes
wp user delete $AUTHOR --yes
wp post delete $GAME_ID --force 2>/dev/null || true
```

---

### Phase 6 — Player Integration & Plugin Settings

**Goal:** The refactored React player is embedded in WordPress via `[trail_trivia]`
shortcode. Players notice zero UX change. No JavaScript conflicts with WP.

**Estimated effort:** 2–3 days

#### Deliverables

- [ ] `[trail_trivia]` shortcode registers and renders `<div id="trail-trivia-root"></div>`
- [ ] Shortcode PHP injects `window.trailTriviaConfig = { apiBase, nonce, ... }` inline
- [ ] Player React bundle enqueued via `wp_enqueue_script` (not hardcoded `<script>`)
- [ ] Player CSS enqueued via `wp_enqueue_style`
- [ ] HashRouter preserved — no server routing changes required
- [ ] Player tested against Twenty Twenty-Four theme (no style bleed)
- [ ] No JavaScript console errors on player page

#### Acceptance Criteria

1. `[trail_trivia]` on any WP page renders `#trail-trivia-root` in the page source
2. Player lists same games as `GET /wp-json/trail-trivia/v1/games`
3. Full quiz playthrough works: list → question → answer → score
4. Zero `console.error` / `console.warn` in browser on player page
5. Player JS loaded exactly once (no duplicate script tags)
6. `wp_enqueue_script` used — no raw `<script>` in PHP output
7. Twenty Twenty-Four theme active: player renders correctly (layout not broken)

#### Deterministic Tests

```bash
# Create test page with shortcode
PAGE_ID=$(wp post create \
  --post_type=page \
  --post_title="Trail Trivia" \
  --post_content="[trail_trivia]" \
  --post_status=publish \
  --porcelain)
PAGE_URL=$(wp post get $PAGE_ID --field=guid)

# Shortcode renders mount point
curl -s "$PAGE_URL" | grep -c 'id="trail-trivia-root"'
# Expected: 1

# Player JS loaded exactly once
curl -s "$PAGE_URL" | grep -c 'trail-trivia-player'
# Expected: 1

# Config injected
curl -s "$PAGE_URL" | grep -c 'trailTriviaConfig'
# Expected: 1

# No console errors (Playwright headless)
npx playwright test --reporter=line e2e/player-smoke.spec.ts
# Expected: all assertions pass (see e2e/ folder for test content)

# Cleanup
wp post delete $PAGE_ID --force
```

---

### Phase 7 — Data Migration & Launch

**Goal:** All existing games from `trivia.json` are imported into WordPress. The
live site is cut over. Players notice no change.

**Estimated effort:** 1–2 days

#### Deliverables

- [ ] WP-CLI command: `wp trail-trivia import <path/to/trivia.json>`
- [ ] Migration: preserves `id` (stored in `_trivia_original_id`), title, subtitle,
  author name, publish date, questions, tags
- [ ] Empty quizzes (blank `questionText` on all questions) are skipped with warning
- [ ] Migration report printed to stdout: `Imported: N, Skipped: M, Failed: 0`
- [ ] Idempotent: re-running skips already-imported games (checks `_trivia_original_id`)
- [ ] Cutover checklist (see below)

#### Cutover Checklist

```
[ ] Full database backup taken
[ ] Staging environment tested with production data
[ ] trivia.json imported on staging; player smoke-tested
[ ] All test users and test games deleted from staging
[ ] Production: activate trail-trivia plugin
[ ] Production: run wp trail-trivia import trivia.json
[ ] Production: verify game count matches expectation
[ ] Production: load https://gmcburlington.org/trail-trivia/ — game lists and plays
[ ] DNS / CDN cache purged if applicable
[ ] Monitor error log for 24 h post-launch
[ ] Old plugin/shortcode deactivated after 48 h grace period
```

#### Acceptance Criteria

1. Import on `trivia.json` completes without `Failed:` count > 0
2. All quizzes with at least one non-empty question are imported
3. Empty quizzes (all blank question text) produce "Skipped" warning, not error
4. `GET /wp-json/trail-trivia/v1/games` count equals expected published count
5. `_trivia_original_id` set on every imported post
6. Re-running import: counts match, no duplicates created
7. Player at production URL functions identically before and after cutover

#### Deterministic Tests

```bash
# Import
wp trail-trivia import /path/to/trivia.json
# Expected stdout contains: "Imported: N, Skipped: M (empty), Failed: 0"

# Count
IMPORTED=$(wp post list --post_type=trail_trivia_game --post_status=publish --format=count)
echo "Published games: $IMPORTED"
# Expected: matches count of non-empty published quizzes in trivia.json

# Original IDs preserved
MISSING=$(wp post list --post_type=trail_trivia_game --format=json \
  | jq '[.[] | select(.meta._trivia_original_id == null or .meta._trivia_original_id == "")] | length')
echo "Games missing original ID: $MISSING"
# Expected: 0

# Idempotency: re-run import
wp trail-trivia import /path/to/trivia.json
IMPORTED_2=$(wp post list --post_type=trail_trivia_game --post_status=publish --format=count)
[ "$IMPORTED" = "$IMPORTED_2" ] && echo "PASS: idempotent" || echo "FAIL: duplicates created"

# Player smoke test
curl -s http://localhost/wp-json/trail-trivia/v1/games | jq '. | length'
# Expected: equals $IMPORTED

curl -s https://gmcburlington.org/trail-trivia/ | grep -c 'trail-trivia-root'
# Expected: 1
```

---

## Appendix A — Capability Matrix

| WP Role            | TriviaSmith | Play | Admin Menu | Create Game | Edit Any Game | Delete Any Game | Plugin Settings | Grant TriviaSmith |
|--------------------|------------|------|------------|-------------|---------------|-----------------|-----------------|-------------------|
| (Logged out)       | —          | ✓    | ✗          | ✗           | ✗             | ✗               | ✗               | ✗                 |
| Subscriber         | ✗          | ✓    | ✗          | ✗           | ✗             | ✗               | ✗               | ✗                 |
| Contributor        | ✗          | ✓    | ✗          | ✗           | ✗             | ✗               | ✗               | ✗                 |
| Contributor        | ✓          | ✓    | ✓          | ✓           | ✓             | ✓               | ✗               | ✗                 |
| Author             | ✗          | ✓    | ✗          | ✗           | ✗             | ✗               | ✗               | ✗                 |
| Author             | ✓          | ✓    | ✓          | ✓           | ✓             | ✓               | ✗               | ✗                 |
| Editor             | ✗          | ✓    | ✗          | ✗           | ✗             | ✗               | ✗               | ✗                 |
| Editor             | ✓          | ✓    | ✓          | ✓           | ✓             | ✓               | ✗               | ✗                 |
| Administrator      | (implicit) | ✓    | ✓          | ✓           | ✓             | ✓               | ✓               | ✓                 |

> **Note:** The `manage_trail_trivia` capability grants identical CRUD access regardless
> of WP role. The WP role controls only non-trivia WordPress permissions. Administrators
> always pass `manage_trail_trivia` checks without needing the explicit cap.

---

## Appendix B — Target Directory Structure

### React App (Vite)

```
react-app/
  src/
    data/
      trivia-api.ts           ← fetchGames(), fetchGame(id), fetchAllGames()
    domain/
      types/
        choice.type.ts
        question.type.ts
        quiz.type.ts
        app-user.type.ts
        plugin-settings.type.ts
        index.ts
      factories/
        choice.factory.ts
        question.factory.ts
        quiz.factory.ts
        index.ts
      transforms/
        quiz.transforms.ts    ← sort by date, filter by status, filter by tags
        question.transforms.ts
        index.ts
    store/
      index.ts                ← configureStore
      games/
        games.slice.ts
        games.selectors.ts
        games.thunks.ts
      session/
        session.slice.ts      ← active quiz, score, current question index
        session.selectors.ts
    components/               ← Dumb / presentational
      ChoiceButton/
        ChoiceButton.tsx
        ChoiceButton.test.tsx
        styles.module.css
        index.ts
      Carousel/
        Carousel.tsx
        Carousel.test.tsx
        styles.module.css
        index.ts
      QuizCard/
      ActionButton/
      LogoSpinner/
      SocialButtons/
      ProgressBar/
    features/                 ← Smart / stateful
      home/
      quiz-list/
      quiz/
      score/
    app/
      App.tsx
      App.test.tsx
      router.tsx
      ErrorBoundary.tsx
  index.html
  vite.config.ts
  vitest.config.ts
  tsconfig.json
  .env
  .env.production
```

### WordPress Plugin

```
wp-plugin/trail-trivia/
  trail-trivia.php
  uninstall.php
  includes/
    class-post-type.php
    class-rest-api.php
    class-capabilities.php
    class-settings.php
    class-admin-ui.php
    class-shortcode.php
    class-cli-command.php
  assets/
    player/
      index.js
      index.css
    admin/
      index.js
      index.css
  templates/
    shortcode.php
    admin-page.php
  languages/
    trail-trivia.pot
```
