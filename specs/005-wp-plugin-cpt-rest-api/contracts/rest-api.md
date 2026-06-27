# REST API Contract: Trail Trivia WP Plugin (Phase 4)

Base: `/wp-json/trail-trivia/v1`
Namespace: `trail-trivia/v1`

All write endpoints require `X-WP-Nonce: {nonce}` header where nonce = `wp_create_nonce('wp_rest')`.
All responses use `Content-Type: application/json`.

---

## Public Endpoints (no authentication)

### GET /games

Returns published games with `publishDate <= now`, newest first.

**Response 200**
```json
[
  { "id": "uuid", "title": "...", "subtitle": "...", "author": "...", "authorId": 1,
    "publishDate": 1703822400000, "status": "published", "questions": [...], "tags": [] }
]
```
Empty array `[]` when none exist. Never HTTP 4xx.

---

### GET /games/{id}

`id` = UUID v4 string (the `_trivia_original_id` meta value).

**Response 200** — single game object (same shape as list item)
**Response 404** — game not found or not published (no auth)
```json
{ "code": "game_not_found", "message": "Game not found.", "data": { "status": 404 } }
```

---

## Authenticated Endpoints (require `manage_trail_trivia` capability)

### GET /games/all

Returns all non-trashed games (published + draft).

**Response 200** — array of game objects (same shape; `"status"` may be `"draft"`)
**Response 401** — not authenticated
**Response 403** — authenticated but lacks capability

---

### POST /games

Creates a new game. Generates UUID v4 for `id`.

**Request body**
```json
{
  "title":       "string (required)",
  "subtitle":    "string (optional)",
  "publishDate": 1703822400000,
  "status":      "draft|published",
  "questions":   [ /* 5 Question objects */ ],
  "tags":        ["string"]
}
```

**Response 201** — created game object (full shape including generated `id`)
**Response 400** — validation failure
```json
{ "code": "invalid_questions", "message": "...", "data": { "status": 400 } }
```
**Response 401** — not authenticated
**Response 403** — lacks capability

---

### PUT /games/{id}

Full replacement of an existing game (all fields required).

**Request body** — same as POST (all fields required except `id` which comes from path)
**Response 200** — updated game object
**Response 400** — validation failure
**Response 401 / 403** — auth/cap failure
**Response 404** — game not found

---

### PATCH /games/{id}

Partial update. Accepts exactly: `status`, `title`, `tags`. All other fields ignored.

**Request body** (all optional — include only fields to update)
```json
{
  "status": "draft|published",
  "title":  "string",
  "tags":   ["string"]
}
```

**Response 200** — updated game object (full shape)
**Response 400** — invalid field value (e.g. `status` is not `"draft"` or `"published"`)
**Response 401 / 403 / 404** — as above

---

### DELETE /games/{id}

Moves game to WordPress trash (recoverable). Does NOT permanently delete.

**Response 200**
```json
{ "deleted": true, "id": "uuid" }
```
**Response 401 / 403** — auth/cap failure
**Response 404** — game not found or already trashed

---

## Settings Endpoints (require `manage_options` capability)

### GET /settings

**Response 200**
```json
{
  "gamesPerPage": 10,
  "version":      "1.0.0",
  "wpMinimum":    "6.4",
  "phpMinimum":   "8.0"
}
```
**Response 403** — lacks `manage_options`

---

### PUT /settings

Replaces editable settings. Accepts ONLY `gamesPerPage`. Any additional field → HTTP 400.

**Request body**
```json
{ "gamesPerPage": 20 }
```

**Response 200** — full settings object (including read-only fields)
**Response 400**
```json
{ "code": "invalid_settings_field", "message": "Unknown or read-only field: version", "data": { "status": 400 } }
```
**Response 403** — lacks `manage_options`

---

## Error Shape

All errors follow `WP_Error` serialization:
```json
{ "code": "machine_readable_code", "message": "Human readable.", "data": { "status": 400 } }
```

Common codes:
- `game_not_found` — 404
- `invalid_questions` — 400 (questions array validation)
- `invalid_publishdate` — 400 (non-integer or out of range)
- `invalid_settings_field` — 400 (unknown PUT settings field)
- `missing_required_field` — 400 (required field absent on POST/PUT)
- `rest_forbidden` — 403 (capability check fails)
- `rest_not_logged_in` — 401 (no authentication)
- `invalid_nonce` — 403 (nonce verification fails on write)
