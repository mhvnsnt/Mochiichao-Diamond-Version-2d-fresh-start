# A/B PROTOCOL — proof-cut acceleration test (rides on V3-078)

Date: 2026-10-28. This protocol executes **with** the proof run
(`flow-recipe/PROOF-PLAN.md`); it launches nothing on its own.
Purpose: replace `CAP-ANALYSIS.md`'s unmeasured central estimate
(325 s/pass) with a measurement, and decide — by rule, not by
impression — whether an accelerated profile becomes the foundry
default.

## Arms

| Arm | How | Recipe |
|---|---|---|
| **A — baseline** | kernel as-is (`FOUNDRY_ACCEL` unset) | 30 steps, CFG 5.0, uni_pc/simple, shift 8.0, FP16, pytorch attention, TrimVideoLatent repair on |
| **B — accel-a** | `FOUNDRY_ACCEL=accel-a` | 20 steps, TorchCompileModel(inductor), `--use-pytorch-cross-attention`; everything else identical |
| **C — accel-b** (optional second accelerated arm, only if B passes the gate) | `FOUNDRY_ACCEL=accel-b` | B + EasyCache(reuse_threshold 0.8, start 0.15, end 0.95) |

## Fixed across arms (no exceptions)

- **Same cut:** V3-078 (Wispkin, S5 Garden Gate Night, 10 s —
  4 chained passes of 49 frames at 16 fps: ⌈160/49⌉ = 4).
- **Same seed:** the kernel's per-pass seeds are a pure function of
  `FOUNDRY_SEED_BASE` (default 42) + cut index + pass index, so the
  same queue position yields identical seeds in every arm. Run each
  arm with the cut at the **same queue position** (single-cut queue
  via `--cuts V3-078` is cleanest) and record `FOUNDRY_SEED_BASE`.
- **Same inputs:** identical fed reference, control video, mask,
  plate, prompts — the kernel builds them deterministically from
  the same manifest entry; the ledger's `reference_sha256` must
  match across arms (check it; a mismatch voids the comparison).
- **Same seat class:** Kaggle T4 ×2 session, same datasets attached,
  weights staged once. Arms run in **separate sessions** (a profile
  is chosen at kernel start; launch flags differ). Do not compare
  arms across different GPU types.
- **Same graph repair:** TrimVideoLatent repair ON in all arms
  (never run an arm under `FOUNDRY_EXACT_PROOF_GRAPH=1` — that
  changes the graph, not the acceleration).

## Measurements (from the kernel ledger, both arms)

Per arm, harvest the shard ledger + RUN-LOG and record:

1. **Per-pass wall-clock.** The ledger records per-cut
   `gpu_seconds` (whole cut). Per-pass detail comes from the
   RUN-LOG `PASS_DONE` lines' ordering + the session wall-clock;
   if finer per-pass timing is needed, the coordinator reads the
   ComfyUI history execution times from the run folder. Report:
   - total cut `gpu_seconds`;
   - **steady-state per-pass seconds** = (total − pass 0) / 3 for
     arm B/C (pass 0 carries torch.compile warmup), and total / 4
     for arm A (no warmup exists);
   - pass-0 seconds separately for B/C, labelled compile warmup.
2. **Session wall-clock** (`sessions[].wall_seconds`) — reported,
   never used for the decision (it includes setup/staging).
3. **Speedup** = arm A steady-state per-pass ÷ arm B (or C)
   steady-state per-pass. Also report the naive total-to-total
   ratio; if the two disagree in direction, the steady-state number
   governs (compile is a one-time cost amortised over the episode's
   295 passes) and the disagreement is stated in the report.
4. **The new baseline number.** Arm A's per-pass seconds REPLACE
   the 325 s central estimate in `CAP-ANALYSIS.md` §3.3 — the
   coordinator updates that doc's band table with the measured
   value and re-derives the pace table. This happens regardless of
   which arm wins.

## Gate (both arms, identical)

Run `src/gate.py` on each arm's finished V3-078 clip with the same
fed reference + canon reference, per `PROOF-PLAN.md`'s clauses as
implemented: **FRAME1** (MAD ≤ 40.0 vs fed), **LIKENESS_SAMPLE**
(SSIM ≥ 0.50, IoU ≥ 0.55, MAD ≤ 40.0 vs canon, first/mid/last),
**MOTION** (mean frame-diff > 1.0), **BG_PERSIST** (0 white frames).
Record both gate records beside the run folders; the side-by-side
against `flow-tests/flow-wispkin-darkwave.mp4` remains part of the
proof report as PROOF-PLAN requires.

## Decision rule (binding)

- An accelerated arm **becomes the foundry default only if BOTH**:
  1. its steady-state per-pass time is **strictly faster** than
     arm A's, **and**
  2. its clip **passes the same gate clauses** arm A is judged by
     (all four PASS; if arm A itself FAILs a clause, the arm can
     only be adopted if it fails *no additional* clause and is not
     worse on the failed clause's measured value — and that case
     must be reported as a proof FAIL overall, per PROOF-PLAN,
     not as an acceleration win).
- **An acceleration that breaks the gate is a FAIL regardless of
  speed.** No exceptions, no "faster but slightly worse likeness"
  adoption.
- If B passes: B (`accel-a`) becomes default — the coordinator
  flips the kernel's default profile and records the change +
  measured numbers in `THROUGHPUT-ARCH.md` §4.2. Arm C then runs
  (same protocol) as the candidate to succeed B.
- If B fails on speed: try `accel-lite` (25 steps + compile) under
  the same rule before concluding compile/step cuts don't pay.
- If B fails on gate: B is rejected, the failing clause + measured
  values go into the teardown (§6 addendum), and the default stays
  baseline. Do not tune thresholds to rescue it — the gate is not
  ours to move.
- Optional toggles (`FOUNDRY_ACCEL_SAMPLER=dpmpp_2m`,
  `FOUNDRY_ACCEL_FAST_FP16ACC=1`, `FOUNDRY_ACCEL_HIGHVRAM=1`,
  xformers variant) each need their own arm under this same rule
  before joining any named profile. One variable per arm.

## Reporting

The proof report carries, per arm: profile name, launch flags,
per-pass seconds (pass 0 split out for B/C), total `gpu_seconds`,
speedup, gate record (verdict + per-clause measured values),
clip + frames. The headline pace (finished passed seconds per GPU
hour) is computed downstream in `stitch.py` as usual — this
protocol decides the *profile*, the proof plan decides the *road*.
