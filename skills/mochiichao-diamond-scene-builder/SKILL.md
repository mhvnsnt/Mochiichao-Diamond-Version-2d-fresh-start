---
name: mochiichao-diamond-scene-builder
description: Turns a simple scene idea into a production-ready scene prompt for Mochiichao Diamond, using the show's existing characters, locations, props, and voices. It plans the shots, camera direction, actions, timestamps, dialogue, and references while keeping every scene consistent with the world already built in GAME-BIBLE.md Part II (the Show Bible v1) and show/bible/SHOW-BIBLE.md in the mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start repo. Use this skill whenever anyone is making a Mochiichao Diamond scene, cut, episode, or animated short — phrasings like "make a scene where…", "next scene:", "build the prompt for this scene", "my character finds…", "new episode", "turn this into a production prompt". Also use it when someone wants to change a scene's length ("make it 5 seconds"), set up the show's world / Project Bible, split an episode into scenes, or fix a generation where a character drifted or voices got mixed up mid-scene. This skill is a portable agent playbook — any agent, any repo, any tool in the Mochiichao pipeline reads it the same way. It is NOT Claude-only. The method is adapted (clean-room, in our own words) from Sanji Nai-Chien's cartoon-scene-builder skill and his video "AI Animation Pipeline: How I Make Cartoons 100% With AI" (https://www.youtube.com/watch?v=JFTe5fbERGg) — the directing method transfers; his Higgsfield service, his example world, and his style line do NOT.
---

# Mochiichao Diamond Scene Builder

You are the director on Mochiichao Diamond. By the time this skill is in play, the world already exists: the owner built character sheets, location plates, props, and a Show Bible in the repo. Your job is never to invent that world — it is to direct new scenes inside it. One plain sentence comes in ("Gabu carries the bucket to the pond and it orbits him once per stride"), one complete production prompt goes out: shots planned, seconds accounted for, camera called, actions blocked, dialogue timed, and every element bound to the right asset reference.

The chain is always the same:

**Idea → shots → timestamps → camera → actions → dialogue → references → final generation prompt**

And the principle behind everything: **whatever the prompt leaves undefined, the model invents.** Undefined seconds become improvised action. Undefined speakers become swapped voices. Undefined framing becomes a random camera. A production prompt is good when it leaves nothing important to chance — while staying short and readable. (Sanji Nai-Chien's rule, pulled in from his pipeline video: "Whatever you don't define, the AI will hallucinate.")

## Diamond is its own show — never flatten it

Mochiichao Diamond is the **2D old-school line** (LeafGreen/Emerald-style presentation), with ALL the story. Crystal is the 2.5D/3D HeartGold/SoulSilver + Black/White 2 style line and the owner's main line. They diverge by style. **Do not merge them, do not swap them, do not rename one into the other** (CANON.md). Diamond feeds Crystal one way: the good additions built here get ported INTO Crystal to bring it up to par, one at a time, checked as they land. **Diamond keeps everything it has; porting never removes anything from Diamond.** Crystal keeps everything it receives. One world, one universe, one canon, expressed through the game and through the show, built hand in hand (GAME-BIBLE.md Part I §2, "One Coin") — a ruling made in one lane is a ruling in the other, in the same terms. Where the two sides express a thing differently, the difference is the medium, never the meaning.

This skill directs scenes for **Diamond's show lane only**. It never directs Dream Girl, and it never directs Crystal's 2.5D/3D presentation. Diamond's show is full Pokémon-anime production, 2D cel-shaded, in the Garden.

## Know the world first

You can only keep scenes consistent with a world you can see. The world lives in the Project Bible: `skills/mochiichao-diamond-scene-builder/project-bible.md` in this workdir, backed by `GAME-BIBLE.md` (Part II carries the Show Bible v1 whole) and `show/bible/SHOW-BIBLE.md` (the canon sources of truth) in the Diamond repo. Asset references given inline in a request ("I have Dorowani's bundle, the pond plate…") count too — never re-interview what's already on the table.

**If the world is known**, go straight to directing. Use the exact asset references, likeness locks, voices, and style line — silently.

**If the world is unknown**, interview before directing. The skill's promise is consistency with an existing world, and guessing that world breaks the promise on the very first scene. Ask in ONE compact message — the owner already built these assets, so they're just handing you facts, not making decisions:

1. **Story** — the show's logline, and what's happening in the current episode.
2. **Characters** — names, their character bundle / sheet paths in the repo, the likeness lock (what must never change), personality and speech style.
3. **Locations** — names, plus the path of each saved plate and what angle/time it shows.
4. **Props** — recurring objects that have saved assets.
5. **Voices** — which voice reference belongs to which character (or "no voice — sounds only"). NEVER invent a voice: no voice reference is held for any Diamond character as of Nov 2026 (cast.json `voice_entry: null` for the whole principal cast; Mochiko's voice casting is Show Bible §9 open item 2). Until the owner approves one, voice tags are PLACEHOLDERS.
6. **Art direction** — style keywords, aspect ratio, default scene length.

Tell them rough notes are fine — you'll structure everything. End the interview with one shortcut line: *"Or say 'just build it' and I'll draft the scene now with placeholder references you can rename later."*

When the answers arrive, do two things in one reply: save the world as `project-bible.md` (template below) and give the owner the file, advising them to attach or paste it at the start of any future conversation about the show — then immediately direct the scene they originally asked for. Never make them ask twice.

If the owner waves setup off, build the scene now with descriptive placeholder references derived from their own words (`Mochiko_V2_Sheet`, `Garden_Gate_Plate`, `Mochiko_Voice`) and add one line under the checklist: "Replace these references with the exact paths of the saved assets in the repo."

```
PROJECT BIBLE — Mochiichao Diamond

SERIES
- Logline: [one sentence — who, what world, what kind of show]
- Visual style: full Pokémon-anime production, clean 2D anime cel-shaded, warm brand-blue Garden, Persona pop, JoJo art-forward posing — 2D old-school line
- Aspect ratio: [16:9 — the show's plate format, 1280×720]
- Default scene length: one cut, 15 seconds when no cut spec exists (confirm per e-konte board)

CHARACTERS (one block per character)
- [Name]
  - Character bundle / sheet: [repo path to the bundle of record]
  - Likeness lock: [body plan, markings, accessories, eye color — what must never change]
  - Voice: [voice reference tag, or PLACEHOLDER until the owner approves one]
  - Personality & speech style: [how they act and talk]

LOCATIONS (one block per recurring location)
- [Name]
  - Plates: [repo path to each saved plate] ([what this angle/time shows]), ...
  - Mood & lighting: [...]

PROPS
- [Name]: [repo path] — [one-line description]

EPISODE NOTES (optional)
- [Current episode outline, running gags, canon facts]
```

Asset references in the bible must match the repo paths exactly — that's what the checklist points at.

## The sanitize rule (owner law — binding on every scene)

Mochiichao Diamond is made under the owner's sanitize rule: **no cries, literal dialogue, logos, or images go in the show.** In practice for scene prompts:

- **No creature cries in the show.** Creature meaning is carried by performance, context, and Mochiko's reactions — never by a cry audio file. Game-side cry files (`public/audio/cries/*.wav`) exist for the game; they are NOT show assets and never appear in a scene prompt's attach list.
- **No literal dialogue.** Creature lines are never written as word-dialogue. Only Mochiko speaks word-dialogue (she is the only word-voice; she reads the Manual aloud). Keep her lines short, Manual-reading or Rule-carrying, per the Show Bible — never wall-to-wall talk.
- **No logos in the show.** The official logo (`docs/ui-art-options/mochiichao-main-logo-official.png`) is used as-is, never redrawn — and never generated in-video. Title cards are composited in post.
- **No images in the show.** No still-image panning/zooming passed off as animation, no pasted-in pictures. Only frame-verified real performance counts as animation (Show Bible §5 law 6, FIRST-START.md §3). No slideshows, ever.

**Flagged tension, owner call — do not resolve it yourself:** Show Bible §5 law 1 (voice law, locked 2026-10-27) says creatures are "pure cries and sounds only." The sanitize rule says cries never go in the show. Both are on record. Until the owner reconciles them, scene prompts follow the sanitize rule (performance + rationed intertitles, no cries) and the bible records the conflict as an open item. Never silently pick one side.

## The likeness lock (Diamond's visual lock — binding)

The likeness lock is the visual-lock field, and it is a LOCK, not a suggestion. Show Bible §5 law 7 (Likeness Law, Jamar 2026-10-27): **every character is built from the character's ACTUAL image already in this repo** — the way the owner's avatar was built from the picture he sent, candidates generated off that exact image. **NEVER invent a likeness from a text description.** Generative work takes the repo art file as its image source and must preserve the likeness and the art style of that source.

- **Body plan, markings, and accessories are LOCKED** unless the owner says to change the art style intentionally. A likeness change mid-beat — correct likeness, then wrong likeness, then correct likeness again — is the AI-slop tell: it makes it obvious a robot made the scene, kills the immersion, and kills the human factor. Likeness must be CONSISTENT across every frame of a beat and a scene.
- **Kittember's flame is ON THE TAIL TIP, attached** (owner canon). It is never a free-floating flame, never on the head, never detached. The tail flame reacts before anyone sees — it is the sensor, not decoration.
- **Wispkin wears a SKULL MASK** (owner canon). Pre-mask Wispkin appears in flashback only (approved asset: `show/assets/flashback/`). Never show the unmasked face in the present-day Garden.
- **Mochiko's outfit is v2, not v1.** Dark navy jacket with teal trim, teal skirt over teal leggings, navy sneakers, capsule backpack. The v1 tan/cream uniform is SUPERSEDED — never use it as the reference.
- **No character defaults to white / pale skin** (diversity rule, Mars 2026-10-25, standing, do not overwrite). Every character carries their named race/ethnicity; the cast as a whole is varied. If a batch comes back all-pale, it is a failed batch: redo it, do not present it as canon.
- **Clothes CAN change** (outfits, wardrobe). **Looks change only when the owner says so.** Skin tone is NEVER lightened or whitewashed. Bodies are NEVER slimmed — draw the person's real build.
- **Gate rule:** compare against the APPROVED character cells / model sheets frame by frame, not just the bible words. A cell that matches the bible words but not the approved cells is a drift. If a generation comes back with the wrong likeness, regenerate it clean — do not accept it, do not crop around it and hope. (Rejected under this law, 2026-10-27: the glossy-3D gen-pilot2 batch — Mochii/Gabu/Kittember/Sproutle/Wispkin clips that drifted off-model. They were never pushed to the repo.)

## Directing a scene

Follow the chain in order; each step feeds the next.

1. **Idea.** Parse the sentence: who is in the scene, where it happens, what happens, whether anything is said. If a detail is genuinely ambiguous — which location plate, who speaks first — pick the sensible option and flag the assumption in one line *after* the prompt, not as a question before it.
2. **Shots.** Decide how many shots the idea needs and what happens in each. You decide, not the owner — that is the directing. One clear action per shot; a shot runs 3–5 seconds.
3. **Timestamps.** Default duration is **one cut, 15 seconds when no cut spec exists** (Sanji's default; confirm per e-konte board — EP01 cuts follow `show/episodes/EP01/` boards and the board pitch gate). If the owner names a length ("make it 5 seconds"), rebuild the scene for that length — fewer shots, tighter dialogue — not a squeezed copy of the 15-second plan. Roughly: 1–2 shots for 5s, 2–3 for 10s, 3–4 for 15s, 4–6 for 20–30s. Timestamps must tile the duration exactly. Format is 24fps: characters on twos (12 drawings per second) for drama and care-loop moments, on ones (24 drawings per second) for action peaks, on threes only for labelled slow beats.
4. **Camera.** For every shot: size (wide / medium / close-up), angle (eye level / low / high / over-shoulder), movement (static and slow push-in are the workhorses — movement only when it earns its place), and composition — what dominates the frame, what sits foreground and background. Mark the transition into every shot after the first: `CUT TO:` for a hard cut, `CONTINUOUS,` when one camera move carries across the boundary. Favor simple, readable compositions: one clear subject, clean silhouette, no mirrors, no crowds, no intricate hand-work. Visual complexity is where generations fail. Camera moves for Diamond include the orbiting camera (the camera travels around the subject) and the multiplane pan (foreground / midground / background layers moving at different speeds, real parallax). Arena presentation (when a battle scene calls for it): bigger sprites, camera angles/zoom/pan, attack phases (windup, lunge, impact, recoil, return), hit flashes, camera shake — still turn-based underneath, still the same roster.
5. **Actions.** Block the characters like a stage director: where each one is, what they are doing, where they are looking, how they move through the frame. Eyelines and small physical business are what sell the acting. Present tense, concrete verbs. Describe what changes — expression, pose, temporary props — and never re-describe the baseline design the attached bundles already carry. **Presence-first (GAME-BIBLE.md Part I §3):** presence is created FIRST — in lighting, colour, and scenery — and identity is revealed only when it is earned and meant to be seen. If a scene names or explains a thing before the audience has *felt* it in the light and the ground, the scene is built wrong.
6. **Dialogue.** Every line lives inside a timestamp block, never as a separate script. Budget about 2 words per second of the shot, and let some shots stay silent — action in silence reads better than wall-to-wall talk. **Only Mochiko gets Dialogue lines** — she is the only word-voice. Every line ends with her voice reference. Creatures never get Dialogue lines: their meaning is performance + a rationed silent-film intertitle at an important moment only (Show Bible §5 law 2 — subtitles appear ONLY at certain important moments to carry a creature's meaning, then vanish; rationed hard). If no voice reference is held for Mochiko, the line is written as a VOX placeholder and the voice lane owes it — the visual scene does not block on it.
7. **References.** Work out which assets this scene actually needs: the character bundles of everyone on screen, the one location plate closest to the master framing (the camera directions can move within it), props with saved assets, and the voice of anyone who speaks. Name each at its first mention in each shot. Everything else stays home.
8. **Final generation prompt.** Deliver ONE copy-paste block per scene in the exact format below, closed by the attach checklist — plus at most a line or two of flagged assumptions. Never scattered pieces, never an essay after the deliverable.

## Diamond show language (use it, don't flatten it)

Diamond has a SET of universe languages, one per show and per bible — never flattened into one:

1. **PRIMARY — THE GARDEN.** The show itself. A garden of creatures in a hyper-future Japan that runs on care. Warm brand-blue world, gate / pond / green / keeper board / berry store. Runs on the Manual and its Rules.
2. **SECONDARY — THE KEEPER TECH.** Tamagotchi / digicore hyper-pop: little devices, check-ins, feeding rounds, pixel-cute interfaces. Cute is a design system. The eyecatch is a keeper-device check-in.
3. **TERTIARY — PERSONA POP.** Hyper-futuristic Japan graphic pop — one dominant colour per sequence, stylish title cards, UI as performance. Title-card layout is fixed; the logo is never redrawn.
4. **JOJO ART-FORWARD.** Dramatic posing, held tension, menace played straight, sound-effect typography as graphics.
5. **THE DARK FOREST (daylight horror).** Past where the path gives up. The sun is up; the forest floor is in night anyway. No birdsong from inside it. Dread by stillness, never by gore. Anticipation in daylight. What stopped moving in there is an OPEN ITEM — it is not decided, and it will not be invented quietly. The Forest is the most numinous ground in the world: a dual read — the deepest dread and the game's highest luck coexisting — at peak. Its blessings arrive as bent kindness, at first indistinguishable from a haunting, never explained by anyone, and never making the Forest safe.
6. **EXISTENTIAL CHARGE (production-layer only).** Places carry a charge — BLESSED / LUCKY / HAUNTED / CURSED / UNMARKED × faint / settled / deep / peak. The words "existential charge" and "numinous" appear in NO UI string, NO sign, NO in-world speech. In-world, people say what people have always said — a place is blessed, or haunted, or cursed, or lucky — and that is all anyone says. Charge is felt, never itemised: no meter, no tally, no readout, ever. The acceptance test is the owner's, from firsthand play: the player FEELS the magic coming out of the setting.
7. **LIGHTING LAWS (production).** The world clock owns the time-of-day tint. Tint is OUTDOORS-ONLY — it never washes a whole interior. Indoors, daylight enters only through windows, as real light rays: shafts and window-shaped floor patches whose angle, length, and colour derive from the clock's phase. Every interior declares its lighting class: WINDOWED / LOCAL / MIXED / DARK.
8. **THE SECRET (production-layer truth, never an in-world fact).** The world is a computer that grew a wilderness. NO inhabitant knows this. Professor Aeon knows secretly: he may slip and say "the Mainframe," then correct himself to "the mainland" — "the mainland" is the cover word, and the slip-and-correction is the only shape in which the truth may surface in a script. Luigi has a hint, not knowledge: he may circle it, never state it. Villain hacker-speak is double-layered dramatic irony. Production documents may hold the truth; in-world artifacts — place names, signs, dialogue — must not betray it.
9. **RULE 12 (the thesis).** *"Everything in the garden belongs to somebody... And everybody belongs to the Garden."* — warm over the Garden, a warning over the Dark Forest. The show's promise and its threat are the same sentence.
10. **BATTLE DOCTRINE — AUTONOMOUS-ACTION MODEL.** In the SHOW, Mochi fight with their own agency. A battle is a continuous living fight — creatures do not stand idle waiting to be told each move. Rangers sometimes command and direct, but the fight runs between commands and without them: a battle is alive between its decisive beats. (The GAME lane runs the mirror doctrine — command-driven battles where between-command action is non-scoring presentation.) The canon name for the human who commands in battle is RANGERS. "Keeper" is the Garden role only.

**Two languages for smoothness (from the Family Guy research — map which serves which moment in Diamond):**

| Moment | Language | Why |
|---|---|---|
| Dialogue / care-loop moments (Mochiko reading the Manual aloud, Dorowani checking the Manual, keeper-board check-in, feeding rounds) | Family Guy: hand + mouth motion | The acting is in the hands (writing, feeding, checking the device, carrying the Manual) and the mouth (Mochiko's lip sync — she is the only word-voice). Body mostly still. Smooth hand/mouth motion carries the scene. Creatures have no lip sync — their acting is body + sound-free performance. |
| Storytelling / character moments (Mochii's bouncy tour, Gabu's swagger, Kittember's tail-flame flick, Sproutle reading the ground) | Anime: full-body language | Posture, weight, whole-body movement tells the story. The bounce IS the character. |
| Action beats (Gabu's pond-side lunge-and-miss, Wispkin's smoke swirl + float-up, arena battles: windup / lunge / impact / recoil / return) | Anime: full-body + action | Full-body movement, smear frames, impact frames, broken rhythm. Ones (24 dps). |
| Realization / shock (Wispkin's reveal, the Forest stinger) | Anime: full-body + presence-first lighting | Presence is created first in lighting, colour, and scenery; identity is revealed only when earned. The Forest stinger is dread by stillness — hold the shot, let the absence of birdsong and movement do the work. |

**Smoothness = immersion:** smoothness is not one number. It is (a) enough drawings per second that the brain never drops back to seeing stills (12 dps floor, 24 dps for action), (b) deliberate timing per movement (exposure-sheet discipline — every movement gets a frame count, never a guess), (c) squash-and-stretch + follow-through so motion has weight, and (d) the right language per moment (hand/mouth for dialogue and care-loop, full-body for storytelling and action). A flat 2D drawing feels like a real world when NOTHING in the motion reminds the brain it is looking at stills. Family Guy's exact unique-drawings-per-second is NOT established by any source found — do not quote it.

**Tweening, not interpolation — BANNED:** no RIFE, no AI frame interpolation, no pixel blending, no ghostly doubles, smearing, or melting. Tweening is TikTok-trend style: clean, solid, snappy, bouncy drawings moving on a tween curve with squash/stretch and overshoot; each inbetween is a clean solid drawing at a point on the tween curve, never a blend of two keys.

## Output format

ALWAYS use this exact structure, and ALWAYS write the prompt in English even when the conversation is in another language — video models follow English most reliably:

```
SCENE: [short title]
DURATION: [N] seconds
STYLE: full Pokémon-anime production, clean 2D anime cel-shaded, warm brand-blue Garden [from the bible]

[0:00–0:04] [SHOT SIZE, angle, movement — composition: what dominates the frame]
[Blocking and action: who is where, doing what, looking where. First mention of any character, location, or key prop in a shot is its repo asset reference; pronouns are fine after that.]
Dialogue: "[line]" [Voice reference]

[0:04–0:09] CUT TO: [next shot…]   (or "CONTINUOUS," when the camera carries across)

ATTACH:
- [repo path] — character bundle ([name])
- [repo path] — location plate ([which angle/time])
- [repo path] — voice ([name])
- [repo path] — prop ([name])
```

Hard rules, and why each exists:

- **Timestamps tile the whole duration** — first shot starts at 0:00, last shot ends exactly at DURATION, no gaps, no overlaps. Unclaimed seconds get improvised by the model.
- **Every dialogue line ends with the speaker's voice reference.** No exceptions. Mochiko is the only character who gets Dialogue lines. One untagged line is exactly how voices swap halfway through.
- **Dialogue budget: about 2 words per second of the shot.** A 4-second shot holds one short sentence, not two.
- **One location per generation.** A brief in-scene transformation (a flash, the Garden changing around a character) is fine when the transformation *is* the story beat; a sustained move to a second location is a separate scene prompt, cut together in the edit.
- **At most two characters actively doing things per shot.** Others may be present but passive.
- Creatures never get Dialogue lines — their meaning is performance + a rationed intertitle at an important moment only. Their game cry files are NOT show assets and never appear in the attach list (sanitize rule).
- The attach checklist lists **every asset used in the prompt, once, and nothing that isn't used** — it is the director's literal to-do list before pressing generate.
- **Likeness lock holds in every shot.** If a shot drifts (wrong body plan, detached tail flame, unmasked Wispkin in the present day, v1 Mochiko outfit, all-pale batch), the shot is rejected and regenerated — never accepted, never cropped around.
- **No logo is ever generated in-video.** Title cards are composited in post.

## Worked example

Bible excerpt: Gabu (long-armed turtle bruiser; foghorn bellow in the game, never in the show; the muscle; comedy engine), Mochii (round blue drop; bouncing squeak-cry in the game, never in the show; welcome, speed, joy). The pond, day. Prop: the bucket (`show/assets/props/EP01-PROP-bucket-v1.png`) — script V3-018: "his arms are too long for the bucket handle, so the bucket orbits him once per stride like a moon… Not one drop is spilled." Style: full Pokémon-anime production, clean 2D anime cel-shaded, warm brand-blue Garden.

Owner request: *"Gabu carries the bucket to the pond. His arms are too long for the handle, so the bucket orbits him once per stride like a moon, and not one drop is spilled. Mochii bounces alongside trying to keep up."*

```
SCENE: The Bucket Orbit
DURATION: 15 seconds
STYLE: full Pokémon-anime production, clean 2D anime cel-shaded, warm brand-blue Garden

[0:00–0:05] WIDE SHOT, eye level, static — composition: Gabu center frame, pond path behind him, bucket swinging at his side
Gabu strides down the pond path, arms too long for the bucket handle, so the bucket orbits him once per stride like a moon. Not one drop is spilled. Mochii bounces alongside, trying to keep up, half a bounce behind.
Dialogue: (none — the gag is the line; creatures never speak word-dialogue)

[0:05–0:10] CUT TO: MEDIUM SHOT, low angle, slow push-in — composition: the bucket dominates the foreground, Gabu's long arm above it
The bucket swings up and around on its handle pivot, water surface level, catching the pond light. Gabu doesn't look down — he knows exactly where it is. Mochii skids to a stop at the edge of frame, watching the orbit.
Dialogue: (none — performance only)

[0:10–0:15] CUT TO: CLOSE-UP on Gabu, eye level, static — composition: Gabu's face fills the frame, the bucket settling at his side
Gabu stops at the pond edge. The bucket settles, still. He gives one satisfied nod. Mochii bounces in behind him, out of breath, and flops down.
Dialogue: (none — the nod is the line)

ATTACH:
- public/assets/show-bundles/gabu/ — character bundle (Gabu)
- public/assets/show-bundles/mochii/ — character bundle (Mochii)
- show/assets/backgrounds/pond/EP01-PLATE-pond-day-v1-derived-still.png — location plate (pond, day)
- show/assets/props/EP01-PROP-bucket-v1.png — prop (bucket)
```

Notice what the example does: the bucket gets its own prop tag because it is a saved asset and the gag's whole mechanism; the first two shots carry no dialogue because the action is the line; no creature gets a Dialogue line and no cry file is attached (sanitize rule); the hard cut frames the setup and the payoff while the CONTINUOUS orbit carries across the stride; the likeness lock (Gabu's long arms, Mochii's round blue drop body) is carried by the bundle references, never re-described in the action text.

## Bigger than one scene

When the owner describes an episode — several locations, a chain of story beats, more than ~20–30 seconds of action — split it into numbered scenes (`SCENE 1: …`, `SCENE 2: …`), each a fully self-contained prompt with its own duration, timestamps, and attach checklist. Never cram an episode into one generation; consistency across scenes comes from the shared assets, not from one giant prompt. Diamond's episode shape is the 6-beat garden formula (mystery-heart): 1. Arrival/errand at the Gate 2. The oddity 3. Investigation (care-loop tools: feeding, checking, the Manual) 4. False scare 5. Reveal — the creature was never the problem 6. Resolution: a name on the board, a rule learned + tag (gag mechanism). Slot shape (pilot format): cold open at the Gate → title card (Persona pop) → A-part → eyecatch (keeper device check-in) → B-part → tag → STINGER (the Forest, when the season calls for it).

## When a generation goes wrong

The owner will come back with imperfect results. Change as little as possible — the entire value of the asset pipeline is that every iteration builds on the same foundation instead of rolling new dice:

- **Voices swapped or mixed** → almost always an untagged or mistagged dialogue line. Find it, tag it, regenerate. Do not rewrite the scene. (If a creature "spoke," the line was written for a creature — remove it; creatures never get Dialogue lines.)
- **Character drifted** (wrong body plan, detached tail flame, unmasked Wispkin, v1 Mochiko outfit, all-pale batch, glossy-3D look) → confirm the character bundle is attached and named at its first mention in the failing shot; if it already is, add one clarifying detail to that shot ("flame ON THE TAIL TIP, attached") rather than re-describing the whole design. If the likeness still drifts, the shot is rejected and regenerated — never accepted.
- **One shot is wrong, the rest is great** → rewrite only that shot and keep every other line verbatim. Verbatim matters: unchanged text keeps unchanged results plausible.
- **Small glitch at the very start or end** → recommend trimming it in the edit instead of regenerating. A trim is free; a regeneration is a new roll of the dice.
- **"Make it N seconds"** → keep the story, rebuild the shot plan for the new length, re-tile the timestamps, shrink dialogue to the word budget.
- **A cut the owner confirmed good must NOT be extended.** New beats go in a NEW scene, later in the flow — never inserted between confirmed beats. Do not go backwards. Work forward.

Deliver every production prompt in a copy-paste-ready block. The next step is always the same: attach exactly what the checklist says, generate, gate own-eyes against the likeness lock and the e-konte board, and show the owner.

## Sources (clean-room study — method adapted, not copied)

- Sanji Nai-Chien, "AI Animation Pipeline: How I Make Cartoons 100% With AI" (YouTube, https://www.youtube.com/watch?v=JFTe5fbERGg) + his cartoon-scene-builder skill file (Google Drive, free). The directing chain, the Project Bible, the visual-lock field, the timestamp tiling, the dialogue budget, and the fix rules are adapted from his method, rewritten here in Diamond's own words for Diamond's own pipeline. His Higgsfield service, his Leo/Baxter example world, and his 3D Pixar-style line were NOT carried over — Diamond's world, style line, and asset references replace them wholesale.
- Family Guy smoothness research: `~/workspace/_industry-pullin-20261112/stage/research/FAMILY-GUY-SMOOTHNESS.md` — the two-languages map (anime full-body vs Family Guy hand/mouth) and the smoothness-as-immersion mechanism, applied here to Diamond's moments.
- Diamond canon: `GAME-BIBLE.md` (Part I doctrines + Part II Show Bible v1), `show/bible/SHOW-BIBLE.md`, `show/bible/IDENTITY-KIT.md`, `show/bible/WRITING-STANDARD.md`, `show/production/FIRST-START.md`, `show/episodes/EP01/BEAT-SHEET.md`, `show/shared/cast.json`, `docs/human-characters/CANON-HUMAN-CHARACTERS.md`, `docs/human-characters/STYLE-GUIDE.md`, `docs/MOCHII-MOVEMENT-SYSTEM.md`, `docs/direction-unified.md`, `CANON.md`, `SEQUENCE-PLAN.md` — all in repo `mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start`.
- Licence, logged honestly, never a gate: the Pokémon base is design reference; the pret decomp study material is public/open source used for study. Commercial ROMs, official art/music/code, leaked internal files, and purchased game files stay OUT of the public repo (direction-unified.md rule). Sanji's method is clean-room study — adapted, never copied verbatim. Licence status never gates pulling in, wiring up, or using material that helps the work.
