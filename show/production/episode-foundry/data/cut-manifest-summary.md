# EP01 CUT MANIFEST — SUMMARY

**Manifest:** `cut-manifest.json` (same folder) — exactly the 107 story cuts
V3-001…V3-107 in storyboard order (`order_index` 1–107). OP / ED / PREV are
separate in the episode map and are **not** in the manifest, per the brief.

**Sources used (every manifest field traces to one of these):**

- Shooting script: `~/workspace/ep01-script-v3/EP01-SHOOTING-SCRIPT-v3.md`
  (beats, characters, dialogue; each manifest entry's `source_script` gives
  the cut-heading line, or the locked-scene block line for locked cuts).
- Episode map: `~/workspace/ep01-finish/EP01-V3-episode.json`
  (scene grouping and cut order; OP/ED/PREV excluded).
- Per-cut shot specs: `~/workspace/ep01-finish/specs/V3-*.json`
  (`background_plate` and `duration_s` taken verbatim; `source_spec` per cut).
  Per the brief, these specs are storyboard-draft-1 material: their plate
  paths are evidence of what the storyboard used, **not** proof of registry
  currency — see the registry section below.

**Character rule applied:** `characters` lists only characters the script
names for that cut (canon spelling as written in the script body: Mochiko,
Mochii, Dorowani, Gabu, Kittember, Sproutle, Wispkin, Hex, Aeon). Where the
script shows a collective ("the crew", "the procession", "everyone") without
naming individuals, or shows an unattributed effect (smoke, unseen hands),
the entry has an empty or partial list plus a `characters_note` saying
"unspecified in script" and why. No character was guessed into a cut.

---

## Counts

### Cuts and duration per scene

| Scene | Title | Cuts | Seconds |
|---|---|---:|---:|
| N1 | Dawn Before the Keeper | 6 | 78 |
| S1 | Locked Scene 1 — Garden Gate, Morning | 5 | 37 |
| N2 | The Rounds, Part 1 | 10 | 128 |
| S2 | Locked Scene 2 — Garden Pond | 4 | 33 |
| N3 | The Rounds, Part 2 | 8 | 102 |
| S3 | Locked Scene 3 — Garden Green | 3 | 27 |
| N4 | False Clue One: The Frost Is a Map | 9 | 108 |
| N5 | False Clue Two: The Net Plan | 8 | 96 |
| N6 | The Garden at Work | 7 | 84 |
| EYECATCH | Mochiioteca check-in | 1 | 8 |
| N7 | The Stakeout Builds | 6 | 73 |
| S4 | Locked Scene 4 — Garden Pond, Dusk | 7 | 74 |
| S5 | Locked Scene 5 — Garden Gate, Night | 5 | 48 |
| N8 | The First Night Shift, Together | 10 | 128 |
| N9 | Night in the Garden | 8 | 104 |
| N10 | Morning-After Button | 6 | 86 |
| ST | Locked Stinger — The Dark Forest | 4 | 46 |
| **TOTAL** | | **107 cuts** | **1,260 s (21:00 story)** |

Verified two ways: the spec `duration_s` values sum to 1,260 s, and every
per-scene sum matches the script's §0 runtime table exactly. All 107 specs
carried a `duration_s`, so **no duration had to be derived** — every entry's
`duration_source` is its spec file.

### Cuts by character (script-named appearances only)

| Character | Cuts |
|---|---:|
| Mochiko | 28 |
| Gabu | 19 |
| Wispkin | 13 |
| Mochii | 12 |
| Kittember | 10 |
| Sproutle | 9 |
| Dorowani | 7 |
| Hex | 1 (cameo, V3-002) |
| Aeon | 1 (cameo by signal, V3-043) |

31 cuts name no character at all (empty/environment/intertitle cuts — list
in the manifest via empty `characters` + `characters_note`):
V3-001, V3-003, V3-006, V3-007, V3-023, V3-027, V3-029, V3-033, V3-044,
V3-049, V3-058, V3-059, V3-060, V3-061, V3-062, V3-067, V3-068, V3-075,
V3-080, V3-087, V3-094, V3-095, V3-096, V3-097, V3-098, V3-099, V3-101,
V3-104, V3-105, V3-106, V3-107.

