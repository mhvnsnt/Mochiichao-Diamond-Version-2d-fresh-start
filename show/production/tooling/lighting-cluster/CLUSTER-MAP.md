# CLUSTER MAP — the NVIDIA-adjacent production-software cluster (2026-10-28)

The owner asked for "that full industry-grade software… something
related to NVIDIA… to do with lighting and the other side stuff in my
shows." The prime suspect is **NVIDIA Omniverse** — NVIDIA's
industry-grade production platform whose headline features are
exactly RTX lighting/rendering and the USD scene/lighting data model.
Because a memory of one product can point at its siblings, this
package covers the whole cluster: Omniverse, the open standards it is
built from (OpenUSD, MaterialX, OpenColorIO), the open lookdev
application built on the same stack (Gaffer), and the RTX lighting
techniques as published algorithms. Whichever sibling he meant, it is
in this map — pulled in, torn down, and wired where it honestly fits.

Licence buckets are exact, each verified at the source on 2026-10-28
(official site / licence file / official docs). "Wiring status" names
the real thing that exists, not an intention.

| # | Item | What it is | Licence (verified) | Bucket | Teardown | Wiring status |
|---|---|---|---|---|---|---|
| 1 | **NVIDIA Omniverse** (prime suspect) | Industry 3D production platform: USD scene assembly, RTX Real-Time 2.0 path-traced lighting, Nucleus live collaboration, Kit app SDK | NVIDIA Software License Agreement + Product-Specific Terms for NVIDIA AI Products; per NVIDIA's official licensing docs (May 2026): free for development AND production, no AI Enterprise subscription required; paid tier = optional enterprise support only | **Free proprietary** | OMNIVERSE-TEARDOWN.md (incl. rebuild-the-function map) | NOT INSTALLED (needs an RTX seat; not our 2D stage). Its functions are covered by rows 2–4 + the existing Blender spine — see the map in its teardown |
| 2 | **OpenUSD** (Pixar / ASWF-AOUSD) | Open scene-description standard: layered composition; lighting/shading as data (UsdLux) | Apache 2.0 with Section 6 (Trademarks) deleted/replaced | **Open source — Modified Apache 2.0** | OPENUSD-TEARDOWN.md | **WIRED**: `usd/gate_keys.usda` (Garden Gate keys from LIGHTING-SYSTEM.md §3) + `usd/gate_keys_overrides.usda` (LS-7 opinion layer) + `usd/validate_gate_keys.py` — **64/64 checks passed** (usd-core 26.11) |
| 3 | **MaterialX** (ASWF) | Open material/shading standard; `standard_surface` sheen = the data form of the lustre law | Apache License 2.0 (LICENSE in the MaterialX repo) | **Open source — Apache-2.0** | MATERIALX-TEARDOWN.md (LV-1..LV-6 rule map) | **WIRED**: `materialx/lustre_sheen.mtlx` (Dorowani-anchored lustre look; day/night/Dark-Forest LV-3 states) + `materialx/check_lustre.py` — **13/13 checks passed** (MaterialX 1.39.5) |
| 4 | **OpenColorIO** (ASWF / Academy) | Industry colour-management standard; one config for working/display colour everywhere | BSD-3-Clause (LICENSE in the OpenColorIO repo) | **Open source — BSD-3-Clause** | OPENCOLORIO-TEARDOWN.md | **WIRED**: `ocio/config.ocio` (ACEScg working space; protected identity as a DATA colorspace per LS-1/LS-2; environment colour as named Looks only) + `ocio/check_config.py` + `ocio/README.md` — **16/16 checks passed** (OCIO 2.6.0). Fills the "linear/ACES via OpenColorIO in Natron" slot UNIFIED-PIPELINE already names; Natron's native OCIO support verified in OCIO's own docs |
| 5 | **Gaffer** (Image Engine) | Open lookdev/lighting/scene-assembly application built on USD + OCIO + MaterialX | BSD-3-Clause (LICENSE in GafferHQ/gaffer) | **Open source — BSD-3-Clause** | GAFFER-TEARDOWN.md | **REFERENCE / OPTIONAL ENTRY — not installed** (3D lookdev app; our comp seat is Natron; GB-scale download against staging law). Adopted as reference architecture for growing the key library; catalogued in the tooling index |
| 6 | **RTX lighting techniques** (RTXGI/DDGI, ray-traced shadows, NRC/SHaRC, RTXDI) | Published global-illumination/shadow algorithms behind the RTX name | NVIDIA RTX SDKs License (RTXGI repo, NVIDIA-RTX/RTXGI) | **Free proprietary** (SDK terms; technique-level use here is reading + mapping) | RTX-TECHNIQUES-NOTE.md | **MAPPED, not implemented**: each technique has a written 2D-composite analogue on existing house rules (LS-2/LS-5/LS-6 + reference looks); no fake implementation claimed |

## How the cluster wires into the house system

- **Source of truth stays the bible:** `show/bible/LIGHTING-SYSTEM.md`
  (LS-1..LS-8, LV-1..LV-6, key sets) and `show/bible/COLOR-SYSTEM.md`.
  This package gives those rules standard data formats and configs;
  it changes no rule.
- **Composite stage** (`show/production/FLOW-COMPOSITE-PIPELINE.md`,
  `show/production/UNIFIED-PIPELINE.md`): lighting stays a
  composite-stage overlay discipline — contact shadows at composite,
  per-shot lighting record (key source, rim, grade family, shift).
  `ocio/config.ocio` is the colour config that stage's Natron graphs
  point at; the USD keys and MaterialX look are the data the per-shot
  record draws from.
- **Tooling indexes:** this cluster is cross-referenced from
  `show/production/tooling/TOOLING-INDEX.md` and
  `show/production/tooling/TOOLS-MANIFEST.md` (added with this PR).

## Proof status

Proven here (this VM, real libraries, output in TEST-RECORD.md):
USD validation 64/64, OCIO checks 16/16, MaterialX checks 13/13 —
all exit 0. First-run proofs still owed: the first Natron comp driven
on `ocio/config.ocio`, and any renderer consuming the USD/MaterialX
data for a plate. Omniverse itself was not run (no RTX seat on this
VM; Kaggle's free seats are T4s).
