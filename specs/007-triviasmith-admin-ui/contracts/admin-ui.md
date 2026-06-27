# Admin UI Contracts: TriviaSmith Admin UI (Phase 5)

---

## WP Admin Page Contract

All three admin views (game list, editor, settings) are served by `templates/admin-page.php`:

```html
<div class="wrap">
    <div id="trail-trivia-admin-root"></div>
</div>
```

The React app mounts to `#trail-trivia-admin-root` and uses HashRouter to show the appropriate view. No separate PHP templates per page.

---

## `window.trailTriviaAdminConfig` Contract

Injected before `assets/admin/index.js` via `wp_add_inline_script(..., 'before')`:

```ts
interface TrailTriviaAdminConfig {
  apiBase: string;        // e.g. "https://site/wp-json/trail-trivia/v1"
  nonce: string;          // wp_create_nonce('wp_rest')
  currentUser: {
    id: number;
    displayName: string;
    isAdmin: boolean;     // current_user_can('manage_options')
  };
}
```

---

## REST API Extensions (modifications to Phase 4 endpoints)

### `GET /games/all` — pagination support added

The existing endpoint gains optional query parameters:

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | int | 1 | Page number (1-indexed) |
| `per_page` | int | settings.gamesPerPage | Items per page |

**Response headers added**:
- `X-WP-Total`: total game count (published + draft)
- `X-WP-TotalPages`: total page count

**Response body**: same `Quiz[]` shape as before, now a page-sized slice.

No other Phase 4 endpoints are changed.

---

## Admin WP Menu Contract

| Menu label | Hook | Slug | Cap required | Renders |
|---|---|---|---|---|
| Trail Trivia | `add_menu_page` | `trail-trivia` | `manage_trail_trivia` | `admin-page.php` |
| All Games | `add_submenu_page` | `trail-trivia` | `manage_trail_trivia` | `admin-page.php` |
| Settings | `add_submenu_page` | `trail-trivia-settings` | `manage_options` | `admin-page.php` |

The React router inside the page reads the current `window.location.hash` to determine which view to render.

---

## Keyboard Drag Alternative Contract

The drag-to-reorder feature (dnd-kit) MUST activate keyboard sorting when a grip handle receives focus and the user presses Space or Enter. Arrow keys move the focused item up/down. The visual order updates in real time. No separate "up/down button" UI is required — dnd-kit's `KeyboardSensor` provides this natively.

---

## Autosave Contract

- Interval: every 60 seconds while the editor is mounted
- Trigger: `setInterval` cleared on editor unmount
- New game: first autosave calls `POST /games` (creates draft); subsequent saves call `PUT /games/{id}`
- Response: on success, `autosaveStatus = 'saved'`, `autosaveTimestamp = Date.now()`
- Failure: `autosaveStatus = 'failed'`; editor content is NOT lost
- UI: toolbar shows "Draft saved at HH:MM:SS" or "Autosave failed"
