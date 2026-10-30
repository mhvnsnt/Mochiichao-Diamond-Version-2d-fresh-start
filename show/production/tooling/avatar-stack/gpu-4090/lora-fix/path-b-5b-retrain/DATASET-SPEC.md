# Dataset spec — TI2V-5B character LoRAs for Dorowani + Wispkin

## Primary source: the reference packs (owner clarification, 2026-10-28)

The training stills come **from the characters' reference packs** —
`show/production/tooling/avatar-stack/reference-packs/<character>/` in
`mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start`. The packs are the
multi-view still sets (different views, angles and perspectives per character).
It was the **video** packs that only ever held one view — do not confuse the two.

A parallel **sheets audit** is inventorying exactly which views each
character's reference pack holds. This spec is written against the pack view
slots, and the builder (`build_dataset_from_refpacks.py`) reads whatever CANON
views a pack actually contains at build time:

- every view present in the pack → enters the dataset, tagged with its view name;
- any slot the audit finds short (a view missing or thin for a character) →
  recorded as a **dataset gap for that character** in the build report —
  never silently filled with generated art labelled canon, and never treated
  as "no views exist".

> State at build time (2026-10-28, from the in-repo pack folder itself):
> `reference-packs/<char>/` in the repo currently lists `front.png` per
> character, and `pack.json` / `PACK-MANIFEST.md` mark `three_quarter`, `side`,
> `back` and `expressions` as `GAP` *in that folder*. The owner's clarification
> says the multi-view stills exist as the reference packs, so the audit's
> inventory — which covers where the pack stills are actually staged — is the
> authority. Until it reports, Dorowani and Wispkin are both flagged
> **PROVISIONAL GAP: front view confirmed in-repo; ¾ / side / back /
> expressions pending audit confirmation.** If the audit confirms the views,
> the builder picks them up with no spec change.

## View slots and minimum counts (per character)

Counts are per view slot, in finished training items. Neither DiffSynth-Studio
nor ai-toolkit publishes a minimum dataset size for a TI2V-5B character LoRA —
that absence is stated plainly; the counts below are this package's spec,
set from (a) the repo's own round-1 precedent (26–28 items trained a usable
1.3B identity anchor — `lora/LORA-MANIFEST.md`) and (b) the requirement that
every view the model must hold at inference is represented in training.

| View slot | Pack source slot | Min items | Target items | Notes |
|---|---|---|---|---|
| Front / hero | `front` | 8 | 12 | Full body ×4 backgrounds (white/black/cream/gray) ×2 scales, upper-body crop, head crop |
| Three-quarter | `three_quarter` | 6 | 10 | Full body ×3 backgrounds, upper-body crop, head crop |
| Side / profile | `side` | 6 | 10 | Full body ×3 backgrounds, upper-body crop, head crop. Facing direction as drawn in canon |
| Back | `back` | 6 | 10 | Full body ×3 backgrounds, upper-body crop |
| Expressions | `expressions` | 6 | 10 | Head/upper-body close-ups, one per expression on the sheet |
| Action / signature poses | (pack stills + rig frames of canon pixels, repo precedent) | 4 | 8 | Dorowani: Water Orb charge poses. Wispkin: float / mask-tilt poses |
| **Total stills (ai-toolkit path)** | | **36** | **60** | |
| **Total clips (DiffSynth path)** | | **24** | **36** | 49-frame locked-off clips rendered from the same stills (see below) |

Per-character asymmetries (canon, from the repo's own dataset builder):
- **Wispkin: NO horizontal flip** — cracked mask and smoke plume are asymmetric;
  a mirror image teaches a non-canon character.
- **Dorowani: flip allowed** — near-symmetric design (repo precedent).

## Two dataset forms, one source

1. **Stills form (ai-toolkit)** — the builder writes each pack still as
   training items directly: PNG + same-stem `.txt` caption, in
   `aitoolkit/datasets/<character>/`. This is the ai-toolkit format per its own
   example config ("datasets are a folder of images. captions need to be txt
   files with the same name as the image").
2. **Clips form (DiffSynth)** — DiffSynth's TI2V-5B recipe trains on video:
   49 frames, first frame = conditioning image (`--extra_inputs "input_image"`).
   `make_clips.py` renders each still into a 49-frame locked-off clip with a
   subtle scale "breathing" (ffmpeg zoompan; the same pixels, no redraw — the
   same principle as the repo's TextRig frames, which deform canon pixels and
   were accepted as training sources in round 1). Clips are listed in
   `diffsynth/dataset/<character>/metadata.csv` (`video,prompt` columns,
   following DiffSynth's example-dataset layout).

## Captioning (see CAPTIONING.md)

One caption recipe for both forms, carried over from the repo's proven round-1
captions: `<trigger>, <fixed canon description>, <view/expression/background
tag>, flat 2D cartoon illustration, clean black outlines, cel shading`.
Triggers are unchanged from round 1 so packs/prompts stay consistent:
`dorowani_mochii`, `wispkin_mochii`.

## Hard rules

- Canon art only — pack stills and rig frames of canon pixels. No donor art,
  no generated fill-ins labelled canon (reference-pack README rule).
- No baked-in ground/contact shadow in any training item (standing rule);
  pack stills are used on plain fields, shadows are a composite-stage thing.
- Every source file is hashed (sha256) into the build report, like round 1's
  `DATASET-SOURCES.md`.
- A character whose pack is short on views trains a **front-weighted LoRA only
  if the owner accepts that limitation in writing**; otherwise that character
  waits for the sheet step. The builder never hides the shortfall.
