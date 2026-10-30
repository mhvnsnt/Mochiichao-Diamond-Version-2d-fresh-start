# TEARDOWN — Disney / Pixar: everything beyond USD

Scope note: OpenUSD itself — plus MaterialX and OpenColorIO, the
standards cluster around it — is **already wired and validated** by
the sibling lighting-cluster package (PR #65): Gate keys as USD,
OCIO house config, MaterialX lustre. This teardown covers the
*rest* of the two studios' open technology, verified at source
2026-10-28, with an honest fit verdict per item. Most of it is 3D
rendering technology; the wave's job is to say exactly which pieces
a 2D puppet pipeline should adopt, reference, or leave alone.

## 1. The open-source list beyond USD

| Item | Studio | What it is | Licence (verified) | Verdict for us |
|---|---|---|---|---|
| **OpenSubdiv** | Pixar | Subdivision-surface evaluation on CPU/GPU — the exact library Pixar runs in production for character surfaces | **Modified Apache-2.0** (Apache-2.0 with §6 replaced; SPDX identifier "Pixar") | REFERENCE — consumed inside Blender/Maya-class DCCs; our characters are 2D rigs, not subdiv meshes. Nothing to wire directly |
| **OpenTimelineIO (OTIO)** | Pixar → ASWF | Editorial interchange: the *cut* as structured data (clips, order, durations, references to media) with adapters to EDL/AAF/NLE formats. Born at Pixar, used in production from *Coco* (2017) onward | **Apache-2.0** | **ADOPT AS SPEC** — see §2 |
| **Ptex** | Walt Disney Animation | Per-face texture mapping: no UV unwrapping; a texture per face, film-proven from *Bolt* (2008) onward | **BSD** (released under the BSD licence, 2010) | REFERENCE — renderer-side tech; reaches us, if ever, inside a renderer, never as a house tool |
| **SeExpr** | Walt Disney Animation | Embeddable expression language for writing procedural textures/shaders compactly | **Modified Apache-2.0** (Apache-2.0 with §6 replaced, per source headers) | REFERENCE — lives inside DCCs/renderers |
| **Partio** | Walt Disney Animation | One API for reading/writing particle/point data across formats (PDA/PRT/PTC/…): FX data interchange | **BSD-style** (repo LICENSE) | REFERENCE — 3D FX interchange; no house consumer today. First candidate if Blender FX data ever needs to move between tools |
| **BRDF Explorer, Dynamica, Reposado** | WDAS | Small utilities (BRDF viewing, dynamics, Apple update tooling) | various (per-repo) | OUT OF SCOPE — recorded so the list is complete; none touches animation production for us |

Two pattern-level observations worth more than any single library:

- **Disney/Pixar open-source their *interchange* layers** (USD for
  scenes, OTIO for cuts, Alembic/OpenEXR with partners for geometry
  and images, Partio for particles). The house style this suggests —
  and which our repo already follows with its JSON manifests — is:
  whenever two stages exchange something, the exchange format is a
  named, versioned data format, never a tool's private file.
- **The modified-Apache §6 pattern** (USD, OpenSubdiv, SeExpr) is
  the Disney-family house licence: Apache-2.0 with trademark rights
  expressly withheld. When our own tooling cites these, cite the
  licence as "Modified Apache-2.0", never plain Apache-2.0.

## 2. OTIO — the one real adoption

The house cut record today is `EP01-V3-episode.json` (per-episode
spec compiled by the build-manifest tooling) — a private format
that does OTIO's job for one pipeline. OTIO (Apache-2.0, ASWF,
Python API, adapters for EDL/AAF/FCP XML and an ffmpeg burn-in
adapter in contrib) is the industry-standard shape of the same
idea: timeline → tracks → clips with source ranges and media
references.

**Adoption verdict (spec-level, honest):** when editorial tooling
lands — a timeline editor seat, an OTIO-reading review tool, or
episode assembly moving out of the manifest compiler — the episode
record's successor format is OTIO, with the house JSON remaining as
the build input it already is. Nothing is wired today because
nothing in the pipeline can read OTIO today; claiming otherwise
would be paper wiring. The mapping is small and recorded here so
the future change is mechanical:

| House episode JSON concept | OTIO concept |
|---|---|
| episode | `Timeline` (one per episode) |
| act / segment grouping | `Stack` / track grouping |
| cut (`V3-###`) with in/out | `Clip` with `source_range` |
| plate/rig asset references | `MediaReference` (external) |
| intertitle / eyecatch cards | `Clip` on a dedicated cards track (see the OBS profile's scene names — same furniture) |
| subtitle-ration + gate results | `Metadata` (house namespace keys) |

## 3. Published research + story/animatic practice

Pixar's papers library (graphics.pixar.com) and both studios'
published production practice were checked for the parts *not*
already covered by house story systems:

- **The animatic/story-reel gate is the studios' real quality
  machine**: story reels are screened, torn down, and re-boarded
  repeatedly before production animation starts ("re-storying" is a
  budgeted phase, not a failure). Our pipeline already runs
  audio-before-picture with board-driven camera data
  (UNIFIED-PIPELINE), and the house writing system is rules-first —
  the published practice *confirms* the house shape rather than
  adding a new stage. Recorded as validation, not as a new wire.
- **Editorial owns the cut as data** (the practice behind OTIO):
  the reel is re-cut against latest renders continuously ("EDL →
  review → relink to latest renders" is Pixar's documented OTIO
  use case). Our per-cut ledger + clip-index is the same instinct
  at our scale; §2 is the upgrade path.
- Nothing in the published research changes a house rule; no new
  claims are wired from papers alone. (Papers are published
  documents — read and cited, never "installed".)

## Sources

- Pixar technology libraries (OpenUSD, OpenSubdiv, OTIO):
  https://graphics.pixar.com
- OpenSubdiv licence (SPDX "Pixar", Modified Apache-2.0):
  https://spdx.github.io/license-list-data/Pixar.html
- OpenTimelineIO (ASWF; Apache-2.0):
  https://github.com/AcademySoftwareFoundation/OpenTimelineIO
- Ptex (WDAS; BSD): https://github.com/wdas/ptex
- SeExpr (WDAS; modified Apache headers): https://wdas.github.io/SeExpr/
- Partio (WDAS): https://github.com/wdas/partio
- Disney open-source programme overview: https://opensource.disney.com
