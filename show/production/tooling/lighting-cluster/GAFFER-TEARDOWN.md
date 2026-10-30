# Gaffer (Image Engine) — teardown + verdict

**What it is.** Gaffer is the open-source, node-based application for
look development, lighting and scene assembly that Image Engine built
for its own VFX work and released to the industry. It is the cluster's
existence proof in application form: Gaffer is *built on* the same
open stack this package wires — it assembles scenes in **USD**,
manages colour through **OpenColorIO**, reads **MaterialX**, and its
whole workflow is the layer-it-don't-repaint-it discipline (lighting
and lookdev as node graphs over scene data). Actively maintained —
documentation line at 1.5.x (docs.gafferhq.org, checked 2026-10-28).

**Licence — OPEN SOURCE: BSD-3-Clause.** Bucket: open source,
BSD-3-Clause (LICENSE in the GafferHQ/gaffer repo; bundled third-party
components keep their own notices).

**Verdict for our pipeline: REFERENCE ARCHITECTURE + OPTIONAL TOOL
ENTRY — not installed, not a pipeline seat.** Reasons, plainly:

1. **Wrong stage for our show.** Gaffer lights and assembles *3D*
   scenes for a renderer. Our show is 2D/cel: our lighting is data +
   Natron overlay grades (LIGHTING-SYSTEM.md §9), and our composite
   seat is Natron (installed, verified, GPL-2.0). Gaffer would sit
   beside the pipeline, not in it.
2. **Staging law.** A Gaffer install is a GB-scale binary bundle;
   nothing production-related gets staged locally on spec. If a
   future 3D-plate or USD-lookdev lane opens, Gaffer is the first
   candidate to evaluate then — pulled to the seat that runs it, via
   manifest, at that time.
3. **Its value today is architectural.** Gaffer's scene-graph +
   spreadsheet/set-expression way of driving one lighting rig across
   many shots is the mature form of what our `usd/` package starts:
   keys as data, per-shot opinions as layers. When the key library
   grows past the Gate set, Gaffer's docs are the reference for how
   the node discipline scales — that is recorded here so the lane
   doesn't have to be re-found.

So: catalogued in CLUSTER-MAP.md and the tooling index as an optional
reference entry (BSD-3-Clause, not installed), USD/OCIO/MaterialX
carried by the pieces we did wire. No fake integration is claimed.
