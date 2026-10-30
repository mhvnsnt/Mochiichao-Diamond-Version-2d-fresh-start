# HORSEPOWER REPORT — multi-lane free GPU + speed fixes (2026-10-28)

Owner order (Jamar, 2026-10-28): Kaggle alone keeps hiccuping (locked-run
v1 timeout, v2's two bugs, ~20 min per graph on T4 x2) — build more
horsepower from the free lanes and fix the speed bugs so no single lane's
failure stalls production. Labels follow the licence/pricing honesty law:
every lane is labelled exactly what it is — free tier, trial credit,
free-but-approval-gated, or paid-cheap — verified at the source.

## 1. Lane survey (verified at source)

Survey method: official product/pricing/docs pages only, fetched
2026-10-28; every number below traces to an official page (URLs in the
survey notes). Where an official page doesn't state a limit, that is
written as "not stated" — no blog numbers are presented as facts.

| Lane | GPU (official) | Hard limits (official) | Runs our ComfyUI job? | Label |
|---|---|---|---|---|
| **Kaggle** (current) | T4 ×2, 16 GB each | ~30 GPU-h/week, 12 h sessions | **Yes — proven** (v1/v2/v3 ran here) | **free tier** |
| **Google Colab free** | type not stated ("vary over time"; in practice usually T4 16 GB — UNVERIFIED) | ≤12 h sessions; usage caps **not published** | **Awkward** — Google's FAQ: free runtimes that bypass the notebook UI for web-UI content generation "may be terminated at any time" and free users "commonly experience runtime terminations" doing exactly that. Our v3 runner is notebook-native script (ComfyUI binds localhost, driven by API, never exposed as a UI) — the only defensible shape. | **free tier** |
| **Modal Starter** | T4 / L4 24 GB / L40S 48 GB / A100 40–80 GB / H100… | **$30/month free credits, recurring**; no session cap published; 1 TiB volume storage free | **Yes — best technical fit** (arbitrary containers, persistent volumes, per-second billing) | **free tier, payment-method-gated** — Modal's own docs: "you must have a payment method on file in order to use Modal" / GPUs require one. Without that owner tap the $30 is unusable. (Rate arithmetic ≈ L4 ~37 h/mo is third-party summarised — UNVERIFIED until read in-account.) |
| **Lightning AI** | T4 / L4 / L40S on free (VRAM not stated officially) | Credits are a **one-time** starter pot: 5 free + 25 for adding a card = "up to 30", **not monthly**; free CPU Studio sessions 4 h; storage: 10 GB free, then $0.10/GB/mo (≈ $4.70/mo for our 57 GB, drawn from the same credits) | **Yes, awkward** — persistent Studios genuinely run arbitrary jobs; the budget is a single pot, bled by storage | **free tier** (one-time credits) |
| **HF ZeroGPU / Spaces** | RTX PRO 6000 Blackwell, 48 GB (large) / 96 GB (xlarge) | **5 GPU-minutes/day** on a free account; default function cap 60 s; Gradio-SDK only; free Docker Spaces are paid-gated | **No** — a ~20-min clip exceeds a full day's quota in a single call | **free tier** (unusable for this job) |
| **SageMaker Studio Lab** | not stated (existing users: T4-class) | GPU 4 h/day — **existing customers only** | **No — closed**: AWS docs headline "no longer open to new customers"; 15 GB storage couldn't hold the models anyway | **dead / not free** |
| **Google Cloud $300 trial** | **none — "you can't add GPUs to your VM instances" on a trial billing account** (Google's own list; quota increases also banned) | $300 / 91 days | **No on trial.** Only after the owner personally **upgrades to a Paid billing account** does the remaining credit become GPU-spendable — with his card live for overages | **trial credit** (GPU-blocked) |
| **Azure free account** | NC-family GPU quota **initially 0; SKUs "aren't available to trial subscriptions"** (Microsoft Learn) | $200 / 30 days | **No on trial** — same shape as GCP: pay-as-you-go upgrade + quota request, both owner-personal | **trial credit** (GPU-blocked) |
| **Oracle Cloud Always Free** | **no GPU shapes** (AMD + Arm A1 CPUs only) | — | **No** | **dead / not free** (as a GPU lane) |
| **Paperspace Gradient Free** | "FREE GPU" advertised, type/VRAM/hours **not stated** | Free listing: **5 GB storage**, 12 h auto-shutdown | **No** — 57 GB of models cannot fit in 5 GB | **free tier** (nominal, unusable for this job) |

Survey findings that changed the plan, stated plainly:

1. **Studio Lab is not a lane at all** — the brief assumed an
   application queue; AWS has closed it to new customers outright.
2. **The GCP $300 unlocks zero GPU minutes by itself.** The trial's own
   terms ban adding GPUs until the owner upgrades to Paid. It stays on
   the books only as an owner-decision item, never as free horsepower.
3. **Modal is the one real new lane**: recurring $30/mo, L4/L40S/A100
   class GPUs (2–5× our T4 VRAM headroom per card), volumes big enough
   for the whole model set — gated on exactly one owner tap (payment
   method on file; nothing is charged inside the $30).
4. **Colab is usable only in the shape v3 already runs**: a notebook
   script, not a served UI. That is now a hard design constraint for
   any Colab runner, recorded here so a future lane doesn't "fix" it
   by exposing the ComfyUI UI and getting the account terminated.
5. An AWS SageMaker *Studio* (not Lab) $100-credit offer surfaced in
   the survey as an **unverified lead** — not counted as a lane until
   its terms are read at source.

### Sign-in states (owner update, 2026-10-28: OAuth sign-ins authorized)

| Lane | Sign-in needed | State |
|---|---|---|
| Kaggle | API token (~/.kaggle/kaggle.json, marsfmmg) | **signed-in-and-verified** — CLI drove the dataset v2 upload + kernel v3 push + run in this programme |
| Google Colab | Google OAuth ("Continue as FMMG Mars") | authorized, **not executed by this lane** — a subagent has no live browser; the parent browser lane must do the one-tap sign-in at https://colab.research.google.com/ (Sign in → Continue as FMMG Mars). The v3 runner file is already Colab-ready (%run locked_run_kernel_v3.py). |
| Hugging Face | Google/GitHub OAuth or email | authorized, not executed (same browser constraint); needed only to raise ZeroGPU quota above anonymous and to create Spaces: https://huggingface.co/login |
| Lightning AI | Google/GitHub OAuth | account sign-in authorized (parent browser lane); **phone-number verification is the owner's own step** (SMS code goes to his phone) and unlocks the starter GPU hours; the +25 credits need his card (owner-only, optional) |
| Modal | email/OAuth workspace creation | workspace creation authorized; **the payment-method add is owner-only** — without it, Modal GPUs are blocked despite the $30/mo credit |
| SageMaker Studio Lab | — | **no route exists**: closed to new customers (see survey) |
| Google Cloud trial | Google OAuth + **card verification** | everything up to the card tap is preparable; **the card verification itself is the owner's tap** (unchanged by the sign-in authorization), and GPUs additionally require his personal **Upgrade to Paid** click |

### Sign-in states — UPDATE 2026-10-29 (live in-browser verification; supersedes the table above where they disagree)

The authorized sign-ins were executed in the browser on 2026-10-29 and
each lane's state was read on the provider's own pages. `lanes.json` is
the registry of record and now carries these states; `lane_queue.py`
routes dry/real assignment to **Kaggle + Colab only**.

- **Google Colab — SIGNED IN, LANE ENABLED.** Signed in as Mars FMMG
  (fmmg.mars@gmail.com). The free-tier **Tesla T4 is selectable and was
  confirmed as the assigned GPU via nvidia-smi** (the survey's
  "usually T4 — UNVERIFIED" is now verified). Sessions capped ~12 h;
  premium GPUs (A100 / H100 / L4) are greyed out behind the paid
  upgrade. Execution route: `%run locked_run_kernel_v3.py` in a Colab
  notebook — the v3 runner auto-detects Colab via `/content`
  (workdir `/content/locked-run`) and pulls weights from Hugging
  Face. No Colab run is measured yet, so no Colab rate is claimed in
  §6 — the projection there stays a labelled projection.
- **Modal — SIGNED IN, still NOT enabled (payment-method gate, now
  precise).** Workspace **mhvnsnt** (GitHub sign-in) exists and has
  **$1 of the $30/mo free credits unlocked** — the survey's "without
  that owner tap the $30 is unusable" is corrected: $1 is usable now.
  Adding a payment method (modal.com → Settings → Usage & billing →
  Add payment method) unlocks the remaining $29 and raises the $1
  usage limit; the verification step charges a **one-time $0.50 micro
  fee**. Owner tap still pending (§7.1 stands, with these numbers).
- **Lightning AI — SIGNED IN, still NOT enabled (platform state, not
  a sign-in problem).** Signed in fine (Google, fmmg.mars@gmail.com),
  but as of 2026-10-29 the platform is in **data-access-only mode**:
  no workspace / Studio / credits / phone-verification UI exists, so
  the §7.3 phone-verification tap currently has nothing to tap. The
  free pot is also mostly card-gated (5 credits at registration, +25
  only with a card). Recheck if the full platform returns.
- **Hugging Face — unchanged.** Weights host, not a GPU lane
  (ZeroGPU free = 5 GPU-min/day per account, structural).

## 2. The two v2 bugs — fixed at the cause

### Bug 1 — the frame-1 gate could not measure (fail-cannot-measure)
- **Cause:** `likeness_gate.py` (the copy that actually runs, from the
  locked-job dataset) sets `DEFAULT_CUTOUTS = Path.home() /
  "workspace/mochiichao-show/canon-cutouts"` — a path from the original
  dev VM. On Kaggle that resolves to
  `/root/workspace/mochiichao-show/canon-cutouts/`, which never exists
  there, and the v2 kernel never passed `--cutouts`, so every gate
  packet died with "canon cutout not found" and both SSIMs came back
  null. The clips were never measured — not failed, *unmeasured*.
- **Fix (by file):** `parity/locked_run_kernel_v3.py` — the canon
  cutouts (`show/production/canon-cutouts/dorowani.png` sha256
  a255fbb0…, `wispkin.png` sha256 b9de2318…) are embedded in the kernel
  itself, hash-asserted at staging, written to `{JOB}/canon-cutouts/`
  AND to the gate's exact legacy default path, and `gate()` now passes
  `--cutouts {JOB}/canon-cutouts`. The Kaggle dataset
  `marsfmmg/mochiichao-locked-job` also gained both cutouts + their
  hashes in `reference-manifest.json` (dataset version uploaded
  2026-10-28), so the dataset-driven path carries them too.
- **Recorded skew:** the dataset's `likeness_gate.py` (11,317 B) is an
  older copy than the repo's `avatar-stack/likeness_gate.py`
  (19,816 B); the v3 job deliberately keeps the dataset's gate pair
  (frame1_gate 10,940 B + likeness_gate 11,317 B) so v3 measurements
  stay comparable to v2's. Reconciling the two gate versions is a
  separate job, flagged here, not smuggled into this one.

### Bug 2 — turbo graph 96-vs-48 channel RuntimeError
- **Cause (source-verified, correcting the brief's hypothesis):** the
  doubling node is **node 8, `WanVideoImageToVideoEncode`** — there is
  no VACE node in the turbo graph. That node emits a `y` conditioning
  latent; in kijai ComfyUI-WanVideoWrapper @ 088128b2,
  `WanVideoSampler` hands y to `WanModel.forward`, which
  channel-concats it onto the noise (`x = [torch.cat([u, v], dim=0)]`).
  The genuine TI2V-5B checkpoint's `patch_embedding.weight` is
  [3072, 48, 1, 2, 2] (verified from the Comfy-Org repackaged
  safetensors header): in_dim 48 == the 48 noise channels, so the
  concat produces 96 channels into a 48-channel convolution — the
  exact v2 error string.
- **Fix (by file):** `parity/workflow-turbo-fixed.json` — conditioning
  rebuilt on the vendor's own TI2V-5B pattern (wrapper example
  `wanvideo_2_2_5B_I2V_example_WIP.json`): node 8 is now
  `WanVideoEncode` (start image → LATENT), node 9 is
  `WanVideoEmptyEmbeds` with that latent in `extra_latents` (first-frame
  injection at index 0; no y is ever produced), the sampler moves to
  node 10. All other nodes/settings (Turbo LoRA, compile, non-scaled
  T5, prompts, seed 2002, 4 steps, unipc) are unchanged.
- **Preflight countermeasure (by file):** `parity/preflight.py` — new
  sampler channel-contract check (with the wrapper mechanism cited in
  the source): a `WanVideoImageToVideoEncode` feeding a `WanVideoSampler`
  whose model has in_dim ≤ noise channels aborts preflight; an
  unverifiable model also aborts (fail-closed); the extra-latents
  pattern records a pass. Verified locally: the v2 turbo shape now
  exits 2 with the channel-contract failure; the fixed graph passes.
  `parity/test_preflight.py`: 16/16 tests pass (2 new).
- **Reproducibility rider:** v1/v2 cloned ComfyUI + the wrapper at
  floating HEAD, so the wrapper version that produced v2's error was
  never recorded. v3 pins both (ComfyUI c7bd15c2…, wrapper 088128b2…),
  asserts the pins at clone time, and records them in run-report.json.

## 3. The lane-agnostic runner (v3)

`parity/locked_run_kernel_v3.py` (902,458 B — the job's assets ride
inside it as base64): one file, lane auto-detected —
- **Kaggle:** kernel script, weights from the four attached datasets
  (as v2); the two v3-fixed files (preflight, turbo workflow) always
  come from the embedded copies, with any differing dataset copy logged
  as drift in the report.
- **Colab / generic box:** `python3 locked_run_kernel_v3.py` (or %run);
  weights download from Hugging Face (Comfy-Org Wan 2.1/2.2 repackaged
  + Kijai/WanVideo_comfy Turbo LoRA + non-scaled UMT5 — every path
  verified against the HF API file lists, 2026-10-28), byte-size
  asserts as on Kaggle.
- Phases, order, history audit, negative control, gate thresholds and
  the 4-hour per-graph wait are unchanged from v2. Staging, preflight,
  server-boot and per-graph seconds are all recorded in
  run-report.json (`timings`), so lanes compare on measurements.

## 4. Measured timings (work package D)

Lane actually run: **Kaggle** (T4 ×2, account marsfmmg) — kernel v3,
one run, 2026-10-28. In-kernel total **2,266.4 s** (wall push→complete
65 min; the difference is Kaggle scheduling, VM boot and output
commit). Every clip sha256 below was re-verified against the
harvested file byte-for-byte.

| Phase | Seconds | Notes |
|---|---|---|
| Stage job | 0.7 | embedded + dataset staging, all hash asserts green |
| Preflight (both graphs) | 0.3 | **PASS**, incl. the new channel contract |
| ComfyUI boot (turbo seat) | 45.2 | pinned ComfyUI c7bd15c2… |
| **Turbo graph** | **175.2** | **clip produced** — v2: FAILED, no clip |
| **Locked graph** | **965.7** | v2: 1,225.9 s (**−21%**) |
| **Negative control** | **941.0** | v2: 1,200.9 s (**−22%**) |

Per finished second (each graph renders a 3.0625 s segment): turbo
**57.2 GPU-s/s**, locked **315.3 GPU-s/s**, control 307.3 GPU-s/s.
The turbo seat is **5.5× faster per graph** than the locked seat.

Gate results — every packet now carries real measurements (Bug 1's
fail-cannot-measure is gone from all four packets):

- **Turbo:** frame 0 vs canon **PASS** (SSIM 0.9923, silhouette IoU
  0.9816, RGB MAD 3.0 — all three checks green). Overall verdict
  **FAIL, class `drift`**: by frame 24 SSIM falls to 0.2373 (MAD
  85.3) — the model wanders off-canon mid-clip. Stated plainly: the
  channel bug is fixed and the clip exists; the remaining failure is
  generation drift, a quality property that is now measurable
  instead of hidden.
- **Locked:** **FAIL, class `reference-never-anchored`** — frame 0
  SSIM 0.3378, IoU 0.6618 (silhouette passes), MAD 74.9. The history
  audit is OK (VACE reference wired: node 7 ← node 6, trim ← node 7),
  so this is not a wiring miss: the VACE seat re-renders frame 0 in
  its own hand rather than anchoring to the fed reference. This was
  invisible in v2 because the gate could not measure at all.
- **Negative control:** `control_follows_reference: false` — frame-0
  SSIM 0.168 vs its own Wispkin reference, 0.220 vs Dorowani. No
  false Dorowani pass (the control did its job), and its weak
  Wispkin anchoring matches the locked seat's behaviour above.

One cost found by the harvest, recorded for the next runner rev: the
turbo phase downloads the non-scaled UMT5 (6,731,333,792 B, sha256
3fe51735…) from Hugging Face on **every** run — no attached dataset
carries that file — which also inflates the kernel's output bundle
to 6.27 GB and makes full-output harvests impractical (this
programme harvested selectively with `--file-pattern` instead:
3.5 MB). Fix path, not yet done: add that one file to the
`mochiichao-wan22-accel` dataset so it mounts like every other
weight and never enters an output bundle again.

## 5. Multi-lane orchestration (expansion part E)

The throughput ceiling the owner ruled on — the hosted Flow pipeline's
5 clips/day ≈ 40 finished seconds/day — is answered by running every
verified lane in parallel under one queue, not by leaning on one lane
harder. Landed in this PR under `parity/`:

- **`lanes.json`** — the lane registry: every surveyed lane with its
  verified quota, honest label, sign-in state, driver and `enabled`
  flag. A lane is enabled only when its driver can actually run today
  (Kaggle only, at landing). Quotas are tracked in the open: the queue
  ledgers GPU-seconds per lane against the verified budget and prints
  used/remaining in every queue report.
- **`lane_queue.py`** — the queue brain. It consumes scene jobs in the
  existing **job_format_v2** format (`avatar-stack/freedom/`, schema
  `mochiichao-show/scene-job/v2` — the Wielder boundary is met only
  through those files; `show/production/wielder/` is untouched),
  expands each character's segment list into work units, and stamps
  each unit with the runner defaults below. Dependencies follow the
  chaining rule (segment n+1 is not ready until segment n is done; its
  start frame is the extracted last frame of n). Assignment prefers
  the least-used enabled lane with budget left; **a lane failure
  requeues the segment onto another lane** with the failure recorded
  in the unit's attempt history — a hiccup moves work, it never
  stalls the job. An executor that cannot drive its lane raises
  `LaneNotDrivable` with the lanes.json reason and the unit is
  recorded UNRUN on that lane — never a fake completion.
- **`test_lane_queue.py`** — 7/7 tests pass: expansion + chain deps,
  the 4n+1 snap (49/37/25 for a 3 s span at seat/on-2s/on-3s rates),
  distribution across lanes, **failover after a simulated lane
  failure**, disabled lanes never assigned, quota exhaustion leaving
  units queued instead of overspending, stub lanes recording UNRUN.
- Proven against the repo's own worked example
  (`freedom/scene_job.example.json`, fetched from main): 5 segments
  expanded with correct chain deps; simulated dispatch completes all
  5 on the one enabled lane inside its weekly budget.

## 6. Output multipliers + the capacity table (expansion parts F + G)

Defaults wired in **`runner_defaults.json`** (stamped onto every unit
the queue dispatches):

1. **Generate on the show's timing, not at 24 unique fps.** Default
   mode on-2s (12 unique fps; accents on-3s at 8, hits on-1s at 24).
   Frame counts snap to the Wan seat's 4n+1 rule: a 3.06 s span is
   49 generated frames at the incumbent density, 37 on-2s, 25 on-3s.
2. **RIFE interpolation to the 24 fps master.** Pack:
   ComfyUI-Frame-Interpolation (open source, MIT), node/wiring per
   the repo's `freedom/rife_workflow.json`. The brief said the
   flownet (rife47/rife49) was "already in dataset v1" — verified
   directly: `models/rife/rife47.pth` (21,344,827 B) and
   `rife49.pth` (21,345,274 B) are in dataset
   `marsfmmg/mochiichao-wan22-consistency-kit` (Kaggle API listing,
   2026-10-28), which is dataset source #1 of the locked-run kernel —
   **mount verified, not re-chased**. Correction owed the other way:
   `freedom/interpolation.md` still says the flownet is "staged
   nowhere... not in the Kaggle consistency-kit datasets" — that gap
   note predates the dataset upload and is now stale; flagged here
   for the freedom lane to correct in its own file.
3. **Segment chaining** (last frame → next start) is the standard
   length mechanism — already the job_format_v2 design
   (`chain_segments.py`), enforced by the queue's dependencies.

Measured multipliers — what is measured, and what is honestly not:

- **Seat rates (MEASURED, v3 run, §4):** locked seat 315.3 GPU-s
  per finished second at full density; turbo seat 57.2 — the turbo
  seat is itself a **5.5× per-graph speedup** over the locked seat,
  measured, not projected.
- **Timing multiplier (on-2s / on-3s generation): MEASURED
  2026-10-29 \u2014 and the measurement does not establish the
  assumed saving.** The measure kernel
  (`marsfmmg/mochiichao-measure`, Kaggle lane) completed; its
  `out/measure-report.json` was harvested selectively on
  2026-10-29 (2,253 B, sha256 71d10ee6\u2026). Session totals:
  stage 81.5 s, boot 50.3 s, total 40,844.1 s. It ran the locked
  graph at the three snapped frame counts for a 3.0625 s span
  (workflow `workflow-i2v-locked.json` from dataset
  `marsfmmg/mochiichao-locked-job`, Dorowani start image):
  - **49 frames: TIMED OUT** \u2014 \u224814,404 s (\u22484.0 h, from the
    kernel log's own timestamps) before the kernel's timeout
    guard killed the graph. No clip.
  - **37 frames (the on-2s count): TIMED OUT** \u2014 again
    \u224814,404 s (\u22484.0 h). No clip.
  - **25 frames (the on-3s count): COMPLETED \u2014 11,903.6 s**
    for 25 frames (output 1.5625 s at 16 fps; clip 197,702 B,
    sha256 cf757cde\u2026). That is **476.1 GPU-s per generated
    frame** and **7,618.3 GPU-s per finished second** on this
    workflow.
  Read plainly: the frame-count arithmetic (49 \u2192 37 \u2192 25)
  is still just arithmetic. No proportional saving was
  measured \u2014 the two larger graphs never finished inside the
  \u22484 h graph window at all, and the one completed point
  costs \u224824\u00d7 more per frame than the v3 locked graph in
  \u00a74 (19.7 GPU-s/frame). The two are different workflows
  (this kernel ran the locked-job dataset's original workflow,
  not the v3 runner's graph), so the rates must not be merged;
  what the kernel establishes is that on its workflow, even
  the reduced frame counts do not finish cheaply. The queue's
  cost model keeps running on \u00a74's measured v3 rates and
  treats denser timing as unpriced headroom, never as banked
  savings \u2014 now with the two timeouts on record as the reason.
- **RIFE multiplier: STILL UNMEASURED \u2014 the phase never ran
  (2026-10-29).** In the same completed measure kernel, the
  RIFE staging verified clean: `rife47.pth` was copied from
  the consistency-kit dataset into the pack's `vfi_models`
  folder (21,344,827 B \u2014 the verified dataset size above)
  and the `RIFE VFI` node was present. But the RIFE phase
  (`rife2x_on_37f`) took its input from the 37-frame locked
  graph, which had timed out, and died instantly with
  `KeyError: 'path'`. RIFE itself neither ran nor timed out:
  **no RIFE GPU cost exists from this kernel, and none is
  claimed.** The suspicion recorded at landing that this
  phase was the one grinding on its fp32 + ensemble settings
  was wrong \u2014 the session's hours went to the two
  locked-graph timeouts above. What stands verified: the
  mount, the pack, the node wiring, and the structural fact
  that one pass doubles frame count. The fp32 + ensemble
  settings in the wired repo workflow remain unproven either
  way; they **must change to fp16, no ensemble** in the
  dispatch config before any RIFE re-measurement is
  attempted, and RIFE stays UNMEASURED until a run that
  actually executes it lands a number.
- **Chaining: structural, no GPU-s multiplier claimed.** Its effect
  is that episode length is built from segments at all; the seam
  cost is the re-generation risk `chain_segments.py` already
  reports, not a generation saving.

### Capacity table — the number that replaces "40 seconds a day"

How to read this table honestly: "finished seconds" = seconds of
24 fps master timeline produced. **Seat throughput is not
gate-passing throughput**: in the v3 run both seats' clips FAILED
their likeness gates (turbo: drift; locked: reference-never-
anchored — §4), so today's *keeper* rate from these seats is
0/day, a quality problem owned by the generation lanes (and the
reason the owner's Flow composite pipeline is the current
production route). What this programme removes is the **capacity
ceiling**: the raw GPU throughput that quality work can draw on,
which the Flow free tier caps at ~40 finished-s/day. All figures
below spend each lane's verified weekly quota evenly across 7 days.

| Lane | Verified free quota | GPU-s per finished s | Finished s/day | State |
|---|---|---|---|---|
| Kaggle — locked seat (reference-controlled) | ~30 GPU-h/week | **315.3 (measured)** | **48.9** | RUN |
| Kaggle — turbo seat | (same weekly pool) | **57.2 (measured)** | **269.7** | RUN |
| Google Colab free | ≤12 h sessions; caps unpublished | — | — | ENABLED in the queue 2026-10-29 (PR #120): signed in as Mars FMMG, free-tier Tesla T4 confirmed assigned via nvidia-smi; no Colab run measured yet, so no rate claimed |
| Modal Starter | $30/mo recurring credits | — | — | UNRUN — $1 of the $30 already unlocked and usable; a card unlocks the remaining $29 and raises the $1 usage limit (one-time $0.50 verification micro fee); owner's payment-method tap pending (§7.1) |
| Lightning AI | one-time credits (5 + 25 w/ card) | — | — | UNRUN — signed in (Google) 2026-10-29, but the platform is in data-access-only mode: no workspace/Studio/credits/phone-verification UI exists; recheck if the full platform returns |
| HF ZeroGPU | 5 GPU-min/day, 60 s cap | — | — | UNRUN — structurally unusable (§1) |
| GCP trial | $300/91 d, GPUs banned on trial | — | — | UNRUN — owner's card + Upgrade-to-Paid (§7.2) |
| SageMaker Studio Lab / Azure free / Oracle / Paperspace | — | — | — | UNRUN — dead or GPU-blocked (§1) |

**Combined measured total (lanes actually run, in parallel):**
Kaggle is the only measured lane, and its two seats share one
weekly pool, so the combined figure is a choice of seat, not a
sum: **48.9 finished-s/day on the reference-controlled locked
seat — already above the 40/day Flow ceiling — or 269.7/day of
raw seat throughput on the turbo seat**, before the (unmeasured)
timing and RIFE multipliers and before any second lane is
unlocked.

**Projection (labelled, NOT a measurement):** if Colab performs
at the measured Kaggle T4 locked-seat rate and both lanes run in
parallel inside their quotas, combined capacity ≈ **97.8
finished-s/day**; adding Modal after the owner's tap, at the same
T4 rate as a floor for its L4-class GPUs, ≈ **146.7/day**. These
become measurements only when those lanes run (§7).

## 7. What the owner still has to tap (complete list)

CORRECTED 2026-10-29 (follow-through sweep): this section now matches
the live-verified §1 update of 2026-10-29 and `lanes.json`, which are
the registry of record. The earlier version of this section was stale
in three places: it listed the OAuth sign-ins as still pending (they
were executed in the browser on 2026-10-29); it described Modal's $30
as wholly locked behind the tap ($1 of it is already unlocked and
usable); and it listed Lightning phone verification as a pending tap
(the platform is in data-access-only mode, so that tap currently has
nothing to tap).

1. **Modal: add a payment method** (Settings → Usage & Billing) —
   workspace mhvnsnt is already signed in (GitHub) and **$1 of the
   $30/mo free credits is already unlocked and usable**. The tap
   unlocks the remaining $29 and raises the $1 usage limit; the
   verification step charges a **one-time $0.50 micro fee**. Nothing
   is charged inside the credit; a spend budget can be set at the
   same time. Recommended first tap.
2. **Google Cloud trial: card verification, then the Upgrade-to-Paid
   click** — only if he wants the $300 as GPU money at all; read the
   survey first (trial alone = zero GPU minutes, card live for
   overages after upgrade). (Unchanged — no new verification.)
3. **Lightning AI: NO tap available right now.** Signed in already
   (Google, 2026-10-29), but the platform is in **data-access-only
   mode**: no workspace / Studio / credits / phone-verification UI
   exists, so the phone-verification tap currently has nothing to
   tap. Recheck if the full platform returns. The free pot is also
   mostly card-gated (5 credits at registration, +25 only with a
   card) — the card is optional and the owner's call.
4. The OAuth sign-ins are DONE, not pending: Colab, Modal and
   Lightning were all signed in through the browser on 2026-10-29
   (see the §1 update). What remains is only items 1–3 above, and
   item 3 is currently un-actionable.
