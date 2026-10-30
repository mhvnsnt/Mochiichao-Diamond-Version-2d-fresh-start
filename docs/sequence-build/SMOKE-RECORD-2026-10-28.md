# SMOKE RECORD — Sequences 1–2, 2026-10-28

How the build was proven: the game was built (`npm run build`,
exit 0), served from `dist/`, and driven headlessly with
Playwright (Chromium headless shell) through the real UI —
keyboard and mouse only, no state injection. Save-state probes
read the game's own quicksave (`localStorage mochii_saves_1`)
after pressing F5 in a confirmed overworld state; those probes
are the ground truth quoted below. Screenshots live in
`smoke-2026-10-28/` next to this file.

## Environment and method notes (read before the results)

- **This rig throttles page timers ~50×.** The dialogue
  typewriter (design: 18 ms/char at MID speed) runs at ~3–4
  chars/sec here, and held-key steps land every ~210–250 ms
  against the design's 140 ms. Enter presses during typing are
  effectively lost, so the drives page dialogues patiently
  (~1 s cadence). These are environment artifacts, not game
  defects — but every duration below should be read with that
  in mind. Ratios (e.g. sprint vs walk) are unaffected.
- **F5 outside the overworld reloads the page** (the handler
  only preventDefaults in the overworld screen) and the session
  restores from its last autosave. Two early drives were
  scrambled by probes fired during dialogue/battle transitions;
  the final drives probe only after a quiet window with no
  dialogue panel and no battle buttons. This hazard is also
  recorded in SEQUENCE-PLAN §0.3 for players.
- The battle screen keeps the overworld HUD in the DOM, so
  battle state was detected by its move buttons, never by HUD
  absence.
- One earlier drive's route/shop legs were invalidated by the
  driver's own navigation (it paced for encounters in the wrong
  map, and steered out of the shop's map before scanning). Those
  legs were re-run with probe-verified positions; only the
  verified runs are quoted below.

## Build / test / typecheck (final tree)

- `npm run build` — exit 0.
- `npx tsc --noEmit` — exit 0 (was 1 error pre-fix: the docs
  archive; see SEQUENCE-PLAN §0.2/§0.4).
- `npm run test` — **93 passed (93)** (was 90/93 pre-fix: the
  WATER_ORB count; see §0.4).

## Sequence 1 — proven step by step

- **Boot → title → new game → intro**: title screen, save-slot
  picker, Aeon intro, BOY/GIRL choice, player + rival naming,
  all through the real flow. (`01-title.png`)
- **Truck spawn**: with zero extra inputs after the intro, the
  save probe reads `sector0_truck (6,8)`, events `[]`; the HUD
  reads "Moving Truck — Sector 0" with the "Step off the truck"
  door. (`02-truck-spawn.png`)
- **Truck Mom dialogue**: facing Mom in the truck opens her
  canon ink lines ("MOM — There you are! The truck beat us
  here."); the two movers stand with their clock/room lines.
  (`03-truck-mom-dialog.png`)
- **Town arrival + mom_intro**: stepping off the truck lands in
  Boot Harbor (Sector 0); the `v4_mom_intro` event completes
  and is recorded in completedEvents; Sprint Boots correctly
  stay un-granted through that *event* dialogue.
- **House**: door warps work both ways; house Mom's 4-line
  conversation ends with the probe reading
  **`hasSprintBoots: true`** (and a "Received the Sprint Boots!"
  toast in the engine). (`05-house-1f.png`)
- **Clock**: upstairs, stepping on the clock tile fires the
  `clock_set` event with the ink's lines; probe shows
  `clock_set` in completedEvents. (`06-house-2f-clock.png`)
- **The Lab**: all five starters render as their real species
  sprites (Mochii, Razorgater, Tyrage, Kittember, Sproutle);
  Dorowani (red fin cheeks, shell) and Gabu (shell) render as
  themselves on display; Aeon and Mochiko render their sheet
  sprites. (`07-lab-starters.png`)
- **Creature animation — proven by burst**: 8 screenshots,
  350 ms apart, player and camera perfectly still. In the
  first run, pixel-diff between burst frames in the creature
  regions measured **Dorowani 2,580 px, Gabu 3,834 px,
  Kittember 2,513 px, Mochii 3,923 px** changing. (That run's
  screenshots were lost when the VM's /tmp was wiped by a
  service restart; the re-capture — `burst-0.png` …
  `burst-7.png` here — shows full-frame diffs of
  21,164–39,852 px between consecutive frames with the camera
  still: creature walk frames cycling plus the lab's wandering
  humans.) Stand phases match frame 0 by design (the
  {step, stand, step, stand} rhythm), which is why a single
  snapshot can look static; the burst shows real walk frames
  cycling, Dorowani visibly mid-stride. (`burst-0.png`,
  `burst-2.png`)
- **Starter choice**: the choice dialogue is reachable and
  answerable by keyboard (after the DialogueBox fix in §0.3);
  answering gives Razorgater: probe reads party
  `["004 L5 hp20/20"]`, Capture Cubes 10 → 15. Reproduced in
  three separate drives. (`08-starter-choice.png`)
- **Follower**: after the gift, the grey Razorgater trails the
  player one step behind in the lab (player at (4,7), follower
  at (5,7) in the captured frame). Razorgater's identity was
  triple-checked against its walk frames and atlas cells (grey
  spiky gator from front, back, and side) — the follower is the
  right creature. (`09-follower-lab.png`)
- **Hex battle — fought end-to-end**: the doorstep event
  dialogue pages through to "HEX wants to battle! HEX sent out
  TYRAGE!" with the real battle UI (both creatures, HP bars,
  move buttons CHROME CLAW / TACKLE, CATCH CUBE ×15, TEAM,
  RUN). The drive clicked CHROME CLAW ×4; **the world returned
  at turn 4**. Probe after: **wallet 1000 → 1100** (the 100
  reward), `hex_battle_event` in completedEvents, party intact;
  the post-battle goal dialogue drains; the lab exit then works
  (probe: `sector0 (10,4)`). Reproduced in two drives.
  (The battle's own screenshots were among those lost in the
  /tmp wipe; the re-capture drives re-shot the lab, starter and
  follower but the doorstep battle did not re-trigger on the
  re-capture path, so this leg's proof of record is the probe
  log and the battle-screen text quoted above.)