### Single-character cuts (56)

V3-002 (Hex), V3-004 (Kittember), V3-005 (Dorowani), V3-008 (Mochiko),
V3-009 (Mochii), V3-011 (Dorowani), V3-012 (Mochiko), V3-017 (Sproutle),
V3-018 (Gabu), V3-021 (Mochiko), V3-025 (Kittember), V3-026 (Mochiko),
V3-028 (Kittember), V3-030 (Gabu), V3-031 (Gabu), V3-034 (Gabu),
V3-035 (Sproutle), V3-036 (Mochiko), V3-039 (Kittember), V3-040 (Gabu),
V3-041 (Gabu), V3-042 (Mochiko), V3-045 (Gabu), V3-046 (Gabu),
V3-047 (Dorowani), V3-048 (Gabu), V3-050 (Gabu), V3-051 (Gabu),
V3-052 (Kittember), V3-056 (Mochiko), V3-057 (Mochiko), V3-063 (Gabu),
V3-065 (Sproutle), V3-066 (Kittember), V3-069 (Gabu), V3-070 (Kittember),
V3-071 (Sproutle), V3-072 (Wispkin), V3-073 (Wispkin), V3-076 (Mochiko),
V3-077 (Wispkin), V3-078 (Wispkin), V3-082 (Wispkin), V3-083 (Wispkin),
V3-084 (Wispkin), V3-085 (Wispkin), V3-086 (Wispkin), V3-088 (Wispkin),
V3-089 (Wispkin), V3-090 (Mochii), V3-091 (Gabu), V3-093 (Mochiko),
V3-100 (Wispkin), V3-102 (Mochiko), V3-103 (Gabu).

Caveat on three of these: V3-012 / V3-021 / V3-026 are single-*named* cuts —
the script places an unnamed collective crew in the same frame (see each
entry's `characters_note`). V3-077 and V3-100 are Wispkin as intertitle
voice only, with no on-screen character in the cut's VISUAL/ACTION.

### Background plates in the specs

- Living `.mp4` spec plates: 94 cuts.
- Still `.png` spec plates: 13 cuts — V3-003, V3-013, V3-014, V3-075,
  V3-077, V3-080, V3-081, V3-082, V3-098, V3-104, V3-105, V3-106, V3-107.
  Each manifest entry flags this in `background_note`. Of these, only the
  four Forest stills (V3-104…107) are still *by law* (see registry §5);
  the board/berry-store stills are storyboard choices, not a stillness rule.

---

## PROOF CUT PICK — V3-078 (Wispkin)

**V3-078 — Locked cut 23, Action Beat B (S5, Garden Gate — Night, 10 s).**
Wispkin floats UP for the first time, smoke swirling, and rings the gate
bell with its tail of smoke.

Why this cut:

1. **Single character, no ambiguity.** Wispkin is the only character in the
   cut — no crew, no second actor, no collective framing to confuse a
   likeness or motion gate.
2. **Clear, visible, unmistakable action.** A vertical float-up plus a
   bell-ring performed by the smoke tail: large, readable motion with a
   definite start and end — exactly what a first proof needs to show the
   generator produced *the action*, not just movement. It is one of the
   script's two named Action Beats (B), so the episode itself treats it
   as a signature performance.
3. **Strongest reference character — with produced evidence.** Per the
   brief, Wispkin (with Dorowani) has the strongest references/LoRAs;
   Wispkin's design — cracked white skull-mask, smoke tail — is also
   the most silhouette-distinct of the cast, so a likeness pass/fail
   is easiest to judge honestly on frame 1 and across the clip. This
   is not theoretical: the owner-graded GOOD test pair —
   `~/workspace/flow-tests/flow-wispkin-darkwave.mp4` (md5
   `9b035543622593c0746fe226590f7505`) and
   `~/workspace/flow-tests/flow-dorowani-waterorb.mp4` (md5
   `899cad8010861f3f0f483acbf89e1234`), both verified on disk
   2026-10-28 — shows character-true Wispkin and Dorowani clips
   already exist and passed the owner's grading (owner correction
   2026-10-28: the last two delivered videos were character-true
   and owner-graded PASS, better than the avatar tool's output).
   **Attribution caution:** which pipeline made these specific
   files is *unsettled* — the owner says his best clips came from a
   Wan-based pipeline capped at 5 uses/day, the chat label "Flow"
   may be wrong, and provenance is to be settled from the folders'
   own records by the recipe worker, not from folder names. The
   manifest therefore records these clips' road as
   "attribution-unsettled (folder-labelled flow; records check
   pending)". The two test clips are cited
   on the V3-078 and V3-005 manifest entries as `reference_test_clip`;
   they are test evidence, not production clips for those cuts.
