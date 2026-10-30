# Real Anime Movement — Diagnosis, Research, Tool Audit and the V3-072 Redo Plan

Owner order, 2026-10-29. The owner watched the V3-072 pond test from PR #127
himself and approved it as a step forward in all ways — camera, cuts and layout
stand. The one gap he named: the animation still looks like clip-art / South
Park cutout pieces with gaps and spaces between them. It has to become real
Pokémon / anime movement: continuous, no gaps between pieces.

This report does four things: (1) diagnoses mechanically, from the actual
renderer code and frames, why V3-072 reads as cutout; (2) researches the
movement craft that fixes it — JoJo beyond the tone switch, frame-level anime
movement technique that PR #128 does not already cover, and three other
inspirations mapped to this world; (3) audits the tools actually staged on
disk and in the repos against each diagnosed problem, with the missing list
kept honest; (4) gives a shot-by-shot redo plan for V3-072 (shots A–F) that a
follow-on lane can execute without re-deciding, ending in a connected,
actually-run proof chain.

It builds on PR #127 (`show/production/SHOW-PIPELINE.md`, the shotplan and
`render_camera_layer.py`) and PR #128
(`show/production/research/2026-10-29-pokemon-anime-production/REPORT.md` —
the Pokémon production standard: pipeline stages, drawing counts, ones/twos/
threes, the bank system). Neither is redone here.

**Two owner corrections govern this report and override older docs:**

