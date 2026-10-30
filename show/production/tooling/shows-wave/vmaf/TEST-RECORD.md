# TEST RECORD — VMAF gate, first measurements (2026-10-28)

Measured on this VM, from real delivered files on disk, with the
gate tool in this folder (`vmaf_gate.py`). Scores are reported
exactly as the tool emitted them; the raw per-run JSONs are in
`scores/` beside this file.

## Environment

- ffmpeg: **7.0.2-static** (John Van Sickle static build,
  sha256 `e7e7fb30477f717e…`), chosen because it ships the
  `libvmaf` filter; the VM's system ffmpeg 8.1.2 was built
  **without** libvmaf (verified: filter list contains `vmafmotion`
  only). Installed no-sudo under the workspace; nothing system-wide
  was changed. BtbN's equivalent build was attempted first and
  abandoned at 157 MB on a contended network — the 42 MB static
  build finished byte-exact (41,888,096 bytes = the server's
  Content-Length).
- libvmaf model: `version=vmaf_v0.6.1` (built-in), `n_threads=2`.
- Machine: 2 vCPU / 7.7 GB, heavily shared during the runs — wall
  times below are contention-inflated and are not a property of
  the tool.
- Gate lines (VMAF-POLICY.md): pooled mean ≥ 93, p5 frame ≥ 80.

## What was measured

References are the delivered artifacts themselves; "distorted" is
an encode the gate produced from the reference at a documented
house profile (FULLSTACK-WIRING stage 10: web = H.264 CRF 21;
ladder28 = H.264 CRF 28 aggressive rung). So each number reads:
*if we deliver at this profile, this is how much picture the
viewer loses versus the master.*

| Run | Reference (path) | Profile | Frames | Mean | p5 | Min frame | Encode bytes | Verdict |
|---|---|---|---|---|---|---|---|---|
| cut-V3-001-web | `~/workspace/ep01-finish/renders/V3-001.mp4` (14 s) | web CRF 21 | 336 | **96.523** | 96.373 | 96.336 | 1,492,001 | PASS |
| cut-V3-010-web | `~/workspace/ep01-finish/renders/V3-010.mp4` (8 s) | web CRF 21 | 192 | **97.516** | 96.369 | 95.965 | 1,131,381 | PASS |
| cut-V3-100-web | `~/workspace/ep01-finish/renders/V3-100.mp4` (12 s) | web CRF 21 | 288 | **96.794** | 95.744 | 95.034 | 863,688 | PASS |
| flow-V3-001-web | `~/workspace/ep01-flow-production/EP01-V3-001-flow-gate-dawn-seg1.mp4` (8 s) | web CRF 21 | 192 | **96.477** | 95.763 | 95.333 | 1,848,196 | PASS |
| master-web-ss60 | `~/workspace/ep01-finish/masters/EP01-V3-MASTER.mp4`, 60–150 s | web CRF 21 | 2161 | **96.738** | 96.108 | 95.722 | 6,801,372 | PASS |
| master-lad28-ss60 | same master, 60–150 s | ladder CRF 28 | 2161 | **94.144** | 92.776 | 91.790 | 3,421,783 | PASS |
| master-web-ss660 | same master, 660–690 s | web CRF 21 | 721 | **96.033** | 95.403 | 92.088 | 2,883,275 | PASS |
| master-lad28-ss660 | same master, 660–690 s | ladder CRF 28 | 721 | **92.528** | 91.624 | 87.242 | 1,282,383 | **FAIL** (mean < 93) |
| master-web-ss1260 | same master, 1260–1290 s | web CRF 21 | 721 | **96.944** | 96.196 | 95.787 | 1,729,382 | PASS |
| master-lad28-ss1260 | same master, 1260–1290 s | ladder CRF 28 | 721 | **95.268** | 92.786 | 91.857 | 851,864 | PASS |

## Reading the results (honest)

- **The documented web profile (CRF 21) is comfortably shippable**
  everywhere measured: means 96.0–97.5, worst single frame 92.088.
- **The CRF 28 ladder rung is content-dependent**: 94.1 and 95.3 on
  two windows, **92.5 — below the line — on the 660 s window**.
  That FAIL is the gate earning its keep: a fixed CRF 28 rung
  cannot be blessed episode-wide from two good windows. Either the
  rung rises (CRF ~25) or ladder deliveries gate per-window.
- All of this carries the VMAF-POLICY caveat: the model was trained
  on natural footage; flat 2D scores skew high. These numbers are a
  regression yardstick, not an absolute quality claim.

## Defect found and fixed during this test

First master-window run (90 s window) did not finish in reasonable
time: the gate's comparison command limited the window on the
*inputs* only, so ffmpeg kept decoding the 24-minute reference
long past the window's end (16+ min under load, killed). Fix,
landed in `vmaf_gate.py` with this record: the window is now also
an **output-side** `-t` cap plus `-shortest`. Re-run of the same
window then completed in minutes with the scores above. Cut-length
runs (no window) were unaffected and were not re-run.

One battery script also died mid-run under the box's memory
pressure (its final run's encode existed, no result); that run
(master-lad28-ss1260) was re-executed directly in the foreground
and its real output is the row above. No number in this record
comes from a run that did not complete.
