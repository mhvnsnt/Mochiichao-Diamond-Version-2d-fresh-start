// Playwright config — step (h) 2026 checklist, Vitest/Playwright/Lighthouse row.
// NEW in this PR: before it, @playwright/test (^1.64.1) and the two e2e
// specs (tests/e2e/gates.spec.ts, tests/e2e/smoke.spec.ts) were on main
// but there was NO playwright.config.ts, so `npx playwright test` ran
// with defaults: no webServer (the specs assume a dev server already
// listening on :3000), no baseURL, no phone/desktop projects. This
// config makes the existing gates runnable self-contained.
//
// SCOPE: config + npm script + docs note only. CI is DELIBERATELY
// untouched: .github/workflows/ci-budgets.yml states Playwright and
// Lighthouse need a live browser / live Pages run and belong to the
// parent playtest session — this PR does not override that standing
// decision, and no browser runs in CI because of it.
// Lighthouse is still owed (no dep, no config on main); that is a
// separate step, not smuggled in here.
import { defineConfig, devices } from "@playwright/test";

// A parent playtest run points at the live Pages build with
// MOCHIICHAO_BASE_URL; a local run uses the dev server on :3000.
// The specs read the same variable, so config and specs agree.
const externalBase = process.env.MOCHIICHAO_BASE_URL;
const baseURL = externalBase || "http://localhost:3000/";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  // One worker: both projects share the single dev server below.
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  // No webServer when pointed at a live URL: starting a dev server
  // the run will never use would only waste the run's time.
  webServer: externalBase
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000/",
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
    },
    {
      // 390x844 is the phone viewport the gates spec asserts against
      // (no horizontal overflow); Pixel 7 supplies isMobile + touch.
      name: "phone",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
});
