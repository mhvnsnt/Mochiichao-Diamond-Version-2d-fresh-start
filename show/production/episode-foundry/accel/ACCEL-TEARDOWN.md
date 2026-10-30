# ACCEL TEARDOWN — best-in-class acceleration for Wan 2.1 / VACE-1.3B on Turing T4

Date: 2026-10-28. Judged against OUR stack only: the foundry kernel's
**native ComfyUI graph** (`UNETLoader` → `ModelSamplingSD3` (shift 8.0)
→ `KSampler` uni_pc/simple, 30 steps, CFG 5.0; `WanVaceToVideo`
480×768, 49 frames/pass, FP16 UNET) on a Kaggle Tesla T4 (Turing,
sm75, 14,912 MB usable). Baseline per-pass cost is **UNMEASURED**
(central estimate 325 s/pass, `CAP-ANALYSIS.md` §3.3) — the proof cut
V3-078 is the first real measurement, and every disposition below is
built to ride on it (`AB-PROTOCOL.md`). Nothing here ships on
reputation: a candidate is WIRE only if it is semantics-preserving
or vendor-default on this exact graph class; everything with real
upside but unproven VACE behaviour is TEST-ON-PROOF; everything
that fails on hardware, dimension, licence, or integration facts is
REJECT with the evidence named.

Licence buckets per the honesty law. "Verified" = the licence file /
repo metadata / model card was read this session (source named).
Counts: **31 candidates evaluated — 5 WIRE, 7 TEST-ON-PROOF,
19 REJECT.**

Two corrections to earlier paperwork, found by re-checking sources
today (verify-then-state):

1. **LightX2V's VACE seat is not a distillation seat for our model.**
   The pinned local clone's `configs/wan/wan_vace.json` (commit
   543cff4…, read this session) is `infer_steps: 50`,
   `sample_shift: 16`, attention `flash_attn3`, and its run script
   targets **Wan2.1-VACE-14B** at 480×832/81 frames. `LIGHTX2V-EVAL.md`
   §2's phrase "LightX2V's own `run_wan_vace.sh` is its VACE
   step-distillation seat" is loose: the script exists, but the
   config it runs is a full-step 14B config whose attention backend
   cannot run on Turing. The eval's bottom line (no VACE-1.3B
   distill artifact for the Comfy graph) stands and is re-confirmed
   below.
2. **MagCache does claim official VACE support** (repo news,
   2025-06-17: "Support VACE 1.3B&14B officially") — in its own
   framework. That upgrades it from unconsidered to TEST-ON-PROOF,
   but it does not verify the native ComfyUI VACE graph (see §3).

---

## 1. Distilled-step / light variants (the big prize, mostly absent)

Step distillation is the only lever with a measured >10× on this
programme (TI2V-5B Turbo A/B: 78.5 s vs 1,787.6 s = 22.8×, 4 steps /
CFG 1.0 + torch.compile, `CAP-ANALYSIS.md` §3.2). The question is
whether any distilled artifact exists **for the VACE-1.3B native
graph**. Answer, re-verified today: **no.**

### 1.1 LightX2V framework VACE seat — REJECT (for this stack)
- What: ModelTC/LightX2V inference framework running VACE via
  `scripts/wan/run_wan_vace.sh` + `configs/wan/wan_vace.json`.
- Source + licence: repo **Apache-2.0** (LICENSE read in the pinned
  local clone, commit 543cff43829177f1032938809612f748a29d1a53;
  HF `lightx2v/Wan2.1-Distill-Models` card badge likewise Apache-2.0,
  read this session). Bucket: **open source (Apache-2.0)**.
- Turing verdict: **FAIL as configured** — the VACE config sets
  `flash_attn3` for self/cross attention; FlashAttention-3 is
  Hopper-only and FA2 is sm80+ (§4). The programme's T4 profile for
  LightX2V already had to rewrite attention to `torch_sdpa`.
- VACE-graph verdict: **framework swap, not a profile.** It targets
  VACE-**14B** (28 GB FP16 — does not fit a 14.9 GB T4 without the
  FP8/INT8 variants, which have no Turing acceleration), at
  50 steps — it is not even a step-distilled configuration.
