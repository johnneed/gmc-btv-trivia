# Research: Monorepo Scaffold & Domain Finalization

**Date**: 2026-06-26
**Status**: Complete — all NEEDS CLARIFICATION resolved (4 via /speckit-clarify sessions)

---

## Decision 1: Repository restructuring strategy

**Decision**: `git mv gmc-btv-trivia react-app` — single atomic rename.

**Rationale**: Preserves per-file git history (blame, log) for every source file in the
existing codebase. A copy-then-delete would sever that history, making `git log --follow`
ineffective on heavily refactored files. One atomic operation is also safer than a
multi-step copy/delete sequence.

**Alternatives considered**:
- Copy + delete in two commits: loses per-file history, more steps, rollback harder
- Fresh directory with manual file moves: same problem plus error-prone
- Leave as `gmc-btv-trivia/`: contradicts the monorepo architecture spec

---

## Decision 2: TypeScript compiler configuration strategy

**Decision**: Update `tsconfig.json` in place after the `git mv`. Add `strict: true`,
correct the `include` path to `["src"]`, and remove any CRA-specific options that error
under plain `tsc` invocation (e.g., `react-app/jsconfig.json` shims, CRA-injected types).
Full Vite-era options (path aliases, composite builds) are deferred to Phase 1.

**Rationale**: Phase 0's only TSC requirement is `tsc --noEmit` passing on the domain
layer. The existing tsconfig is CRA-based but mostly compatible; a targeted update
is less risky than a full replacement and keeps the diff minimal (YAGNI).

**Alternatives considered**:
- Replace with a fresh tsconfig scoped to `src/domain/` only: isolates the domain but
  creates a divergence that Phase 1 must reconcile anyway
- Full Vite tsconfig now: violates YAGNI; path aliases aren't needed until Phase 1 bundles

---

## Decision 3: UUID generation in factory functions

**Decision**: Use the `uuid` package's `v4()` function, already present in
`package.json` as a dependency. Import as `import { v4 as uuidv4 } from 'uuid'`.

**Rationale**: `uuid` is already installed; adding a new package would violate YAGNI.
`crypto.randomUUID()` is available in Node 14.17+ and modern browsers but requires
`@types/node` or a lib target update — avoided in Phase 0 to minimise tsconfig churn.

**Alternatives considered**:
- `crypto.randomUUID()`: works but requires tsconfig lib adjustment — deferred to Phase 1
- `nanoid`: not installed; adding it for Phase 0 violates YAGNI
- Hardcoded UUIDs in tests: acceptable for tests but factories must produce real UUIDs at runtime

---

## Decision 4: PHP stub class structure

**Decision**: Each `class-*.php` stub file follows this minimal pattern:

```php
<?php
/**
 * Class Trail_Trivia_<Name>
 *
 * @package Trail_Trivia
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Trail_Trivia_<Name> {
    // Stub — implementation added in Phase 4/5
}
```

The ABSPATH guard is mandatory WP security practice. The class body is intentionally
empty; no constructor, no methods. `trail-trivia.php` requires_once each file.

**Rationale**: This is the canonical WordPress plugin class structure. The ABSPATH guard
prevents direct HTTP access. Empty bodies satisfy `php -l` and WP activation without
triggering "abstract method not implemented" errors.

**Alternatives considered**:
- Interface-based stubs: premature — interfaces constrain Phase 4/5 design before we know the full contract
- Functions instead of classes: contradicts Principle VI (one class per file, SoC)

---

## Decision 5: Transform library for `quiz.transforms.ts`

**Decision**: Use Ramda's `R.sort` and `R.descend` for `sortByDateDesc`. No Lodash,
no Array.prototype.sort (in-place mutation violates Principle I).

```typescript
import * as R from 'ramda';
export const sortByDateDesc = R.sort<Quiz>(R.descend(R.prop('publishDate')));
```

**Rationale**: Ramda is the mandated transform library (Principle I). `R.sort` returns a
new array (pure); `R.descend(R.prop('publishDate'))` is a composable comparator. This is
idiomatic Ramda and directly testable.

**Alternatives considered**:
- `[...quizzes].sort(...)`: valid (copy then sort is pure) but not Ramda — violates Principle I
- Custom comparator function: more code for the same result; Ramda's built-ins are sufficient

---

## Decision 6: Vitest configuration scope

**Decision**: Add a minimal `vitest.config.ts` at `react-app/` root, scoped to
`src/domain/**/*.test.ts` for Phase 0. The full Vitest configuration (jsdom, coverage
thresholds, all src/) is built in Phase 1 alongside the Vite migration.

**Rationale**: Phase 0 only needs to run factory and transform tests. A minimal config
avoids coupling Phase 0 to the Phase 1 Vite setup. The minimal config is completely
replaced in Phase 1 — no Phase 0 config debt carries forward.

```typescript
// react-app/vitest.config.ts (Phase 0 minimal)
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['src/domain/**/*.test.ts'] }
});
```

**Alternatives considered**:
- Full vitest config now: premature; jsdom not needed for pure domain tests
- Use Jest: incompatible with Phase 1 Vite migration; switching costs outweigh benefit
