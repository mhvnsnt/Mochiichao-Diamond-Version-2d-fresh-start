# MODE-SWAP-SPEC — Creature Mode: one button, you ARE the Mochiichao

**Owner design (Jamar, 2026-10-29 ~20:12 CDT, his words in substance):**
"make it where you can swap from being the trainer and you can switch to
the Mochiichao and you can go play the game like it's Pokemon Mystery
Dungeon just by the press of a button… and sometimes the trainer will
follow… we'll figure out what'll control whether the trainer follows…
bring in Fallout / Bethesda companion mechanics too."

**Status:** BUILT in `tree/` (a fresh copy of the verified four-fixes
tree, main `166315ef`). Staged ready-to-land; no repo writes (the rewrite
gate is closed). Build receipts in §8.

---

## 1. What the mode is

The game has two control modes over ONE world, one save, one story:

- **Ranger mode** — the game as it already exists. You are the Ranger;
  your lead creature follows you (the HGSS follower, movement.json
  command-buffer trail — already in the engine before this package).
- **Creature mode** — you are the lead Mochiichao. The world presents
  PMD-style: your moves are usable in the field, wild creatures are
  visible persons in the world, and the Ranger walks with you as your
  companion (§4).

Mode is a *control* fact, never a world fact: same maps, same NPCs,
same encounter tables, same story flags. Nothing is re-authored per
mode; the mode changes who holds the controls and which battle grammar
applies (ENCOUNTER-MODEL §5, the decided rule).

**Donor precedent (PMD-SERIES-PULL §1):** Explorers' special episodes
already hand the player another character for a chapter; Gates'
companion mode passes control to the partner creature. The owner's
design generalises both: not chapter-locked, not post-story — a button,
from the moment you have a partner.

## 2. The swap

- **Trigger:** one key press. **The exact button is an OWNER SLOT.**
  The binding is data — `src/data/core/encounter-modes.json`
  (`bindings.swapControl.code`, wired default `KeyT`) — so the owner's
  pick changes one JSON value, never code.
- **Who you become:** the movement.json lead — first living party
  member, else the first member (`swapTarget()` in
  `src/lib/creatureMode.ts`, the same selection the follower system
  already uses, so the creature who walks behind you is the creature
  you become; there is one dyad, not two systems).
- **Precondition:** a partner exists (the game's existing `hasStarter`
  gate). Before that, the press answers with the game's own
  notification line: "You need a partner first."
- **The swap back** is the same press. No menu, no cost, no cooldown —
  PMD's grammar is that control passing is free; friction would be a
  different game.
