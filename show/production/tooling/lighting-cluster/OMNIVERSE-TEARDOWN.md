# NVIDIA Omniverse — functional teardown (verified at source, 2026-10-28)

**What it is.** NVIDIA's industry-grade 3D production platform: a set of
SDKs, APIs, services and reference apps for building 3D worlds and
simulations, built around Pixar's OpenUSD as the scene-description
standard. The production shape in 2026: the **Kit SDK** (build custom
3D applications), the **Kit Kernel**, **Nucleus** (the live-collaboration
engine — a server + client libraries that let several artists work one
USD scene at once), **Omniverse App Streaming** (run Kit apps on a
server, stream the pixels), and the **RTX Renderer**, whose **RTX
Real-Time 2.0** mode (the default) does real-time path tracing —
physically-based lighting, global illumination, reflections — on RTX
GPUs. NVIDIA's own docs position the current integrations on
**Pixar USD 25.02**. Shipping shape: **Production Branches** (PB 25h2,
Dec 2025; PB 26h1, May 2026, per NGC).

**What it does for a production** (the functions, stripped of the brand):
1. **USD scene assembly** — scenes, sets, props, cameras and *lights*
   are layered USD data; teams compose and override non-destructively.
2. **RTX lighting/rendering** — lights are real USD prims (UsdLux);
   the renderer evaluates them with path tracing; interactive feedback
   while lighting a scene.
3. **Live collaboration** — Nucleus: multi-user, one scene, changes
   propagate live; versioning of scene data.
4. **Kit apps / extensions** — a Python/C++ app framework for building
   pipeline tools on the same stage.
5. **Simulation** — physics, sensors, robotics (Isaac) — out of scope
   for this show.

**Licence — FREE PROPRIETARY** (bucket: free proprietary; verified on
NVIDIA's official licensing documentation, docs.omniverse.nvidia.com,
crawled 2026-10-28): *"As of May 2026, Omniverse is freely available
for both development and production use with no NVIDIA AI Enterprise
subscription required."* Use is governed by the **NVIDIA Software
License Agreement** and the **Product-Specific Terms for NVIDIA AI
Products**. Software you build on it can be distributed to third
parties for use with Omniverse under the same terms. The paid thing
that still exists is optional: an **NVIDIA AI Enterprise** subscription
buys enterprise support — the platform itself is not paywalled. It is
not open source, and its components (Kit, Nucleus, RTX Renderer) are
closed. Kit itself needs an NVIDIA RTX GPU to run its renderer.

**Fit for this show — honest read.** We make a 2D/cel show on a
composite pipeline (Tahoma2D → Natron → ffmpeg). Omniverse's renderer
and 3D stage are not our stage, and this VM has no RTX GPU (the free
Kaggle seats are T4s — Omniverse's renderer is not the tool there
either). What IS ours from this cluster member is the *discipline*
Omniverse industrialised: **lighting as layered, overridable scene
data, in USD** — which is exactly how our house system already thinks
(LIGHTING-SYSTEM.md: keys as sheets of data, shifts as overlays, §9
wiring map). We take the function, not the platform.

## Rebuild-the-function map (Omniverse function → our open equivalent)

| Omniverse function | Our coverage | Status |
|---|---|---|
| USD scene assembly + lighting data | **OpenUSD directly** (usd-core) — `usd/gate_keys.usda` holds the Garden Gate keys as UsdLux lights + sheet data | WIRED here, validated 64/64 |
| Non-destructive overrides (layers) | USD opinion layers — `usd/gate_keys_overrides.usda` demonstrates an LS-7 shift as a layer | WIRED here |
| Material/shading definitions | **MaterialX** — `materialx/lustre_sheen.mtlx` (LV-1..LV-6) | WIRED here, validated 13/13 |
| Colour management | **OpenColorIO** — `ocio/config.ocio`; Natron (our comp seat) drives it natively | WIRED here, validated 16/16 |
| RTX real-time lighting on a 3D stage | Not applicable to the 2D pipeline; for any future 3D plate work, Blender 4.5.9 (already the pipeline spine) + Cycles/Eevee carry it | COVERED BY EXISTING SPINE |
| Nucleus live collaboration | git branches + PR review in this repo (slower, but versioned and auditable — our standing discipline) | COVERED BY PROCESS |
| Kit apps | Our own Python tooling (composite_shot.py, build_manifest.py, this package's validators) | COVERED BY EXISTING TOOLING |
| App streaming | Not needed (single-machine pipeline + rented/free GPU seats for heavy runs) | NOT NEEDED |

**What is NOT claimed:** Omniverse was not installed, downloaded, or
run for this teardown (it would be a multi-GB closed binary needing an
RTX seat — against the staging law and pointless on this VM). Nothing
here carries NVIDIA assets, branding, or content — only the functional
map and the open-standard data formats Omniverse itself is built on.

Sources: docs.omniverse.nvidia.com (Licensing; Kit SDK; App Streaming;
Production Branches/NGC); developer.nvidia.com/omniverse (USD 25.02
integration note); rtx-relighting class algorithms in
RTX-TECHNIQUES-NOTE.md.
