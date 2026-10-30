# Path A — STOPGAP: a 1.3B scene where the EXISTING LoRAs already load

**Label: lower-quality stopgap. This is not the fix — Path B is the fix.**
Path A exists so character work is not blocked while Path B trains: it runs a
scene on the base model the existing LoRAs were actually trained for.

## Why this works when the 5B scene doesn't

The existing LoRAs (`wispkin_mochii_wan21_1.3b.safetensors`,
`dorowani_mochii_wan21_1.3b.safetensors`, rank 16, 87,594,264 B each — repo
`lora/LORA-MANIFEST.md`) are **Wan2.1 T2V-1.3B** LoRAs. The repo's own locked
wrapper workflow already runs exactly that base —
`Wan2_1-T2V-1_3B_bf16.safetensors` — with the **VACE 1.3B module** attached as
`extra_model` (the reference lock). It simply never had a LoRA node wired in.
These workflows add one.

## Files

| File | Base | Lock | LoRA |
|---|---|---|---|
| `workflow-vace-13b-lora-dorowani.json` | Wan2.1 T2V-1.3B (wrapper) | VACE 1.3B module, reference image (repo's lock) | `dorowani_mochii_wan21_1.3b.safetensors` @ 0.8 |
| `workflow-vace-13b-lora-wispkin.json` | Wan2.1 T2V-1.3B (wrapper) | VACE 1.3B module, reference image | `wispkin_mochii_wan21_1.3b.safetensors` @ 0.8 |

## Exactly what changed vs the repo source (nothing else changed)

Source: repo `show/production/tooling/avatar-stack/parity/workflow-i2v-locked-wrapper.json`
(fetch-verified 2026-10-28). Both files were generated programmatically from it.

1. **Node 16 ADDED** — `WanVideoLoraSelect` (same node class and input names as
   the repo's `parity/workflow-turbo-fixed.json` node 2) pointing at the
   character's existing LoRA, `strength 0.8` (the low end of the repo
   LORA-MANIFEST's 0.8–1.0 range — start low, raise only if identity is weak).
2. **Node 7 (`WanVideoModelLoader`)** — new input `lora: [16, 0]`. The input is
   named `lora`, **not** `lora_args` — the wrapper renamed it, and the repo's
   preflight aborts on the stale name (`parity/TURBO-T5-FIX.md`).
3. **Node 3 prompt** — trigger token prepended (`dorowani_mochii` /
   `wispkin_mochii`); the repo manifest states the prompt must contain the
   trigger for the LoRA to engage. The Wispkin file's action text is its Dark
   Wave performance with its canon description (from `lora/build_datasets.py`);
   Dorowani keeps the repo's Water Orb prompt verbatim after the trigger.
4. Load-image names and the SaveVideo prefix are per-character
   (`<char>_start_tight.png`, `<char>_reference_tight.png`,
   `locked_13b_<char>`) — the staging convention the repo workflow already used.

Unchanged: VAE (`Wan2_1_VAE_bf16`), the non-scaled T5 the wrapper requires
(the scaled fp8 T5 is rejected by this loader — repo TURBO-T5-FIX), VACE
model select, block swap (10 / VACE 5), torch-compile settings, the
`WanVideoVACEStartToEndFrame` → `WanVideoVACEEncode` lock chain, sampler
(20 steps, cfg 5.0, shift 8.0, seed 2002, unipc), 480×768, 49 frames.

## Honest limits of the stopgap

- **1.3B quality ceiling:** smaller model than the 5B scene — the repo's own
  parity tier decision already treated 1.3B-class output as the floor, not
  the target. Expect softer motion/detail than the 5B scene.
- **The LoRAs themselves are thin:** trained from 1–2 distinct canon artworks
  (26–28 items with rig-frame variants) as front-view identity anchors
  (repo LORA-MANIFEST). They hold the front view; they were never trained on
  ¾/side/back views because round 1 had no multi-view dataset. Path B fixes
  that too.
- **NOT YET RUN.** These workflows are adapted from the repo's locked workflow,
  which itself is wired-but-unproven (the locked end-to-end run was pending a
  Kaggle rate limit). First run on the 4090 seat goes through the same
  preflight + frame-1 + likeness gates; a fail is reported as a fail.
- Native-ComfyUI alternative: the repo also carries a native (non-wrapper)
  VACE workflow (`parity/workflow-i2v-locked.json`, `UNETLoader` on
  `wan2.1_vace_1.3B_fp16.safetensors`). These Path A files use the **wrapper**
  form deliberately: it is the form whose base model is the LoRAs' exact
  training base (T2V-1.3B + VACE module), so LoRA key compatibility is the
  training configuration itself, not an assumption. Loading the T2V LoRAs into
  the native VACE *full* model is unverified and is not claimed here.

## When Path A retires

As soon as a Path B LoRA passes the gates in the 5B scene, Path A is a
fallback for drafts only. It is never promoted to "the production scene" by
relabeling.
