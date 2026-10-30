# Rig-and-sheet spec — the Mochiichao cast standard, measured from real production files

**What this is.** The model-sheet format, palette-sheet format, and
puppet-construction standard for the Mochiichao cast, built by
extracting the *construction* of real studio production files the
owner holds (donor inventory + provenance:
`DONOR-PROVENANCE-2026-10-29.md` in this folder). Nothing here is a
donor character, name, or logo — it is the measured skeleton those
productions used, re-stated for our cast, in our naming, under our
laws (no baked-in shadows; shadows at composite; likeness from repo
canon art only).

**How it sits with what exists.** This spec *extends*, never
replaces: the rig standard in `README.md` (naming
`MC[ep]ORIGINAL_PUPPET_[CHARACTER]_VERSION_[###]`, 24 FPS, Graphic
symbols, Blair 10-viseme mouths, ROM battery gate), the body-plan
templates in `templates/`, and the per-character specs in
`CAST-RIG-SPECS.md`. Where this file adds a rule, the source
measurement is cited inline as (measured: …).

---

## 1. Model-sheet format

Section order synthesised from a broadcast style-guide's internal
structure (measured: a 78-page production guide whose contents
carry group character art, per-character art — principal cast
first, secondary cast separately — height charts for the
principal family and the secondary cast as **separate charts**,
shape/logo language, fonts, colours, graphic elements, scenes,
and product executions) and this repo's existing sheet practice.

### 1a. Species sheet — required sections, in order
1. **Turnaround** — front / ¾ / side / back at locked proportions,
   on the registry-CURRENT canon art.
2. **Construction** — the geometry under the drawing (circles,
   masses, joint points) so any builder can re-derive the shapes.
3. **Height-chart entry** — the species placed on the series height
   chart (§1c), height stated in head-units of its own body plan.
4. **Palette sheet** — §2 format, attached to the sheet, not
   embedded only as pixels.
5. **Expression instrument set** — the species' acting range;
   creatures are cries-only, so this is expressions + body
   language, each labelled by story function.
