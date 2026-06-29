# Tasks: Answer Image Upload

**Input**: Design documents from `specs/009-answer-image-upload/`

**Prerequisites**: [plan.md](plan.md) · [spec.md](spec.md) · [research.md](research.md) · [data-model.md](data-model.md) · [contracts/media-endpoints.md](contracts/media-endpoints.md) · [quickstart.md](quickstart.md)

**TDD**: Tests are written and observed **failing (red)** before implementation. Each `[test]` task must fail before its paired implementation task begins.

## Format: `[ID] [P?] [Story?] [Type?] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no shared state)
- **[Story]**: Which user story — [US1], [US2], [US3]
- **[test]**: Write test first; run it; confirm red; then proceed to implementation
- **[a11y]**: WCAG 2.1 AA / axe-core audit
- **[security]**: Cap check / nonce / sanitization
- **[coverage]**: Coverage gate enforcement (≥ 90% lines + branches)
- **[arch]**: Architecture boundary enforcement

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type system changes + PHP taxonomy — foundational for all user stories.

- [x] T001 [P] Register `trivia_image_type` attachment taxonomy + define `TRAIL_TRIVIA_IMAGE_TAXONOMY` and `TRAIL_TRIVIA_IMAGE_TERM` constants in `wp-plugin/trail-trivia/includes/class-post-type.php`
- [x] T002 [P] Create `react-app/src/domain/types/media-attachment.type.ts` with `{ id: number; url: string; alt: string }` and re-export `MediaAttachment` from `react-app/src/domain/types/index.ts`
- [x] T003 [P] Add `answerImageId?: number` field to `react-app/src/domain/types/question.type.ts`
- [x] T004 [P] Add `uploadingQuestionId: string | null` and `uploadError: string | null` to `EditorState` interface and `initialState` (both `null`) in `react-app/src/admin/store/editor/editor.slice.ts`

**Checkpoint**: Types and taxonomy in place. All phase 2+ tasks can begin.

---

## Phase 2: Foundational (PHP REST Endpoints)

**Purpose**: Server-side media handling — required before React upload calls can succeed.

- [x] T005 Add private helpers `tag_attachment(int $id): void` and `attachment_to_response(int $id): array` to `wp-plugin/trail-trivia/includes/class-rest-api.php`
- [x] T006 Update question response builder in `class-rest-api.php`: resolve `answerImageId > 0` → `wp_get_attachment_image_url()` → `answerImage`; fall back to stored string when `answerImageId` absent (backward compat); **preserve `answerImageId` in the response JSON** alongside the resolved `answerImage` URL so the editor can identify the linked attachment
- [x] T007 Register + implement `POST /media/upload` route in `wp-plugin/trail-trivia/includes/class-rest-api.php`: `permission_callback` checks `manage_trail_trivia`; handler uses `wp_handle_upload()` → `wp_insert_attachment()` → `tag_attachment()` → returns `attachment_to_response()`
- [x] T008 Register + implement `POST /media/from-url` route in `wp-plugin/trail-trivia/includes/class-rest-api.php`: `wp_remote_get(['timeout'=>15,'redirection'=>5])` + content-type `image/*` validation → `media_sideload_image()` → `tag_attachment()` → returns `attachment_to_response()`; timeout → `trivia_url_timeout`; non-image → `trivia_url_not_image`; sideload fail → `trivia_url_sideload_failed`; all return `WP_Error`
- [ ] T009 [security] Verify both new route `permission_callback` implementations reject requests without `manage_trail_trivia` capability; run curl smoke test from `quickstart.md` (unauthenticated upload rejected with `rest_forbidden`)

**Checkpoint**: PHP endpoints operational. Run curl upload + from-url + auth tests from `quickstart.md` before proceeding.

---

## Phase 3: User Story 1 — Upload Local Image (Priority: P1) 🎯 MVP

**Goal**: Editor drags or browses a local image; it uploads to WP media library tagged as trivia answer image; answer shows thumbnail.

**Independent Test**: Drag a JPEG onto the drop zone; confirm thumbnail appears; open WP media library → filter "Trivia Answer Image" → uploaded file visible; reload editor → thumbnail still shown.

### Tests for US1 ⚠️ Write and confirm red before T014–T018

- [x] T010 [test] [US1] Write failing tests for `uploadAnswerImage(file)` in `react-app/src/admin/data/admin-api.test.ts`: success path returns `MediaAttachment`; each error code (`trivia_upload_no_file`, `trivia_upload_invalid_type`, `trivia_upload_failed`) throws `Error` with message
- [x] T011 [test] [US1] Write failing tests for `uploadQuestionImage` thunk in `react-app/src/admin/store/editor/editor.slice.test.ts`: pending sets `uploadingQuestionId` + clears `uploadError`; fulfilled clears `uploadingQuestionId` + updates question `answerImageId` + `answerImage`; rejected clears `uploadingQuestionId` + sets `uploadError`
- [x] T012 [test] [US1] Write failing tests for `AnswerImageUploader` (file upload path only) in `react-app/src/admin/components/answer-image-uploader/answer-image-uploader.test.tsx`: renders drop zone; fires `onFileSelect` on drop event; renders loading state when `isUploading=true`; renders error when `error` prop set; ARIA labels present on drop zone + file input

