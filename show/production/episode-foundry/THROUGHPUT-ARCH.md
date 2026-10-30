# THROUGHPUT ARCHITECTURE — two-session VACE foundry over the 107-cut queue

Date: 2026-10-28. This is the spec the kernel worker implements
in `kernel/foundry_kernel.py`. Where the kernel already implements
a piece, this doc says so and names the exact mechanism, so spec
and code cannot drift apart silently. Cost figures come from
`CAP-ANALYSIS.md` (same folder) — read its §3.3 before quoting
any pace from this doc: the per-pass cost is an estimate until
the proof cut measures it.

**Route in one line:** Wan 2.1 + VACE-1.3B (Apache-2.0), FP16,
on two concurrent Kaggle T4 sessions over disjoint halves of the
cut queue, with every non-generation cut class offloaded to the
local CPU, a per-session ledger shard as the only thing a
session ever writes, and a deterministic merge as the only way
shards combine.

---

## 1. The two sessions — disjoint ranges, restart-chained

### 1.1 Split

- The queue is `data/cut-manifest.json` in manifest order
  (107 cuts, V3-001…V3-107, 1,260 s).
- **Session A** takes the first ⌈107/2⌉ = **54 cuts**
  (queue positions 1–54, V3-001…V3-054). **Session B** takes
  the remaining **53 cuts** (positions 55–107, V3-055…V3-107).
- Invocation (implemented in the kernel): `--shard A | B`,
  with `--range A:B` (1-based inclusive) and `--cuts id,id,…`
  as overrides for rebalancing or targeted re-runs; env
  equivalents `FOUNDRY_SHARD`, `FOUNDRY_SHARD_RANGE`,
  `FOUNDRY_CUT_LIST`. `--preview-selection` prints the resolved
  selection without running anything.
- **The unit of work is a whole cut, never a pass.** A cut's
  chained passes (49 frames each, last-frame continuation) all
  run inside one session, so no seam ever crosses a session
  boundary.
- **Cross-cut frame-chaining stays inside a shard.** Where a
  queue entry opts into `continuous` / `continuous_with_prev`,
  its fed reference is the previous cut's last frame *from the
  same session's run*. The first cut of shard B has no
  predecessor in its session and falls back to the canon
  reference — the kernel already logs this fallback in the
  ledger entry (`chain_note`); it is a known, accepted seam,
  not a silent one.

### 1.2 Session lifecycle (per session)

1. Start; scan inputs for prior ledger shards (§2.3) and fold
   their DONE set in **before** selecting work.
2. Stage the weights **once** from the attached datasets,
   byte-size asserted against the staging manifest (VACE-1.3B
   FP16 4,309,519,800 B; Wan 2.1 VAE 253,815,318 B; UMT5
   6,735,906,897 B). No in-session weight downloads — they are
   the single biggest time sink in Kaggle video work
   (`FULL-STACK-REPORT.md` §"speed method").
3. Clone ComfyUI + VideoHelperSuite (code only), start the
   server **once** for the whole batch.
4. Per cut, in queue order: skip if DONE in the folded-in
   ledger → preflight (reference hash, graph lock checks;
   a failure is ledger-marked `PREFLIGHT_FAIL` and consumes no
   GPU time) → per pass: build control/mask → queue → wait via
   `src/comfy_wait.py`'s `wait_for_completion` (the fixed wait
   client; the kernel depends on its interface and never
   reimplements polling — attempt 3 died on a hand-rolled loop)
   → write clip, fed reference + its sha256, first/mid/last
   frames under `foundry-out/<cut_id>/` → **rewrite the shard
   ledger after every cut**.
