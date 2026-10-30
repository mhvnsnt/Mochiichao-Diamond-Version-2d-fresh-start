# Movement spec - sproutle

**Body plan:** plant (stem body, leaf mass at top)

The character-bible page for MOTION (research report section 8). A shot that contradicts this page is returned like a model-sheet violation. Machine-readable twin: `sproutle.json` (the renderer consumes its `engine` block - identity is data).

## Material & mass

**material**: flexible stem, heavy head/leaf mass - an inverted pendulum; root/base fixed

**mass_class**: light body, top-heavy

**volume_rule**: no volume squash; bending only - motion originates at the base/stem, tip amplitude largest

**rest_shape**: canon cutout (sproutle.png - the no-baked-shadow version of record)

## Idle (the default state)

**idle**:
  - **cycle**: sway
  - **description**: ultra-slow sway 32-48f loop, base fixed, tip amplitude 4-8px equivalent, leaves lagging the stem in sequence (~2f per leaf outward); subtle growth-pulse height +1-2% as breathing equivalent
  - **loop_frames**: 48
  - **fps**: 24
  - **tip_amp**: 0.05
  - **growth_pulse_pct**: 1.5
  - **secondary_break**: one leaf shiver or a falling-leaf FX every few loops

**breathing_equivalent**: growth-pulse (height +1-2% on the sway period)

## Locomotion

**locomotion**:
  - **verb**: lean / root-shuffle
  - **cycle**: reach toward target over 12-24f with overshoot and sway-settle; if mobile, pot/root hop with full counter-swing
  - **ground_contact**: base never slides rigidly

## Anticipation & settle

**anticipation**: lean AWAY + leaf fold before a reach/flinch response

**settle**: sway oscillation decaying over 16-24f (slowest settler in the cast - timing contrast vs the drop)

## Secondary chains

**secondary_chains**:
  -     - **part**: leaves/petals
    - **behaviour**: curve-lag chain, each leaf lags the stem 2-6f in sequence
  -     - **part**: bloom (when present)
    - **behaviour**: open/close as anticipation + overshoot

## Signature motions

**signature_motions**:
  -     - **name**: phototropism lean
    - **trigger**: someone speaks / light source
    - **note**: leans toward the speaker - his moving hold while listening
  -     - **name**: wilt
    - **trigger**: sad/tired/thirsty
    - **note**: whole-form droop over 24f, recovery slower still
  -     - **name**: bloom-flare
    - **trigger**: joy/surprise
    - **note**: bloom opens wide with leaf shiver
  -     - **name**: leaf-fold flinch
    - **trigger**: startle
    - **note**: leaves fold in fast, unfold slow

## Emotion map (body, not face)

**emotion_map**:
  - **happy**: sway amplitude up, bloom open, leaves lifted
  - **sad**: wilt baseline, sway nearly gone
  - **angry**: stiff upright, leaves bristled, sway stops (contrast stillness)
  - **scared**: leaf-fold, tremble in the tips only

## State map

**state_map**:
  - **thirsty**: droop baseline increases continuously until watered
  - **watered**: perk-up with leaf shiver, sway amplitude restored
  - **dark**: sway slows (no light to track)

## Forbidden motions

**forbidden_motions**:
  - upright rigidity
  - tip moving before the base (motion must originate at base/stem)
  - fast humanoid gestures

## Substitution set

**substitution_set**:
  - wilt
  - bloom-open
  - bloom-closed
  - lean-L
  - lean-R
  - flinch-fold

**smear_drawing**: none (plants do not smear in this cast - timing contrast)

## Sound-linked motions

**sound_linked_motions**:
  - cry = leaf shiver wave from base to tips

## Engine block (machine-readable)

See `engine` in the JSON twin: mode, spring tuning, idle parameters, deformation limits. Springs OFF / warp forbidden where the material says so (Dorowani's shell).
