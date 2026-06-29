# Feature Specification: Answer Image Upload

**Feature Branch**: `009-answer-image-upload`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "I need to change how images are handled for question answers. Images should be local, meaning they should be uploaded to the media gallery. tagged as trivia game answer images. allow users to drag and drop an image, or browse on the local computer. Additionally allow user to specify a url, that will be downloaded and then added to the media gallery"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload Local Image to Answer (Priority: P1)

A trivia game editor is editing a question answer and needs to attach an image. They drag and drop an image file from their computer (or click to browse), the image is uploaded to the WordPress media library tagged as a trivia answer image, and the answer's image field is set to that media library entry.

**Why this priority**: Core requirement — replaces external URL references with managed local media, ensuring images don't break when external sources change.

**Independent Test**: Open the TriviaSmith admin UI, edit any question answer, drag an image onto the drop zone, confirm the image appears in the answer preview and exists in the WP media library with the trivia answer tag.

**Acceptance Scenarios**:

1. **Given** an editor is on the answer editing form, **When** they drag and drop an image file onto the designated drop zone, **Then** the image is uploaded to the WP media library, tagged as a trivia game answer image, and displayed as the answer's image.
2. **Given** an editor is on the answer editing form, **When** they click "Browse" and select a local image file, **Then** the image is uploaded to the WP media library, tagged as a trivia game answer image, and displayed as the answer's image.
3. **Given** an image upload is in progress, **When** the upload is not yet complete, **Then** a progress indicator is shown and the form cannot be submitted.
4. **Given** an editor uploads an invalid file type (not an image), **When** they attempt to upload, **Then** they receive a clear error message and no upload occurs.
5. **Given** an answer already has an image, **When** the editor uploads a new image, **Then** the new image replaces the previous one as the answer's image reference and the old media library entry is retained (not deleted).

---

### User Story 2 - Download Image from URL (Priority: P2)

A trivia game editor provides a publicly accessible URL for an image. The system fetches the image from that URL, stores it in the WordPress media library tagged as a trivia answer image, and associates it with the answer — so the game is no longer dependent on the external URL remaining available.

**Why this priority**: Secondary input method; extends reach to editors who find images online without needing a local copy first.

**Independent Test**: Enter a valid image URL in the URL field, submit, confirm the image is downloaded, appears in WP media library with the trivia tag, and is shown on the answer.

**Acceptance Scenarios**:

1. **Given** an editor enters a valid image URL and submits, **When** the system processes the URL, **Then** the image is fetched and stored in the WP media library tagged as a trivia game answer image, and the answer's image field is updated.
2. **Given** an editor enters a URL that returns a non-image or is unreachable, **When** they submit, **Then** they receive a clear error message describing the failure and no media library entry is created.
3. **Given** a URL download is in progress, **When** the operation is not yet complete, **Then** a progress/loading indicator is shown.

---

### User Story 3 - Manage and Remove Answer Image (Priority: P3)

An editor can see the current image on an answer, replace it with a new upload or URL, or remove it entirely.

**Why this priority**: Basic CRUD completeness — without removal, stale images accumulate and cannot be corrected.

**Independent Test**: Attach an image to an answer, then click "Remove image" and save; confirm the answer no longer shows an image.

**Acceptance Scenarios**:

