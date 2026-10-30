# WAVE MAP — the studios' open production technology (2026-10-28)

The owner ordered the shows wave: tear down what the big studios
themselves published as open production technology, and wire what
honestly fits into the show pipeline at 100%. This package is the
delta on top of what already exists — it does not re-do the lighting
cluster (PR #65: OpenUSD / MaterialX / OpenColorIO wired and
validated), and it does not re-do UNIFIED-PIPELINE.md /
FULLSTACK-WIRING.md (Tahoma2D 1.6 puppet home, OpenToonz 1.8 upstream
reference, Blender 4.5 LTS camera seat, Natron 2.5.0 composite seat).
Those docs were audited from main before this pass; every row below
states what was already true and what this wave adds.

Licence buckets are exact, each verified at the source on 2026-10-28
(official repo licence file / official site). "Wiring status" names
the real thing that exists, not an intention.

| # | Item | What it is | Licence (verified) | Bucket | Already in house | This wave |
|---|---|---|---|---|---|---|
| 1 | **OpenVDB** (DreamWorks → ASWF) | Sparse volumetric data structure + tools (fog, smoke, clouds as data) | Apache License 2.0 (relicensed from MPL-2.0 at v12.0; repo README + RE-LICENSE_NOTE) | **Open source — Apache-2.0** | Nothing names it | Teardown + verdict: consumed **through Blender** (Blender reads/writes VDB for volume objects); no separate install in a 2D pipeline. REFERENCE + Blender-spine cross-ref |
| 2 | **MoonRay** (DreamWorks → ASWF) | Production Monte Carlo path-tracing renderer (every DreamWorks feature since 2019), USD Hydra delegate, Arras distributed rendering | Apache License 2.0 (repo LICENSE; docs.openmoonray.org/license) | **Open source — Apache-2.0** | Nothing names it | Teardown + verdict: REFERENCE architecture for the render seat (Cycles stays the house renderer); not installed — a second production path tracer buys a 2D puppet pipeline nothing |
| 3 | **Blender Studio open movies** (Blender Studio) | Entire film productions published: shot files, lib/ assets, caches/, per-task files, plus the pipeline conventions (Kitsu tracking, Flamenco farm, BAT, SVN) | Films + production files: **CC BY** (3.0 older / 4.0 current, per-film); pipeline tools: Kitsu AGPL-3.0 (CGWire), Flamenco GPL-3.0, add-ons GPL | **Open content (CC BY) + open source tools** | FULLSTACK-WIRING §0.4 already weighs Kitsu ("not warranted yet", revisit trigger named) | Teardown of the production ORGANISATION + `organisation/PRODUCTION-ORGANISATION.md` mapping the conventions onto `show/production/` + native folder/manifest templates |
| 4 | **Pixar — OpenSubdiv** | Subdivision-surface evaluation library (the same code Pixar runs in production) | Modified Apache 2.0 (Apache-2.0 with §6 replaced; SPDX "Pixar") | **Open source — Modified Apache-2.0** | Not named (USD covered by lighting cluster) | Teardown note: consumed via Blender/Maya-class DCCs; no direct wiring in a 2D pipeline. REFERENCE |
| 5 | **Pixar — OpenTimelineIO (OTIO)** | Editorial interchange format + API: the cut as data (EDL successor) | Apache-2.0 (ASWF project record) | **Open source — Apache-2.0** | Not named; the house cut record is `EP01-V3-episode.json` + build-manifest | Teardown + verdict: ADOPT AS SPEC — the episode JSON's successor format when editorial tooling lands; no code wired yet (nothing in the pipeline reads OTIO today) |
| 6 | **WDAS — Ptex** | Per-face texture mapping library (Disney Animation; no UVs) | BSD (repo licence; released under BSD in 2010) | **Open source — BSD** | Not named | Teardown note: renderer-side texture tech, consumed via renderers; no 2D-pipeline wiring. REFERENCE |
| 7 | **WDAS — SeExpr** | Expression language for procedural textures/shaders | Apache License 2.0 with §6 replaced (Disney modified Apache; source headers) | **Open source — Modified Apache-2.0** | Not named | Teardown note: lives inside renderers/DCCs; REFERENCE |
| 8 | **WDAS — Partio** | Unified particle file I/O (points/sprites interchange) | BSD-style licence (repo LICENSE) | **Open source — BSD** | Not named | Teardown note: FX interchange for 3D particle work; no current house consumer. REFERENCE |
| 9 | **Pixar/Disney published research + story practice** | Papers library (graphics.pixar.com), story/animatic conventions as published | Papers are published documents (read + cite; not a software licence) | **Published practice** | DESIGN-PRINCIPLES / story systems already draw on published craft | Teardown section: the adoptable conventions (animatic-first, story reel gates) cross-checked against house story tooling; nothing new claimed wired |
| 10 | **OpenToonz** (Digital Video → Studio Ghibli version → Dwango) | Full 2D production application: scan/cleanup, ink & paint, xsheet timing, node FX, render | Modified BSD License (repo licensing text; thirdparty + MyPaint brushes under their own terms) | **Open source — Modified BSD** | WIRED as upstream reference/fallback (UNIFIED-PIPELINE + FULLSTACK-WIRING: Tahoma2D 1.6 is the fork in the seat; 1.8.0 confirmed; Krita→OpenToonz cleanup-room addendum 2026-10-28) | Delta teardown only: paperless workflow + xsheet grammar vs Tahoma2D's, and the verdict (no change of seat) — `teardowns/OPENTOONZ-LINEAGE.md` |
| 11 | **Netflix VMAF** | Perceptual video-quality metric (the streaming industry's delivery yardstick) | BSD-2-Clause-Patent (+ BSD-3-Clause components) | **Open source — BSD-2-Clause-Patent** | Nothing names it; FULLSTACK-WIRING finish stage defines CRF 16 master / CRF 21 web copy with **no perceptual check** | **WIRED FOR REAL**: libvmaf-capable ffmpeg installed on this VM (no-sudo, workspace), `vmaf/vmaf_gate.py` quality gate, real EP01 artifacts measured, scores recorded in `vmaf/TEST-RECORD.md` |
| 12 | **OBS Studio** (OBS Project) | Broadcast/recording compositor: scenes + sources + profiles as JSON data | GNU GPL-2.0 | **Open source — GPL-2.0** | Nothing names it | Teardown + house broadcast profile as data (`obs/obs-house-scene-collection.json`, `obs/obs-house-profile.json`) mapped to the show's title-card / eyecatch / intertitle / credits furniture. Data authored + JSON-validated here; first-run proof = import on a machine with OBS (none on this VM) |

## The honest shape of this wave

- **One piece is wired with measured proof:** VMAF. It fills a real
  hole — the finish stage had encode recipes and loudness gates but
  no perceptual quality number anywhere. Numbers are in
  `vmaf/TEST-RECORD.md`, from real delivered files on disk.
- **One piece is adopted as organisation, not software:** the Blender
  Studio production conventions. Their value to a one-operator studio
  is the folder/manifest discipline, which maps onto our tree without
  adopting their tracker (FULLSTACK-WIRING already set the Kitsu
  revisit trigger: a second regular human in production).
- **The DreamWorks/Disney libraries are reference architecture** for a
  2D puppet pipeline, and the map says so plainly instead of dressing
  an install up as wiring. Where they genuinely touch us (OpenVDB via
  Blender volumes, OpenSubdiv via Blender) the touchpoint is named.
- **OBS is data, not a run:** the profile is authored to OBS's own
  JSON formats and validated as JSON; OBS itself is not installed on
  this VM (no display seat), so the import is a first-run proof owed,
  labelled as such.

## Cross-references

- Lighting cluster (sibling, PR #65): `../lighting-cluster/` —
  OpenUSD/MaterialX/OCIO live there; this wave does not duplicate
  them. OTIO (row 5) is the editorial sibling of USD's scene data:
  USD describes the shot, OTIO describes the cut.
- `show/production/UNIFIED-PIPELINE.md` — pipeline spine; the VMAF
  gate attaches at its stage 10 (Finish).
- `show/production/FULLSTACK-WIRING.md` — tool audit + install map;
  its finish profile (CRF 16 master / CRF 21 web) is what the gate
  measures against.
- Card/eyecatch furniture the OBS profile drives: the show's
  intertitle-craft format and eyecatch records under
  `show/production/` (see `obs/OBS-PROFILE.md` for the mapping).
