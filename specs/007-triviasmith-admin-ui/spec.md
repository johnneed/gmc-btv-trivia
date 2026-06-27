# Feature Specification: TriviaSmith Admin UI

**Feature Branch**: `007-triviasmith-admin-ui`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "let's do phase 5 of MIGRATION_PLAN.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - TriviaSmith Finds and Acts on Games (Priority: P1)

A TriviaSmith logs in to the WordPress admin and immediately sees a "Trail Trivia" menu item in the left sidebar. Clicking it shows a table of all games (published and draft), with tools to filter by status and search by title. From this list, they can navigate to edit any game, trash it, or create a new one.

**Why this priority**: The game list is the entry point to the entire admin experience. Without it, a TriviaSmith has no way to find or manage existing games. It also enforces the capability model — only users with `manage_trail_trivia` see the menu and list at all.

**Independent Test**: Log in as a user with `manage_trail_trivia`. Confirm the "Trail Trivia → All Games" menu item is visible. Confirm the game list shows all games (draft and published). Filter by "Draft" — only draft games appear. Search by a partial title — only matching games appear. Hover a row — "Edit" and "Trash" row actions appear. Click "Add New Game" — blank editor opens. Log out, log in as a user WITHOUT the capability — confirm no Trail Trivia menu item appears.

**Acceptance Scenarios**:

1. **Given** a user with `manage_trail_trivia` logs in to WP admin, **When** they look at the left sidebar, **Then** "Trail Trivia" with a sub-item "All Games" is visible.
2. **Given** a user WITHOUT `manage_trail_trivia`, **When** they log in to WP admin, **Then** no Trail Trivia menu item appears anywhere in the admin navigation.
3. **Given** the game list page is open, **When** the TriviaSmith selects the "Draft" filter tab, **Then** only draft games appear in the table.
4. **Given** the game list page is open, **When** the TriviaSmith types in the search box and presses Enter or clicks "Search", **Then** the table updates to show only games whose title contains the search term (case-insensitive).
5. **Given** a game row is hovered, **When** the TriviaSmith looks at the row, **Then** "Edit" and "Trash" actions appear beneath the game title.
6. **Given** the TriviaSmith clicks "Trash" on a game row, **When** they confirm the confirmation dialog, **Then** the game moves to trash and disappears from the list.
7. **Given** the game list is open, **When** the TriviaSmith clicks "Add New Game", **Then** they are taken to the game editor with a blank, unsaved game.

---

### User Story 2 - TriviaSmith Creates and Edits Game Content (Priority: P2)

The game editor gives a TriviaSmith a complete interface to write or revise a game: title, subtitle, exactly 5 questions in an accordion (each with question text, 4 choices with a correct-answer selector, explanation text, and an optional image with preview), plus quiz-level tags. Questions can be reordered by dragging. A "← All Games" link in the toolbar returns to the list without losing navigation state.

**Why this priority**: Content creation is the core purpose of the TriviaSmith role. Without a working editor, games cannot be created or updated. The accordion pattern with exactly 5 locked cards matches the domain constraint (every quiz has exactly 5 questions, no add/remove).

**Independent Test**: Open the editor for a new game. Fill in the title and subtitle. Expand question card 1 — fill in question text, all 4 choices, mark the correct answer, fill in the explanation. Paste an image URL — a 160×120 px thumbnail appears within one keystroke. Click the thumbnail — a fullscreen lightbox opens; press Escape — it closes. Drag question card 3 above card 2 — the cards renumber 01–05 correctly. Add a tag "hiking" — it appears as a chip. Remove the tag — it disappears. Click "← All Games" — returns to list.

**Acceptance Scenarios**:

1. **Given** the editor is open, **When** the TriviaSmith fills in the title field, **Then** the title updates in place (large display text, not a small input).
2. **Given** the editor has 5 question cards, **When** the TriviaSmith clicks a collapsed card header, **Then** the card expands to reveal question text, 4 choice inputs, a correct-answer radio selector, answer explanation, and optional image fields.
3. **Given** a question card is expanded and has a valid URL in the image field, **When** the TriviaSmith types or pastes the URL, **Then** a 160×120 px thumbnail preview appears within one input event (no submit required).
4. **Given** a thumbnail preview is visible, **When** the TriviaSmith clicks it, **Then** a full-screen lightbox opens showing the image at full size; clicking outside the image, pressing Escape, or clicking the × button closes the lightbox.
5. **Given** the questions accordion has 5 cards, **When** the TriviaSmith drags a card by its six-dot grip handle and drops it at a new position, **Then** all cards renumber 01–05 in their new order.
6. **Given** the tags metabox is visible, **When** the TriviaSmith types a tag and confirms it, **Then** it appears as a chip; clicking the chip's remove control deletes it.
7. **Given** the editor is open, **When** the TriviaSmith clicks "← All Games" in the toolbar, **Then** they return to the game list.

