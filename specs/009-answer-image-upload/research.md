# Research: Answer Image Upload

## Decision 1: How to store the image reference in `_trivia_questions` JSON

**Decision**: Store `answerImageId: number` (WP attachment ID) alongside the existing `answerImage: string` field. PHP resolves the ID to a URL on every GET response via `wp_get_attachment_image_url()`. The raw `answerImage` URL field is populated by PHP on read — never written by the client after this feature ships.

**Rationale**: Player side (`answerImage: string`) needs zero changes. Old games without `answerImageId` continue to work: PHP falls back to the stored `answerImage` string if `answerImageId` is absent or `0`. No migration needed.

**Alternatives considered**:
- Store only the URL (current state) — images break if WordPress moves attachments; ruled out.
- Store only the ID, remove URL from domain type — requires player-side changes; ruled out (scope).

---

## Decision 2: How to tag attachments for media library filtering

**Decision**: Register a custom `trivia_image_type` taxonomy on the `attachment` post type (in `class-post-type.php`). Assign the `trivia-answer-image` term on every upload/sideload via `wp_set_object_terms()`. The term is auto-created on first use.

**Rationale**: WordPress media library filter dropdowns use taxonomies. Post meta keys do not appear in the media library filter UI. A registered attachment taxonomy is the only way to satisfy SC-003 ("discoverable in the media library by filtering").

**Alternatives considered**:
- `update_post_meta($id, '_trivia_image_type', 'answer')` — simpler but media library filter won't show it; ruled out.
- Reuse existing `attachment_tag` taxonomy — not registered by default in WP 6.4/6.5; would require detection logic; ruled out.

---

## Decision 3: Server-side URL download mechanism

**Decision**: Use WordPress's built-in `media_sideload_image()` with a preceding `wp_remote_get()` (timeout: 15 seconds) to validate the URL resolves and returns an image `Content-Type` before sideloading. Return `WP_Error` on timeout or non-image response.

**Rationale**: `media_sideload_image()` handles tmp download, attachment creation, and metadata generation. `wp_remote_get()` gives control over timeout and content-type check before the heavier sideload runs.

**Alternatives considered**:
- Direct `file_get_contents()` — no timeout control, blocked on many hosts; ruled out.
- Custom curl — reinvents WP's HTTP API; ruled out (YAGNI).

---

## Decision 4: React upload architecture

**Decision**: Two thunks in `editor.slice.ts` (`uploadQuestionImage`, `sideloadQuestionImage`) call `admin-api.ts` functions and dispatch `updateGameField`. `AnswerImageUploader` is a dumb component in `admin/components/`. `QuestionCard` receives thunk-bound callbacks from `GameEditor` and passes them to `AnswerImageUploader`.

**Rationale**: Side effects stay in thunks (Principle II). `QuestionCard` stays dumb (currently in `admin/components/`). No new smart component layer needed — `GameEditor` already owns question mutations.

**Alternatives considered**:
- Promote `QuestionCard` to smart — breaks Principle VII, adds Redux coupling to a component that's currently clean; ruled out.
- Upload inside `AnswerImageUploader` directly via imported API function — Principle II violation (data layer import from components); ruled out.

---

## Decision 5: Upload progress tracking

**Decision**: Add `uploadingQuestionId: string | null` to `EditorState`. Thunk sets it to the question `id` on pending, clears on fulfilled/rejected. `QuestionCard` receives it as a prop and passes `isUploading` boolean to `AnswerImageUploader`.

**Rationale**: Minimal state addition. Covers FR-008 (progress indicator) and prevents form submission during upload (FR-001 scenario 3).

**Alternatives considered**:
- Per-question upload state map — overkill; only one upload at a time is realistic; ruled out.
