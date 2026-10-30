# Tooling index — production capability pulled in for the show build

**Definition (Jamar, 2026-10-27):** tooling = **reusable production
capability** — pipelines, workflow systems, templates, convention/
spec documents, and Jamar's own code/tools — as distinct from show
content. Tooling comes into the show folder; a studio's actual
production files for *their* episodes/characters (their character
rigs, episode project files, animatics, model packs) are **content,
not tooling — pointers only, never copied or converted.**
Audit date: 2026-10-27, across the repos in the pull-in map /
transfer manifest.

**How "carried in" works for code:** Jamar's own standard (Universal
Rig Standard) is *don't fork pipelines per project — pull canonical,
improvements go back via PR.* So his code stays canonical in its home
repo; this show folder carries the **index, the specs, and the native
adaptations** (PIPELINE.md, TEMPLATES.md in this folder), and episode
work calls the canonical tools by the paths listed here.

---

## Class A — Jamar's own code & tools (canonical homes; indexed here)

### cape-jones — `production/pipeline/` (72 files, verified)
The largest working toolset he owns. The show-relevant core:
- **Boarding/animatic:** `storyboard_sheet.py`, `animatic_builder.py`,
  `fountain_to_animatic.py`, `fountain_to_beats.py` (script → beats →
  animatic), `scene_assembler.py`, `led_scene_assembler.py`
- **Dialogue/lip-sync:** `dialogue_pipeline.py`, `lipsync_align.py`,
  `tts_voices.py` / `tts_voices_2026.py`, `voice_convert.py`,
  `transcribe_translate.py`
- **Cartoon finish:** `anime_fx.py`, `cleanup_lines.py`,
  `vs-anime-cleanup.vpy`, `upscale_span.py`, `palette-enforce.py`,
  `grades.py`, `finish.py`, `comp_glow.py`, `retro_fx.py`,
  `deghost.py`, `cartoon-fx.sh`, `ffmpeg-animation-filters.sh`
- **Audio:** `music_gen.py`, `sfx_gen.py`, `audio_restore.py`,
  `stem_sep.py`
- **Gates/QC:** `claim_gate.py`, `verify_claim.py`,
  `checkpoint_audit.py` (the claim/proof discipline — same family as
  the ANIM-GATE)
- **Formats:** `example_manifest.json` (manifest format),
  `flamenco-manager.ep1.yaml` (render-farm config)
- **Docs:** `ANIMATION-PIPELINE-2026.md`, `FLIPACLIP-POST-PIPELINE.md`,
  `docs/COMPLETE-PIPELINE.md`, `docs/ANIM-GATE.md`
- Also in-repo: a vendored **Rhubarb Lip Sync** tool under
  `3d-assets/face-rig/tools/rhubarb/` (third-party OSS, license file
  included there).

### TRIPPEDD-Animation-Studio — the shot pipeline
- `PIPELINE.md` (architecture), `fetch_assets.py` (license-gated
  acquisition), `catalog/build_catalog.py` + `catalog.json`/SQLite
  FTS5, `find_asset.py`, `render_shot.py` + `render/blender_scene.py`,
  `retarget/retarget_core.py`, `post/finish.py` (grade/grain/
  letterbox/titles/mix −14 LUFS), `post/proof.py` (QC proof stage),
  `shots/SPEC.md` + `shots/templates/` (shot-spec format + templates).

### animation-techniques-archive — the technique toolkit
- `tools/TOOLKIT.md`, `tools/lipsync-timing.py`, `tools/qc-gates.py`,
  `tools/likeness-check.py`, `tools/ebsynth-guide.md`,
  `tools/masking-quickstart.md`
- `templates/character-model-sheet-template.md`,
  `PIPELINE-CHECKLIST.md`, `ANIMATION-PLAYBOOK.md`

### Voice + edit
- **wizard-gang-voice-pipe:** `scripts/render_voice.py` (Chatterbox
  TTS), GitHub Actions Voice Render workflow, `render-queue.json`
  format, per-character refs/defaults system.
- **pocket-studio:** `app.html` (phone timeline editor), `build.py`
  (project JSON → ffmpeg → MP4, with clip muting/ducks),
  `extract_recordings.py`, project-JSON format documented in its
  README.

### Body-replace / AI-video fix
- **video-fix-tools/ai-body-replace** (mirrored in TRIPPEDD repos):
  `cape_jones_viggle_kaggle.ipynb`, `viggle_workflow_api.json`,
  `KAGGLE-SETUP.md`, `gen_notebook.py` — the Viggle-on-Kaggle
  workflow that animated Cape Jones.

### Rig repair (3D)
- **western-heart `tools/rig_repair/`** — the canonical 9-stage rig
  pipeline named by the Universal Rig Standard (Bannon/docs). Per
  Jamar's own no-fork law this stays a canonical pointer; the show
  calls it, never copies it.

