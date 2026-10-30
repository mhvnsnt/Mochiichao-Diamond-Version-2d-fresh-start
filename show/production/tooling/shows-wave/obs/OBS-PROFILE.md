# OBS house broadcast profile — how it maps to the show's furniture

OBS Studio (GPL-2.0) is the delivery/presentation seat for finished
shows: premieres, review screenings, and any live "broadcast" of an
episode. Its configuration is data, so the house profile lives here
as reviewed files instead of clicks on one machine:

- `obs-house-scene-collection.json` — the scene collection (OBS's
  own JSON format): one scene per piece of house furniture.
- `obs-house-profile.json` — the profile settings record (canvas,
  fps, recording/streaming values mirroring basic.ini keys).

## Scene ↔ furniture mapping

| Scene | Drives | Source type | Swap discipline |
|---|---|---|---|
| SLATE | house slate before air | image | fixed house asset |
| TITLE CARD | the episode's title card (fx/cards set) | image | point at the episode's card file |
| EPISODE PLAYBACK | the episode master (`exports/EP##-V#-MASTER.mp4`) | media (ffmpeg_source, restart on activate, no loop) | point at the episode's master |
| EYECATCH IN | eyecatch, first half | media | episode's eyecatch file |
| INTERTITLE | intertitle plates (intertitle-craft format cards) | image | swap the image per card — the scene never changes, the file does |
| EYECATCH OUT | eyecatch, second half | media | episode's eyecatch file |
| NEXT TIME | next-episode card | image | episode's card file |
| CREDITS | credits card | image | episode's card file |
| HOLD CARD | off-air / technical hold | image | fixed house asset |

The show's Persona-dialect law applies to broadcast dressing the
same way it applies in-episode (PR #63): the broadcast frame is
furniture, never a content channel — no dialect styling on card
scenes except where the episode's own cards already carry it.

## Media paths

Source paths in the collection use the placeholder root
`/MEDIA/mochiichao/…`. At first import on the broadcast machine,
re-point each source at the real episode export/card locations
(OBS: right-click source → Properties). Paths are the only
machine-specific part; scenes, order, transitions (Cut + 300 ms
Fade), and settings travel as-is.

## Settings that matter (from obs-house-profile.json)

- Canvas and output both **1280×720 @ 24 fps** — the measured house
  master format; the broadcast chain performs no scaling.
- Recording: x264 CRF 16 into MKV, remux to MP4 after — the same
  quality point as the file master, so a recorded screening can be
  VMAF-gated against the master like any other delivery encode.
- Audio passes through untouched: masters are already loudness-true
  (−14 LUFS / −1 dBTP house law); OBS adds no gain.
- Streaming block is a named blank: no service or stream key is
  stored in this repo, ever.

## Status

Authored data, JSON-validated on this VM (2026-10-28). OBS is not
installed here (no display seat), so **first-run proof is owed**:
import the collection + set the profile values on a machine with
OBS, confirm all nine scenes resolve their sources, and record the
OBS version in this file. Until that line exists, treat the profile
as PARTIAL (see WAVE-MAP row 12).