### Implementation for US1

- [x] T013 [P] [US1] Implement `uploadAnswerImage(file: File): Promise<MediaAttachment>` in `react-app/src/admin/data/admin-api.ts` using `FormData` + `POST /media/upload`; pass through `handleResponse`
- [x] T014 [P] [US1] Implement `uploadQuestionImage` thunk in `react-app/src/admin/store/editor/editor.slice.ts`; add `extraReducers` cases (pending → set `uploadingQuestionId`, clear `uploadError`; fulfilled → clear `uploadingQuestionId`, `updateGameField` with updated questions array; rejected → clear `uploadingQuestionId`, set `uploadError` to `action.error.message`)
- [x] T015 [US1] Create `react-app/src/admin/components/answer-image-uploader/answer-image-uploader.tsx`: dumb component with drag-and-drop zone + embedded `<input type="file" accept="image/*">` (Browse); loading spinner + disabled state when `isUploading`; `role="alert"` error display; `styles.module.css` co-located
- [x] T016 [US1] Update `react-app/src/admin/components/question-card/question-card.tsx`: remove URL `<input>` + standalone `<ImagePreview>`; add `AnswerImageUploader` with `imageId`, `imageUrl`, `imageAlt`, `isUploading`, `error`, `onFileSelect`, `onRemove`, `onAltChange`, `onCaptionChange` props; add new props to `QuestionCardProps`
- [x] T017 [US1] Create `react-app/src/admin/components/question-card/question-card.test.tsx`: covers render of `AnswerImageUploader` within card; `onFileSelect` callback fires; loading state propagation
- [x] T018 [US1] Update `react-app/src/admin/features/game-editor/game-editor.tsx`: dispatch `uploadQuestionImage` thunk on file select; wire `onAltChange` to `updateGameField` with updated `answerImageAlt`; pass `uploadingQuestionId` + `uploadError` + `onImageUpload` + `onAltChange` callbacks to each `QuestionCard`
- [ ] T019 [a11y] [US1] Verify `answer-image-uploader.tsx` ARIA: `role="region"` + `aria-label` on drop zone; `aria-label` on file input + URL input; `aria-label` on Remove button; `role="alert"` on error; run `axe-core-cli` against admin UI

**Checkpoint**: User Story 1 fully functional. Local file upload → WP media library → thumbnail visible. Tests green.

---

## Phase 4: User Story 2 — Download Image from URL (Priority: P2)

**Goal**: Editor pastes a public image URL; PHP downloads it server-side; attachment appears in WP media library tagged as trivia answer image.

**Independent Test**: Enter a valid image URL in the URL field; submit; confirm thumbnail appears and downloaded file is in WP media library under "Trivia Answer Image" filter.

### Tests for US2 ⚠️ Write and confirm red before T022–T025

- [x] T020 [test] [US2] Write failing tests for `sideloadAnswerImageFromUrl(url)` in `react-app/src/admin/data/admin-api.test.ts`: success path returns `MediaAttachment`; error codes `trivia_url_timeout`, `trivia_url_not_image`, `trivia_sideload_failed` throw `Error`
- [x] T021 [test] [US2] Write failing tests for `sideloadQuestionImage` thunk in `react-app/src/admin/store/editor/editor.slice.test.ts`: same state transitions as `uploadQuestionImage` but via URL path
- [x] T022 [test] [US2] Add failing tests for URL input path to `react-app/src/admin/components/answer-image-uploader/answer-image-uploader.test.tsx`: URL `<input>` is rendered; "Use URL" button fires `onUrlSubmit` with trimmed value; button disabled when `isUploading`

### Implementation for US2

- [x] T023 [P] [US2] Implement `sideloadAnswerImageFromUrl(url: string): Promise<MediaAttachment>` in `react-app/src/admin/data/admin-api.ts` using JSON body + `POST /media/from-url`
- [x] T024 [P] [US2] Implement `sideloadQuestionImage` thunk in `react-app/src/admin/store/editor/editor.slice.ts`; same reducer pattern as `uploadQuestionImage` (pending clears `uploadError`; rejected sets `uploadError`)
- [x] T025 [US2] Add URL `<input type="url">` + "Use URL" `<button>` to `react-app/src/admin/components/answer-image-uploader/answer-image-uploader.tsx`; both disabled when `isUploading`; `onUrlSubmit` fired with trimmed value on button click or Enter key
- [x] T026 [US2] Update `react-app/src/admin/features/game-editor/game-editor.tsx`: dispatch `sideloadQuestionImage` thunk on URL submit; pass `onImageSideload` callback to each `QuestionCard`; update `QuestionCardProps` with `onImageSideload`

**Checkpoint**: User Story 2 fully functional. URL download → WP media library → thumbnail. Tests green.

---

## Phase 5: User Story 3 — Manage and Remove (Priority: P3)

**Goal**: Editor can see the current image thumbnail; remove it (reference cleared, media entry kept); image persists correctly across save/reload.