### Already in this repo
- `tools/avatar-pipeline/` — the Mochiichao avatar/show bundle
  pipeline (PR #309, merged).

### BlairWitch — `mhvnsnt/BlairWitch` (rig / sheet / puppet creator)
The working rig, sheet and puppet creator (Python package +
`blairwitch` CLI): character spec in → model sheet (JSON + SVG),
`.rig.json` scaffold (6 body plans, Blair symbol libraries, ROM
battery), versioned puppet packages. As of v0.3.0 (PR #1)
it **implements the donor-measured rig-and-sheet standard**
(`show/production/rigs/RIG-AND-SHEET-SPEC.md`, this repo's
PR #145) in code: the §2 CMYK palette engine with sanctioned
50%/75% tints, the §1 sheet format with principal/secondary
height charts, the §3 puppet construction (root stack,
four-piece masked eyes, mouth frame-chart, view-code part
naming, part library files, SHARED hands), the CC-BY open-movie
constraints module, and validators for palette format, part
naming and the hands-library reference. Canonical home is its
own repo (no-fork law); show production calls it from there.

## Class B — Convention / spec documents (carried in as native specs)
| Convention/spec | Source (his docs) | Carried in as |
|---|---|---|
| Fla puppet-rig conventions (naming, hierarchy, symbols) | animation-techniques-archive study notes | `show/production/rigs/README.md` standard |
| Preston Blair 10-viseme mouth system | ANIMATION-PLAYBOOK.md | rig specs + playbook adoption |
| mochiichao-mouth-data/v1 format + Rhubarb converter (lip-sync, humans) | `show/production/tooling/mouth-data/` (MOUTH-DATA-FORMAT.md, rhubarb_to_mouthdata.py, examples/) | carried — machine-readable mouth data for the human talking seat |
| HB limited-animation method (2s/3s, holds, cel levels) | mystery-coast-ghosted/docs/research | PIPELINE.md in this folder |
| Dialogue-first production pipeline | mystery-coast PIPELINE.md + TOOLING-2026.md | PIPELINE.md in this folder |
| Scooby 6-beat episode formula | mystery-coast research | beat-sheet template (TEMPLATES.md) |
| Model-pack completeness (8-sheet) + mouth QC | rig-mapping/shows/knd-model-pack.md | model-sheet template (TEMPLATES.md) |
| Palette enforcement as a system | cape-jones `palette-enforce.py` + docs | PIPELINE.md finish stage |
| Rig-and-sheet standard (model-sheet format §1, CMYK palette format §2, puppet construction §3, compositing glue §4) | donor-measured extraction 2026-10-29 (per-source record: `show/production/rigs/DONOR-PROVENANCE-2026-10-29.md`) | `show/production/rigs/RIG-AND-SHEET-SPEC.md` — **CURRENT standard** (PR #145); implemented in code by BlairWitch v0.3.0 (PR #1); cast build-out landed as CURRENT artifacts (PR #35) — registered in `show/production/rigs/README.md` and the cast-artifacts section below |
| Persona 5 UI principles (CEDEC 2017) | research report | `show/production/research/persona-5-ui-principles.md` |
| Manifest/catalog formats | TRIPPEDD sources manifests; cape-jones example_manifest.json | `show/shared/` manifests (SHOW-HOME plan) |

## Class C — Pointers only (third-party studio production files)
Content, not tooling — location + catalog description only, per the
unchanged boundary:
- Nick study folder files: studio character rig (.ma), episode
  animatic, bible PDFs (see research INDEX).
- CN archive episode project files, character rigs and model packs
  in the donor repos.
- Rick & Morty Toon Boom project files; Smiling Friends .fla rigs
  (cartoon-vault).

## Gray cases (flagged, per the default rule)
1. **Big Buck Bunny production tree (CC-BY)** — its Python
   rig-constraint scripts look like tooling, but they are a studio's
   production files for their film. **Decision: pointer for the
   files; the reusable system (folder discipline, rig layout) is
   already extracted into native specs** (research INDEX + rigs).
   **Update (2026-10-30):** the five `pyconstraints` scripts
   themselves were carried **verbatim under their CC-BY 3.0
   licence** (attribution in place) into
   `show/production/rigs/open-movie-kit/pyconstraints/` by
   PR #145, and are now **wired into BlairWitch** as its
   `blairwitch.constraints` module (registry + verbatim script
   access + modern ports of the separable maths; rigs assign them
   by name) — BlairWitch PR #1. The rest of the tree stays
   pointer-only.
2. **Rhubarb Lip Sync vendored in cape-jones** — third-party open-
   source *software* (not studio content): fine to use as a tool via
   its home path/license; not re-copied here.
3. **`viggle_workflow_api.json`** — a workflow *configuration* for a
   third-party service, authored in Jamar's repos for his pipeline:
   Class A (his tooling configuration), the service itself is
   external.

- **Voice kit** — `show/production/tooling/voice-kit/` (Chatterbox render queue + GitHub Actions workflow for human voices, wired per its WIRING.md; weights staged per its TERABOX-MANIFEST.md — prepared, not yet staged).

## Battle + avatar-stack tooling (landed 2026-10-27, battle-presentation teardown)
- **Animscript library** — `show/production/battle/animscripts/` (one file per move; format: `show/production/battle/MOVE-ANIM-SCRIPT-FORMAT.md`). Join keys: `move_id` + `display_name` against `src/data/core/moves.json`; `registry_anim_id` is read from moves.json (first entry wired: AQUA_JET -> AQUA_SHOT). Per-species `variance_notes` across the files are the anatomy-variance registry.
- **Animscript validator** — `show/production/tooling/battle/validate_animscript.py`.
- **Battle UI flow** — `show/production/battle/BATTLE-UI-FLOW.md` (game-lane src/ copy is the game lane's call — not made here).
- **Avatar-stack palette tool + lustre proposal** — `show/production/tooling/avatar-stack/palette_variant.py` + `BUNDLE-FORMAT-LUSTRE-PROPOSAL.md` (PROPOSAL — adoption is a design-lane contract bump that lands with the first real lustre; not adopted by the teardown).

## Data pipeline notes (List 11 landing, 2026-10-27)
- **Range-map regeneration (#102):** habitat range maps are a BUILD ARTEFACT — regenerate from the #7 spawn tables + #29 ecology tables whenever either input changes; output is stamped with the input versions. No range data is committed by hand, ever.

## Lighting & colour cluster (landed 2026-10-28 — the NVIDIA-adjacent pull-in)
- **Lighting cluster package** — `show/production/tooling/lighting-cluster/` (start at its `CLUSTER-MAP.md`). The NVIDIA-adjacent production-software cluster the owner asked to have found, torn down and wired: NVIDIA Omniverse (the prime suspect — free proprietary, not installed; functions rebuilt from open pieces, see its teardown's rebuild map), OpenUSD, MaterialX, OpenColorIO, Gaffer (reference only), and the RTX lighting techniques as a written note.
- **USD lighting keys** — `show/production/tooling/lighting-cluster/usd/` — the Garden Gate key set from `show/bible/LIGHTING-SYSTEM.md` §3 as real OpenUSD data (`gate_keys.usda` + `gate_keys_overrides.usda` opinion layer + `validate_gate_keys.py`; 64/64 checks at landing, TEST-RECORD.md in the package).
- **House OCIO config** — `show/production/tooling/lighting-cluster/ocio/config.ocio` (+ `check_config.py`, 16/16 at landing) — fills the "linear/ACES via OpenColorIO in Natron" slot named in `show/production/UNIFIED-PIPELINE.md`; protected identity colours travel as a data colorspace (LS-1/LS-2), environment colour exists only as named Looks.
- **MaterialX lustre look** — `show/production/tooling/lighting-cluster/materialx/lustre_sheen.mtlx` (+ `check_lustre.py`, 13/13 at landing) — the LV-1..LV-6 lustre rules from LIGHTING-SYSTEM.md §6 as a standard material definition.

## Cast artifacts — rig-and-sheet build-out (landed 2026-10-30, PR #35)
The cast artifacts the rig-and-sheet standard (Class B, above)
specifies — built from the repo's own game production art and
registered CURRENT. Production work points at these files:
- **Human model sheets (§1b)** — `show/production/model-sheets/humans/`
  (Mochiko, Hex, Aeon: sheet PNG + MD + per-character `assets/` sets).
  CURRENT. **Owed:** ¾ (TQ) turnarounds ×3; expression sets beyond the
  face of record — gate H-2 NOT PASS on all three; full-res battle
  views ×3. Mouth sets: gate H-1 material PASS, owner's eye-check
  pending.
- **Palette files (§2)** — `show/production/model-sheets/palettes/`
  (9 JSON + 6 MD: the pilot six + Mochiko, Hex, Aeon; CMYK-% with
  sanctioned 50%/75% tints). CURRENT. **Owed:** Lustre palette deltas
  for Mochii, Gabu, Kittember, Sproutle.
- **Height charts (§1c)** — `show/production/model-sheets/height-chart-principal.png`
  + `height-chart-secondary.png` + `height-chart-data.md`. CURRENT.
- **Shared hands library (§3f)** — `show/production/rigs/SHARED/hands/`
  (v1, 15 poses + `hands-library-sheet.png` + README; the locked
  library rigs link hand poses from). CURRENT (v1). **Owed (v2
  poses):** point, generic grip, TQ set, wave, palm-up offer.
- Build record: `show/production/rigs/BUILD-NOTES-cast-gaps-2026-10-30.md`
  (sources per piece, canon-lock check, contradictions found in the
  game material, the full owed list).
