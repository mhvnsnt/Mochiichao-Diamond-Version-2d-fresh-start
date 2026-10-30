# REPLICA-MAP — free/local/Kaggle substitute per stage

Date: 2026-10-28. Companion to `FLOW-RECIPE.md` (same folder). Licence
buckets per the standing honesty law. "Fidelity" is stated honestly:
**expected**, not claimed — nothing on the local road has passed the
owner's bar yet, and this map does not pretend otherwise.

Target spec (from the owner-graded pair): **1280×720, 24 fps, 8.0 s,
correct character performing the named action, flat 2D canon style,
frame 1 → last frame.**

---

## Per-stage map

### Stage 1 — Composite start frame → IDENTICAL, no substitution
- **Substitute:** none needed. The stage is already local: reference-pack
  canon cutout + CURRENT plate, composited (PIL/ffmpeg), placement per the
  staging record. Prep tooling exists (`prep_start_frame.py` contract:
  tight-framed canon cutout, character ≥85% of frame height on white for
  reference-mode use — `parity/LOCK-ENGAGEMENT.md` §3).
- **Fidelity: exact.** Same files in, same PNG out. This stage is the
  recipe's real likeness lock and it transfers for free.

### Stage 2 — Contact shadow at composite → IDENTICAL
- Local composite step (soft ellipse, blur). Transfers exactly. Never baked
  into character art (standing rule).

### Stage 3 — Generation: Veo 3.1 Lite (hosted) → Wan VACE locked seat (Kaggle) ⚠ THE SUBSTITUTION
- **Original:** Google Flow / Veo 3.1 Lite — free proprietary, rights
  UNCLEAR, 10 credits/clip, 50/day. Output 1280×720 @ 24 fps, 8 s, and —
  critically — it *accepts the composited start frame and animates it
  while holding a flat 2D character design* at a level no local run here
  has matched.
- **Substitute (the only honest one on hand):** the **Wan 2.1 VACE-1.3B
  locked workflow** on a Kaggle T4 seat (open source, Apache-2.0 family):
  - Graph: `avatar-tool-build/parity/workflow-i2v-locked.json` — VACE
    reference latent (canon cutout VAE-encoded, prepended, mask-locked)
    + start frame as VACE anchor + non-scaled T5 path; weights already
    staged (`wan2.1_vace_1.3B_fp16.safetensors`, 4,309,519,800 B,
    server-verified). Engagement is machine-verifiable via the ComfyUI
    `/history` audit — see `parity/LOCK-ENGAGEMENT.md` §1.
  - Character LoRAs just trained for exactly this base:
    `wispkin_mochii_wan21_1.3b.safetensors` / `dorowani_mochii_wan21_1.3b.safetensors`
    (rank 16, 10 epochs, trigger tokens `wispkin_mochii` / `dorowani_mochii`,
    staged in Kaggle dataset `marsfmmg/mochiichao-character-loras`) —
    `avatar-tool-build/lora/LORA-MANIFEST.md`. **Caveat from that manifest:**
    trained on 1–2 distinct canon artworks per character; they are
    front-look identity anchors, not general character models, and they
    **cannot** load into the Wan 2.2 TI2V-5B scene workflow (no musubi
    TI2V-5B task exists) — the replica seat is the 1.3B VACE graph, not 5B.
  - Job control: `helpers/06-comfyui-pipeline-runner.py` (POST /prompt →
    poll /history → /view download, measured run-report) or the Kaggle
    batch kernel seat; the OpenX-flow adapter contract
    (`ep01-rebuild/full-stack/kernel3/mochiichao-flow-seat.py`) already
    speaks first-frame-in / clip+last-frame-out against this seat.
- **Spec gaps that must be engineered, stated plainly:**
  - Native seat profile is **480×768 @ 16 fps, 49 frames ≈ 3 s** per call
    vs Flow's 1280×720 @ 24 fps, 8 s. An 8 s replica segment = ~3 chained
    VACE calls (Stage 4 chaining), then RIFE interpolation 16→24 fps
    (`wiring/freedom/rife_workflow.json` exists) and upscale to 1280×720.
  - The one completed local Wan I2V proof of this exact test (Dorowani
    Water Orb, native baseline, *unlocked*) **FAILED frame 1** — SSIM
    0.2938 vs the 0.50 floor, "reference never anchored"
    (`test-scene/TEST-REPORT.md` §1). The **locked** VACE graph that is
    supposed to fix this has been wired and source-verified but its live
    run was killed by the wait/timeout defect class and has **never
    produced a graded clip**. The substitute is therefore *designed*, not
    *proven*.