- **Sprint differential — measured**: on the town's x15 lane
  from (15,11), holding Down for 1250 ms: **walk → (15,16),
  5 tiles; with B held → (15,21), 10 tiles.** Exactly the
  movement config's 2× (140 ms vs 70 ms cadence), boots-gated.
- **Player animation (GIRL)**: Player A renders as a real chibi
  sprite in all four facings; walk pairs captured in Boot
  Harbor. (BOY renders the fallback figure — the named gap in
  SEQUENCE-PLAN.) (`girl-down-a/b.png`, `girl-right-a/b.png`,
  `girl-up-a/b.png`, `girl-left-a/b.png`)

## Sequence 2 — proven step by step

- **Route 1 entry + traversal**: from Boot Harbor's north exit
  onto Route 1's road; probe-verified position on the route;
  the road runs to Silicon Town (binary_fields) — arrival probe
  reads `binary_fields (14,33)`.
- **Wild battle — end-to-end**: the drive steered to a
  probe-verified tall-grass tile (`route_1 (13,23)`, inside the
  x8–13 / y18–24 patch) and paced; the encounter dialogue fired
  at pacing step 17 and the battle opened (**WILD TRIGGERED:
  true**); CHROME CLAW ended it in one turn and the world
  returned; probe after: party intact, wallet 1100.
  (This leg's proof is the drive's save-probe log quoted here;
  its screenshot was among those lost in the /tmp wipe and the
  re-capture drives did not re-shoot this leg.)
- **Silicon Town + MochiiPlex**: the town is reached on foot;
  the plex door warps to `mochiiplex_1 (7,10)`.
- **First store visit — money and inventory actually change**:
  the clerk (shop NPC) opens the real ShopView; the drive
  selected **LUIGI CUBE ⬡ 70** and bought it. Probe after:
  **wallet 1100 → 1030 (−70), Capture Cubes 15 → 16 (+1)**.
  (Same evidence note as the wild leg: probe log is the proof
  of record; the shop screenshots were lost in the wipe.)

## What the smoke did NOT prove (named, not hidden)

- The BOY player has no sprite sheet, so no screenshot can show
  him as a real character — named gap, SEQUENCE-PLAN Seq 1.
  (He is visible as the fallback figure in the lab shots.)
- Mom renders as a fallback figure (variant unassigned) and
  Hex's standing pose renders his battle row at world scale —
  both photographed in the lab/town shots and named in the plan.
- In-battle move *animation* frames were not separately
  captured; the battle proof is the full UI flow (commands,
  damage, win, rewards, return), with move routing at 86/122
  per the script map.
- Screenshot coverage: the first capture set was lost when the
  VM's /tmp was wiped by a service restart; the re-capture
  restored the title, truck, town, house (both floors + clock),
  lab, animation burst, starter choice, follower, and the GIRL
  four-facing set. The Hex battle, wild battle, and shop legs
  are proven by their save-probe logs quoted above rather than
  by re-captured screenshots.
- The AI Studio prototype (the surface Play serves today) was
  not screenshotted — it needs the signed-in browser; the
  parent lane owns that follow-up (SEQUENCE-PLAN §0.1).
