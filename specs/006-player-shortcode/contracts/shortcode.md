# Shortcode Contract: [trail_trivia]

## Usage

```
[trail_trivia]
```

No parameters. The shortcode is self-contained.

## Output Contract

When `[trail_trivia]` is rendered in WordPress page content, the plugin produces:

**HTML output** (returned by shortcode handler, inserted at shortcode position):
```html
<div id="trail-trivia-root"></div>
```

**Enqueued assets** (added to page `<head>` and `<footer>` by WordPress):
```html
<!-- In <head> -->
<link rel="stylesheet" id="trail-trivia-player-css" href="{plugin_url}/assets/player/index.css?ver=1.0.0" />

<!-- Inline before player script -->
<script>
window.trailTriviaConfig = {"apiBase":"https://site.example/wp-json/trail-trivia/v1","nonce":"abc123..."};
</script>

<!-- In <footer> (in_footer=true) -->
<script id="trail-trivia-player-js" src="{plugin_url}/assets/player/index.js?ver=1.0.0"></script>
```

## Guarantees

1. The `<div id="trail-trivia-root">` element appears at the shortcode's position in the page content.
2. `window.trailTriviaConfig` is set before `index.js` executes.
3. Assets are enqueued exactly once regardless of how many times `[trail_trivia]` appears on the page.
4. Assets are NOT loaded on pages that do not contain the shortcode.
5. The shortcode produces no PHP notices, warnings, or fatal errors.

## Page Configuration Object Stability

The `window.trailTriviaConfig` object shape is defined in the constitution Architecture section and is stable for the life of this API version. Phase 5 (admin UI) may add fields to this object; it will never remove `apiBase` or `nonce`.

## Compatibility

- WordPress: 6.4 and 6.5
- Theme: any theme; tested against Twenty Twenty-Four
- Caching: pages using this shortcode should exclude nonces from full-page cache (operational responsibility of site admin)
