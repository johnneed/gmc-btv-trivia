# Tasks: API Client Migration

**Input**: Design documents from `specs/004-api-client-migration/`

**Prerequisites**: plan.md ✓ · spec.md ✓ · research.md ✓ · data-model.md ✓ · contracts/wp-rest-api.md ✓

## Format: `[ID] [P?] [Story] [Type?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1, US2, US3)
- **[Type]**: `[test]` write-and-fail-first · `[arch]` layer/boundary change · `[coverage]` gate check

---

## Phase 1: Setup — Environment & Build Config

**Purpose**: Rename the env var and configure the production build to strip debug logging. These block nothing but should be done first to avoid test failures from stale var names.

- [x] T001 Rename `VITE_API_URL` → `VITE_API_BASE_URL` in `react-app/.env` — change value to the WP REST API base path (e.g., `http://localhost:8888/wp-json/trail-trivia/v1`)
- [x] T002 [P] Rename `VITE_API_URL` → `VITE_API_BASE_URL` in `react-app/.env.production.local` (preserving the existing production URL)
- [x] T003 [P] Add `build: { define: { "console.log": "void 0" } }` to `react-app/vite.config.ts` inside `defineConfig` — strip `console.log` calls from the production bundle only
- [x] T004 Gate — run `npm run build` in `react-app/`; must exit 0; run `grep "console\.log" dist/assets/*.js | grep -v "sourceMappingURL"` — must return 0 lines

---

## Phase 2: Foundational — `apiBase()` helper and `fetchGames()`

**Purpose**: The core public fetch function that US1 (live game list) depends on. US2 adds error handling on top; US3 adds the other two functions. All three user stories block until `fetchGames()` exists and is tested.

**⚠️ CRITICAL**: No user story work can begin until T007 (vitest gate) passes.

- [x] T005 [test] [arch] Write failing tests for `apiBase()` and `fetchGames()` in `react-app/src/data/trivia-api.test.ts` — **rewrite the file**; assert: `apiBase()` returns `window.trailTriviaConfig.apiBase` when present; falls back to `VITE_API_BASE_URL` when config absent; throws when both absent/empty; `fetchGames()` calls `{apiBase()}/games`; `fetchGames()` resolves with `Quiz[]` on 200; `fetchGames()` uses `AbortController` with 10s signal (TDD red)
- [x] T006 [arch] Rewrite `react-app/src/data/trivia-api.ts` — implement `apiBase()`, `fetchGames()`: (1) `apiBase()` reads `(window as any).trailTriviaConfig?.apiBase ?? import.meta.env.VITE_API_BASE_URL`, throws `Error("API base URL is not configured")` if result is falsy; (2) `fetchGames()` creates `AbortController`, sets 10s `setTimeout` to call `controller.abort()`, fetches `${apiBase()}/games` with the signal, checks `response.ok`, returns `response.json() as Promise<Quiz[]>`, clears timeout on success (TDD green for T005)
- [x] T007 Gate — `npx vitest run src/data/trivia-api.test.ts` exits 0

**Checkpoint**: `apiBase()` and `fetchGames()` work and are tested. User story phases can now proceed.

---

## Phase 3: User Story 1 — Players Receive Live Game Data (Priority: P1) 🎯 MVP

**Goal**: The player app loads its game list from the WP REST API, not from `trivia.json`. The Redux thunk calls `fetchGames()`. No reference to `trivia.json` or the old `fetchTrivia` function remains.

**Independent Test**: `grep -r "trivia.json" src/` returns 0 lines. App loads and shows game list when `fetchGames()` mock resolves with a Quiz array.

- [x] T008 [test] [US1] Add test to `react-app/src/features/loader/loader-slice.spec.ts` — assert `fetchQuizzes` thunk calls `fetchGames` (not `fetchTrivia`); `fulfilled` case stores quizzes in state without client-side filtering
- [x] T009 [US1] [arch] Update `react-app/src/features/loader/loader-slice.ts` — (1) change import from `fetchTrivia` to `fetchGames` from `../../data/trivia-api`; (2) remove `filterPublished` from the `fetchQuizzes.fulfilled` handler (server filters; keep `sortByDateDesc`); (3) no other changes to state shape or actions
- [x] T010 [US1] Update `react-app/src/features/loader/loader.test.tsx` — update the `fakeQuiz` mock target from `fetchTrivia` to `fetchGames` so existing loader tests still pass
- [x] T011 [US1] Gate — `grep -r "trivia\.json\|fetchTrivia" react-app/src/` returns 0 lines; `npx vitest run src/features/loader/` exits 0

**Checkpoint**: Loader uses `fetchGames`. No static file references remain in source.

---

## Phase 4: User Story 2 — Helpful Errors When Data Fails (Priority: P2)

**Goal**: Players see "Sign in to view this content" on 401, "Something went wrong. Try again." + retry button on 5xx/unhandled errors, and an error message on timeout. No silent failures.

**Independent Test**: With `fetchGames()` mocked to throw each failure type, the player sees the correct message for each. The "Try again" button re-triggers the fetch.

