# Pokémon Anime Production Research

This doc is the sourced research base for the Mochiichao show pipeline plan.
It is research only. The plan itself lives in its own doc.
Show lanes can cite this doc when a shot, a scene, or a pipeline step needs a source behind it.

Beside it sits the 2026-10-28 Pokémon TV spec report (`../2026-10-28-pokemon-tv-spec/REPORT.md`), a gap analysis of a small automated pipeline against the TV spec, with tooling guidance.
The two docs split the work. That one measures our pipeline against the standard. This one documents the standard itself: the owner's 2026-10-29 ruling, and the production figures behind it, from primary sources.

## The owner's show standard

Owner law, 2026-10-29. In plain words:

- The Mochiichao show is made like the Pokémon anime. Full production. Full stack.
- The camera works. There are camera angles, cuts, zoom-ins, pan-outs, and angle switches.
- Characters act with their whole body. Body, hands, and face actually move.
- Color tone shifts mid-scene are part of the show. JoJo-style palette switches.
- The bar is at least first-episode-of-Pokémon level. Nothing below that ships as show footage.

What fails the standard, from the owner's own review of the pond speed-test clips:

- One still scene, no cuts, no angles, no push-in, no pan.
- The body stayed frozen. A ghost layer floated up into the body. The water rippled from the levitation.
- Hands did not move. The face barely moved. There was no color-tone switch.
- That grade of clip is Pokémon intro-movie or chibi promo grade. At best it is early-generation Pokémon game animation.
- It can serve the game or a promo. It is not show footage.

One locked contrast: the Cape Jones show uses the opposite model (Adult Swim limited animation) on purpose. That model belongs to Cape Jones only. Do not cross the two shows.

## The numbers

| Measure | Figure | Source |
|---|---|---|
| Shots per episode | Over 300 shots | Hiroyuki Kato, producer at OLM, quoted in AWN |
| Drawings per episode | 4,000 to 5,000 individual drawings | Same AWN interview with Kato |
| Cuts per episode, animator's account | About 350 cuts in the example discussed. Iwane drew about 300 of them himself. Assistants split about 50. | Masaaki Iwane interview, Animage, March 2015, translated at Kanzenshuu |
| Change from Pokémon XY on | Regular episodes used about 20 to 30 percent more drawings than the earlier allowance | Iwane interview |
| One exceptional cut | A single long final shot in a Mega Evolution special used over 1,000 drawings by itself | Iwane interview |
| Key animation time | About 1.5 months of key animation work per regular episode. About 2 months for a special. | Iwane interview |
| Cost | About US$100,000 per episode in 2001 | Bulbapedia, Production of Pokémon animation |

General TV anime context, index only (found in search summaries, not read in full): a standard TV anime episode is commonly described at about 300 cuts and about 3,000 drawings. Pokémon sits at or above the normal TV anime load, not below it.

## Frame rates: ones, twos, threes

TV anime plays back at 24 frames per second. A new drawing is not made for every frame.

- Ones: a new drawing every frame. 24 unique drawings per second. Reserved for highlight action.
- Twos: each drawing held for 2 frames. 12 unique drawings per second. The normal default. Dialogue, walks, ordinary reactions.
- Threes: each drawing held for 3 frames. 8 unique drawings per second. Slower or calmer cuts. Often a held pose plus a camera move over the background, instead of moving the character.

One honest note that matters for our lanes: even full production is an economy system. The 4,000 to 5,000 drawing total only works because many cuts are held stills, partial movement (only a mouth, an arm, one layer moves), pans over a still, and reused bank animation. Full production means that economy runs at a much larger scale, with real acting and a working camera. It does not mean every frame is new.

## The pipeline

From Bulbapedia's Production of Pokémon animation and OLM's own account in AWN.

1. Model sheets (settei). Characters, objects, and locations are drawn from a variety of angles. This is what lets dozens of artists, and overseas studios, draw the same character the same way. Color-coded lines on the sheets and keys tell the color stage where highlights and shadow divisions go.
2. Script to storyboard (e-konte). Sequenced panels with planned dialogue and acting instructions. The drawing count for the episode is budgeted and controlled from this stage.
3. Layout. The storyboard panel is redrawn as the skeleton of the finished shot. Final framing, depth, perspective, and character and background placement are decided here. Layouts can be compiled with rough motion as a guide. An animatic may be made.
4. Key animation (genga). The key animator draws the poses that define the motion of a cut. Animation directors and chief animation directors correct the work.
5. In-betweening (doga). In-between artists draw the missing frames, following the key animator's timing and frame-pacing notes. OLM uses Clip Studio Paint in the key animation and in-betweening stages. OLM opened OLM Asia in Malaysia in December 2017 to expand digital animation and finishing capacity.
6. Finishing and color. Flat colors are applied per the official color model.
7. Backgrounds. Painted environments based on the layouts. Produced in parallel with the character work.
8. Compositing ("photography", satsuei). Character layers, backgrounds, effects, and lighting are merged. Camera moves are added digitally at this stage. Note: Pokémon was cel animation in its early era. It switched to digital from the fifth-season episode "Here's Lookin' at You, Elekid!"
9. Sound and finish work sit on top of the composited picture, as in any TV pipeline.