- Claimed speedup: framework card claims "≈2× faster than ComfyUI"
  (vendor claim, for its distilled I2V/T2V models on unspecified
  hardware). Not a VACE-1.3B measurement.
- Disposition: **REJECT.** Revisit only as a separate gated
  experiment if a 1.3B VACE distill config ever ships.

### 1.2 LightX2V distill LoRAs / distilled models for Wan 2.1 — REJECT
- What: 4-step CFG/step-distilled LoRAs and full checkpoints
  (`lightx2v/Wan2.1-Distill-Models`, `lightx2v/Wan2.1-T2V-14B-StepDistill-CfgDistill`).
- Licence: HF cards declare **Apache-2.0** (verified in
  `LIGHTX2V-EVAL.md` §1; card badge re-read this session).
  Bucket: **open source (Apache-2.0)**.
- VACE verdict: every artifact is **14B T2V/I2V**. No VACE artifact,
  no 1.3B artifact. A 14B LoRA cannot load on the 1.3B graph at all:
  Wan architecture table (Wan-AI cards) — 1.3B dim 1536 / 12 heads /
  30 layers vs 14B dim 5120 / 40 heads / 40 layers; LoRA shapes do
  not match. The community rank-16 extraction of the 14B distill
  (Blyss/Blissful) claims testing on "T2V, I2V, and SkyReels V2" —
  VACE is not among its tested targets, and it is still a 14B LoRA.
- Disposition: **REJECT** (dimension mismatch is a hard fact, not a
  quality judgement).

### 1.3 QuantStack LightX2V-StepCfgDistill-**VACE**-GGUF (14B) — REJECT
- What: a community GGUF that injects VACE scopes into the LightX2V
  14B step/CFG-distilled T2V model; runs in ComfyUI via ComfyUI-GGUF.
- Source + licence: HF card (read this session) states only "All
  original licenses and restrictions from the base models still
  apply" — **no licence of its own declared on the card; bucket:
  UNVERIFIED** (do not ship on it).
- VACE verdict: it *is* VACE-shaped — the only distilled-VACE
  artifact found. But it is **14B**, needs the GGUF loader (a
  different UNET path than the kernel's asserted FP16 staging —
  `foundry_kernel.py` asserts the exact staged FP16 file by name
  and byte size), and its card's VAE reference is a **bf16** VAE
  (no BF16 acceleration on Turing).
- Disposition: **REJECT** for the proof A/B (checkpoint + loader
  swap confounds the baseline measurement; licence unverified).
  Named here as the most concrete distilled-VACE artifact in
  existence, for a possible later separate experiment.

### 1.4 Self-Forcing VACE-1.3B checkpoint (`lym00/Wan2.1-T2V-1.3B-Self-Forcing-VACE`) — REJECT (for the proof A/B; highest-value future experiment)
- What: a full 1.3B checkpoint merging Self-Forcing (few-step
  autoregressive distillation) with VACE scopes; community workflows
  run it in **pure ComfyUI core** (only VideoHelperSuite extra) at
  **6 steps** through the same `WanVaceToVideo` node we use
  (Civitai workflow records, read this session).
- Source + licence: HF repo by a community author; **no licence
  verified on its card in this sweep — bucket: UNVERIFIED.**
  Underlying Self-Forcing is MIT and base Wan is Apache-2.0 per
  `LIGHTX2V-EVAL.md` §4's note on the sibling Turbo artifact, but
  this merge's own terms were not verified, so it is not labelled.
- Turing verdict: plausibly fine (FP16 1.3B, core nodes only) —
  unmeasured on T4.
- VACE verdict: architecturally the right shape — the ONLY
  few-step artifact found that targets VACE-**1.3B** in the native
  graph. But adopting it means swapping the checkpoint the kernel
  stages and asserts, i.e. changing the model under test, not
  accelerating the proven one. Its likeness behaviour against our
  gate (frame-1 anchor + canon SSIM/IoU/MAD) is unknown, and
  Self-Forcing's streaming design targets a different sampling
  regime than our chained 49-frame passes.
- Claimed speedup: workflows prescribe 6 steps vs our 30 (≈5×
  step-count reduction before CFG effects); no T4 timing exists.
