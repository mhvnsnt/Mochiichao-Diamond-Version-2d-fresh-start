# FLOW-RECIPE — the proven pipeline, reverse-engineered from the records

Date: 2026-10-28. Method: verify-then-state. Every claim cites the file it
was read from. Folder names were treated as **no evidence**; attribution
below rests on MP4 metadata, hashes, timestamps, and the folders' own logs.

---

## 0. ATTRIBUTION — settled first, because the owner flagged it (15:43 CDT)

The owner warned that the "Flow" label on the best clips might be wrong and
that the best clips came from a **WAN-based pipeline capped at 5 uses/day**.
The records say otherwise, in four independent ways. The disagreement is
flagged, not smoothed over:

| Evidence | What it shows | Source |
|---|---|---|
| MP4 metadata, all 5 clips | `encoder=Google`, AAC audio stream, `major_brand=isom` — a Google-service export signature. Local Wan/ComfyUI output carries none of these (no AAC track, no Google encoder tag). | ffprobe run 2026-10-28 on `flow-tests/*.mp4`, `grok-fix/EP01-V3-005-flow-walk.mp4`, `ep01-flow-production/*.mp4` |
| Hash match | `grok-fix/EP01-V3-005-flow-walk.mp4` sha256 `29265149…` and its start frame `03bc5e6b…` are byte-identical to the artefacts the pipeline document records as its executed Google Flow proof. | `~/workspace/flow-pipeline-landing/final/FLOW-COMPOSITE-PIPELINE.md` §Proof vs sha256sum run 2026-10-28 |
| Credit arithmetic | The pipeline doc records the V3-005 proof cost 10 credits with **balance 20 after**. The production log records **balance 0 after V3-002**. 50/day − 20 (two earlier clips) − 10 (V3-005) − 10 (V3-001) − 10 (V3-002) = 0. The two earlier clips are exactly the `flow-tests/` pair (file birth 09:54 CDT, ~11 min after the ~9:43 AM CT credit refresh). | `FLOW-COMPOSITE-PIPELINE.md` §Proof; `~/workspace/ep01-flow-production/EP01-FLOW-PRODUCTION-LOG.md` §Credit state; `stat` on the files |
| The pattern's own step 3 | The production pattern prescribes, before episode work on a new engine, short test clips of **Wispkin's Dark Wave and Dorowani's Water Orb** as "the comparison set." The `flow-tests/` pair is exactly those two clips, on plain solid fields (the pattern's solid-field cutout insurance). | `~/workspace/flow-pipeline-landing/final/PRODUCTION-PATTERN.md` step 3 + owner-locked section |

**Verdict per file:**

- `flow-tests/flow-wispkin-darkwave.mp4` + `flow-dorowani-waterorb.mp4` —
  **Google Flow, Veo 3.1 Lite** (metadata + credit chain + pattern step 3).
  These are the owner-graded best pair.
- `ep01-flow-production/EP01-V3-001…` / `V3-002…` — **Google Flow, Veo 3.1
  Lite**, stated outright in the folder's own log with verbatim prompts.
- `grok-fix/EP01-V3-005-flow-walk.mp4` — **Google Flow, Veo 3.1 Lite**, the
  pipeline's executed proof beat (hash-identical). "Grok" built the job
  package; the generation engine was Flow.
- **No record ties any produced clip to a Wan-based route at 5/day.** Every
  Wan route in the records either failed its gate (Kaggle Wan I2V proof:
  frame-1 FAIL, SSIM 0.2938 — `~/workspace/avatar-tool-build/test-scene/TEST-REPORT.md` §1)
  or has produced no episode clip (the OpenX-Inc/flow → VACE seat,
  `kernel3/mochiichao-flow-seat.py`, is a contract proof against a stub —
  `closure/flow/test_evidence.json`). The 5/day cap in **every** record
  belongs to Google Flow's free credits (50/day ÷ 10/clip).
