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
- **Implemented in code:** BlairWitch (`mhvnsnt/BlairWitch`, the
  owner's rig/sheet/puppet creator — canonical home there, per
  the no-fork law) emits and validates this standard: palette
  engine, sheet generator, rig scaffold, puppet packages and the
  extended validator (PR #1). New sheets, palettes and
  puppets are produced with that tool, not hand-formatted.

## Files
- `RIG-AND-SHEET-SPEC.md` — **the CURRENT rig-and-sheet standard**
  (model-sheet format, palette format, puppet construction,
  compositing glue), measured from real production files; see the
  standard bullet above.
- `DONOR-PROVENANCE-2026-10-29.md` — per-source provenance for the
  spec: repo/release/file, verified sizes and sha256, licence
  buckets, located-not-fetched items, named gaps.
- `open-movie-kit/` — the one direct carry-over: the Big Buck
  Bunny rig-constraint scripts (CC-BY 3.0, Blender Foundation),
  carried verbatim with attribution; wired into BlairWitch as its
  constraints module (registry + modern ports of the separable
  maths) — BlairWitch PR #1.
- `CAST-RIG-SPECS.md` — written rig specs for the principal cast
  (pilot six), in his Stage-3 template shape.
- `scaffolds/*.rig.json` — original, machine-readable rig scaffolds
  generated from those specs for each character (hierarchy, control
  set, symbol frames, pose library, ROM tests). These are the build
  inputs for puppet construction in the show pipeline (and mirror
  the layer/control naming the 3D side expects from the Universal
  Rig Standard, so 2D and 3D stay consistent).

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