### Data layer error types (TDD required — extends existing data layer)

- [x] T012 [test] [US2] Add test cases to `react-app/src/data/trivia-api.test.ts` for error paths — assert: `fetchGames()` throws `UnauthorizedError` on HTTP 401; throws `Error` on HTTP 500; throws (AbortError or equivalent) when the 10s timeout fires before response (TDD red for these cases)
- [x] T013 [US2] [arch] Extend `react-app/src/data/trivia-api.ts` — (1) add `class UnauthorizedError extends Error { name = "UnauthorizedError" }` and export it; (2) after `await fetch(...)`, check `!response.ok`: if `response.status === 401` throw `new UnauthorizedError()`; else throw `new Error(\`HTTP \${response.status}\`)`; (3) ensure the 10s `setTimeout` cancels via `controller.abort()` and the resulting abort error propagates (TDD green for T012)

### Loader slice — unauthorized status (TDD required — new status value)

- [x] T014 [test] [US2] Add test cases to `react-app/src/features/loader/loader-slice.spec.ts` — assert: `fetchQuizzes.rejected` with `action.error.name === "UnauthorizedError"` sets `status = "unauthorized"`; `fetchQuizzes.rejected` with any other error sets `status = "failed"`
- [x] T015 [US2] Update `react-app/src/features/loader/loader-slice.ts` — (1) extend status union: `"idle" | "loading" | "failed" | "unauthorized"`; (2) update `fetchQuizzes.rejected` handler: `if (action.error.name === "UnauthorizedError") state.status = "unauthorized"; else state.status = "failed"`; (3) no other changes

### Loader UI — sign-in message for 401

- [x] T016 [US2] Update `react-app/src/features/loader/index.tsx` — add a rendered message for `status === "unauthorized"`: `<p role="alert">Sign in to view this content.</p>` inside the existing `aria-live="polite"` region
- [x] T017 [US2] Update `react-app/src/features/loader/loader.test.tsx` — add test: render `Loader` with store `status: "unauthorized"` → asserts "Sign in to view this content" text is present

### ErrorBoundary — 5xx / unhandled errors (TDD required — new component)

- [x] T018 [test] [US2] Write failing tests in `react-app/src/app/ErrorBoundary.test.tsx` — assert: when a child throws, the fallback renders "Something went wrong. Try again." text; fallback contains a `<button>` that calls `resetErrorBoundary` when clicked; the fallback container has `role="alert"`; no Redux imports in the component (TDD red)
- [x] T019 [P] [US2] Create `react-app/src/app/ErrorBoundary.tsx` — use `react-error-boundary`'s `FallbackProps` type for props; render `<section role="alert" aria-live="assertive"><p>Something went wrong. Try again.</p><button onClick={resetErrorBoundary}>Try again</button></section>`; default export `ErrorBoundaryFallback`; this is the fallback render function, not the boundary wrapper itself (TDD green for T018)
- [x] T020 [US2] Modify `react-app/src/App.tsx` — import `{ ErrorBoundary }` from `react-error-boundary` and `ErrorBoundaryFallback` from `./app/ErrorBoundary`; wrap `<HashRouter>` (and its `<TriviaRoutes>` child) in `<ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>`
- [x] T021 [US2] Update `react-app/src/App.test.tsx` — assert that the rendered `App` contains an ErrorBoundary wrapper (verify by confirming the app renders without crashing and `ErrorBoundary` is in the component tree)
- [x] T022 [US2] Gate — `npx vitest run src/app/ src/features/loader/` exits 0; "Sign in" message renders on unauthorized; ErrorBoundary fallback renders on thrown error

**Checkpoint**: All failure modes surface user-readable messages. Retry button works. 401 shows sign-in, not error.

---

## Phase 5: User Story 3 — Authenticated Access Layer (Priority: P3)

**Goal**: `fetchGame(id)` and `fetchAllGames(nonce)` are implemented, tested, and exported. No UI calls them yet — this is the data-layer foundation for Phase 5 (admin UI).

**Independent Test**: Unit tests for `fetchGame` and `fetchAllGames` pass. `fetchAllGames` sends `X-WP-Nonce` header. Both handle 401/5xx/timeout identically to `fetchGames`.

- [x] T023 [test] [US3] Add tests to `react-app/src/data/trivia-api.test.ts` for `fetchGame(id)` and `fetchAllGames(nonce)` — assert: `fetchGame("abc")` calls `{apiBase}/games/abc`; `fetchAllGames("nonce-123")` calls `{apiBase}/games/all` with `X-WP-Nonce: nonce-123` header; both throw `UnauthorizedError` on 401; both throw `Error` on 5xx; both have 10s AbortController timeout (TDD red)
- [x] T024 [US3] Implement `fetchGame(id: string): Promise<Quiz>` and `fetchAllGames(nonce: string): Promise<Quiz[]>` in `react-app/src/data/trivia-api.ts` — same timeout/error pattern as `fetchGames`; `fetchAllGames` adds `{ headers: { "X-WP-Nonce": nonce } }` to the fetch options (TDD green for T023)
- [x] T025 [US3] Gate — `npx vitest run src/data/trivia-api.test.ts` exits 0 with all `fetchGame` and `fetchAllGames` tests green