**Independent Test**: Open a question with an image; confirm thumbnail shown; click "Remove image"; thumbnail disappears; save + reload; no image shown; verify media library entry still exists.

### Tests for US3 ⚠️ Write and confirm red before T029–T030

- [x] T027 [test] [US3] Add failing tests for remove + thumbnail paths to `react-app/src/admin/components/answer-image-uploader/answer-image-uploader.test.tsx`: thumbnail shown when `imageUrl` provided; "Remove image" button fires `onRemove`; no thumbnail when `imageUrl` absent; `imageAlt` + `imageCaption` inputs rendered when image present
- [x] T028 [test] [US3] Add failing test to `react-app/src/admin/store/editor/editor.slice.test.ts`: dispatching `updateGameField` with `answerImageId: 0` clears image from question in state

### Implementation for US3

- [x] T029 [US3] Add thumbnail preview (using existing `ImagePreview` component) + "Remove image" `<button aria-label="Remove answer image">` to `react-app/src/admin/components/answer-image-uploader/answer-image-uploader.tsx`; show only when `imageId > 0` or `imageUrl` non-empty; also render `imageAlt` input + `imageCaption` input when image present
- [x] T030 [US3] Add `onImageRemove` handler in `react-app/src/admin/features/game-editor/game-editor.tsx`: dispatches `updateGameField` setting `answerImageId: 0`, `answerImage: ''`, `answerImageAlt: ''`, `answerImageCaption: ''`; pass as `onImageRemove` to `QuestionCard`; update `QuestionCardProps`

**Checkpoint**: User Story 3 fully functional. Remove clears reference; media entry kept. Tests green.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T031 [coverage] Run `cd react-app && npm run test -- --run --coverage`; verify `coverage/coverage-summary.json` shows lines ≥ 90% + branches ≥ 90% for all new and modified files; fix any gaps — NOTE: project-wide coverage is pre-existing at 68% (many feature files have zero tests); new files are at 95-98%; this gate requires addressing pre-existing gap separately
- [ ] T032 [a11y] Run `npx axe-core-cli http://localhost:<admin-port> --exit` against the game editor view; confirm 0 critical/serious violations introduced by new uploader UI
- [x] T033 [security] Final review: confirm `POST /media/upload` + `POST /media/from-url` both call `current_user_can('manage_trail_trivia')` in `permission_callback`; confirm all PHP inputs sanitized (`esc_url_raw` on URL, `wp_handle_upload` for file); confirm all outputs escaped in `attachment_to_response()`
- [x] T034 Run `cd react-app && npm run build:admin`; confirm `npx tsc --noEmit` exits 0; verify `wp-plugin/trail-trivia/assets/admin/` is updated
- [ ] T035 Run all curl smoke tests from [quickstart.md](quickstart.md): file upload, URL download, taxonomy tag verification, unauthenticated rejection; all must exit with expected responses

---

## Dependencies

```
T001 → T007 (taxonomy defined before PHP uses it)
T002 → T013, T014, T023, T024 (MediaAttachment type needed by API functions + thunks)
T003 → T014, T024 (answerImageId in Question needed by thunks)
T004 → T014, T024 (uploadingQuestionId in EditorState)
T005, T006 → T007, T008 (helpers before route handlers)
T007, T008 → T009 (routes before security validation)
T010 → T013 (test red before implement)
T011 → T014 (test red before implement)
T012 → T015 (test red before implement)
T013, T014 → T016 (api + thunk before component integration)
T015, T016 → T017, T018 (component + card before game-editor wiring)
T017, T018, T019 → T031 (US1 complete before coverage gate)
T020 → T023, T021 → T024, T022 → T025 (TDD: test red before implement, US2)
T025, T026 → T031 (US2 complete before coverage gate)
T027 → T029, T028 → T030 (TDD: test red before implement, US3)
T029, T030 → T031 (US3 complete before coverage gate)
T031, T032, T033, T034, T035 → done
```

## Parallel Execution Opportunities

**Phase 1** (all parallel):
- T001 (PHP taxonomy) ∥ T002 (MediaAttachment type) ∥ T003 (Question type) ∥ T004 (EditorState)

**Phase 2**:
- T005 → T006 → T007 → T008 (sequential, same file)
- T009 after T008

**Phase 3 tests** (after T009):
- T010 ∥ T011 ∥ T012 (different test files)

**Phase 3 impl** (after paired tests are red):
- T013 ∥ T014 (different files: admin-api.ts ∥ editor.slice.ts)
- T015 after T013+T014 (component uses both)

**Phase 4 tests** (after US1 checkpoint):
- T020 ∥ T021 ∥ T022

**Phase 4 impl**:
- T023 ∥ T024

## Implementation Strategy

**MVP (Phase 1–3 + Phase 6)**: Local file upload fully working end-to-end. Editors can attach images without external URLs; WP media library tagged correctly. Ship this first.

**Increment 2 (Phase 4)**: URL download. Adds the "paste a URL" path without touching Phase 1–3 code.

**Increment 3 (Phase 5)**: Remove/thumbnail. Clean up and previewing. Low risk, no new API calls.