- **AI redraw is in scope (2026-10-29 ~15:49 CT, supersedes the "Wan/Veo/
  Flow = filler/effects only" rule in PR #127's SHOW-PIPELINE).** Stop
  telling the AI not to redraw the characters; start telling it **keep the
  likeness**. Wan and VACE can draw and animate frames — VACE is the
  character/object-replacement and pose-control path with first-to-last-frame
  bridging, the same family as the video the owner keeps praising. Rigs,
  hand-drawn frames and AI-drawn frames are one full-team pipeline. The gate
  on every AI-drawn frame is likeness, checked by eyes against canon.
- **Whispkin has no mouth.** His mask covers it. No mouth animation is
  planned, drawn or generated for him anywhere in this report. His acting
  channels are body, hands and mask.

**The owner's acceptance rule for everything below (2026-10-29 ~15:52 CT):**
a finished frame must read as a complete drawing. Pieces may exist
underneath, but every cutout gap is filled, no source-piece leftovers show,
and frames are checked frame by frame. That is how Pokémon reads — drawn
scenes, not assembled crops.

---

## 1. Diagnosis — why V3-072 reads as cutout, from its own code

All references are to `show/production/show-pipeline/render_camera_layer.py`
on PR #127's branch (`grok/show-pipeline-2026-10-29`), read in full, and to
the V3-072 contact sheet and check frames in that PR's `proof/`.

### 1.1 The character is one flat photograph, sliced by rectangles

The renderer opens exactly one character image — the canon front cutout
(`reference-packs/wispkin/front.png`, 288×609) — and cuts it into five pieces
with **axis-aligned rectangles**, not anatomical contours:

- left hand: rectangle x 0–78, y 158–236, then kept only where pixels are
  dark (the black fingers);
- right hand: rectangle x 212–288, y 158–236, same dark-pixel filter;
- head: rectangle x 40–250, y 0–250, with the hand areas knocked back out;
- body: rectangle x 20–270, y 200–330;
- smoke: rectangle x 0–288, y 310–609.

Rectangles cannot follow a shoulder, a mask rim or a finger. Every piece
therefore carries straight-cut edges and corners that were never in the
character design, and neighbouring pieces meet — or fail to meet — along
those straight lines. That is the literal "pieces" look.

### 1.2 Named defect: the finger holes (owner, own eyes)

The hands originally sit **on** the mask in the source drawing. The renderer
removes them from the head layer by zeroing the head's alpha wherever a hand
was (`_h[...,3] = where(hand_alpha>0, 0, ...)`). The pixels underneath the
fingers were never drawn by anyone — the source has fingers there, not mask.
So the head piece ships with finger-shaped **transparent holes**. The moment
a hand sprite moves off the mask, the holes show as empty negative space
carved into the mask. The renderer never fills them. Fix named by the owner
and applied in this report's proof: fill behind the cutout with the mask's
own white — and, cleaner, draw arms/hands as separate parts from the start
instead of cutting them out of the mask image.

### 1.3 Named defect: the leftover teeth on the chest (owner, own eyes)

The head rectangle (y 0–250) and the body rectangle (y 200–330) **overlap by
50 rows**. The mask's teeth sit in that overlap band, so the teeth exist
twice: once on the head piece, once baked into the top of the body piece.
The head piece rotates around its pivot (145, 235); the body piece does not.
Tilt the head and the body's static copy of the teeth stays behind, visible
on the chest under the crop — a source-piece leftover, exactly as the owner
described it. Any overlapped duplicate anatomy will do this; the overlap
band must be cleaned off the under-piece.

### 1.4 The only motion is rigid transforms of those bitmaps

Per frame, the puppet function does exactly three kinds of movement:

- each hand and the head are **rotated as rigid bitmaps** around a fixed
  pivot (`rotate()` with a centre point) and translated;
- the body is **resized vertically** — a single uniform squash factor
  applied to the whole bitmap;
- the smoke is **row-shifted** — each row rolled sideways by a sine amount.

Nothing bends. A head that leans does not lean more at the top than at the
neck; a hand that lifts keeps the exact finger shape of the source drawing
at every angle; the body's silhouette scales but never changes shape. Real
drawn animation changes the drawing itself at every step. Rigid transforms
of a fixed bitmap are the definition of cutout animation, and the eye reads
them instantly — this is the South Park comparison the owner made, and the
code shows it is literal, not a matter of polish.

### 1.5 Joint separation is hidden by a painted ellipse, not solved

Because the pieces are separate, the renderer pastes a blurred dark ellipse
(`underlay`, an ellipse at y 150–336, Gaussian-blurred) behind the body to
plug the gaps where pieces separate. It is a spackle layer: a soft black
blob that reads as shadow when the pieces happen to cover it and as a dark
halo when they don't. Joints in drawn animation are covered by **overlapping
drawings** — the upper piece is drawn extending under the lower one, along
the joint, in the joint's own colours. A generic dark ellipse in nobody's
colours is why gaps read as *spaces between pieces* instead of as a body.

### 1.6 No drawn in-betweens, no breakdowns, no smears — interpolation instead

Poses are seven named key poses (`low, shake, crouch, rise, peek, wail,
apology`), each a tuple of seven numbers (body offset, squash, head
rotation, head offset, two hand transforms, shake). Between keys, the code
**linearly interpolates the numbers** with one smoothstep easing curve, the
same curve for every action in every shot. Consequences the eye catches:

- Hands travel in straight lines at even speed — no arcs, no anticipation
  dip before a lift, no overshoot or settle after it.
- Every action has the same acceleration profile, so a wail and an apology
  bow have identical timing *feel*.
- There is no breakdown drawing — the in-between is a numeric midpoint of
  two transforms of the same bitmap, never a new shape that favours one key,
  stretches along the motion, or smears across a fast move. Shot D's "wail"
  is held as a single pose for its whole 0.75 s: the impact comes entirely
  from the grade and speed lines, not from the character.
- Character animation is quantised to 2s while the camera moves on 1s, which
  is correct TV-anime practice — but with interpolation instead of drawings,
  the 2s steps read as the puppet jumping between transform states rather
  than drawings changing.

### 1.7 Layering never changes, so nothing ever passes in front of anything

Paste order is fixed for every frame of every shot: smoke, underlay, body,
head, hands — hands always on top, even in the "reverse angle" shot E, which
is faked by mirroring the whole world and puppet rather than drawing the
character from the other side. No occlusion change means no depth inside
the character: a hand can never go behind the mask, the body can never turn.
Drawn animation re-draws the layering per pose; a fixed stack is a paper
doll.

### 1.8 Named defect: the smoke is a crop, sliding (owner, own eyes)

The smoke "animation" is the row-roll in §1.4 applied to the rectangular
smoke crop (y 310–609 of the character sheet). The crop's silhouette —
including its straight top edge where the rectangle cut it off the body —
slides side to side as one piece. Smoke in the test is therefore a sixth
cutout piece with a wavy offset, not an effect: it does not grow, thin,
curl, break up or dissolve. The owner: it must be drawn and animated *as
smoke*.

### 1.9 Named defect: the background reads as procedural pieces (owner)

The pond plate is a single still, composited flat behind the character and
only ever cropped, rotated and graded by the camera step. Nothing in it is
painted in layers, nothing in it moves at its own rate (no parallax layer
split, no animated water or mist layer of its own), and its shapes read as
generated geometry rather than a painted anime background. The redo plan
treats background as its own production track (§4.0), not as a backdrop
file.

### 1.10 What is NOT wrong

The camera layer, cut list, sizes, grades and tone switch are approved and
are not re-litigated here. The shotplan's structure — six cuts, push-in,
pull-out, reverse, impact — stays exactly as the spine of the redo.

---

## 2. Research — the movement craft that fixes it

Method note: findings below come from web sources read on 2026-10-29, cited
per section. What transfers into Mochiichao is **technique and craft only** —
no copyrighted images, character names/logos as show content, or verbatim
material go into the show or its assets. Naming the studied shows in
research citations follows PR #128's precedent. PR #128 already covers the
Pokémon production pipeline, drawing counts and ones/twos/threes economics;
this section covers what it does not: JoJo's movement language, frame-level
movement technique, and three further inspirations.

### 2.1 JoJo's Bizarre Adventure — beyond the tone switch

V3-072 already uses the palette-swap impact frame. That is one item from a
much larger kit (this repo's own earlier study doc,
`show/production/research/jojo.md`, establishes the production base: David
Production's JoJo is hand-drawn 2D — e-konte → layout → genga → digital
paint/composite — with manga graphic devices translated into motion, and no
rigs; the new findings below are about the movement/visual language itself):

- **The pose is the key frame, and it is held like it matters.** JoJo poses
  are treated in the anime as key frames of animation, arriving with the
  "menacing" onomatopoeia and a palette shift at moments of resolve or a
  power reveal — the pose communicates the character's internal state
  without dialogue (Shapes/Fandom JoJo fashion-and-poses study; A.V. Club's
  adaptation history). Transfer: Whispkin's `peek` and `wail` equivalents
  should be **designed held poses** — silhouette-first, asymmetric, line of
  action pushed past natural — held long enough to read, not interpolated
  through on the way to somewhere else. In V3-072 every pose is a waypoint
  of the lerp; in the redo, at least one pose per shot is a destination.
- **Freeze and graphic devices carry climaxes, not continuous motion.**
  The adaptation leans into freeze frames during climactic attacks, slow
  motion on rushes, and on-screen graphic sound-effect text as direct
  translations of the manga's graphic design into motion (AnimePapa canon
  comparison; A.V. Club). Transfer: shot D keeps its tone switch and speed
  lines, and gains (a) a genuine freeze on the strongest drawing for a few
  frames, and (b) graphic SFX lettering drawn as part of the frame — an
  original Mochiichao glyph/text treatment, never JoJo's actual glyphs or
  lettering copied.
