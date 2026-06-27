# Feature Specification: API Client Migration

**Feature Branch**: `004-api-client-migration`

**Created**: 2026-06-26

**Status**: Draft

**Input**: User description: "we need to implement phase 3 of MIGRATION_PLAN.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Players Receive Live Game Data (Priority: P1)

A player visits the Trail Trivia page and the game list loads from the live WordPress content management system rather than a static file bundled with the app. Any game a TriviaSmith has published in WordPress appears immediately in the player's list without a code deployment.

**Why this priority**: The static `trivia.json` file requires a developer to manually update and redeploy the app every time a new quiz is published. Connecting directly to the WordPress backend removes this bottleneck and is the prerequisite for all future phases (admin UI, data migration, launch). Without this, the player always sees frozen data.

**Independent Test**: Deploy the player app against a running WordPress instance. Publish a new game in WordPress. Reload the player page without redeploying the app. Confirm the new game appears in the list.

**Acceptance Scenarios**:

1. **Given** a player loads the Trail Trivia page, **When** the WordPress backend returns a list of published games, **Then** the player sees all published games in the correct order (newest first).
2. **Given** a player loads the Trail Trivia page, **When** the backend responds within the timeout window, **Then** the game list appears without a loading error.
3. **Given** the app is running, **When** a TriviaSmith publishes a new game in WordPress, **Then** the next page load by any player shows the new game (no app redeployment required).
4. **Given** a player selects a specific game, **When** the game detail is fetched, **Then** all 5 questions, choices, and answer text are present and correct.
5. **Given** the production app is running, **When** a developer inspects the JavaScript bundle, **Then** no debug log statements are visible in the output.

---

### User Story 2 - Players See Helpful Errors When Data Fails to Load (Priority: P2)

When the WordPress backend is unavailable, returns an error, or takes too long to respond, the player sees a clear, friendly message rather than a broken or blank screen. The app never silently fails.

**Why this priority**: Error handling is the difference between a broken experience and a recoverable one. A player who sees a blank screen has no idea whether to refresh, wait, or give up. A clear message with a retry prompt preserves trust. This also validates that the integration layer handles real-world failure modes before the app goes live.

**Independent Test**: With the player app running, simulate each failure mode in turn (server unreachable, server returns 500, request takes more than 10 seconds). For each, confirm the player sees a human-readable message and the page does not crash or show raw error text.

**Acceptance Scenarios**:

1. **Given** a player loads the page, **When** the backend returns a server error (5xx), **Then** the player sees a "Something went wrong. Try again." message and no raw error details.
2. **Given** a player loads the page, **When** the request takes longer than 10 seconds with no response, **Then** the request is cancelled and the player sees a timeout error message.
3. **Given** a player loads the page, **When** the backend is completely unreachable (no network), **Then** the player sees an error message (not a blank screen or JavaScript crash).
4. **Given** a player triggers an error state, **When** the error message is displayed, **Then** the page title is still correct, focus is on the error region, and the player can navigate away.
5. **Given** a fetch attempt fails, **When** the error is recorded, **Then** the error details are available in the browser's error console (not swallowed silently).

---

### User Story 3 - Authenticated Access Layer for Future Admin Features (Priority: P3)

The data layer exposes a way to fetch all games (including drafts) using a WordPress authentication token. This function is wired up at the infrastructure level but is not yet connected to any visible UI — it is the foundation for the TriviaSmith admin interface in Phase 5.

**Why this priority**: Building the authenticated fetch now means Phase 5 (admin UI) can import a ready-made function rather than re-implementing network logic. It is lower priority than the public player experience but higher than deferring it to Phase 5, where it would conflict with admin UI work.

**Independent Test**: In the browser console on a WordPress-embedded player page, call the authenticated fetch function with a valid WordPress nonce. Confirm the response includes both published and draft games. Call it without a nonce or with an invalid nonce and confirm a 401 response is returned (not swallowed).

**Acceptance Scenarios**:

1. **Given** the authenticated fetch function is called with a valid WordPress nonce, **When** the backend receives the request, **Then** the response includes all games (published and draft).
2. **Given** the authenticated fetch function is called without a valid nonce, **When** the backend receives the request, **Then** the response is a 401 and the caller receives an error (not an empty list).
3. **Given** a WordPress page loads the player, **When** WordPress injects the nonce into the page, **Then** the data layer can read it without any manual configuration by the player.

---

### Edge Cases

