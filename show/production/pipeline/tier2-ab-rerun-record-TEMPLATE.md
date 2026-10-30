# Tier 2 A/B rerun — results record (TEMPLATE, not yet measured)

Status: TEMPLATE ONLY. No measured time has been recorded here.
The timed A/B rerun (v2 notebook, baseline cell vs optimized cell)
was launched on Kaggle before this orchestrator run and is still
in flight through a separate lane. Nothing in this file is a result
until that rerun reports.

## Run identity (fill in when the rerun reports)

- Rerun date / Kaggle session: _(blank until reported)_
- Notebook: `show/production/tooling/kaggle/mochiichao-comfyui-wan-v2.ipynb`
- Hardware: Kaggle T4 x2 (confirm from the session, do not assume)
- Operator / lane that ran it: _(blank — the in-flight browser-task lane)_

## Validity rules (all must hold, or the comparison is void)

- Baseline and optimized use IDENTICAL prompt strings, seed 42,
  49 frames at 16 fps, and a 480x1024 latent.
- NO upscale node anywhere in either A/B graph (see the 2x audit
  in `show/production/tooling/kaggle/README-kaggle.md`).
- Optimized run 1 pays the torch.compile warmup (untimed);
  run 2 is the timed warm run.
- Community estimates are NEVER entered as measurements.

## Results (blank until the rerun reports)

- Baseline (Run A: stock fp16 TI2V-5B, native nodes, 20 steps,
  uni_pc, CFG 5.5, seed 42): TOTAL _(blank)_ s
  - Reference only: the earlier test-1 as-run time was 1708 s
    (28m28s). That is the old run, not this rerun.
- Optimized warmup (Run B, first pass, untimed): _(blank)_ s
- Optimized warm (Run B, second pass, timed): _(blank)_ s
- Delivered resolution, baseline: _(blank)_ (must read 480x1024;
  test 1 wrongly delivered 960x2048 — record what actually arrived)
- Delivered resolution, optimized: _(blank)_
- 2x upscale audit finding: _(blank)_

## What happens with these numbers

When the rerun reports, the measured numbers replace the
community estimates in BOTH `TOOLS-MANIFEST.md` and
`README-kaggle.md`, in the same commit as the run report
(measurement rule in README-kaggle.md). Until then, every speed
figure stays labelled community-reported estimate, never measured.

## Likeness

Timing is not likeness. No A/B clip is promoted by this record.
Any clip that goes forward gets a gate packet with
`likeness_gate: PENDING_VERIFICATION` and goes through the gate
step (automated scorer when wired, else owner review) before
anything is recorded in `show/shared/clip-index.json`.
