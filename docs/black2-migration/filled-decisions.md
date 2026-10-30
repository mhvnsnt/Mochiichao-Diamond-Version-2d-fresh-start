# Fill-from-source re-audit — 26 Mars decisions + other decisions

Staged only. No PR, no game-file edits. Fresh re-audit, 2026-10-27.
Rules applied: Mars 2026-10-27 ~07:43 (fill from Pokemon code / all games / mod
community wherever source can fill it; placeholder ability = no ability, null,
never a named placeholder) and Mars 2026-10-27 ~07:46 (bag/storage canonical =
most recent game with caps removed; menu layout = swappable with per-menu
editors; True chart = fill from most recent games + modding communities;
wallpapers = all games + modding communities + user-uploadable original art;
opponent body-part origins = all 560 accounted for).

## Counts — the 26 register items

- FILLED-FROM-SOURCE: **11/26 = 42.3%**
- FILLED-BY-MARS-DECISION (07:46): **3/26 = 11.5%**
- PARTIAL (part filled, remainder needs Mars): **3/26 = 11.5%**
- TRULY-NEEDS-MARS (whole item): **9/26 = 34.6%**
- Fully resolved (filled + Mars-decision): **14/26 = 53.8%**
- Anything still needing Mars input in any part: **12/26 = 46.2%**
  (9 truly-needs + 3 partial remainders)

A prior staging draft in this folder counted 11 filled / 9 truly / 4 Mars-decision
/ 2 partial. This audit corrects that draft in two places (see Corrections):
True chart moves from Mars-decision to Partial, and facility venue moves the
facility item firmly into Partial (it already was partial in substance; the
count shift is D20). The underlying per-item facts are otherwise the same.

## Filled from source (11) — do not ask Mars about these again

1. **Physical/special canonical** (B7) — category field is explicit on every
   most-recent-game move record. Verified in this audit on a sample record.
2. **Badge-boost counterpart** (B13) — drop it as a stat boost; in the most
   recent game badges gate access and shop stock, not battle stats. Carried
   from prior staging; the battle-engine grep was NOT re-run in this audit
   (an earlier grep attempt timed out) — re-confirm at wiring time before
   deleting any older-gen boost code path.
3. **Link-player row** (A9) — conditional row, shown only in link context.
   Link play itself is a later lane, not a decision needed to wire the row.
4. **Badge-growing stock** (E14) — shop loader selects a stock list by badge
   count. Verified in this audit: most-recent-game shop code, badge-indexed
   shop comment and stock-list selection by badge count.
5. **Release offered + guards** (F12) — Release IS offered in the most recent
   game's storage system, with guards: not the last party member, not an egg,
   not a mailed creature. Carried from prior staging (deny messages in
   storage code). Conflict note: an earlier in-game statement said Release is
   deliberately not offered — if Mars wants to keep not-offered, that is a
   one-line override to record, not a gap in source.
6. **Save-shape medium** (H7) — most-recent-game save structure (block split,
   signature + checksum + counter per sector, rotating-write start,
   damaged-sector skip, last-good restore, newest-valid-slot pick on load).
   The web medium is an implementation choice, not a canon decision. Carried
   from prior staging.
7. **Weather-code -> state** (3.11, WG18) — source field-weather state
   machine carried as-is (clear, rain, sun, sand, hail, fog, and similar),
   with durations and stat/accuracy effects from source weather code.
   Rendering each state is original art (D26). Carried from prior staging.
8. **Projection / camera values** (4.5) — values + camera system carried as
   parameters (projection 0 in 441/615 zones, 1 in 174/615; camera 0 in
   538/615 plus a small set of other values; camera-bound default 65535).
   Exact 0/1 projection semantics are wiring verification, not a Mars canon
   decision. Carried from prior staging.
9. **Season clock source** (7.8) — device/real-time clock, season =
   (month - 1) % 4 from the RTC date. Carried from prior staging.
10. **Nature assignments + table ruling** (DS9, WG2) — use the modifier TABLE,
    not display-only: +1/-1 = 110%/90% (5 neutral = 100%/100%). And the
    per-species assignment question dissolves: in source a nature is
    per-instance, not per-species, so no source file assigns a nature to a
    species. Verified in this audit: older-gen nature stat table location
    and the 110 application lines.
11. **Placeholder ability = no ability** (stage-1, carried) — ability = null
    where a creature has none, never a named placeholder. The source
    no-ability record is display `--`, 165 ability records total. Verified
    in this audit. Per-creature application is gated on D17 (species
    conversion) — that is a dependency, not a new Mars question beyond D17.

## Filled by Mars's 07:46 decisions (3) — do not ask again

12. **Bag pocket canonical** (D1–D3) — most recent game, caps removed:
    5 pockets + Free Space, base 614 slots, unlimited boxes, unlimited
    storage, item stacks above 99, storage above 100 creatures. Build on the
    most recent game's code and extend it; do not re-impose the old caps.
    Older-gen tables (5/186, 8/486) are reference only. This also dissolves
    the bag-full block cap sub-item.