5. On exit (normal or killed): the shard ledger plus a
   `sessions` entry (this run's GPU-seat wall-clock) is the
   session's durable output. That wall-clock is the GPU-hours
   denominator for pace; per-cut `gpu_seconds` is the numerator
   detail.

### 1.3 Restart-chaining

A session that dies (platform time limit, error, Kaggle-side
kill) loses at most the cut in flight: the ledger was rewritten
after the previous cut, and §2's sync carries it to the next
session, which resumes from the merged DONE set. There is no
session state anywhere else — ComfyUI, the queue selection and
the chained-frame context are all reconstructible from the
manifest + ledger + the DONE cuts' saved `frame_last.png`.

### 1.4 What two sessions buy (and what they don't)

They halve wall-clock to spend the ≈30 GPU h/week Kaggle
budget and make the programme survive one session's death.
They do **not** increase the weekly GPU-hour budget
(`CAP-ANALYSIS.md` §2). Rebalance rule: if one shard finishes
its range while the other still has unstarted cuts, the idle
side takes over the tail via `--range` / `--cuts` — the ledger
merge (§2.2) makes the overlap safe, because DONE is
idempotent.

## 2. Ledger sync via Kaggle output → dataset versioning

### 2.1 The problem being solved

Sessions cannot see each other's `/kaggle/working`, and the
kernel-output endpoint has already stranded a completed run's
evidence behind a 429 rate limit once (`FULL-STACK-REPORT.md`).
So the ledger — the one artefact every later step depends on —
travels by the dataset route, not by hoping the output endpoint
cooperates.

### 2.2 Shards and the merge rule (implemented: `merge_ledgers()`)

- Each session writes **only its own shard file**:
  `foundry-out/cut-ledger-A.json` / `cut-ledger-B.json`
  (unsharded runs keep the legacy name `cut-ledger.json`).
  No session ever writes another session's shard, the merged
  ledger, or any shared file. **Write collisions are therefore
  impossible by construction** — there is exactly one writer
  per file, ever.
- Shard schema = the kernel ledger schema
  (`mochiichao/episode-foundry-ledger/v1`): `entries[]` keyed
  by `cut_id` (status, road, `gpu_seconds`, `duration_s`,
  reference sha256, clip sha256, frames, `finished_utc`, …)
  plus `sessions[]` (per-run wall-clock).
- **Merge rule** (deterministic; implemented in the kernel and
  runnable standalone as
  `foundry_kernel.py --merge-ledgers A.json B.json --merge-out merged.json`):
  1. Entries are keyed by `cut_id`.
  2. **DONE beats any non-DONE state** from another shard —
     a cut DONE anywhere is done, idempotently.
  3. Between two DONE entries for the same cut, the **earliest
     `finished_utc` wins** (the first completion is canonical;
     a duplicate completion is discarded, not averaged).
  4. `gpu_seconds` are taken **from the winning entry only** —
     a merged total never double-counts a cut that two shards
     both attempted.
  5. `sessions[]` concatenate; the merged `summary` recomputes
     DONE count, produced seconds and GPU hours from the merged
     entries.
- **Who merges:** the local coordinator, after harvesting a
  session's output — never a Kaggle session. Sessions only
  *read* prior shards (fold-in, §2.3) and *write* their own.
  The merged ledger is the canonical input to `src/stitch.py`
  (which additionally requires the gate verdicts; a kernel
  DONE means "generated", and only gate-PASS clips stitch).

### 2.3 The sync loop

1. **Session end → harvest.** Download the session output
   (`foundry-out/` — shard ledger, per-cut clips, frames,
   RUN-LOG). If the output endpoint 429s, stop and retry later
   per the rate-limit rule; the session's work is not lost,
   only delayed — and the *next* session can still be launched
   against the last synced ledger version (it may re-attempt
   a cut whose DONE record is stranded; §2.2 rules 2–4 make
   that waste bounded and non-corrupting).
2. **Harvest → new dataset version.** The harvested shard
   ledgers are published as a **new version of one ledger
   dataset** (working name: `mochiichao-foundry-ledger`),
   containing `cut-ledger-A.json` and/or `cut-ledger-B.json`
   exactly as harvested — shards are never edited before
   publication. Version note names the shard, the session's
   end time, and its DONE count.
3. **Next session → attach latest version.** A fresh session
   attaches the weights datasets **and** the latest ledger
   dataset version. On start it scans its inputs for
   `cut-ledger*.json` (implemented: `find_prior_ledgers()`),
   merges every prior shard plus its own existing ledger, and
   skips the merged DONE set (`RESTART_CHAIN` / `RESUME` log
   lines record how many DONE cuts were known).
4. **Clips travel with the harvest, not the dataset.** The
   ledger dataset carries ledgers only (small, versioned
   often). Produced clips and gate frames are harvested to
   local staging at step 1 and staged onward under the
   workspace's staging law (GitHub / TeraBox) by the
   coordinator; a re-run session needs from its inputs only
   the ledger (to skip) and, for a chained cut, the previous
   cut's `frame_last.png` — which the coordinator includes in
   the job inputs when it assigns a `--range` that resumes
   mid-chain.

### 2.4 Idempotence guarantees, summarised

- Re-running a DONE cut: skipped at selection time.
- Two shards completing the same cut (only possible after a
  stranded harvest): earliest DONE wins; GPU seconds counted
  once.
- Re-merging the same shards twice: same merged ledger
  (the rule is a pure function of the shard contents).
- A corrupt/unreadable prior ledger: logged
  (`PRIOR_LEDGER_UNREADABLE` / `LEDGER_UNREADABLE`) and treated
  as absent — never silently trusted, never fatal.

## 3. CPU-road offload — GPU hours only where generation is needed

Classification computed directly from `data/cut-manifest.json`
for this spec (counts verified against
`data/cut-manifest-summary.md`). Routing is a queue-prep step:
each manifest entry gets a `road` before any session launches,
and the kernel already ledger-marks non-`vace-local` entries
`SKIPPED_ROAD` / `SKIPPED_NO_CHARACTER` instead of dropping
them.

| Class | Rule (from manifest fields) | Cuts | Seconds | Road |
|---|---|---:|---:|---|
| **CPU-1 plate-hold** | `characters` empty, plate is a living `.mp4` | 23 | 278 | Local CPU: trim/loop the CURRENT living plate to the cut's duration (ffmpeg), grade for background persistence. No character to generate. Includes V3-061, the eyecatch — its picture is a graphic over the plate, composited locally |
| **CPU-2 still-hold / graphics** | `characters` empty, plate is a still `.png` | 8 | 92 | Local CPU: hold the still for the duration; board/eyecatch/intertitle graphics and text are composited locally. **Includes the four Dark Forest stinger cuts V3-104…V3-107 (46 s) — still by law: the registry rules a moving Forest cut FAILS, so these must never reach the GPU at all** |
| **CPU-3 part-pack first** | characters named, plate is a still `.png` | 5 | 60 | Local CPU part-pack / composite road first (canon character parts performed over the one held plate; shadows at composite only). Members: V3-013, V3-014 (berry-store counting gag), V3-077 (intertitle — Wispkin is voice-only, no on-screen performance needed), V3-081 (characters present by attribute only — a fin print, a scorch dot: effects composite), V3-082. **GPU is the fallback only**, if the part-pack gate fails: 21 passes |
| **GPU VACE** | characters named, plate is a living `.mp4` | 71 | 830 | The two Kaggle sessions: **295 passes** (see `CAP-ANALYSIS.md` §3.1) |

Effect: **430 of the episode's 1,260 seconds (34%) never touch
a GPU**, and the GPU queue is 295 passes instead of the 449 a
naive all-generation queue would need.

Two GPU-class notes:

- **Multi-character cuts.** 18 of the 71 GPU cuts name more
  than one character. The kernel generates against
  `characters[0]` only (WanVaceToVideo takes exactly one
  reference image) and logs that limitation per cut. The Flow
  recipe's Stage 5 instead generates each character
  **separately** and composites locally — if that isolation is
  enforced, these cuts cost **+89 passes** (one extra pass
  chain per additional character). Which treatment a
  multi-character cut gets is a queue-prep decision recorded
  in its ledger entry, never an accident of the kernel.
- **V3-100** (12 s, GPU class by the rule above) names Wispkin
  as intertitle **voice only**; its picture is the berry
  pyramid on the Pond plate. It is a CPU-composite candidate
  (prop + plate) — flagged here for the staging decision, but
  kept in the GPU count in `CAP-ANALYSIS.md` so the headline
  numbers stay conservative.

Finishing (RIFE 16→24 fps interpolation, upscale to
1280×720, trim to duration — `flow-recipe/REPLICA-MAP.md`
Stage 4/7) is a **local post step** on harvested clips. It
never justifies a Kaggle session of its own.

## 4. FP16 recipe for T4, and where the acceleration pieces slot in

### 4.1 The T4 constraint

The T4 is a **Turing** GPU: tensor cores are FP16/INT8/INT4
native; **BF16 arrived with Ampere and FP8 with Hopper**, so
neither has native acceleration on this seat (research report,
`~/workspace/research_notes/cartoon-character-video-likeness-20261028-1127/report.md`).
Recipes written for 3090/4090/A100 that assume BF16/FP8 paths
will be slow, emulated, or fail here. The foundry recipe is
therefore FP16-native:

- **VACE UNET:** the staged FP16 checkpoint
  (`wan2.1_vace_1.3B_fp16.safetensors`) — asserted by name at
  staging time in the kernel.
- **VAE:** the standard Wan 2.1 VAE checkpoint, loaded FP16
  (attempt-3 `comfy.log`: "VAE load device: cuda:0 … dtype:
  torch.float16").
- **Attention:** `torch_sdpa` — the only one of LightX2V's
  attention backends established to run on Turing in the
  programme's closure work (`parity/LIGHTX2V-EVAL.md` §2);
  the attempt-3 log likewise shows "Using pytorch attention".
- **The one FP8 exception, flagged not hidden:** the UMT5 text
  encoder exists in the staged datasets **only** as
  `umt5_xxl_fp8_e4m3fn_scaled.safetensors`. On T4 it loads
  through ComfyUI's MixedPrecisionOps dequant path (attempt-3
  log confirms) — correct, but with no FP8 acceleration, and
  there is no FP16 UMT5 in the staged sets to switch to. The
  kernel logs this (`FP16_NOTE`) on every run. Note the
  asymmetry with the *wrapper* graphs: the scaled-FP8 file is
  **rejected unconditionally** by the WanVideoWrapper's T5
  loader (`parity/TURBO-T5-FIX.md` §1) — it is legal here only
  because the VACE graph is the native ComfyUI graph.
- **Per-GPU note:** a Kaggle T4×2 session does not pool VRAM
  in this ComfyUI setup; the VACE graph runs on one GPU
  (14,912 MB usable) and the second card is not a throughput
  multiplier for a single pass. Throughput scales by
  *sessions* (§1), not by cards within a session.

### 4.2 LightX2V / turbo acceleration — where it slots, honestly

Licence states first (verified at source, `parity/LIGHTX2V-EVAL.md` §1):
**LightX2V code is Apache-2.0; its distill LoRA / distilled-model
repos (`lightx2v/Wan2.2-Distill-Loras`,
`lightx2v/Wan2.2-Distill-Models`) declare Apache-2.0.** The
separate Wan2.2 Turbo LoRA used on the 5B seat is a Kijai
repack whose card declares **no licence** (underlying
Self-Forcing is MIT, base Wan Apache-2.0) — `backends.json`
flags it **RECHECK_BEFORE_COMMERCIAL_SHIP**; it belongs to the
5B seat, not to this road.

- **On the VACE road today: nothing slots in.** Step
  distillation is the whole prize (4 steps / CFG 1.0 instead
  of 30 / 5.0 — the measured 22.8× on the 5B seat), but there
  is **no LightX2V distill LoRA for the Wan 2.1 VACE-1.3B
  ComfyUI graph** in its repos (LIGHTX2V-EVAL §3). The VACE
  seat's distillation lives in LightX2V's own framework
  configs — the pinned local clone carries
  `configs/wan/wan_vace.json` and `scripts/wan/run_wan_vace.sh`
  (`ep01-rebuild/full-stack/closure/lightx2v/`) — i.e. adopting
  it means running the VACE graph through the LightX2V
  framework instead of the native ComfyUI graph. That is a
  **separate, gated experiment**, not a kernel flag: acceptance
  is the same frame-1 likeness gate plus wall time, and a
  speed win that costs likeness is a fail.
- **What to measure first:** the proof cut's per-pass wall
  time at the current 30-step recipe. That single measurement
  (a) replaces `CAP-ANALYSIS.md`'s central estimate, and
  (b) prices the LightX2V-framework experiment — if native
  VACE lands near the central band, distillation is an
  optimisation; if it lands near the native-ceiling band, it
  becomes the programme's critical path.
- **torch.compile:** part of the measured turbo A/B on the
  wrapper seat; on the native VACE graph it is unmeasured.
  Do not enable it silently in the batch kernel — one variable
  per iteration, recorded in the run record, per the
  programme's standing rule.

## 5. Interfaces this spec fixes (for the kernel worker)

1. Queue prep emits `road` per cut using §3's rules, before
   any launch; shard selection operates on the GPU-class
   subset plus explicit overrides.
2. Ledger shard filenames, merge rule and standalone merge
   command exactly as §2.2 — already implemented; this spec
   ratifies them and adds only the dataset-version sync loop
   around them (§2.3).
3. Every ledger entry keeps `gpu_seconds`; every session
   appends its wall-clock to `sessions[]`. Pace reporting
   (finished passed seconds per GPU hour) is computed
   downstream by `src/stitch.py` from gate verdicts — the
   kernel produces clips, it does not grade them.
4. Any future change to steps/CFG/precision in the VACE graph
   is a named experiment with its own run record, never a
   silent kernel edit — the cost model in `CAP-ANALYSIS.md`
   is keyed to the 30-step FP16 recipe specified in §4.1.
