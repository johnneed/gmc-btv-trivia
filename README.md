# Trail Trivia

**Version 1.0.0**

A trail-themed trivia game plugin built for the Green Mountain Club — Burlington Section. Trail Trivia lets visitors test their knowledge of local trails, natural history, and GMC programs through short, shareable quizzes embedded directly on a WordPress site.

![Home Screen](../home-screen.png)

This repository is a monorepo containing both halves of the plugin:

- **`react-app/`** — the React/TypeScript source for the public quiz player and the "TriviaSmith" admin editor. Builds into the static assets the WordPress plugin serves.
- **`wp-plugin/trail-trivia/`** — the WordPress plugin itself: custom post type, REST API, capabilities, settings, and the shortcode that embeds the player.

## What It Does

- **Play** — a `[trail-trivia]` shortcode embeds a self-contained quiz player anywhere on the site. Visitors pick a game, answer multiple-choice questions with instant feedback, and get a shareable score screen at the end.
- **Author** — a WordPress admin screen ("TriviaSmith") lets staff create and edit games: questions, choices, answer images, and tags, with autosave and a live preview of the player experience without leaving the editor.
- **Manage access** — a dedicated `manage_trail_trivia` capability is granted automatically to Administrators and can be extended to Editors/Authors from Settings, without touching WordPress's built-in roles.

## Features

- Drag-and-drop-free, keyboard-accessible quiz player with animated transitions (respects `prefers-reduced-motion`)
- Per-question answer images with captions
- Score screen with social sharing buttons
- Admin game list with search/filter by tag
- In-editor live preview of the exact player experience, including score screen
- REST API (`/wp-json/trail-trivia/v1`) backing the admin UI, secured with WordPress nonces and capability checks
- WP-CLI scaffolding for future data-management commands

## Requirements

- WordPress 6.4+
- PHP 8.0+
- A modern browser for the admin editor (React 18 / Vite build)

## Installation

1. Build the frontend assets (see [Development](#development)) or download a release archive with `wp-plugin/trail-trivia/assets/` already built.
2. Copy (or symlink) `wp-plugin/trail-trivia/` into your WordPress install's `wp-content/plugins/` directory.
3. In **wp-admin → Plugins**, activate **Trail Trivia**.
4. Go to **Trail Trivia** in the admin menu to create your first game.
5. Place the shortcode on any page or post:

   ```
   [trail-trivia]
   ```

   (`[trail_trivia]` also works, for editors that dislike hyphens in shortcodes.)

## Usage

- **Players** see a single `<div id="root">` mount point where the shortcode is placed; the game list, quiz, and score screens are all client-side routed within it.
- **Editors** with the `manage_trail_trivia` capability get a **Trail Trivia** top-level admin menu with **All Games** and **Settings** submenus. Games autosave as you edit; use **Preview** in the editor toolbar to play through the game exactly as a visitor would before publishing.
- **Administrators** can extend authoring access to other roles under **Trail Trivia → Settings**, and configure how many games are shown per page in the game list.

## Architecture

```
react-app/          Source for both the public player and the admin editor (Vite + React + Redux Toolkit)
  src/features/      Player screens: home, quiz, score, quiz-list, loader
  src/admin/         TriviaSmith admin editor: game list, game editor, preview, settings
  src/components/    Shared presentational components (carousel, choice-button, action-button, ...)
  src/domain/        Framework-free types, factories, and transforms for quizzes/questions/choices

wp-plugin/trail-trivia/
  trail-trivia.php    Plugin bootstrap
  includes/           Post type, REST API, capabilities, settings, shortcode, admin UI, CLI, seeder
  assets/admin/       Built admin bundle (from react-app build:admin)
  assets/player/      Built player bundle (from react-app build:player)
```

The two Vite entry points (`build:admin` and `build:player`) let the public quiz player and the admin editor ship as independent bundles, so visitors never download admin-only code.

## Development

From `react-app/`:

| Command                  | Purpose                                                                     |
|--------------------------|------------------------------------------------------------------------------|
| `npm start`              | Run the dev server at `http://localhost:3000`                              |
| `npm test`                | Run the test suite in watch mode                                          |
| `npm run test:coverage`   | Run tests once with coverage thresholds enforced                          |
| `npm run lint`            | Lint `src/`                                                                |
| `npx tsc --noEmit`        | Typecheck without emitting output                                          |
| `npm run build:player`    | Build the public player bundle into `wp-plugin/trail-trivia/assets/player/` |
| `npm run build:admin`     | Build the admin editor bundle into `wp-plugin/trail-trivia/assets/admin/`   |

## Contributing

Issues and pull requests are welcome. Please run `npm run lint`, `npx tsc --noEmit`, and `npm run test:coverage` before submitting — the CI gate enforces 90% line/branch coverage on `src/domain`, `src/components`, and `src/features`.

## License

GPL-2.0-or-later, matching the WordPress plugin directory's licensing requirements.

## Credits

Built for the [Green Mountain Club, Burlington Section](https://GMCBurlington.org).

Need help with your own custom WordPress app? Check out [Inu Labs](https://inulabs.tech/).

## Release Notes

### 1.0.0

Initial documented release.

- Public quiz player: game list, quiz carousel with per-question answer images, score screen with social sharing
- TriviaSmith admin editor: game list with search, game editor with autosave, live in-editor preview
- REST API for game CRUD, secured with WordPress nonces and a dedicated `manage_trail_trivia` capability
- Configurable authoring access (Settings page) and games-per-page setting
- Separate Vite build pipelines for the player and admin bundles
