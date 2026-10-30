# FLOW COMPOSITE PIPELINE — the current EP01 video pipeline

**Status: CURRENT for EP01 video generation (production /
previsualisation), by owner ruling, 2026-10-28.** Registered in
`show/production/animation-method/METHOD-REGISTRY.md`. This document
is the method of record: how an EP01 beat becomes a moving clip
under this pipeline, exactly as first executed on the V3-005 proof.

**The rights label, stated first and plainly:** Google Flow's
commercial rights over its output are **UNCLEAR at source** (Flow
output carries SynthID; no verified grant of commercial rights
exists in our records). This pipeline is therefore **CURRENT FOR
PRODUCTION / PREVISUALISATION with the rights label attached** —
it is how EP01 footage is produced and judged now. It is **not**
the shippable-master path: the shippable-master question stays
open until the rights question resolves, or the Wan locked path
(Industry Method v1.3's animate step, the free stack) re-takes the
same frames and produces the shipping masters. The registry holds
both entries and states which is which; neither is a quiet
fallback for the other.

---

## The method (exactly as executed)

### Step 1 — Build the start frame locally, from real repo assets only

No generation happens in this step. The start frame is a composite
built on this machine from files already in the repo:

- **Character:** the character's canon front cutout from its
  reference pack —
  `show/production/tooling/avatar-stack/reference-packs/<name>/front.png`
  — used exactly as it stands in the pack (the pack is the
  likeness lock; nothing is redrawn, regenerated, or "improved").
- **Background:** the scene's real plate under
  `show/assets/backgrounds/` (the version registered CURRENT for
  the scene's use in `show/shared/PLATES-REGISTRY.md`).
- **Placement:** the cutout is scaled to scene size and planted
  where the staging record puts the character. On the proof
  build: plate 1280×720, character at 52% of frame height, feet
  planted at 84.5% of frame height, centred on the path.
- **Shadow:** a contact shadow is added **at composite** — a soft
  dark ellipse under the feet, blurred (the proof build: ~92% of
  character width, ~3% of frame height, alpha ~95/255, gaussian
  blur). This is a post step on the composite. Character art
  itself never carries a baked shadow (standing rule).

Posed beats (a character asleep, mid-action, in a pose the front
cutout doesn't hold) take their character element from a crop of
the character's candidate sheet panel instead of the front
cutout, composited onto the plate the same way — see the N1
appendix for the per-beat recipe of record.

### Step 2 — Image-to-video in Google Flow

- Upload the start frame as the **first frame / ingredient**.
- **Engine settings (as executed):** Veo 3.1 Lite, 16:9,
  8 seconds per generation.
- **Prompt formula:** one plain action sentence describing what
  the character does, then, verbatim: *"Keep the character
  design exactly as in the start frame. No camera movement."*
  The environment is not re-described beyond what the action
  needs — the frame already carries it.
- **Cost and pacing (measured):** 10 credits per clip. The free
  tier grants 50 credits/day (refresh ~9:43 AM CT), so the free
  pace is **~5 clips/day**. Retries come out of the same day's
  allowance.
- **Longer beats are chained segments:** a beat longer than 8 s
  generates as consecutive 8 s segments, each extended from the
  previous segment's last frame, and the edit trims the chain to
  the beat's staged duration.

### Step 3 — Gate every clip before it counts

Every generated clip is frame-checked — first, middle, and last
frames — against the performing character's pack
(`pack.json`: `do_not_change` list + `prompt_negative_additions`)
**before the clip counts as produced**. Drift on a locked trait
= the clip does not count; regenerate inside the day's credit
budget. The gate is mandatory per clip: the owner's adoption of
this pipeline is not a waiver of the gate, and a passed pipeline
never argues a drifted clip into a pass.

One EP01-specific gate note: **EP01's Dorowani has eye-whites**
(owner ruling — this one individual; kept, never corrected away).
His pack front shows them; the gate checks against the pack front
as it stands.

### Lighting — every segment names its key (wired 2026-10-28)

A segment is not fully specified until its light is. Before
generation, the segment record names:

- the **lighting key** — a `LIGHTING-SYSTEM.md` §3 key for the
  scene's location × time (for EP01, the §7 lighting-plot entry
  for the beat), or a §5 takeover / §11.1 source look where the
  beat calls for one;
- the **§8.1 lighting-sheet fields** for the segment (key
  source, rim colour + motivation, grade family, shift/release
  where the key changes) — filed with the segment, the same
  way the beat's staging is filed.

The Step-3 gate then also runs the **§8.2 lighting checks** on
the same first/middle/last frames: protected colours untinted
by environment colour (LS-2 — the performer's fills match the
pack front; only rim and atmosphere may carry the key's
colour); rim present and motivated, and **mandatory on
dark-bodied cast in night/dusk keys** (LS-3); any shift reads
as an overlay, not a repaint (LS-7). A clip that passes
likeness but fails its light does not count, for the same
reason a drifted clip does not count.

### Multi-character beats

Per-character isolation still applies (owner-locked
multi-character workflow — see `PRODUCTION-PATTERN.md`): each
character in a shared beat is generated **separately** through
this pipeline with its own start frame and likeness lock, cut
out, and composited over the shared plate in post (shadows at
composite, before the grade). Same-shot multi-character
generation is not this pipeline's method.

---

## Proof on record — EP01 V3-005 (executed 2026-10-28)

- **Beat:** V3-005 — Dorowani crosses the Gate path (staging:
  `show/episodes/EP01/EP01-V3-staging.json`).
- **Start frame:** `dorowani/front.png` (pack blob `d73eb226…`)
  composited onto
  `show/assets/backgrounds/gate/EP01-PLATE-gate-dawn-v1-derived-still.png`.
  Landed: `show/episodes/EP01/animatic/EP01-V3-005-flow-composite-startframe.png`
  (1,180,968 B, sha256 `03bc5e6b…`).
- **Prompt, verbatim:** "2D cartoon animation. The blue crocodile
  creature with red fin cheeks and a tan turtle shell on its back
  walks steadily toward the camera along the dirt path through
  the garden gate, arms swinging gently, morning light, flowers
  and wooden fence unchanged. Keep the character design exactly
  as in the start frame. No camera movement."
- **Clip:** 8.0 s, 1280×720, 24 fps, 3,948,326 B. Landed:
  `show/episodes/EP01/animatic/EP01-V3-005-flow-composite-clip.mp4`
  (sha256 `29265149…`). Cost: 10 credits; account balance after:
  20 credits.
- **Owner's ruling (2026-10-28, on viewing the clip in chat):**
  the pipeline is adopted as the CURRENT EP01 video pipeline —
  in his judgment the likeness was perfect, the background was
  perfect, everything was perfect, and the rest of the episode
  is to be generated with this method, piece by piece where that
  is faster. Per the New Deal, the owner's eye is the final gate;
  his ruling supersedes the pre-delivery checker's grade on this
  clip.
- **Measured drift note (kept on record alongside the ruling):**
  the character and the action held for the front stretch of the
  clip; at the finish the generation turned him into a profile
  exit and invented a long crocodile tail the canon front does
  not carry. This is recorded so the pattern is known and gated
  for — it is why the per-clip gate in Step 3 checks the **last**
  frame as well as the first, and why a tail (or any unlisted
  part) appearing in a generated segment is a locked-trait drift
  under the performer's pack, not a detail to wave through.
- **Rights label on both proof artefacts:** Flow output,
  commercial rights UNCLEAR (see the header). Proof /
  previsualisation artefacts — not shipping masters.

---

## Appendix — N1 beat-production order (V3-001 → V3-006)

Scene N1, "Dawn Before the Keeper." Recipes are read off the
staging record (`EP01-V3-staging.json`); durations are the staged
durations. Every beat over 8 s is chained 8 s segments (Step 2),
trimmed to the staged duration in the edit. Production order is
cut order. Total for N1: 6 beats, 12 segments = 120 credits at
first-gate-pass — about three production days at the free pace,
with retries drawn from the same daily allowance.

| Cut | Staged | Start-frame recipe | Action line (prompt's action sentence) | Segments |
|---|---|---|---|---|
| V3-001 | 14 s | **Plate only** — `backgrounds/gate/EP01-PLATE-gate-dawn-v1-derived-still.png`, empty frame | Mist band drifts low on the path; the garden sits still at dawn (the bell stir is audio-only — no character, no event) | 2, trim to 14 s |
| V3-002 | 12 s | **Plate only** — `backgrounds/pond/EP01-PLATE-pond-dawn-v1-derived-still.png` | A ripple crosses under the mist, right to left; nothing breaks the surface. (Hex stands distant and still at the far fence per the staging record — an unintroduced plate element, not a performed beat) | 2, trim to 12 s |
| V3-003 | 10 s | **Plate only** — crop of the Gate dawn plate on the Keeper Board, blank line held | The board holds; light moves a fraction across the wood; nothing is written | 2, trim to 10 s |
| V3-004 | 12 s | **Posed composite** — crop of the asleep panel from `reference-packs/kittember/candidate-expressions.png`, composited small and high onto the gate post of the Gate dawn plate; flame low | Kittember sleeps on the gate post, breathing slow, tail flame low and steady | 2, trim to 12 s |
| V3-005 | 14 s | **Cutout composite** — `reference-packs/dorowani/front.png` on the Gate dawn plate; the Manual prop rides with him (staging layers 005-doro / 005-manual) | Dorowani crosses the path carrying the Manual and checks the latch mid-frame. **PROOF BEAT — executed** (see above; the proof took the walk toward camera) | 2, trim to 14 s |
| V3-006 | 16 s | **Plate only** — Gate dawn plate | A curl of smoke slides home low along the path's edge, unhurried; no character in frame | 2, full 16 s |

Notes on the appendix:

- The Kittember candidate sheet is CANDIDATE status (owner lock
  pending at the time of writing); V3-004's recipe names it as
  the recipe of record because the front cutout holds no asleep
  pose. If the owner rejects the panel, the beat waits for a
  locked asleep panel rather than substituting a generated one.
- V3-002's Hex is a staging-record element (~90 px, frame right,
  unintroduced). It is not generated as a character performance;
  if it is composited, it uses Hex's pack front at staging size,
  gated like any other element.
- Beats after N1 follow the same three recipes — plate-only,
  cutout composite, posed (candidate-panel) composite — read off
  each cut's staging record the same way.
