# TEARDOWN (DELTA) — OpenToonz lineage: what upstream has that our seat doesn't start from

**Already wired (audited from main, not re-done here):**
UNIFIED-PIPELINE.md and FULLSTACK-WIRING.md already seat this
family: **Tahoma2D 1.6** (the community fork) is the puppet home —
Plastic-tool mesh/skeleton deformation, symbol mouth/eye/hand
frames, built-in Rhubarb Recognizer for visemes — and **OpenToonz
1.8.0** is recorded as upstream reference/fallback ("Tahoma2D
already ports its fixes; install only if a 1.8-only feature is
needed early"). The 2026-10-28 addendum to UNIFIED-PIPELINE adds a
named clean-up stage on top: Krita roughs → **OpenToonz cleanup
room** (match-line workflow, ink/paint from the locked palette,
timing finished on the Xsheet) via the Krita→OpenToonz exporter
plugin. FULLSTACK-WIRING pins versions, the `tcomposer` headless
renderer, and the install map. This teardown is only the delta:
the lineage, the workflow grammar, and whether that seat assignment
still holds. It does.

**Licence (verified at source 2026-10-28):** Modified BSD License
for the codebase proper (upstream's own licensing text; files under
`thirdparty/` and the MyPaint brushes library carry their own
terms). FULLSTACK-WIRING's "BSD-3-Clause (Dwango new BSD)" is the
same licence in shorthand — upstream's own name for it is the
Modified BSD License, and that is the name to cite.

## 1. The lineage, in one breath

Digital Video (Italy) built **Toonz**; Studio Ghibli ran a
customised branch ("Toonz Studio Ghibli Version") on its features
from *Princess Mononoke* onward; Dwango published that branch as
**OpenToonz** in 2016 under the Modified BSD License; the community
forked it into **Tahoma2D** (our seat — puppet/cutout-first) and
**Morevna**-era variants, while upstream OpenToonz continues
(1.8.0, June 2026: stroke replication, screentones, OCA import —
its first stable in ~3 years). Tahoma2D tracks upstream and ports
its fixes, which is why the house docs treat OpenToonz as the
reference implementation of the same grammar rather than a rival.

## 2. The paperless workflow — what upstream is *for*

OpenToonz covers the whole paper-born 2D pipeline in one program:

- **Scan + cleanup (GTS):** Ghibli's scanning tool batch-ingests
  paper drawings, cleans dust/specks, and binarises lines — the
  front door for hand-drawn production (Windows-only in upstream).
- **Ink & paint with palettes held apart from drawings:** a level's
  colours live in a palette; repaint the palette and every frame
  updates. This is the mechanism behind the cleanup-room addendum's
  "ink/paint from the locked palette" — the house colour discipline
  (protected identity colours, COLOR-SYSTEM anchors) has a native
  enforcement point here that a general-purpose paint tool lacks.
- **Node-tree FX + compositing inside the scene:** the Schematic
  (node graph) composites levels, cameras, and effects without
  leaving the program — for the cleanup stage this means a cleaned
  cut can be checked against its background before it ever reaches
  Natron.
- **Plastic tool + mesh deformation** (shared with Tahoma2D): the
  cutout engine both forks agree on.

## 3. Xsheet grammar: OpenToonz vs Tahoma2D

Both speak Xsheet — the exposure-sheet model inherited from paper
animation — but they face different directions:

| | OpenToonz (upstream) | Tahoma2D (our seat) |
|---|---|---|
| Primary model | Xsheet-first: columns = levels, rows = frames; the sheet *is* the scene's timing law | Timeline + Xsheet: timeline is the animator's working surface, Xsheet remains available |
| Born for | Paperless hand-drawn: drawn levels, exposure timing, cleanup/ink-paint at scale | Cutout/puppet: rigged levels, Plastic-tool keys, symbol frame libraries (mouths/eyes/hands) |
| Lip-sync | Manual / external | Built-in **Rhubarb Recognizer** places viseme frames from the voice track |
| Camera | Stage schematic + camera columns; pegbar-style moves on the sheet | Same inheritance, tuned for puppet scene assembly |
| Render | `tcomposer` CLI scene renderer | Same `tcomposer` lineage |

**Grammar verdict:** the Xsheet is the *timing record* in both —
and in our pipeline the timing record's master copy is the episode
manifest/xsheet data the build compiles, with Tahoma2D as the
authoring surface. Upstream's sheet-first discipline is the right
reference for the cleanup room (a cleaned cut's timing is finished
*on the sheet*, per the addendum), and Tahoma's timeline is the
right authoring surface for puppet scenes. No conflict; no change.

## 4. Delta verdict

- **Seat assignment stands:** Tahoma2D 1.6 authors puppets;
  OpenToonz 1.8 is upstream reference + the cleanup-room stage the
  addendum already names. Nothing in 1.8.0 (stroke replication,
  screentones, OCA import) is needed early enough to justify a
  separate in-VM install before Tahoma ports it — matching the
  existing house call.
- **The one genuinely new fact this teardown adds:** the palette-
  separation mechanism (§2) is the natural enforcement point for
  house colour law at the cleanup stage — worth naming in the
  cleanup stage's own docs when they are written, so ink/paint is
  done by palette edit, never by repainting frames.
- **Licence citation corrected to upstream's own name** (Modified
  BSD License) wherever this package cites it.

## Sources

- OpenToonz repo + licensing text: https://github.com/opentoonz/opentoonz
- OpenToonz official site (Ghibli lineage, pipeline scope):
  https://opentoonz.github.io
- OpenToonz 1.8.0 release coverage (features, Linux routes):
  https://www.linuxfordevices.com/tutorials/how-to-install-opentoonz-on-linux
- House seat record: `show/production/UNIFIED-PIPELINE.md`,
  `show/production/FULLSTACK-WIRING.md` (§2D table, §0.5)
