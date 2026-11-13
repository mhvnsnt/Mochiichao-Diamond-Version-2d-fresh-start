// Playwright gate spec — Region 1 slice + title gates (step j, 2026-11-13).
//
// CI runs the ACTIVE tests here against a local `vite preview` of the
// PR head (see .github/workflows/ci-playwright.yml, which sets
// MOCHIICHAO_BASE_URL to the preview). Nothing here targets the live
// site: no live site exists (Pages is not enabled on this repo).
// Run locally the same way:
//   npx vite build --base=./ && npx vite preview --port 4173
//   MOCHIICHAO_BASE_URL=http://localhost:4173/ npm run test:e2e:gates
// (without MOCHIICHAO_BASE_URL the config falls back to `npm run dev`
// on http://localhost:3000 — see playwright.config.ts).
//
// The skipped tests are the Region 1 live checks, written out with
// the exact steps and the exact source-grounded text they need, so a
// future playtest session can un-skip them one at a time instead of
// guessing selectors. Do NOT un-skip a test until its selectors have
// been confirmed in a live session — that rule is what kept the
// earlier title/overflow gates honest.
//
// Grounding (all verified against main c87be1a7, PRs #418/#419):
// - index.html <title> is "My Google AI Studio App" (repo template
//   title, unchanged); no code anywhere sets document.title (GitHub
//   code search: 0 hits). The old /Mochiichao|react/i title regex
//   was wrong against the real build and is corrected here — the
//   brand text is asserted on screen ("DIAMOND VERSION"), not in
//   the <title>.
// - IntroSequence: BOOT auto-advances after 2.5s to TITLE (M1_SHOW_ALL
//   is false without ?all); any key/click on TITLE fades (350ms) to
//   MAIN_MENU, which shows NEW GAME + SETTINGS on a fresh profile
//   (CONTINUE only appears with saves).
// - Truck start (PR #418): sector0 NPC mom_truck (6,4) plays the
//   mom_truck knot of src/lib/wiring/dialogue/region1-truck-start.json
//   live through InkDialogueBox — "There you are! The truck beat us
//   here." / "Our new house is just up the road. Go on in and set
//   the clock upstairs — movers hate waiting." On first sector0 entry
//   the plain v4_mom_intro fires first ("Welcome home! Prof. Aeon
//   is out on Route 1.0, just north of here."). The mom_truck talk
//   is the ONLY live Ink session on main (only NPC with inkStory).
// - Route 1.0 rescue (PR #419): first entry onto route_1 fires the
//   plain route_rescue_intro ("Help! This wild creature has me
//   cornered!" / "Quick — take one from my bag and drive it off!").
//   The starter pick is the five bag NPCs at y=35 (Mochii Ball x=7,
//   Razorgater Ball x=8, Tyrage Ball x=9, Kittember Ball x=11,
//   Sproutle Ball x=12), each isChoice with a YES/NO confirm — NOT
//   the Ink route_rescue knot's five-choice list, which is the script
//   source only and never renders live. Picking one grants the
//   starter, then the gift dialog, then the wild Sproutle battle
//   (route_rescue_battle).
// - Exit gating (PR #419, src/lib/doorGate.ts): sector0 -> boot_bay
//   exit needs the Wave technique ("... is sealed. It needs the Wave
//   technique."); binary_fields -> victory_route needs badges>=8
//   ("... is sealed. It opens only to a trainer holding at least 8
//   badges."). Both are fail-closed.
import { test, expect } from "@playwright/test";

const BASE = process.env.MOCHIICHAO_BASE_URL || "http://localhost:3000/";

test("title page loads", async ({ page }) => {
  await page.goto(BASE);
  // <title> is the repo template title (index.html); the brand is
  // asserted on screen in the test below, not in the <title>.
  await expect(page).toHaveTitle("My Google AI Studio App");
  await expect(page.locator("#root")).not.toBeEmpty();
});

test("title screen shows DIAMOND VERSION after boot", async ({ page }) => {
  await page.goto(BASE);
  // BOOT auto-advances after 2.5s; TITLE renders the preset title
  // screen (alt="MOCHIICHAO" image + "✦ DIAMOND VERSION ✦" text).
  await expect(page.getByText("DIAMOND VERSION")).toBeVisible();
});

