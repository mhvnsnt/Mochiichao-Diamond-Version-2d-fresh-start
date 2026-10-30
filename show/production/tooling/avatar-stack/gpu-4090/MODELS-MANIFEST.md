# Models manifest — gpu-4090 pack

Machine-readable version: `MODELS-MANIFEST.json` (same data, plus
sources, file names, ComfyUI destinations and byte-size provenance
for every row). Rules: licences named exactly as verified in
`VERIFY-4090-HOSTS-AND-MODELS.md`, `EXISTING-DECOMP-EXTRACTION.md`,
and the fetched repo files (`backends.json`, `fetch_consistency_models.py`,
`parity/A14B-TIER.md`, the two parity workflows). A size appears only
where a source gives it — otherwise it is a GAP and gets measured
after download, never asserted in advance.

| Model | Licence (exact) | Disposition | Bytes (where sourced) | 4090 / 24 GB path |
|---|---|---|---|---|
| Wan2.2 TI2V-5B (fp16 checkpoint) | Apache License 2.0 | ship-clean | 9999658848 | YES on 24GB. Official single-GPU command: at least 24GB VRAM (RTX 4090 named) with --offload_model True --convert_model_dtype --t5_cpu. ComfyUI offloading path fits 8GB (RunPod Wan 2.2 guide citing ComfyUI docs). GGUF file sizes (QuantStack, secondary listing in verify report): Q8_0 5.40GB, Q6_K 4.21GB, Q5_K_M 3.81GB, Q4_K_M 3.43GB. |
| Wan2.1 VACE-1.3B (fp16) | Apache License 2.0 | ship-clean | — (GAP, see JSON) | YES with flag: no VACE-specific VRAM number published in primary repos (UNVERIFIED). Sourced: single-GPU inference documented at 832x480; base Wan2.1-1.3B officially 8.19GB VRAM; repo locked-stack working set ~11.33GB (A14B-TIER.md §4). 480p only. |
| Wan 2.1 VAE | Apache License 2.0 | ship-clean | 253815318 | part of the ~11.33GB locked-stack working set |
| Wan 2.2 VAE | Apache License 2.0 | ship-clean | — (GAP, see JSON) | included in the 5B stack |
| UMT5-XXL fp8 scaled (text encoder, native loader) | Apache License 2.0 | ship-clean | — (GAP, see JSON) | shared by TI2V-5B and VACE workflows (fetch script notes); verify report flag: text encoder ~6.7GB fp8 sits on top of diffusion weights |
| UMT5-XXL fp8 non-scaled (Kijai repack, wrapper loader) | Apache License 2.0 (Wan family) — GAP: the research files do not independently state a licence for this repack file itself; see also the Turbo LoRA recheck flag below | ship-clean-with-recheck-note | 6731333792 | loaded on offload_device in the graph |
| Wan22 TI2V-5B Turbo LoRA rank64 fp16 (Fast Lane distill) | RECHECK_BEFORE_COMMERCIAL_SHIP — repack card declares no licence; underlying Self-Forcing is MIT, base Wan is Apache-2.0 (repo backends.json, backend kaggle-wan22-ti2v-5b) | eval-until-recheck__download-only-with---fast-lane-flag | — (GAP, see JSON) | LoRA merged on the 5B model in-graph |
| Wan2.2 I2V-A14B FP8-scaled experts (quality tier) | Apache License 2.0 | eval-only__catalogued-not-a-tier | 14294742832 | YES-quant-only at 640x640/480p (83-89% of 24GB on RTX 4090D, ComfyUI template authors via RunPod guide); FP8 at 720p needs 48GB — does not fit; stock single-GPU official guidance is 80GB class |
| Wan2.2 I2V-A14B GGUF (QuantStack) | Apache License 2.0 | eval-only__catalogued-not-a-tier | {'Q4_K_M_per_expert': 9651728896, 'Q4_K_M_pair': 19303457792, 'Q5_K_M_per_expert': 10792055296, 'Q6_K_per_expert': 12003652096, 'Q8_0_per_expert': 15406608896} | only one expert active at a time in ComfyUI; text encoder + VAE sit on top (verify report flag 4) |
| Wan2.1 VACE-14B | Apache License 2.0 | eval-only__unverified-vram | — (GAP, see JSON) | UNVERIFIED — no official VRAM figure; primary repos show 14B as the multi-GPU example. Treat 'runs on a 4090' as to-be-tested, not proven (verify report §5 flag 3) |
| Phantom-Wan 1.3B (subject-consistent S2V) | Apache License 2.0 | eval-only__not-yet-run | — (GAP, see JSON) | VRAM number UNVERIFIED — repo documents single-GPU inference at 832x480, publishes no VRAM figure; base Wan2.1-T2V-1.3B is officially 8.19GB, so a 24GB fit is expected, not measured |
| ToonCrafter (cartoon keyframe interpolation) | Apache License 2.0 | eval-only__not-yet-run | — (GAP, see JSON) | YES — repo model table ~24GB reference (A100, DDIM 50); repo notes community lowered it to ~10GB; ComfyUI pruned FP16 build listed at 12GB in the repo's Community Support section |
| MultiShotMaster (KlingAIResearch) | Apache License 2.0 | eval-only__not-yet-run | — (GAP, see JSON) | GAP — not verified in sources used |
| FastWan / FastVideo (Hao AI Lab) | Apache License 2.0 | eval-only__not-yet-run | — (GAP, see JSON) | GAP — no 4090 figure in sources used |
| Qwen2.5-VL-7B-Instruct (prompt extension) | Apache License 2.0 | ship-clean__wired-unproven-in-run | 16595981281 | GAP — no 4090 VRAM figure in sources used; runs as a pre-step, not in-graph (in-graph extension cannot consume the VL checkpoint, extraction §7.7) |
| Per-character LoRAs — Wispkin + Dorowani (musubi-tuner, rank 16) | Apache License 2.0 (musubi-tuner, per extraction) | gap__wrong-base-for-5b-scene | 87594264 | n/a — they are Wan2.1-1.3B LoRAs; musubi-tuner cannot train TI2V-5B (no ti2v-5B task; 16 vs 48 latent channels). Unblock: a TI2V-5B-capable trainer or a 1.3B scene variant (extraction §7.2). Trained from 1-2 canon artworks each — identity anchors, not general models. |
| BiRefNet (cutout backup) | MIT License | ship-clean__backup-only | — (GAP, see JSON) | GAP — measured in repo on CPU (~78-115 s/frame at 1024x1024, 2 vCPU); no GPU figure in sources used |
| LTX-2 / LTX-2.3 / LTX-2.5 (19B/22B) | LTX-2 Community License — free-but-restricted: free commercial use only under $10M annual revenue; at/above, a paid Lightricks agreement is required. NOT Apache 2.0. | refused-for-shipping__eval-only-with-owner-licence-acceptance | — (GAP, see JSON) | NO at official spec: ComfyUI-LTXVideo prerequisite is 32GB+ VRAM; 24GB is an fp8-cast/offload workaround; FP4-on-24GB is secondary-source only (UNVERIFIED) |
| LTX-Video 0.9.x (2B / 13B) | CONFLICTED — GitHub licence field says Apache License 2.0 and Comfy's FAQ says the 0.9.x line is Apache 2.0, but the repo's own v0.9.5 news says 'New license for commercial use (OpenRail-M)'. Code licence vs checkpoint licence appear to differ. | refused-until-per-checkpoint-licence-read | — (GAP, see JSON) | 2B yes; 13B only distilled/FP8 — no official numeric VRAM spec (UNVERIFIED as an official number) |
| HunyuanVideo (original, 13B+) | Tencent Hunyuan Community License Agreement — free-but-restricted, NOT open source; does not apply in the EU, UK and South Korea; 100M+ MAU needs a separate Tencent licence | refused | — (GAP, see JSON) | NO — official requirements 60GB peak (720x1280x129f) / 45GB (544x960x129f); any 24GB claim UNVERIFIED |
| HunyuanVideo-1.5 (8.3B) | Tencent Hunyuan Community License Agreement — free-but-restricted, NOT open source; EU/UK/South Korea exclusion applies | eval-only__never-ship | — (GAP, see JSON) | YES — official minimum 14GB with model offloading; 480p I2V step-distilled reported ~75s end-to-end on a single RTX 4090 (repo, per verify report) |
| Seedance 2.5 / Higgsfield / Kling / Wan 3.0 (hosted, for the record) | paid hosted; free tiers free-but-restricted (scratch only, outputs cannot ship) | refused-as-engines__functions-rebuilt-clean-room | — (GAP, see JSON) | n/a — hosted |