6. **Mouth set** — the species' own mouth shapes as drawn for
   *this* face (rebuilt natively per character; the *system* is
   §3's frame-chart symbol, the drawings are ours).
7. **Special-feature callouts** — the signature anatomy (fins,
   shell, tail-flame, sprout, wisp trail…) with its rig behaviour
   named (flare / flicker / lag / clearance), matching the
   character's entry in `CAST-RIG-SPECS.md`.
8. **Known integration issues** — the per-character "watch-fors"
   at composite time (§4). A sheet without this section is
   incomplete (measured: the donor compositing guide carries a
   per-character issues section for exactly this reason — colour
   that drifts shot-to-shot, exposure that wanders, reflections
   that only work outdoors).
9. **Variants** — Lustre and any owner-ruled variant, each with
   its own palette delta (§2) and its CURRENT/superseded status.

### 1b. Human sheet — required sections
The repo's human standard already rules nine sections
(`model-sheets/humans/README.md`: turnaround, head & face
construction, expression set, mouth set keyed to
`mochiichao-mouth-data/v1`, hands set, costume breakdown, palette,
scale chart, device/prop interaction) and gates H-1/H-2. This spec
adds two measured requirements to it:
- **Costume pieces are separate sheet items with rig names**, not
  just flats: in production rigs, costume is isolated so it can
  be swapped, removed, and lagged independently of the head/body
  (measured: one extracted rig carries hat and back-hoodie as
  separate symbols; the other isolates the shirt as its own layer
  inside the body symbol; §3).
- **A hands set is a first-class section, built once per body
  plan and shared**: broadcast production reuses a *generic hands*
  library across characters (measured: a shared generic-hands
  source file referenced by a full production rig). Our human
  hands set is authored per body plan (adult/child proportions),
  then shared by every human on that plan — never redrawn per
  character.

### 1c. Height charts — two charts, not one
Measured: the donor guide keeps **separate height charts for the
principal family and for the secondary cast**. Ours:
- `model-sheets/height-chart-principal.png` — pilot six + the
  three principal humans, one baseline, head-units marked.
- `model-sheets/height-chart-secondary.png` — everyone else,
  added as they are cast.
One chart for the whole 47+ cast is unusable at production size;
two charts is the measured discipline.

---

## 2. Palette-sheet format

Measured from a broadcast colour-palette sheet: the core palette
is a small set of base swatches, each specified as **CMYK
percentages**, and each swatch carries **sanctioned variation
percentages** (tint steps — 50% and 75% recur) so colourists can
lighten/darken *inside the system* instead of inventing colours.

Our palette sheet, one per character, attached to its model sheet:
- **Base swatches** in the repo's four-slot discipline
  (Dominant / Support / Accent / Ink), each given three ways:
  sampled hex (from the canon art — the repo's standing sampling
  rule), RGB, and CMYK percentages in the donor format.
- **Sanctioned tints**: 50% and 75% steps for Dominant and
  Support slots, pre-computed — these are the only lightened
  versions a colourist may use without a sheet revision.
- **Reserved colours stay reserved**: the alert red family is
  spent only where canon already spends it (owner law, restated
  from the repo palette discipline).
- **Variant delta block**: a Lustre/variant palette is recorded
  as deltas against the base swatches, never as a second
  free-standing palette.

---

## 3. Puppet construction standard (measured from real rigs)

Two complete puppet rigs were opened and read symbol-by-symbol,
and one full broadcast rig was read at the library level. The
constructions below are what they actually do.

### 3a. Root timeline — few layers, strict order
Measured (small rig A): the character root timeline is **5
layers** — head, front arm, body, legs, back arm/hand
(top→bottom), one keyframe deep; everything else lives *inside*
those symbols. Measured (small rig B): a **9-layer root** — the
same core stack plus a torso-motion helper layer, a body MASK
layer with a clipped detail layer under it, and a back-costume
layer. Our standard:
- Core root stack, top→bottom: **head / arm_front / torso /
  legs / arm_back** (floaters: head / arm_front / torso / trail
  / arm_back; quadrupeds per `templates/quadruped-rig-spec.md`).
- Optional root layers, only with these jobs and names:
  `torso_move` (recurring torso motion, §3d), `<part>_mask`
  plus its clipped detail layer, and `costume_back` for
  back-view costume pieces.
- No loose art on the root timeline. A part that moves on its own
  is a symbol, or it doesn't ship.

### 3b. Head construction — the eye system is four pieces
Measured (rig A head symbol, 15 layers): per eye — **eye symbol,
pupil symbol, pupil-PARENT symbol, lid symbol, and a MASK layer**
that clips the pupil inside the eye shape. Pupil and lid symbols
carry **3 frames each** (look/pose steps); the pupil sits inside
its parent so gaze motion never disturbs the eye's registration.
Our standard:
- Eye assembly per eye: `eye` (static shape) → `pupil_parent`
  (gaze container) → `pupil` (≥3 frames) — all clipped by
  `eye_mask`; `lid` above (≥3 frames: open / half / closed).
- Brows are separate symbols (≥3 frames each) on their own
  layers (measured: rig B carries brows as independent 3-frame
  symbols) — expression never requires redrawing the head.
- Mouth and scalp/hair sit on their own layers inside the head
  symbol; hair is **multi-piece** (see 3e).

### 3c. Mouth — the symbol timeline IS the chart
Measured: the mouth symbol in rig A holds **28 frames** on a
single layer; rig B's holds **25 frames**. One Graphic symbol,
one frame per mouth drawing, frame-accurate sync — this is the
mechanism behind the repo's Graphic-symbol rule. Our standard:
- Frames 1–10 = the Preston Blair 10-viseme set in the
  `mochiichao-mouth-data/v1` order (rest=1 … W_Q=10).
- Frames 11+ = the character's expression mouths (laugh, snarl,
  small-o, sleep…) in a fixed per-character order recorded on
  the model sheet (§1a.6 / §1b).
- Creature mouth sets follow the same frame-chart mechanism
  with the species' own shapes (cries, not visemes).

### 3d. Limbs and torso
Measured: arms are split **front/back symbols with 2–6 pose
frames each** (2–3 in rig B; 6 in rig A); legs are **one symbol
with 10–11 pose frames** (a step/stance set, not a jointed
chain); rig B carries a dedicated **torso-move helper symbol**
on its root timeline (a looping sub-timeline that holds torso
motion so the character root stays clean). Our standard:
- `arm_front` / `arm_back` symbols, ≥3 pose frames each
  (rest / reach / character signature pose).
