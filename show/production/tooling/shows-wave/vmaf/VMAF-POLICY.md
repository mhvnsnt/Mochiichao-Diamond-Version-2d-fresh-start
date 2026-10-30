# VMAF POLICY — the delivery quality gate

## What this is

Netflix's VMAF (BSD-2-Clause-Patent) is the streaming industry's
standard perceptual quality metric: it scores an encode against a
reference from 0–100 the way viewers, not pixels, would judge it.
The house finish stage (FULLSTACK-WIRING stage 10) already fixes
*how* we encode — CRF 16 master, CRF 21 web copy — and loudness is
gated (−14 LUFS). Until this package, nothing measured whether a
delivered encode actually *looks* like its master. The VMAF gate
(`vmaf_gate.py`, beside this file) closes that hole.

## The gate

- **Where:** Finish, after the web copy / delivery encode exists,
  before the delivery ledger is written. One number per delivered
  encode, recorded in the ledger next to the loudness numbers.
- **Reference:** the episode master (or, for a single-cut delivery,
  the cut's composite render).
- **Model:** `vmaf_v0.6.1` (the standard HD model built into
  libvmaf). Do not mix models inside one ledger.
- **Pass lines (house policy, provisional):**
  - pooled mean **≥ 93**
  - 5th-percentile frame **≥ 80** (the mean alone hides a bad
    stretch; the p5 line is the "no visibly broken passage" rule)
- Exit code 0/1 from the tool; a FAIL loops the encode at a lower
  CRF, the same way a loudness FAIL loops the mix.

## The honest caveat — read before quoting a score

VMAF's models were trained on natural, live-action/cinematographic
footage. Our picture is flat 2D animation: large flat colour fields,
hard line art, held frames. Three consequences, all recorded so
nobody over-reads a number:

1. **Scores skew high.** Flat content compresses cleanly, so a 2D
   encode will typically score higher than live action at the same
   settings. A 97 here is not "better than" a 93 on a film scan.
2. **The gate is a regression alarm, not a taste oracle.** Its real
   job: catch the encode that silently went wrong — wrong CRF,
   wrong resolution, a corrupted ladder rung, banding in a night
   plate — by comparing every delivery to the same yardstick.
3. **Thresholds are provisional** until a season of deliveries
   calibrates them. If real deliveries cluster at 98+, the lines
   rise; the policy changes in the open, in this file, with the
   measurements that justified it (first measurements:
   TEST-RECORD.md beside this file).

## Running it

```bash
export VMAF_FFMPEG=/path/to/ffmpeg-with-libvmaf
python3 vmaf_gate.py --reference EP01-V3-MASTER.mp4 --profile web --out gate/EP01-web
python3 vmaf_gate.py --reference cut-render.mp4 --distorted cut-web.mp4 --out gate/V3-042
```

The tool refuses politely (exit 2) if the ffmpeg lacks libvmaf or
the geometries differ — a gate that can't measure must never
silently pass. Scratch (encodes, logs) stays under `--out`, never
/tmp (the 512 MB pinch rule).