---

### User Story 3 - TriviaSmith Publishes, Unpublishes, and Previews Games (Priority: P3)

The editor's sidebar shows the current publish status, publish date, and author. The TriviaSmith can save a draft, publish (when all 5 questions are complete), unpublish instantly, or move to trash with a confirmation. A "Preview Game" button opens a full-screen modal showing exactly what players will see — using live editor data, not the last-saved version. Auto-save fires every 60 seconds while the editor is open.

**Why this priority**: Publishing control and preview are the final steps before a game goes live. The publish gate (all 5 questions complete) prevents accidentally publishing incomplete games. Preview lets TriviaSmiths see the player experience before committing. Auto-save protects against data loss.

**Independent Test**: Open a new game. Confirm "Publish/Update" button is disabled and shows a tooltip explaining why. Fill in title and all 5 questions completely — confirm the button enables. Click "Preview Game" — a full-screen modal opens showing the player UI with the current (unsaved) game data. Close preview. Click "Save Draft" — game is saved as draft; page title updates to show saved state. Click "Publish/Update" — game status changes to Published. Click "Change" next to Published status — status immediately changes to Draft, no confirmation dialog. Click the trash icon button — a confirmation dialog appears; confirm — game moves to trash. Check WP trash — game is recoverable.

**Acceptance Scenarios**:

1. **Given** any question card has an empty `questionText` or any choice input is empty, **When** the TriviaSmith looks at the Publish/Update button, **Then** the button is disabled and shows a descriptive tooltip explaining which questions are incomplete.
2. **Given** all 5 questions are fully filled, **When** the TriviaSmith looks at the Publish/Update button, **Then** the button is enabled.
3. **Given** the editor has unsaved changes, **When** the TriviaSmith clicks "Preview Game", **Then** a full-screen modal opens showing the game player using the current (unsaved) editor state — not the last-saved version.
4. **Given** a game is published, **When** the TriviaSmith clicks "Change" next to the "Published" status indicator, **Then** the status immediately changes to "Draft" with no confirmation dialog.
5. **Given** the editor is open, **When** 60 seconds elapse without a manual save, **Then** the draft is automatically saved and the editor toolbar shows an autosave confirmation indicator.
6. **Given** the TriviaSmith clicks the trash icon button in the sidebar, **When** they confirm the confirmation dialog, **Then** the game moves to WordPress trash (recoverable) and the editor navigates back to the game list.

---

### User Story 4 - Administrator Controls TriviaSmith Access and Plugin Settings (Priority: P4)

A WordPress Administrator accesses a Settings page (hidden from non-Admins) with three panels: General (pagination setting), TriviaSmith Access (grant/revoke the `manage_trail_trivia` capability per user), and About (read-only plugin information). Administrators are always shown as having access and cannot be revoked. Granting access to a username that does not exist produces a clear error message.

**Why this priority**: Without a settings page, the only way to grant TriviaSmith access is via WP-CLI — a barrier that prevents non-technical site administrators from managing contributors. The settings page is also the self-describing entry point that explains the plugin's scope.

**Independent Test**: Log in as Administrator. Navigate to Trail Trivia → Settings. Change `gamesPerPage` to 20, click Save — value persists on reload. In TriviaSmith Access: enter a valid WP username and click Grant — they appear in the access table with a Revoke button. Click Revoke — they disappear. Enter a non-existent username — a clear error message appears without page reload. The Administrator row shows "Always Active" with no Revoke button. In About — version, WP minimum, PHP minimum, data storage description are displayed read-only. Log in as a TriviaSmith (non-Admin) — Settings menu item is not visible.

**Acceptance Scenarios**:

