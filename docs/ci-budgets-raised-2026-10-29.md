# CI + test budgets — RAISED rebuild, 2026-10-29 (base main da313e3)

## Why this PR exists

The original budgets PR (old repo #282, 2026-10-27) did not come back when
this repo was recreated on 2026-10-28: the game history was pushed back in,
but the open PRs and their branches were not. Nothing from #282 was on main
(verified 2026-10-29: no `ci-budgets.yml` workflow, no `tests/bundle-budgets.json`,
no `test:tests` script). This PR re-applies that setup from the surviving
local copy of the old branch and lands it with **raised budgets**, per Mars's
decision on 2026-10-29: "Raise the budgets" (no bundle diet, no check
disabled or weakened).

## The raise

The old overrun was measured 2026-10-27 against the old main (dist held
1,465 JS files then). Current main's build is structured differently (223
JS files — asset trees moved out of `src/`), and a fresh production build
of current main `da313e3` (`npx vite build --base=./`, the exact command
the workflow runs) measures **under the old budgets on every metric**. The
budgets were still raised per the decision — never tightened:

| Metric | Old budget (2026-10-27) | Measured 2026-10-27 (old main, old PR #282) | Measured 2026-10-29 (current main da313e3) | New budget |
| --- | --- | --- | --- | --- |
| Largest JS chunk, raw | 2,500,000 | 2,620,499 (over) | 2,433,670 | **2,700,000** (measured +~11%) |
| Largest JS chunk, gzip | 700,000 | passed (exact figure not in the 2026-10-27 record) | 613,522 | 700,000 (unchanged — ~14% headroom over today's measure) |
| Total JS, raw | 3,300,000 | 3,323,012 (over) | 2,828,385 | **3,650,000** (the overrun Mars ruled on, +~10%) |
| Total JS, gzip | 1,100,000 | 1,067,206 (passed) | 785,210 | 1,100,000 (unchanged — ~40% headroom over today's measure) |

Largest chunk today: `dist/assets/index-CX0zw1q-.js`. Budgets live in
`tests/bundle-budgets.json` (single source of truth); both measured
baselines are recorded there (`measuredBaseline` 2026-10-27 and
`measuredBaseline20261029`), and `tests/ci-budgets.test.ts` pins both.

## What was carried over from old #282 (14 files then, 12 now)

Carried, byte-identical to the old branch unless noted:

- `.github/workflows/ci-budgets.yml` — typecheck, existing + new unit
  tests, production build, budget check. Playwright/Lighthouse stay out
  of CI by design (they need a live browser session).
- `tests/bundle-budgets.json` — budgets raised as above; comment and
  baselines updated.
- `tests/check-bundle-budget.mjs` — enforcement script, unchanged.
- `tests/ci-budgets.test.ts` — updated only to pin the 2026-10-29 baseline.
- `tests/type-chart.test.ts`, `tests/opponent-direction.test.ts`,
  `tests/tiled-map-gates.test.ts`, `tests/dialogue-structure.test.ts` —
  Vitest scaffolding, unchanged; all pass on current main.
- `tests/e2e/gates.spec.ts` — Playwright skeleton, unchanged (still
  skipped gates; do not un-skip without a live session).
- `docs/ci-budgets-2026-10-27.md` — the original setup doc, kept verbatim
  as the record of the first version.
- `package.json` — the same 4 added scripts (`test:tests`, `test:all`,
  `check:budgets`, `test:e2e:gates`); byte-identical result to the old PR.
- `package-lock.json` — regenerated (`npm install`): current main's lock
  was out of sync with `package.json` (missing `@playwright/test`,
  `axe-core`, `idb`, `inkjs`, `tone`, and their transitive entries), so
  `npm ci` failed on main as-is. Regen is +118 lines, 0 deletions of
  existing entries' versions.

Dropped as stale (already fixed on current main, verified by reading main
before applying anything):

- `src/components/IntroSequence.tsx` import fix — main already imports
  `PINNED_SUBTITLE_FONT` (line 10).
- `src/lib/wiring/phase4-garden.ts` `fruit` key — main already carries a
  `fruit` entry in `BERRY_STAGE_MINUTES`, with its own harvest-window
  comment.

## Verification on this branch (2026-10-29)

- `npm ci` — passes with the regenerated lock (it failed on main's lock).
- `npx tsc --noEmit` — passes (the two type errors the old PR had to fix
  are already fixed on main; nothing new surfaced).
- `npm run test` (existing `src/lib` suite) — 7 files, 101 tests, pass.
- `npm run test:tests` (new scaffolding) — 5 files, 14 tests, pass.
- `npx vite build --base=./` — passes.
- `node tests/check-bundle-budget.mjs dist` — passes with the raised
  budgets (and would also have passed with the old ones on today's build;
  the raise is recorded above, not hidden).

## Merge state

Do not merge while the `no-deletion-guard` workflow is failing for every
PR (GitHub-side break, ~4s failures since 2026-10-29 ~17:43Z, last green
16:55Z). This PR's diff contains **0 file deletions** — additions and
modifications only.
