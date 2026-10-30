# CAP ANALYSIS — what actually capped the proven route at "5/day", what caps the replica, and what the replica can produce

Date: 2026-10-28. Companion: `THROUGHPUT-ARCH.md` (the architecture
that spends the budget computed here). Every number below is either
cited to a record on disk or labelled **ESTIMATE** / **SCENARIO**.
No Kaggle session was launched for this analysis.

**Headline correction, stated first:** the remembered "5/day" cap
was never a Wan cap, and the owner-graded best clips were not made
by Wan at all. They were made by a large commercial model —
**Google Flow / Veo 3.1 Lite** — behind a free-credit allowance.
Wan 2.1 + VACE is the **replica's** engine (the free, Apache-2.0
replacement being built to remove the cap), not the original's.
The ceiling arithmetic in §3–§5 therefore prices the replica —
which is the thing being built — and the quality benchmark the
replica must meet was set by Veo 3.1 Lite. Whether the replica
meets it is exactly what the proof cut (V3-078, see
`flow-recipe/PROOF-PLAN.md`) is there to measure.

---

## 1. What imposed "5/day" — Google Flow's free credits (settled by records)

Four independent pieces of evidence, all from the folders' own
records (full audit in `flow-recipe/FLOW-RECIPE.md` §0):

1. **MP4 metadata.** All 5 produced clips (the `flow-tests/` pair,
   the two `ep01-flow-production/` segments, and
   `grok-fix/EP01-V3-005-flow-walk.mp4`) carry `encoder=Google`
   plus an AAC audio stream — a Google-service export signature.
   Local Wan/ComfyUI output carries neither.
2. **Hash match.** The V3-005 clip's sha256 (`29265149…`) and its
   start frame (`03bc5e6b…`) are byte-identical to the artefacts
   `~/workspace/flow-pipeline-landing/final/FLOW-COMPOSITE-PIPELINE.md`
   records as its executed **Google Flow** proof.
