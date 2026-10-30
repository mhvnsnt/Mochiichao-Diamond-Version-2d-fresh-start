# JOJO CUT GRAMMAR — the cut as a dramatic instrument

**Status:** DRAFT extension pass (2026-10-28), companion to POSING-SYSTEM.md.
POSING-SYSTEM made the *pose* native. This document makes the *cut*
native: the dramatic cut-in, the reaction cut, the split composition,
the speedline cut, the impact cut, and the pose-hold cut — as a
working grammar, then as named cut formats in the show's real xsheet
conventions (TIMING-SYSTEM.md).

**Construction-kit note:** What transfers is grammar — where a cut
lands, how long it holds, what the sound does — rebuilt with
Mochiichao's own cast, plates, and palettes. No JoJo panel
composition, character design, glyph, or specific-scene palette
identity transfers. POSING-SYSTEM §3.5's test applies to every
format here: derivable from the creature's own dossier and body
plan = pass; a copied shape from a JoJo panel = fail.

**Wires into:** POSING-SYSTEM.md (pose-hold cuts, §1.3/§3.3 — cited,
not re-derived), TIMING-SYSTEM.md (xsheet grammar — all encodings
below are written in it), SMEAR-FRAME-GRAMMAR.md (SM-IMPACT and the
bracket law), ENVIRONMENT-AND-CAMERA.md (§6.2 camera vocabulary,
§6.4 prohibitions), LIGHTING-SYSTEM.md §4 (the CS protocol —
LIGHTING shifts: light moves, characters held), COLORWAY-LIBRARY.md
+ `colorway-library.json` (the COLORWAY system — full palette
shifts, characters included, owner ruling 2026-10-28; a cut's colour
event names which of the two systems it belongs to),
296-SONIC-GRAMMAR.md R5
(theme registry — leitmotif statements are episode events).

**Source labelling:** Claims marked **[in-repo]** are documented in
this repo's own teardowns with published citations
(ENVIRONMENT-AND-CAMERA.md §3: ANN Tsuda interview 2015, AV Club
2022, ANN feature 2019; COLOR-SYSTEM.md §4: ANN 2017). Claims
marked **[secondary]** come from published production analysis and
adaptation coverage found in this pass's research — reputable
secondary sources, not primary production documents, and labelled
as such wherever they set a number.

---

## PART 1 — TEARDOWN: the cut types as grammar

JoJo's editing is not decoration on the scene; it is how the scene
*argues*. The manga original is panel rhythm — Araki plans ebb and
flow through panel size and division before looks (his roughs plan
rhythm and beats) **[secondary: review coverage of *Manga in Theory
and Practice*]** — and David Production's adaptation keeps that
rhythm by treating cuts the way the manga treats panels: a cut is a
unit of emphasis, sized to its weight. Six cut types carry the
grammar.

### 1.1 The dramatic cut-in

- **Function:** Interrupt the scene's spatial grammar with a tight
  insert — face, eyes, hand, the telling detail — at the exact beat
  the information or threat lands. The cut-in says *this, now,
  closer than the scene allowed a moment ago*.
- **Composition:** The insert fills the frame; the surrounding
  scene is gone, not blurred. David Production's house style pairs
  cut-ins with freeze frames and snap zooms, and lands them with a
  loud non-diegetic boom in the sound design **[secondary: Steel
  Ball Run adaptation coverage]**. The camera "arrives" at poses
  rather than travelling to them **[in-repo: ENV-AND-CAMERA §3.2]**.
- **Timing:** The insert is short and held — long enough to read as
  a statement, not a glimpse: a held drawing, not a passing frame.
  It is a pose event (POSING-SYSTEM PRESENT class) delivered by
  editing instead of by motion.
- **Sound pairing:** A boom or stinger ON the cut frame, or total
  silence where the boom would be — the two are the same gesture
  (a punctuation mark) at opposite volumes. Music does not ramp
  into a cut-in; the cut-in interrupts the music's world too.

### 1.2 The reaction cut — two forms

- **Function:** Register impact on the witnesses. In JoJo grammar a
  blow, a reveal, or a wrongness is only as large as the faces it
  lands on.
- **Form A — the sequential chain:** one reactor per cut, in
  sequence, each cut a single held reaction. The chain escalates:
  later reactions are tighter, longer, or stranger than earlier
  ones. Suspense lives in the *order*.
