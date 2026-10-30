# EP01 ED — PRODUCTION PATH + ASSEMBLY SPEC

**What this is:** the buildable path for EP01's ending-credit
sequence — the assembly spec that gap 13 of
`show/production/animation-method/WHAT-WE-DO-WRONG-ADDENDUM-2.md`
demands ("an ED assembly spec plus sampled frames *from the
assembled ED*"), wired from the ED machinery the repo already
holds. It invents no ED content: the slot, the bed, the beat
map and the gag chart already exist; anything beyond them that
is still the owner's call is flagged OWNER-OWED in §5 and left
exactly there.

Filed beside the ED's timing artefacts in this folder. The
gag rebuild itself waits on the two owner calls named in
`EP01-ED-GAG-ABOVE-FLOOR-CHART.md` (Gate-8 verdict; profile
call) — this path is what executes when they land, and it is
buildable against the shipped slot geometry today.

---

## 1. The slot (decided — from the episode build)

- The episode is a 24:00 build (`EP01-V3-episode.json`):
  **OP 60 s + story 1,260 s (107 cuts) + ED 75 s + preview 45 s**.
  The ED slot is the 75 s after the story, before the preview,
  at the 24 fps master (1,800 frames).
- The bed is **current and measured**: `EP01-V3-ED.wav`,
  sha256 `485525875c47d36f0d80f2500b4eee09ff30200a0638397f20ea6e43ea938925`,
  75.000 s, 48 kHz stereo (recorded in
  `../EP01-V3-STEMS-AND-MASTER-MANIFEST.md`).
- The gag window is **ED 56–70 s** (gag frames 0–335 on the
  chart set's grid).
- The shipped master already contains an ED segment (render
  ledger: ED, OK, 75 s) — it carries the **v2 gag**: measured
  at **7.786 drawings/sec, below the 8/sec credits floor**,
  uniform unmodulated rate, non-conforming to the above-floor
  chart set. This path is that segment's rebuild route; the
  slot and the bed do not change.

## 2. The assembled picture (what the ED actually is — gap 13)

Sampled from the shipped master, the ED is a **layered
composition**, not a standalone film:

1. a full-frame **credit-text card**;
2. a centred **inset box** where the gag plays;
3. **three full-size character idles** looping at the bottom
   for the whole ED.

The v2 gag was built assuming its own full frame and its own
background. Swapped in naively it would put three of its five
walkers on screen **twice, at two sizes, at once** (the bottom
idles + the gag line). §4 carries the gate that forbids this;
§5 carries the placement questions that are the owner's.

## 3. Inputs (all in-repo, all current)

| Input | Where | Role |
|---|---|---|
| ED bed | `EP01-V3-ED.wav` (hash in §1; master in TeraBox per the stems manifest) | the music the ED is cut to |
| Beat map | `EP01-ED-BEAT-MAP.md` / `.json` (this folder) | 144.0 BPM grid — 10 f/pulse, 20 f/strong pulse, 40 f/bar; **bell at gag frame 96** |
| Gag chart set | `EP01-ED-GAG-ABOVE-FLOOR-CHART.md` / `.json` (this folder) | the rebuild's timing: 12.07 drawing-changes/sec, line chart, per-species gait timing, bell accent |
| ED standard | `show/production/animation-method/METHOD-REGISTRY.md` — THE ED-CREDITS STANDARD | what production-grade means at ED drawing rates |
| Ending-study rules | `show/production/animation-method/YU-YU-HAKUSHO-ENDING-STUDY.md` §5 | on-3s default, ≥8 drawings/stride, timing contrast mandatory, holds composed, personality per chart |
| Beat-grid rule | `show/production/animation-method/TIMING-STANDARD.md` §7 | no scored piece is charted before its bed has a beat map — the beat map above is that artefact |
| Drawn gates | `show/production/animation-method/WALK-DIAGNOSIS-LOG.md` §3 | the drawn-space gates the walkers must pass |
| Background | `show/shared/PLATES-REGISTRY.md` — registry-current living background | never the v1 still plate (current-version law) |
| Cast art | canon cutouts + pose sheets (reference packs) | no baked shadows — shadows are made at composite |

## 4. Build steps (ordered)

1. **Lock the assembly geometry on paper.** Inset box position
   and size as shipped (§2) unless §5(i) is ruled otherwise;
   credit card as shipped unless §5(ii) is ruled otherwise.
2. **Cast the bottom idles for the gag window — GATE, not a
   choice:** during ED 56–70 s, no character who walks in the
   gag (Mochiko, Mochii, Kittember, Sproutle, Wispkin) may
   also appear in the bottom idles. Swap the idle cast for
   the window or pause the duplicated idles — the
   implementation is the builder's; the no-duplication
   outcome is the gate.
3. **Time everything to the beat map.** Pulses every 10
   frames from gag frame 6; contacts on strong pulses;
   personality beats on barlines; the line's biggest accent
   on the bell (gag frame 96 — all five change, 8-frame
   composed freeze, release burst at 104, per the chart set).
4. **Animate per the chart set.** Mochiko's gait is the v6
   industry cycle re-gridded; the other four walkers use the
   chart's timing grammars, with their drawn-space gates
   (footfall charts, float drift range — addendum-2 gap 14)
   filed per species **before** drawing. Exposure grammar and
   holds exactly as charted (every personality beat a held
   drawing ≥ 0.5 s).
5. **Composite the assembled ED** — credit card + inset gag +
   bottom idles — shadows at composite only. The gag is never
   finished as a standalone file and called the ED.
6. **Conformance.** `verify_proof.py --chart
   EP01-ED-GAG-ABOVE-FLOOR-CHART.json` against the rendered
   gag (accents within ±2 frames; line holds empty of
   changes; contacts answered). The v2 run recorded in
   `timing-profile-runs.json` is the baseline to beat.
7. **ED-standard check** (registry): finished art (no
   placeholders), contacts plant and stick, held poses read
   as silhouettes, timing contrast present, cuts/beats on the
   song, personality in the charts.
8. **Assembly gate (gap 13).** Sampled frames **from the
   assembled ED**: credit text fully legible, no duplicated
   cast member at any frame of the window, placement as
   filed in step 1. The owner views the **assembled ED
   segment**, not the standalone gag file.

## 5. OWNER-OWED — flagged, never decided here

1. **Inset vs full-frame gag placement.** The shipped master
   uses the inset; changing it is a content call.
2. **Whether the credit text clears during the 56–70 s
   window.** Undecided in the record; the rebuild targets the
   shipped geometry until ruled.
3. **Gate-8 verdict on the v6 industry-method walk proof** —
   named in the gag chart set as an open owner call the
   rebuild waits on.
4. **The profile call** — gag line in profile (with locked
   profile model sheets first) or the method applied
   front-facing. Also named in the chart set; the small-tail
   question on the Dorowani candidate sheets rides with it.
5. **A credit-layout standard.** None exists: the shipped
   card is set in a generic serif and the show's own display
   fonts play no part. The fonts seat is
   `show/production/fonts/` — the input a standard would be
   built from when the owner sets one.
6. **Any ED content beyond the existing slot, beat map and
   gag chart** — new gags, new cast, new ED structure — is
   the owner's call, full stop.

## 6. What this path consumes (the written-vs-wired record)

This file is the consumption record for the ED machinery:
METHOD-REGISTRY (ED-CREDITS STANDARD) ·
YU-YU-HAKUSHO-ENDING-STUDY §5 · TIMING-STANDARD §7 ·
WALK-DIAGNOSIS-LOG §3 · WHAT-WE-DO-WRONG-ADDENDUM-2 gaps
13/14/18/19 · EP01-ED-BEAT-MAP · EP01-ED-GAG-ABOVE-FLOOR-CHART.
Before this file, those systems were written and cross-cited
but no episode build file assembled them into a buildable
sequence. Registered in `show/production/animation-method/METHOD-REGISTRY.md`
(canon-systems reference entry, 2026-10-28).

---

*Wired by the canon & craft sweep, 2026-10-28. The machinery
is the repo's; the open content calls in §5 are the owner's.*
