# World Builder lane — 100% gap audit, 2026-10-26 16:27 CDT

Scope: this lane only — world, regions, maps, dialogue,
trainer teams, audio systems, and the 2026 wiring that
supports them. Sprite art, human characters, title
creatures, and other lanes' deliverables are NOT counted
here, even when they share the repo.

Checked live, 2026-10-26: PR #61 is still OPEN,
mergeable=True, state=clean, 1,230 additions, 3 deletions
(package.json lines only, 0 files deleted), head
132984ec, base 2e2b568 (old base, but GitHub still
says clean). Main head is now 0e93aec (Razorgater
take-6), NOT 011abaf9 from the 2026-10-25 audit.
The stale work clone (11e9a3b, dirty, 126 files) was
NOT used for this audit's live checks — live checks
are via the GitHub API only.

## Headline percentages — three numbers, not one fudge

- Specs / research written in goal files: 14/14 = 100%
  (canon, start swap, master wiring, Region 1 wiring +
  Phase A patch, Region 1 dialogue, Regions 2-5 dialogue,
  trainer teams, audio system + track map, assets/code
  plan, 2026 research, verified audit, unpulled pull
  list, Pokemon-file batch 2, PR #61 adapters).
- Specs merged into the game (main): 0/14 = 0%
  PR #61 is the vehicle for 8 of them and it is
  still open. Title music files (PR #36) and Settings
  (PR #28) are on main from other lanes, not from
  this lane's specs.
- Overall lane, if spec and integration are weighted
  equally: 50% — that is 100% spec + 0% merged,
  averaged. Do NOT quote 50% without that split.
  The playable lane is NOT 100%, and it is NOT 0%
  of work — it is 100% prepared, 0% integrated.

## What is missing — every item, with its count

1. PR #61 merge — 0/1 merged. Open, clean, 16 files.
   Needs Mars's merge-timing decision (merge now, or
   hold for v5.3 / rebase onto main 0e93aec).
2. Call-site swaps — 0/4 live: DialogueBox ← Ink,
   NPC walks ← easystarjs, WorldEngine rendering ←
   Pixi adapter, saveSystem ← IndexedDB save-store.
   Adapters are written in PR #61, none are called
   by the game yet.
3. Truck start + house maps — 0/4 maps in game:
   sector0_truck, sector0_house_1f, sector0_house_2f,
   sector0_rival_house. Ink file for this start is
   written and verified (14 lines, 5 choices).
4. Phase A patch — 0/1 applied: Cave of Echoes
   (11,27) → Neon City (18,35), Neon return (18,37)
   → Cave (11,27). Cave is still a dead end in the
   last audited FullWorldMaps.
5. Phase B maps — 0/12 groups, 0/25 map keys in game:
   route_2, stoneport_city, dojo_3, route_3,
   signal_tunnel, pale_town, market_city, dojo_4,
   central_city, dojo_5, harbor_city, dojo_6,
   ember_island, dojo_7, dojo_8, victory_route,
   mainframe_plateau, data_isle_1-7, region2_arrival.
6. Dialogue wiring — Region 1: 0/9 beats in game;
   Regions 2-5: 0/58 towns in game. Gaps inside the
   files: 88 NAME GAP + 71 ROSTER GAP (Regions 2-5),
   8 ROSTER GAP (Region 1).
7. Trainer wiring — 10/265 rows in game = 4% (the
   old KEEP rows). New rows: 255/265 = 96% unwired.
   REPLACE row: 1 (Falk Aero team, not wired).
   Species promotion: 12/49 battle-ready = 24%,
   37/49 = 76% still to promote. Dorowani/Gabu
   stats: 0/2 = 0% assigned. Trainer NAME GAP
   markers: 180.
8. Audio — scene loops: 0/49 = 0% wired (title/
   intro files exist on main via PR #36, but
   registerFile wiring is 0/2 files). SFX call
   sites: 0/15. Audio wiring steps (old 6-step
   list): 0/6 merged. Boot pick: 0/1 (M1/M2/M3
   unpicked). Settings screen gap: CLOSED by
   PR #28 on main (per background record) — this
   is the one sub-gap that is NOT missing, but it
   has not been re-verified in live main code in
   this audit.
9. Pokemon-file batch 2 systems — 0/5 wired: Bag
   5 pockets, wild-rate validator (sums to 100),
   heal points (20 counted), AI decision trees
   (94 commands → 6 profiles), field systems
   (13 file shapes).
10. 2026 checklist — 0/24 steps wired: Zustand
    split, IndexedDB saves, audio manager, atlas
    pipeline + CI budgets, Vitest (7 tests written
    in PR #61, not merged), Playwright (smoke file
    only, 0 runs), Lighthouse, axe-core, input
    remaps, ICU strings, lazy atlases, KTX2
    evaluation, PWA, update prompt, save migration
    test, CSP/scanning, error reporting, web-vitals.
11. Playtest gates — 0/10 master gates for the new
    wiring (NEW GAME → Mythar true ending → free
    play). Phone 390x844: not tested for any new
    wiring. Pages rebuild: not done from latest
    main 0e93aec (last playtest was v5.2, build
    a084b5ff, desktop only).
12. Battle-math — 0/1 extracted module: accuracy,
    priority, speed order, status effects are still
    not in BattleView (verified 2026-10-25, not
    re-verified in live main code here).
13. Confirmations that block wiring — 5 items:
    boot pick, PR #61 merge timing, 147/148 stats,
    dojo/E4/Champion names, ring-zone exact name.
    Slots 047-146 are NOT missing — they stay empty
    on purpose, playable-first, per Mars correction.
14. Version-lock check — owed on every future use:
    check docs/locked-versions.json + .md on live
    main before using any asset. Razorgater attacks
    CURRENT take-6, SUPERSEDED take-5/4/1-3 (DO NOT
    USE). This lane's PR #61 and batch 2 use no
    Razorgater attack take, so no violation there.
15. Fresh main code check — owed before any next
    PR: FullWorldMaps, BattleView, Settings, and
    gameStore on main 0e93aec have NOT been read
    in this lane since the stale clone (11e9a3b).
    Any count taken from the stale clone is stale
    until that check is done.

## What else the lane needs, beyond the owed list

- A merge decision for PR #61, or a rebase onto
  0e93aec if main wants a fresh base (GitHub says
  clean now, but the base is old).
- Mars's 5 confirmations above, or a decision to
  proceed with placeholders marked as gaps.
- A fresh-code audit from live main (not the stale
  clone) before the next wiring PR, so counts like
  "16 maps" and "12 species" are current, not
  2026-10-25 counts.
- A Pages rebuild from latest main + a phone +
  desktop playtest, with pass/fail by named gate,
  before any "playable" claim.
- GPU route for the next GPU-able step (map/
  tileset rendering, sprite baking): Kaggle GPU
  first, hours re-checked before the job, no paid
  run without Mars's approval for that run.
  Data counting (this audit, batch 2) is CPU-only
  for the plain reason that a GPU cannot speed it up.

## What is NOT missing

- Specs: 14/14 written.
- Trainer data: 265/265 rows, 0 bad IDs.
- Dialogue lines: 58/58 towns (Regions 2-5) + 9/9
  beats (Region 1) in files.
- Audio code: 11/11 functions in file, 608 lines.
- PR #61: written, tested (Vitest 7/7, tsc clean),
  mergeable clean — it is waiting, not broken.
- Slots 047-146: intentionally empty, not a gap.