- **Form B — the simultaneous split:** several reactors in one
  frame, divided by graphic slashes into panels — all reactions at
  once, compared at a glance. Where Form A stretches time, Form B
  compresses it; the split is the chain with its beats stacked.
  **[secondary: anime editing-conventions references on the
  multi-panel "slash split" reaction vs the sequential single
  reaction chain]**
- **Timing:** Chain cuts run short-to-long (escalation by hold
  length). A split is one held frame-event, read in panel order
  (the divider's geometry sets the reading order).
- **Sound pairing:** Chain: one cue per cut — a gasp-class sound, a
  cry, or silence; the gaps between cues are part of the rhythm.
  Split: a single shared cue on the frame (one boom, one chord) —
  the simultaneity is the point, so the sound refuses to sequence
  what the picture stacked.

### 1.3 The split composition (single frame, divided world)

- **Function:** Two spaces, two scales, or subject + detail held in
  one frame, divided by a graphic diagonal or a proportional
  split. Araki's panel method divides pages by the golden ratio
  and varies panel size to control ebb and flow **[secondary:
  *Manga in Theory and Practice* coverage]** — the division itself
  carries meaning: the larger field is the scene's weight, the
  smaller is its needle.
- **Composition:** A hard graphic division (diagonal slash or a
  clean proportional split), each field fully lit and staged on
  its own terms. Unlike the reaction split (§1.2 Form B), the
  fields need not be faces: a place and a detail, a wide and a
  close, a threat and its target.
- **Timing:** A held composition — it is read, not watched; it
  ends on a cut, never by dissolving the division.
- **Sound pairing:** The larger field owns the bed; the smaller
  field may own one spot sound. No cross-fade of sound across the
  division.

### 1.4 The speedline cut

- **Function:** At peak velocity or peak emphasis, the drawn world
  is replaced by a graphic field: linear speed lines for travel,
  radial focus lines converging on a subject for emphasis or
  reaction. The field is structural — it tells the audience where
  the frame's energy points **[secondary: standard manga/anime
  graphic-convention references]**.
- **Composition:** Linear: lines parallel to the motion vector,
  the moving form held or smearing inside them (house device:
  SMEAR-FRAME-GRAMMAR SM-STRETCH / SM-TRAIL — the trail dresses a
  form *inside a place*; the speedline field *replaces* the
  place, which is why the house rations it, §2.3). Radial: lines
  converge on the subject's face or motif; the subject is held
  dead still — the lines do the shouting.
- **Timing:** Short. A field that outstays its beat becomes a
  place, and a graphic field is not a place. Radial emphasis runs
  shorter than linear travel.
- **Sound pairing:** Linear: a whoosh family spot on the peak
  frame (SMEAR HR5 — no silent smears). Radial: a swell or a
  drop-out under the held subject; the stillness + swelling sound
  is the emphasis.

### 1.5 The impact cut

- **Function:** The contact beat, promoted out of the motion into
  its own graphic event: one to three frames of high-contrast,
  inverted, or monochrome flash art at the moment of impact —
  the beat the audience remembers **[secondary: production
  analysis consensus on impact frames]**. House law already owns
  the device at frame level (SM-IMPACT, 1–2f, SMEAR-FRAME-GRAMMAR
  §2.1); this grammar owns its promotion to *cut* level, where the
  flash replaces the shot rather than interrupting it.
- **Composition:** Full-frame graphic: inverted values, a held
  colour field, or silhouette against field. The striking form's
  motif survives inside it (SMEAR HR1).
- **Timing:** 1–2f by house budget (SM-IMPACT). Secondary sources
  describe up to 3f in the source grammar; the house number
  governs — the difference is recorded here, not silently
  widened. Bracketed per SMEAR HR3: clean anticipation ≥2f
  before, clean settle ≥3f after, in the neighbouring cuts.
- **Sound pairing:** The hit's spot lands ON the flash frame;
  frequently the bed drops out for the flash and returns on the
  settle — impact reads in the ears as a hole in the music.

### 1.6 The pose-hold cut

- **Function:** The scene stops moving so a stance can be *read*.
  Fully specified in POSING-SYSTEM §1.3/§3.3 and not re-derived
  here: a pose-hold is a THREE-LAYER event — picture freezes,
  colour re-keys, sound swells or drops out — staged on the
  PRESENT pose classes (REVEAL / TENSION / JOY / MENACE) with
  their hold budgets (REVEAL 12–24f).
