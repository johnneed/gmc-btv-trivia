# Feature Specification: WP Plugin — CPT, Taxonomy & REST API

**Feature Branch**: `005-wp-plugin-cpt-rest-api`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "the first three phases of MIGRATION_PLAN.md should be complete. I need to effect phase 4 of the migration plan"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Players Retrieve Published Games (Priority: P1)

Any visitor to the GMC Burlington Trail Trivia page can request the list of published games and receive a complete, correctly structured response — without signing in or providing any credentials.

**Why this priority**: This is the core public-facing read path. Without it, the React player app (Phase 3) has no live data to display. It is the prerequisite for every other Phase 4 acceptance criterion and is the simplest proof that the WordPress plugin data layer is functional.

**Independent Test**: On a fresh WordPress install with the trail-trivia plugin active and at least one published game, make an unauthenticated HTTP GET request to the games list endpoint. The response is a JSON array of games in the correct shape. Make the same request with no published games; the response is an empty array, not an error.

**Acceptance Scenarios**:

1. **Given** the plugin is active on a fresh WordPress install with no games, **When** an unauthenticated request is made for the published games list, **Then** the response is an empty JSON array `[]` with HTTP 200.
2. **Given** one published game exists in WordPress, **When** an unauthenticated request is made for the games list, **Then** the response contains exactly that game with all required fields matching the domain schema (id, title, subtitle, author, authorId, publishDate, status, questions, tags).
3. **Given** a game exists as a draft (not published), **When** an unauthenticated request is made for the games list, **Then** the draft game does NOT appear in the response.
4. **Given** a published game id is known, **When** an unauthenticated request is made for that single game, **Then** the response is the full game object in the correct shape with HTTP 200.
5. **Given** a request is made for a game id that does not exist or is not published, **When** the server processes the request, **Then** the response is HTTP 404 with a descriptive error message.

---

### User Story 2 - TriviaSmith Contributors Manage Games (Priority: P2)

A WordPress user with the `manage_trail_trivia` capability can create, read, update, and delete trail trivia games through the REST API. Unauthenticated or insufficiently privileged requests are rejected before any data is changed.

**Why this priority**: This is the write path that the TriviaSmith admin UI (Phase 5) will use entirely. Every admin action — creating a new quiz, saving edits, publishing, unpublishing, trashing — flows through these endpoints. Security must be enforced at the API level, not just the UI level.

**Independent Test**: Using WP-CLI or curl with a valid admin nonce, create a game, verify it appears in the games list, update its title, verify the update, then move it to trash, verify it no longer appears in the public list (but still exists in trash). Repeat each write operation without authentication and confirm HTTP 401. Repeat with a logged-in user who lacks the capability and confirm HTTP 403.

**Acceptance Scenarios**:

1. **Given** an unauthenticated request attempts to create a game, **When** the server processes it, **Then** the response is HTTP 401.
2. **Given** an authenticated user WITHOUT `manage_trail_trivia` attempts to create a game, **When** the server processes it, **Then** the response is HTTP 403.
3. **Given** a user WITH `manage_trail_trivia` creates a game with valid data, **When** the request succeeds, **Then** the response is HTTP 201 with the created game; a subsequent GET request returns the game.
4. **Given** a user WITH `manage_trail_trivia` submits a game with a malformed `questions` field (not an array, wrong count, missing required fields), **When** the server validates the input, **Then** the response is HTTP 400 with a machine-readable error `code` and descriptive `message`.
5. **Given** a user WITH `manage_trail_trivia` updates a published game's title, **When** the update succeeds, **Then** a subsequent GET returns the game with the new title.
6. **Given** a user WITH `manage_trail_trivia` moves a game to trash, **When** the delete completes, **Then** the game no longer appears in the public games list; the game still exists in WordPress trash (recoverable).
7. **Given** a user WITH `manage_trail_trivia` requests all games (including drafts), **When** the authenticated request succeeds, **Then** the response includes both published and draft games.
8. **Given** any write request arrives without a valid WordPress nonce, **When** the server verifies the nonce, **Then** the request is rejected before any data is changed.

---

### User Story 3 - Game Data is Stored Correctly in WordPress (Priority: P3)

All game data — title, subtitle, author, publish date, questions, tags — is stored in WordPress using the Custom Post Type structure defined in the domain model and retrieved in a shape that exactly matches the `Quiz` TypeScript type from the React app.

**Why this priority**: Data integrity between the PHP storage layer and the React type system is what makes the whole stack work without a client-side transformation layer. If a field name is wrong, cased differently, or structured unexpectedly, the React app silently breaks. This story verifies the contract.

**Independent Test**: Create a game through the REST API. Retrieve it. Validate the response JSON against the `Quiz` type schema (id, title, subtitle, author, authorId, publishDate as Unix milliseconds, status, questions array of exactly 5 with all required sub-fields, tags array). Verify that quiz-level tags are stored in both the `trivia_tag` taxonomy and the `_trivia_tags` post meta field (the denormalized copy).

**Acceptance Scenarios**:

