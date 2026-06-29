# Data Model: Answer Image Upload

## Modified Entity: Question

**File**: `react-app/src/domain/types/question.type.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | existing |
| `questionText` | `string` | existing |
| `choices` | `Choice[]` | existing |
| `correctAnswerIndex` | `number` | existing |
| `answerText` | `string` | existing |
| `answerImage` | `string \| undefined` | existing — resolved URL, populated by PHP on read; never written by client post-feature |
| `answerImageId` | `number \| undefined` | **new** — WP attachment ID; client writes this; PHP resolves to URL |
| `answerImageAlt` | `string \| undefined` | existing |
| `answerImageCaption` | `string \| undefined` | existing |

**Backward compat rule**: If `answerImageId` is absent or `0`, PHP falls back to raw `answerImage` string. Client writes `answerImageId` after any upload; sets to `0` or omits on remove.

---

## New Entity: MediaAttachment

**File**: `react-app/src/domain/types/media-attachment.type.ts`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` | WP attachment post ID |
| `url` | `string` | Full URL via `wp_get_attachment_image_url()` at 'full' size |
| `alt` | `string` | Alt text from attachment meta |

This type is returned by both new REST endpoints and consumed by the editor's upload thunks.

---

## WordPress Storage

**Post meta key**: `_trivia_questions` (existing) — JSON array of `Question` objects. After this feature, each question object may include `answerImageId`.

**Attachment taxonomy**: `trivia_image_type` registered on `attachment` post type.
- Label: "Trivia Image Type"
- Term slug: `trivia-answer-image`
- Term name: "Trivia Answer Image"
- Created automatically on first upload if absent.

**Attachment meta** (standard WP, no custom keys):
- `_wp_attachment_image_alt` — alt text
- `_wp_attached_file` — file path
- `_wp_attachment_metadata` — sizes metadata

---

## State: EditorState additions

**File**: `react-app/src/admin/store/editor/editor.slice.ts`

| Field | Type | Notes |
|-------|------|-------|
| `uploadingQuestionId` | `string \| null` | **new** — question `id` currently uploading; `null` when idle |

---

## PHP Resolution Logic (read path)

When building each question object in the REST GET response:

```
if answerImageId present and > 0:
    answerImage = wp_get_attachment_image_url(answerImageId, 'full')
    (use stored answerImage string as fallback if URL resolves to false)
else:
    answerImage = stored answerImage string (legacy)
```

No writes to `answerImage` in post meta — it's always computed on read.