- What happens when the WordPress backend returns an empty array (no published games)? The player sees an empty state message, not an error.
- What happens when the nonce has expired? The request returns 401; the error is surfaced to the caller, not swallowed.
- What happens when a game fetch returns a game with fewer than 5 questions (data corruption)? The app must not crash; it should show the game or surface an error depending on the severity.
- What happens when the request is cancelled mid-flight (user navigates away)? The abort signal fires, the error is swallowed (aborts are expected), and no error is shown to the user.
- What happens when the production build is inspected? No debug log output appears in the JavaScript bundle.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The player app MUST retrieve published game data from the live WordPress content management system rather than a static bundled file.
- **FR-002**: The data layer MUST expose three fetch operations: published games list (public), single published game by identifier (public), and all games including drafts (authenticated).
- **FR-003**: All network requests MUST be automatically cancelled if they do not receive a response within 10 seconds, preventing indefinitely pending requests.
- **FR-004**: The app MUST display a human-readable error message to the player when any data request fails for any reason (server error, timeout, network failure, or unauthorized access).
- **FR-004a**: When the backend returns a 401 Unauthorized response, the app MUST surface a distinct "Sign in to view this content" message — not the generic server-error message. The game data loading status MUST have a dedicated `"unauthorized"` state separate from the `"failed"` state.
- **FR-005**: The app MUST NOT display raw error text, stack traces, or technical details to players.
- **FR-006**: All errors MUST be captured and surfaced to the browser's error monitoring channel so they are detectable without crashing the page.
- **FR-007**: The base URL for all game data requests MUST be read at runtime from the WordPress-injected page configuration object if present; if the object is absent (local development without WordPress), the base URL falls back to the build-time environment variable. This allows the same build artifact to work in both development and production without code changes.
- **FR-008**: The authenticated fetch operation MUST read the WordPress authentication token from a configuration object injected into the page by WordPress at load time — no hardcoding of credentials.
- **FR-009**: Debug log statements MUST be absent from the production build of the player app.
- **FR-010**: The static `trivia.json` file MUST NOT be referenced anywhere in the player app source after this phase.

### Key Entities

- **Published Game** (`Quiz` with `status: "published"`): A game visible to all players. Fetched by the public endpoint.
- **Draft Game** (`Quiz` with `status: "draft"`): A game only visible to authenticated TriviaSmith contributors. Fetched by the authenticated endpoint.
- **Page Configuration** (`window.trailTriviaConfig`): A configuration object injected into the WordPress page at load time by the shortcode PHP. Contains the API base URL and the WordPress authentication nonce. Read once at app startup.
- **Request Timeout**: The maximum time (10 seconds) a network request may remain open before it is automatically cancelled. Applied to all three fetch operations.
- **Error Boundary**: The top-level error catcher in the player app. Displays the "Something went wrong. Try again." message when an unhandled error reaches it, alongside an interactive "Try again" button that resets the boundary and re-triggers the game list fetch without a full page reload.

## Clarifications

### Session 2026-06-26

- Q: When reading the API base URL, which source takes priority? → A: Runtime WordPress config (`window.trailTriviaConfig?.apiBase`) wins; build-time env var is the development fallback.
- Q: When the player app receives a 401, what should the UI show and does the Redux status need a dedicated state? → A: Dedicated `"unauthorized"` status in the loader slice; player UI shows "Sign in to view this content" (distinct from the 5xx "Something went wrong" message).
- Q: Does the ErrorBoundary "Try again" include an interactive retry button or static text? → A: Interactive button — clicking resets the error boundary and re-triggers the game list fetch without a full page reload.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A newly published WordPress game appears in the player's game list within one page reload, without any app redeployment or file edit.
- **SC-002**: `grep -r "trivia.json" src/` returns 0 results — no static file reference remains in the player source.
- **SC-003**: When the backend is made to respond after 11 seconds, the request is cancelled within 10–11 seconds and the player sees an error message (not an indefinite spinner).
- **SC-004**: When the backend returns HTTP 500, the player sees "Something went wrong. Try again." and a "Try again" button within 2 seconds of the failure; clicking the button re-triggers the fetch without a full page reload.
- **SC-004a**: When the backend returns HTTP 401, the player sees "Sign in to view this content" and the Redux loader status is `"unauthorized"` (not `"failed"`).
- **SC-005**: The production JavaScript bundle contains no literal debug log output (verified by inspecting `dist/assets/*.js`).
- **SC-006**: The full Phase 3 deterministic test block from `MIGRATION_PLAN.md` exits 0 on every command.

## Assumptions

- Phase 2 (FP Refactor & ARIA Compliance) is complete: the data layer is already isolated in `src/data/trivia-api.ts`, all imports use `src/domain/types`, and the 90% test coverage gate passes.
- A WordPress instance with the trail-trivia plugin installed and activated (from Phase 0's stub) is available in the development environment for integration testing.
- The WordPress nonce for authenticated requests is injected by the PHP shortcode as `window.trailTriviaConfig = { apiBase, nonce }` — this contract is defined in the constitution Architecture section and is not changed by this phase.
- The single-game fetch (`fetchGame(id)`) is included in this phase even though the player currently navigates between questions via route parameters (not a fresh game fetch per question). It is the correct REST design and is needed by Phase 5 (admin editor preview).
- `fetchAllGames()` is wired and tested at the data layer but is not connected to any UI in this phase — the admin UI that calls it is built in Phase 5.
- The `ErrorBoundary` component already exists as `src/app/ErrorBoundary.tsx` from the Phase 3 deliverable list; if it doesn't exist, it is created in this phase.
- Abort on page navigation (user leaves before response) is handled silently — the abort error is swallowed and no user-facing message is shown.