- Disposition: **REJECT for the proof-cut A/B** — it would destroy
  the baseline measurement the whole foundry is waiting on.
  **Flagged as the #1 separate experiment after the proof cut
  measures the baseline:** same gate, same cut, checkpoint staged
  as its own dataset, licence verified on its card before staging.

### 1.5 CausVid LoRA (Kijai) — REJECT
- What: distilled LoRA enabling 4–12 steps at CFG ~1; ComfyUI's own
  VACE template guidance mentions it ("with CausVid LoRA use fewer
  steps (2–4) and a low cfg (~1.0)" — comfy.org VACE template,
  read this session).
- VACE verdict: the guidance and the artifacts are for **VACE-14B /
  T2V-14B**. Same hard dimension mismatch as §1.2 for our 1.3B graph.
  Community VACE workflows pair CausVid with 14B and Self-Forcing
  with 1.3B — the ecosystem itself routes around this.
- Licence: no licence declared on the Kijai repack (per
  `THROUGHPUT-ARCH.md` §4.2's standing note on the sibling artifact).
- Disposition: **REJECT** (14B artifact, 1.3B graph).

### 1.6 FastWan / FastVideo (hao-ai-lab) — REJECT
- What: sparse-distilled Wan models (3-step) + its own inference
  framework; recipes exist for Wan2.1-T2V-1.3B, T2V-14B, Wan2.2-TI2V-5B.
- Source: FastVideo repo / HF cards (read this session). Licence
  **not verified in this sweep** — rejected on task mismatch, so no
  bucket is asserted.
- VACE verdict: **no VACE model or recipe exists** in its catalog;
  adopting it is a framework swap whose headline numbers are
  H100 measurements ("50× at 480P on a single H100", HF card).
  Its sparse-attention component (VSA) has no T4 evidence.
- Disposition: **REJECT.**

### 1.7 TurboDiffusion (thu-ml) — REJECT
- What: rCM distillation + SageAttention/SLA sparse attention;
  vendor README claims 97× on Wan2.1-1.3B 480p (184 s → 1.9 s,
  their hardware, via DeepWiki's rendering of the README).
- VACE verdict: T2V only, no VACE path; its attention stack is the
  SageAttention family rejected for sm75 in §4.
- Disposition: **REJECT** (no VACE; attention stack fails Turing).

### 1.8 Phased Consistency Models (PCM) — REJECT
- What: consistency-distillation method + LoRA weights.
- Source: PCM paper/repo (G-U-N/Phased-Consistency-Model). Released
  weights are for **SD1.5 / SDXL / SD3** (Replicate mirror of the
  PCM README, read this session, lists exactly those). Its video
  result was trained on a different base; **no Wan weights, no VACE
  weights, no ComfyUI-Wan path exist.**
- Disposition: **REJECT** (a training method, not an artifact we
  can wire; distilling VACE-1.3B ourselves is a training programme,
  not an acceleration profile).

---

## 2. Sampling-side (wireable today, in the native graph)

### 2.1 Step reduction 30 → 20, uni_pc/simple kept — **WIRE** (accel-a)
- Evidence: ComfyUI's official VACE template default is **steps=20,
  cfg=6.0** (comfy.org workflow page, read this session) — 20 steps
  is the vendor's own default operating point for this exact node
  family, not an exotic cut. Community VACE guidance: 30–50 steps
  for top quality, ~20 steps as the fast operating point. Wan's own
  upstream default is UniPC at 50 steps for the standalone repo;
  our baseline already sits at 30.
- Expected: per-pass time scales ~linearly with steps → **≈1.5×**
  on the sampling portion, before any other lever. Quality risk is
  real but bounded, and the gate decides (AB-PROTOCOL).
- CFG stays 5.0 and shift stays 8.0 in both arms (see §2.4/§2.5).

### 2.2 Step reduction 30 → 25 — **WIRE** (accel-lite variant)
- The conservative rung: ≈1.2× step-count reduction with compile.
  Exists so a failed accel-a gate run has a named fallback that is
  still faster than baseline, instead of an improvised edit.

### 2.3 Sampler swap: `dpmpp_2m` / `dpmpp_2m_sde` — TEST-ON-PROOF
- UniPC is Wan's own chosen solver (the upstream repo and every
  Wan integration default to it; our baseline already runs it).
  UniPC's published strength is fast convergence at low NFE on
  image benchmarks; there is **no Wan-VACE-specific evidence** that
  DPM++ converges in fewer steps on this graph, and the SDE variant
  is stochastic (worse A/B hygiene). The profile layer exposes
  `FOUNDRY_ACCEL_SAMPLER=dpmpp_2m` as a named variant; no named
  profile uses it. It earns a profile only by beating uni_pc at
  equal steps on the proof cut's gate.

### 2.4 CFG reduction as a speed lever — REJECT (as a speed claim)
- In ComfyUI's sampler, cond+uncond are computed every step
  regardless of the CFG value; lowering CFG 5.0 → 3.5 changes the
  guidance math, not the per-step cost. (CFG 1.0 on a *distilled*
  model saves the uncond pass — but that saving belongs to the
  distill artifacts rejected in §1.) CFG is a quality variable
  here; both A/B arms keep 5.0.

### 2.5 ModelSamplingSD3 shift change (8.0 → other) — REJECT (for the A/B)
- Shift values in the wild for Wan-family: 5.0 (Wan standalone /
  Ovi defaults), 8.0 (our attempt-3 "eval starting point"; the
  Self-Forcing extraction's prescribed flow_shift), 16 (LightX2V's
  14B VACE config). No VACE-1.3B-specific evidence ranks them, and
  shift is a trajectory/quality variable: changing it in the
  accelerated arm would confound the A/B. Both arms keep 8.0.

### 2.6 Resolution / frame-count reduction — REJECT
- 49f @ 16 fps, 480×768 is the proven pass shape (attempt-3
  AUDIT_PASS 480,768,49; the kernel's chaining math is built on
  it). VACE-1.3B is a 480p model (Wan repo: 1.3B supports 480P;
  720P "generally less stable" even for T2V-1.3B). Cutting frames
  or pixels would buy speed by delivering a different product and
  breaking the trim/chain arithmetic. No evidence supports it.

---

## 3. Cache accelerators (the VACE control branch is the risk)

All cache methods skip transformer computation on some steps by
reusing residuals. In a VACE graph the transformer output is a
function of (latent, timestep-embedding, **control latent, mask,
reference latent**) — the control branch changes the residual
trajectory, so coefficients calibrated on plain T2V/I2V do not
automatically transfer. That is why no cache ships as default.

### 3.1 EasyCache (ComfyUI core) — **WIRE** as the cache arm (accel-b) + TEST-ON-PROOF
- What: ComfyUI-core model-patcher node; skips sampling steps when
  the step-to-step change falls under `reuse_threshold`, inside a
  `start_percent`–`end_percent` window.
- Source + licence: ComfyUI itself (GPL-3.0 — ComfyUI's licence;
  the node is core, no new dependency). Vendor claim (Comfy blog,
  read this session): EasyCache/LazyCache "do not need a set of
  hyperparameters to be optimized for a model… all models going
  forward have Day 0 support" — i.e. its design claim is exactly
  model-agnosticism, unlike TeaCache/MagCache's per-model
  coefficients. A Wan2.2 workflow in the wild runs it at
  reuse_threshold 0.8, 0.0–1.0 window (DeepWiki workflow record).
- VACE verdict: no VACE-specific verification exists — hence it is
  NOT in accel-a. accel-b adds it with a protective window
  (start 0.15 / end 0.95: the early motion/reference-defining steps
  and the final refinement steps always compute) at threshold 0.8.
- Claimed speedup: 20–40% sampling-time reduction (DeepWiki's
  summary of the workflow record — secondary, unmeasured by us).
- Disposition: **WIRE (transform implemented) / TEST-ON-PROOF
  (promotion decided only by the A/B gate rule).**

### 3.2 TeaCache (ali-vilab) + native ComfyUI-TeaCache node — TEST-ON-PROOF (not wired)
- What: timestep-embedding-aware residual caching; per-model
  rescaling coefficients.
- Source + licence: **Apache-2.0** — repo LICENSE + repo metadata
  read this session (ali-vilab/TeaCache, commit 7c10efc…). Bucket:
  **open source (Apache-2.0)**. Upstream supports Wan2.1 T2V/I2V
  (news 2025-03-05/13). The native-graph ComfyUI node
  (welltop-cn/ComfyUI-TeaCache) advertises Wan2.1 native T2V/I2V
  speedups of **1.6–2.3×** (RunComfy's node guide — secondary
  source; upstream's own Wan2.1 claim is "approximately 2×").
- VACE verdict: **unproven.** Upstream has no VACE entry; the
  native node's Wan support is T2V/I2V. The Kijai *wrapper* graph
  does pair TeaCache with VACE (`WanVideoTeaCache` in its VACE
  example, rel_l1_thresh 0.1) — but that is a different graph
  (wrapper sampler, wrapper VACE conditioning), and this kernel is
  the native graph by design (the wrapper seat is where the T5
  defect lived). Coefficients/behaviour do not transfer by
  assertion.
- Disposition: **TEST-ON-PROOF, not wired.** `accel_profile.py`
  exposes `teacache_transform_available() -> (False, reason)` so
  the unwired state is explicit in code, and a future lane flips
  it only with a native-graph VACE verification recorded here.
  Test shape if taken: threshold at the conservative end
  (rel_l1_thresh ≈ 0.1, per the wrapper VACE example), gate decides.

### 3.3 MagCache (Zehong-Ma) — TEST-ON-PROOF (not wired)
- What: magnitude-ratio-aware caching; needs one calibration sample
  per model instead of TeaCache's curated set.
- Source + licence: **Apache-2.0** — repo LICENSE + README licence
  section read this session (Zehong-Ma/MagCache, commit df81cb1…).
  Bucket: **open source (Apache-2.0)**.
- VACE verdict: **officially supported in its own framework**
  (news 2025-06-17: VACE 1.3B & 14B; `MagCache4VACE` listed under
  Video Editing) and in Kijai's wrapper (`WanVideoMagCache`).
  Its ComfyUI node (ComfyUI-MagCache) advertises Wan2.1 support.
  Still unverified on the **native** graph's VACE branch, and it
  needs a calibration pass our kernel has no slot for today.
- Claimed speedup: paper (NeurIPS 2025) 2.68× on Wan2.1 (their
  framework/hardware); a community ComfyUI test reports 920 s →
  424 s ≈ 2.2× (AInVFX blog — secondary).
- Disposition: **TEST-ON-PROOF, not wired** — second cache
  candidate after EasyCache, because EasyCache needs no new
  dependency and no calibration. If EasyCache's gate result is
  good, MagCache is the follow-up test; if EasyCache fails the
  gate, MagCache's VACE-framework support makes it the next
  candidate rather than TeaCache.

### 3.4 TaylorSeer / cache-dit — REJECT
- What: cache-then-forecast (Taylor-expansion feature prediction);
  paper claims up to ~5× on FLUX/HunyuanVideo.
- Integration reality: TaylorSeer's own repo targets its paper's
  models; the maintained toolbox (vipshop/cache-dit) supports
  Wan2.1-**T2V** and Wan2.1-FLF2V **Diffusers pipelines** — no
  VACE, no native ComfyUI graph path. Wiring it means a framework
  swap to Diffusers, which is a different foundry road.
- Disposition: **REJECT** (no integration path on this stack).

---

## 4. Attention on Turing (sm75)

Baseline fact: the attempt-3 log already shows **"Using pytorch
attention"** — PyTorch SDPA is the incumbent. The question is only
whether anything beats it *on sm75*.

| Candidate | Turing verdict | Evidence | Disposition |
|---|---|---|---|
| PyTorch SDPA (pin via `--use-pytorch-cross-attention`) | Runs; incumbent | attempt-3 comfy.log; LightX2V T4 profile also standardises on `torch_sdpa` | **WIRE** (explicit pin in every non-baseline profile, so backends cannot drift between A/B arms) |
| FlashAttention-2 | **Cannot run** | FA2 requires sm80+; the sm75 assertion error is documented ("FlashAttention only supports sm80 and sm90, but got sm75") | REJECT |
| FlashAttention-1 / community Turing fork (ssiu/flash-attention-turing) | Runs standalone; claims ~2× over SDPA on T4, head_dim 64/128 only, seq len divisible by 128 | fork's README via DeepWiki | REJECT — no ComfyUI integration exists; an unmaintained single-author kernel fork is not wiring, it's a research project |
| SageAttention (v1/v2) | **Fails on sm75 in the field** | Sage kernels target sm80/86/89/90 (+Triton fallback); a Turing field handbook (IvenKooLab/minimax-h3-turing, read this session) reports SageAttention Triton INT8 kernels fail to compile on sm_75 across Triton versions and the CUDA kernel crashes in a real pipeline — different model, same architecture fact. SageAttention2's FP8 PV path additionally needs FP8 hardware Turing lacks | REJECT on T4 (revisit on any Ampere+ seat, e.g. a rented 4090) |
| xformers memory-efficient attention | Runs on T4 (HF Diffusers' old optimisation table measures T4: 3.5 → 5.5 it/s with xformers on SD1.5) | HF docs table, read this session | TEST-ON-PROOF — not wired: SDPA's mem-efficient backend is the same algorithm family, xformers adds a version-fragile install on Kaggle, and ComfyUI silently prefers it when present, which would *unpin* the A/B's attention backend. Test only as a deliberate, logged variant |

---

## 5. Compile / precision / execution-level

### 5.1 torch.compile via core `TorchCompileModel` — **WIRE** (accel-lite / accel-a / accel-b)
- What: core ComfyUI model-patcher node wrapping the UNET forward
  in `torch.compile` (inductor). Inserted as
  UNETLoader → TorchCompileModel → ModelSamplingSD3 → KSampler.
- What transfers from the 22.8× anchor: **almost none of the
  number.** That A/B's dominant term was step distillation
  (30+ steps → 4, CFG 5 → 1); compile's isolated contribution was
  never separated in our records. Honest expectations from others'
  measurements: ~14% on image diffusion models (ai-image-journey's
  measured CompileModel table, cudagraphs backend, no quality
  change), ~30% anecdote on a Flux GGUF build (comfy.icu node
  guide). On this graph: **expect 0–30%, measure it.**
- Why it fits the foundry specifically: compile cost is paid once
  per shape; the kernel runs 295 same-shape passes (480×768×49) per
  episode, so amortisation is the best case compile ever gets.
  The A/B protocol therefore reports per-pass time both including
  and excluding the first (compiling) pass, and the decision rule
  uses steady-state passes with the total also reported.
- Risk: if the cloned ComfyUI's TorchCompileModel schema differs,
  the kernel's live `object_info` validation fails the cut at
  preflight (no GPU time spent) — fail-safe by construction.

### 5.2 `--fast fp16_accumulation` — TEST-ON-PROOF
- ComfyUI's own help text for `--fast`: "Enable some untested and
  potentially quality deteriorating optimizations" (cli_args,
  read this session). FP16 accumulation trades accumulation
  precision for speed on FP16 tensor-core matmuls — a real Turing
  path, but a likeness gate is exactly where accumulation error
  would show. Exposed as `FOUNDRY_ACCEL_FAST_FP16ACC=1`; in no
  named profile.

### 5.3 `--fast fp8_matrix_mult` — REJECT
- Turing has no FP8 tensor cores (FP8 arrives with Ada/Hopper —
  see §5.4's precision ladder). Our UNET is FP16 anyway; the only
  FP8 object in the graph is the UMT5 encoder, which loads via
  dequant. Nothing for this flag to accelerate.

### 5.4 TF32 toggles — REJECT (hardware fact)
- Turing tensor cores: FP16 / INT8 / INT4. **TF32 and BF16 arrive
  with Ampere (sm80)** — confirmed across NVIDIA's architecture
  record (Turing precision matrix: TF32 ✗, BF16 ✗; CUTLASS tensor-
  core evolution table, read this session) and the programme's own
  research report. `torch.backends.cuda.matmul.allow_tf32` on a T4
  is a no-op; wiring it would be a fake win. (This also kills every
  recipe whose headline includes a TF32 term — e.g. the H100
  MagCache/TF32 stack article's 1.57× TF32 factor does not exist
  on our seat.)

### 5.5 cuDNN benchmark mode — REJECT (not wireable, low value)
- ComfyUI exposes no flag for `torch.backends.cudnn.benchmark`;
  the kernel cannot set it in the server process without patching
  ComfyUI (out of bounds for a profile layer). Value would be low
  anyway: benchmark mode pays off when convolution shapes vary;
  ours are fixed for 295 passes.

### 5.6 VAE tiling / sliced decode (`VAEDecodeTiled`) — REJECT (as an accelerator)
- Tiled decode trades **time for VRAM** (sources are explicit:
  tiles lower peak memory at the cost of more decode operations +
  blending). At 480×768×49 the plain decode is not our bottleneck
  and not OOM-bound on 14.9 GB. It stays available as an OOM
  fallback if a future larger shape needs it — it is not speed.

### 5.7 `--highvram` (keep models resident) — TEST-ON-PROOF
- The batch kernel reuses one server for all passes; if ComfyUI's
  smart-memory unloads the 11.3 GB of weights between passes,
  reload time is pure waste. `--highvram` pins them — at the cost
  of OOM headroom during sampling. Unmeasured either way on this
  graph; exposed as `FOUNDRY_ACCEL_HIGHVRAM=1`, in no named profile.

### 5.8 CPU offload / block swap — REJECT
- Wrapper-graph features (`WanVideoBlockSwap` etc.); the native
  graph's models fit the T4, and offloading *adds* PCIe traffic.
  Offload is a memory tool for models that don't fit — ours fits.

### 5.9 Async offload / pinned memory toggles — REJECT
- No ComfyUI launch surface exposes these as independent flags for
  this graph; ComfyUI's smart-memory manager already handles
  model residency. Nothing concrete to wire; claiming otherwise
  would be inventing a knob.

---

## 6. What got wired (summary)

`kernel/accel_profile.py`, consumed by `foundry_kernel.py` via
`FOUNDRY_ACCEL` (default `baseline` = untouched proven recipe):

| Profile | Changes vs baseline | Launch flags |
|---|---|---|
| `baseline` | none | none |
| `accel-lite` | steps 25, TorchCompileModel(inductor) | `--use-pytorch-cross-attention` |
| `accel-a` | steps 20, TorchCompileModel(inductor) | `--use-pytorch-cross-attention` |
| `accel-b` | accel-a + EasyCache(0.8, 0.15–0.95) | `--use-pytorch-cross-attention` |

Optional toggles: `FOUNDRY_ACCEL_SAMPLER=dpmpp_2m`,
`FOUNDRY_ACCEL_FAST_FP16ACC=1`, `FOUNDRY_ACCEL_HIGHVRAM=1`.
Transforms touch only KSampler scalars and model-patcher links;
the VACE reference/control/mask wiring, the TrimVideoLatent repair,
prompts, seeds and the gate are untouched (asserted by
`accel/test_accel_profile.py`, PASS 2026-10-28). Every cut's ledger
entry records the profile's transforms in `workflow_repairs`, and
the run log records `ACCEL_PROFILE <name> launch_flags=[...]`.
A named profile whose module cannot be found is a hard stop in the
kernel — never a silent baseline run under an accelerated label.

## 7. Rejected, in one line each (evidence in the sections above)

LightX2V VACE seat (14B, 50 steps, flash_attn3) · LightX2V 14B
distill LoRAs (dim mismatch 5120≠1536) · QuantStack distilled-VACE
GGUF (14B, loader swap, licence unverified) · Self-Forcing VACE-1.3B
checkpoint (model swap; licence unverified; post-proof experiment
#1) · CausVid LoRA (14B artifact) · FastWan (no VACE) ·
TurboDiffusion (no VACE, Sage stack) · PCM (no Wan weights) ·
TaylorSeer/cache-dit (Diffusers only) · FlashAttention-2 (sm80+) ·
FA1/Turing fork (no Comfy integration) · SageAttention (sm75 kernel
failures) · TF32 (hardware absent) · `--fast fp8_matrix_mult`
(no FP8 cores) · cuDNN benchmark (no launch surface) · VAEDecodeTiled
as speed (it's a memory tool) · CFG-as-speed (no per-step saving) ·
shift change in the A/B (confound) · resolution/frame cuts
(different product) · block swap / CPU offload (fits already;
offload is slower) · async/pinned-memory flags (no such surface).