test("pressing a key on the title screen reaches the main menu", async ({ page }) => {
  await page.goto(BASE);
  await expect(page.getByText("DIAMOND VERSION")).toBeVisible();
  // Any key advances (Pokemon any-key skip); 350ms white fade, then
  // MAIN_MENU. Fresh profile: NEW GAME + SETTINGS, no CONTINUE.
  await page.keyboard.press("Enter");
  await expect(page.getByText("NEW GAME")).toBeVisible();
  await expect(page.getByText("SETTINGS")).toBeVisible();
});

test.skip("title preset selection persists after reload (needs live selector confirmation)", async ({ page }) => {
  // TODO (parent playtest): open Settings, pick a title preset, reload, and
  // confirm the same preset renders. The RESET row behaviour was proven live
  // on desktop 2026-10-27 (PR #272 build); this spec turns that manual check
  // into a repeatable gate once its selectors are confirmed live.
  await page.goto(BASE);
});

test.skip("reduced-motion title freezes canvas motion (needs live CDP / reduced-motion run)", async ({ page }) => {
  // TODO (parent playtest): run with reducedMotion: "reduce" and compare
  // canvas frames over 2.5s; the 2026-10-27 VM CDP check found 0.00% canvas
  // diff under reduced motion. This spec codifies that check.
  await page.goto(BASE);
});

test.skip("phone viewport has no horizontal overflow (needs 390x844 live run)", async ({ page }) => {
  // TODO (parent playtest): set viewport 390x844, load the title, and assert
  // document scrollWidth <= 390 and the RESET TITLE button is inside the
  // viewport. Proven 2026-10-27 via VM CDP against the local dist build;
  // this spec makes it a live gate.
  await page.goto(BASE);
});

test.skip("truck start: Mom's Ink dialogue plays the mom_truck knot (needs live walk-through)", async ({ page }) => {
  // TODO (parent playtest — Region 1 slice, PR #418): fresh profile,
  // title -> NEW GAME -> save slot -> prof intro / gender / name entry
  // -> world sector0. The plain v4_mom_intro fires first on sector0
  // entry ("Welcome home! Prof. Aeon is out on Route 1.0, just north
  // of here."); advance it, walk to Mom (sector0 6,4) and interact.
  // Expect the Ink session, speaker "Mom": "There you are! The truck
  // beat us here." then "Our new house is just up the road. Go on in
  // and set the clock upstairs — movers hate waiting." The knot ends
  // at its divert boundary (clock_set var set on completion). Needs
  // live confirmation of the movement / interact keys and the intro
  // flow before un-skipping.
  await page.goto(BASE);
});

test.skip("Route 1.0 rescue: Aeon intro fires, bag balls offer the starter (needs live walk-through)", async ({ page }) => {
  // TODO (parent playtest — Region 1 slice, PR #419): from sector0
  // walk north onto route_1 with no partner yet. Expect the plain
  // route_rescue_intro: "Help! This wild creature has me cornered!"
  // / "Quick — take one from my bag and drive it off!" Advance it,
  // walk to the bag row (y=35) and interact with a ball, e.g. Mochii
  // Ball (x=7): expect "Are you sure you want to choose Mochii?"
  // with YES/NO; YES grants the starter, then the gift dialog, then
  // the wild Sproutle battle (route_rescue_battle). Do NOT assert the
  // Ink route_rescue knot's five-choice list ("Take Mochii" ...) —
  // that knot is the script source only; the live pick is the bag
  // NPCs' YES/NO. Needs live confirmation of movement / interact
  // keys before un-skipping.
  await page.goto(BASE);
});

test.skip("exit gating: Boot Bay Wave gate and Victory Route badge gate stay sealed (needs live positioning)", async ({ page }) => {
  // TODO (parent playtest — Region 1 slice, PR #419, doorGate.ts):
  // with no Wave technique held, try the sector0 -> boot_bay exit and
  // expect the sealed text "It needs the Wave technique."; with fewer
  // than 8 badges, try the binary_fields -> victory_route exit and
  // expect "It opens only to a trainer holding at least 8 badges."
  // Positioning the player needs either a live walk or the ?qa hook
  // (window.__qa exposes the store + world; see src/main.tsx) — do
  // not un-skip until that positioning is confirmed in a live run.
  await page.goto(BASE);
});
