# REST API Contracts: Media Upload Endpoints

Base: `/wp-json/trail-trivia/v1`

All write endpoints require `X-WP-Nonce` header and `manage_trail_trivia` capability.
Error responses follow the pattern: `{ "code": string, "message": string, "data": { "status": number } }`.

---

## POST `/media/upload`

Upload a local image file to the WordPress media library.

**Auth**: `manage_trail_trivia` capability required.

**Request**: `multipart/form-data`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `file` | binary | yes | Image file (JPEG, PNG, GIF, WebP — WP default allowed types) |

**Response `200 OK`**:

```json
{
  "id": 42,
  "url": "https://example.com/wp-content/uploads/2026/06/trail.jpg",
  "alt": ""
}
```

| Field | Type | Notes |
|-------|------|-------|
| `id` | number | WP attachment post ID |
| `url` | string | Full-size URL via `wp_get_attachment_image_url($id, 'full')` |
| `alt` | string | Alt text from `_wp_attachment_image_alt` meta (empty string if unset) |

**Error responses**:

| Code | HTTP | Condition |
|------|------|-----------|
| `rest_forbidden` | 403 | Missing capability |
| `trivia_upload_no_file` | 400 | No file in request |
| `trivia_upload_invalid_type` | 400 | File type not permitted by WordPress |
| `trivia_upload_failed` | 500 | `wp_handle_upload()` returned error |

---

## POST `/media/from-url`

Download an image from a public URL into the WordPress media library.

**Auth**: `manage_trail_trivia` capability required.

**Request**: `application/json`

```json
{ "url": "https://example.com/trail.jpg" }
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `url` | string | yes | Publicly accessible image URL |

**Response `200 OK`**: Same shape as `/media/upload`.

```json
{
  "id": 43,
  "url": "https://example.com/wp-content/uploads/2026/06/trail-1.jpg",
  "alt": ""
}
```

**Error responses**:

| Code | HTTP | Condition |
|------|------|-----------|
| `rest_forbidden` | 403 | Missing capability |
| `trivia_url_missing` | 400 | `url` field absent or empty |
| `trivia_url_invalid` | 400 | Not a valid URL (`esc_url_raw` returns empty) |
| `trivia_url_timeout` | 400 | Remote HEAD/GET exceeded 15 seconds |
| `trivia_url_not_image` | 400 | Response `Content-Type` is not `image/*` |
| `trivia_sideload_failed` | 500 | `media_sideload_image()` returned `WP_Error` |

---

## Modified response: GET `/games/{id}` and GET `/games/all`

The `questions[].answerImage` field is now computed by PHP from `answerImageId` when present.

```json
{
  "questions": [
    {
      "id": "q1",
      "answerImageId": 42,
      "answerImage": "https://example.com/wp-content/uploads/2026/06/trail.jpg",
      "answerImageAlt": "A mountain trail",
      "answerImageCaption": "Burlington's main trail"
    }
  ]
}
```

`answerImageId` is included in GET responses so the editor can display which attachment is linked. It is `0` or absent when no managed image is attached.