1. **Given** the Settings page is open with the General panel, **When** the Administrator changes `gamesPerPage` to a valid number and clicks "Save Changes", **Then** the value persists after page reload.
2. **Given** the TriviaSmith Access panel is open, **When** the Administrator enters a valid WordPress username and clicks "Grant", **Then** that user appears in the access table with a "Revoke" button and a role badge.
3. **Given** the TriviaSmith Access panel is open, **When** the Administrator enters a username that does not exist and clicks "Grant", **Then** an error message appears explaining the username was not found; no access is granted.
3a. **Given** the TriviaSmith Access panel is open, **When** the Administrator enters the username of an existing WordPress Administrator and clicks "Grant", **Then** an error appears ("Administrators always have access and cannot be added"); no capability change occurs.
4. **Given** the access table is shown, **When** the Administrator looks at the Administrator row, **Then** it shows "Always Active" with no Revoke button (Administrators cannot be revoked).
5. **Given** a user is in the access table, **When** the Administrator clicks "Revoke", **Then** that user loses `manage_trail_trivia` access and disappears from the table.
6. **Given** a user WITHOUT `manage_options` logs in, **When** they look at the Trail Trivia menu, **Then** no "Settings" sub-item is visible.

---

### User Story 5 - Admin UI is Accessible to All Users (Priority: P5)

The entire TriviaSmith admin interface — game list, game editor, and settings page — passes an automated accessibility audit with zero critical or serious violations. All interactive elements have accessible names and keyboard-navigable focus states.

**Why this priority**: The constitution mandates WCAG 2.1 AA compliance for all admin UIs. TriviaSmiths may use keyboard navigation or screen readers. This story closes the accessibility gate before the phase can be marked complete.

**Independent Test**: Run the axe-core CLI against the game list, editor, and settings pages. Confirm zero critical/serious violations on each. Tab through the editor using keyboard only — all inputs, buttons, and accordion controls are reachable and operable. Drag-to-reorder must have a keyboard-accessible alternative (up/down controls or keyboard-based drag).

**Acceptance Scenarios**:

1. **Given** the game list page is served, **When** axe-core CLI runs against it, **Then** zero critical or serious violations are reported.
2. **Given** the game editor page is served, **When** axe-core CLI runs against it, **Then** zero critical or serious violations are reported.
3. **Given** the settings page is served, **When** axe-core CLI runs against it, **Then** zero critical or serious violations are reported.
4. **Given** a user navigates the editor using keyboard only, **When** they reach the question accordion, **Then** each card can be expanded and its fields filled without a mouse.
5. **Given** the drag-to-reorder grip handle is present, **When** a keyboard-only user interacts with it, **Then** a keyboard-accessible mechanism (e.g., arrow keys or up/down buttons) allows question reordering without a mouse.

---

### Edge Cases

- What happens when a TriviaSmith opens the editor and loses network connection? The 60-second autosave fires but fails — an error indicator appears; the editor content is not lost (it remains in the form state).
- What happens when two TriviaSmiths edit the same game simultaneously? Last save wins; no conflict resolution UI is required in Phase 5. This is an acceptable limitation documented in the assumptions.
- What happens when the `gamesPerPage` field is set to 0 or a negative number? The field rejects invalid input with a visible error message before saving.
- What happens when an image URL returns a 404 or is not an image? The thumbnail preview shows a broken-image indicator instead of the image; no error is thrown to the page.
- What happens when a TriviaSmith trashes a game they didn't create? They can trash any game — `manage_trail_trivia` grants full CRUD on all games regardless of authorship.
- What happens when the lightbox is open and the user resizes the browser window? The lightbox image scales to fit the new viewport without breaking the layout.

## Requirements *(mandatory)*

### Functional Requirements

**Game List**
- **FR-001**: The admin interface MUST show a "Trail Trivia → All Games" menu item only to users with `manage_trail_trivia` or `manage_options` capability. The menu item MUST NOT appear for any other user.
- **FR-002**: The game list MUST display games in a paginated table with columns: Title + Subtitle, Status badge, Question count, Author display name, and Publish date. The page size MUST be controlled by the `gamesPerPage` setting from the Settings page. Numbered page navigation MUST appear below the table when the total game count exceeds the page size.
- **FR-003**: The game list MUST have filter tabs: All, Published, Draft. Selecting a tab filters the table to show only games of that status.
- **FR-004**: The game list MUST have a title search input with a "Search" button. Filtering is triggered by pressing Enter in the input or clicking the button — not on every keystroke. The table updates to show only games whose title contains the search term (case-insensitive). Clearing the search and submitting restores the full paginated list.
- **FR-005**: Hovering a game row MUST reveal row actions: "Edit" (navigates to editor) and "Trash" (moves to trash with confirmation dialog).
- **FR-006**: The game list MUST have an "Add New Game" button that navigates to the editor with a blank, unsaved game.