- `legs` symbol with a ≥8-frame pose set for bipeds (stand,
  step L/R, crouch-prep, sit-prep…), extended by the ROM battery
  poses; quadruped/floater plans per templates + CAST-RIG-SPECS
  swaps (Wispkin's hover set replaces sit/crouch).
- Torso motion that recurs (breathing, sway) lives in a
  `torso_move` helper symbol (§3a), never keyframed ad hoc
  across the character root.

### 3e. Costume, hair, and view-specific parts
Measured: costume pieces (hat; a back-view hoodie) are separate
symbols; hair is split into **numbered piece sets per view**
(front-hair, back-hair 1..n); a separate **back-head** part
exists for back views. Our standard:
- Every worn item = its own symbol + layer (§1b), named in the
  rig with the item's canon name.
- Hair ships as a piece set: front set, back set, side pieces —
  each piece its own symbol so turns don't smear one drawing
  across views.
- Back views are *built*, not flipped: back-head, back-hair and
  back-costume pieces are part of the standard part list.

### 3f. Broadcast-scale library discipline (the big-rig rules)
Read from a full broadcast character rig's embedded library
(404 descriptive library/linkage strings found by scan;
conventions genericised here):
- **Part naming grammar**: `<view>-<part><L/R>-<###>` — a view
  code prefixes every part (the donor's code for the ¾ view is
  two digits), then the part, then the character's L/R, then a
  sequence number. Our view codes: `FR` front, `TQ` ¾, `SD`
  side, `BK` back. Example shape (our cast): `TQ-armL-001`,
  `FR-mouth-001`, `BK-hair-002`.
- **Parts live in part files**: arms, legs, hands, body and
  mouths are authored as separate linked library files and
  referenced into character rigs — a fix to the arms file
  propagates to every rig that links it.
- **Shared libraries are locked**: a `SHARED/` library (generic
  hands first) is reused across the whole cast and is
  don't-touch except through a library revision; character
  files link it, never copy it.
- **Angle-specific mouth files**: mouths are authored per view
  (front mouths ≠ ¾ mouths) as separate sets inside the mouth
  symbol's frame ranges, recorded on the sheet.
- **Turnarounds are dated source files**: the turnaround a rig
  was built from is kept, dated, and named in the rig's notes —
  the rig never silently drifts from its source sheet.
- **Shot-coded instances**: when a shot needs a one-off part
  variant, it is named `<C###S###>--<part>-<###>` (episode/cut
  code + part + variant) so episode-specific art never pollutes
  the base library.

### 3g. Pivots and the overlap-skirt rule
- Every symbol's transformation point sits on its anatomical
  joint; container symbols (the pupil-parent is the measured
  pattern) isolate combined motion so children keep their own
  pivots.
- **Overlap skirt (from our own Dorowani rig v1 findings):**
  head/torso and limb roots carry an overlap skirt — art that
  extends *under* the neighbouring part — so rotation to the
  ROM extremes opens no seam (v1 measured a neck seam gap at
  ±10° head rotation before this fix; the skirt is now part of
  the standard, checked in the ROM battery).
- Stray art attached to a part (v1 measured thin streak elements
  riding the fin-cheek art, invisible at rest, sweeping the face
  on rotation) is painted out or split into its own symbol at
  cleanup — never carried into a rig.

---

## 4. Compositing glue — integrating puppets into plates

This is the measured content behind the `DONOR-PULLINS.md` §4a
"compositing glue spec" queue item. From a broadcast compositing
guide written for exactly our situation — 2D characters that must
sit inside photographic/painted environments without reading as
cardboard:

1. **Exposure**: characters are designed bright; lower their
   exposure to match the plate. The measured sweet spot is
   **halfway between fully integrated and pure design values** —
   never all the way down.
2. **Ambient colour**: tint the character with the environment's
   ambient colour, applied through levels — lower channel
   outputs, adjust individual channel gammas to a lesser
   extent — judged while looking at character and plate
   together, never numerically alone.
3. **Feet gradients**: a gradient at the feet sells ground
   contact and fakes colour bounce from the ground — but it
   also creates the cardboard-panel look; keep it weak, and
   **under strong directional light (sun) it must not darken
   the feet at all**.
4. **Rim lights**: only when the plate shows a strong
   directional source. They affect **colour fills only, never
   outlines**; they are **never soft** (softness kills the
   graphic quality); edges are rounded via blur-then-levels;
   and they are **cut around nearby objects** that would block
   the light.
5. **Cast shadows are a composite step** (the guide's Part IV) —
   which is the donor-side statement of our own standing law:
   no baked-in shadows in character art; contact and cast
   shadows are built at composite, matched to the plate.
6. **3D / generative elements** are matched at the same pass on
   exposure, contrast, white temperature, and saturation —
   the four-dial match, against a designated key character for
   the shot.
7. **Per-character watch-fors ship with the sheet** (§1a.8):
   the measured examples are a character whose key colour
   drifts shot-to-shot and must be re-anchored to the key, and
   a sky reflection that reads right outdoors and wrong
   indoors. Every Mochiichao sheet names its own equivalents
   before the character's first episode.
8. **Environment-specific passes are part of the same record**:
   night shots lower character gamma to mimic lowered exposure;
   atmospheric perspective/fog is a normal-mode layer over the
   character in the atmosphere's colour at varying opacity; in
   grass, feet are masked with a grass brush rather than left
   floating on top of the ground plane.
9. **Cast-shadow construction** (the guide's detailed Part IV
   rules): blur a cast shadow only enough to match shadows
   already in the plate; a horizontal blur can fake perspective;
   the occlusion gradient is wider for large characters and
   tighter for thin ones; colour every shadow with the
   environment's ambient colour; distort shadows with
   displacement on grass; when occlusion is the only shadow,
   keep its gradient in perspective and exponential toward the
   centre; characters reflect on reflective ground.

Gate: a shot that mixes ≥2 media (the mixed-media trigger rule
in `DONOR-PULLINS.md`) does not ship until this glue pass is
recorded for it.

---

## 5. Production-tree discipline (open-movie baseline)

From the verified open-movie production tree (CC-BY; §7
attribution; the newer CloudRig generation is torn down in
`RIG-TEARDOWN-open-movies.md` — this is its 2008 baseline).
Verified first-hand from the assembled archive: 423 entries =
**422 production files + the production `MD5SUMS`**, 203 of them
`.blend`; extracted files cross-checked against `MD5SUMS` match.

- **Folder discipline**: `production/` splits into `chars/`
  (42 files), `envs/` (102), `mattes/` (49), `props/` (34),
  `scenes/` (137), `scripts/` (41), `sets/` (17) — assets are
  **linkable libraries**, separated by kind, never one-off
  copies inside shot files. Our `rigs/builds/`, `model-sheets/`,
  `character-sheets/` split already follows this; new material
  keeps the split.
- **Shot files live in numbered sequence directories**
  (`05_throwing/`, `12_peach/` style) — the convention our
  episode folders mirror.
- **Rigs are extended with small named scripts**: the tree's
  `chars/pyconstraints/` holds five rig-constraint scripts —
  foot roll, pivot change, rotation difference (two variants),
  bone volume preservation. The pattern (rig behaviour as
  small, named, reusable code — not hand-tweaks) is the same
  law as our no-hand-tooling rule, and the scripts themselves
  are carried in `open-movie-kit/pyconstraints/` under their
  CC-BY licence for the 3D track's reference.

---

## 6. Per-cast gap list (state at this landing, verified from the repo)

| Cast | Model sheet | Palette sheet (§2) | Rig scaffold | Rig build | Gap |
|---|---|---|---|---|---|
| Pilot six species (Mochii, Dorowani, Gabu, Kittember, Sproutle, Wispkin) | PNG sheets in `model-sheets/` ✓ | Not as standalone §2 files — palettes live in sheet art only | `scaffolds/*.rig.json` ✓ | `builds/` ✓ + clip bundles in `character-sheets/` | Palette sheets to extract into §2 files; series height charts (§1c) do not exist yet; Kittember's idle gate FAIL stands on record in `character-sheets/README.md` (pose-phase read; promotion is the owner's call) |
| Principal humans (Mochiko, Hex, Aeon) | **None built for show production** — `model-sheets/humans/` holds the 9-section standard only; canon likeness references exist at `src/assets/human-characters/named-canon/` (generated reference images, not production sheets) | None | — | `builds/` v1 (idle/talk/tilt + talking sets) | **The biggest open gap**: human model sheets unbuilt; ROM battery is the v2 pass per `CAST-RIG-SPECS.md`; shared hands library (§1b/§3f) not yet authored |
| Mom variants | None | None | — | None | Named in `CAST-RIG-SPECS.md` coverage; no sheets or builds yet |
| Remaining 41 species | None | None | None | None | By design — spec is written when a species is cast in an episode (`CAST-RIG-SPECS.md` rule); this table is the standing list, not a defect list |
| Wispkin (note) | ✓ | — | ✓ | ✓ | No-legs body plan: ROM battery uses the hover swap already defined in `CAST-RIG-SPECS.md`; §3d's legs-symbol rule does not apply |

Build order this spec enables, first three: (1) human model
sheets for Mochiko/Hex/Aeon under §1b; (2) the shared human hands
library + principal height chart; (3) §2 palette sheets extracted
for the pilot six.

---

## 7. Provenance (summary)

Full per-source records — repo/release/file, verified sizes and
sha256, licence buckets, located-not-fetched items, and named
gaps — live in `DONOR-PROVENANCE-2026-10-29.md` beside this
file. Headlines: two small XFL puppet rigs parsed symbol-by-symbol
(§3a–3e); one broadcast rig read at library level (§3f); a
compositing guide + palette sheet + style guide read in full
(§1, §2, §4); a CC-BY open-movie tree verified against its
release record (§5). Donor studio files were studied on the
workbench only and are **not** in this repo; the one carry-over
is the CC-BY constraint scripts in `open-movie-kit/`, attributed
there.

*Attribution for §5 material: Big Buck Bunny production files —
(c) copyright Blender Foundation | www.bigbuckbunny.org,
licensed CC-BY 3.0 (logos/trademarks excluded by the licensor;
the film's score is separately CC-BY-NC-ND and is not used).*