1. **Given** an answer has an assigned image, **When** the editor views the answer form, **Then** a thumbnail preview of the current image is displayed.
2. **Given** an answer has an assigned image, **When** the editor clicks "Remove image", **Then** the image association is cleared (the media library entry remains; only the answer's reference is removed).

---

### Edge Cases

- What happens when an uploaded file exceeds the WordPress media upload size limit? → User receives a clear error with the size limit stated.
- How does the system handle a URL that redirects multiple times before resolving to an image? → Follow redirects up to a reasonable limit (e.g. 5); fail with an error beyond that.
- What happens if the media library tag for trivia answer images does not yet exist? → The tag is created automatically on first use.
- What if two editors upload to the same answer simultaneously? → Last write wins (same as other answer field saves); no data corruption.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The answer editing form MUST provide a drag-and-drop zone for uploading an image file from the user's local computer.
- **FR-002**: The answer editing form MUST provide a "Browse" button that opens a local file picker restricted to image file types.
- **FR-003**: The answer editing form MUST provide a text input where the editor can enter a publicly accessible image URL to download. The URL field MUST be visible simultaneously with the drag-and-drop zone and Browse button (not hidden behind a tab).
- **FR-004**: When a local file is uploaded, the system MUST store it in the WordPress media library and tag it with the trivia game answer image tag.
- **FR-005**: When a URL is provided, the system MUST download the image server-side (timeout: 15 seconds) and store it in the WordPress media library tagged as a trivia game answer image. Requests that exceed 15 seconds MUST be aborted and the editor notified.
- **FR-006**: The answer form MUST display a thumbnail preview of the currently assigned image.
- **FR-007**: The editor MUST be able to remove or replace the current image association from an answer without deleting the old media library entry. Media library entries are never deleted by this feature.
- **FR-008**: Upload and URL-download operations MUST provide feedback (progress or loading indicator) while in progress.
- **FR-009**: Invalid uploads (wrong file type, oversized file) and failed URL downloads MUST produce user-readable error messages that do not block other form interactions.
- **FR-010**: All uploaded images MUST be tagged with a consistent WordPress media tag (e.g. "trivia-answer-image") to allow filtering in the media library.
- **FR-011**: The tag used to identify trivia answer images MUST be created automatically if it does not already exist.
- **FR-012**: Only authenticated users with the `manage_trail_trivia` capability MUST be permitted to upload images or trigger URL downloads via the API.

### Key Entities

- **Answer Image**: A WordPress media attachment associated with one question answer; carries the "trivia-answer-image" tag and a reference stored in answer post meta.
- **Answer**: An individual response option for a trivia question; has an optional image field pointing to a media attachment ID.
- **Trivia Answer Image Tag**: A WordPress media tag (attachment taxonomy term) used to label all images uploaded through this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An editor can attach an image to an answer via drag-and-drop, file browse, or URL in under 30 seconds under normal conditions.
- **SC-002**: 100% of images attached to answers are stored in the WordPress media library (no external URL references remain as the stored value).
- **SC-003**: All uploaded/downloaded images are discoverable in the media library by filtering on the trivia answer image tag.
- **SC-004**: Invalid file type and URL errors are surfaced to the user within 3 seconds of the failed operation with a message that names the specific failure reason.
- **SC-005**: Neither removing nor replacing an answer image deletes any media library entry — zero media deletions are triggered by this feature.

## Clarifications

### Session 2026-06-28

- Q: When an editor replaces an existing answer image with a new one, should the old media library entry be deleted or kept? → A: Keep the old entry — same policy as explicit removal; no deletions ever triggered by this feature.
- Q: Should the three image input methods (drag-drop, browse, URL) be shown simultaneously or in tabs? → A: All three visible simultaneously — drop zone with embedded Browse button, URL field below it.
- Q: What should the server-side URL download timeout be? → A: 15 seconds; abort and notify the editor on timeout.

## Assumptions

- The TriviaSmith admin UI (React app) is the only interface where answer images are managed; the player UI is read-only.
- The WordPress media library's existing attachment taxonomy is used for tagging; no custom taxonomy is introduced.
- URL downloads are performed server-side by the PHP plugin (not by the browser) to avoid CORS issues and to ensure media is fully under WordPress control.
- Supported image formats are those WordPress already accepts by default (JPEG, PNG, GIF, WebP); no additional format support is added.
- Maximum file size is governed by the existing WordPress/PHP `upload_max_filesize` configuration; no custom override is added.
- Mobile/responsive support for the drag-and-drop zone is desirable but falls back gracefully to the "Browse" button on touch devices.
- Existing answers with external image URLs are out of scope for automatic migration in this feature; a separate migration task can address that later.