4. **Living background.** The spec plate is
   `ep01-finish/assets/plates/gate-night.mp4` — a living `.mp4`, so the
   proof also exercises background persistence at night grade. (Registry
   caveat: no registry entry exists for this night plate — see below —
   so the proof validates generation, not plate currency.)
5. **Short and self-contained:** 10 s, one location, no dialogue,
   no intertitle, no palette device — nothing else in the cut can mask
   a generation failure.

**Runner-up: V3-005 (Dorowani, 14 s, N1).** Dorowani crosses with the
Manual under one arm and checks the gate latch twice, gently — also a
solo cut with a clear two-part action, on the living
`gate-dawn.mp4` plate. It loses to V3-078 only because the walk-plus-
latch action is subtler than float-up-plus-bell-ring. A good second
proof once the first passes. (Also strong: V3-084, Wispkin setting the
toy duck back on the water with both hands, 14 s, `pond-night.mp4`.)

Deliberately **not** picked: V3-089 (Wispkin solo, but the scripted
action is *stillness* — it cannot prove motion) and V3-005's scene-mate
V3-006 / V3-097 / V3-101 smoke cuts (the script never names the smoke's
owner, so they cannot prove a character at all).

---

## Prior production — cuts that already have produced clips

Three cuts are **not** untouched: clips already exist for them. What
is settled (owner, 2026-10-28): character-true, owner-graded-PASS
clips exist — the last two delivered videos were character-true and
better than anything the avatar tool produced — and his best clips
came from a pipeline capped at ~5 uses/day (≈40 finished seconds/day).
What is **not** settled: which pipeline made the specific files below.
The chat/folder label says "flow", the owner says the best clips came
from a Wan-based pipeline, and at least one pipeline named in chat has
made no video yet — so the manifest records each clip's road as
**"attribution-unsettled (folder-labelled flow; records check
pending)"**, to be corrected when the recipe worker lands provenance
from the folders' own records. Each manifest entry carries this in a
`prior_production` field (all other entries: `null`). All files
verified on disk 2026-10-28 (path, size, md5):

| Cut | Produced clip | Size | md5 |
|---|---|---:|---|
| V3-001 | `~/workspace/ep01-flow-production/EP01-V3-001-flow-gate-dawn-seg1.mp4` | 2,117,528 B | `af89b961a4c040a758305047d5f7bd0c` |
| V3-002 | `~/workspace/ep01-flow-production/EP01-V3-002-flow-pond-seg1.mp4` | 1,423,517 B | `f0b8c7fb936f5d492073ae4f47cb28ae` |
| V3-005 | `~/workspace/grok-fix/EP01-V3-005-flow-walk.mp4` | 3,948,326 B | `91d06eaa24b3d6ab63de4dfd292d339b` |

- **V3-005 credit:** this clip was produced by the **Grok-built
  clip-generator job** (the converging lane), and is adopted into the
  Episode Foundry under the convergence agreement of 2026-10-28 —
  credited as the source in the manifest entry, per that agreement.
- **Honesty note on the two `seg1` files:** the V3-001 and V3-002
  filenames say *seg1* (first segment). This manifest records the
  files as prior production for those cuts; it does **not** assert
  that either file covers its cut's full duration (V3-001 = 14 s,
  V3-002 = 12 s) — segment coverage was not measured here.
- The proof-cut pick is unchanged: V3-078 has no prior production and
  remains the clean first proof. V3-005, the runner-up, already has a
  produced clip (above, Grok-job credit) in addition to its Dorowani
  test clip.

## Registry check — which background version is CURRENT?

