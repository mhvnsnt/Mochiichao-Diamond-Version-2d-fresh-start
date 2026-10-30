# PARITY REPORT — our stack vs the hosted avatar tool (2026-10-28)

Measured, not rounded up. "Equal" claims require a measured result
behind them; anything else is named as a gap with its blocker.

| Hosted-tool trait | Our measured result | Verdict |
|---|---|---|
| Likeness / character lock | Only measured generation so far (Dorowani Water Orb proof): **FAIL — reference never anchored**, frame-0 gate SSIM 0.2938 (min 0.50), RGB MAD 100.29 (max 40). Root causes found since: (a) the workflow never engaged reference control; (b) the wrapper T5 loader rejects the staged scaled-fp8 UMT5, forcing native fallback; (c) the wrapper renamed `lora_args`→`lora`, so the Turbo LoRA may have been silently unmerged. Fixes are wired (`parity/workflow-i2v-locked.json` — VACE reference control engaged on the staged VACE model; `parity/workflow-turbo-fixed.json` — non-scaled UMT5 + corrected LoRA input) but **not yet run**. Note: there is **no IP-Adapter node for Wan** (checked against the full wrapper registry; matches backends.json's `not_a_wan_lock` correction) — VACE reference control is the real lock. | **NOT equal yet** — fixes wired, proof run owed |
| Character LoRAs | **Trained + staged**: Wispkin + Dorowani LoRAs (rank 16, 87,594,264 B each, sha256 in `lora/LORA-MANIFEST.md`), private Kaggle dataset `marsfmmg/mochiichao-character-loras`. BUT musubi-tuner cannot train TI2V-5B (verified at source: no ti2v-5B task; 16 vs 48 latent channels), so they are **Wan2.1-1.3B** LoRAs — they do not load in the current 5B scene. Trained from 1–2 distinct canon artworks per character: front-view identity anchors, not general character models. | **Partial** — exist + staged; wrong base for the 5B scene; thin source art |
| Prompt extension | Qwen2.5-VL-7B-Instruct (Apache-2.0) staged hash-verified (16 files, 16,595,981,281 B; cache kernel `marsfmmg/mochiichao-qwen25vl7b-cache`) and wired as a pre-ComfyUI step (`parity/qwen_prompt_extension.py` + optional `prompt_extension` field on job segments). In-graph extension cannot consume the VL checkpoint (flagged in QWEN-WIRING.md). Not yet exercised in a run. | **Wired, unproven in a run** |
| Motion amount / prompt-following (non-slot actions) | Test-scene job specified 4 non-slot actions (glide+mask tilt, Dark Wave, hops, Water Orb charge) + seg-3 follow-ups; the kernel COMPLETED on Kaggle, but the output harvest was refused by a Kaggle API **429 three times across two attempts** (09:52, 10:07, 10:23 UTC) — the segment MP4s have never been downloaded, so no motion number or prompt-following grade exists for the scene. The one harvested clip (proof) performed the orb action with the wrong character. | **Unmeasured** — blocked on one download command (TEST-REPORT §6) |
| Length | Scene as run: 2×81f ≈ **10.1 s per character** (> 8 s avatar ceiling, < 12–16 s target). Seg-3 package built (→ 15.2 s) but not run — it chains from the unharvested seg-2 files. | **Partial** — beats the ceiling, target not yet met |
| Multi-character scene composite | Freedom wiring smoke-tested locally (2 characters layered over the CURRENT living Gate background, composite-time shadows only — `freedom/SMOKE-TESTS.md`, PR #469). The generated-scene composite awaits the harvest. Background verified CURRENT: Gate v2-living, md5 `d2f1bf1d709d3a0e9d9d0f58dccc6c31` = registry. | **Wiring proven; generated composite pending harvest** |
| Wall-clock per clip | Native fallback measured: 1,236 s for 45 f (proof) and ≈3 h 56 m for 4×81 f (scene). The hosted tool returns in minutes; our accelerated path measured 78.5 s vs 1,787.6 s (22.8×) in an earlier A/B, but the current wrapper drift (T5 + LoRA-input rename) broke it — fix wired, not yet re-measured. | **NOT equal** — fix wired, re-measurement owed |
| Speed path (LightX2V) | Licence Apache-2.0 verified. Not taken for the 5B seat (our Turbo path already is a 4-step distill; no LightX2V 5B artifact exists); its A14B distill LoRA pair is written into the A14B staging option. | Evaluated, scoped |
| Quality tier (A14B) | Official A14B = 57,155,715,776 B per expert — cannot stage/run on the free Kaggle seat. Only stageable variant: GGUF Q4_K_M pair 19,303,457,792 B (QuantStack, Apache-2.0) with a written 3-dataset plan (`parity/A14B-TIER.md`), unproven. **Parity tier = 5B + engaged VACE lock + LoRAs**; A14B adds motion quality, not frame-1 identity. | Tier decision made + documented |
| Stills (FLUX.1-schnell) | Apache-2.0 verified. Not staged: official repo is gated-auto (needs licence acceptance + token — owner step), and the single file (23,782,506,688 B) exceeds every Kaggle kernel's disk. Working route found: diffusers-tree shards (each < disk limit) as 3 datasets, hashes re-verified vs BFL (`parity/FLUX-DATASET-ROUTE.md` + `flux_dataset_stage.py`). Default path stays canon-art-direct, so stills are not on the critical path. | **Gap, route documented** — owner step named |
| RIFE interpolation | rife47/49 (MIT) staged in `marsfmmg/mochiichao-wan22-consistency-kit` v1 (server-verified). In-scene RIFE outcome is recorded in the scene kernel's `scene-run-report.json` — unharvested, so unclaimed. | Staged; scene use unmeasured |
| Cost | Everything above is free parts on free tiers (Kaggle free GPU). Paid services were replaced, not wired (see `helpers/NONFREE-EQUIVALENTS.md`). | **Equal (free)** |

## Remaining blockers, named

1. **Kaggle 429 on `ListKernelSessionOutput`** — one harvest command
   (TEST-REPORT §6) unblocks: scene grading, RIFE outcome, seg-3 run,
   and the generated TEST-SCENE.mp4. Retry in a later attempt.
2. **Owner step (browser):** accept the FLUX.1-schnell licence on
   huggingface.co + add an HF token as Kaggle secret `HF_TOKEN` —
   only needed for the official-repo FLUX route; the mirror/diffusers
   route in FLUX-DATASET-ROUTE.md does not need it.
3. **Proof run with the fixes engaged** (locked workflow + Turbo fix
   + correct UMT5 file staged next to the kit) — the run that can
   first claim likeness parity, graded on character correctness.
4. **LoRA base gap:** 5B LoRA engagement waits on a TI2V-5B-capable
   trainer or a 1.3B scene variant; round-2 LoRAs want real model
   sheets (front/¾/side/back + expressions) — canon art Jamar's side
   can commission from the existing cast work.
5. **TeraBox masters** for the new weights (Qwen cache, LoRA dataset)
   ride the main lane's browser staging session — not an owner step.

---

## CORRECTIVE PASS — failure log entry, 2026-10-28 (owner's corrective-autonomy law)

**The failure, with evidence.** The single-character Dorowani Water Orb
proof (`dorowani_waterorb_proof_00001_.mp4`, 352,574 B, sha256
`6d958f4cdf3c334296b61523782e29d1ec9e47b01ec557c5c926f6c4827cbd4a`) was
delivered as a FAIL whose causes were already knowable before the run:
frame 1 is already the wrong character — an elongated 3D-style creature
with the shell worn like a hat. Frame-0 gate vs the canon cutout:
**SSIM 0.2938 (min 0.50), silhouette IoU 0.5902, RGB MAD 100.29
(max 40)**. Fed input was logged: `start.png` sha256
`aa124c9adc8caacd22628d06f4d1373e16e02e41bfb650028c014a58af0c5720`.
Fail class: **reference-never-anchored** (distinct from drift). The
two-character scene kernel completed on Kaggle but its outputs were
never harvested (API 429 at 09:52 / 10:07 / 10:23 UTC, three attempts,
two rounds), so the scene was reported without its clip existing
locally. The locked VACE workflow and the Turbo fixes were wired but
had never been run.

**Root causes (from the artifacts and the wrapper source, not labels):**
the run graph fed an unlocked plain I2V path; the wrapper's T5 loader
rejects the staged scaled-fp8 UMT5 unconditionally, forcing a silent
native fallback; the wrapper renamed the LoRA input `lora_args` ->
`lora`, so a Turbo LoRA fed under the old key can be silently ignored;
and no step in the pipeline forced a frame-1 verdict to travel with a
clip before the clip could be reported.

**Countermeasures wired in this pass (so this class cannot recur
silently):**
1. `parity/preflight.py` — runs BEFORE any GPU time and ABORTS the run
   when: the fed reference image is missing/unreadable or its sha256 is
   not logged or mismatched; a VACE workflow lacks an engaged
   `reference_image`/`ref_images` graph connection (or, native, the
   `TrimVideoLatent.trim_amount` wire from `trim_latent`); any stale
   `lora_args` key exists, a LoRA strength is <= 0, or a LoRA selector
   output is not consumed by a model loader's `lora` input; a wrapper
   T5 node is fed a scaled-fp8 file by name, or a supplied T5 file's
   safetensors header actually contains a `scaled_fp8` key.
   14 unit tests (`parity/test_preflight.py`) cover every abort class
   plus both corrected workflows passing.
2. `parity/frame1_gate.py` — automatic frame-1 gate on every output.
   It decodes the actual frames, compares frame 1 against the FED
   reference and (when a species is given) the canon cutout, samples
   mid/last frames, and writes a packet labelling the clip `pass`,
   `reference-never-anchored`, `drift`, or `fail-cannot-measure`.
   A clip without this packet is not reportable. Verified both ways
   locally: the failed proof above reproduces SSIM 0.2938 at frame 0
   and is labelled `reference-never-anchored`; a control clip made
   from the reference itself passes.
3. The locked run and scene harvest in this pass run under these two
   gates; their packets are recorded with the run (see
   `parity/CORRECTIVE-RUN-2026-10-28.md` when the run lands).

## 2026-10-28 — LOCKED RUN v1 (Kaggle kernel `marsfmmg/mochiichao-locked-run`): FAILED — the kernel's own 2400 s wait limit; no clip

Kaggle's stamp for this run says "Successful". The run's own
`out/run-report.json` says **FAILED**, and the report governs: the
exception is `RuntimeError: locked: timed out`, raised by the kernel
script itself (`script.py` line 117, in `run_graph`) when its built-in
2400 s wait for the locked graph expired.

- **Preflight: PASS for both graphs** (locked strict-VACE + turbo). The
  fed reference `dorowani_start_tight.png` (480×768) hash-matched the
  manifest; the graphs checked out at 13 nodes (locked) and 12 nodes
  (turbo).
- **Run:** Tesla T4 ×2; total kernel runtime 2570.8 s (Kaggle-measured).
  The locked prompt was submitted and waited on for the full 2400 s.
- **Output: none.** No MP4 was produced. The turbo phase and the
  frame-1 gates never ran: in v1 the locked phase ran first and was not
  failure-isolated, so its timeout aborted the whole kernel.
- **comfy.log diagnosis (captured log, 124 lines):** ComfyUI 0.43.0
  boots, both T4s are detected, exactly one `got prompt` is logged,
  then the VAE loads and the text encoder loads (`Requested to load
  WanTEModel` / `Model WanTEModel prepared for dynamic VRAM loading.
  6419MB Staged`). **The log ends there.** It contains no
  diffusion-model (transformer) load line, no sampling progress (no
  tqdm bars, no step counts, no per-step times), no `Prompt executed`,
  and no error or traceback; its lines carry no timestamps.
  - What this proves: the captured record reaches prompt receipt plus
    VAE and text-encoder loading, and nothing further was logged.
  - What it does **not** prove: whether generation was progressing
    slowly or was stuck. There is no sampling evidence in the log at
    all, so neither "just slow" nor "stuck" can be claimed from this
    artifact, and no per-step time exists to quote.
- **Countermeasure — kernel v2** (`parity/locked_run_kernel.py`):
  (a) per-graph wait 2400 s → 4 hours; (b) progress capture — while a
  graph runs, ComfyUI's `/queue` + `/history` state and the tail of the
  live comfy log are flushed into `run-report.json` every ~30 s, so a
  timeout still reports how far the graph got; (c) phase order reversed
  and failure-isolated — turbo first, then locked, then the negative
  control — with gates run on every clip that exists, so the run cannot
  return empty-handed; (d) preflight strictness and gate thresholds
  unchanged. The report-writing path is covered by
  `parity/test_locked_run_report_path.py` (timeout + completion paths
  exercised locally against the shipped code). Re-run pending; it is
  driven separately, and its result appends here when it lands.

---

## Locked run v3 — 2026-10-28 (HORSEPOWER PROGRAMME)

Kernel `marsfmmg/mochiichao-locked-run` version 3 = `parity/locked_run_kernel_v3.py`
(lane-agnostic runner: Kaggle datasets, or Hugging Face weights on
Colab/generic). Full record: `parity/HORSEPOWER-REPORT.md`. The two v2
defects are fixed at the cause:

- **Gate cannot-measure (bug 1):** the canon cutouts now ship inside the
  job — embedded in the kernel (sha256-pinned to
  `show/production/canon-cutouts/`), written to `{JOB}/canon-cutouts/`
  and to the gate's legacy default path, and the gate is called with
  `--cutouts`. The locked-job dataset carries them too (2026-10-28
  version). A clip's packet can no longer die on a missing workspace
  path.
- **Turbo 96-vs-48 (bug 2):** the doubling node was
  `WanVideoImageToVideoEncode` (node 8) — its `y` latent is
  channel-concatenated onto the 48-channel noise by the wrapper's model
  forward, into a TI2V-5B patch_embedding of in_dim 48 (verified from
  the checkpoint header). The graph now uses the vendor's TI2V pattern
  (`WanVideoEncode` → `WanVideoEmptyEmbeds.extra_latents`), and
  `preflight.py` aborts this class before GPU time (channel-contract
  check; the v2 graph shape fails it locally, exit 2). Upstreams are
  pinned (ComfyUI c7bd15c2…, WanVideoWrapper 088128b2…) — v1/v2 floated
  HEAD, so v2's wrapper version was never recorded.

### v3 run results (Kaggle, 2026-10-28, one run)

- **Turbo: CLIP PRODUCED** (`turbo_fixed_dorowani.mp4`, 624,665 B,
  sha256 971d7c5d…), **175.2 s** — the 96-vs-48 RuntimeError is gone.
  Gate: frame 0 vs canon PASS (SSIM 0.9923 / IoU 0.9816 / MAD 3.0);
  overall FAIL, class `drift` (frame 24 SSIM 0.2373) — a measured
  quality result, not a pipeline failure.
- **Locked:** clip (401,670 B, sha256 87f02a32…), **965.7 s** (v2:
  1,225.9 s), history audit OK. Gate: FAIL, class
  `reference-never-anchored` (frame 0 SSIM 0.3378 / IoU 0.6618 /
  MAD 74.9) — measured numbers in the packet; the v2
  fail-cannot-measure is fixed.
- **Control:** clip (sha256 ec120742…), **941.0 s**;
  `control_follows_reference: false` (frame-0 SSIM 0.168 vs Wispkin
  reference, 0.220 vs Dorowani) — no false pass.
- Preflight PASS both graphs (incl. channel contract); pins recorded
  in run-report.json (ComfyUI c7bd15c2…, wrapper 088128b2…);
  in-kernel total 2,266.4 s. All clip hashes re-verified against the
  harvested files.
- Orchestration + multipliers (same programme, expansion): one queue
  over every verified lane (`parity/lane_queue.py` + `lanes.json`,
  job_format_v2 in/out, failover + quota ledger, 7/7 tests), runner
  defaults for timing/RIFE/chaining (`parity/runner_defaults.json`),
  seat rates + the capacity table in `parity/HORSEPOWER-REPORT.md`
  §6. The timing/RIFE multiplier kernel was still in flight at
  landing (4 h 37 m, §6), so those two multipliers are recorded
  UNMEASURED there — never projected as results.