## Buckets, plainly

- **Ship-clean (open source, named licence):** all Wan-family rows,
  Phantom-Wan, ToonCrafter, MultiShotMaster, FastWan, Qwen2.5-VL,
  BiRefNet (MIT). The Turbo LoRA is the one exception inside the
  shipping stack: its Kijai repack card declares **no licence**
  (underlying Self-Forcing MIT, base Wan Apache-2.0) — it is flagged
  `RECHECK_BEFORE_COMMERCIAL_SHIP` in the repo's `backends.json`, so
  `download_models.sh` only fetches it under `--fast-lane` with that
  warning printed.
- **Eval-only, never ship:** A14B FP8/GGUF tiers (Apache-2.0 but
  *catalogued, not a tier* — unproven), VACE-14B (VRAM unverified),
  Phantom-Wan, ToonCrafter, MultiShotMaster, FastWan (slots, not yet
  run), HunyuanVideo-1.5 (fits, but Tencent licence + territory
  exclusion).
- **Refused:** LTX-2 family (LTX-2 Community License, revenue cap —
  not Apache 2.0), LTX-Video 0.9.x (Apache-2.0 vs OpenRail-M
  conflict, unresolved), HunyuanVideo original (45-60 GB + Tencent
  licence), and the hosted Seedance/Kling/Wan 3.0 engines themselves
  (paid; no weights exist; functions rebuilt clean-room instead —
  see DECOMP-MAP.md).
- **Known defect carried on purpose:** the Wispkin/Dorowani character
  LoRAs are **Wan2.1-1.3B LoRAs and do not load in the 5B scene**
  (musubi-tuner has no TI2V-5B task). They are listed so nobody
  wires them into a 5B graph and calls it a lock.
