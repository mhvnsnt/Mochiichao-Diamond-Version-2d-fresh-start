# Playwright config (step h, 2026-11-13)

## What landed

- `playwright.config.ts` (repo root): the missing piece of the 2026
  checklist's Vitest/Playwright/Lighthouse row. Before it,
  `@playwright/test ^1.64.1` and the two e2e specs were on main but
  there was no config, so `npx playwright test` ran with defaults:
  no webServer, no baseURL, no projects.
- `package.json`: `"test:e2e": "playwright test"` alongside the
  existing `"test:e2e:gates"`. No dependency changed, so
  `package-lock.json` is untouched.
- This note.

## What the config does

- `testDir: ./tests/e2e` — the two specs already on main
  (`gates.spec.ts`, `smoke.spec.ts`).
- Local run: starts `npm run dev` on `http://localhost:3000/` itself
  (`reuseExistingServer: true`), so no manual dev-server juggling.
- Live run: set `MOCHIICHAO_BASE_URL` (e.g. the Pages build) and no
  dev server is started; the specs read the same variable.
- Projects: `desktop` (1280x720) and `phone` (Pixel 7, 390x844 —
  the viewport the gates spec asserts no horizontal overflow at).
- One worker (both projects share the dev server), list reporter,
  trace retained on failure.

## How to run (parent playtest session — leaf workers cannot run a live browser)

```sh
npm run test:e2e            # both specs, both projects
npm run test:e2e:gates      # gates spec only (unchanged)
MOCHIICHAO_BASE_URL=https://mhvnsnt.github.io/Mochiichao-Diamond-Version-2d-fresh-start/ npm run test:e2e
```

## Deliberately NOT in this PR

- CI: `.github/workflows/ci-budgets.yml` states Playwright and
  Lighthouse need a live browser / live Pages run and belong to the
  parent playtest session. That standing decision is unchanged; this
  config does not add a CI Playwright job.
- Lighthouse: still owed — no `lighthouse` dep, no lighthouserc, no
  script on main. Separate step, not smuggled in here.
- Un-skipping specs: the three skipped gates tests still need their
  selectors confirmed in a live session first (see the TODOs in
  `tests/e2e/gates.spec.ts`). Do not un-skip on a guess.

## Verification (this PR)

- `npx playwright test --list` against this config in an isolated
  install of `@playwright/test@1.64.1`: lists the specs under both
  projects (1 active + 3 skipped per project). No browser launched.
- Full-repo gate (tsc + vitest + vite build + budget check) was NOT
  run locally in this PR: the home disk hit its write quota during
  this run (`Disk quota exceeded` on any new file), so no clean clone
  and no `npm ci` were possible. The CI `ci-budgets` gate on the PR
  is the verification for that half — do not merge until it is green.