- **Where chat and records disagree:** chat's "Wan-based, 5/day" and the
  owner's recollection conflict with the folders' own records above. A
  plausible source of the mix-up: three different things share the name
  "flow" in this workspace — (1) **Google Flow** (Veo), (2) **OpenX-Inc/flow**
  (MIT orchestrator whose backend is Wan — `helpers/05-flow-patterns.md`),
  (3) the **flow-seat** Kaggle kernel that plugs (2) into the Wan VACE seat.
  Only (1) has produced a passing clip.

**What is genuinely missing for the best pair:** no verbatim prompts, no
start-frame files, and no run log survive for the two `flow-tests/` clips —
only the clips + extracted frames. Their recipe is reconstructed from the
pipeline document's Step 2 formula and the pattern's step 3, and is marked
RECONSTRUCTED wherever used below.

---

## 1. The target — measured properties of the owner-graded pair

ffprobe, 2026-10-28 (both clips identical in spec):

| Property | Wispkin — Dark Wave | Dorowani — Water Orb |
|---|---|---|
| File | `~/workspace/flow-tests/flow-wispkin-darkwave.mp4` | `~/workspace/flow-tests/flow-dorowani-waterorb.mp4` |
| Size | 1,308,142 B | 1,978,210 B |
| sha256 | `4d40c04d32f8c5dca4bce29e51ecc91a563ff691fce3cdfa62c5f1b93eb6ae3b` | `3118dc7c2ca3ac616fc880fc3ae910558e41db7025039288bca37ecc294b9c7e` |
| Spec | 1280×720, h264, 24 fps, 192 frames, 8.000 s, + AAC audio stream | same |
| Frame 0.5 s | Canon Wispkin centred on plain cream field: cracked white skull mask, black smoke tail, hands at mask cheeks | Canon Dorowani full body on plain light field: blue croc body, RED fin cheeks, red eyes, tan shell on back, dorsal fin — the current design, not the wrong version |
| Frame 4 s | Mask tilts, smoke swirls — character and style hold | Tight shot: Dorowani charges a glowing blue Water Orb between his hands, expression fierce, design intact |
| Frame 7.5 s | Dark Wave released: purple energy burst, glowing purple eyes, speed lines — the named move, performed by the correct character | Orb discharged; close-up holds the design (red fin cheeks, teeth, shell straps) |

**Replica target spec: 1280×720, 24 fps, 8.0 s segments, correct character
performing the named action in flat 2D canon style from frame 1 to last frame.**

Also produced on this road (same spec, `encoder=Google`):
`grok-fix/EP01-V3-005-flow-walk.mp4` (3,948,326 B, sha256 `29265149…` —
Dorowani walk at the Gate; owner ruling on this clip adopted the pipeline,
with a recorded late-clip drift: profile exit + invented long tail),
`ep01-flow-production/EP01-V3-001-flow-gate-dawn-seg1.mp4` (2,117,528 B,
gate PASS) and `EP01-V3-002-flow-pond-seg1.mp4` (1,423,517 B, beat PASS,
plate note GAP-pond-canon).

---

## 2. The recipe, stage by stage

Source of record: `~/workspace/flow-pipeline-landing/final/FLOW-COMPOSITE-PIPELINE.md`
(the method document, owner-ruled CURRENT 2026-10-28), corroborated by
`EP01-FLOW-PRODUCTION-LOG.md` and `PRODUCTION-PATTERN.md`.

### Stage 1 — Start frame built locally (NO generation)
- **Does:** composites the character's canon front cutout from its
  reference pack (`reference-packs/<name>/front.png`, used exactly as it
  stands — the pack is the likeness lock) onto the scene's CURRENT plate
  (1280×720). Proof build: character at 52% of frame height, feet at 84.5%,
  centred on the path. Posed beats use a candidate-sheet panel crop instead
  of the front cutout. Plate-only beats skip the character entirely.
