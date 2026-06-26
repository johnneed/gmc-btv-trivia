/**
 * Canonical TypeScript domain type definitions — Phase 0 contract.
 *
 * This file is the reference source of truth for all domain types.
 * Every type file in react-app/src/domain/types/ MUST match these signatures exactly.
 *
 * @package GMC Burlington Trail Trivia
 */

// ─── choice.type.ts ───────────────────────────────────────────────────────────

type Choice = {
  id: string;   // UUID v4
  text: string;
};

// ─── question.type.ts ─────────────────────────────────────────────────────────

type Question = {
  id: string;                   // UUID v4
  questionText: string;
  choices: Choice[];            // always exactly 4 at publish time
  correctAnswerIndex: number;   // 0–3 inclusive
  answerText: string;
  answerImage?: string;         // absolute URL or empty string
  answerImageAlt?: string;      // required when answerImage is set (ARIA)
  answerImageCaption?: string;
  // NOTE: no 'tags' field — per-question tagging is not implemented
};

// ─── quiz.type.ts ─────────────────────────────────────────────────────────────

type Quiz = {
  id: string;                           // UUID v4
  title: string;
  subtitle?: string;
  author: string;                       // WP display_name (denormalized)
  authorId: number;                     // WP user ID
  publishDate: number;                  // Unix ms timestamp
  status: 'draft' | 'published';
  questions: Question[];                // exactly 5 at publish time
  tags: string[];                       // quiz-level tags
  // NOTE: no 'image' field — no featured image for games
};

// ─── app-user.type.ts ─────────────────────────────────────────────────────────

type WPRole = 'contributor' | 'author' | 'editor' | 'administrator';

type AppUser = {
  id: number;
  displayName: string;
  roles: WPRole[];
  isTriviaSmith: boolean; // true iff user has manage_trail_trivia cap OR is administrator
};

// ─── plugin-settings.type.ts ──────────────────────────────────────────────────

/** User-editable settings. Only field accepted by PUT /settings. */
type PluginSettings = {
  gamesPerPage: number; // default 10
};

/** Read-only plugin metadata. Returned by GET /settings; never sent in PUT /settings. */
type PluginInfo = {
  version: string;    // semver, e.g. "1.0.0"
  wpMinimum: string;  // e.g. "6.4"
  phpMinimum: string; // e.g. "8.0"
};

// ─── Exports (mirrors index.ts barrel) ────────────────────────────────────────

export type { Choice, Question, Quiz, WPRole, AppUser, PluginSettings, PluginInfo };