13. **Box count canonical** (F16, WG22) — most recent game, caps removed:
    unlimited boxes, 30 slots per box, party max 6. Base reference before
    the cap lift: up to 24 boxes x 30 = 720.
14. **Storage wallpaper** (F10) — pull patterns from all games + modding
    communities, PLUS user-uploadable original art from phone storage, fully
    customizable. Staged registry: 26 preset slots union (most recent game
    16 indexed, older-gen union to 26), upload PNG/JPEG/WebP to device
    storage, bytes never in a repo PR. Implementation owed (upload flow +
    pattern catalogue + original preset art). Five small sub-choices remain
    inside the implementation — first-boot default, unlock rules, upload
    cap, menu-background scope, preset-art maker/order. The registry's
    proposed cap (50 per device, 5 MB, 1024 px) is a PROPOSAL, not a source
    value.

## Partial (3) — part filled, remainder is the Mars input

15. **Item display text** (DS7, WG1) — mechanical layer filled for all 639
    items (effects, prices, pockets, hold/fling/pluck/natural-gift fields).
    Owed: original wording for the catalogue, in particular for records
    whose source wording names a forbidden thing (earlier batch note: 38
    such records). Source wording is never copied into the game.
16. **True chart values incl. Deep** (DS10, DS11, WG3) — see the Correction
    box below. Staged 12-element chart (144 cells): non-Deep cells from the
    modern 18-type chart and older-gen type tables (older-gen tables
    identical on all 17 shared types, 0 diffs), 4 corrections to the game's
    constants file, Aero cells via the flying analogue (flagged
    analogue-filled, not sourced). Deep cells: **0/23 filled** — every
    Deep-involved cell ships flagged neutral 1.0, not a sourced value.
    Chart wiring is staged (swap patch), not wired in-game. Modding-community
    fill = 0 cells directly (no type-effectiveness table or Deep matchup
    found on disk).
17. **Facility level rules + venue** (DS18, WG5) — level rule filled: in the
    Gen 5 subway-style battle facility, all creatures are set to level 50
    for the challenge (community documentation; facility data files carry
    no level field: 0/1,285 trainer files, 0/6,000 set files, so the rule
    applies at facility entry). Owed: which Mochiichao venue hosts which
    facility. The level rule's source is a community doc, weaker than decomp
    code — flag at wiring time.

## Truly needs Mars (9 whole items) — THE list to bring to Mars

18. **Options frame art** (C6) — 10 original frame artworks, or a Mars pick
    of a single frame style to ship first. Menu layout swappability does not
    fill frame art.
19. **Encounter-set -> map + roster** (2.18, WG4-part) — which staged set
    (most recent game 135 sets / 7,136 slots; older gen 264 headers) goes on
    which Mochiichao map, and which roster slot each staged slot maps to.
20. **Lighting-set -> location/time** (5.5, WG4-part) — which of the 210
    lighting sets belongs to which Mochiichao location/time. The lighting
    lookup itself is filled.
21. **Zone / field-map assignment** (6.9, WG4-part) — anonymous zone ->
    Mochiichao map assignment, including areas (409), matrices (416),
    events (615), maps (1,065 model dirs).
22. **Species conversion table** (DS1) — which source slot maps to which
    original-roster slot (47 roster slots; 12 already in the game species
    file). Gates per-creature ability fills (item 11 above) and roster
    mapping (item 19).
23. **Class / role renames** (DS15) — Mochiichao role per source class
    (237 total, 151 kept generic/titled, 86 dropped named-person/boss by
    count only).
24. **Trainer personal-name swap** (DS16) — Mochiichao character per source
    trainer (814 main, 1,285 facility, staged by ID with personal names
    withheld).
25. **Script / warp / actor / matrix / prop / trade ref targets** (WG7–WG13,
    family) — flag meaning per anonymous ref (59 + 2 constants, 209
    occurrences), warp destination per zone ref (497 refs, 1,089 warps),
    trainer/trade target per ref (167 trainer, 7 trade), actor per model
    code (90 codes, 1,693 placements), model per matrix index (969
    constants, 2,347 cells), prop per resource id (459 ids, 6,331 records).
    Structures are filled; targets are owed, each ref table its own decision
    at PR time.
26. **Original content rulings** (WG6, WG14, WG15, WG17, WG26, WG20-part,
    WG21-part) — original place names, original palette/art, original
    sound, original dialogue for 46,553 message slots, season-to-form
    mapping, original shop catalogue wording (stock lists themselves are
    source-filled; per-shop assignment + wording owed), and any battle
    values Mars wants to differ from source constants (source constants
    themselves are filled — differing from them is a Mars choice, not a
    gap).

Plus, inside the partials, the Mars remainders are: item wording (item 15),
Deep matchup values + the True-list conflict (item 16), facility venue
(item 17). And one sub-item outside the 26: evolution trade/friendship
equivalents (under DS13) — Mars decision, not auto-converted to level.

## Correction box — True chart: 12 vs 19, and why D20 is Partial, not Filled