- **Colour is scripted by emotion, not by continuity.** Araki colours by
  mood and shifts palettes mid-scene; David Production formalised this as
  "special scene coloring" for moments of emotional significance (A.V.
  Club; AnimePapa). Transfer beyond the single impact switch: the pond
  scene gets a **colour script** — dusk holds, the levitation rise warms,
  the impact inverts, the apology cools — each grade a decision per shot,
  exported as LUTs (the staged grade tooling already works this way; see
  §3).
- **Shading and line do acting work.** JoJo's read comes from hard shadow
  shapes, thick contour lines and high-contrast painting that change with
  the pose (production-style analyses in the search set). A rigid bitmap
  carries one baked shading forever; a redrawn or mesh-deformed frame can
  move the shadow boundary with the form. Transfer: in the redo, the mask's
  shadow side is a separate paint layer that follows the head's bend, so
  light appears to move across the mask as it leans — cheap, and it is the
  difference between a sticker tilting and a head turning in light.
- **Camera tension:** JoJo stages stillness against the camera — held pose,
  slow push, angle slightly wrong (dutch), then release. V3-072's shot C
  push-in already has the shape; the redo keeps the camera and gives it a
  drawn pose worth pushing into.

What does **not** transfer: the fashion-model anatomy and pose vocabulary
themselves (they belong to that show's characters), the specific
onomatopoeia glyphs, and Stand-style apparition staging — Mochiichao's
powers get their own staging grammar per the owner's per-power-family
doctrine already on file in this repo's research index.

Sources: https://www.avclub.com/jojos-bizarre-adventure-anime-history-manga-adaptation-davidpro ·
https://shapes.inc/fandom/jojo-s-bizarre-adventure/fashion-and-poses ·
https://animepapa.com/article/canon-comparisons-how-jojos-bizarre-adventure-adapts-its-manga-across-generations ·
plus this repo's `show/production/research/jojo.md` (Terumi Nishii Sakuga
Blog interview and the AAA/AAA2 key-frame collections listed there).

### 2.2 Frame-level movement technique (the part PR #128 does not cover)

PR #128 documents *that* TV anime uses key animation and in-betweening.
This is *how* those drawings make limited frames read as one continuous
body — the exact mechanisms missing from §1:

