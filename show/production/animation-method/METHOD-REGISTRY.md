# METHOD REGISTRY — which animation method is usable, right now

**READ THIS FIRST.** This file is the single place that says which
animation method is the usable one for the Mochiichao show. Before
building, rigging, or animating anything, an agent checks this
registry and uses the method marked **CURRENT / USABLE**. Using a
superseded method — silently, or because it was the one in an old
file — is a regression and an error, the same class as building on
a superseded asset under the current-version law.

---

## ⬛ CURRENT / USABLE METHOD

### The Industry Method — v1.3 (2026-10-28)

- **The method:** the Industry Method v1.2 (construction core +
  timing layer + above-floor layer + the likeness gate, folded in
  unchanged, below) **plus the generated-turnaround route** for
  generated character animation:
  `GENERATED-TURNAROUND-PIPELINE.md` in this folder. The route:
  DIAGNOSE (the 20-point structural defect audit run as data
  against the input art) → TURNAROUND (a corrected multi-angle
  sheet generated under a design-inventory prompt built from the
  character's canon record) → ANIMATE (image-to-video from the
  corrected sheet's side-profile cell, on the landed scene-job
  format v2 and its wired path) → EXPORT (frame slicing +
  sprite-sheet packing for game use) → GATES (frame-1 check,
  timing profile, likeness against the corrected sheet, grading
  law, and a diagnosis re-run of the finished frames).
- **Currency, per use (upgrade rule 3 — the standing assignment,
  written here so it is never a quiet fallback):** for GENERATED
  character animation, the v1.3 turnaround route is the
  CURRENT / USABLE method. For DRAWN proofs (part-separated
  puppets, substitution drawings), v1.2's drawn route remains
  CURRENT for that use — it is not superseded there; the two
  routes serve different production kinds and neither substitutes
  for the other.
- **Per-use note (added 2026-10-28, at the Flow Composite
  landing):** for EP01 *video generation* (production /
  previsualisation), the Flow Composite Pipeline registered
  below is CURRENT by owner ruling. This v1.3 route remains the
  CURRENT **shippable-master** path — Flow output carries an
  unresolved commercial-rights label, and the same frames are
  re-taken on this route when a shipping master is needed. The
  two registrations state which is which; neither is a quiet
  fallback for the other.
- **What is wired vs spec, stated up front:** the animate step
  runs on the landed scene-job format v2; the diagnosis checklist
  ships as data on the parity lane's wired Qwen2.5-VL contract
  (first dedicated diagnosis run still owed); the export packer
  is landed working code with a passing self-test. The
  TURNAROUND generation step itself is SPEC: the landed format
  has no image-to-image job type and no driver consumes one —
  the gap is flagged in the pipeline doc and inside the emitted
  job. The free generation stack's likeness status remains
  UNPROVEN (the baseline plain-I2V FAIL stands); v1.3 adopts the
  route as the method of record on the owner's order and does
  not upgrade that proof claim.