## The bank system: reuse is part of full production too

Pokémon reuses animation. This is documented, and it is official practice, not a shortcut snuck in.

- The bank system stores animation that can be reused in whole or in part, directly or by tracing.
- Z-Moves look identical every time because the motion and camerawork are complex. The banked version is the version.
- Recap episodes can consist largely of banked animation.

The lesson for our lanes: reuse is allowed when it is framed as a signature. A stock transformation, a signature move, a recurring effect. What full production does not allow is a whole scene standing still because nothing was animated. The bank covers set pieces. The acting between them is drawn.

## Camera angles and layouts

No published per-scene angle count exists for Pokémon. See the honesty section below. What the sources do establish is the system that produces the variety:

- Every cut gets its own layout. Its own framing, perspective, and placement.
- Model sheets supply every character from many angles, so a new angle never blocks production.
- Iwane credits 3D staff and moving key animation for shots where the camera moves around a lot.

So a new angle is a new layout and usually new key drawings. Angle variety is one of the main things the 300 plus cuts and 4,000 to 5,000 drawings are buying. That is the spend the owner's standard asks for.

## What the research could not verify

These points are stated plainly so no lane cites a number that does not exist.

- Average shot length for Pokémon TV is not published in any source found. The arithmetic from the sourced numbers gives about 3.5 to 4.5 seconds per cut (300 to 350 cuts across a 21 to 24 minute episode). That figure is derived, not sourced. Treat it as an estimate.
- A quantitative study of 22 anime films found average shot lengths of 3.02 to 8.72 seconds, averaging 5.44 seconds. That study covers films, not TV. Films cut slower than TV. Do not use the film figure as a Pokémon TV figure. Index only.
- Camera angles per scene are not published. No source gives a count. The layout system above is documented; the per-scene count is not.
- The general TV anime context figures (about 300 cuts, about 3,000 drawings for a standard episode) are index only. They came from search summaries of industry guides, not from a primary source read in full.

## What this means shot by shot

The Grok lane is running the pond-scene redo as the acceptance test for the show pipeline. The test bar, from the owner: at least 4 cuts, a push-in, a pan, real body movement, and one color-tone switch. Here is what the research says about each item.

- At least 4 cuts. Pokémon runs over 300 cuts an episode because story and acting are told in cuts, one layout per cut. A show scene that holds one static shot for its whole length is built like a game clip, not like the anime. Four cuts is the floor for the test, not the ceiling for a scene.
- A push-in. Camera moves are added at the compositing stage, over finished layers. A push-in is a normal pipeline move in this model, not an extra feature bolted on. A scene with no camera move at all is missing a stage the pipeline already has.
- A pan. Pans over a still are one of the documented economies of TV anime, and moving-camera shots are a credited part of Pokémon's key animation. The camera is expected to travel, even when a pose is held.
- Real body movement. Key animation exists to define a cut's motion with poses, and in-betweening exists to complete it. Body, hands, and face moving is the core spend of the whole pipeline. A frozen body with one floating layer is the limited-animation model. That model belongs to the other show.
- One color-tone switch. Color is its own production stage, set by official color models and finished per cut, then merged in compositing. A deliberate palette switch mid-scene sits natively in that pipeline. It costs a color decision and a compositing pass, not a redraw of the scene.

A pond test that lands all five items is at the floor of the owner's standard. A full scene then scales the same five habits up: more cuts, more angles, acting in every cut, tone used on purpose.

## Sources

Verified live, opened and read on 2026-10-29:

- AWN, OLM Asia Launches New Pokémon Animation Series with the Help of Celsys' Clip Studio Paint. Producer Hiroyuki Kato: over 300 shots, 4,000 to 5,000 drawings per episode; Clip Studio Paint in key animation and in-betweening. https://www.awn.com/animationworld/olm-asia-launches-new-pok-mon-animation-series-help-celsys-clip-studio-paint
- Kanzenshuu, Masaaki Iwane interview, Animage March 2015, translated by Dogasu. About 350 cuts in the example episode; XY era drawings up 20 to 30 percent; about 1.5 months of key animation per regular episode; one special cut over 1,000 drawings. https://www.kanzenshuu.com/forum/viewtopic.php?t=42117
- Bulbapedia, Production of Pokémon animation. About US$100,000 per episode in 2001; model sheets; storyboard to layout to key animation to in-betweening; the bank system; cel to digital switch. https://bulbapedia.bulbagarden.net/w/index.php?title=Production_of_Pok%C3%A9mon_animation

Index only, found in search summaries and not read in full. Flagged wherever used above:

- Industry and production-guide summaries for general TV anime figures (about 300 cuts, about 3,000 drawings per standard episode).
- A study of 22 anime films for average shot length (3.02 to 8.72 seconds, average 5.44 seconds). Films only, not TV.

Full research report on file: Pokémon vs. Adult Swim production research, deep research run of 2026-10-29. Only the Pokémon sections are used here. The Adult Swim sections document the Cape Jones model and live with that show's docs.
