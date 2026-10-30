# Movement spec - dorowani

**Body plan:** shelled biped (blue biped, red fin cheeks, tan shell carried on the back)

The character-bible page for MOTION (research report section 8). A shot that contradicts this page is returned like a model-sheet violation. Machine-readable twin: `dorowani.json` (the renderer consumes its `engine` block - identity is data).

## Material & mass

**material**: RIGID shell (the honest exception - the shell never deforms) + fleshy limbs/head; heavy for his size

**mass_class**: heavy (for his size) - his timing is the slowest in the cast

**volume_rule**: shell volume/shape invariant in every frame; body squash only in legs on foot-plant

**rest_shape**: canon cutout stance; shell rides as a separate lagging mass

## Idle (the default state)

**idle**:
  - **cycle**: weight-shift rock
  - **description**: breathing in the exposed flesh (+/-1-2%), weight shifts foot-to-foot every few seconds (whole-body rock +/-1.5 deg, shell included as rigid mass), shell settles 2-3f AFTER the body stops (carried-weight follow-through); head look-arounds as intermittent secondary. His avatar/show form's eye-whites are his personal deviation (owner ruling) - kept.
  - **loop_frames**: 48
  - **fps**: 24
  - **rock_deg**: 1.5
  - **breath_amp_pct**: 1.5
  - **secondary_break**: head look-around or shell knock-shiver every few loops

**breathing_equivalent**: flesh breathing + weight shifts

## Locomotion

**locomotion**:
  - **verb**: lumber
  - **cycle**: slow anticipation (lean + shell pitch) -> deliberate steps with body pitch/roll -> foot-plant squash in the LEGS -> head bob counter-phase; his fastest move is still slower than every other cast member's normal (timing contrast is his identity)
  - **ground_contact**: heavy foot plants; weight-dependent settle (BW send-out tremor rule)

## Anticipation & settle

**anticipation**: retract slightly + lean before effort; crouch is in the legs only

**settle**: whole-body rotational wobble on the feet (2 cycles, shell true) + shell lag 2-3f

## Secondary chains

**secondary_chains**:
  -     - **part**: shell
    - **behaviour**: rigid; lags body rotation/translation by 2-3f as a carried mass
    - **lag_frames**: 2-3
  -     - **part**: fin cheeks
    - **behaviour**: small lag on head turns
  -     - **part**: head
    - **behaviour**: bob counter-phase to steps

## Signature motions

**signature_motions**:
  -     - **name**: Water Orb
    - **trigger**: his signature move (his alone)
    - **note**: both-hands orb gather: anticipation lean-back, orb forms, settle rock after release
  -     - **name**: shell-knock reaction
    - **trigger**: impact on shell
    - **note**: rock + rotational wobble, offended posture, shell true
  -     - **name**: proud puff
    - **trigger**: praise/victory
    - **note**: chest/head high - posture, not deformation
  -     - **name**: droop drag
    - **trigger**: sad/tired
    - **note**: low head, slow drag steps (Thomas & Johnston's drag-feet, literally)

## Emotion map (body, not face)

**emotion_map**:
  - **happy**: rock tempo up, head high
  - **sad**: low head, drag steps, rock nearly gone
  - **angry**: forward lean, faster heavier plants
  - **scared**: retract toward shell, tremble in limbs only

## State map

**state_map**:
  - **tired**: rock period lengthens, droop baseline
  - **hurt**: idle slows (BW weakened rule), favouring one foot
  - **sleep**: sits, shell as backrest, breath only

## Forbidden motions

**forbidden_motions**:
  - shell squash/stretch in ANY frame (breaks material honesty and the cast's contrast)
  - bouncy/light timing (he is heavy)
  - sliding without steps

## Substitution set

**substitution_set**:
  - retracted
  - pop-out
  - tip-over
  - rock-L
  - rock-R
  - proud
  - droop

**smear_drawing**: none on the shell; limb smear allowed on fastest (for him) swings

## Sound-linked motions

**sound_linked_motions**:
  - cry = chest swell + shell shiver beat

## Engine block (machine-readable)

See `engine` in the JSON twin: mode, spring tuning, idle parameters, deformation limits. Springs OFF / warp forbidden where the material says so (Dorowani's shell).
