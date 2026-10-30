# shows-wave — the studios' open production technology, wired in

Owner's order (2026-10-28): tear down what the big studios
published as open production technology and wire what honestly fits
the show pipeline at 100%. This package is the delta over
UNIFIED-PIPELINE.md, FULLSTACK-WIRING.md, and the lighting cluster
(PR #65) — audited first, never duplicated.

## Contents

- `WAVE-MAP.md` — every target, licence verified at source,
  HAVE/PARTIAL/GAP with the evidence.
- `teardowns/DREAMWORKS-OPENVDB-MOONRAY.md` — OpenVDB (Apache-2.0)
  and MoonRay (Apache-2.0): reference architecture + the one real
  touchpoint (VDB through Blender).
- `teardowns/BLENDER-STUDIO-OPEN-MOVIES.md` — how a Blender Studio
  production is organised (shot packages, lib/, per-task files,
  output contracts, Kitsu/Flamenco/BAT).
- `organisation/PRODUCTION-ORGANISATION.md` — those conventions as
  house law, mapped onto `show/production/` + `templates/` (the
  per-cut manifest and folder contract).
- `teardowns/DISNEY-PIXAR-REMAINING.md` — beyond USD: OpenSubdiv,
  Ptex, SeExpr, Partio (reference) and OpenTimelineIO (**adopted as
  spec** — the episode record's successor format).
- `teardowns/OPENTOONZ-LINEAGE.md` — the delta only: lineage,
  paperless workflow, Xsheet-vs-Tahoma grammar, seat verdict
  (Tahoma2D 1.6 stays; OpenToonz 1.8 stays upstream reference +
  cleanup room).
- `vmaf/` — **the wave's proof piece.** Netflix VMAF
  (BSD-2-Clause-Patent) wired as a real delivery gate:
  `vmaf_gate.py` measures any delivery encode against its master;
  `VMAF-POLICY.md` sets the pass lines and the 2D-animation caveat;
  `TEST-RECORD.md` holds the measured scores from real EP01
  artifacts, exactly as measured.
- `teardowns/OBS-BROADCAST.md` + `obs/` — OBS Studio (GPL-2.0) as
  the broadcast/presentation layer: house scene collection + profile
  as repo data, mapped to the title-card / eyecatch / intertitle /
  next-time / credits furniture. Authored + JSON-validated;
  first-run import proof owed (no OBS on this VM).

## The one-line state of the wave

One tool wired with measured proof (VMAF), one discipline adopted
as organisation (Blender Studio), one format adopted as spec
(OTIO), one profile authored as data (OBS), and the studio
libraries recorded as reference architecture with reasons — no
install dressed up as wiring anywhere in the package.
