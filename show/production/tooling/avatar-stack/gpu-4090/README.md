# gpu-4090 — the 4090 production pack for the avatar-stack

One rented RTX 4090 (24 GB GDDR6X) on RunPod or Vast, running the
repo's already-built generation stack — instead of Kaggle's free
T4 seat. This pack is the deploy + runner layer only: every graph,
gate and composite tool it drives is a real file already in this
repo's `avatar-stack/` (named per file below). Nothing in here is a
new engine.

**Status: WIRED UNPROVEN.** No 4090 run has happened yet. The stack
becomes PROVEN only when a first run on a 4090 passes, in order:
`parity/preflight.py` -> a generated clip -> `parity/frame1_gate.py`
-> `likeness_gate.py`. The two earlier UNLOCKED proofs were graded
FAIL (frame-1 SSIM 0.2938 / RGB MAD 100.29 against thresholds
SSIM >= 0.50, MAD <= 40 — repo `parity/PARITY-REPORT.md`, via the
extraction). The locked graph exists because of that failure; it
has not yet been run end-to-end anywhere (Kaggle 429 at wiring time).

## Packs — reference packs are stills, video packs are moving (owner clarification, 2026-10-28)

Two different things get called "packs" in this stack. Keep them
separate:

- **Reference packs = STILLS.** For each character they hold
  **different views, angles and perspectives**. They are not
  single-view, and they are the **source of truth** for what the
  character looks like from any view.
- **Video packs = MOVING clips.** The **"only one view" limitation
  belongs to the video packs, and only to them** — the video packs
  currently hold one view per character.

**Production method:** a video pack gains its extra views **from
the reference-pack stills**. The still for that view is the source
the moving version is built from. A new view is **never generated
from nothing**, and never invented by the video model.

That corrects the older wording elsewhere (extraction §7.1 and any
"packs are front-view only / views are missing" line): the views
exist, as stills, in the reference packs. The production work is
deriving the moving version from those stills.

## Stack decision