1. **Given** a game is created with tags, **When** the game is retrieved, **Then** the `tags` field is an array of strings matching what was submitted; the tags are also registered as `trivia_tag` taxonomy terms on the post.
2. **Given** a game is created, **When** the game is retrieved, **Then** `publishDate` is expressed as a Unix millisecond timestamp (not an ISO string, not a WordPress datetime string).
3. **Given** a game is created with questions, **When** the game is retrieved, **Then** each question in `questions` has the fields: `id`, `questionText`, `choices` (array of 4, each with `id` and `text`), `correctAnswerIndex`, `answerText`; optional fields `answerImage`, `answerImageAlt`, `answerImageCaption` are present when provided.
4. **Given** a game is created, **When** the game is retrieved, **Then** the response shape is identical to the `Quiz` TypeScript type — no extra fields, no missing required fields, correct casing on all property names.
5. **Given** a game is installed on WordPress 6.4, **When** all REST endpoints are exercised, **Then** they behave identically to WordPress 6.5 (no version-specific breakage).

---

### Edge Cases

- What happens when a game has no questions (empty array on creation)? The endpoint must return HTTP 400 — questions are required and must be exactly 5.
- What happens when a game is in WordPress trash and a GET request is made for it by id? HTTP 404 for public users; HTTP 404 or a trashed game response for `manage_trail_trivia` users (trashed = not accessible via API).
- What happens when the `questions` array has valid structure but `correctAnswerIndex` is out of range (e.g., 5 when choices has 4 items)? HTTP 400 with descriptive error.
- What happens when a `PUT` request includes `version` as a settings field? The endpoint returns HTTP 400 with a machine-readable `code` — `version` is read-only and any unrecognized or read-only field in the PUT settings body is treated as a validation error, not silently ignored.
- What happens when `publishDate` is submitted as a future date? The plugin stores it as submitted; filtering (future-dated games not shown publicly) is handled by `filterPublished` — but Phase 3's client-side filter was removed in favour of server-side filtering, so the server must only return games with `publishDate <= now` in the public endpoint.
- What happens when the nonce is valid but has expired (>12 hours)? WordPress nonce verification fails; response is HTTP 401 or 403 depending on WordPress's behaviour.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The WordPress plugin MUST register a `trail_trivia_game` Custom Post Type that is not publicly visible in front-end archives or navigation menus — only accessible via the REST API.
- **FR-002**: The plugin MUST register a `trivia_tag` taxonomy attached to `trail_trivia_game`, non-hierarchical, not displayed in tag clouds or front-end menus.
- **FR-003**: The plugin MUST define the `manage_trail_trivia` capability as the gate for all game creation, modification, and deletion. WordPress Administrators always pass this check implicitly.
- **FR-004**: The plugin MUST expose 9 REST API endpoints under `/wp-json/trail-trivia/v1/` as specified in MIGRATION_PLAN.md Section 3.2 (GET games, GET game by id, GET all games, POST game, PUT game, PATCH game, DELETE game, GET settings, PUT settings). The PATCH endpoint accepts exactly three fields: `status` (`"draft"` or `"published"`), `title` (string), and `tags` (array of strings). All other fields in a PATCH request body MUST be ignored. PUT accepts the full game schema.
- **FR-005**: The public games list endpoint (`GET /games`) MUST return only games with status `published` and `publishDate` at or before the current date and time. Draft games MUST NOT appear without the `manage_trail_trivia` capability.
- **FR-006**: Every write endpoint (POST, PUT, PATCH, DELETE) MUST verify a valid WordPress nonce from the `X-WP-Nonce` request header before processing. Requests without a valid nonce MUST be rejected.
- **FR-007**: Every write endpoint MUST check that the requesting user has the `manage_trail_trivia` capability before executing. Unauthenticated requests return HTTP 401; authenticated users without the capability return HTTP 403.
- **FR-008**: Every write endpoint MUST sanitize all text inputs before storage and escape all outputs on retrieval.
- **FR-009**: The `questions` field on POST and PUT requests MUST be validated: it must be a JSON array of exactly 5 items; each item must have `questionText` (non-empty string), `choices` (array of exactly 4 items each with non-empty `text`), `correctAnswerIndex` (integer 0–3), and `answerText` (non-empty string). Any violation MUST return HTTP 400 with a machine-readable `code` field.
- **FR-010**: All API responses for game data MUST match the `Quiz` JSON shape exactly as defined in MIGRATION_PLAN.md Section 1.3 — field names, casing, nesting, and types must be identical to what the React `Quiz` TypeScript type expects.
- **FR-011**: The `publishDate` field in all API responses MUST be a Unix millisecond timestamp (integer), not an ISO string or WordPress datetime format. On POST and PUT requests, the client MUST submit `publishDate` as a Unix millisecond integer; the plugin converts to WordPress datetime for storage and back to Unix ms for responses. Submitting `publishDate` in any other format MUST return HTTP 400.
- **FR-012**: Quiz-level tags MUST be stored in both the `trivia_tag` taxonomy (for WP-native filtering) and the `_trivia_tags` post meta field (denormalized JSON array for API response speed). Both MUST be kept in sync on every save.
- **FR-013**: The `DELETE` endpoint MUST move the game to WordPress trash (recoverable) — it MUST NOT permanently delete the post.
- **FR-014**: All error responses from the plugin MUST use `WP_Error` with a descriptive `code` (machine-readable) and `message` (human-readable). No endpoint may use `wp_die()` for expected error conditions.
- **FR-015**: The plugin MUST function correctly on both WordPress 6.4 and WordPress 6.5.
- **FR-016**: The PUT `/settings` endpoint MUST accept exactly one writable field: `gamesPerPage` (positive integer). Any request body that contains a field other than `gamesPerPage` — including read-only fields such as `version`, `wpMinimum`, or `phpMinimum` — MUST return HTTP 400 with a machine-readable `code`.

