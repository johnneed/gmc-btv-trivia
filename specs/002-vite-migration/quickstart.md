# Quickstart: Vite Migration Validation

**Feature**: 002-vite-migration  
**Date**: 2026-06-26  
**Working directory**: `react-app/`

This guide proves the migration is complete by running the Phase 1 deterministic shell tests from `MIGRATION_PLAN.md`, plus the TDD red→green sequence.

## Prerequisites

- Node.js 18+ installed
- Migration complete (all source changes applied, `npm install` run)
- Working directory: `react-app/`

## Step 1 — TDD Red Confirmation (run BEFORE migration)

Confirm the current state fails the full test suite:

```bash
# From react-app/
npx vitest run src/
# Expected: FAIL — App.test.tsx missing, jsdom errors, toBeInTheDocument undefined
```

This establishes the red baseline. If it somehow passes, the test configuration is already wider than expected — investigate before proceeding.

## Step 2 — TypeScript Clean Build

```bash
npx tsc --noEmit
echo "TSC exit: $?"
# Expected: 0
```

If non-zero, fix TypeScript errors before switching build tools (easier to debug with known-good compiler).

## Step 3 — Full Test Suite (Green)

```bash
npm run test -- --run
echo "Test exit: $?"
# Expected: 0 — all 8 test files pass
```

Tests covered:
- `src/App.test.tsx` (RTL + jsdom + jest-dom)
- `src/libs/date-helpers.test.ts`
- `src/features/score/score-slice.spec.ts`
- `src/features/loader/loader-slice.spec.ts`
- `src/domain/transforms/quiz.transforms.test.ts`
- `src/domain/factories/quiz.factory.test.ts`
- `src/domain/factories/question.factory.test.ts`
- `src/domain/factories/choice.factory.test.ts`

## Step 4 — Build

```bash
npm run build
echo "Build exit: $?"
# Expected: 0 with output to dist/
```

## Step 5 — No CRA

```bash
ls node_modules/.bin/react-scripts 2>/dev/null \
  && echo "FAIL: react-scripts present" \
  || echo "PASS: react-scripts absent"
# Expected: PASS
```

## Step 6 — Bundle Size

```bash
npm run build
gzip -k dist/assets/*.js 2>/dev/null
TOTAL=$(ls dist/assets/*.js.gz | xargs wc -c | tail -1 | awk '{print $1}')
echo "Gzipped JS total: $TOTAL bytes"
[ "$TOTAL" -lt 524288 ] && echo "PASS: under 512KB" || echo "FAIL: over 512KB"
# Expected: PASS
```

## Step 7 — No REACT_APP_ References

```bash
grep -r "REACT_APP_" src/ | wc -l
# Expected: 0
```

## Step 8 — Lint Clean

```bash
npm run lint
echo "Lint exit: $?"
# Expected: 0
```

## Step 9 — Dev Server Cold Start

```bash
time npm run dev &
DEV_PID=$!
sleep 5
kill $DEV_PID 2>/dev/null
# Expected: server reports "ready" within 5 seconds
```

## Step 10 — Player Smoke Test (manual)

```bash
npm run build
npx serve dist -p 3001 &
# Open http://localhost:3001 in browser
# Complete: Home → Quiz List → Select a quiz → Answer 5 questions → Score screen
# Check: browser console has 0 errors
kill %1 2>/dev/null
```

## All-in-One Validation Script

Runs steps 2–8 non-interactively:

```bash
#!/bin/bash
set -e
cd react-app

echo "=== TSC ===" && npx tsc --noEmit && echo "PASS"

echo "=== Tests ===" && npm run test -- --run && echo "PASS"

echo "=== Build ===" && npm run build && echo "PASS"

echo "=== No react-scripts ===" && \
  ! ls node_modules/.bin/react-scripts 2>/dev/null && echo "PASS"

echo "=== Bundle size ===" && \
  gzip -k dist/assets/*.js 2>/dev/null && \
  TOTAL=$(ls dist/assets/*.js.gz | xargs wc -c | tail -1 | awk '{print $1}') && \
  [ "$TOTAL" -lt 524288 ] && echo "PASS ($TOTAL bytes)" || (echo "FAIL ($TOTAL bytes)" && exit 1)

echo "=== No REACT_APP_ ===" && \
  [ "$(grep -r "REACT_APP_" src/ | wc -l)" = "0" ] && echo "PASS"

echo "=== Lint ===" && npm run lint && echo "PASS"

echo ""
echo "All Phase 1 checks passed."
```

## Reference

Full deterministic tests: `MIGRATION_PLAN.md` → Phase 1 section.  
Configuration details: [`data-model.md`](data-model.md)  
Dependency decisions: [`research.md`](research.md)
