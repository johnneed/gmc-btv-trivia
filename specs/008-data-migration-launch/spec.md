# Feature Specification: Data Migration & Launch

**Feature Branch**: `008-data-migration-launch`

**Created**: 2026-06-27

**Status**: Draft

**Input**: User description: "let's do the 7th phase of the MIGRATION_PLAN.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Site Administrator Imports All Existing Games (Priority: P1)

A site administrator runs a single command that reads the existing `trivia.json` data file and imports every valid game into WordPress. After the command completes, all games that were previously served from the static file now live in WordPress as properly structured content, with their original identifiers preserved so they can be referenced consistently across systems.

**Why this priority**: This is the irreversible cutover step that moves the live site from a static data file to a live CMS. Getting it right — preserving all game data, maintaining IDs, and reporting accurately — is the entire purpose of Phase 7. Without this, the migration is incomplete and the player app is pointing at an API that has no data.

**Independent Test**: Run the import command against a copy of the production `trivia.json`. Confirm: (1) the number of imported games matches the count of non-empty games in the file, (2) each imported game can be retrieved via the REST API and its data matches the source exactly, (3) the original `id` from `trivia.json` is preserved as the game's identifier, (4) running the command a second time produces zero new imports (idempotent).

**Acceptance Scenarios**:

1. **Given** a valid `trivia.json` file is provided, **When** the import command runs, **Then** it prints a completion report in the format `Imported: N, Skipped: M, Failed: 0` to standard output.
2. **Given** a game has been imported, **When** the REST API is queried for the game by its original ID, **Then** the response contains the same title, subtitle, questions, tags, author name, and publish date as the source file.
3. **Given** the import command has already been run once, **When** it is run again against the same file, **Then** the report shows `Imported: 0, Skipped: M` — no duplicate games are created.
4. **Given** a game was imported with its original `trivia.json` UUID, **When** that UUID is used as the game identifier in the REST API, **Then** the correct game is returned.
5. **Given** the import completes, **When** the REST API's published games list is requested, **Then** the game count equals the number of published, non-empty games from `trivia.json`.

---

### User Story 2 - Empty and Incomplete Games Are Skipped Safely (Priority: P2)

The `trivia.json` file may contain placeholder or incomplete games where all question text fields are blank. The import command skips these games with a descriptive warning and continues processing the rest — it never terminates early due to a skipped game.

**Why this priority**: The source data file has been built up over time and may contain partially-filled entries that were never published. Treating these as errors would block the entire migration. Skipping them with a clear warning gives the administrator visibility without stopping the import.

**Independent Test**: Add a game with all blank `questionText` fields to a test version of `trivia.json`. Run the import. Confirm: (1) the empty game does NOT appear in the WordPress game list, (2) the completion report counts it in `Skipped: M`, (3) all other valid games ARE imported, (4) the command exits successfully (not with an error code).

**Acceptance Scenarios**:

1. **Given** `trivia.json` contains a game where every question's `questionText` is empty or whitespace, **When** the import command runs, **Then** that game is not created in WordPress and the skipped count increments by 1.
2. **Given** a game is skipped, **When** the command runs, **Then** a descriptive warning is printed to standard output identifying the skipped game by its title or ID.
3. **Given** a mix of valid and empty games in the file, **When** the import runs, **Then** valid games are imported and empty games are skipped — the command completes and prints the final report without aborting.
4. **Given** a game with some questions filled and some blank, **When** the import command evaluates it, **Then** the game is treated as valid (not empty) if at least one question has non-empty text — it is imported with its partial data intact.

---

### User Story 3 - Players Experience Zero Disruption After Cutover (Priority: P3)

After the import is verified on staging, the administrator follows the cutover checklist to switch the live site from the static data file to WordPress. Players visiting the GMC Burlington Trail Trivia page before and after the cutover see the same games, in the same order, with the same content — they notice no change.

**Why this priority**: The cutover is the highest-risk moment of the entire migration project. A structured checklist — with backup, staging verification, and post-launch monitoring steps — reduces the risk of data loss or player-visible disruption. The spec must define what "success" looks like for the player.

**Independent Test**: Load the live Trail Trivia page before cutover and record the game titles and count. Perform the cutover. Reload the page immediately after. Confirm: the same game titles are present, quiz playthrough works end-to-end (select a game → 5 questions → score), and no JavaScript errors appear in the browser console.

**Acceptance Scenarios**:

1. **Given** the cutover has been completed, **When** a player loads the Trail Trivia page, **Then** the game list contains the same games (by title and content) that were available before cutover.
2. **Given** the cutover has been completed, **When** a player completes a full quiz, **Then** all 5 questions display correctly, the correct answers are accepted, and the score screen appears without error.
3. **Given** the old plugin or shortcode is still active during the grace period, **When** both old and new systems serve the same page, **Then** only one version is active (the new one) — the old shortcode is deactivated before the 48-hour grace period ends.
4. **Given** the production import has run, **When** the game count in WordPress is compared to the expected count from `trivia.json`, **Then** the counts match (within the expected number of skipped empty games).

---

### Edge Cases

