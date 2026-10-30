# EP01 PROP — THE MOTH (V3-091) — BUILD-READY SPEC

Status: **SPEC-FILLED** (Work Package E, 2026-10-28). No image is shipped for
the moth. Why: at its staged size the moth reads at roughly 30–45 px
wingspan inside a 1280×720 frame, perched on the leaf on Gabu's head. A
flat-drawn asset built blind at that size cannot be verified for
readability against the actual composite, and a generative pass would
invent detail the script never specifies. A precise spec beats a bad
picture: build it at 4× (below), verify at 1× against the V3-091 frame,
then ship.

## Staging quotes it derives from

Staging JSON, V3-091 (`show/episodes/EP01/EP01-V3-staging.json`):

> staging_notes: "Pyramid post: Gabu on night guard asleep standing, net
> over his shoulder, leaf still on his head from V3-031."
> flags: ["moth at the leaf not built as an asset - leaf + guard carry the
> shot"]
> background: `green-night`; layers already staged: Gabu idle-breathe,
> `091-net-…webm`, `091-leaf-…webm` (the leaf layer EXISTS — the moth is
> the only missing piece of this shot).

Shooting script, V3-091 (`EP01-SHOOTING-SCRIPT-v3.md`):

> VISUAL: "The pyramid post. Gabu on night guard: asleep standing, net
> over his shoulder, leaf still on his head."
> ACTION: "A moth inspects the leaf. Thoroughly. The guard does not wake.
> The Garden is perfectly safe, and it is not because of him, and that is
> the kindest shot in the episode."
> SFX: "Moth wings at the leaf; snore, unbothered by duty."

Generation Package §7, cluster N9: "Gabu on night guard, asleep standing,
leaf still on his head, while a moth inspects the leaf (V3-091 — the moth
is not a built asset, see §11)". §11 gap 7 lists "the moth (V3-091)" among
the unbuilt props.

NOT Mothrix: the repo's Mothrix is a creature species (game cast). This
prop is an ordinary small garden moth — no species design, no cry, no
character status. Do not build it from Mothrix art.

## Scale (relative to the staged frame)

- Frame: 1280×720 plate (`green-night`). Gabu stands full-size per the
  staging `character_size_law` (canon-pixel rigs at 0.4–0.95 scale of
  512 px sources); his canon cutout is 292×295 px, so in-frame he reads
  roughly 230–490 px tall depending on the shot's scale factor. The leaf
  layer (`091-leaf`) sits on his head.
- Moth at 1× (in-frame): **wingspan 30–45 px, body length 12–16 px** —
  large enough that wing movement registers against the leaf, small
  enough that it never competes with Gabu. If the moth reads as a
  character at 1×, it is too big.
- Build size: **256×256 px canvas at 4×** (moth centred, wingspan
  ~150 px on canvas), transparent background, downscale to a 64×64 px
  in-frame asset. Build BOTH wing poses on the same canvas grid:
  wings-up-at-rest and wings-open-flat, so the inspection beat can
  alternate them.

## Placement and orientation

- Perched ON the leaf on Gabu's head (the leaf is the moth's ground —
  same layer stack position as `091-leaf-…webm`, drawn above it).
- Body axis aligned to the leaf's long axis; head toward the leaf tip —
  it is *inspecting* the leaf, walking it slowly, not resting randomly.
- Beat: two wing poses alternating slowly (thorough, unhurried), plus a
  short walk of a few pixels along the leaf. No flight in this shot —
  the script gives it wings in the SFX only ("Moth wings at the leaf"),
  i.e. wing-flicks while perched, never a takeoff.
- Gabu must not react: no layer change on the guard (script: "The guard
  does not wake").

## Palette

The shot is Green at night; COLOR-SYSTEM §(d) Green row, night column:
"firefly accents only; greens go blue-black". The moth is a night moth —
muted, never a colour pop, and never near the quarantined red `#a03436`.

| Part | Hex | Source |
|---|---|---|
| Wing base | `#b0d0f0` | COLOR-SYSTEM brand-family pale blue (named in the system) |
| Wing shade / body | `#70b0d0` | COLOR-SYSTEM brand-family mid blue (named in the system) |
| Body dark / outline | `#3070b0` | COLOR-SYSTEM — Dorowani deep, the system's darkest brand blue |
| Wing spot (one per forewing, maximum) | `#d0f0f0` | COLOR-SYSTEM belly-pale; at the Pond it "becomes moonlight colour" — the moth catches moonlight, nothing warmer |
| Leaf it stands on (context only) | `#68aa54` day → blue-black grade at night | SAMPLED from `EP01-PLATE-green-day-v0-spec-still.png` (spec plate, labelled sampled; night grade is a lighting layer over it, never a repaint) |

No warm colours on the moth: the Green night frame admits firefly accents
only, and a warm moth would read as one. No glow effect on the moth
itself.

## Construction notes

- Flat cartoon style matching the show's prop family (see the rack and
  bucket in this folder): solid fills, one dark outline weight, no
  gradients, **no baked ground/contact shadow** (shadow, if any, is a
  compositing step onto the leaf, per the no-baked-shadows rule).
- Silhouette first: at 1× the moth is mostly silhouette + wing-flick.
  Antennae: two short curves, visible at 4×, allowed to vanish at 1×.
- Two poses only (wings-up, wings-open). No expression, no face detail —
  it is a prop-grade animal extra, not a cast member.
- Acceptance check before registering as BUILT: composite both poses at
  1× onto the actual V3-091 frame (green-night plate + Gabu + leaf
  layers); the moth must be findable in under a second, must not read
  as a character, and the wing-flick must read at the SFX moment.