- **What swaps with you:** input (you drive the creature's body),
  camera (§3), the follower relation (roles reverse, §4), the field
  moveset (§3), and the battle grammar (ENCOUNTER-MODEL §5). What does
  NOT swap: inventory, money, story flags, the party — they belong to
  the household, not to the body holding the controls. (Fallout's
  companion model agrees: the companion's inventory and yours stay
  distinct, but the journey state is shared.)

## 3. Camera and the creature in the field

- **Camera:** unchanged machinery — PixiWorldCanvas already centres
  the controlled body and clamps to the map; in creature mode it
  centres the creature (`playerKind: "creature"` — a canvas capability
  that existed before this package with no engine state behind it;
  this package supplies the engine half). No new camera grammar is
  invented (presentation-restraint law: the teardown games' camera
  does not change when control passes — PMD has one camera).
- **Field moveset (the PMD contract):** the creature's KNOWN moves,
  usable in the field, plus one regular attack — `Strike`
  (REGULAR_ATTACK in creatureMode.ts) — that costs nothing and is
  always available, exactly PMD's cross-series constant.
  `overworldMoveset()` returns known moves + Strike; the engagement
  layer (ENCOUNTER-MODEL §4) is what a field move *does* to a roamer.
- **What field moves do NOT do in this build:** no field-move puzzle
  verbs are invented here — obstacle/field techniques are the Rare
  Moves family's canon (Wave, Deep Dive, Illuminate…), owned by that
  system; creature mode consumes them when they land, it does not
  fork them.

## 4. The companion — Fallout layer over HGSS follower + bond

Whoever you are not playing is a **companion**: a person with a body
in the world, behaviour, and presence in and out of battle — never a
menu entry. The composition, layer by layer:

| Layer | Source | What it contributes |
|---|---|---|
| Body + trail | HGSS follower (movement.json, in-engine) | The companion walks your stepped path one step behind — command-buffer replay. In creature mode the SAME trail carries the Ranger's body (rendered as a live NPC through the canvas's NPC seam). |
| Mood | HGSS follower mood (movement.json: per-individual −127..127, drifts to neutral) | The creature companion's felt state; in creature mode it reads on the party you left behind, unchanged. |
| Commands | **Fallout / Bethesda companion layer** | The command model below: Follow / Wait / Free, player-issued, instant, diegetic (no companion menu screen — Fallout's wheel is a conversation, ours is one key cycle, G by default binding). |
| Idle life | Bethesda sandboxing | On **Free**, the companion *lives*: idles, looks around, steps a few tiles around an anchor (`companionFreeStep()`, sandbox radius 3) — a companion standing frozen in a field is the empty-world failure in miniature. |
| Standing | Bond (BOND-INTEGRATION / #39 + BOND-DECAY) | The companion's regard is the EXISTING bond read (effective bond over the care history) — companion warmth, greetings, and battle blessings read it. **No second companion-affection stat is founded** (Fallout 4's stored affinity number is refused exactly as the bond deep-dive refused a stored friendship byte: it would create two bonds). |
| Battle presence | Fallout companions fight beside you | In classic battles the battle system is untouched (your party fights as it always did — the companion IS the party/Ranger pair by construction). In creature-mode skirmishes the Ranger companion does not strike (canon: the Ranger never deals damage personally) — his presence is the catch attempt and the escalation, ENCOUNTER-MODEL §4–5. |

**The command model (built as data, not as his undecided rule):**

- `follow` — trail replay behind the controlled body *(default)*.
- `wait` — hold the tile where the command landed; the world goes on
  without them (Fallout's "wait here" — including its classic use:
  leave the Ranger at the gate, scout as the creature).
- `free` — sandbox near an anchor (the controlled body's position):
  idle, look, wander ≤3 tiles. DX's "smarter partner defaults" are
  the PMD-side precedent for a companion acting sensibly unprompted.

**What DECIDES following — the open part, handled as ordered:**
the player's command is the standing rule. Story beats may override
it, and that override is **data**: `COMPANION_OVERRIDES` in
creatureMode.ts ships EMPTY (eventId + optional mapId + command +
reason), consumed by `effectiveCompanionCommand()`. When the owner
authors a beat ("the Ranger waits while you scout the cave"), it is
one table row — the engine already reads the table. Nothing about his
undecided rule is hard-coded anywhere in this build.

**Grades against canon doctrines:** STAYING-POWER ✓ (the dyad is the
core loop's emotional axle; commands serve discover→bond→journey,
never a separate companion-management loop; Fallout's companion
*errand* economy — carry weight, companion perks as build power —
is refused: no companion inventory burden, no perk power, the
companion's value is presence + bond, both already core). EMPTY-WORLD
✓ (a companion who sandboxes is authored life that travels with you;
`wait` makes places hold a person you left there — the world keeps
them). PMD dyad (T7) ✓ — the protected pair is never separable by the
command model: Wait/Free are *positions*, not dismissal; there is no
"send home" verb in this build, by design.

## 5. Presentation (presentation-restraint law, owner 2026-10-29 ~20:29)

This build's presentation takes its grammar from PMD/HGSS as those
games actually present, per the standing law:

- **No mode dashboard exists.** An earlier draft of this build carried
  a persistent HUD chip naming the mode, the companion command, and
  the keys. It was REMOVED under this law before landing: PMD never
  labels its mode — the sprite you control is the indicator; HGSS
  never labels the follower — the body behind you is the indicator.
  What you are is shown by who you are standing in.
- **Companion command is shown by the body:** at your heel (follow),
  standing where you left them (wait), wandering and looking (free).
  Fallout presents commands the same way — the companion's behaviour
  is the UI.
- **Feedback rides the game's existing notification line only** (the
  surface the game already uses for its own events — quicksave,
  warnings): the swap speaks one line ("You are Sproutle now."), a
  command change speaks one line, an engagement outcome speaks one
  line. No new surface was invented.
- **Roamers present as creatures in the world** — the canvas's
  existing wild rendering, with its one existing accent: a red
  telegraph ring when a wild is chasing (the canvas's own grammar,
  wired, not invented).

## 6. Owner slots in this spec (complete list)

1. **The swap button** — his pick; wired default `KeyT`, data-only
  change (encounter-modes.json).
2. **Story overrides of the companion command** — beats he authors go
  in `COMPANION_OVERRIDES` (ships empty).
3. **The fiction of the swap** — what control-passing *is* in canon
  (bond link? training? something older?) is a story fact; the system
  is built so any of his answers fits without a rebuild.
4. Battle-style: **NOT a slot** — decided by rule (ENCOUNTER-MODEL §5).

## 7. Files (this build)

- `tree/src/lib/creatureMode.ts` — swap target, companion model,
  overrides table, sandboxing step (shared with ENCOUNTER-MODEL).
- `tree/src/lib/creatureMode.test.ts` — 20 tests, the decided rules
  locked as tests.
- `tree/src/data/core/encounter-modes.json` — bindings + mix + rates.
- `tree/src/world/WorldEngine.tsx` — swap key, role-reversed render
  (playerKind / synthetic Ranger NPC via the NPC seam), companion
  position by command, HUD: none (see §5).

## 8. Receipts

- Base tree: fresh copy of `~/workspace/four-fixes/tree` (verified vs
  main `166315ef`, 506 files).
- `npx tsc --noEmit`: **0 errors.**
- `npx vitest run`: **121/121 tests pass** (101 baseline + 20 new);
  one pre-existing suite-load failure in
  `src/assets/sprite-atlases/animation/treatments/battleTreatments.test.js`
  (byte-identical to the four-fixes original; its subject module ships
  as `.ts.txt` in the source tree — not caused by, not touched by,
  this package).
- Smoke screenshots: `smoke/` in this folder (vite build served,
  driven through the real UI with the seqbuild Playwright rig).
