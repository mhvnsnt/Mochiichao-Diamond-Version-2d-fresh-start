# Movement spec - kittember

**Body plan:** flame-tailed cat (canon individual is bipedal; species default quadruped)

The character-bible page for MOTION (research report section 8). A shot that contradicts this page is returned like a model-sheet violation. Machine-readable twin: `kittember.json` (the renderer consumes its `engine` block - identity is data).

## Material & mass

**material**: mammalian cat body + a LIVE FLAME at the tail tip (canon: the flame is the tail tip, never a floating orb, never fused into body art)

**mass_class**: light, agile

**volume_rule**: body near-rigid (mammals do not volume-squash); squash lives in legs/spine only; flame volume is free (it is fire)

**rest_shape**: canon cutout stance; flame component = cutout x198-271, y81-195, core colour #FD8504

## Idle (the default state)

**idle**:
  - **cycle**: breath + flame flicker
  - **description**: chest/flank breathing +/-2% on a 24f loop; tail-base sway; flame flicker cycle ~8f (height +/-25%, tip licks side to side, never symmetrical two frames running); intermittent ear twitch / tail secondary every few loops
  - **loop_frames**: 24
  - **fps**: 24
  - **breath_amp_pct**: 2
  - **flame_height_var_pct**: 25
  - **secondary_break**: ear twitch or tail-tip secondary every 3-5 loops

**breathing_equivalent**: chest/flank breathing (real mammalian breath)

## Locomotion

**locomotion**:
  - **verb**: spine gather-extend walk/trot; run = extended stretch poses
  - **cycle**: spine flexes gather/extend per stride; landing squash in legs/spine only; flame lags and streaks backward, then recovers (follow-through)
  - **ground_contact**: feet; body pitch follows stride phase

## Anticipation & settle

**anticipation**: pounce crouch-wiggle: hindquarters wiggle 6-8f before a leap; crouch before any jump

**settle**: leg/spine absorb 4-6f; flame overshoots forward then settles back over 6-8f

## Secondary chains

**secondary_chains**:
  -     - **part**: tail flame
    - **behaviour**: own continuous track (see material track) - flicker, lag, state-driven size/rate/colour
    - **lag_frames**: 2-4 behind body
  -     - **part**: tail (non-flame base)
    - **behaviour**: follow-through chain lagging body 2-4f
  -     - **part**: ears
    - **behaviour**: intermittent twitch as secondary action

## Signature motions

**signature_motions**:
  -     - **name**: startle-arch
    - **trigger**: surprise
    - **note**: back arches, flame flares, 3f in
  -     - **name**: pounce wiggle
    - **trigger**: pre-leap
    - **note**: hindquarter wiggle anticipation
  -     - **name**: content curl-up
    - **trigger**: sleep
    - **note**: curls, flame dimmed to ember pulse
  -     - **name**: flame-lick groom
    - **trigger**: idle break
    - **note**: licks the flame-side paw

## Emotion map (body, not face)

**emotion_map**:
  - **happy**: flame wavers, tail high, ears up
  - **sad**: body droops (shoulders/head low), flame low and slow
  - **angry**: flame tall/blazing, body arched-ready
  - **scared**: flame sputters small, body low, ears flat

## State map

**state_map**:
  - **exhausted**: flame weak/small, flicker slow (Charmander-canon meter)
  - **wet**: flame sputtering + steam wisps
  - **danger (flame near out)**: story-critical state, never decorative-off
  - **sleep**: ember pulse only

## Forbidden motions

**forbidden_motions**:
  - static flame in any frame
  - flame symmetrical or identical two frames running
  - rigid spine in locomotion
  - flame drawn as a separate floating orb detached from the tail tip

## Substitution set

**substitution_set**:
  - arch
  - crouch
  - stretch-run
  - curl-sleep
  - flinch

**flame_substitution_set**:
  - ember
  - normal
  - tall
  - sputter
  - smear-streak

**smear_drawing**: leg smear on fastest run beat, 1-2f

## Sound-linked motions

**sound_linked_motions**:
  - cry = chest pulse + flame flare beat

## Engine block (machine-readable)

See `engine` in the JSON twin: mode, spring tuning, idle parameters, deformation limits. Springs OFF / warp forbidden where the material says so (Dorowani's shell).