- **Standing gates unchanged:** the timing standard and the
  likeness gate apply to generated clips exactly as to drawn
  ones, including the delivery requirement (likeness judgment
  stated before any measured axis). Gate 8 (the owner's eye)
  remains the final gate, and the grading law stands: wrong
  character = FAIL, full stop.
- **The evidence for the route:** the owner's reference clip
  (2026-10-28; generated on Google's hosted endpoint — PAID,
  recorded as paid; reference evidence only, not canon, not a
  deliverable): a true profile walk generated from Mochiko's
  front canon art, passing the 20-point audit's view items,
  with its design deviations recorded (single ponytail vs canon
  twin tails; jar contents morphing; line thinner than canon).
  Full measured record: the pipeline doc's REFERENCE BAR
  section. The route's own first gated run is still owed.
- **Supersedes:** the Industry Method v1.2 **as the standalone
  current entry** — v1.2 is folded into v1.3 unchanged; its
  drawn route carries the per-use currency stated above.

### The Flow Composite Pipeline — CURRENT for EP01 video generation (2026-10-28)

- **The method:** `show/production/FLOW-COMPOSITE-PIPELINE.md` —
  build the start frame locally from real repo assets only (the
  performer's canon pack cutout — or a candidate-sheet panel
  crop for a posed beat — composited at scene scale onto the
  scene's real plate, contact shadow added at composite), then
  image-to-video in Google Flow (Veo 3.1 Lite, 16:9, 8-second
  segments, chained from the last frame for longer beats) under
  one plain action sentence + the locked prompt tail, then a
  mandatory per-clip frame gate (first / middle / last frames)
  against the performer's pack do-not-change list.
- **Currency, per use:** CURRENT / USABLE for **EP01 video
  generation — production and previsualisation** — by owner
  ruling (2026-10-28, on viewing the V3-005 proof clip in chat:
  in his judgment the likeness and the background were perfect,
  and the rest of the episode is to be generated with this
  method, piece by piece where that is faster). This entry does
  **not** supersede the Industry Method: the v1.3 route above
  remains CURRENT as the **shippable-master** path.
- **The rights label (binding):** Flow's commercial rights over
  its output are UNCLEAR at source (SynthID). Flow clips are
  therefore production/previsualisation masters-in-waiting, NOT
  cleared shipping masters. The shippable-master question stays
  open until the rights question resolves or the Wan locked path
  re-takes the same frames. Any manifest carrying a Flow clip
  carries this label with it.
- **The evidence:** the V3-005 proof, executed 2026-10-28 —
  composite start frame + Flow clip (8.0 s, 1280×720, 24 fps)
  landed at `show/episodes/EP01/animatic/EP01-V3-005-flow-composite-*`
  with sha256s recorded in the pipeline doc. Frame check:
  character and action held for the front stretch; the finish
  drifted (profile turn + an invented long tail) — the drift is
  recorded in the pipeline doc, and the per-clip gate stands
  exactly because of it: pipeline adoption is not a gate waiver.
  The owner's ruling is the final gate on the proof clip itself
  (Gate 8) and supersedes the checker's grade on it.
- **Multi-character beats** under this pipeline follow the
  owner-locked isolation workflow (per-character generation →
  cutout → overlay on the shared plate → post), as written in
  the pipeline doc and `PRODUCTION-PATTERN.md`.

### Method reference — Free-Stack Production Notes (registered 2026-10-28)

- **The reference:** `docs/FREE-STACK-PRODUCTION-NOTES.md` — the
  consolidated production-method notes from the 2026-10-28 industry
  reverse-engineering pass: cut-out composite order (satsuei),
  VACE-first likeness rules and research bands, timing/exposure
  practice, the free clean-up path, pass-through hierarchy,
  composite-shadow technique + iroshitei discipline, the viseme
  chart, multiplane, isolated generative multi-character work,
  reference-lock ranking, palette wiring, and local cutout tools —
  with its corrections section (no IP-Adapter on the Wan stack —
  VACE is the lock; the two-lane LoRA picture) and tool licence
  labels (Resolve free tier = free proprietary).
- **Status:** registered as a CURRENT method reference. It supports
  the Industry Method above; it does not supersede it and changes
  no gate. Where a note and the current method ever differ, the
  current method governs and the difference gets logged.
- Paid tools appear in the notes as method references only; every
  item is executable on the free stack.

### Method reference — Canon visual, colour and posing systems (registered 2026-10-28)

- **The references:** the standing systems the current methods
  build against, registered here so a builder finds them from
  the registry instead of by memory:
  - `show/bible/LIGHTING-SYSTEM.md` — the lighting system
    (draft v1, owner review): the owner's seven laws carried
    from his cape-jones lighting canon, named keys per
    location × time, the colour-shift protocol, takeover
    sources, the per-scene lighting sheet + gate (§8), and
    the real-world source looks + character-sheet lighting
    layer (§11, added by the 2026-10-28 canon & craft sweep).
  - `show/bible/COLOR-SYSTEM.md` — Colour System v2 (draft):
    species colourways (Dominant + Accent + Ink), the Lustre
    Law for variants, ensemble + location colour scripts,
    the COLOUR GATE, and the locked chart's physical homes.
  - `show/bible/REPAINT-PROTOCOL.md` — per-scene repaints
    (owner ruling, 2026-10-27): the light-repaint and
    lustre-repaint engines, and the protected anchors
    neither engine may move.
  - `show/production/POSING-SYSTEM.md` — the JoJo posing
    language + Stand-and-user staging grammar with its
    native Part 3 (pose vocabulary per creature type,
    creature + keeper pairing, rig pose-library additions).
    Research draft; the standing reference for posing and
    battle staging.
  - `show/production/battle/ACTION-SEQUENCE-GRAMMAR.md` —
    the build order that sequences the battle library
    (spectacle doctrine + per-family dialects, signatures,
    posing, smear/timing, intros, animscripts) into one
    episode-facing path.
  - The ED machinery: the ED-CREDITS STANDARD below +
    `show/production/animation-method/YU-YU-HAKUSHO-ENDING-STUDY.md`
    §5, consumed by EP01's build through
    `show/episodes/EP01/timing/EP01-ED-PRODUCTION-PATH.md`
    (the assembly spec + production path for the ED slot).
- **Status:** registered as standing references. They support
  the current methods and supersede nothing. Two are
  load-bearing in gates by name: the lighting sheet + §8.2
  checks are gate inputs in the Flow Composite Pipeline and
  the Unified Pipeline (recorded in those docs). Where a
  reference and a current method ever differ, the current
  method governs and the difference gets logged.
- **The consumption rule (owner, 2026-10-28):** a written
  system counts as done only when an episode build consumes
  it — cited by name in an episode's build files or embodied
  in a build artifact. "We wrote it" is not a finished state.
  Episode build packages name their governing systems (the
  EP01 GENERATION-PACKAGE pattern); the canon & craft sweep
  of 2026-10-28 (`show/production/CANON-CRAFT-SWEEP-2026-10-28.md`)
  carries the written-vs-wired coverage table for the whole
  corpus.

### Method reference — Rig-and-sheet standard (registered 2026-10-30)

- **The reference:** `show/production/rigs/RIG-AND-SHEET-SPEC.md`
  — the donor-measured standard for model sheets (§1, incl.
  the two §1c height charts: principal and secondary casts are
  separate charts), palette sheets (§2: base swatches as CMYK
  percentages in the Dominant/Support/Accent/Ink discipline,
  sanctioned 50%/75% tints, variants as delta blocks), puppet
  construction (§3: root stack, four-piece masked eye system,
  mouth as a frame-chart symbol, pose-frame limbs + torso_move,
  view-code part naming, part-per-file linked libraries, the
  locked SHARED hands library, overlap skirts), and the
  compositing glue gate (§4). Measured from real production
  files; per-source record in
  `show/production/rigs/DONOR-PROVENANCE-2026-10-29.md`.
  Landed via PR #145 (2026-10-30).
- **Implemented in code:** BlairWitch (`mhvnsnt/BlairWitch`,
  v0.3.0, PR #1) emits and validates this standard —
  palette engine, sheet generator, rig scaffold, puppet
  packages, and the palette-format / part-naming /
  hands-library validator checks. Sheets and rigs produced
  for any current method are produced with that tool, in
  this format.
- **Status:** registered as a CURRENT method reference. It
  supports the Industry Method (whose sheet generation this
  format governs); it supersedes no method and changes no
  gate. The per-cast build-out the spec enables (human model
  sheets, pilot-six §2 palette sheets, the height charts, the
  shared hands library) is tracked in the spec's §6 gap list.
- **Cast artifacts:** the build-out this reference pointed at
  has landed (PR #35, 2026-10-30) and is registered CURRENT in
  `show/production/rigs/README.md` and
  `show/production/tooling/TOOLING-INDEX.md`: human model
  sheets (`show/production/model-sheets/humans/`), §2 palette
  files (`show/production/model-sheets/palettes/`), the two
  §1c height charts, and the SHARED hands library v1
  (`show/production/rigs/SHARED/hands/`). The owed pieces are
  registered as owed in those registrations (¾ turnarounds
  ×3, expression sets with gate H-2 NOT PASS, hands v2 poses,
  Lustre palette deltas). This reference registers the
  format's artifacts; it re-marks no method and changes no
  gate.

### Method reference — Harmony + settei addendum (registered 2026-10-30)

- **The reference:** `show/production/rigs/HARMONY-AND-SETTEI-ADDENDUM-2026-10-30.md`
  — the CURRENT extension of the rig-and-sheet standard,
  landed via PR #34 (2026-10-30): the Harmony node-graph
  construction profile (master peg, region composites, curve
  deformers, cutter pairs; measured hero-vs-standard
  budgets), angle-coded substitution charts (F/3Q/P/PQB;
  mouths at the measured 44-48; hero hand charts 105/107),
  the .plt palette discipline (LINKed single source; `rig`
  alpha-0 and `Cutter` matte functional colours), the settei
  five-section model-pack completeness standard, and the
  design & cleanup rules (universal line weight,
  body-under-clothes construction, mouth discipline) that
  map onto defects already logged in this pipeline.
- **Implemented in code:** BlairWitch v0.4.0
  (`mhvnsnt/BlairWitch`, PR #2) — the `blairwitch.harmony`
  scaffold + validators behind the `construction="harmony"`
  rig/puppet profile, the settei model-pack
  builder/validator, and the cleanup-rule sheet checks in
  the puppet validator.
- **Status:** registered as a CURRENT method reference
  alongside the base rig-and-sheet standard. It extends that
  standard for Harmony-profile construction and pack
  completeness; it supersedes no method and changes no gate.

### Remainders-pass registrations — 2026-10-28 (documentation landing package)

Applied from `method-registry-update.md` in the 2026-10-28
documentation landing package (the update doc itself is not
landed as a file; these entries are its application). Existing
entries above are unchanged; nothing here supersedes the
Industry Method entries or the Flow Composite Pipeline.

- **Movement-identity method v1 — CURRENT / USABLE.**
  Whole-form animation: per-character movement-identity specs
  (movement/specs/), a deformation channel in the renderer
  (mesh warp + spring/Verlet jiggle layer), continuous sheet
  tracks (idle / material / pose / face / FX / ambient — an empty
  idle or ambient track fails schema), banked idle cycles, and
  the G0–G6 motion gates measured from pixels.
  SUPERSEDES: the face-only performance method (event cue sheet +
  facial substitution sets on a rigid body) — measured below the
  Pokémon GAME floor by the movement-identity research; its
  calibration master is not to be built on for character shots.
  Calibration of record: CALIB-03 (movement/proof/).
- **Kage layer system v1 — CURRENT / USABLE** (gap G10).
  Per-pose shadow/highlight as separate banked layers
  (pipeline/kage_layers.py; bank manifest carries source hashes),
  colours derived per light variant from the settei colour models
  (dark/light slots picked by luminance — slot order differs per
  character), seated in the satsuei composite step as stage 2.5.
  Enforces the no-baked-shadows rule by construction.
- **Blender blocking seat v1 — CURRENT / USABLE** (gap G17).
  Rough 3D blockout generated from the cut's own X-sheet
  (pipeline/blender_blocking.py + blocking_stage.py), pipeline
  step 1.5, per-cut on request (`--blocking`). Blender 4.0.2,
  GPL-2+. Answers staging/camera questions before 2D drawing.
- **Episode board v1 — CURRENT / USABLE** (gap G16).
  Cut-rhythm measurement over X-sheets and spec sets
  (pipeline/episode_board.py): durations, distribution,
  cuts/min, read against the TV reference (~4.2s average cut).
- **OpenToonz headless seat — CURRENT / USABLE.**
  Headless scene authoring via `.toonzscript` + tcomposer render,
  both under the fixed bus recipe (system bus + session bus on a
  workspace XDG_RUNTIME_DIR + xvfb-run; pipeline/opentoonz_smoke.sh).
  Two production gotchas now on record: scene paths to tcomposer
  must be ABSOLUTE and inside a project folder; levels must use
  NUMBERED frame files (gate.0001.png) — an unnumbered PNG loads
  with an empty frame id and cells draw nothing.
  SUPERSEDES: "OpenToonz cannot run headless here (no session
  bus)" — that blocker is fixed and the fix is the recipe above.

**Standing notes (from the same update):**

- Industry Method v1 remains CURRENT for drawn-workflow
  discipline (X-sheet truth, timing rules, sakkan loop).
- The VACE/ComfyUI route for canon characters remains UNTESTED
  (attempt 2 produced no clip — workflow validation errors, since
  fixed in the re-run package; attempt 3 is the first real test).
  Single-frame image-to-video for canon characters is CLOSED
  (2-for-2 frame-1 anchoring failures) — do not re-open it as a
  method.

## ⬛ SUPERSEDED — DO NOT USE

### The Industry Method — v1.2 (2026-10-28)

**Re-marked 2026-10-28, at the v1.3 landing:** v1.2 is folded
into v1.3 as its construction + timing + above-floor core.
Standalone v1.2 is **DO NOT USE for generated character
animation** — that work runs the v1.3 turnaround route. Per the
per-use currency stated in the v1.3 block, v1.2's DRAWN route
remains the CURRENT route for drawn proofs: a written assignment
under upgrade rule 3, not a quiet fallback.


- **The method:** the Industry Method v1.1 (construction core +
  timing layer, below) **plus the above-floor layer**:
  `ABOVE-THE-FLOOR-RESEARCH.md` in this folder, and three wired
  requirements —
  1. **Beat maps are artefacts, not intentions.** A scored
     piece's timing chart cites a measured beat map of its actual
     bed. The first one is landed:
     `show/episodes/EP01/timing/EP01-ED-BEAT-MAP.json` (the EP01
     ED bed measured: 144.0 pulses/min, first pulse 0.009 s,
     10 frames per pulse at the 24 fps master; the distant bell
     at ED 60.000 s template-verified at exactly 60.00000 s,
     rank 1 — gap 18's first artefact, closed).
  2. **Chart-conformance is a gate.** Charts are written in
     `mochiichao/timing-chart/v1` and a rendered clip is checked
     against its chart with the checker
     (`verify_proof.py --chart`): charted accents and contacts
     answered within ±2 frames, charted line holds empty of
     changes, deviations reported by frame number. The checker
     still reports only; it never grades.
  3. **Design targets sit ABOVE the floors.** The floors in
     `TIMING-STANDARD.md` remain the minimum. Charted work is
     designed above them: the EP01 ED gag chart set
     (`show/episodes/EP01/timing/EP01-ED-GAG-ABOVE-FLOOR-CHART.json`)
     carries 169 drawing-change frames in 336 = **12.07
     drawing-changes/sec** of charted structure, personality
     beats held ≥ 0.5 s, contacts on the beat grid, and its
     largest accent on the bell (gag frame 96). A chart that
     merely reaches a floor is sent back at chart stage, before
     anything is drawn.
- **Standing delivery requirement — the likeness gate
  (added 2026-10-28; a gate addition under v1.2, not a new
  method version — see the change log).** No character clip
  is delivered to the owner without: (i) the canon
  reference's path + sha256 logged in the run record;
  (ii) a side-by-side comparison sheet produced, its path
  recorded in the same record; (iii) the delivery stating
  the likeness judgment in plain words **before** any
  measured axis (drawings/sec, conformance, anything else)
  is mentioned. The checker supports it:
  `verify_proof.py --likeness <canon-reference>` (in
  `show/production/tooling/proof-gate/`) reports per-frame
  similarity diagnostics against the reference and marks a
  run record without a recorded comparison sheet INCOMPLETE
  — a completeness state, never a grade: grading remains
  the owner's eye, and the grading law stands (wrong
  character = FAIL). Run record: `likeness-runs.json` beside
  the checker. Origin: Gap 15, activated — see the dated
  correction at Gap 15 in `WHAT-WE-DO-WRONG-ADDENDUM-2.md`.
- **The evidence:** the Phase P proof (2026-10-28) — the v6
  walk's own 8 drawings re-timed under a charted modulation
  design, no new art: **10.0 new drawings/sec** (was 8.0, exactly
  at the credits floor, one uniform hold pattern), **7 one-frame
  accent spans** at the charted burst frames, the
  uniform-unmodulated-rate flag **clear**, a charted 12-frame
  settled hold, and chart-conformance of **0 deviations**
  (accents 2/2, contacts 10/10, holds 2/2, boundary coverage
  1.0). The same checker run against the current gag v2 and the
  new gag chart records the baseline the rebuild must beat
  (1 deviation: no bell freeze; boundary coverage 0.9763 — and
  v2's own profile remains below floor at 7.786/sec with the
  uniform-rate flag). Run record:
  `show/production/tooling/proof-gate/timing-profile-runs.json`.
- **Why it is current:** owner order (2026-10-28, ABOVE THE
  FLOOR programme): everything measured at or below the floors
  gets pulled in and wired to go above and beyond them — the
  floor is not good enough — with research first
  (`ABOVE-THE-FLOOR-RESEARCH.md`: how productions exceed the
  floor at TV budgets, and where the bursts are spent).
- **Supersedes:** the Industry Method v1.1 **as a standalone
  entry** — v1.1's construction + timing core is folded into
  v1.2 unchanged; do not animate under v1.1 without its
  above-floor layer.
- **Standing gates unchanged:** Gate 8 (the owner's eye) and
  the profile model-sheet flag remain production gates. The
  gag rebuild itself has NOT started: it waits on Gate 8 and
  the profile call. v1.2's chart set is its input, not its
  start.

### The Industry Method — v1.1, standalone (2026-10-28)

**Re-marked 2026-10-28, at the v1.2 landing:** v1.1 is folded into
v1.2 as its construction + timing core. Used *without* the v1.2
above-floor layer (beat maps, chart-conformance, above-floor
design targets), v1.1 is **DO NOT USE** — a build can sit exactly
AT a floor under v1.1 and pass, which the owner has ruled is not
good enough: the floor is the minimum, not the target.


- **The method:** the Industry Method v1 (construction core,
  below) **plus the timing layer**: `TIMING-STANDARD.md` in this
  folder — the binding bar for how the show moves, stated in
  **new drawings per second** (the owner's unit): scene body
  floor 12 drawings/sec in moving passages, ending-credits floor
  8 drawings/sec, action accents at 24 drawings/sec, and at or
  below ~3 drawings/sec is the FAILED class. The timing layer
  adds: registers, framerate modulation as a written chart
  choice, composed and capped holds, a timing chart per cycle
  and per shot, beat-grid sync, and the pacing rules (cut
  rhythm, change density, the hook rule).
- **The checker (the timing layer is wired, not just written):**
  `show/production/tooling/proof-gate/verify_proof.py` measures
  every clip's headline effective new drawings per second and
  its class, its hold structure, its below-bar signature flags
  (interpolation profile; uniform unmodulated rate) and its
  pacing (longest near-static run, change events per 10 s). Its
  measured run record sits beside it
  (`timing-profile-runs.json`). It reports measurements only;
  grading a clip remains the owner's/scorer's call.
- **The evidence:** the checker's first run over the existing
  body of work (2026-10-28): the v6 industry walk proof measures
  exactly at the credits floor (8.0 drawings/sec, clean grid, no
  flags); gag v2 measures 7.79 drawings/sec — below the credits
  floor — with the uniform-rate flag; gag v1 is FAILED class
  (interpolation signature); the Storyboard Draft 1 excerpt is
  FAILED class at 1.96 drawings/sec with an 8.0-second
  near-static run. Full table: `TIMING-STANDARD.md` §11.
- **Why it is current:** owner order (2026-10-28, THE BAR
  programme): TV-anime industry standard is the lowest
  acceptable bar, and the timing layer is what makes that bar
  checkable instead of aspirational.
- **Supersedes:** the Industry Method v1 **as a standalone
  entry** — v1's construction method is folded into v1.1
  unchanged; do not animate under v1 without its timing layer.


### The Industry Method — v1, standalone (2026-10-28)

**Re-marked 2026-10-28, at the v1.1 landing:** v1 is folded into
v1.1 as its construction core. Used *without* the v1.1 timing
layer (`TIMING-STANDARD.md` + the timing checker), v1 is **DO
NOT USE** — a build can pass every v1 drawn gate and still fail
the bar on timing and pacing, which is exactly what the timing
layer exists to catch.

- **The method:** part-separated puppet construction (one drawing
  per body part, peg hierarchy, drawn-overlap joints, hair as its
  own part over the head) + substitution-drawing sets for every
  shape a deformer cannot honestly produce (legs/feet, hands,
  mouths, eyes) + cycles authored pose-to-pose, **contacts first**,
  on an exposure chart + travel **derived from the drawn stride** +
  all verification on the **rendered drawings**, never on the
  skeleton. Deformers are a garnish inside a part, never the
  structure.
- **The spec:** `CORRECTED-METHOD.md` in this folder, including
  Addendum §A (intake gate, joint inventory, frame-exact rendering,
  built chibi models, action coverage, defect disposition).
- **The evidence it works:** the Mochiko walk proof built under it
  (workspace `ep01-ed-gag/work/v6-industry/`) passed every drawn
  gate the old method failed: contact lift 0 at both contacts,
  support stick 0.0 px/slot, support in 8 of 8 poses with no flight,
  drawn knee fold in the pixels, silhouettes differing 28–40% per
  step. Gate 8 (the owner's eye) remains a standing production
  gate, and the profile model-sheet flag from that proof remains
  open — they are production gates the method itself requires.
- **Why it was current:** owner-ordered industry-method programme
  (2026-10-28), after the single-mesh method failed three owner
  viewings in a row (see `WALK-DIAGNOSIS-LOG.md`).
- **Superseded:** the Single-Mesh Deform Method (below) —
  entirely, for all characters, all productions.

### The Single-Mesh Deform Method (the v1–v4 ED-gag era)

One grid skin over the whole body, bone/deformer posing, no
substitution drawings, travel set before stride, QC measured on the
skeleton. **Retired 2026-10-28.** Its failure record is
`WHAT-WE-DO-WRONG.md` (defects 1–5) and
`WHAT-WE-DO-WRONG-ADDENDUM.md` (defects 6–11). Existing mesh rigs
are reference/provenance only; no new animation is authored on
them. Bone-only "fixes" to a walk are a named non-solution: the
bones were right three times; the drawing was wrong.

### The Whole-Sprite Transform Method (the pilot / Storyboard Draft 1 era)

Whole-image bob/tilt/zoom over stills. **Retired by owner verdict**
(rejected pilot trailers; EP01 master reclassified as Storyboard
Draft 1). Never animation, at any length, under any gate.

---

## ⬛ THE UPGRADE RULE (owner, 2026-10-28 — standing)

In the owner's words in substance: *log the newest method as the
usable method, every time we upgrade methods, and make it obvious
for yourself and the agents, so we never regress.*

1. **Every method upgrade gets a registry entry here, at the
   moment it lands** — a new version block at the top of this file,
   marked **CURRENT / USABLE**, naming the version it supersedes.
2. The superseded version's block is re-marked **SUPERSEDED — DO
   NOT USE** in the same commit. Two methods may never both read
   as usable.
3. **Currency is per method and per use, like every other piece:**
   an older method may stay assigned to a named, written exception
   (a deliberate throwback segment, a legacy repair) — the
   exception and its reason are written next to that use. The one
   move that is always wrong is quietly falling back to a
   superseded method because it was nearer to hand.
4. A method becomes CURRENT on evidence, not on enthusiasm: a
   gated proof build under it, measured on rendered frames, with
   the owner's eye gate as the final gate for production use.
5. Any document, plan, or agent brief that names a method names
   its registry version. If a brief and this registry disagree,
   the registry wins and the brief is corrected.
6. Diagnosis findings that change the method (new defects, spec
   corrections found in practice) land as dated addenda to the
   method spec **and** a dated line in this registry's change log
   below — a future agent reading only this file must still see
   that the method moved.

## Change log

- **2026-10-28 — Registry created; Industry Method v1 marked
  CURRENT / USABLE.** Single-Mesh Deform Method and Whole-Sprite
  Transform Method marked SUPERSEDED. Same landing adds:
  `WALK-DIAGNOSIS-LOG.md` (how the backwards walk was figured out,
  as a standing protocol), `YU-YU-HAKUSHO-ENDING-STUDY.md` (the ED
  reference study, with corrections), and
  `WHAT-WE-DO-WRONG-ADDENDUM-2.md` (gaps 12–21, with their gates —
  several of those gates are now part of what "using the current
  method" means for group shots, faces, music sync, and the ED
  slot; they land as method obligations in that addendum until the
  next method version folds them into the spec proper).
- **2026-10-28 — Industry Method v1.1 marked CURRENT / USABLE;
  v1 superseded as a standalone entry (folded into v1.1).**
  Change: the timing layer lands — `TIMING-STANDARD.md` (the bar
  in new drawings per second: registers and floors, modulation as
  a chart choice, hold caps, charts per cycle and per shot,
  beat-grid sync, pacing rules) plus the wired checker at
  `show/production/tooling/proof-gate/verify_proof.py` with its
  measured run record beside it. First findings under the new
  layer: gag v2 below the credits floor (7.79 drawings/sec) with
  the uniform-rate flag; gag v1 and the Storyboard Draft 1
  excerpt both FAILED class. Beat maps and the remaining scene
  charts are named in `TIMING-STANDARD.md` §13 as specced, not
  yet wired.

- **2026-10-28 — Industry Method v1.2 marked CURRENT / USABLE;
  v1.1 superseded as a standalone entry (folded into v1.2).**
  Change: the above-floor layer lands — `ABOVE-THE-FLOOR-RESEARCH.md`
  (how productions exceed the floor, sourced), the first beat map
  (`show/episodes/EP01/timing/EP01-ED-BEAT-MAP.json` + doc; bell
  at ED 60.000 s verified against the audio itself), the gag
  above-floor chart set (same folder; 12.07 charted
  drawing-changes/sec, beats held ≥ 0.5 s, bell accent at gag
  frame 96), checker v2 chart-conformance mode
  (`verify_proof.py --chart`, tested: 0 deviations on the proof,
  synthetic misplacements caught, gag-v2 baseline recorded), and
  the Phase P re-time proof (v6 drawings, no new art: 8.0 uniform
  → 10.0 drawings/sec with accents, uniform-rate flag clear).
  Tahoma2D/OpenToonz remain registered (BSD-3) as the x-sheet
  lane; no new install was needed for this layer — the gap was
  artefacts and gates, not software.
- **2026-10-28 — Likeness gate added as a standing delivery
  requirement under Industry Method v1.2 (gate addition;
  v1.2 remains CURRENT / USABLE — no version bump: the gate
  changes what a delivery must carry, not how animation is
  made; dated-line treatment per upgrade rule 6).** Origin:
  the above-floor walk proof (PR #482) was delivered to the
  owner on the v6 primitive-redraw puppet — Gap 15's named
  defect, already in the record at delivery time — and the
  delivery headlined its timing numbers. Owner verdict:
  timing accepted; likeness total drift; FAIL as character
  work; the proof is reclassified TIMING PROOF ONLY, and the
  delivery is recorded as a New Deal + self-judgment law
  violation at Gap 15 in `WHAT-WE-DO-WRONG-ADDENDUM-2.md`.
  Wired: `verify_proof.py --likeness` (canon reference path
  + sha256 logged per run; per-frame similarity diagnostics;
  a run record without a recorded side-by-side comparison
  sheet is INCOMPLETE, never graded by the script), run
  record at
  `show/production/tooling/proof-gate/likeness-runs.json`.
  First measured run — the failed proof against the canon
  texture of record: median SSIM 0.17, median silhouette
  IoU 0.57, median colour-histogram L1 0.35 (diagnostics,
  not a grade; front-view reference vs profile frames — the
  view confound is stated in the companion correction
  entry). The v7 canon-art rebuild runs separately and is
  not graded here.

- **2026-10-28 — Industry Method v1.3 marked CURRENT / USABLE
  for generated character animation; v1.2 folded in, its drawn
  route remaining CURRENT for drawn proofs (per-use currency,
  stated in both blocks).** Change: the generated-turnaround
  route lands — `GENERATED-TURNAROUND-PIPELINE.md` (diagnose →
  turnaround → animate → export → gates, with the
  reference-bar section), the 20-point diagnosis checklist as
  data, and the drivers at
  `show/production/tooling/turnaround-pipeline/`
  (`build_turnaround_job.py`: animate half in the landed
  scene-job v2 format, turnaround half stamped SPEC — no
  landed I2I job type exists; the gap is flagged in the doc and
  in the emitted job; `slice_pack.py`: working sprite packer,
  self-test passing). Origin: the owner supplied a reference
  clip generated on a PAID hosted endpoint (Google's) that
  turned Mochiko's front canon art into a true profile walk,
  and ordered the pipeline adopted, wired, and used in place of
  the cutout-assembly route for generated work. The reference
  is recorded as the route's bar — never as canon or a
  deliverable; the local route is the free staged stack
  (Wan/VACE + Qwen2.5-VL, Apache-2.0) with likeness UNPROVEN
  stated in the doc.

- **2026-10-28 — Free-Stack Production Notes registered as a
  CURRENT method reference** (`docs/FREE-STACK-PRODUCTION-NOTES.md`;
  see the method-reference entry in the CURRENT section). The notes
  consolidate the 2026-10-28 reverse-engineering pass over industry
  tools (paid tools as method references only; all items
  free-stack executable), verified and completed on landing with
  the standing corrections (no IP-Adapter on the Wan stack;
  two-lane LoRA picture) and accurate tool licence labels.

- **2026-10-28 — Flow Composite Pipeline registered CURRENT /
  USABLE for EP01 video generation (production /
  previsualisation); the Industry Method v1.3 route remains
  CURRENT as the shippable-master path (per-use currency,
  stated in both blocks).** Change: `show/production/FLOW-COMPOSITE-PIPELINE.md`
  lands — start frames composited locally from real pack
  cutouts + real plates (shadow at composite), Flow
  image-to-video in chained 8-second segments (Veo 3.1 Lite;
  measured 10 credits/clip; free tier 50/day), a mandatory
  per-clip frame gate against the pack do-not-change lists,
  and the N1 beat-production appendix (V3-001 → V3-006, one
  start-frame recipe per beat). Origin: the V3-005 proof —
  the owner viewed the clip in chat, judged likeness and
  background perfect, and ordered the method adopted as the
  episode's video pipeline. The proof's measured finish drift
  (profile turn + invented long tail) is recorded in the
  pipeline doc, and the per-clip gate is stated as standing
  *because* adoption is not a waiver. The rights label is
  registered with the entry: Flow output commercial rights
  UNCLEAR at source (SynthID) — not a shipping master until
  the rights question resolves or the Wan lane re-takes the
  frames. Cross-linked from `PRODUCTION-PATTERN.md`, whose
  Flow engine-slot row is updated to match.

- **2026-10-28 — Remainders-pass registrations applied
  (documentation landing package).** Five CURRENT / USABLE
  entries added in the CURRENT section above: Movement-identity
  method v1 (superseding the face-only performance method),
  Kage layer system v1 (G10), Blender blocking seat v1 (G17),
  Episode board v1 (G16), and the OpenToonz headless seat
  (superseding the "cannot run headless" blocker). Applied from
  the package's `method-registry-update.md`; that update doc is
  not landed as a file. No existing entry was re-marked.

- **2026-10-30 — Rig-and-sheet standard registered as a CURRENT
  method reference; no method re-marked.** The donor-measured
  `show/production/rigs/RIG-AND-SHEET-SPEC.md` (PR #145) is the
  governing format for model sheets, palette sheets and puppet
  construction under the current methods, and it is wired into
  code the same day: BlairWitch v0.3.0 (mhvnsnt/BlairWitch,
  PR #1) implements the palette engine (§2 CMYK +
  sanctioned tints), the sheet generator (§1 sections + §1c
  height-chart entries), the §3 construction in its rig
  scaffold and puppet packages (root stack, eye system, mouth
  frame-chart, part naming, part files, SHARED hands,
  open-movie constraint assignments), and the extended puppet
  validator. Registry cross-links added in
  `show/production/rigs/README.md` and
  `show/production/tooling/TOOLING-INDEX.md`. The cast build-out
  the spec enables (spec §6) is tracked separately; nothing in
  this entry marks it done.

- **2026-10-30 — Cast build-out registered CURRENT; no method
  re-marked.** The per-cast build-out the rig-and-sheet
  standard enables (spec §6) landed in PR #35: human model
  sheets for Mochiko, Hex and Aeon, §2 palette files for the
  pilot six + the three humans, the principal/secondary
  height charts, and the SHARED hands library v1.
  Registrations added in `show/production/rigs/README.md` and
  `show/production/tooling/TOOLING-INDEX.md`, with the owed
  pieces named in the open next to each artifact (¾
  turnarounds ×3, expression sets — gate H-2 NOT PASS, hands
  v2 poses, Lustre palette deltas). This closes the open
  dependency named in the wiring entry above.

- **2026-10-30 — Harmony + settei addendum registered as a
  CURRENT method reference alongside the base standard; no
  method re-marked.** The donor-hunt addendum
  (`show/production/rigs/HARMONY-AND-SETTEI-ADDENDUM-2026-10-30.md`,
  PR #34) extends the rig-and-sheet standard with the Harmony
  construction profile, the settei five-section pack standard
  and the design & cleanup rules, and it is wired into code
  the same day: BlairWitch v0.4.0 (mhvnsnt/BlairWitch, PR #2)
  implements the Harmony scaffold and validators, the
  model-pack builder/validator, and the cleanup-rule sheet
  checks. Registry cross-links added in
  `show/production/rigs/README.md` and
  `show/production/tooling/TOOLING-INDEX.md`. The cast
  build-out (PR #35, registered by PR #37) is tracked
  separately; nothing in this entry marks it done.

---

## ⬛ THE ED-CREDITS STANDARD (owner, 2026-10-28 — standing)

An ending-credit piece is allowed to take **less work** than a
story scene: fewer drawings, a lower drawing rate (on 3s — 8
drawings per second — is the house ED timing), loops, pans, held
poses. It is **not** allowed to take a lower standard.

An ED piece is production-grade when, at whatever drawing rate it
uses: its art is finished (no placeholder drawings), its contacts
plant and stick, its held poses are strong enough to read as
silhouettes, its timing varies on purpose (accents on 2s, a few
frames on 1s at the exact hit), the camera/background do honest
motion work, the cuts and beats land on the song, and every
character's personality is in their chart, not in their fluidity.
That is how the reference endings the format descends from were
actually made — see `YU-YU-HAKUSHO-ENDING-STUDY.md`. **Low FPS was
never the amateur part. Missing craft was.** A piece that fails
those checks is not "ED effort level"; it is unfinished, and it
does not ship as an ending.
