/**
 * Factory function public API contract — Phase 0.
 *
 * These are the exact signatures that react-app/src/domain/factories/*.ts MUST export.
 * Each factory accepts an optional Partial<T> for overrides and returns a complete T.
 * All factories are pure functions — no side effects, no I/O.
 *
 * TDD note: tests are written against these signatures BEFORE implementation.
 */

import type { Choice, Question, Quiz } from './typescript-types';

// ─── createChoice ─────────────────────────────────────────────────────────────

/**
 * Creates a Choice with defaults. Override any field via the partial parameter.
 *
 * Default: { id: uuidv4(), text: '' }
 *
 * TDD test cases (written first, must fail before implementation):
 *   - "returns a Choice with a non-empty UUID id when called with no arguments"
 *   - "returns a Choice with text '' when called with no arguments"
 *   - "merges overrides: createChoice({ text: 'foo' }) has text 'foo' and a valid id"
 *   - "every call returns a different id (UUIDs are unique)"
 *   - "the returned object satisfies the Choice type (no extra fields)"
 */
declare const createChoice: (overrides?: Partial<Choice>) => Choice;

// ─── createQuestion ───────────────────────────────────────────────────────────

/**
 * Creates a Question with defaults. Override any field via the partial parameter.
 * ALWAYS returns exactly 4 choices in the choices array — no exceptions.
 *
 * Default:
 *   {
 *     id: uuidv4(),
 *     questionText: '',
 *     choices: [createChoice(), createChoice(), createChoice(), createChoice()],
 *     correctAnswerIndex: 0,
 *     answerText: ''
 *   }
 *
 * TDD test cases (written first, must fail before implementation):
 *   - "returns a Question with a non-empty UUID id"
 *   - "always returns exactly 4 choices"
 *   - "each of the 4 default choices has a unique UUID id"
 *   - "correctAnswerIndex defaults to 0"
 *   - "questionText defaults to empty string"
 *   - "answerText defaults to empty string"
 *   - "merges overrides without losing unspecified fields"
 *   - "overriding choices with 2 items still returns exactly 4 choices" ← invariant test
 */
declare const createQuestion: (overrides?: Partial<Question>) => Question;

// ─── createQuiz ───────────────────────────────────────────────────────────────

/**
 * Creates a Quiz with defaults. Override any field via the partial parameter.
 * Note: default questions array is [] — the 5-question invariant is enforced
 * at publish time (admin UI + REST), not by the factory.
 *
 * Default:
 *   {
 *     id: uuidv4(),
 *     title: '',
 *     subtitle: undefined,
 *     author: '',
 *     authorId: 0,
 *     publishDate: Date.now(),
 *     status: 'draft',
 *     questions: [],
 *     tags: []
 *   }
 *
 * TDD test cases (written first, must fail before implementation):
 *   - "returns a Quiz with a non-empty UUID id"
 *   - "status defaults to 'draft'"
 *   - "publishDate defaults to a number close to Date.now()"
 *   - "authorId defaults to 0"
 *   - "questions defaults to empty array"
 *   - "tags defaults to empty array"
 *   - "merges overrides: createQuiz({ title: 'AT in ME' }) has that title"
 *   - "the returned object has no 'image' field" ← verifies removed field stays absent
 */
declare const createQuiz: (overrides?: Partial<Quiz>) => Quiz;

export { createChoice, createQuestion, createQuiz };

// ─── sortByDateDesc ───────────────────────────────────────────────────────────

/**
 * Sorts a Quiz array newest-first by publishDate. Pure — returns new array.
 *
 * Implemented via: R.sort(R.descend(R.prop('publishDate')))
 *
 * TDD test cases (written first, must fail before implementation):
 *   - "returns quizzes sorted newest-first when publishDate differs"
 *   - "returns a new array (does not mutate the input)"
 *   - "handles empty array input"
 *   - "handles single-element array"
 *   - "two quizzes with identical publishDate: relative order is stable"
 */
declare const sortByDateDesc: (quizzes: Quiz[]) => Quiz[];

export { sortByDateDesc };
