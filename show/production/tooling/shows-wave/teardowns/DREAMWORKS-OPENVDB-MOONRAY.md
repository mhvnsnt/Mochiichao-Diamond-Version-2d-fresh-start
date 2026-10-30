# TEARDOWN — DreamWorks open source: OpenVDB + MoonRay

DreamWorks Animation is the rare studio that gave away its crown
jewels twice: its volume library (2012) and its production renderer
(2023). Both now live at the Academy Software Foundation (ASWF).
Both are Apache-2.0. Neither is a 2D tool — this teardown states what
they are, what they're worth to us, and the honest verdict for each.

Licences verified at source 2026-10-28.

---

## 1. OpenVDB — the volume data structure

- **What it is:** a C++ library (with Python bindings) for storing
  and manipulating *sparse volumetric data* — fog, smoke, clouds,
  fire, water surfaces as level sets — on a hierarchical B+tree grid
  (the "VDB" grid). Only occupied space costs memory, so a mostly
  empty 3D volume stays cheap. Developed by DreamWorks (Ken Museth
  et al.), first production use *Puss in Boots* (2011) and *Rise of
  the Guardians* (2012); Academy Award–winning technology.
- **Licence:** Apache License 2.0. It was MPL-2.0 until v12.0, when
  every major copyright holder (DreamWorks, NVIDIA, Ubisoft, Adobe,
  Disney, ILM, …) signed off on relicensing to Apache-2.0 — stated in
  the repo README and RE-LICENSE_NOTE.txt. Current line: v13.x.
- **Who consumes it:** Blender (since 2016), Houdini, Cinema 4D,
  RenderMan, and MoonRay itself. It is the interchange shape for
  volumes across the industry.
- **Fit for our 2D pipeline:** indirect but real. Our volume-shaped
  problems are FX cards and atmosphere plates (fog banks, smoke
  wisps, the Dark Forest murk) — flat art, not simulated volumes.
  Where a Blender camera shot ever wants true volumetric atmosphere
  (a Grease Pencil scene with real fog depth), Blender's volume
  objects *are* OpenVDB under the hood, and external `.vdb` files
  are the way to bring a pre-baked volume in. That is the only
  touchpoint, and it already exists inside the Blender seat
  (FULLSTACK-WIRING pins Blender 4.5 LTS as the camera department).
- **Verdict: REFERENCE + named touchpoint, no separate install.**
  Installing libvmaf-style standalone VDB tooling buys a puppet
  pipeline nothing; consuming VDB through Blender, if a shot ever
  asks for it, is the whole of the honest wiring. If a future 3D
  environment pass (the game's world, a Blender environment build)
  needs volume interchange, OpenVDB/Apache-2.0 is the pre-approved
  answer and this teardown is its record.

## 2. MoonRay — the production renderer

- **What it is:** DreamWorks' Monte Carlo path-tracing renderer,
  written from scratch (no legacy code), in production on every
  DreamWorks feature since *How to Train Your Dragon: The Hidden
  World* (2019) — *The Bad Guys*, *Puss in Boots: The Last Wish*,
  *Kung Fu Panda 4*, *The Wild Robot* among them. Open sourced
  2023-03-15; now an ASWF project. Key architecture: a USD **Hydra
  render delegate** (it renders USD scenes natively), an extensive
  production-tested physically based material library, XPU mode
  (rays split across CPU + GPU), and **Arras**, its distributed
  computation framework for multi-machine/cloud rendering. It ships
  with regression-test (rats) and profiling tooling.
- **Licence:** Apache License 2.0 (repo LICENSE; docs.openmoonray.org).
- **Fit for our 2D pipeline:** none as a renderer. Our picture is
  hand-drawn/puppet 2D composited in Natron with Blender as the
  camera/FX stage, rendered by Cycles/Eevee-class engines when 3D
  is involved at all. Standing up a second production path tracer —
  one whose build expects a studio toolchain and whose strengths
  are photoreal/stylised-3D features — would add a render seat
  nothing in the show can feed.
- **What IS worth taking (reference architecture):**
  1. **The Hydra-delegate pattern** — renderer as a plug-in behind a
     scene-description standard. Our equivalent discipline already
     exists one cluster over: lighting keys as USD data (lighting
     cluster PR #65) that any consumer can read. MoonRay is the
     proof that pattern scales to a whole studio's output.
  2. **Arras-style distribution** — the shape of a render queue that
     treats machines as interchangeable workers. Our render needs
     are CPU batch jobs (tcomposer, NatronRenderer, ffmpeg); if a
     farm day ever comes, Arras's job model is the reference, with
     Blender Studio's Flamenco (GPL-3.0) the nearer-term candidate
     (see the Blender Studio teardown).
  3. **Regression renders as a gate** — MoonRay's rats tooling
     embodies "every renderer change must re-prove the pictures."
     The house analogue is our gate discipline (likeness/motion/
     loudness, and now the VMAF delivery gate in this package).
- **Verdict: REFERENCE architecture, not installed.** Reasons are
  the fit facts above, recorded so nobody has to re-litigate them.

## Sources

- OpenVDB repo + README/RE-LICENSE_NOTE:
  https://github.com/AcademySoftwareFoundation/openvdb
- OpenVDB 12.0 relicensing (ASWF/Phoronix coverage):
  https://www.phoronix.com/news/ASF-OpenVDB-12.0
- MoonRay repo + licence: https://github.com/dreamworksanimation/openmoonray
  · https://docs.openmoonray.org/license/
- MoonRay joins ASWF (facts + filmography):
  https://www.aswf.io/news/moonray-dreamworks-animations-open-source-production-renderer-joins-the-academy-software-foundation/
