# Workflows — what was changed for the 4090, and what was not

## Files and their real sources

| Pack file | Copied verbatim from (repo, on main) | Bytes | sha256 |
|---|---|---:|---|
| `workflow-i2v-locked.json` | `show/production/tooling/avatar-stack/parity/workflow-i2v-locked.json` | 3715 | 61da15a3b6b681a4a2f4ee7a08dc13b659db8a3f (git blob sha) |
| `workflow-turbo-fixed.json` | `show/production/tooling/avatar-stack/parity/workflow-turbo-fixed.json` | 4227 | 747800fd2ba22ba3d07d90e3ddf3e537a45cefd7 (git blob sha) |

Both graphs are **byte-identical copies** of the repo files above.
No node was added, removed, renamed or rewired in either graph.
Node names below are the `class_type` values in those files — nothing
else is used in this pack.

## What was NOT changed (the important part)

- **Locked graph (`workflow-i2v-locked.json`)** — native ComfyUI nodes
  only: `UNETLoader` (`wan2.1_vace_1.3B_fp16.safetensors`),
  `CLIPLoader` (`umt5_xxl_fp8_e4m3fn_scaled.safetensors`, type `wan`),
  `VAELoader` (`wan_2.1_vae.safetensors`), `CLIPTextEncode` x2,
  `LoadImage`, `WanVaceToVideo` (480x768, length 49, strength 1.0,
  `reference_image` wired from the LoadImage — THE LOCK),
  `ModelSamplingSD3` (shift 8.0), `KSampler` (30 steps, cfg 5.0,
  uni_pc/simple, seed 2002), `TrimVideoLatent` (trim_amount wired
  from `WanVaceToVideo` output 3), `VAEDecode`, `CreateVideo`
  (16 fps), `SaveVideo` (prefix `locked_i2v_dorowani`).
  This graph already fits a 24 GB card as written: the VACE-1.3B
  locked stack's working set is ~11.33 GB (A14B-TIER.md §4, repo).
  No 4090 edit was needed, so none was made.
- **Turbo graph (`workflow-turbo-fixed.json`)** — ComfyUI-WanVideoWrapper
  nodes: `WanVideoModelLoader` (`wan2.2_ti2v_5B_fp16.safetensors`,
  fp16, quantization disabled, sdpa), `WanVideoLoraSelect`
  (`Wan22_TI2V_5B_Turbo_lora_rank_64_fp16.safetensors`, strength 1.0,
  input named `lora` — the drift fix), `LoadWanVideoT5TextEncoder`
  (non-scaled `umt5-xxl-enc-fp8_e4m3fn.safetensors` — the T5 fix),
  `WanVideoTextEncode`, `WanVideoImageToVideoEncode` (480x768,
  49 frames), `WanVideoSampler` (4 steps, cfg 1.0, shift 5.0, unipc,
  seed 2002), `WanVideoDecode` (VAE tiling on), `CreateVideo`,
  `SaveVideo`. Also unchanged.

## What IS 4090-specific (outside the graphs)

1. **Offload flags already in the Turbo graph are kept, not added:**
   `WanVideoTextEncode.force_offload=true`,
   `WanVideoImageToVideoEncode.force_offload=true`,
   `WanVideoSampler.force_offload=true`, T5 `load_device=offload_device`.
   On a 4090 these stay ON for the first proof run; turning them off
   for speed is a post-proof tuning step, not a wiring change.
2. **Launch flags** (start scripts, not graphs): ComfyUI headless on
   port 8188. No `--lowvram` flag is set by default — the two graphs
   above were measured/designed well under 24 GB. GAP: no 4090 run
   has happened yet, so this is a starting point, not a measurement.
3. **A14B quality tier — NO graph is included, on purpose.**
   No real A14B workflow exists among the repo files this pack is
   built from, so inventing one would be fabricating node wiring.
   The tier is specified as constraints only (see
   `a14b-quality-tier.json` in this folder):
   - FP8-scaled experts (Comfy-Org repack): 14,294,742,832 B each;
     on 24 GB the sourced working resolution is **640x640 / 480p**
     (RunPod Wan 2.2 guide, citing ComfyUI template authors'
     83-89% VRAM measurement on a 24 GB RTX 4090D); **FP8 at 720p
     needs 48 GB — does not fit.**
   - GGUF route (QuantStack, via city96 ComfyUI-GGUF, files in
     `models/unet`): Q4_K_M 9,651,728,896 B per expert,
     Q5_K_M 10,792,055,296 B, Q6_K 12,003,652,096 B (A14B-TIER.md §2,
     repo — byte-exact HF listings). Only one expert is active at a
     time in ComfyUI (verify report §3).
   - Status: **catalogued, not a tier** (A14B-TIER.md §4) —
     runnable-looking, UNPROVEN on our material.
4. **Phantom-Wan / ToonCrafter — no graph included.** No real workflow
   for either exists in the source files; both are manifest slots
   only (MODELS-MANIFEST), GAP-flagged in BUILD-REPORT.md.