**Files searched:** `~/workspace/mochiichao-show/` and
`~/workspace/ep01-rebuild/`, plus the registry the spec paths themselves
point into (`~/workspace/still-to-build/living-plates/`).

**What was found:**

1. `~/workspace/mochiichao-show/repo-add/show/shared/parts-catalog.json`
   (schema `mochiichao-show/parts-catalog/v1`, updated 2026-10-27) — a
   collection-level construction-kit catalogue (battle backgrounds,
   pose libraries, palettes, donor sets). It contains **no EP01 plate
   entries and no CURRENT marking for any Gate/Pond/Green plate.**
   Note the conflict: the script's §1 canon-sources table cites
   `show/shared/parts-catalog.json` as grounding "Gate / Pond / Green
   locations, currency" — the on-disk file does not carry that currency
   information.
2. `~/workspace/mochiichao-show/repo-add/show/shared/clip-index.json`
   — an index of finished clips and their quality status, not a plate
   registry; no plate-currency entries.
3. **The actual currency record is
   `~/workspace/still-to-build/living-plates/PLATES-REGISTRY.md`**
   (registry date 2026-10-28, "parts-catalog style", applies the
   Current-Version Law explicitly: CURRENT marked per piece AND per
   use, superseded version named). It is corroborated by
   `~/workspace/ep01-finish/INVENTORY.md` (lines 14–22), which calls it
   "currency of record". What it says:
   - **Garden Gate — v2-living is CURRENT:**
     `show/episodes/EP01/animatic/EP01-CUT01-composite-life-proof-v1.mp4`
     (local: `~/workspace/mochiichao-show/repo-add/show/episodes/EP01/animatic/EP01-CUT01-composite-life-proof-v1.mp4`,
     md5 `d2f1bf1d709d3a0e9d9d0f58dccc6c31`). It supersedes the v1 still
     *as a standalone background* (the v1 still remains the accepted
     base plate). FOR: EP01 cuts 01–05 (v2 numbering) and Gate
     scene-ins. The registry states the Gate is the only canon painted
     background art on disk.
   - **Pond Day — v1-living (spec) is CURRENT for provisional use:**
     `pond/EP01-PLATE-pond-day-v1-living.mp4`. Provisional procedural
     plate, **not canon art** (canon Pond plate is still MAKE —
     GAP-pond-canon).
   - **Pond Dusk — v1-living (spec) is CURRENT for provisional use:**
     `pond/EP01-PLATE-pond-dusk-v1-living.mp4` (grade variant of the
     day base; the day plate stays CURRENT for its own uses — currency
     is per use).
   - **Green Day — v1-living (spec) is CURRENT for provisional use:**
     `green/EP01-PLATE-green-day-v1-living.mp4`. Also provisional, not
     canon art (GAP-green-canon).
   - **Dark Forest — v1 still is CURRENT, the only version:**
     `forest/EP01-PLATE-dark-forest-day-v1-still.png`. A living Forest
     version must never exist — cycles OFF by law; a moving Forest cut
     FAILS. Provisional still (GAP-forest-canon), stillness registration
     unchanged when canon art lands.
   - The registry has **no entries** for any night plate, the berry
     store, the keeper-board plates, `gate-dawn.mp4`, `pond-dawn.mp4`,
     or the colour-shift plate. `ep01-finish/INVENTORY.md` additionally
     flags **Gate NIGHT grade as a GAP** (production: overlay grade at
     prepass).

**How the manifest records this:** no spec plate was upgraded or
replaced. Each entry keeps the spec's `background_plate` verbatim and
adds `registry_current_plate` + `registry_note` side by side:

- **Match (67 cuts):** every cut whose spec plate is a
  `still-to-build/living-plates/` Pond day / Pond dusk / Green day /
  Forest file, plus the 9 cuts whose spec background already *is* the
  Gate v2-living file — spec plate = registry CURRENT.
- **Differ (6 cuts): V3-001, V3-004, V3-005, V3-006, V3-097** use
  `ep01-finish/assets/plates/gate-dawn.mp4`, and **V3-002** uses
  `pond-dawn.mp4`. For these, `registry_current_plate` records the
  registry's CURRENT file for that location (Gate v2-living composite /
  Pond day v1-living) and `registry_note` flags the difference. The
  registry's stated FOR scope for the Gate v2-living is the locked
  cuts 01–05 and Gate scene-ins, so dawn N1/N10 use is a per-use
  question the registry does not settle — recorded, not resolved here.
