# Quickstart Validation: Answer Image Upload

## Prerequisites

- WordPress running locally with the trail-trivia plugin active
- Admin user with `manage_trail_trivia` capability
- React dev server: `cd react-app && npm run dev:admin`
- WP nonce available via `trailTriviaAdminConfig.nonce`

---

## Scenario 1 — File Upload (drag-and-drop)

1. Open TriviaSmith admin → edit any game → expand a question card
2. Drag a JPEG from your desktop onto the image drop zone in the "Answer Image" section
3. **Expected**: Progress indicator visible during upload; thumbnail appears when done
4. Open WordPress admin → Media Library → filter by "Trivia Answer Image" tag
5. **Expected**: Uploaded file visible in filtered results
6. Save the game; reload the editor
7. **Expected**: Thumbnail still shown; no external URL in the form

---

## Scenario 2 — File Upload (browse)

1. Same as Scenario 1 steps 1–7, but click "Browse" instead of drag-dropping
2. Select a PNG from the file picker
3. **Expected**: Same outcomes as Scenario 1

---

## Scenario 3 — URL Download

1. Open TriviaSmith admin → edit any game → expand a question card
2. Paste a valid image URL into the URL field and press Enter or click "Use URL"
3. **Expected**: Loading indicator while downloading; thumbnail appears when done
4. **Expected**: Media library contains the downloaded file tagged "Trivia Answer Image"
5. **Expected**: Original external URL is no longer stored; attachment ID is used instead

---

## Scenario 4 — Remove Image

1. On a question that already has an image, click "Remove image"
2. **Expected**: Thumbnail cleared immediately; "Remove" button disappears
3. Save; reload
4. **Expected**: No image shown; media library entry still exists (not deleted)

---

## Scenario 5 — Replace Image

1. On a question that already has an image, upload a new file (drag-drop or browse)
2. **Expected**: New thumbnail shown; old media library entry still present (not deleted)

---

## Scenario 6 — Error: Invalid file type

1. Drag a `.pdf` file onto the drop zone
2. **Expected**: Error message shown within 3 seconds; no upload occurs; no media library entry created

---

## Scenario 7 — Error: Unreachable URL

1. Enter `https://this-host-does-not-exist.invalid/image.jpg` in the URL field
2. **Expected**: Error message shown within ~18 seconds (15s timeout + response); no media library entry

---

## API smoke tests (curl)

```bash
# Upload via file
curl -s -X POST \
  -H "X-WP-Nonce: $NONCE" \
  -F "file=@/path/to/test.jpg" \
  http://localhost:8080/wp-json/trail-trivia/v1/media/upload \
  | jq '{id, url}'
# Expected: { "id": <number>, "url": "http://..." }

# Download from URL
curl -s -X POST \
  -H "X-WP-Nonce: $NONCE" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/24701-nature-natural-beauty.jpg/320px-24701-nature-natural-beauty.jpg"}' \
  http://localhost:8080/wp-json/trail-trivia/v1/media/from-url \
  | jq '{id, url}'
# Expected: { "id": <number>, "url": "http://..." }

# Verify tag
curl -s "http://localhost:8080/wp-json/wp/v2/media/$ATTACHMENT_ID" \
  | jq '.trivia_image_type'
# Expected: array containing "trivia-answer-image"

# Verify unauthenticated upload is rejected
curl -s -X POST \
  -F "file=@/path/to/test.jpg" \
  http://localhost:8080/wp-json/trail-trivia/v1/media/upload \
  | jq '.code'
# Expected: "rest_forbidden"
```

---

## References

- [Data model](data-model.md) — `Question.answerImageId`, `MediaAttachment` type, `EditorState.uploadingQuestionId`
- [API contracts](contracts/media-endpoints.md) — full request/response shapes and error codes
