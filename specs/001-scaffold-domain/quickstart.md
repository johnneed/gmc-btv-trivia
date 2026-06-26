# Quickstart Validation Guide: Monorepo Scaffold & Domain Finalization

**Date**: 2026-06-26
**Audience**: Developer running Phase 0 verification
**Purpose**: Confirm Phase 0 is complete and all shell gates pass before starting Phase 1

---

## Prerequisites

1. Node.js LTS installed (`node --version` ≥ 18)
2. PHP 8.0+ installed (`php --version`)
3. WP-CLI installed (`wp --version`)
4. Local WordPress installation available at `http://localhost` with:
   - `WP_DEBUG=true` and `WP_DEBUG_LOG=true` in `wp-config.php`
   - The `wp-plugin/trail-trivia/` directory symlinked or copied to `wp-content/plugins/trail-trivia/`
5. Working directory: `/Users/johnneed/Projects/gmc-btv-trivia` (repo root)

---

## Step 1 — Verify monorepo structure

```bash
# Confirm git mv completed successfully
ls -la | grep "react-app\|wp-plugin"
# Expected: react-app/ and wp-plugin/ both visible; gmc-btv-trivia/ absent

git log --oneline --name-status -- react-app/package.json | head -5
# Expected: the file appears with R (rename) status from gmc-btv-trivia/package.json
```

---

## Step 2 — TypeScript compilation (gate 1)

```bash
cd react-app
npx tsc --noEmit
echo "TSC exit: $?"
# Expected: 0
```

**What this proves**: All 5 domain types are syntactically correct and mutually consistent.
The `Quiz` type has no `image` field; `Question` has no `tags` field; `PluginSettings`
has only `gamesPerPage`.

---

## Step 3 — Factory unit tests via TDD (gate 2)

Before running, confirm the red→green sequence was followed:

```bash
cd react-app
# Run factory tests
npx vitest run src/domain/factories/
echo "Factories exit: $?"
# Expected: 0

# Run transform tests
npx vitest run src/domain/transforms/
echo "Transforms exit: $?"
# Expected: 0

# Coverage check (domain layer only)
npx vitest run --coverage src/domain/
# Expected: lines ≥ 90%, branches ≥ 90%
```

**Key assertions to verify in test output:**
- `createChoice()` produces a unique UUID on each call
- `createQuestion()` always returns exactly 4 choices — no exceptions
- `createQuiz()` returns `status: 'draft'` and `questions: []` by default
- `createQuiz({})` returns an object with **no** `image` property
- `sortByDateDesc([q2, q1])` where `q1.publishDate > q2.publishDate` returns `[q1, q2]`
- `sortByDateDesc` returns a new array (original order unchanged)

---

## Step 4 — PHP syntax check (gate 3)

```bash
cd /Users/johnneed/Projects/gmc-btv-trivia
find wp-plugin -name "*.php" -exec php -l {} \; | grep -v "No syntax errors"
# Expected: empty output (no syntax errors in any file)
```

---

## Step 5 — WordPress plugin activation (gate 4)

```bash
wp plugin activate trail-trivia --allow-root
echo "Activate exit: $?"
# Expected: 0 and "Plugin 'trail-trivia' activated."

wp plugin deactivate trail-trivia --allow-root
wp plugin activate trail-trivia --allow-root
echo "Re-activate exit: $?"
# Expected: 0 (idempotent)
```

---

## Step 6 — WordPress debug log clean (gate 5)

```bash
[ -f wp-content/debug.log ] \
  && grep -c "" wp-content/debug.log \
  && tail -20 wp-content/debug.log | grep -c -i "fatal\|warning\|notice\|deprecated" \
  || echo "0 (log does not exist)"
# Expected: 0 (no new notices attributable to Trail Trivia)
```

---

## Step 7 — Run all Phase 0 shell tests from MIGRATION_PLAN.md

The authoritative test suite is in `MIGRATION_PLAN.md` Phase 0 — Deterministic Tests.
Run every block sequentially from the repo root. Every `echo "exit: $?"` must print `0`.

```bash
# Quick summary run — confirms all 5 blocks in sequence
cd react-app && npx tsc --noEmit && echo "✓ TSC" || echo "✗ TSC"
cd react-app && npx vitest run src/domain/factories/ && echo "✓ Factories" || echo "✗ Factories"
cd /Users/johnneed/Projects/gmc-btv-trivia && \
  find wp-plugin -name "*.php" -exec php -l {} \; | grep -v "No syntax errors" | wc -l | \
  xargs -I{} sh -c '[ {} -eq 0 ] && echo "✓ PHP syntax" || echo "✗ PHP syntax"'
wp plugin activate trail-trivia --allow-root && echo "✓ WP activate" || echo "✗ WP activate"
grep -c -i "fatal\|warning\|notice" wp-content/debug.log 2>/dev/null | \
  xargs -I{} sh -c '[ {} -eq 0 ] && echo "✓ Debug log clean" || echo "✗ Debug log: {} issues"'
```

**All 5 must print ✓ before Phase 1 begins.**

---

## Expected Final State

After all 5 gates pass:

```text
react-app/src/domain/
  types/          ← 5 .ts files + index.ts
  factories/      ← 3 .ts + 3 .test.ts + index.ts
  transforms/     ← quiz.transforms.ts + quiz.transforms.test.ts

wp-plugin/trail-trivia/
  trail-trivia.php
  uninstall.php
  includes/       ← 7 class-*.php stubs
```

TypeScript coverage ≥ 90% (lines and branches) on `src/domain/`.
WP debug log has zero new entries after plugin activation.
`git log --oneline` shows all Phase 0 work committed with tests and implementations together.