- What happens if `trivia.json` is malformed JSON? The command exits with a non-zero code and prints an error message; no partial imports are created.
- What happens if the file path provided to the import command does not exist? The command exits with a non-zero code and a clear "file not found" error before attempting any imports.
- What happens if a game in `trivia.json` has fewer than 5 questions? The game is imported with however many questions it has — the import command does not enforce the 5-question constraint (that is the editor's job). A warning is printed noting the question count.
- What happens if the WordPress database is unavailable during import? The command exits immediately with an error; no partial state is left.
- What happens if a game's author name in `trivia.json` does not match any WordPress user? The game is imported with the author name stored in the question metadata as-is; the WordPress `post_author` is set to the currently logged-in WP-CLI user (the administrator running the import).
- What happens if a game has tags that do not yet exist as `trivia_tag` taxonomy terms? The terms are created automatically during import — they do not need to pre-exist.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a command-line import tool invokable as `wp trail-trivia import <path/to/trivia.json>`.
- **FR-002**: The import command MUST read and parse the provided JSON file, iterating over all games it contains.
- **FR-003**: For each game, the import MUST preserve: the original `id` (stored as `_trivia_original_id`), title, subtitle, author name (as display name, not WP user lookup), publish date (as `post_date`), `status` (mapped to `post_status`), all questions with their choices and answer data, and all quiz-level tags.
- **FR-004**: The import MUST be idempotent: before creating a new WordPress post for a game, it MUST check whether a post with the same `_trivia_original_id` already exists. If it does, that game is counted as skipped, not duplicated.
- **FR-005**: The import MUST skip any game where every question's `questionText` is empty or contains only whitespace. A warning identifying the skipped game MUST be printed to standard output.
- **FR-006**: The import MUST print a completion summary to standard output in the exact format: `Imported: N, Skipped: M, Failed: 0` where N is the count of newly created games, M is the count of skipped games (empty + already-existing), and the Failed count MUST be 0 for the command to exit successfully.
- **FR-007**: If any game fails to import due to an unexpected error, the import MUST continue processing the remaining games and increment the Failed count. The command MUST exit with a non-zero code if `Failed > 0`.
- **FR-008**: The import MUST create `trivia_tag` taxonomy terms for any tags that do not already exist, and associate them with the imported game post.
- **FR-009**: The import MUST set `_trivia_schema_version` to `"1.0"` on each imported post.
- **FR-010**: The import command MUST exit with a non-zero code and a descriptive error message if the provided file path does not exist or cannot be read.
- **FR-011**: The import command MUST exit with a non-zero code and a descriptive error message if the file contains invalid JSON.
- **FR-012**: The cutover checklist MUST be executed in order before the production import. The checklist includes: full database backup, staging environment test with production data, player smoke test on staging, cleanup of test data, plugin activation on production, import on production, game count verification, live site smoke test, CDN/cache purge if applicable, 24-hour error log monitoring, and deactivation of the old plugin/shortcode after a 48-hour grace period.

### Key Entities

- **`trivia.json`** (source): The existing static data file containing all historical Trail Trivia games. Structure: `{ quizzes: Quiz[] }` where each `Quiz` matches the domain type defined in MIGRATION_PLAN.md Section 1. This is the authoritative source for the migration.
- **Imported Game** (`trail_trivia_game` post): A WordPress post created from a `trivia.json` entry. Has `_trivia_original_id` set to the source UUID, and all other meta from Phase 4's schema.
- **Skipped Game**: A game that was NOT imported, either because it was already present (`_trivia_original_id` exists) or because all its questions were empty. Counted in the `Skipped` total.
- **Failed Game**: A game that the command attempted to import but could not due to an unexpected error. Should be 0 in a successful migration run.
- **Cutover Checklist**: A mandatory ordered sequence of steps that must be completed to safely transition the live site from `trivia.json` to WordPress. Not automated — executed manually by the site administrator.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Running `wp trail-trivia import trivia.json` against the production data file completes with `Failed: 0` in the output.
- **SC-002**: The number of games returned by `GET /wp-json/trail-trivia/v1/games` after import equals the expected count of published, non-empty games in `trivia.json`.
- **SC-003**: Every imported game has `_trivia_original_id` set to a non-empty UUID string, verifiable via WP-CLI: `wp post meta get {id} _trivia_original_id`.
- **SC-004**: Running the import command a second time against the same file produces `Imported: 0` in the output (no duplicates created).
- **SC-005**: The Trail Trivia player at the production URL loads and completes a full quiz end-to-end after cutover, with zero `console.error` / `console.warn` in the browser.
- **SC-006**: The full Phase 7 deterministic test block from `MIGRATION_PLAN.md` exits 0 on every command.

## Assumptions

- Phases 0–6 are complete: the WordPress plugin is active, the REST API is live, and the `trail_trivia_game` CPT and `trivia_tag` taxonomy are registered.
- The `trivia.json` file follows the structure `{ quizzes: Quiz[] }` based on the existing `trivia.factory.ts` shape in the legacy `src/models/factories/` directory (now removed). The top-level key is `quizzes`, not an array at the root level.
- The `Trail_Trivia_CLI_Command` class stub already exists in `wp-plugin/trail-trivia/includes/class-cli-command.php` from Phase 0. This phase fills that stub.
- The WP-CLI command is registered under the `trail-trivia` namespace, making the full invocation `wp trail-trivia import <file>`.
- Author attribution: `trivia.json` games have an `author` field (display name string). The import stores this as the post's author display name concept, but since WordPress requires a numeric user ID for `post_author`, the post is created with the current WP-CLI user as `post_author`. The original author name is preserved in the game's denormalized `author` field in the REST API response via the post meta or the `post_author`'s display name.
- A game is considered "empty" (and therefore skipped) only when ALL questions have blank `questionText`. A game with any non-empty question text is imported.
- The `trivia.json` file does NOT need to be physically present in the WordPress installation — the administrator provides the full path as a command argument. This allows importing from a downloaded backup or a local file.
- The old plugin/shortcode currently serving the live site is a separate, pre-existing WordPress plugin (not the new trail-trivia plugin being built in this migration). Deactivating it after the 48-hour grace period is a manual step in the cutover checklist.