- **Inputs:** canon cutout + plate. **Output:** one 1280×720 PNG start frame.
- Evidence: FLOW-COMPOSITE-PIPELINE.md Step 1; surviving examples:
  `grok-fix/EP01-V3-005-composite-startframe.png` (1,180,968 B, sha256
  `03bc5e6b…` — Dorowani on the Gate dawn plate, contact shadow visible),
  `ep01-flow-production/EP01-V3-002-startframe.png` (40,179 B, Hex composited
  at ~90 px, far shore right edge, soft contact shadow at composite).

### Stage 2 — Contact shadow at composite (before generation)
- A soft dark ellipse under the feet (~92% of character width, ~3% of frame
  height, alpha ~95/255, gaussian blur), added to the start-frame composite.
  Character art itself never carries a baked shadow (standing rule).
- Evidence: FLOW-COMPOSITE-PIPELINE.md Step 1 (Shadow).

### Stage 3 — Hosted image-to-video generation ⬅ THE CEILING LIVES HERE
- **Service/model:** Google Flow, **Veo 3.1 Lite**, 16:9, 8.0 s per
  generation, start frame uploaded as first frame / ingredient.
- **Prompt formula:** `2D cartoon animation.` + one plain action sentence +
  verbatim tail: *"Keep the character design exactly as in the start frame.
  No camera movement."* The environment is not re-described — the frame
  carries it. (Verbatim examples for V3-001/V3-002/V3-005 are recorded in
  the production log and pipeline doc.)
- **Cost: 10 credits per clip; free tier = 50 credits/day, refresh ~9:43 AM
  CT → ~5 clips/day ≈ 40 finished seconds/day.** Retries draw from the same
  allowance. This stage — and only this stage — consumes the capped credits.
  Stages 1, 2, 4, 5, 6 are all local and uncapped.
- **Output:** 1280×720, 24 fps, 8.0 s h264 MP4 (with AAC stream and SynthID;
  commercial rights UNCLEAR — production/previs only, not shipping masters).

### Stage 4 — Chaining for beats longer than 8 s
- Each further segment is generated from the previous segment's **last
  frame**; the edit trims the chain to the beat's staged duration
  (e.g. V3-001: 14 s cut = 2 segments). Evidence: FLOW-COMPOSITE-PIPELINE.md
  Step 2; production log "Segment 2 — STILL OWED. Chain from segment 1's
  last frame at the next credit refresh."

### Stage 5 — Per-character isolation for multi-character beats
- Each character is generated **separately** (own start frame, own lock),
  cut out, and composited over the shared plate in post. Same-shot
  multi-character generation is not the method. Evidence:
  FLOW-COMPOSITE-PIPELINE.md "Multi-character beats"; PRODUCTION-PATTERN.md
  owner-locked workflow (shared scene timing map; plate gate before cutout;
  cutout tool `white_matte.py` primary, BiRefNet backup).

### Stage 6 — Gate every clip (first / middle / last frames)
- Frame-check against the performer's pack (`pack.json` `do_not_change` +
  `prompt_negative_additions`) **before the clip counts**. Drift on a locked
  trait = clip does not count; regenerate inside the day's budget. The last
  frame is checked because the V3-005 proof drifted late (invented tail).
  EP01 note: Dorowani's eye-whites are owner-ruled for this individual and
  are never "corrected." Evidence: FLOW-COMPOSITE-PIPELINE.md Step 3 + proof
  drift note; production log gate verdicts.

### Stage 7 — Post and assembly (local)
- Shadows (already at composite), colour grade, effects, audio laid in from
  the show's own lanes, chained segments trimmed, episode assembled in local
  tooling — never inside Flow. Evidence: production log header ("shadows,
  colour grade and effects in post"); PRODUCTION-PATTERN.md step 5.

---

## 3. The ceiling, in one line

**Stage 3 only:** 50 free Flow credits/day ÷ 10 credits per 8 s Veo 3.1 Lite
segment = 5 segments ≈ 40 finished seconds/day. Everything else in the
recipe is already local. Replicating the recipe therefore means replacing
exactly one stage — the generator — without losing what Stage 1's
composite start frame buys: the character is *already correct in frame 1*
before the generator ever runs.