- **Fidelity expectation: UNKNOWN — this is the replica's open question.**
  Veo 3.1 Lite is a large commercial model; Wan 2.1 VACE-1.3B on a T4 is
  not its peer in raw capability. The bet of the replica is that Stage 1's
  composite + VACE reference lock + LoRA anchor close the character-truth
  gap even if raw motion quality is lower. Only the proof cut (PROOF-PLAN.md)
  can settle it. **There is no honest closer substitute on hand**; the
  nearest partials are (a) the Wan 2.2 TI2V-5B scene seat — bigger model,
  but no LoRA engagement and no VACE reference lock as staged, and its
  two-character scene run has not been graded a pass either; (b) ToonCrafter/
  puppet routes — already rejected by the owner as not equivalent.

### Stage 4 — Last-frame chaining → COVERED
- `wiring/freedom/chain_segments.py`: last frame extracted → next segment's
  start frame, with a measured seam report. The flow-seat adapter returns
  `last_frame_b64` for the same purpose. **Fidelity: exact** (deterministic
  local step). The replica needs ~3 chain links per 8 s instead of Flow's
  1 link per 8 s — more seams, each a drift opportunity the gate must catch.

### Stage 5 — Per-character isolation + cutout + composite → COVERED
- Solid-field generation prompting (ask for a plain field behind the
  character), `white_matte.py` primary cutout (RVM measured and rejected on
  this material), BiRefNet backup, `freedom/scene_composite.py` overlay
  onto the CURRENT living plate, shadows at composite before grade.
  Evidence: PRODUCTION-PATTERN.md owner-locked section. **Fidelity: exact**
  for the steps; the matte quality depends on Stage 3 holding a clean field.

### Stage 6 — Gate → COVERED, and it is the replica's referee
- `parity/frame1_gate.py` + the likeness gate (SSIM / silhouette IoU /
  RGB-MAD thresholds already in repo tooling; calibration in
  `test-scene/TEST-REPORT.md`: frame-0 SSIM floor 0.50, IoU floor 0.55,
  RGB MAD ceiling 40) + first/middle/last frame check against the pack
  `do_not_change` list. Same gate the Flow clips passed. **Fidelity: exact.**

### Stage 7 — Post / grade / assembly → COVERED
- Local ffmpeg finishing; DaVinci Resolve free tier (free proprietary) is
  a named optional composite seat in the pattern; Blender/OpenToonz equally
  valid. Audio from the show's own lanes (Chatterbox/Kokoro, staged
  weights). **Fidelity: exact.**

---

## Summary table

| Stage | Original | Replica | Fidelity risk |
|---|---|---|---|
| 1 Start frame | local composite | same | none |
| 2 Shadow | local composite | same | none |
| 3 Generation | Veo 3.1 Lite (Flow, capped) | Wan 2.1 VACE-1.3B locked + char LoRA, Kaggle T4 | **HIGH — unproven; the whole bet** |
| 4 Chaining | last-frame, 1 link/8 s | chain_segments.py, ~3 links/8 s | low–medium (seam drift ×3) |
| 5 Isolation/cutout | per-character + matte | white_matte/BiRefNet + scene_composite | low |
| 6 Gate | pack frame-check | frame1_gate + likeness gate | none (same referee) |
| 7 Post | local | local | none |

**Ceiling after replica:** no per-day clip cap. The honest new ceiling is
Kaggle GPU time (~30 GPU hrs/week) — pace is measured as *finished seconds
of passed video per GPU hour* (Grok design note adopted by the owner
correction), to be measured on the proof cut, not estimated here.

**Rights win, stated once:** replica output is built from Apache-2.0 Wan
weights + the owner's own canon art — no SynthID, no unclear grant. A
passing replica clip is a shippable master; a passing Flow clip is not.
That is the actual prize for removing the ceiling.