- **The key animator decides the timing, not a curve.** In anime
  production the individual animator chooses the number of in-betweens
  between keys; Kanada-style timing uses irregular, often very low
  in-between counts to make each key land harder — movement built from
  striking poses, paradoxically emphasising stasis (Animetudes, "On
  animetism"). Transfer: timing in the redo is authored per action as a
  timing chart (which gaps get 0, 1, 2 or 3 in-betweens, where the holds
  sit), never one global smoothstep.
- **Spacing charts and arcs are instructions, not decoration.** Key
  animators annotate the motion arc and where in-betweens sit along it;
  the in-betweener draws following the timing *and spacing* notes
  (Sakugabooru production-materials thread; Sakuga Blog production notes).
  Transfer: hand paths in the redo are drawn as arcs in the layout first;
  whatever generates the in-betweens — an animator in Krita/Tahoma2D, or
  AnimeInbet, or VACE bridging — is given the arc, not two endpoints.
- **Smears bridge fast motion.** A smear is a deliberately stretched or
  distorted drawing inserted between two keys of a fast move; coupled with
  timing it creates the illusion of seamless movement, and it works
  subconsciously only when fast and rare — a stretched in-between also
  keeps screen-space overlap so the eye can follow across the gap
  (Endless Reference timing/smear study; Canmom, "Motion blur & smears",
  working from Williams). Transfer: exactly two smear moments are planned
  in V3-072 (the hand lift in C, the snap into D) — drawn elongated along
  the motion path, one drawing each, never a blur filter over the whole
  character.
- **Anticipation, squash/stretch, overlapping action are the continuity
  system.** Motion reads as one body when the body prepares (anticipation),
  deforms along the motion (squash/stretch), and its parts arrive at
  different times (overlap/follow-through) — the principles every
  in-betweening curriculum teaches alongside ones/twos/threes (BINUS
  animation-principles overview; Module 6 in-betweening text: twos are the
  common default, threes for slow/calm, smears prominent on twos).
  Whispkin is built for this: a round soft body (squash/stretch), a smoke
  trail (built-in follow-through that should lag and overshoot the body —
  in V3-072 it is locked to the same sine as everything else), and hands
  that should lead or trail the head by a drawing or two.
- **Holds are animated, not frozen.** TV anime holds a pose with a camera
  move, a blink, a drifting secondary element — the economy PR #128
  documents. A hold plus one moving secondary layer reads as alive; a hold
  alone reads as a sticker. Every hold in the redo plan names its secondary
  motion (smoke drift, water ring, mask shadow shift).

Sources: http://animetudes.com/2020/04/08/on-animetism-or-the-importance-of-sakuga-to-theory/ ·
https://sakugabooru.com/post/show/19483 ·
https://endlessreference.com/article/16 ·
https://canmom.art/animation/smears ·
https://binus.ac.id/bandung/dkv/2025/11/03/the-magic-of-movement-how-simple-drawings-come-to-life/

### 2.3 Three more inspirations, chosen for this world

**(a) Mob Psycho 100 (Bones) — the pond scene is a psychic scene.**
Whispkin levitating over water, shaking with suppressed power, is this
show's home territory. Its craft: characters warp, distort and dissolve
into brush-like strokes at emotional peaks; limbs stretch into impossible
arcs and faces smear, deliberately rejecting anatomical correctness to
externalise suppressed emotion; quiet scenes stay delicate — blinks, small
posture shifts — so the eruption contrasts (AnimePapa Bones style study;
Shapes production-art notes: deformation, smear frames and impact frames
are listed production vocabulary; the 100% gauge ties palette and style
shifts to emotional state). Transfer: the levitation's emotional curve
gets a visual curve — the higher Whispkin's feeling, the more the smoke,
the water rings and the colour script respond, while his body animation
stays small and drawn. What does not transfer: the style-disintegration
extremes (charcoal/paint-on-glass shifts) — Mochiichao keeps one
continuous world look per scene; Mob's *contrast discipline* transfers,
its mixed media does not.

**(b) One Piece, Wano-era Toei — creature-feature squash and stretch at
TV scale.** The benchmark cuts (Naotoshi Shida's among them) are
recognised by rubbery, stretchy movement in high-speed action, brief
abstract impact frames flashing force for a single frame, dynamic camera
rotating and snapping around the action, and exaggerated-but-on-model
expressions (The Diplomariot Shida study; Sakuga Week in Review on
Wano #892: weighty choreography, smears throughout a dodge-and-slash
sequence). Transfer: this is the model for Mochiichao's *battle and
power* scenes generally — and inside V3-072, for shot D's impact frame
being a drawn distorted drawing plus a one-frame abstract flash, not a
posterised filter over an undistorted puppet. What does not transfer:
the human martial-arts choreography itself; Whispkin's power is
levitation and feeling, not strikes.

**(c) Demon Slayer (ufotable) — effects that are drawn, then composited
like they belong.** Its signature is hand-drawn character work blended
with digital compositing: the famous water effects are "almost all
hand-drawn elements" with a little 3DCG in the final composite, and the
production problem they name is exactly ours — matching the moving
character to the moving effect (producer Yuma Takahashi, via FandomWire);
layered lighting, particles and motion blur sit in a compositing stage
over the drawn frames (AnimePapa MAPPA/ufotable study). Transfer: this
is the template for the pond itself — smoke and water are **drawn/
generated as their own animated layers, timed against the character's
drawings**, then composited with light, not pasted behind a puppet. It
also validates the Wan/VACE seat in §4: generated effect layers are
composited craft when they are art-directed per shot and likeness/style
checked, which is this studio's rule for them. What does not transfer:
the breathing-technique visual motifs themselves (ukiyo-e wave/flame
designs belong to that show); the pond's water language is Mochiichao's
own dusk-pond world.

Sources: https://animepapa.com/article/the-evolution-of-bones-animation-style-in-action-sequences/ ·
https://shapes.inc/fandom/mob-psycho-100/production-art ·
https://thediplomariot.com/blog/naotoshi-shida-the-maestro-behind-one-pieces-best-fights-1764802656 ·
https://artistunknown.info/2019/07/11/sakuga-week-in-review-1-01-07-19-07-07-19/ ·
https://fandomwire.com/the-demon-slayer-breathing-technique-that-was-super-tough-to-animate-it-is-very-difficult-to-match-the-human-characters-movement/ ·
https://animepapa.com/article/how-anime-studios-like-mappa-ufotable-changed-the-game/

---

## 3. Tool audit — what is actually staged, verified on disk 2026-10-29

Rule used: a tool counts as staged only if its binary/files were found on
disk (path given) or in a named repo. A mention in a catalog doc is not
proof and is flagged as such. Versions are stated only where a WIRING doc
or the binary itself states them.

### 3.1 Deformation and rigging (fixes §1.4, §1.5, §1.7)

| Tool | Verified where | State | Job in the redo |
|---|---|---|---|
| Tahoma2D 1.6.3 | `~/workspace/tools/tahoma2d/Tahoma2D/Tahoma2D.AppImage` (167 MB ELF) + extracted tree + `run-tahoma2d.sh` — **launch verified on this VM 2026-10-29** per its runner header (borrows Natron's libOpenGL, runs under xvfb) | **Working** | Primary production host: Plastic-tool mesh deformation + skeleton on drawn parts, Xsheet timing per shot. The cutout-killer: parts bend instead of rotating rigidly. |
| OpenToonz 1.8.0 | Flatpak `io.github.OpenToonz` installed user-side (`~/.local/share/flatpak/app/io.github.OpenToonz/` present; `tools/opentoonz/WIRING.md` verifies version 1.8.0, binaries incl. `tcomposer`) | **Installed, launch blocked in this sandbox** — flatpak needs FUSE, this VM's kernel has no fuse module; WIRING.md is explicit. Works on a FUSE-capable session | Second full suite: same Plastic-tool deformation + scanned-drawing cleanup lane; `tcomposer` headless renders where it can launch. Do not plan a render on this VM through the flatpak. |
| Synfig Studio 1.5.5 | `~/workspace/tools/synfig/` AppImage + extracted tree; `synfig --version` → 1.5.5 verified 2026-10-29 (its WIRING.md); proof render on file (`proof/candy.png`) | **Working (CLI-verified)** | Vector-tween fallback deformation host; its bone/tween system is a viable second path if a Tahoma2D scene stalls. |
| Glaxnimate 0.6.0 | `~/workspace/tools/glaxnimate/glaxnimate-release_0.6-3204-linux-gcc-x86_64.AppImage`; `--version` verified; proof exports on file | **Working** | Vector part prep + Lottie/SVG/SIF interchange between the vector tools; not a character-acting host for this show. |
| Blender 4.5.3 (+ 4.0.2, 5.2.3 trees) | `~/workspace/tools/blender-4.5/blender-4.5.3-linux-x64/blender` present | Present (headless under xvfb per standing TOOLS.md practice) | Grease Pencil drawn frames + pose/layout assist; wiggle-bones spring secondary motion (`tools/wiggle-bones/wiggle_2_ultimate.py` present) for smoke-trail follow-through tests in 3D-assisted layout. |
| In-repo rigs | `show/production/rigs/` on main: `CAST-RIG-SPECS.md`, `builds/`, `templates/`, TALKING-SEAT-SPEC; SHOW-PIPELINE (PR #127) records TextRig→DragonBones builds for the cast incl. Wispkin and a pose library (Rigby2D) | **In repo; the Wispkin build's deformation quality is unverified by this lane** — specs and builds exist, no rendered deformation proof was found | The rig seat for repeatable series acting once a deformation proof (this report's §4 chain) passes on one shot. |
| nijilive / Live2D-style | Only traces found: `~/workspace/wizard-puppet-first-use/image2live2d/tests/test_nijilive_*.py` (another project's test files). **No nijilive runtime, no Live2D SDK staged** | **Not staged — see Missing** | — |

### 3.2 Drawn frames and in-betweening (fixes §1.6)

| Tool | Verified where | State | Job in the redo |
|---|---|---|---|
| Krita 6.0.4 | `~/workspace/tools/krita/krita-6.0.4-x86_64.AppImage` (368 MB) + `run-krita.sh` (starts; Qt locale notice only) | **Working** | Drawing the keys, breakdowns and smears themselves; clean-plate painting for §1.2/§1.3 fixes (fill, erase, repaint along contours — a paint tool, not a filter). |
| Pencil2D | `~/workspace/tools/pencil2d/` extracted AppImage tree + `run.sh` | Present, launch not re-verified by this lane | Light frame-by-frame sketch/rough pass if a lane prefers it. |
| AnimeInbet (ICCV 2023) | `~/workspace/tools/animeinbet/` cloned; **both checkpoints downloaded and LOAD-OK retested 2026-10-29** (its WIRING.md: corr net + full pipeline, torch 2.2.2 venv) | **Weights staged + load-verified; no inference run yet** | AI-assist line in-betweening: two clean line keys in → intermediate line frame out. Assist only; an animator's timing chart decides which gaps it fills. |
| LayerInbetween (SIGGRAPH 2026) | `~/workspace/tools/layerinbetween/` cloned with README/paper; **no weights or run verified** | Code staged, unproven | Occlusion-aware in-betweening research seat — relevant to hands-over-mask layering; not on the proof path until someone runs it. |
| ToonCrafter | `~/workspace/tools/tooncrafter/`; checkpoint (~3.18 GB) staged per its WIRING.md; **no inference ever run in this studio; needs ~12 GB VRAM, this VM has no GPU** | Staged, unproven, GPU-gated | Generative interpolation between two keys — Kaggle/Colab seat only, likeness-gated like VACE. |
| RIFE (v4.6 + 4.25 trees) | `~/workspace/tools/rife-v46/`, `rife425/` present | Present | Frame interpolation for **camera/FX layers and final smoothing only** — never as a substitute for character in-betweens (it morphs pixels; it does not draw). |
| Wan 2.2 / Wan2.1-VACE | `~/workspace/tools/wan2.2/` (repo, generate.py, Kaggle setup) present; agent-ops records the Wan2.1 suite pulled into production tooling (Apache-2.0) | **Staged; runs on the GPU lanes (Kaggle/Colab), not this VM** | Per the owner's scope correction: full character-animation path — VACE character replacement, pose control, first-to-last-frame bridging — under the likeness gate, alongside (not instead of) the drawn/rig paths. |

### 3.3 Surgical fixes — the exact staged tool for each (owner: these are the easy parts)

| Defect | Exact tool + operation |
|---|---|
| Finger holes in the mask (§1.2) | **Krita 6.0.4**: paint the clean plate — fill the finger-shaped holes with the mask's own white, following the mask's shading at its rim. (This report's proof does the same fill programmatically in PIL to demonstrate the plate; the production plate is painted in Krita.) Structural fix: hands/arms drawn as separate parts in Krita/Tahoma2D from the start. |
| Teeth leftover on the body (§1.3) | **Krita 6.0.4** erase + repaint on the body piece's overlap band; or in Tahoma2D, trim the body level to start below the head's band. Rule going forward: overlap bands carry **underlap extension in the under-piece's own colours**, never duplicate anatomy. |
| Gap/halo at joints (§1.5) | **Tahoma2D Plastic tool**: parts are drawn with overlap tongues along each joint and deformed as one mesh — the blurred ellipse underlay is deleted from the pipeline, not improved. |
| Smoke crop (§1.8) | Drawn smoke: **Krita** frame-by-frame smoke keys (expanding curls, thinning edges) in-betweened on 2s; or generated smoke: **Wan/VACE effects pass** on the GPU lane, art-directed per shot and composited in Natron; the PIL proof in this report shows the minimum bar — two-axis travelling-wave displacement + softening + alpha pulse — which already stops it reading as a sliding crop. |
| Procedural-looking background (§1.9) | Painted plate track in §4.0: **Krita** painted multi-layer plate (sky / far bank / water / near reeds as separate layers for parallax), style-held against the show's existing plates; generative assist allowed under the same world-style check. The staged pond plates incl. graded variants and `grade_plates.py` live at `show/assets/backgrounds/pond/` on main. |

### 3.4 Compositing, grade, editorial (already wired, per PR #127)

Natron (present in `~/workspace/tools/natron`, also the libOpenGL lender for
Tahoma2D), FFmpeg (used by both renderers), the grade/LUT path in
SHOW-PIPELINE §2, and the repo's proof-gate tooling. These were verified by
PR #127's lane and are not re-audited here.

### 3.5 MISSING — honest gaps, with the pull for each

1. **A working mesh-deformation render on THIS VM through OpenToonz** —
   blocked by the sandbox's missing FUSE, not by the install. Pull/fix:
   none needed for the tool itself; either run OpenToonz on a FUSE-capable
   session, or stay on Tahoma2D (launch-verified here) as the deformation
   host. Tahoma2D is the plan's host for exactly this reason.
2. **nijilive / any Live2D-style puppet runtime** — not staged anywhere
   (only another project's nijilive test files exist). Best free pull:
   **nijilive** (the Inochi2D ecosystem's reference implementation,
   BSD-licensed open source) via its GitHub releases, or **Inochi Creator +
   Inochi Session** (same ecosystem, free/open source) if a GUI puppet
   seat is wanted. Pull instructions: clone `Inochi2D/nijilive` into
   `~/workspace/tools/nijilive/`, build per its README, log the wiring in a
   WIRING.md before any show use. Not pulled in this lane: it is a second
   deformation ecosystem and the plan first proves the Tahoma2D seat,
   which is already launch-verified. Logged as a gap, not substituted.
3. **A proven AI in-between run** — AnimeInbet's weights load but no
   inference has ever been run in this studio; ToonCrafter likewise.
   Pull/fix: no download missing; what's missing is a **run** — one
   Kaggle/Colab session (standing GPU lanes) executing AnimeInbet's own
   test on two Whispkin line keys, output checked by eyes, result logged
   in its WIRING.md. Until that run exists, the redo plan treats both as
   assists-in-waiting and puts drawn in-betweens (Krita/Tahoma2D) on the
   critical path.
4. **A drawn smear/breakdown library for the cast** — no smear drawings,
   breakdown poses or timing charts exist in the repo for any character
   (the pose library is transform poses only). This is artwork to be
   **drawn** (Krita, per §4 per-shot lists), not a download. It is the
   single biggest content gap: tools deform and interpolate, but nobody
   has drawn the in-between shapes the whole plan depends on.
5. **CACANi or an equivalent auto-inbetween production seat** — not
   staged; CACANi is commercial/closed (documented, not pulled, per the
   pull-in law's license honesty). The open seats above cover the need;
   no pull recommended.

---

## 4. The V3-072 redo plan, shot by shot

### 4.0 Standing tracks (apply to every shot)

- **Clean-plate pass first (all shots).** Whispkin is rebuilt once, before
  any shot work: (i) mask clean plate with finger holes filled in the
  mask's white (Krita); (ii) arms/hands as separate drawn parts with
  overlap tongues at the wrist/shoulder; (iii) body piece with the teeth
  band erased and a proper underlap extension under the head in body
  colours; (iv) mask shadow as its own paint layer. This one rebuilt
  character is the input to every path below. No shot animates the old
  rectangular crops again.
- **Background track (all shots).** The pond is repainted as a layered
  anime plate in Krita — sky, far treeline, far bank, water, near reeds —
  five layers minimum, painted (visible brushwork, anime shading), held
  against the show's existing plate family for world consistency.
  Generative assist (Wan image/video seats on the GPU lane) may produce
  underpainting or living-water layers, gated by the same style check as
  character likeness: if it doesn't read as the same painted world, it
  doesn't ship. Layers move at different rates under the camera (parallax)
  and the water layer animates on its own cycle. The flat single still is
  retired as a background (it may remain a layout reference).
- **Smoke track (all shots).** Smoke is its own animated layer, never a
  body crop: drawn curl keys in Krita on 2s (grow → curl → thin →
  dissipate), or a Wan/VACE smoke pass per shot on the GPU lane, timed
  against the body's drawings with a 1–2 drawing lag (follow-through).
  Either way it is composited in Natron with its own light/grade.
- **Timing track.** Each shot gets a written timing chart before
  animation: keys, breakdowns, in-between counts per gap, holds and their
  secondary motion. One easing curve for everything is banned.
- **Likeness gate (AI-drawn frames).** Any frame Wan/VACE or ToonCrafter
  draws is checked against the canon front/turnaround by eyes, side by
  side, before it enters a cut — the studio's existing likeness-check
  tooling plus a human read. Frames that drift are redrawn or replaced
  with the drawn/rig version of the same moment; the shot never waits on
  the AI path — paths are parallel, per shot, and the plan names a
  primary and a fallback for each.
- **Whispkin's acting, every shot:** body, hands, mask. No mouth, in any
  path, drawn or generated. Prompts and rig notes must say so explicitly
  (a generator inventing a mouth under the mask is a likeness failure).

### 4.1 Shot A — WS pan L→R, 2.5 s, `low → shake → low`

- **Primary path: Tahoma2D Plastic deformation on the clean plate.**
  The shake is a whole-body tremble: mesh-deform the body with a small
  travelling ripple (shoulders first, smoke trail answering a beat
  later), head counter-shifting by a pixel or two against the body —
  overlapping action the rigid version cannot express.
- **Drawn:** 3 keys (settle, tremble-peak, settle), 1 breakdown; tremble
  held on 2s with the smoke as the secondary motion during the hold.
- **AI assist (optional):** none needed; this shot proves the rig path.
- **Acceptance:** at the tremble peak, pause the video — Whispkin's
  silhouette is a *different shape* from the rest frame, not the same
  shape shifted. No straight-cut edge visible anywhere.

### 4.2 Shot B — MS low-angle dutch, tilt-up follow, rise, 2.0 s, `low → crouch → rise`

- **Primary path: drawn keys + Tahoma2D deformation.** The crouch is
  anticipation: body squashes *wide* (volume kept — the squash widens as
  it shortens, which the old uniform resize never did), mask tips down,
  hands press. The rise stretches tall, hands trailing below the body's
  line, smoke stretching thin then bunching as he levels.
- **Drawn:** crouch key, stretch key, level key; 2 breakdowns; one smear
  drawing on the fastest part of the rise (body elongated along the rise
  path, one drawing, on 1s at the peak only).
- **AI assist:** VACE first-to-last-frame bridge (crouch key → level key)
  as the *comparison* render of the same action; whichever reads more
  continuous by eyes ships, the other is filed as the option. Likeness
  gate applies to every VACE frame.
- **Acceptance:** the rise reads as one motion with a wind-up, not a
  glide upward; at no frame can you see where head, body and hands join.

### 4.3 Shot C — CU mask, push-in, 2.0 s, `rise → peek`  ← the proof shot (§5)

- **Primary path: clean plate + deformation (proven in this lane, §5).**
  The peek is the mask lean plus the left hand rising to the mask — the
  exact action that exposed the finger holes. Head bends (mesh warp,
  lean increasing toward the top of the mask), the separate hand travels
  on an **arc**, fingers arriving after the wrist (overlap), mask shadow
  layer shifting with the lean.
- **Drawn:** peek key as a designed held pose (JoJo lesson §2.1 —
  silhouette-first, held); 1 breakdown favouring the peek; the hand's
  arc charted in layout.
- **Acceptance:** pause on any frame with the hand off the mask — the
  mask underneath is whole white mask, no finger-shaped holes; pause on
  the lean — no teeth anywhere except on the mask itself.

### 4.4 Shot D — ECU impact, snap-zoom + shake, 0.75 s, `wail`, JoJo grade + speed lines

- **Primary path: drawn impact, not a filter over a puppet.** One
  distorted wail drawing (mask stretched along the scream's direction,
  hands flung wide and drawn elongated), one one-frame abstract impact
  flash (One Piece lesson §2.3b), then the posterised duotone grade over
  those drawings, speed lines, and a 3–4 frame freeze on the strongest
  drawing (JoJo lesson §2.1) inside the snap-zoom.
- **AI assist:** none for the character; Wan may regenerate the speed-
  line/energy background layer only if the drawn one underwhelms.
- **Acceptance:** the impact lands from the *drawing* — mute the grade
  (view the ungraded frames) and the shot still hits.

### 4.5 Shot E — MS reverse angle, truck-in, 2.0 s, `wail → shake → apology`

- **Primary path: a real reverse.** The mirrored-puppet trick is
  retired. The reverse uses the character's turnaround material (the
  candidate turnaround on file in the reference pack) rebuilt through
  the same clean-plate pass — back/three-quarter parts, separately
  drawn hands — animated in Tahoma2D: the apology is a bow, body
  folding at the waist with the mask dipping last (overlap), hands
  coming together.
- **AI assist:** VACE pose-controlled pass from the front keys is the
  fallback if the turnaround rebuild slips — flagged honestly: a
  generated reverse that drifts in design is worse than a drawn one
  that is simpler; the drawn path is primary for a reason.
- **Acceptance:** the reverse reads as the same character seen from
  another side — not a flipped copy (flips betray themselves in the
  mask's crack: check it sits on the correct side).

### 4.6 Shot F — WS pull-out, 2.5 s, `apology → low`

- **Primary path: Tahoma2D, mostly holds and layers.** The settle is a
  long exhale: one slow squash back to rest on 3s, smoke calming to its
  idle drift, water rings widening and fading on the FX layer, camera
  pulling out across the repainted parallax plate (this is the shot
  where the background track proves itself).
- **Acceptance:** the pond feels painted and deep as the camera leaves —
  layers separate visibly; Whispkin's final held frame could be a still
  from a finished episode.

### 4.7 The connected chain (the hook-up, end to end)

For the proof path (shot C) the chain is, tool to tool:

1. **Canon cutout** (`reference-packs/wispkin/front.png`, in repo) →
2. **Clean-plate build** (Krita for production; PIL/numpy in this
   report's proof script): finger holes filled, teeth band cleaned,
   hands separated → clean parts.
3. **Deformation + timing** (Tahoma2D Plastic/Xsheet for production;
   mesh-warp + 2s timing in the proof script): bent head, arced hands,
   charted holds →
4. **FX layers** (drawn Krita keys or Wan/VACE on the GPU lane; proof:
   two-axis wave-displaced smoke + procedural water rings, as in the
   original renderer) →
5. **Composite + camera** (Natron for production; PIL composite + crop
   camera in the proof; the pond plate until the repainted plate lands) →
6. **FFmpeg** encode → contact sheet + check frames → **eyes**: the
   acceptance checks in §4.3 and §5, frame by frame.

Production swaps steps 2/3/5's engines for Krita/Tahoma2D/Natron and adds
the GPU-lane VACE/AnimeInbet assists per shot — the chain's shape does
not change.

---

## 5. The proof — one shot actually run through the chain

A proof clip **was** made in this lane: shot C (CU push-in, the peek),
because it is the shot where the owner's two surgical defects are most
visible. It runs the §4.7 chain with the engines this VM can execute
today (PIL/numpy + FFmpeg — the same engine family as PR #127's
renderer, so the comparison is apples to apples), and the same shot
rendered *both* ways: original holed parts vs the clean plate.

Files in `proof/` beside this report:

- `make_surgical_proof.py` — the whole chain, runnable:
  `python3 make_surgical_proof.py <repo_root> <outdir>`.
- `shotC-surgical-proof-v1.mp4` — 2 s, 1280×720, 24 fps: clean plate,
  separate hands on an arc, mesh-bent head, flowing smoke, push-in.
- `shotC-original-parts-v1.mp4` — the same shot/poses with the original
  part construction (hands knocked out of the head, teeth duplicated on
  the body, rigid head), for comparison.
- `surgical-before-after.png` — both renders side by side at two
  moments.
- `SHA256SUMS` for the three media files.

**What my own eyes see in the before/after sheet** (checked frame by
frame at the sheet's two moments, and the renders decoded clean):

- BEFORE: you can see the pond *through* Whispkin's mask where the
  fingers were knocked out — blue holes in the white mask at both hands.
  In the earlier moment a copy of the mask's teeth sits on his chest,
  left behind by the body piece while the head piece moves.
- AFTER: the mask is whole — no see-through holes anywhere a hand has
  been. The chest carries no teeth; the teeth exist only on the mask.
  The head leans with a bend instead of tipping as one stiff piece, and
  the smoke churns and thins instead of sliding as a slab.
- Honest limits of this proof: the hole fill is flat mask-white. Where a
  whole hand sat, the fill reads as a pale patch rather than shaded mask
  — the production plate fixes that by *painting* the clean plate in
  Krita (and, structurally, by drawing the hands separately so the mask
  is never cut, per §4.0). The mesh bend is a smooth warp, not a redrawn
  lean; the Tahoma2D Plastic pass in production replaces it. The
  background in the proof is still the existing pond plate — the
  repainted layered plate is §4.0 work, not claimed here. This proof
  demonstrates the surgical fixes and the deformation direction on one
  shot; it is not the finished redo of shot C, and it does not pretend
  the other five shots are done.

**Acceptance test for the follow-on lane (eyes, not metrics):** play
the redo and the original back to back, then pause anywhere. (1) No
frame shows background through the character. (2) No body part appears
twice. (3) At least one frame per shot has a silhouette that exists in
no other frame — a shape that was *drawn or deformed into being*, not a
transform of the rest pose. (4) The smoke could not be swapped with a
rectangular crop without the swap being obvious. (5) Whispkin has no
mouth in any frame. A redo that fails any of the five is not done,
whatever its frame count says.

---

## 6. Summary for the next lane

1. Rebuild Whispkin once (§4.0 clean plate + separate hands + painted
   layered pond plate + animated smoke layer). Everything else waits
   on this; it is also the cheapest work in the plan.
2. Prove the Tahoma2D Plastic seat on shot C against this report's
   PIL proof (same shot, judged side by side), then shots A, B, F on
   the rig path; D drawn; E drawn from the rebuilt turnaround.
3. In parallel on the GPU lane: AnimeInbet's first real run and the
   VACE bridge of shot B, both likeness-gated, both filed as options
   next to the drawn versions — the owner picks by watching, per shot.
4. Draw the smear/breakdown set (§3.5 item 4) as the work proceeds —
   two smears exist in this plan (C's hand lift, D's wail); the cast
   library grows from real shots, not from a separate exercise.
