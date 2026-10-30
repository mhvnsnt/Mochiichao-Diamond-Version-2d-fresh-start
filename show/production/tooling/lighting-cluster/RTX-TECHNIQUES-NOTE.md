# RTX lighting techniques — technique-level teardown + 2D analogue map

Scope rule for this note: techniques, not code. Nothing here claims an
implementation of NVIDIA's SDKs. What follows is what the published
algorithms *do*, and the honest 2D-composite analogue the house system
already runs (or could adopt), mapped onto
`show/bible/LIGHTING-SYSTEM.md` rules.

**The SDK terms, for the record:** NVIDIA's RTXGI now lives at
`NVIDIA-RTX/RTXGI` under the **NVIDIA RTX SDKs License** — bucket:
**free proprietary** (free to use; redistribution only as object code
incorporated into an application; not open source).

## 1. DDGI / RTXGI — probe-based global illumination

**The technique.** RTXGI's core (v1.x DDGI; v2.0 adds the Neural
Radiance Cache and SHaRC) scatters *irradiance probes* through a 3D
volume. Each probe ray-traces the scene from its position and stores
incoming light (irradiance + visibility/depth) in small textures.
Any surface then shades its indirect light by sampling the nearby
probes — bounced light becomes a lookup instead of a per-pixel trace,
which is what makes dynamic, moving-light GI affordable in real time.

**The 2D analogue the house system already runs.** Our "scene" is a
plate plus flat layers; there is no volume to probe. But the *idea* —
**indirect light is sampled from the location, not invented per
character** — is exactly LS-2's discipline: environment colour lives
on rims + atmosphere, keyed to where the character *stands*. The
practical analogue for the composite stage, stated as a technique
(not shipped code): when a shot is keyed, sample the plate's ambient
colour at the character's foot position and use it as the source for
that character's rim/atmosphere tint in the lighting sheet — i.e.
treat the sheet's rim/temperature fields as the probe record for that
location and time of day. Our Gate keys already encode four such
"probe records" for the Garden by hand (GATE-MORNING/DAY/DUSK/NIGHT).
If the key library grows, plate-sampling is the honest automation of
the same rule — and the USD package (`usd/gate_keys.usda`) is where
those records live either way.

## 2. Ray-traced shadows & contact grounding

**The technique.** RTX-class renderers trace shadow rays from each
shaded point toward each light: geometrically true shadows, correct
softness from light size (area/sphere lights), no shadow-map bias
tuning.

**The 2D analogue — already house law.** Our shadows are *drawn at
the composite stage, never baked into character art* (standing
no-baked-shadows rule; FLOW-COMPOSITE-PIPELINE: contact shadow added
at composite). The RTX discipline that transfers is **motivation**:
a shadow exists because a light exists (LS-5's one motivated key per
shot), its direction/length follow the key (LS-6's temperature →
angle chart: low sun = long shadows at dusk), and its softness
follows the key's hardness (hard noon key = tight contact shadow;
lamp practical = soft falloff). GATE-NIGHT's key being a *sphere*
light in the USD data — a point-ish practical with radius — is the
data form of exactly that: shadow behaviour is a property of the
motivated source, not an artist's per-frame guess.

## 3. Neural Radiance Cache / SHaRC — learned irradiance

**The technique.** RTXGI v2.0's NRC trains a small neural network
online, during rendering, to approximate radiance at points in the
scene (SHaRC accumulates the training data spatially) — GI quality
beyond probe resolution, learned per scene, no offline bake.

**The 2D analogue — noted and honestly rejected as a mechanism.**
There is no radiance field in a 2D comp to learn. The house system's
functional equivalent of "a cached answer for what light looks like
here" is **L6 of LIGHTING-SYSTEM.md §2**: animated systems ship
*static reference looks* — the pre-approved answer a shot grades
toward. Ours is art-directed and fixed; theirs is learned and
dynamic. Same slot in the pipeline ("don't recompute the look from
first principles per frame"), different machinery — recorded so the
mapping is deliberate, not confused.

## 4. RTXDI — many-light sampling

**The technique.** RTX Direct Illumination uses reservoir spatio-
temporal importance sampling (ReSTIR) to pick, per pixel, the few
lights that matter out of thousands — making scenes with huge light
counts tractable.

**The 2D analogue — LS-5 itself.** The house rule *one motivated key
light per shot* is the art-directed end of the same insight: a frame
reads by its dominant source; everything else is fill/rim in service
of it. Our USD validator enforces exactly-one-motivated-key per key
set. Where RTXDI automates the choice per pixel, we make it per shot,
by law, in the sheet. No code analogue needed or claimed.

## Summary

| RTX technique | House analogue | Where it lives |
|---|---|---|
| DDGI probe irradiance | Location-sampled rim/atmosphere tint; hand-authored key records per location/time | LS-2; `usd/gate_keys.usda` |
| Ray-traced shadows | Motivated composite-stage contact shadows; direction/softness from the key | LS-5/LS-6; FLOW-COMPOSITE-PIPELINE |
| NRC / SHaRC learned cache | Static reference looks (pre-approved grades) | LIGHTING-SYSTEM.md §2 (L6) |
| RTXDI many-light selection | One motivated key per shot, by law | LS-5; enforced in the USD validator |