3. **Credit arithmetic closes exactly.** Flow's free tier grants
   **50 credits/day** (refresh ~9:43 AM CT); a Veo 3.1 Lite clip
   costs **10 credits** (`FLOW-COMPOSITE-PIPELINE.md` §"Cost and
   pacing (measured)"). The records trace the spend: two
   `flow-tests/` clips −20, the V3-005 proof −10 (**balance 20
   after**, per the pipeline doc), V3-001 −10 and V3-002 −10 →
   **balance 0 after V3-002** (`EP01-FLOW-PRODUCTION-LOG.md`:
   "the day's 50 free credits were spent in full"). 50 ÷ 10 =
   **5 clips/day**, and at 8.0 s per clip that is **≈40 finished
   seconds/day**.
4. **The test pair matches the pattern's own prescription.** The
   production pattern prescribes Wispkin's Dark Wave and
   Dorowani's Water Orb as the comparison test clips before
   episode work on a new engine — exactly the `flow-tests/` pair.

What the proven recipe actually was (per `FLOW-RECIPE.md`): the
start frame was **composited locally** (canon cutout on the
scene's CURRENT plate, contact shadow added at composite), then
uploaded to Flow as the first frame for Veo 3.1 Lite I2V with a
fixed prompt formula ("2D cartoon animation." + one action
sentence + "Keep the character design exactly as in the start
frame. No camera movement."). Only that generation stage consumed
credits; compositing, chaining, gating and assembly were already
local and uncapped. The replica therefore replaces exactly one
stage — the generator.

**What is NOT in the records:** no record ties any produced clip
to a Wan-based route at 5/day. Every Wan route in the records
either failed its gate (Kaggle Wan I2V proof: frame-1 FAIL, SSIM
0.2938 — `~/workspace/avatar-tool-build/test-scene/TEST-REPORT.md`
§1) or produced no episode clip (the OpenX-Inc/flow → VACE seat is
a contract proof against a stub). Three different things share
the name "flow" in this workspace — Google Flow (Veo), OpenX-Inc/
flow (an MIT orchestrator whose backend is Wan), and the flow-seat
kernel that plugs the second into the VACE seat — which is the
likely source of the mix-up. (One correction this implies:
`kernel/foundry_kernel.py`'s docstring and this folder's README
still carry the pre-settlement line that the best clips "came from
this same Wan 2.1 + VACE stack behind a hosted front-end's cap."
Per the records above, that line is wrong and should be corrected
wherever it is quoted.)

Two consequences of the original being Flow, stated plainly:

- **Rights:** Flow output carries SynthID and its commercial
  rights are UNCLEAR (`flow-recipe/REPLICA-MAP.md` Stage 3) —
  previs-grade, not shipping masters. Replica output is built
  from Apache-2.0 weights + the owner's canon art, so a passing
  replica clip *is* a shippable master. That is the actual prize
  for removing the ceiling.
- **Quality bar:** Veo 3.1 Lite is a large commercial model;
  Wan 2.1 VACE-1.3B on a T4 is not its peer in raw capability.
  The replica's bet is that the locally composited start frame +
  VACE reference lock + per-character LoRA close the
  character-truth gap. Unproven until the proof cut is graded.

## 2. What running the open stack ourselves leaves — the real constraints

Wan 2.1 + VACE-1.3B is **Apache-2.0 open source** (VACE repo model
table; verified in `~/workspace/mochiichao-4090-production/research/VERIFY-4090-HOSTS-AND-MODELS.md`
§3 and `~/workspace/ep01-rebuild/full-stack/FULL-STACK-REPORT.md`).
There is **no per-use cap, no credit system, no per-clip fee** in
the software. The binding constraints are all GPU time and
platform limits:

| Constraint | Value | Source |
|---|---|---|
| Kaggle free GPU budget | **≈30 GPU h/week** | Owner addendum, recorded in `kernel/foundry_kernel.py` docstring, this folder's README, and `flow-recipe/REPLICA-MAP.md` |
| Concurrent Kaggle batch sessions | **max 2** (the two-session pattern) | Owner addendum 2026-10-28 15:48; kernel `--shard A\|B` design |
| Session length | Kaggle sessions are time-limited and die; the exact limit is **not stated in the records** — the architecture (THROUGHPUT-ARCH.md) is restart-chained so the exact number does not matter | Design requirement, not a measured figure |
| Seat hardware | Tesla T4 ×2 per session, **14,912 MB usable VRAM each**, 30,720 MB RAM, ≈20,940 MB kernel working disk | Measured, `~/workspace/avatar-tool-build/parity/A14B-TIER.md` §3 |
| T4 architecture | Turing: **no native BF16 or FP8 acceleration**; FP16/INT8/INT4 are the native paths → FP16 recipes required | `~/workspace/research_notes/cartoon-character-video-likeness-20261028-1127/report.md` summary |
| Output retrieval | Kaggle's kernel-output endpoint **rate-limits (429)** after heavy use; a completed run's evidence has already been stranded server-side once | `FULL-STACK-REPORT.md` (attempts 1–2, NOT GRADED for exactly this reason) |
| Local CPU | This VM's CPU is the seat for the composite / part-pack roads — no GPU cost, runs in parallel with GPU sessions | Foundry road design, this folder's README |

Note what concurrency does and does not do: two sessions halve
the **wall-clock** time to spend the weekly budget and hedge
against one session dying, but they do **not** raise the
≈30 GPU h/week ceiling — GPU hours are GPU hours however they are
scheduled.

## 3. Per-clip cost model — VACE-1.3B 480p on T4

### 3.1 The unit of work

The foundry kernel's proven per-pass profile (from the verified
attempt-3 workflow, `kernel/foundry_kernel.py`): **49 frames at
16 fps = 3.0625 s of raw video per pass**, 480×768, KSampler
**30 steps, CFG 5.0**, uni_pc, VACE strength 1.0, FP16 UNET.
Longer cuts chain passes by last-frame continuation and trim to
the cut's duration.

Demand side (from `data/cut-manifest.json`, verified by direct
count for this analysis; totals match `data/cut-manifest-summary.md`):

| Class | Cuts | Seconds | Passes if GPU-generated |
|---|---:|---:|---:|
| No character named (plate/graphics cuts) | 31 | 370 | — (CPU road, §THROUGHPUT-ARCH) |
| Character cut on a still plate | 5 | 60 | 21 (fallback only; part-pack first) |
| Character cut on a living plate | 71 | 830 | **295** |
| **Total story** | **107** | **1,260** | |

So the GPU demand for the episode, after CPU offload, is
**295 passes ≈ 830 delivered seconds** (pass count includes
per-cut round-up: each cut needs ⌈duration×16/49⌉ passes).

### 3.2 What is measured — and what is not

**Explicit statement: there is NO completed VACE-1.3B generation
timing anywhere in the records.** The VACE attempts died before
any timing could exist:

- Full-stack attempts 1–2 (2026-10-28): kernels ended
  (attempt 1 later re-read as ERROR; attempt 2 COMPLETE) but
  output retrieval was blocked by the Kaggle 429; both verdicts
  NOT GRADED, no timings (`run-records/RUN-RECORD.md`).
- VACE attempt 3: queued successfully, then the hand-rolled wait
  loop asserted `TIMEOUT_NO_HISTORY` and the kernel died —
  the wait/timeout defect the fixed `src/comfy_wait.py` now
  replaces. Its `RUN-LOG.txt` ends at `QUEUED`; its `comfy.log`
  contains `got prompt` and **no "Prompt executed" line**. No
  wall time for the generation itself exists.

The model below is therefore built from the closest **measured**
Wan-family numbers on the same T4×2 seat, labelled as estimates:

| Anchor | Measured value | What it actually measured | Source |
|---|---:|---|---|
| Native baseline proof | **1,236.2 s for 45 frames** (2.8125 s) | Wan2.2 TI2V-5B, native ComfyUI graph (the wrapper-turbo path had died in warmup on the T5 defect), T4×2. Output came out 960×1536 via the known 2× upscale defect — i.e. at 4× the intended pixels | `test-scene/TEST-REPORT.md` §1; `proof-harvest/run-report.json` (`t_main_s: 1236.16`, path_used `native-baseline`) |
| Native test 1 | **≈28.5 min (~1,710–1,788 s) per segment** | TI2V-5B native, 20 steps / uni_pc / CFG 5.5 at 480×1024 latent, T4×2 | `backends.json` (repo record, 2026-10-27) |
| Turbo A/B | **78.5 s vs 1,787.6 s (22.8×)** | **TI2V-5B** seat: WanVideoWrapper + Wan2.2 Turbo LoRA (rank 64) + torch.compile, **4 steps / CFG 1.0**, vs the native baseline above. Recorded 2026-10-27 in the repo's `backends.json`; `TURBO-T5-FIX.md` §3 reads the 78.5 s as the expected class for a **49-frame segment** once the T5 file is swapped. It is **not** a VACE measurement, and it is not a T5-encoder measurement — the "wrapper A/B" is a whole-graph sampling-speed result | `parity/LIGHTX2V-EVAL.md` header; `parity/TURBO-T5-FIX.md` §§1, 3 |
| Scene run | **≈3 h 56 m for 4×81 frames** | TI2V-5B native fallback, chained two-character scene. Includes in-kernel setup/chaining/RIFE work, so it is an upper-bound wall clock, not a clean per-segment generation time | `test-scene/TEST-REPORT.md` §2 |
| 4090 cross-check | **~4 min for 5 s of 480p** | Base Wan2.1 **T2V-1.3B** (not VACE) on an RTX 4090, no quantization — the Wan2.1 repo's own figure. ≈48 GPU-s per finished second | `VERIFY-4090-HOSTS-AND-MODELS.md` §3 |

### 3.3 The model (all ESTIMATES — three bands)

Per-pass cost on T4 for the VACE graph (30 steps, FP16, 480×768):

- **Floor band — 78.5 s/pass (25.6 GPU-s per raw second).**
  The turbo A/B number, transplanted. It would require
  step-distillation on the VACE graph at 4 steps / CFG 1.0.
  **That artifact does not exist for our graph:** LIGHTX2V-EVAL
  §3 records there is no LightX2V distill LoRA for the Wan 2.1
  VACE-1.3B ComfyUI wrapper graph (its VACE distillation lives in
  LightX2V's own framework configs). Treat this band as a floor
  that is not currently reachable, not a plan.
- **Central band — 325 s/pass (≈106 GPU-s per raw second;
  ≈115 GPU-s per *delivered* second after per-cut round-up).**
  ESTIMATE: the geometric middle of the measured turbo floor
  (78.5 s) and the native proof normalised to a 49-frame pass
  (1,236.2 × 49/45 ≈ 1,346 s). It is consistent with the
  direction of the known differences (VACE is a 1.3B model vs
  the 5B anchors — smaller; but it runs 30 steps, not 4, and at
  full 480×768 — larger), and with the 4090 cross-check
  (48 GPU-s/s on a much faster card implies a T4 figure in the
  ~100 GPU-s/s class). It is an order-of-magnitude planning
  number, nothing more.
- **Ceiling band — 1,346 s/pass (≈439 GPU-s per raw second).**
  The native 5B proof pace, normalised. If VACE on T4 turned
  out no faster per frame than the 5B native path, this is
  where the replica lands — **slower than the Flow cap it
  replaces** (see §4). This band is a real possibility until
  the proof cut measures otherwise.

Resulting pace (delivered seconds of *generated* video per GPU
hour, GPU-routed cuts only, before gate pass-rate and before
session setup overhead):

| Band | s/pass | Pace (delivered s / GPU h) |
|---|---:|---:|
| Turbo floor (unreachable as staged) | 78.5 | 129.0 |
| **Central (planning)** | **325** | **31.2** |
| Native ceiling | 1,346 | 7.5 |

Session setup (ComfyUI clone, pip install, weight staging,
server start) is charged against the same GPU hours and is not
in these figures — net pace will be lower, by an amount the
first real batch run will measure via the ledger's `sessions`
wall-clock records.

## 4. Daily ceilings in finished seconds of PASSED video

Pass-rate is **not measured** — the proof cut has not run. The
50% / 70% / 90% rows are **SCENARIOS** (share of generated
seconds that pass the gate), not measurements. All ceilings use
the **central cost band** unless stated.

### (a) Kaggle-free only

Budget: ≈30 GPU h/week ÷ 7 = **≈4.29 GPU h/day average**.
At the central pace of 31.2 delivered s/GPU h, that is
**≈134 generated s/day** before grading:

| Pass scenario | Passed s/day | Passed s/week |
|---|---:|---:|
| 50% | ≈67 | ≈468 |
| **70% (middle)** | **≈94** | **≈655** |
| 90% | ≈120 | ≈842 |

For scale: the Flow free cap was ≈40 finished s/day *if every
clip passed first try*. The replica at the central band and
middle scenario is ≈2.3× that. At the native-ceiling band it
would be ≈23 passed s/day — worse than Flow. The band is the
whole question, and only the proof cut answers it.

### (b) Kaggle + one rented RTX 4090 running the same stack

**Assumptions, stated for the owner's decision (spend is the
owner's call — presented, never assumed):**

- The 4090 runs the same VACE stack (it fits: VACE-1.3B is a
  single-GPU 480p model; VERIFY §3). Its speed vs T4 is an
  **ESTIMATE at ×2.2** (range ~×2–3): the ratio implied by
  comparing the official 4090 1.3B figure (~48 GPU-s/s) with
  this model's central T4 figure (~106 GPU-s/s). No VACE timing
  on a 4090 exists in the records.
- 4090 pace at ×2.2: **≈68.6 delivered s/GPU h** (central band).
- Headline assumption: **24 h/day** of rented time. A 12 h/day
  variant is tabled below it.
- Prices are the **verified 2026-10-28 figures** from
  `VERIFY-4090-HOSTS-AND-MODELS.md` §§1–2: RunPod Secure
  **$0.89/hr**, RunPod Community **$0.34/hr**, Vast marketplace
  **~$0.35–0.60/hr** (indicative range only — Vast has no fixed
  price; the exact listing must be confirmed live at deploy).

| Rental shape | Added generated s/day | Combined passed s/day @ 70% scenario | Price/day (Secure / Community / Vast range) |
|---|---:|---:|---:|
| 4090 × 24 h/day | ≈1,646 | **≈1,246** | **$21.36 / $8.16 / $8.40–$14.40** |
| 4090 × 12 h/day | ≈823 | ≈670 | $10.68 / $4.08 / $4.20–$7.20 |

(Combined = Kaggle's ≈134 generated s/day + the 4090's share,
× the 70% pass scenario. At 50% / 90% scenarios the 24 h/day
combined figures are ≈890 / ≈1,602 passed s/day.)

## 5. Time-to-full-episode projections (1,260 s story, middle scenario)

GPU work required (central band, 70% pass scenario): the
830 GPU-routed seconds need 830 ÷ 0.70 ≈ 1,186 generated
seconds ≈ **38.0 T4 GPU-hours**. The 370 CPU-routed seconds and
the 60 part-pack seconds are produced locally in parallel and
are not on the GPU critical path (if the part-pack road failed
and all 5 still-plate character cuts fell back to GPU, add
≈2.7 GPU-hours). Gate, stitch and assembly time is excluded —
after generation stops being the bottleneck, those become the
schedule, and they are not yet measured either.

| Route | Time to generate the episode's GPU-routed cuts |
|---|---|
| (a) Kaggle-free only (30 GPU h/week) | 38.0 ÷ 30 ≈ **1.27 weeks ≈ 9 calendar days** |
| (b) Kaggle + 4090 @ 24 h/day | 4090 alone: 830 ÷ 0.70 ÷ 68.6 ≈ 17.3 card-hours; with Kaggle running in parallel, **under 1 day of generation wall-clock** |
| (b′) Kaggle + 4090 @ 12 h/day | ≈1.3 days of generation wall-clock (ESTIMATE, same bands) |
| Reference: the original Flow free cap | 1,260 ÷ 40 ≈ 31.5 days *at a 100% first-try pass rate* — and its output would still not be shippable masters (rights, §1) |

Sensitivity, (a) only, middle scenario: at the turbo floor band
the episode needs ≈9.2 GPU-hours (≈2.2 days at the weekly
budget); at the native-ceiling band it needs ≈158 GPU-hours
(≈5.3 weeks). The spread between those two numbers is the
honest state of knowledge before the proof cut.

## 6. The weakest assumption

**The central per-pass cost (325 s/pass) is an estimate built
from other models' timings, because no VACE generation on T4
has ever completed with a timing in these records.** Every
ceiling and projection above scales linearly with it: if the
proof cut lands near the native band, route (a) is worse than
the Flow cap it replaces and only the rented-4090 route keeps
the programme fast; if it lands near the turbo band, Kaggle
alone finishes an episode in ~2 days. The proof cut's run
record (per-segment GPU minutes are a required field in
`flow-recipe/PROOF-PLAN.md`) replaces this assumption with a
measurement — until then, treat every number in §§4–5 as
conditional on §3.3's central band, and the pass-rate scenarios
as unmeasured on top of it.
