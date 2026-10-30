# Captioning — TI2V-5B LoRA datasets (Dorowani + Wispkin)

Recipe carried over unchanged from the repo's round-1 datasets
(`avatar-stack/lora/build_datasets.py`, the captions the 1.3B LoRAs trained on),
extended with a view tag — view diversity is the whole point of round 2.

## Format

```
<trigger>, <fixed canon description>, <view tag>, <background tag>, flat 2D cartoon illustration, clean black outlines, cel shading
```

- **Trigger first, always.** ai-toolkit note (its own Wan examples): use the
  trigger word in sample prompts as `[trigger]`; musubi precedent and the repo
  manifest both require the prompt to contain the trigger for the LoRA to engage.
- **Fixed description never varies** within a character — the variable parts are
  only the view/background/expression tags, so the model binds identity to the
  trigger + description, not to a pose or a background.

## Fixed descriptions (canon, copied from the repo's `build_datasets.py`)

- **Dorowani** (`dorowani_mochii`): "Dorowani, a blue bipedal crocodile-like
  creature with a tall blue dorsal fin on its head, red star-shaped cheek fins,
  red oval eyes, a long snout with small fangs, a pale cream belly, long blue
  arms with clawed webbed hands, and a tan segmented shell on its back"
  - Plus the pack's do-not-change rule in negatives at inference: no white
    around the eyes, no sclera — red eyes set directly in the blue face
    (`reference-packs/dorowani/pack.json` owner ruling, 2026-10-28).
- **Wispkin** (`wispkin_mochii`): "Wispkin, a small ghost creature with a round
  black shadowy body, a cracked white skull mask with two round black eye holes
  held by two small black hands, a black flame tip on top of its head, and a
  wispy black smoke tail dissolving below"
  - Horns are a per-individual variant trait (pack.json owner ruling): captions
    neither require nor forbid them.

## View / expression / background tags

- View: `front view` · `three-quarter view` · `side view` · `back view` ·
  `close-up of the face` · `upper body` · `full body`
- Expression (from the pack expression sheet): the expression's plain name,
  e.g. `happy expression`, `determined expression` — taken from the sheet's own
  labels at build time, never invented here.
- Background: `on a plain white background` · `on a plain black background` ·
  `on a plain cream background` · `on a plain gray background`
  (round-1 recipe, `build_datasets.py`).

## Form per trainer

- **ai-toolkit:** one `.txt` file per image, same stem as the image file.
  `caption_dropout_rate: 0.05` and `cache_text_embeddings: true` in the configs
  here follow ai-toolkit's own Wan2.2 14B 24GB example.
- **DiffSynth:** the same caption string goes in the `prompt` column of
  `metadata.csv`, one row per clip; the clip's first frame is the conditioning
  image (TI2V mode, `--extra_inputs "input_image"`).
