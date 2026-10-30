# Main Menu — the step record, V1 to V36 (recovered 2026-10-28)

This folder is the full instruction record of how the Mochiichao main
menu was designed, step by step, by Mars (Jamar), mostly on
2026-10-25, with the correction chain that followed on 2026-10-26
and 2026-10-27. It was recovered and filed on 2026-10-28 at Mars's
order, after a later remake worked from resemblance instead of from
this record and lost the precision he had put into it.

## THE RULE — read this before touching the main menu

**Any agent who touches the main menu pulls this record up first
and walks it step by step, verbatim. No freehand remakes. No
"close enough." The locked v32 facts (STEPS.md, "The locked v32
spec") are the floor everything conforms to.**

- A step marked with Mars's own words is followed in his words.
  Where his words do not survive, the step is followed as recorded,
  with its label (see below) — the label is part of the record, do
  not strip it.
- The default changes ONLY when Mars locks a new one in his own
  words. Editing, presets, and editor saves never change the
  default. (Lock rule, Mars, 2026-10-25 16:47 CDT.)
- Rejected versions are NOT deleted. v22, v23, v31 and the sparse
  flow demo stay selectable options, labelled as rejected. Nothing
  shown is thrown away. (Interchangeable-elements rule, Mars,
  2026-10-25 17:27 CDT.)
- Pokemon-first: menu structure comes from the real game files
  first (FireRed, then HeartGold, then Black 2), Mochiichao values
  go into Pokemon's slots. No terminal menus, no overlay popups.
  (Standing rule, Mars, 2026-10-25 17:14 CDT, confirmed 17:16.)
- Phi / research by default: placements and sizes use the golden
  ratio and the colour research numbers unless Mars overrides that
  one item in his own words. The override is for that item only.
  (Mars, 2026-10-25 17:41 CDT.)
- The scope this work sits inside, in Mars's own words
  (2026-10-25 19:19 CDT, recorded verbatim in the wiring tracker):
  "LEAVE OUT: Pokemon sprite, Pokemon dialogue, Pokemon music,
  Pokemon cry — those are replaced with Mochiichao versions in
  the exact spot. PULL IN + WIRE UP 100%: everything else —
  movements, timing, techniques, systems, structures, data
  shapes, file formats, animation/motion data, generic
  terrain/weather."

## How each step is labelled

- **VERBATIM** — Mars's own words, quoted, with the source named.
- **PARAPHRASE** — the repo record states his order or verdict in
  the recording agent's words, sometimes with his timestamp. His
  instruction is on record; his exact wording is not.
- **RECONSTRUCTED** — rebuilt from artifacts, traces, measurements
  or code, not from a recorded instruction. The evidence is named.
- **GAP** — could not be recovered from any source searched. Listed
  by number. Never padded, never invented.

## Coverage (honest count)

- **32 of the 36 numbered steps are on record: V1–V32.** Every
  one of them is in STEPS.md with its change, its parameters, and
  its render or document pointer (EVIDENCE-INDEX.md).
- **His exact words survive in pieces, not in bulk.** Verbatim
  owner wording is attached to: V8 (his verdict fragment), the
  V32 lock (his "PERFECT" for the v30 start, and the lock rule),
  the matched-animation verdict, the 17:16 confirmation
  ("Exactly"), the 2026-10-26 formula order ("stop cheating.
  Follow the formula"), the checkpoint lock ("lock in what you
  got as one we can get back to at any point in time"), the
  slow-rise naming ("really slow rise"), and the emblem-field
  defect ("white space on both sides of the emblems"). Each is
  quoted in STEPS.md with its source. Everything else is
  PARAPHRASE — his order on record in the recording agent's
  words, timestamped — or RECONSTRUCTED from the artifacts, the
  traces, the measurements, and the code, with the evidence
  named. The step labels say which, every time.
- **4 of 36 are GAPS: V33, V34, V35, V36.** See "The v33–v36
  question" below and the Gaps section of STEPS.md.
- After V32, the work that actually happened is filed as 12 dated
  correction-chain steps (STEPS.md, Part 6), plus 3 open owner
  calls carried forward undecided.

## The v33–v36 question, stated plainly

Mars's own brief on 2026-10-26 (14:59 CDT, recorded in PR #214)
asked for "every version v1-v35". The workers who answered that
brief recorded in the same PR: "v33–v35 do not exist as files;
v1–v9 placement numbers are not in the files; neither invented."
No file, render, log entry or PR for a v33, v34, v35 or v36 main
menu was found in any source searched for this archive (full list
under Sources). The work that actually happened after v32 is real
and is filed here as the dated correction chain (STEPS.md, Part 6)
— it is NOT renumbered into versions it never had. If Mars numbers
a step v33 or later in his own words, that step gets added here
under his number, with his words.

## Files in this folder

- `README.md` — this file: the rule, the labels, the coverage.
- `STEPS.md` — the step record itself: V1–V32, the research block,
  the animation states, the Menu Creator family, the locked v32
  spec, the post-v32 correction chain, the open owner calls, and
  the gaps.
- `EVIDENCE-INDEX.md` — every version and state mapped to its
  render / evidence file in the repo, so any step can be checked
  against its picture.

## The locked floor, in one place

The full locked v32 spec is in STEPS.md. The numbers that get
broken most often, up front:

- Canvas 1200x1500, centre x=600. Logo y180, w900 (150–1050).
- Cloud visible box x250–950, y648–828, centre (600,738),
  700x180. The cloud FILE is the original `puffy-cloud.svg`,
  transform only — redrawing the path is banned (Mars,
  2026-10-26 18:13 CDT). The traced file
  `mochiichao-main-cloud-v32.svg` is BANNED everywhere, forever.
- Panels: CONTINUE y788 h110 pink #ff96c8, sublabel
  "Last: Core Fragment"; NEW GAME y918 h70 yellow #ffe696;
  SETTINGS y1008 h70 blue #8cd2ff; BACK TO TITLE (B) y1098 h70
  green #a0e6b4. Stack ends about y1168.
- Background: full start y905 — DO NOT MOVE, and no negative
  space underneath (bottom is 1500, full to the edge). Phi fade:
  gone above 620, faint 620–729, stronger 729–905, full 905–1500.
  Fade length 285. Split ratio 1.615, about phi.
- Symbols live on the symbol layer ONLY: never above y620, never
  over the logo, the cloud, or the panels.
- Logo hearts (exact, PR #261 measurements): blue centre
  (169,421.5), 63x50, #8cd2ff; pink centre (230,640.5), 53x40,
  #ff96c8 — on the v28 layer: above arcs + symbols, below logo.
  (The PR #214 numbers — blue y405, pink y637 — are superseded.
  Do not use them.)
- Panel text (PR #206, merged): left-aligned, margins CONTINUE 27
  / NEW GAME 33 / SETTINGS 29 / BACK 33 (construction values),
  label sizes 35 / 26 / 35 / 31, letter-spacing derived per panel,
  no tracking-widest, no hardcoded cursor on BACK.

## Sources used for this recovery (exact)

Repo `mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start` (private),
read on main, 2026-10-28:

- `docs/ui-art-options/conversation-log-2026-10-25.md` — the spine:
  the session's own running record, kept under Mars's standing
  order to document all conversation (2026-10-25 16:36 CDT).
- `docs/ui-art-options/main-menu-default-locked-v32.md` — the lock.
- `docs/ui-art-options/main-menu-need-list-100pct.md`
- `docs/ui-art-options/main-menu-wiring-v3.md`
- `docs/ui-art-options/wiring-tracker-100pct.md`
- `docs/ui-art-options/title-intro-tracing-master.md`
- `docs/ui-art-options/CHECKPOINT-LOG.md`
- `docs/ui-art-options/cloud-fixed3-checkpoint-20261026-2015.md`
- `docs/ui-art-options/mars-compare-notes-20261027.md`
- `docs/ui-art-options/menu-background-animation-spec.md`
- `docs/ui-art-options/title-screen-pull-100pct.md`
- `docs/ui-art-options/title-screen-spec.md`
- `docs/ui-art-options/settings-menu-creator-spec.md`
- `docs/ui-art-options/menu-elements-interchangeable-index.md`
- `docs/ui-art-options/ui-art-options-index.md`
- `docs/ui-art-options/pokemon-first-rule.md`
- `docs/ui-art-options/cloudswap-measure-20261026.json`
- `docs/ui-art-options/menu-moving-bottom-measure-20261026.json` and
  `menu-moving-bottom-phase-20261026.json` (via extraction)
- `docs/ui-art-options/cloud-emblem-slow-hearts-trace-20261026.md`,
  `docs/ui-art-options/menu-editor-pokemon-settings-trace-20261026.md`,
  `docs/ui-art-options/new-pulls-research-20261025.md`,
  `docs/ui-art-options/intro-title-scene-art-research-100pct.md`,
  `docs/ui-art-options/hookup-title-pressstart-settings-v1.md`,
  `docs/ui-art-options/boot-title-pressstart-pull-local.md`,
  `docs/ui-art-options/fire-red-first-replacement-log-v11.md`,
  `docs/ui-art-options/game-flow-ui-v4.md`,
  `docs/ui-art-options/most-recent-pokemon-ui-v6.md`,
  `docs/ui-art-options/starter-deadlock-fix-v5.md` (via extraction)
- `docs/locked-v32-full-snapshot-20261027.md`
- `docs/ui-art/UI-LANE-SHIP-MANIFEST-2026-10-27.md`
- `docs/ui-art/ui-lane-recount-20261027.md`
- `docs/research/color-neurochemistry-design.md`
- Code seats read for the values they carry: `src/lib/lockedV32Menu.ts`,
  `src/components/game/MainMenuBackground.tsx` (via traces/PRs).

Pull requests (bodies read in full, 2026-10-28):

- Private repo: #5 (menu stack follow-up — mirrored pink heart,
  white labels; owner-confirmed look, PR itself unmerged), #6
  (Menu Editor expansion, 314 values; unmerged, owner judges
  screenshots first).
- Old public fork `mhvnsnt/Mochiichao-Diamond-Version-2d-public-fork`:
  #260 (Menu Editor, merged), #322 (= private #5's original),
  #206 (panel text exact, merged), #214 (formula symbols v2,
  merged), #233 (cloud fixed3, merged), #261 (cloud exact-target +
  slow-rise + hearts, merged).

Local record: `~/MEMORY.md` and `~/memory/` were searched — they
hold no menu-session record (the session predates the daily notes
kept there; notes exist only for 2026-10-27/28). The local working
clone `~/workspace/mochiichao-work/` cited by the Oct 26–27 docs no
longer exists on this machine; every render it held that matters is
either in the repo or named in EVIDENCE-INDEX.md as workspace-only.
