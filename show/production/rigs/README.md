# Rig-capability layer — working rigs for the Mochiichao cast

**Why this exists (Jamar's need, stated plainly):** the Mochiichao
cast needs **working rigs** — tools that put real animation capability
onto *our own* characters. Studio rigs from other shows can't do that
job (see "What stays a pointer" below), so this layer authors rigs
**natively**: specs written for Mochiichao's characters and
proportions, built on Jamar's own existing standards and study notes,
plus machine-readable rig scaffolds the pipeline can build from.

## Built on Jamar's own documents (provenance)
These are his documents — copied/adapted under the TRANSFER-MANIFEST
rules:
- `mhvnsnt/Bannon` → `docs/UNIVERSAL-RIG-STANDARD.md` (owner law:
  gates before anything ships — extreme-pose battery, proof renders,
  no hand-tooling) + `docs/RIG_PIPELINE_STATUS.md` (canonical
  skeleton convention + adapters).
- `mhvnsnt/animation-techniques-archive` → `steal-like-artist/
  character-pipeline/` (6-stage character pipeline; Stage 3 rig-spec
  template is the shape of every spec here).
- Same repo → `steal-like-artist/cn-gigaleak/study-notes/
  fla-rig-conventions.md` (production conventions captured from his
  study: filename = production tracker, layered puppet hierarchy,
  Graphic symbols for mouths/hands/eyes, never overwrite a version).
- Same repo → `steal-like-artist/rig-mapping/shows/*.md` (per-show
  rigging-approach guides) + `rig-mapping/README.md`'s 80/20 rule:
  model-pack completeness + naming/organization cover 80% of rigging
  needs; the last 20% is character-specific — that's what the cast
  specs below are for.

## The Mochiichao rig standard (v1)
- **Style:** 2D puppet/cutout (per character-pipeline Stage 3),
  built from the repo's own portrait/variant art.
- **Naming:** `MC[ep]ORIGINAL_PUPPET_[CHARACTER]_VERSION_[###]`
  (adapting his fla-conventions template; MC = Mochiichao).
  Never overwrite a version.
- **Timeline:** 24 FPS, safe-area guides on stage (project standard,
  picked once).
- **Hierarchy:** character root → head (eyes/pupils/brows/nose/mouth
  as sub-layers) → torso → arms (upper/lower/hand) → legs
  (upper/lower/foot) → character-specific layers → accessories/FX.
  Every layer descriptively named — no "Layer 1". _L/_R is the
  character's left/right.
- **Symbols:** mouth, eyes, hands are **Graphic symbols** (frame-
  accurate sync), never MovieClips. Mouth = the **Preston Blair
  10-viseme set** (rest, A/I, E, O, U, M/B/P, F/V, L/T/D/N/Th,
  C/D/G/K/S/Z, W/Q).
- **Motion language:** animate on 2s/3s; held body with mouth/eyes
  for dialogue (Hanna-Barbera method); volume-preserving squash &
  stretch; dedicated smear drawings for fast moves; anticipation
  holds of 4–8 frames on jumps.
- **Gate (adapted from UNIVERSAL-RIG-STANDARD):** no rig ships to an
  episode without passing its **range-of-motion battery** (neutral,
  full reach overhead, deep crouch, sit, plus its character-specific
  extremes) with **before/after proof frames reviewed by eye**.
  Fixes come from the pipeline, not hand edits.
- **Sheet / palette / construction formats (CURRENT standard):**
  `RIG-AND-SHEET-SPEC.md` in this folder — the donor-measured
  standard landed via PR #145 (2026-10-30) and wired the same day.
  It rules: model-sheet sections (§1, incl. the two height charts —
  principal and secondary are separate charts, §1c), palette
  sheets (§2: base swatches as **CMYK percentages** in the
  Dominant/Support/Accent/Ink discipline, **sanctioned 50%/75%
  tints**, variants as delta blocks), puppet construction (§3:
  root stack, the four-piece masked eye system, the mouth as a
  frame-chart symbol, pose-frame limbs + `torso_move`, view-code
  part naming `<view>-<part><L/R>-<###>` with view codes
  FR/TQ/SD/BK, part-per-file linked libraries, the locked
  **SHARED/hands** library, overlap skirts), and the compositing
  glue gate (§4). Where this README's v1 summary and the spec
  differ in detail, the spec governs.
- **Harmony + settei addendum (CURRENT extension):**
  `HARMONY-AND-SETTEI-ADDENDUM-2026-10-30.md` in this folder —
  the donor-hunt kit landed via PR #34 (2026-10-30) and wired
  the same day. It extends this standard with: the Harmony
  node-graph construction profile (master peg, region
  composites, curve deformers, cutter pairs, the measured
  hero-vs-standard budgets), angle-coded substitution charts
  (F/3Q/P/PQB heads/eyes, 44-48-drawing mouths, hero hand
  charts of 105/107), the .plt palette discipline (LINKed
  single source, `rig`/`Cutter` functional colours), the
  settei five-section model-pack completeness standard, and
  the design & cleanup rules (universal line weight,
  body-under-clothes construction, mouth discipline). Where
  the base spec and the addendum differ in detail, the
  addendum governs for Harmony-profile work.
- **Implemented in code:** BlairWitch (`mhvnsnt/BlairWitch`, the
  owner's rig/sheet/puppet creator — canonical home there, per
  the no-fork law) emits and validates this standard: palette
  engine, sheet generator, rig scaffold, puppet packages and the
  extended validator (PR #1); v0.4.0 (PR #2) adds the Harmony
  construction profile, the settei model-pack standard, and
  the cleanup-rule checks from the addendum. New sheets, palettes and
  puppets are produced with that tool, not hand-formatted.
- **Cast artifacts (CURRENT, registered 2026-10-30):** the
  build-out the spec's §6 gap list called for has landed
  (PR #35) — human model sheets, §2 palette files, the two §1c
  height charts and the SHARED hands library v1 are built and
  registered in the section below. Production work uses those
  files, at those paths.

## Files
- `RIG-AND-SHEET-SPEC.md` — **the CURRENT rig-and-sheet standard**
  (model-sheet format, palette format, puppet construction,
  compositing glue), measured from real production files; see the
  standard bullet above.
- `HARMONY-AND-SETTEI-ADDENDUM-2026-10-30.md` — **the CURRENT
  extension of the standard** (Harmony rig kit + settei /
  design-rules kit), measured from the production templates
  recovered by the 2026-10-30 donor hunt; see the addendum
  bullet above. Implemented in code by BlairWitch v0.4.0
  (PR #2).
- `DONOR-PROVENANCE-2026-10-29.md` — per-source provenance for the
  spec: repo/release/file, verified sizes and sha256, licence
  buckets, located-not-fetched items, named gaps.
- `open-movie-kit/` — the one direct carry-over: the Big Buck
  Bunny rig-constraint scripts (CC-BY 3.0, Blender Foundation),
  carried verbatim with attribution; wired into BlairWitch as its
  constraints module (registry + modern ports of the separable
  maths) — BlairWitch PR #1.
- `BUILD-NOTES-cast-gaps-2026-10-30.md` — build record for the
  CURRENT cast artifacts (sources per piece, canon-lock check,
  contradictions found in the game material, the owed list).
- `SHARED/hands/` — the shared generic-hands library, **v1
  CURRENT** (15 poses + `hands-library-sheet.png` + its own
  README): the locked §3f library every rig links its hand
  poses from. See the registration section below.
- `CAST-RIG-SPECS.md` — written rig specs for the principal cast
  (pilot six), in his Stage-3 template shape.
- `scaffolds/*.rig.json` — original, machine-readable rig scaffolds
  generated from those specs for each character (hierarchy, control
  set, symbol frames, pose library, ROM tests). These are the build
  inputs for puppet construction in the show pipeline (and mirror
  the layer/control naming the 3D side expects from the Universal
  Rig Standard, so 2D and 3D stay consistent).

## CURRENT cast artifacts (registered 2026-10-30)
The cast build-out the spec's §6 gap list called for has landed
(PR #35, merged 2026-10-30; build record:
`BUILD-NOTES-cast-gaps-2026-10-30.md` in this folder). These
are the CURRENT artifacts production work uses — built from
the repo's existing game production art (assembled, keyed,
cropped, measured, sampled); no character art was generated
or redrawn. Where a piece is still owed, it is registered as
owed right next to the artifact — never as complete.

- **Human show model sheets (§1b)** —
  `show/production/model-sheets/humans/`: `mochiko-model-sheet.{png,md}`,
  `hex-model-sheet.{png,md}`, `aeon-model-sheet.{png,md}`,
  each with its `assets/` set (v2 likeness fronts,
  world-view turnarounds, atlas portrait + battle cells, head
  studies, props). **Status: CURRENT.**
  **Owed, in the open:** the ¾ (TQ) turnaround view on all
  three sheets (no ¾ drawing exists in the game material);
  expression sets beyond the face of record — **gate H-2 is
  NOT PASS on all three sheets** until the registers named in
  each sheet are drawn; full-res battle views (only the 64px
  atlas cells survive in the repo). Mouth sets are built
  (gate H-1 material PASS), pending the owner's eye-check;
  voice casting remains AWAITING OWNER for all three.
- **Palette sheets (§2)** —
  `show/production/model-sheets/palettes/`: CMYK-% palette
  files for the pilot six (Mochii, Dorowani, Gabu, Kittember,
  Sproutle, Wispkin — JSON + MD) and the three humans
  (Mochiko, Hex, Aeon — JSON), sampled from the canon cutouts
  / v2 fronts, with sanctioned 50%/75% tints and the full
  cluster table in every file. **Status: CURRENT.**
  **Owed:** Lustre (variant) palette deltas for Mochii, Gabu,
  Kittember and Sproutle — noted in each palette file; the
  delta sampling is a follow-up, not yet done.
- **Height charts (§1c)** —
  `show/production/model-sheets/height-chart-principal.png`
  (pilot six + Mochiko, Hex, Aeon) and
  `show/production/model-sheets/height-chart-secondary.png`
  (Falk, Mom, Players A–D), with `height-chart-data.md`
  alongside (units, sources, method — creature units
  repo-stated on the species model sheets; human and
  secondary units derived from sheet art and labelled
  DERIVED). **Status: CURRENT.**
- **Shared generic-hands library (§3f)** — `SHARED/hands/` in
  this folder: **v1, 15 poses** (FR/SD/BK, adult + child
  plans) + `hands-library-sheet.png` + its README. This is
  the locked library the §3 standard names — rigs link poses
  from here; hands are never redrawn per character.
  **Status: CURRENT (v1).**
  **Owed (v2 poses):** point, generic grip, the TQ set, wave,
  palm-up offer — no source art exists yet.

## What stays a pointer (and why)
The holdings index lists a studio character rig (a Maya `.ma` file)
and an episode animatic in Jamar's Nick study folder. **Both stay
pointers — location + catalog description only.** Under Jamar's own
filter for this show (no characters / no character names / no logos):
a studio character rig **is** the character — mesh plus deformation —
and an episode animatic is those characters acting. Neither converts
into Mochiichao-native material by re-skinning, so neither is copied
or converted. What transfers is the *technique* — conventions,
hierarchy, symbol systems — and that transfer is exactly what this
layer is.

## Teardown source + body-plan templates
The rig system's teardown source is [RIG-TEARDOWN-open-movies.md](RIG-TEARDOWN-open-movies.md) (open-movie rig teardowns; staging record: RIG-TEARDOWN-STAGING.md). Body-plan starting points live in [templates/](templates/): `biped-rig-spec.md` / `biped.rig.json` and `quadruped-rig-spec.md` / `quadruped.rig.json` — start new rigs from these templates, not from a blank page.
