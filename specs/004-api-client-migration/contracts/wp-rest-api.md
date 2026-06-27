# WP REST API Contract: Trail Trivia Client (Phase 3)

These are the endpoints the React player app calls in Phase 3. The server implementations are built in Phase 4. Phase 3 tests mock these endpoints; Phase 4 makes them real.

All endpoints are under `{apiBase}` where `apiBase = window.trailTriviaConfig?.apiBase ?? VITE_API_BASE_URL`.

---

## Public Endpoints (no authentication required)

### `GET {apiBase}/games`

Returns all published games, newest first.

**Request**
- Method: `GET`
- Headers: none required
- Body: none

**Response (200)**
```json
[
  {
    "id": "efe84224-...",
    "title": "The Continental Divide Trail",
    "subtitle": "The Third Jewel in the Triple Crown",
    "author": "John Need",
    "authorId": 1,
    "publishDate": 1703822400000,
    "status": "published",
    "questions": [ /* 5 Question objects */ ],
    "tags": []
  }
]
```
Empty array `[]` when no published games exist.

**Error responses**
- `401 Unauthorized` — WordPress site is private (not expected on a public site; handled by "unauthorized" status)
- `500 Internal Server Error` — handled by "failed" status

---

### `GET {apiBase}/games/{id}`

Returns a single published game by ID.

**Request**
- Method: `GET`
- Path param: `id` — UUID string

**Response (200)** — same shape as a single item from the list

**Error responses**
- `404 Not Found` — game does not exist or is not published; treat as generic error
- `401 Unauthorized` — handled by "unauthorized" status

---

## Authenticated Endpoint

### `GET {apiBase}/games/all`

Returns all games (published + draft). Requires `manage_trail_trivia` capability.

**Request**
- Method: `GET`
- Headers: `X-WP-Nonce: {nonce}` (nonce from `window.trailTriviaConfig.nonce`)

**Response (200)** — same array shape as `/games` but includes `status: "draft"` items

**Error responses**
- `401 Unauthorized` — missing or invalid nonce; thrown as `UnauthorizedError`
- `403 Forbidden` — authenticated but lacks `manage_trail_trivia` cap; treat as generic error

---

## Timeout Contract

All three endpoints are subject to a **10-second client-side timeout**. If the server does not respond within 10 seconds, the request is cancelled and the caller receives an abort error.

The abort error is **not** surfaced to the player as an error message — it is logged and treated as a timeout (separate error state from 5xx).

---

## Stability Note

These endpoint URLs and response shapes are read from `MIGRATION_PLAN.md` Section 3.2 (REST API Endpoints) and Section 1.3 (REST API Response Shape). Phase 4 must implement servers that match this contract exactly. If Phase 4 changes a field name or adds a required header, this contract doc and `trivia-api.ts` must be updated together.