**Checkpoint**: Three fetch functions exported from `trivia-api.ts`. Data layer ready for Phase 4 (WP plugin) and Phase 5 (admin UI).

---

## Phase 6: Polish & Full Validation

**Purpose**: Confirm all acceptance criteria from `MIGRATION_PLAN.md` Phase 3 pass before closing the phase.

- [x] T026 [coverage] Run `npm run test:coverage` in `react-app/` — must exit 0; `lines.pct ≥ 90` and `branches.pct ≥ 90` for `domain/`, `store/`, `components/`, `features/` layers; `src/app/` excluded from threshold but `ErrorBoundary.tsx` must have a test file
- [x] T027 Run `npx tsc --noEmit` in `react-app/` — must exit 0
- [x] T028 [P] Run `npm run build` — exits 0; `grep "console\.log" dist/assets/*.js | grep -v "sourceMappingURL"` returns 0 lines
- [x] T029 [P] Run `grep -r "trivia\.json" react-app/src/` — must return 0 lines
- [x] T030 [P] Run `grep "AbortController" react-app/src/data/trivia-api.ts` — must return ≥ 1 match
- [x] T031 [P] Run `grep -rn "ErrorBoundary" react-app/src/app/ react-app/src/App.tsx` — must return ≥ 1 match
- [x] T032 Run complete MIGRATION_PLAN.md Phase 3 deterministic test block (quickstart.md Step 9) — all commands exit 0

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (env var must exist for tests). **Blocks all user stories** — T007 gate must pass first
- **US1 (Phase 3)**: Depends on Foundational. T009/T010 can run in parallel after T007
- **US2 (Phase 4)**: Depends on Foundational. Data layer error tasks (T012/T013) run after T007; ErrorBoundary (T018–T021) can run in parallel with loader slice tasks (T014–T017) — different files
- **US3 (Phase 5)**: Depends on Foundational. Independent of US1 and US2 — only requires `apiBase()` from T006
- **Polish (Phase 6)**: Depends on US1 + US2 + US3 all complete

### Within Phase 2 (Foundational)

```
T001 → T005 (env var must exist before test runs import.meta.env)
T005 → T006 → T007 (TDD: red → green → gate)
T002, T003 parallel with T001 (different files)
T004 after T003 (build gate)
```

### Within Phase 4 (US2)

```
T007 → T012 → T013 (error type tests then implementation)
T013 → T014 → T015 (UnauthorizedError must exist before slice tests)
T016, T017 parallel (different files; both need T015)
T018 → T019 → T020 → T021 (ErrorBoundary TDD: test → impl → wire → App test)
T022 after T017 + T021 (gate covers both sub-tracks)
```

---

## Parallel Opportunities

**Phase 1** (all parallel after T001):
- T002, T003 — different files, no dependencies on each other

**Phase 2**:
- T005+T006 are sequential (TDD); T002+T003 can proceed simultaneously

**Phase 4** (two independent sub-tracks after T013):
- Sub-track 1: Loader slice (T014 → T015 → T016 → T017) — `loader-slice.ts` and `loader` feature
- Sub-track 2: ErrorBoundary (T018 → T019 → T020 → T021) — `src/app/` and `App.tsx`

**Phase 6** (after all stories complete):
- T028, T029, T030, T031 — all parallel grep/build gates

---

## Implementation Strategy

### MVP First (US1 only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T007) — **REQUIRED**
3. Complete Phase 3: US1 (T008–T011) — live game data from API
4. **STOP and VALIDATE**: `grep "trivia.json" src/` returns 0; app loads games from mocked API
5. Phase 3 player-facing deliverable is done (static file replaced)

### Incremental Delivery

1. Phase 1+2 → env config clean; `fetchGames()` green
2. US1 → app uses API; no `trivia.json`
3. US2 → all failure modes handled; ErrorBoundary wired
4. US3 → auth data layer ready for admin UI
5. Polish → full Phase 3 shell block exits 0

---

## Notes

- All tasks are in `react-app/src/` — no WP plugin changes in Phase 3
- `[test]` tasks MUST be observed failing before their paired implementation (Principles X and III)
- `UnauthorizedError` is a `class` (constitution Principle I bans classes) — justified in Complexity Tracking in `plan.md`; see the `ponytail:` comment to add in `trivia-api.ts`
- `window.trailTriviaConfig` is typed via `(window as any).trailTriviaConfig` in the data layer — this avoids adding a global ambient declaration and keeps the cast at the one callsite in `apiBase()`
- `fetchGame(id)` is not called by any current UI but is included because MIGRATION_PLAN.md mandates it and Phase 5 admin preview will use it
- After T009, `filterPublished` is removed from the thunk — the WP REST API public endpoint only returns published games (enforced server-side in Phase 4); this is a deliberate removal, not an oversight
- The `ErrorBoundary` exported from `react-error-boundary` is the wrapper; `ErrorBoundaryFallback` (T019) is the dumb fallback render function passed to its `FallbackComponent` prop