- **No registry entry (34 cuts):** V3-003, V3-012–016, V3-039, V3-054,
  V3-055, V3-059, V3-061, V3-075–083, V3-084–096 (night plates),
  V3-098 — `registry_current_plate` is `null` and the note says so.
  This covers all Gate/Pond/Green **night** plates, the berry-store
  plates, the board plates, `green-dusk.mp4`, and `shift-039.mp4`.

---

## Conflicts, gaps, and judgement calls

1. **No missing data in the specs.** All 107 spec files exist, all carry
   `background` and `duration_s`, and the durations reconcile exactly
   with the script (1,260 s total; per-scene sums identical). Nothing
   had to be derived or invented.
2. **Locked scenes are aggregate in the script.** S1/S2/S3/S4/S5/ST
   (28 cuts) are written as one VISUAL/ACTION/DIALOGUE block per scene
   in the v3 script, not per cut. Per-cut beats and characters for
   those cuts come from each scene's **cut roster lines** (which are
   per-cut), cross-checked against the aggregate block; the manifest's
   `source_script` for locked cuts anchors to the scene block, not a
   per-cut heading, so this is visible rather than hidden.
3. **The Gate "background" in 9 specs is a composite, not a clean
   plate.** V3-007–011, V3-019, V3-101–103 use
   `EP01-CUT01-composite-life-proof-v1.mp4` as their spec background.
   Per PLATES-REGISTRY §1 that file is the registry-CURRENT Gate
   v2-living — but it is a *composite life proof*, i.e. the living Gate
   with proof content composited, not a bare plate. A generation
   kernel using it as a background risks baking proof content into new
   cuts. Flagged here; plates not changed.
4. **V3-061 eyecatch plate mismatch.** The script's eyecatch is a
   Mochiioteca check-in *graphic* (abstract light and icons over the
   identity palette, no location). The spec backgrounds it with
   `gate-night.mp4`. Recorded as-is; likely a storyboard-spec artefact.
5. **Script §1 vs parts-catalog.json.** The script cites
   `show/shared/parts-catalog.json` for Gate/Pond/Green currency; the
   on-disk parts-catalog contains no plate currency at all. The
   currency that exists lives in PLATES-REGISTRY.md (see above). The
   two sources do not agree on where currency is recorded.
6. **Unattributed smoke (V3-006, V3-097, V3-101) and unseen hands
   (V3-023).** Canon (§0.1 rule 6) makes the frost Wispkin's trace, and
   the episode's logic points at Wispkin for the smoke — but the
   script text for these cuts names no one, so `characters` is empty
   with a note. If the foundry wants these generated as Wispkin cuts,
   that is an owner/canon call, not something this manifest asserts.
7. **Paint and voice are not presence.** V3-075 names Wispkin only in
   fresh paint on the board (no character present — empty list, noted).
   V3-077 and V3-100 are Wispkin intertitle *voice* over cuts whose
   pictures show no character (listed as Wispkin, noted as voice-only).
   V3-002's Hex is a genuine on-screen cameo; V3-098 references Hex
   only by his *absence* at the fence (empty list, noted).
8. **Attribute-named characters.** V3-070 (Kittember via "the tail
   flame FLARES"), V3-081 (Dorowani via "a fin print", Kittember via
   "a tail tip" scorch dot), and V3-085/V3-086 (Wispkin as the night
   round's established performer) list characters the script identifies
   by unambiguous attribute or role rather than by name in that cut.
   Each entry's `characters_note` says so, so the kernel can treat
   them differently from name-explicit cuts if it wants to.
9. **V3-105's entity is unnamed by design.** "Something stops moving"
   in the Forest is script §7 open item 1 — deliberately never named
   or shown. Empty `characters` is the correct, canon-faithful value.
10. **Provisional plates.** Every Pond/Green/Forest plate in the specs
    that matches the registry is a *provisional spec plate* per
    PLATES-REGISTRY.md — correct motion systems, not canon painted
    art. Only the Gate has canon art behind its CURRENT version.