Mars 2026-10-27 ~07:46 said "elements already locked" with NO number
attached, and said to fill from most recent games + modding communities.
The game's own locked set on main is **12 elements** (game unification map
§1, "the 12 True Elements", and the game's True chart file, 12 elements,
144 cells): Water, Chrome, Earth, Bug, Umbral, Aero, Core, Strike, Deep,
Flame, Mythic, Normal. Another lane's record claims 19 locked elements with
7 further element names. Those 7 names are NOT in the game's locked set on
main, and this audit does NOT invent them to reach 19. Mars must confirm:
**is the True list 12 or 19?** Until that is confirmed, no 19x19 wiring
may be claimed. The staged 12x12 chart is real; the staged 19-name
arithmetic (18 legacy + Deep, 361 cells) is explicitly NOT a True chart
and its Deep cells are flagged neutral placeholders.

## Opponent direction, in plain language (Mars: "I don't know what that means")

- The opponent sits on the **RIGHT** side of the screen. The player sits on
  the **LEFT**.
- In the diagram, **red = the opponent attacker, green = the player
  target**. The arrow runs red -> green: leftwards and slightly downwards.
  Opponent attacks **never** travel right.
- **"30" is 30 degrees below horizontal** — the most recent game's 3D
  projection angle. It is NOT 30 percent. The older 2D slot-table slope
  (21.04 degrees below horizontal) is a separate reference value, not this
  angle.
- Vectors (240x160 grid, y down): single (-104, +40), 158.96 deg /
  21.04 deg down-left; doubles left pair (-168, +40), 166.61 deg /
  13.39 deg; doubles right pair (-62, +56), 137.91 deg / 42.09 deg.
- Travel counts: confirmed opponent travel 442/560 = 78.9%; multi-target
  geometry 13/560 = 2.3%; no opponent travel 105/560 = 18.8%.
- **Body-part origins — honest counts, not a rounded claim:** rows exist
  for 560/560 = 100% in the staged body-origins table, but confidence is
  tiered: confirmed 20/560 = 3.6% (19 moves whose older-gen script body
  literally names the part, plus the non-move sentinel with origin none);
  derived-from-animation 167/560 = 29.8%; rig-measured at family level
  40/560 = 7.1%; inferred-from-archetype 333/560 = 59.5%. Method is
  filled (code vector + animation offset + attacking creature's own rig
  point, chosen by move nature: projectile origin for projectile moves,
  body-lunge anchor for physical/heavy moves). No code file encodes a body
  part per move, so inferred rows must never be labelled confirmed.
  Per-creature-per-move rig join and verification of inferred rows are
  wiring work owed, not a Mars decision.

## Menu layout — resolved, not in the 26

Mars 2026-10-27 ~07:46: layout is SWAPPABLE across all generations, with
per-menu-type editors in settings: battle, pause, bag, PC, shop, save,
options (7 editors). Staged registry: 55 entries (7 menu types x 5 gens =
35, plus 4 sub-menus x 5 gens = 20), canonical default gen5, shared editor
frame (live preview on dummy data, field panel, layout picker gen1-gen5,
item-order reorder, reset-to-gen-default, save/delete custom). This was a
blocked sub-item under B3/B26, not a 26-register item, and is not counted
in the 26 again.

## Other decisions (outside the 26)

- **Per-move joins (442)** — WORK-OWED, not Mars: join source move records
  to game move ids by effect/category/target matching; do not invent ids.
  Creature joins are gated on the species conversion table (item 22).
- **WITHHELD redactions** — FILLED-BY-RULE, review step only: personal
  constants withheld mechanically (classes 30, system module 29,
  facilities 2, items 2 names). Confirmation is a review step, not a gap.
- **Private-repo push credential** — TRULY-NEEDS-MARS-ACTION: a git
  credential with repo scope, supplied through the approved secure flow,
  never pasted in chat. The only blocker for the full private-repo push;
  local converted staging (42 files, 24,062/26,275 usable = 91.58%) is
  already staged and ready.
- **Start screens** — video list and interchange control: TRULY-NEEDS-MARS
  (no generation ships a runtime background selector). Transition timing:
  FILLED from the most recent game (fade in/out + white flash on confirm).
  Timeout/replay: FILLED-BY-CANONICAL (most recent game 6,780-frame
  no-input timeout; older pattern 900-frame replay as the alternative).
  Logo and studio card are never touched.

## Verification status (this audit)

Verified in this audit from source files: move category field, no-ability
record (`--`, 165 abilities), badge-indexed shop stock, nature table and
110 application. Carried from prior staging without re-read (flagged above
per item): badge-boost absence in the battle engine, Release deny messages,
save structure, weather/camera/season systems, facility level-50 community
doc. Carried items are marked in the JSON with verification
"carried-not-reverified" and must be re-confirmed at wiring time, not
presented as freshly verified. No forbidden strings were written into
these files by construction (no species/character/town names, no dialogue,
no logo bytes); a sample grep for common forbidden tokens returned clean,
but the full 650-name lexicon used by earlier staging was deleted after
its check and is not available to re-run here, so this is a
by-construction + sample-check claim, not a full-lexicon claim.