**Game Editor**
- **FR-007**: The game editor MUST display a large title input at the top and a subtitle input directly below it.
- **FR-008**: The editor MUST display exactly 5 question cards in an accordion. No add or remove controls are present. The question count is invariant.
- **FR-009**: Each collapsed question card MUST show a preview of the question text and the correct answer text.
- **FR-010**: Each expanded question card MUST contain: a question text input, exactly 4 choice inputs each with a radio button to mark the correct answer, an answer explanation input, and optional fields for image URL, image alt text, and image caption.
- **FR-011**: When a valid URL is in the image URL field, a 160×120 px thumbnail preview MUST appear within one input event — no form submit required.
- **FR-012**: Clicking the thumbnail preview MUST open a full-screen lightbox. The lightbox MUST close when: the user clicks outside the image, presses Escape, or clicks a visible × button.
- **FR-013**: Each question card MUST have a six-dot drag grip handle. Dragging a card to a new position MUST reorder the questions and renumber all cards 01–05 in their new order.
- **FR-014**: The tags metabox MUST allow the TriviaSmith to add tags as chips by typing and confirming, and remove tags by clicking a remove control on each chip.
- **FR-015**: The editor MUST show a "← All Games" link in the toolbar that navigates back to the game list.

**Sidebar / Publish Controls**
- **FR-016**: The publish sidebar MUST display: current status, publish date, author name (read-only), a "Save Draft" button, a "Publish/Update" button, and a trash icon button.
- **FR-017**: The "Publish/Update" button MUST be enabled if and only if all 5 questions have non-empty `questionText` and all 4 choices filled. When disabled, the button MUST display a descriptive `title` tooltip explaining which questions are incomplete. The gate re-evaluates on every field change without a page reload.
- **FR-019**: Clicking "Change" next to the published status indicator MUST immediately toggle the game status between published and draft — no confirmation dialog required.
- **FR-020**: Clicking the trash icon button MUST show a confirmation dialog. On confirmation, the game moves to WordPress trash (recoverable) and the editor navigates to the game list. No permanent deletion occurs via this button.
- **FR-021**: A "Preview Game" button MUST be present above the publish box. Clicking it MUST open a full-screen modal showing the player UI populated with the current (unsaved) editor state.
- **FR-022**: While the editor is open, it MUST automatically save a draft every 60 seconds from mount. After a successful autosave, the toolbar MUST show "Draft saved at HH:MM:SS". After a failed autosave, the toolbar MUST show "Draft save failed — check your connection" in a visually distinct state.

**Settings Page**
- **FR-023**: A "Settings" sub-item MUST appear in the Trail Trivia menu ONLY for users with `manage_options` (Administrators). Non-Admins with `manage_trail_trivia` MUST NOT see it.
- **FR-024**: The Settings page MUST have three panels: General, TriviaSmith Access, and About.
- **FR-025**: The General panel MUST contain a `gamesPerPage` number input and a "Save Changes" button. Saving persists the value. Submitting a non-positive integer MUST show a validation error.
- **FR-026**: The TriviaSmith Access panel MUST display a table of users who currently have `manage_trail_trivia` with their WP role and a Revoke button per row.
- **FR-027**: The TriviaSmith Access panel MUST have a username input and a "Grant" button. Entering a valid WP username and clicking Grant MUST add that user to the access table. Entering a non-existent username MUST show an error without granting access. Attempting to grant access to a WordPress Administrator MUST show an informative error ("Administrators always have access and cannot be added") without granting or modifying anything.
- **FR-028**: The Administrator row in the TriviaSmith Access table MUST display "Always Active" with no Revoke button.
- **FR-029**: The About panel MUST display read-only: plugin name, version number, WP minimum version, PHP minimum version, and a brief description of the data storage strategy.

**Accessibility**
- **FR-030**: All three admin pages (game list, game editor, settings) MUST pass axe-core with zero critical or serious violations.
- **FR-031**: All interactive elements MUST have accessible names via visible text, `aria-label`, or `aria-labelledby`.
- **FR-032**: Drag-to-reorder MUST have a keyboard-accessible alternative that allows question reordering without a mouse.

