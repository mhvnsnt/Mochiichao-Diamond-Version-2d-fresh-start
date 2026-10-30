# Movement spec - mochii

**Body plan:** liquid drop (one piece - head IS the body)

The character-bible page for MOTION (research report section 8). A shot that contradicts this page is returned like a model-sheet violation. Machine-readable twin: `mochii.json` (the renderer consumes its `engine` block - identity is data).

## Material & mass

**material**: water in a surface-tension skin; body colour #53BEF5 family (settei day model)

**mass_class**: light-medium

**volume_rule**: STRICTLY preserved - wider if and only if shorter (wx * hy = 1)

**rest_shape**: upright droplet, canon cutout proportions (w/h ~ 1.11 in cutout space)

## Idle (the default state)

**idle**:
  - **cycle**: wobble
  - **description**: continuous wobble-breathing: width +6% / height -5% anti-phase, painted highlight rides the form; every 3rd-4th loop a secondary action (small hop or side bulge) breaks the loop (BW anti-monotony rule)
  - **loop_frames**: 32
  - **fps**: 24
  - **width_amp_pct**: 6
  - **height_amp_pct**: 5
  - **secondary_break**: side bulge or mini-hop every 3-4 loops

**breathing_equivalent**: the wobble IS the breathing (surface pulse)

## Locomotion

**locomotion**:
  - **verb**: hop / slide by deformation
  - **cycle**: squash 3f -> stretch toward travel 2-3f -> land squash 3f -> wobble-settle 10-14f diminishing
  - **ground_contact**: bottom point; squash anchors to ground, stretch anchors to centre while airborne

## Anticipation & settle

**anticipation**: squash-down (height -12%) held >= 2f before any hop/launch

**settle**: damped oscillation, overshoot +4% past rest, >= 2 visible cycles, 10-16f

## Secondary chains

**secondary_chains**:
  -     - **part**: surface highlight
    - **behaviour**: rides the warp with the form (painted in)
  -     - **part**: drip
    - **behaviour**: bulge -> neck -> detach -> fall with stretch; body recoils up slightly; after big squashes and when sad/nervous
  -     - **part**: ripple
    - **behaviour**: ring/bulge travels across the form ~6-10f after impacts

## Signature motions

**signature_motions**:
  -     - **name**: victory double-bounce
    - **trigger**: win/celebration
    - **note**: two hops, drip flicked off on the second
  -     - **name**: puddle-flop
    - **trigger**: exhaustion/defeat
    - **note**: goes almost flat 12f, then re-inflates
  -     - **name**: stretch-peek
    - **trigger**: looking over / curiosity
    - **note**: tall thin stretch
  -     - **name**: shiver-tremble
    - **trigger**: cold/scared
    - **note**: 1-frame +/-1-2% jitter

## Emotion map (body, not face)

**emotion_map**:
  - **happy**: bouncier, higher wobble frequency, mini-hops
  - **sad**: sag -15% height, slow/no recovery, drip rate up
  - **angry**: rapid small-amplitude vibration, surface boil
  - **scared**: tremble + shrink ~8%

## State map

**state_map**:
  - **tired**: idle amplitude down, sag baseline -6%
  - **hurt**: idle speed down (BW rule: weakened = slower animation)
  - **sleep**: puddle-lean, wobble nearly still, slow drip

## Forbidden motions

**forbidden_motions**:
  - rigid translation at constant shape (statue on a conveyor)
  - shape-identical frames > 12f while awake on screen
  - walking with legs (he has none)
  - any deformation that changes volume

## Substitution set

**substitution_set**:
  - rest
  - squash-wide
  - stretch-tall
  - flat-puddle
  - drip-bulge
  - droop-sad
  - smear-elongated

**smear_drawing**: elongated drop, 1-2f only, on fastest travel beats

## Sound-linked motions

**sound_linked_motions**:
  - cry = whole-body pulse (the cry comes from the body, not the mouth alone)

## Engine block (machine-readable)

See `engine` in the JSON twin: mode, spring tuning, idle parameters, deformation limits. Springs OFF / warp forbidden where the material says so (Dorowani's shell).
