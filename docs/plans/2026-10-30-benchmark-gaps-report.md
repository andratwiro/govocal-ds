# Benchmark gaps: morning report (30 Oct 2026)

The overnight run of [the plan](2026-10-30-benchmark-gaps.md). Filled in as it goes.

## 1. Baseline

Measured at the start of the run (`main` at 826fac8, after Task 0).

| Measure | 29 Oct (plan) | Start of run | Morning |
| --- | --- | --- | --- |
| Component and Pattern pages with usage guidance | 0 of 83 | 0 (74 Component and 25 Pattern titles in `index.json`) | |
| Copy pages (voice and tone, word list) | 0 | 0 | |
| Layout parts (Stack, Inline, Grid) | 0 | 0 (Tile grid and Page header exist) | |
| Back-office CSS | 388 lines, 457 `className=` | 388 lines, 466 `className=` | |
| Hard-coded locale or English in parts | 4 | 1 `en-GB` (A11yOverview); 15 entries in `TO_CONVERT` | |
| Parts with a lifecycle status | 0 | 0 | |
| Props without a description (built manifest) | 309 of 922 | 211 of 1,646 props; 42 of 122 entries with no description | |
| Developer-facing pages (who owns what, questions) | 0 | 0 | |
| Visual regression baselines | 0 | 0 (not tonight) | |

Checks at the start: `npm run typecheck` clean, `npm test` 234/234, `npm run build` ok, e2e 1,008/1,008.

## 2. What landed

- **Task 0, main green** (826fac8): the docgen exclude still named the old fixtures folder, so Data table's
  "In a panel" crashed again (the story smoke test caught it too); three e2e expectations updated after the merges.

## 3. Decisions and questions

## 4. Skipped or reverted

## 5. Look at these first

## 6. The architecture review, re-graded