### Key Entities

- **TriviaSmith**: A WordPress user with the `manage_trail_trivia` capability explicitly granted (or an Administrator, who always has it implicitly). The TriviaSmith is the primary actor in the admin UI.
- **Game** (`Quiz`): The content unit managed by the admin UI. Has title, subtitle, author, publish date, status, 5 questions, and tags. Full domain schema defined in MIGRATION_PLAN.md Section 1.
- **Question**: One of exactly 5 questions in a game. Has question text, 4 choices (each with a correct-answer indicator), answer explanation, and optional image URL/alt/caption.
- **Tag**: A free-text label applied at the quiz level. Stored as a chip in the editor; synced to the `trivia_tag` taxonomy in WordPress.
- **Autosave**: A background save that fires every 60 seconds while the editor is open. Saves current editor state as a draft without user action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A TriviaSmith can open the game list, find a specific game using the search box, open the editor, complete all 5 questions, and publish the game — all without leaving the admin interface — in under 5 minutes from a cold start.
- **SC-002**: A user without `manage_trail_trivia` sees zero Trail Trivia menu items after logging in to WP admin.
- **SC-003**: The "Publish/Update" button is disabled when any question is incomplete, and enabled immediately when the last required field is filled — no page reload required.
- **SC-004**: Clicking "Preview Game" opens a modal showing the player UI with the current editor state (including unsaved changes). The modal is perceptibly instant (no loading spinner required) because the player components are already bundled in the admin app.
- **SC-005**: The autosave fires every 60 seconds from the time the editor mounts. After each successful autosave, the toolbar shows "Draft saved at HH:MM:SS" within 62 seconds of mount (no page reload required). After a failed autosave, the toolbar shows the failure message.
- **SC-006**: `axe-core` reports zero critical or serious violations on the game list, game editor, and settings pages.
- **SC-007**: The full Phase 5 deterministic test block from `MIGRATION_PLAN.md` exits 0 on every command.
- **SC-007a**: When `gamesPerPage` is set to 5 and 6 or more games exist, the game list shows exactly 5 games and numbered page controls appear.
- **SC-008**: A WordPress Administrator can grant `manage_trail_trivia` to a new user via the Settings page, and that user can immediately see the Trail Trivia menu on their next page load.

## Clarifications

### Session 2026-06-26

- Q: How does "Preview Game" render the player? → A: Shared source — admin bundle imports player components from `src/features/` directly; live form state passed as props; no iframe or network call.
- Q: Does the admin game list paginate, and does it use `gamesPerPage`? → A: Yes — game list paginates using `gamesPerPage` as page size; numbered page navigation appears when games exceed the page size.
- Q: Does the game list search filter as the user types or only on submit? → A: Submit-triggered — fires on Enter or "Search" button click; not on every keystroke; standard WP admin pattern.

## Assumptions

- Phases 0–4 are complete: the REST API (`/wp-json/trail-trivia/v1/`) is live, `manage_trail_trivia` capability is defined, and the `trail_trivia_game` CPT is registered.
- Phase 5 builds the React admin UI as a separate Vite bundle (`assets/admin/index.js`) enqueued only on Trail Trivia admin pages — separate from the player bundle built in Phase 6. This requires a `build:admin` npm script analogous to Phase 6's `build:player`.
- The admin bundle is enqueued by `class-admin-ui.php` (Phase 0 stub) which is implemented in this phase alongside the React admin app.
- The capabilities grant/revoke UI in the Settings page replaces the need for WP-CLI to manage TriviaSmith access — this is the primary Phase 5 access management mechanism.
- Drag-to-reorder uses a library already bundled with the admin React app (e.g., dnd-kit or similar); the library selection is a planning decision, not a spec constraint.
- Concurrent editing (two TriviaSmiths editing the same game) is a known limitation — last save wins, no conflict resolution. This is acceptable for Phase 5.
- "Preview Game" modal uses the same React player feature components from `react-app/src/features/` (quiz, score, etc.) imported directly into the admin bundle — not an iframe and not the IIFE player bundle. Live editor form state is passed as props to the player components, enabling preview of unsaved changes without a network round-trip.
- The settings page `gamesPerPage` value configured here is the same value read by the `GET /settings` REST endpoint (Phase 4). Changes take effect on the next API call.
- The admin UI must be accessible from WP 6.4 and 6.5 without polyfills beyond what the project's Vite build already targets.
