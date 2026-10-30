# Path B (preferred) — retrain the character LoRAs FOR Wan2.2 TI2V-5B

**Status: PACKAGE BUILT, TRAINING NOT RUN.** Training runs when the 4090 seat
is rented. Nothing in this folder is a trained LoRA.

## What this is

Round-1 LoRAs were trained on the wrong base model (Wan2.1-1.3B) because the
trainer used then (musubi-tuner) has no TI2V-5B task — verified again today,
still true (see `TRAINER-VERIFICATION.md`). The industry-standard fix is not to
convert or patch the old files — adapter weights are tied to the exact base
they were trained on — it is to **retrain on the correct base, from a proper
multi-view dataset**. Two trainers verified at source support TI2V-5B today:

| Route | Trainer | Form | This package |
|---|---|---|---|
| **B1 (primary)** | modelscope/DiffSynth-Studio (Apache-2.0) | 49-frame clips, first frame = conditioning image | `diffsynth/train_<char>_ti2v5b.sh` (+ `_lowvram_4090` variant) — hyperparameters are the trainer's own shipped TI2V-5B LoRA recipe |
| **B2 (cross-check)** | ostris/ai-toolkit (MIT) | still images directly | `aitoolkit/train_<char>_ti2v5b_24gb.yaml` — adapted from ai-toolkit's own Wan2.2 24GB example, adaptations commented inline |

B1 and B2 produce independent LoRAs from the same dataset; run B1 first, use
B2 if B1's clip pipeline fights the seat, or A/B them — same gates decide.

## Hyperparameters (trainer-documented, not invented)

- **DiffSynth (its `lora/Wan2.2-TI2V-5B.sh`):** lr 1e-4, 5 epochs, rank 32,
  target modules `q,k,v,o,ffn.0,ffn.2`, `--lora_base_model dit`,
  `--extra_inputs "input_image"`, 480×832, 49 frames,
  `--remove_prefix_in_ckpt "pipe.dit."`. One flagged deviation:
  `dataset_repeat` 100 → 20, because our set is 24–36 clips, not the tiny
  example set (rationale in the script header).
- **ai-toolkit (its `train_lora_wan22_14b_24gb.yaml`):** linear/alpha 32,
  lr 1e-4, adamw8bit, batch 1, gradient checkpointing on, bf16,
  `cache_text_embeddings: true` ("required for 24GB cards" — the example's own
  words), steps 2000 (example's stated good range: 500–4000).

## VRAM on one 24GB RTX 4090

- DiffSynth levers, all the trainer's own (defined in
  `diffsynth/diffusion/parsers.py` / Wan `train.py`): `--fp8_models "dit"`,
  `--enable_model_cpu_offload` (layer-offload training), and gradient
  checkpointing, which DiffSynth **forces on** for Wan training. The
  `_lowvram_4090` scripts carry these. DiffSynth publishes no numeric VRAM
  figure for this recipe — **"fits 24GB" is to be measured on the first run,
  not assumed**; the fallback ladder is: drop `--fp8_models` → keep CPU
  offload → drop resolution to the ai-toolkit stills route (B2).
- ai-toolkit: its Wan2.2 example is literally named `..._24gb.yaml` and uses
  quantization + `low_vram: true`; the 5B is a third the A14B's size.

## Dataset

From the **reference packs** — see `DATASET-SPEC.md` and `CAPTIONING.md`.
Build order on the seat:
`build_dataset_from_refpacks.py` → (B1 only) `make_clips.py` → train.
The builder reports any view slot the pack is short on as a named gap;
Dorowani and Wispkin are both provisionally flagged pending the parallel
sheets audit's inventory of the packs' staged stills.

## After training (not optional)

The new LoRA is not "done" when training finishes. It goes through the repo's
existing gates in a 5B scene: preflight (`parity/preflight.py` rules — engaged
lock, no stale `lora_args`, correct T5), frame-1 gate
(`parity/frame1_gate.py`), likeness gate. A LoRA that produces the wrong
character on frame 1 fails, whatever its training loss said.