| Slot | Choice | Why / evidence |
|---|---|---|
| Primary engine | **Wan2.2 TI2V-5B** (Apache License 2.0), fp16 checkpoint 9,999,658,848 B | Only ship-clean engine family member with a sourced 24 GB fit: official repo says a single-GPU run needs at least 24 GB (RTX 4090 named, with `--offload_model True --convert_model_dtype --t5_cpu`); ComfyUI offloading fits it in 8 GB (RunPod Wan 2.2 guide). Runs the repo's measured Turbo A/B path (78.5 s vs 1,787.6 s short test, 22.8x — scene-scale UNPROVEN). Graph: `workflows/workflow-turbo-fixed.json`. |
| Identity lock | **Wan2.1 VACE-1.3B** (Apache License 2.0), reference-image conditioning — fed from the **reference-pack stills** (multi-view; the still matching the shot's view, per the Packs section above) | There is **no IP-Adapter node for Wan** (repo parity report, checked against the full wrapper registry) — VACE reference control is the real lock. `WanVaceToVideo.reference_image` is wired ENGAGED in `workflows/workflow-i2v-locked.json`, with `TrimVideoLatent` connected (the wire the earlier graph left unconnected). Locked-stack working set ~11.33 GB (repo A14B-TIER §4). 480p only. VACE-specific VRAM number: UNVERIFIED in primary repos — see MODELS-MANIFEST. |
| Fast Lane | Turbo LoRA 4-step path (same Turbo graph) | Licence flag: the Kijai repack card declares no licence — `RECHECK_BEFORE_COMMERCIAL_SHIP` (repo `backends.json`; underlying Self-Forcing MIT, base Wan Apache-2.0). Downloaded only via `download_models.sh --fast-lane`. |
| Quality tier (candidate) | **Wan2.2 I2V-A14B** in FP8-scaled or GGUF form | Apache License 2.0, but **catalogued, not a tier** (repo A14B-TIER §4): stock needs an 80 GB-class card; on 24 GB the sourced paths are FP8 at **640x640 / 480p** (one FP8 expert 14,294,742,832 B) or GGUF via city96 ComfyUI-GGUF (Q4_K_M 9,651,728,896 B per expert, one expert active at a time). FP8 at 720p needs 48 GB — does not fit. No graph included — see `workflows/CHANGES.md` and `workflows/a14b-quality-tier.json`. |
| Reference-fidelity eval slot | **Phantom-Wan 1.3B** (Apache License 2.0) | 1-4 reference images, subject-consistent; VRAM number UNVERIFIED (single-GPU inference at 832x480 documented). Slot only, not yet run. |
| Cartoon inbetween eval slot | **ToonCrafter** (Apache License 2.0) | Purpose-built for cartoon keyframes; ComfyUI pruned FP16 ~12 GB (repo's Community Support listing); 512x320, <=16 frames. Slot only, not yet run. |
| Multi-shot eval slot | **MultiShotMaster** (Apache License 2.0) | Genuine single-pass multi-shot, built on Wan 14B. The production method does NOT depend on it — see DECOMP-MAP / jobs. Slot only, not yet run. |
| Cutout | `white_matte.py` PRIMARY (repo project code, in `avatar-stack/`), **BiRefNet** (MIT) backup | Owner-locked method + repo measurement: white-matte wins on white-field cartoon plates (recomposite diff 1.08 vs BiRefNet 1.79); BiRefNet is the only one that works on non-white-field plates. RVM was measured and rejected on this material — do not re-add it. |
| Composite + post | repo `freedom/scene_composite.py` | Contact shadows are drawn **at composite time only** — character art never carries a baked shadow. Grade goes after shadows (owner-locked order: shadows before colour). |
| Gates | repo `parity/preflight.py`, `parity/frame1_gate.py`, `likeness_gate.py` | A clip without its gate packet is not reportable. |

Full per-model licences, sizes and dispositions: `MODELS-MANIFEST.md`
/ `.json`. **Never ship:** LTX-2 (LTX-2 Community License, <$10M
revenue cap), LTX-Video 0.9.x (Apache-2.0 vs OpenRail-M licence
conflict, unresolved), HunyuanVideo either version (Tencent Hunyuan
Community License; territory exclusion EU/UK/South Korea) — all
eval/refused, detailed in the manifest.

## Cost — verified 2026-10-28, hosts only (generation is our own weights, $0/model)

| Host | RTX 4090 price | Notes |
|---|---|---|
| RunPod Secure Cloud | **$0.89/hr** | 24 GB GDDR6X, 41 GB RAM, 6 vCPUs (RunPod pricing page). Billed per second. Storage extra: container/volume disk $0.10/GB/mo, network storage $0.07/GB/mo under 1 TB. |
| RunPod Community Cloud | **$0.34/hr** | Same 24 GB card (RunPod 4090 page). RAM/vCPU for Community not listed on the public pages checked — UNVERIFIED. |
| Vast.ai | **no fixed price exists** | Marketplace: "Prices are set by the market, not by Vast" (vast.ai/pricing), billed per second. Third-party snapshots put usable on-demand 4090s around $0.35-$0.60/hr — indicative only, **check the live listing at deploy time**. Interruptible is 50%+ cheaper and preemptible. |

Budgeting warning from the verify report: most third-party trackers
still quote RunPod's older $0.69-$0.74/hr Secure price. The live
RunPod pages checked 2026-10-28 say $0.89. Budget on $0.89.

Cost per finished minute cannot be stated yet — scene-scale speed
on a 4090 is UNPROVEN (the 22.8x Turbo figure is a short test on the
Kaggle seat, and FastWan's 16 s figure is a vendor H200 number).
First 4090 run must measure: seconds per 49-frame segment, per
workflow, and that number goes in BUILD-REPORT's successor before
any per-episode cost claim is made.

## Layout

```
gpu-4090/
  README.md  DECOMP-MAP.md  MODELS-MANIFEST.json  MODELS-MANIFEST.md
  Dockerfile  download_models.sh  run_scene.py  BUILD-REPORT.md
  runpod/   template.json  start.sh
  vast/     onstart.sh  INSTANCE-NOTES.md
  workflows/  workflow-i2v-locked.json  workflow-turbo-fixed.json
              a14b-quality-tier.json  CHANGES.md
  jobs/     scene_job.4090.example.json
```

## How a run goes (when a 4090 is rented — not done yet)

1. Launch: RunPod from `runpod/template.json` + `runpod/start.sh`,
   or Vast from `vast/onstart.sh`. Models land on the persistent
   volume, never in the image (`download_models.sh`).
2. `python3 run_scene.py --job jobs/scene_job.4090.example.json
   --comfy http://127.0.0.1:8188 --workdir ./out` — per character:
   generate separately -> frame-1/likeness gate -> chain segments
   -> cutout -> composite over the living background -> post.
   Each segment names its **required view** and the
   **reference-pack still** for that view (see the Packs section
   above): generation starts from that still. If the video pack
   doesn't have the view yet, the moving version is built from
   the reference still — **never generated from nothing**.
   Any gate failure stops that character; nothing failed is
   composited or reported as a keeper.
3. Report only gate packets + measured timings. No packet, no claim.

## Based on (real repo files, all on main)

`parity/workflow-i2v-locked.json`, `parity/workflow-turbo-fixed.json`,
`parity/frame1_gate.py`, `parity/preflight.py`, `likeness_gate.py`,
`freedom/scene_job.example.json`, `freedom/scene_composite.py`,
`freedom/chain_segments.py`, `fetch_consistency_models.py`,
`backends.json`, `parity/A14B-TIER.md` — all under
`show/production/tooling/avatar-stack/` in
`mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start`, plus the two
2026-10-28 research files `VERIFY-4090-HOSTS-AND-MODELS.md` and
`EXISTING-DECOMP-EXTRACTION.md`. Where those sources disagree or
stay silent, this pack flags a GAP instead of filling it — see
BUILD-REPORT.md.
