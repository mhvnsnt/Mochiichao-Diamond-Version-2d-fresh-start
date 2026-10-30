# Movement spec - wispkin

**Body plan:** smoke / ghost (skull mask over a round smoke body, smoke trailing below)

The character-bible page for MOTION (research report section 8). A shot that contradicts this page is returned like a model-sheet violation. Machine-readable twin: `wispkin.json` (the renderer consumes its `engine` block - identity is data).

## Material & mass

**material**: gas; no fixed volume, no ground contact; edges unstable by definition

**mass_class**: weightless

**volume_rule**: volume is NOT preserved - expansion/compression is the material (density and opacity carry it)

**rest_shape**: canon cutout: mask + body in upper two-thirds, smoke trail in lower third (alpha mean falls 197 -> 42 down the cutout)

## Idle (the default state)

**idle**:
  - **cycle**: drift + wisp
  - **description**: perpetual drift (slow sine float 6-12px equivalent, rotation +/-2 deg), bottom wisps detach and fade on a 12-16f cycle, outline boil (ragged variants alternating), opacity breathing 100% -> 80% -> 100% over ~32f
  - **loop_frames**: 32
  - **fps**: 24
  - **drift_amp**: 0.04
  - **opacity_min**: 0.8
  - **secondary_break**: a detached puff rises and dissipates every few loops

**breathing_equivalent**: opacity/density breathing

## Locomotion

**locomotion**:
  - **verb**: flow
  - **cycle**: stretch thin toward travel -> flow with trailing wisps -> re-coalesce with overshoot swell; passing obstacles = split around and rejoin
  - **ground_contact**: none - never locks to ground

## Anticipation & settle

**anticipation**: compress and darken (density up, size down) before a burst/scare

**settle**: expansion puffs x2 decaying, wisps re-form over 8-12f

## Secondary chains

**secondary_chains**:
  -     - **part**: wisps (3-5 trailing)
    - **behaviour**: increasing lag and fade down the chain
  -     - **part**: mask
    - **behaviour**: lags the smoke slightly - the one semi-solid part, its crack is a protected balance flaw

## Signature motions

**signature_motions**:
  -     - **name**: scare-swell
    - **trigger**: fright (given or received)
    - **note**: sudden x1.6 expansion + boil speed-up, 4f
  -     - **name**: thin-slip
    - **trigger**: passing/peeking
    - **note**: goes ribbon-thin
  -     - **name**: dissipate / re-form
    - **trigger**: exit/entrance
    - **note**: never walks off rigid
  -     - **name**: sad-rain-down
    - **trigger**: grief
    - **note**: drifts down, edges raining off, opacity falling

## Emotion map (body, not face)

**emotion_map**:
  - **happy**: high, light, buoyant bob
  - **sad**: low, dense, dark, raining edges
  - **angry**: boil fast, swell baseline +10%
  - **scared**: thin, high, trembling wisps

## State map

**state_map**:
  - **sleep**: settles low, opacity 70%, wisps nearly still
  - **weakened**: dissipation leaks - cannot hold full form

## Forbidden motions

**forbidden_motions**:
  - hard unchanging outline > 8f
  - ground-locked walking
  - appearing/disappearing by white flash
  - a cast shadow with solid edges (shadow, if any, soft and lagging)

## Substitution set

**substitution_set**:
  - normal
  - swell
  - ribbon-thin
  - compressed
  - dissipating-1
  - dissipating-2
  - dissipating-3
  - re-forming

**smear_drawing**: stretched wisp smear on fast flows, 1-2f

## Sound-linked motions

**sound_linked_motions**:
  - cry = density pulse (body darkens/swells on the sound)

## Engine block (machine-readable)

See `engine` in the JSON twin: mode, spring tuning, idle parameters, deformation limits. Springs OFF / warp forbidden where the material says so (Dorowani's shell).
