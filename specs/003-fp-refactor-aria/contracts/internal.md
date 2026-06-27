# Internal Contracts: FP Refactor & ARIA Compliance (Phase 2)

Phase 2 has no external REST API changes. Contracts here are the **TypeScript function signatures** that Phase 3 and later phases will depend on. Treat any change to these signatures as a breaking change requiring a spec amendment.

---

## Transform Layer (`src/domain/transforms/`)

### `question.transforms.ts`

```typescript
import * as R from 'ramda';
import type { Question } from '../types/question.type';

// Returns true iff question is ready to publish: non-empty text + all 4 choices filled.
export const isComplete: (question: Question) => boolean;
```

### `quiz.transforms.ts` (additions)

```typescript
import * as R from 'ramda';
import type { Quiz } from '../types/quiz.type';

// Existing (unchanged)
export const sortByDateDesc: (quizzes: Quiz[]) => Quiz[];

// New in Phase 2
// Removes quizzes whose publishDate is in the future or falsy.
export const filterPublished: (quizzes: Quiz[]) => Quiz[];

// Filters by status field.
export const filterByStatus: (status: Quiz['status']) => (quizzes: Quiz[]) => Quiz[];
```

### `index.ts` (barrel — all exports stable from this point)

```typescript
export { sortByDateDesc, filterPublished, filterByStatus } from './quiz.transforms';
export { isComplete } from './question.transforms';
```

---

## Data Layer (`src/data/`)

### `trivia-api.ts`

```typescript
// Fetches VITE_API_URL/trivia.json and returns raw parsed JSON as Quiz[].
// No sorting. No filtering. Throws if VITE_API_URL env var is absent.
export const fetchTrivia: () => Promise<Quiz[]>;
```

**Caller contract**: The thunk in `loader-slice.ts` is responsible for applying
`sortByDateDesc` and `filterPublished` to the result before storing in Redux.

---

## Component Props (`src/components/progress-bar/`)

### `ProgressBar`

```typescript
interface ProgressBarProps {
  current: number;  // 1-indexed (1 = first question)
  total: number;    // always 5 for current domain model
  label?: string;   // overrides default "Question N of M" aria-label
}

export default function ProgressBar(props: ProgressBarProps): JSX.Element;
```

**ARIA guarantee**: The rendered element always has `role="progressbar"`,
`aria-valuenow={current}`, `aria-valuemin={1}`, `aria-valuemax={total}`.

---

## Stability Note

These contracts are consumed by:
- Phase 3 (`src/data/trivia-api.ts` → replaced entirely; contract above is temporary)
- Phase 5 (`isComplete` called by publish gate logic in admin UI)

Phase 3 will replace `fetchTrivia` with a WP REST API client. The signature changes to
`fetchGames(): Promise<Quiz[]>`. The `filterPublished` transform becomes unnecessary
(the REST API returns only published games to public callers). Update this contract doc in Phase 3.