- **What this grammar adds:** the hold's place in the *cut
  sequence* — it is the full stop the other five cut types are
  commas around. A cut-in (§1.1) delivers the pose; the hold
  keeps it; the release is a PUNCH-IN or a slow PUSH, never a
  plain cut (ENVIRONMENT-AND-CAMERA §6.2, HOLD-TENSION release
  law). The colour layer of the hold belongs to one of the two
  colour systems, and the board names which: a LIGHTING re-key
  (CS protocol, LIGHTING-SYSTEM §4 — the light changes, the
  palettes hold) or a COLORWAY (COLORWAY-LIBRARY — the palettes
  themselves shift, characters included, and snap back).

### 1.7 Sound pairing — the grammar as a whole

| Gesture | Sound |
|---|---|
| Cut lands (cut-in, split draws on, menace registers) | Boom / stinger ON the frame, or its mirror: total drop-out |
| Hold (pose-hold, split composition) | Swell, or silence held as long as the picture |
| Impact | Spot on the flash frame; bed drops out, returns on settle |
| Speed | Whoosh family on the peak frame (SMEAR HR5) |
| Reaction chain | One cue per cut; gaps are rhythm |
| Hero beat | A theme's statement or variant (296 R5 — themes are episode events, never wallpaper) |

House voice law binds every row: creatures speak in cries and
sounds only — a reaction cue for a creature is a cry, never a
word; humans carry speech. The graphic word-effect layer of the
source grammar is already nativised in POSING-SYSTEM (motif
drift at frame edges, scene-lit, always moving) — no glyph
system is imported by this document.

---

## PART 2 — THE NATIVE CUT LIBRARY

Named cut formats in TIMING-SYSTEM xsheet conventions: 24 fps;
columns FG / CHAR:<name> / FX / AMB:<element> / POP / BG / CAM /
AUDIO (audio is the spine); holds written `H▸<drawing>` with frame
ranges; motion in ONES/TWOS/THREES segments; events anchored
`@<seconds>s / f<frame>`; smear devices in SMEAR bracket notation.
CAM values are the ENVIRONMENT-AND-CAMERA §6.2 vocabulary.

**Lane key:** **PUPPET** = executable today in the Tahoma2D puppet
lane from the existing rig/cutout library. **COMPOSITE** =
executable today at the composite stage from puppet-lane renders
and plates. **GENERATIVE** = needs drawings the library does not
hold (the sheets audit: no ¾ views at show res for any of the
seven; several angle gaps per character) — routed to the
generative lane or the hand keyframe stage, never faked from a
flip or a redraw.

### CUT-IN-INSERT — the dramatic cut-in

- **Use:** A reveal's needle, a menace's first registration, the
  detail the scene turns on (an eye change, a hand, a motif).
- **Shape:** Hard cut to a tight insert, held 6–18f, staged on a
  PRESENT-class pose or detail drawing; exits on a hard cut back
  or into CUT-HOLD-PRESENT.
- **Xsheet:** One cut. `CHAR:<name>` holds the insert drawing for
  the full range; CAM is `PUNCH-IN → [pose name]` when the insert
  is a pose landing (the punch lands ON the completed pose), or
  LOCKED for a pure detail insert. AUDIO: boom spot or drop-out
  anchored on f<first>.
- **Colour:** The insert may carry a colour event of either
  system: a CS lighting shift (CS-3(i)/(ii), logged on the
  lighting sheet, counts toward CS-5) or a colorway (a reveal
  or menace beat under the CW grammar — CW-B6/CW-B1 — logged in
  the scene's colour-design record, snapping back on its ending
  cut). The board names the system; the two never blend.
- **Lane:** PUPPET (insert framings exist in the cutout library at
  closer scale) + COMPOSITE (the punch is a composite move).

```
CUT 09  CUT-IN-INSERT  f193–210 (18f)
  CHAR:Wispkin  f193–210 H▸mask_tilt_wrongness
  CAM           PUNCH-IN → wrongness_still
  AUDIO         f193 boom spot; bed drop-out f193–198
```

### CUT-REACT-CHAIN — the sequential reaction

- **Use:** A beat lands on the group; the audience reads it face
  by face, in escalating order.