### Key Entities

- **Trail Trivia Game** (`trail_trivia_game` post): The primary content unit. Fields: `post_title` (game title), `post_excerpt` (subtitle), `post_author` (WP user ID), `post_status` (`publish`/`draft`/`trash`), `post_date` (publish date). Post meta: `_trivia_questions` (JSON-encoded questions array), `_trivia_tags` (JSON-encoded tags array), `_trivia_schema_version` (migration version), `_trivia_original_id` (UUID from pre-migration data).
- **Trivia Tag** (`trivia_tag` taxonomy term): A quiz-level label. Stored as a WP taxonomy term AND denormalized into `_trivia_tags` post meta for fast API reads.
- **`manage_trail_trivia` Capability**: A WordPress capability string granting full CRUD access to any `trail_trivia_game`, regardless of the user's WP role. Administrators always pass; all other roles must have the capability explicitly granted.
- **Settings** (`PluginSettings`): `gamesPerPage` (integer, user-editable). `version`, `wpMinimum`, `phpMinimum` are read-only metadata returned alongside settings but MUST NOT be accepted as PUT body fields.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `GET /wp-json/trail-trivia/v1/games` on a fresh install returns `[]` with HTTP 200 (no auth required, no server error).
- **SC-002**: A game created via authenticated POST appears in the response of a subsequent unauthenticated GET with the correct shape.
- **SC-003**: An unauthenticated POST to create a game returns HTTP 401. An authenticated POST from a user without `manage_trail_trivia` returns HTTP 403.
- **SC-004**: A POST with a `questions` array that has fewer or more than 5 items returns HTTP 400 with a non-empty `code` field.
- **SC-005**: A trashed game (via DELETE) no longer appears in the public GET games list; the WP post still exists in trash (`post_status = 'trash'`).
- **SC-006**: The `publishDate` in every game response is an integer (Unix milliseconds), verifiable by `typeof response.publishDate === 'number'`. A POST or PUT request that submits `publishDate` as a non-integer string returns HTTP 400.
- **SC-007**: The full Phase 4 deterministic test block from `MIGRATION_PLAN.md` exits 0 on every command on both WP 6.4 and WP 6.5.
- **SC-007a**: A PUT `/settings` request body containing `{ "gamesPerPage": 10, "version": "9.9.9" }` returns HTTP 400.
- **SC-008**: A PHP syntax check (`php -l`) returns no errors for all files in `wp-plugin/trail-trivia/`.

## Clarifications

### Session 2026-06-26

- Q: Which fields does the PATCH endpoint accept? → A: `status`, `title`, and `tags` — lightweight partial update; all other fields in the request body are ignored; full updates use PUT.
- Q: What format does the API accept for `publishDate` on POST/PUT? → A: Unix millisecond integer — same format as the response; the plugin converts to/from WP datetime on the server side; any other format returns HTTP 400.
- Q: When PUT `/settings` receives an unrecognized or read-only field (e.g. `version`), should it return HTTP 400 or silently ignore it? → A: HTTP 400 — strict validation; any field that is not `gamesPerPage` causes a 400 with a machine-readable `code`.

## Assumptions

- Phase 0 created the plugin stub: `trail-trivia.php` has a valid plugin header, and all `includes/class-*.php` files exist with empty class bodies. This phase fills those bodies with working code.
- Phase 4 does not build the admin UI or shortcode — those are Phase 5 and Phase 6. The REST API tested in Phase 4 is verified via `curl` and WP-CLI only.
- A local WordPress development environment (e.g., Local by Flywheel or MAMP) with WP-CLI is available for running the Phase 4 deterministic test block.
- WordPress 6.4 and 6.5 are both available for testing. The implementation must pass on both.
- The `manage_trail_trivia` capability is NOT auto-assigned to any role during plugin activation — it must be explicitly granted via WP-CLI or the Settings UI (built in Phase 5). Administrators always pass the check implicitly via WordPress's `manage_options` super-admin logic.
- JSON Schema validation of the `questions` array is implemented in PHP within `class-rest-api.php` using WordPress's built-in REST API schema validation (`register_rest_field` / `validate_callback`), not a third-party library.
- The `_trivia_schema_version` meta key is set to `"1.0"` on all new games created in Phase 4. It is reserved for future migration use.
- Soft-delete (trash) is the only deletion method exposed via the API. Hard-delete (permanent) is available only via the WP admin Trash screen, not the REST API.