- **Shape:** 2–4 consecutive single-actor cuts, holds escalating
  (e.g. 8f → 12f → 20f); each reactor in a distinct PRESENT or
  expression state (320-FACE-EXPRESSION + POSING §3.4 library).
- **Xsheet:** One cut per reactor, in chain order; AUDIO carries
  exactly one cue per cut (cry, gasp-class SFX, or marked silence
  `— rest`), SUB marks only where the subtitle law is met.
- **Colour:** The chain as a whole may carry ONE colour state
  per system — one CS lighting shift (CS-5 counts it) and/or one
  colorway state for the beat — never a new state per reactor:
  a shift per face would spend the beat's force on punctuation.
  A colorway, if used, fires on the chain's first cut and snaps
  back on the cut that ends the beat, so every reactor is read
  inside the same shifted world.
- **Lane:** PUPPET, today.

### CUT-REACT-SPLIT — the simultaneous reaction

- **Use:** The same beat, all witnesses at once — comparison is
  the meaning (the brave one, the scared one, the one who
  *doesn't* react).
- **Shape:** One frame-event, 12–24f held, 2–3 panels divided by
  a graphic diagonal; each panel a held reaction drawing; reading
  order follows the divider (upper-left first in house staging).
  The divider draws on in 2f, then holds — the draw-on is the
  cut's only motion.
- **Xsheet:** One cut; one `CHAR:` column per panel actor, each
  holding its reaction for the full range; FX carries the divider
  (`f<a>–<a+1>` draw-on, then `H▸divider`); CAM LOCKED (a split is
  a composite event, not a camera move); AUDIO: ONE shared cue on
  f<first> — no per-panel sequencing.
- **Ration (house setting, set by this spec):** ≤1 per segment.
  A split spends its force by stacking; two in a segment flatten
  each other.
- **Lane:** COMPOSITE assembly of PUPPET renders — today.

```
CUT 14  CUT-REACT-SPLIT  f337–360 (24f)
  CHAR:Mochii    f337–360 H▸react_startle      (panel A, upper-left)
  CHAR:Dorowani  f337–360 H▸brace_guard        (panel B, lower-right)
  FX             f337–338 divider draw-on; f339–360 H▸divider
  CAM            LOCKED
  AUDIO          f337 single boom spot; cries ordered A then B, not simultaneous
```

### CUT-SPLIT-FRAME — the divided composition

- **Use:** Two truths in one frame: the place and the thing in
  it, the watcher and the watched, before and after.
- **Shape:** One held composition (12f minimum — it is read, not
  watched), divided diagonally or by golden-ratio proportion
  (≈1 : 1.618, larger field = the scene's weight); each field
  staged and lit on its own terms; ends on a hard cut.
- **Xsheet:** One cut; columns split by field (field membership
  noted per column entry); CAM LOCKED; AUDIO: bed belongs to the
  larger field; the smaller field may hold one spot.
- **Discipline:** The division is geometry, and geometry
  transfers; the fields' contents are Mochiichao staging under
  POSING §3.5. A division that quotes a specific source panel's
  arrangement of subjects fails §3.5 like any copied shape.
- **Lane:** COMPOSITE — today.

### CUT-SPEED-LINEAR — the speedline field

- **Use:** Peak travel: a dash, a lunge, a thrown arc — the
  moment speed matters more than place.
- **Shape:** BG is replaced by a linear speed field for 6–24f;
  the moving form inside it is held, cycling, or smearing under
  SMEAR devices (SM-STRETCH at peak, SM-TRAIL as dressing where
  the form still touches a place at entry/exit). Bracket law
  (SMEAR HR3) binds across the cut boundary: clean anticipation
  in the preceding cut, clean settle in the following one.
- **Xsheet:** BG reads `— speed field (FX-driven)`; FX carries
  the field with its frame range; CHAR carries the form; AUDIO:
  whoosh spot on the peak frame (SMEAR HR5).
- **Ration (house law, already set):** ENVIRONMENT-AND-CAMERA
  §6.4 confines abstract effect fields to the genuine
  stock-action class — this format lives inside action beats
  only, ≤1 per action beat, and NEVER in the Dark Forest
  (STILL-FOREST: the Forest's grammar is the field's opposite)
  or at the Pond (stillness is the Pond's capital; its emphasis
  device is the ripple, COLOR-SYSTEM §d).
- **Rate variant — CUT-SPEED-SLO:** the same field at reduced
  rate: a TWOS segment re-timed to held sub-frames for a
  slow-motion rush read. Puppet cycles re-time today; a drawn
  rush that does not exist as drawings is GENERATIVE.
- **Lane:** COMPOSITE (field + assembly) over PUPPET forms —
  today, inside the ration above.

### CUT-SPEED-RADIAL — the focus-line emphasis

- **Use:** A reaction or realisation, amplified: the world
  points at one face.
- **Shape:** Radial focus lines converge on the subject, 4–12f;
  the subject is a held drawing (an expression state, not a
  pose in motion); lines live in FX as a graphic overlay and
  take the scene's light like every graphic element in the
  house's nativised glyph discipline (POSING-SYSTEM motif law:
  graphic layers are scene-lit and never float above the
  scene's grade).
- **Xsheet:** FX carries `radial field → <subject>` with frame
  range; CHAR holds the expression; CAM LOCKED or a slow PUSH
  (never PUNCH-IN — the lines are the punch); AUDIO: swell or
  drop-out anchored f<first>.
- **Ration (house setting, set by this spec):** ≤2 per episode.
  Radial emphasis is a shout; the show's normal voice is a held
  pose.
- **Lane:** COMPOSITE — today.

### CUT-IMPACT — the impact cut

- **Use:** The contact beat the sequence is remembered by: a
  hit, a block, the lunge that misses (EP01 beat-4 class).
- **Shape:** SM-IMPACT promoted to a cut: 1–2f of full-frame
  graphic (value inversion, monochrome, or a held colour
  field), bracketed by clean anticipation in the prior cut
  (≥2f) and clean settle in the next (≥3f) — SMEAR HR3/HR4
  bind unchanged (≤1 SM-IMPACT per action beat).
- **Xsheet:** Its own cut of 1–2f; CHAR/FX carry the graphic
  frame with device code `SM-IMPACT`; AUDIO: hit spot ON the
  flash frame; bed drop-out across the flash, return on the
  settle's first frame.
- **Colour discipline (three systems, no double-counting):**
  a pure value-inversion or monochrome flash is an SM device —
  not a colour event at all. If the flash is a LIGHTING grade
  (a grade family, an expressive grade of light), it is a CS
  event: CS-3 trigger, lighting sheet, CS-5 ration. If the
  flash is a palette field (characters' colours themselves
  flash-shifted), it is a COLORWAY event under the CW grammar
  (a CW-B3/CW-B5-class beat), logged in the colour-design
  record; at 1–2f its snap-back is its own brevity. The board
  states which of the three it is; silence on the point fails
  the gate.
- **Lane:** COMPOSITE (LS-7 overlay — removable to base
  exactly) — today.

### CUT-HOLD-PRESENT — the pose-hold cut

- **Use:** The full stop. A PRESENT-class pose held as the
  scene's statement (POSING-SYSTEM §3.3/§3.4 pose library:
  `present_reveal`, `brace_guard`, `bloom_joy`,
  `wrongness_still`, `post_default`, `aftermath_hold`).
- **Shape:** Per POSING-SYSTEM §1.3: three layers together —
  picture holds (12–24f for REVEAL class; other classes per
  §3.3), colour re-keys, sound swells or drops out. CAM is
  HOLD-TENSION (the board counts the hold's seconds); release
  is PUNCH-IN or slow PUSH, never a plain cut.
- **Xsheet:** `CHAR:<name>` holds the pose drawing for the
  full range; the colour layer is written on the lighting
  sheet, not the xsheet (LIGHTING-SYSTEM §8.1 SHIFT field,
  with its CS-3 trigger and CS-6 release); AUDIO anchors the
  swell/drop-out at f<first> and its release at the release
  frame.
- **Colour:** The re-key is one of the two systems, named on
  the board: a CS lighting re-key (lighting sheet, CS-3
  trigger, CS-6 release) or a colorway (a recipe id or a
  logged run of the CW decision procedure, under CW-B1/B4/B6
  as the beat falls; snap-back on the hold's release cut).
  Neither named, no re-key — a hold may still freeze picture
  and sound alone (two layers is lawful; the third layer is a
  named system or nothing).
- **Lane:** PUPPET — today.

### CUT-HERO-WARP — the bent-perspective hero cut [GENERATIVE]

- **Use:** The ceiling beat: perspective bent for drama, a
  form oversized in the foreground against its own scene —
  the source grammar's cavalier perspective, kept for choice
  moments **[in-repo: ENV-AND-CAMERA §3.2]**.
- **Why it is not executable today:** it needs drawings at
  angles and scales the library does not hold — the sheets
  audit records no ¾ views at show res for any of the seven
  characters, and a warped hero framing cannot be assembled
  from flat cutouts without becoming a redraw (which the
  likeness law forbids presenting as the character). Route:
  generative lane with frame-1 + likeness gates, or the hand
  keyframe stage when a warped drawing is authored into the
  library — at which point this format's lane re-marks to
  PUPPET for that character. It is never executed as a flipped,
  stretched, or re-proportioned existing cutout.
- **Sound pairing (when it runs):** boom on the cut frame +
  a theme statement (296 R5) — the format is rationed by its
  cost, ≤1 per episode (house setting, set by this spec).
- **Lane:** GENERATIVE — later.

### 2.3 Ration & prohibition summary (all sources named)

| Format | Cap / ban | Source |
|---|---|---|
| CUT-REACT-SPLIT | ≤1 per segment | house setting, this spec |
| CUT-SPEED-RADIAL | ≤2 per episode | house setting, this spec |
| CUT-HERO-WARP | ≤1 per episode | house setting, this spec |
| CUT-SPEED-LINEAR | action beats only, ≤1 per beat | ENV-AND-CAMERA §6.4 + SMEAR HR4 |
| SM-IMPACT inside any format | ≤1 per action beat | SMEAR HR4 |
| Hard CS lighting shifts on any cut | ≤2 per segment, CS-3 trigger logged | LIGHTING CS-5 |
| Colorway states | one per beat; a new state needs a new beat (CW-B1..B6) | COLORWAY-LIBRARY §2.5 |
| PUNCH-IN / CUT-IN by punch | banned at the Pond and in the Forest | ENV-AND-CAMERA §6.4 |
| All speed fields, splits, cut-ins | banned in the Dark Forest (camera does not enter; no close-ups) | ENV-AND-CAMERA §6.1 |
| Colourways at the Garden Gate | banned outright (the Gate never shifts) | COLOR-SYSTEM §d |

**Forest inversions (the grammar read backwards):** the
Forest's reaction cut is the held wide plus the motif STOP
(POSING-SYSTEM Forest law — the stop is the reaction); its
impact cut is the one scripted leaf falling straight down (FX,
exactly one non-looping event, TIMING-SYSTEM Forest rule); its
emphasis is a drop-out with nothing under it. A board that
reaches for any format in the table's Forest row has failed
the Forest's whole design: dread by stillness.

**Pond inversions:** CUT-IN-INSERT at the Pond arrives by slow
PUSH, never PUNCH-IN; emphasis is carried by ripple-carried
grade (colorway `cw-pond-ripple-grade`) instead of radial
lines; reaction chains run at the Pond's breathing pace —
holds lengthen, cues soften.

---

## PART 3 — WHAT THIS PASS DID NOT DO

- Colour bookkeeping (owner ruling 2026-10-28): this grammar
  uses TWO colour systems and never blends them — CS lighting
  shifts (LIGHTING-SYSTEM §4, closed CS-3 list, characters
  held) and COLORWAYS (COLORWAY-LIBRARY: full palette shifts,
  characters included, decided by the researched JoJo
  emotion-first method under its own CW beat grammar). The
  earlier draft of this pass routed all colour through CS;
  the owner corrected that the same day — the tint law governs
  light, not palettes. Needs neither system covers (comedy
  colorways, flashback base palettes, the TK-6 pairing,
  arc re-skins) are OWNER SLOTS in COLORWAY-LIBRARY.md §5.
- No new poses: the hold and reaction formats consume
  POSING-SYSTEM §3.4 and 320-FACE-EXPRESSION as they stand.
- No hex values: colourway data is relationships over named
  keys and families; the garden's grade-family hex anchors
  remain LIGHTING-SYSTEM §10's open sampling item, and the
  library's anchor fields stay named slots until that
  sampling lands.

*Draft status: extension pass for owner review, landed beside
POSING-SYSTEM. Companion data: `colorway-library.json`;
companion doc: COLORWAY-LIBRARY.md.*
