# PROJECT BIBLE — Mochiichao Diamond

> The world the `mochiichao-diamond-scene-builder` skill directs inside. Canon sources of truth: `GAME-BIBLE.md` (Part I doctrines + Part II Show Bible v1) and `show/bible/SHOW-BIBLE.md` in repo `mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start` (PUBLIC). If anything here conflicts with those docs, the docs win — flag the mismatch, never propagate it.

## SERIES

- **Logline:** A new keeper arrives at a garden of creatures in a hyper-future Japan that runs on care — and beyond the gate, in full daylight, there is a forest the light doesn't reach.
- **Season shape (series one-line memo):** Mochiko learns the Garden, one creature and one rule at a time, while the Dark Forest keeps not being looked at.
- **Title:** EP01 — "The Garden Has a Ghost."
- **Visual style:** full Pokémon-anime production, clean 2D anime cel-shaded; warm brand-blue Garden; Persona pop (one dominant colour per sequence, stylish title cards, UI as performance); JoJo art-forward posing (dramatic posing, held tension, menace played straight, sound-effect typography as graphics); Tamagotchi / digicore hyper-pop keeper tech (little devices, check-ins, feeding rounds, pixel-cute interfaces — cute is a design system). **Diamond is the 2D old-school line** (LeafGreen/Emerald-style presentation) — never Crystal's 2.5D/3D HeartGold/SoulSilver + Black/White 2 style.
- **Aspect ratio:** 16:9 (plates at 1280×720).
- **Default scene length:** one cut, 15 seconds when no cut spec exists (Sanji method default). EP01 cuts follow the e-konte boards in `show/episodes/EP01/` and the board pitch gate — confirm per board. Format: 24fps; characters on twos (12 drawings per second) for drama and care-loop moments, on ones (24 drawings per second) for action peaks, on threes only for labelled slow beats.
- **Episode shape:** Pokémon showcase × 6-beat garden formula (mystery-heart): 1. Arrival/errand at the Gate 2. The oddity 3. Investigation (care-loop tools: feeding, checking, the Manual) 4. False scare 5. Reveal — the creature was never the problem 6. Resolution: a name on the board, a rule learned + tag (gag mechanism). Slot shape (pilot format): cold open at the Gate → title card (Persona pop, identity-kit layout) → A-part → eyecatch (keeper device check-in) → B-part → tag → STINGER (the Forest, when the season calls for it).
- **The stack (what the show is made of — Jamar, 2026-10-27):** Pokémon (base: keeper-and-creatures bond, creature showcase, the care loop, journey out from a home base); Digimon (partners with inner lives and histories; growth is mutual — the keeper grows as the creatures do, Seki's law); JoJo's Bizarre Adventure (art-forward presentation); Persona 5 (hyper-futuristic Japan graphic pop); Japanese lore & culture (the Garden's bones — a wisp who keeps the night, a forest that behaves like the old stories say forests behave; researched, specific, respectful); Tamagotchi / digicore hyper-pop (the keeper tech).
- **The essence (owner law, 2026-10-27):** Mochiichao — the game and the show — is at its heart and soul an OPEN-WORLD RPG universe, deeper and more open than a Pokémon game, even though it is built on the Pokémon base. Its heart, soul, and mechanics are kin to Fallout, Skyrim, Persona 5, Grand Theft Auto, Red Dead Redemption, Pokémon, Dragon Ball Z: Buu's Fury, and JoJo's Bizarre Adventure. It is one whole world and universe that gets created and can be explored through the show, or the game, or both. When a scope or design choice makes the world smaller, more corridor-like, or shallower than that statement, the choice is wrong by default and the open-world reading wins.
- **One Coin (GAME-BIBLE.md Part I §2):** one world, one universe, one canon, expressed through the game and through the show, built hand in hand. A ruling made in one lane is a ruling in the other, in the same terms. **Diamond feeds Crystal one way:** the good additions built here get ported INTO Crystal to bring it up to par, one at a time, checked as they land. Diamond keeps everything it has; porting never removes anything from Diamond. Crystal keeps everything it receives. Do not merge, swap, or rename the two lines (CANON.md).
- **Sanitize rule (owner law — binding on every scene):** no cries, literal dialogue, logos, or images go in the show. Creatures carry meaning by performance, context, and Mochiko's reactions — never by a cry audio file. Only Mochiko speaks word-dialogue. The official logo is used as-is, never redrawn, never generated in-video (title cards composited in post). No still-image panning/zooming passed off as animation. **OPEN CONFLICT, owner call:** Show Bible §5 law 1 says creatures are "pure cries and sounds only"; the sanitize rule says cries never go in. Both are on record; until the owner reconciles them, scene prompts follow the sanitize rule. Never silently pick one side. Scope of "literal dialogue" is also an owner call — TBD.

## CHARACTERS

### Mochiko — LEAD, the only word-voice
- **Character sheet:** `docs/human-characters/named-canon/media-generation-mochiko-v2-asian-no-tan-0-*.webp` (v2 model sheet; exact file per the pattern in `docs/human-characters/CANON-HUMAN-CHARACTERS.md`). Model sheet only, pending owner OK, then in-game sheet.
- **Likeness lock:** Human, 12, new keeper. East Asian, warm brown skin, dark brown twin tails, teal eyes. **OUTFIT v2 (owner order): dark navy jacket with teal trim, teal skirt over teal leggings, navy sneakers, capsule backpack. NO tan/cream/beige in the outfit — v1 (tan/cream uniform) is SUPERSEDED, kept on disk, not canon.** Audience anchor; reads the Manual aloud.
- **Voice:** PLACEHOLDER — no voice reference held. Mochiko's voice casting is Show Bible §9 open item 2 (owner records? cast? TBD). Never invent a voice.
- **Personality & speech style:** The only word-voice in the show. Reads the Manual aloud. Learns the Garden one creature and one rule at a time. Ranger's verbs only — she puts herself between danger and creatures, spends her own skin before a creature spends more of theirs (see "The Kick at the Docks," `docs/MOMENTS.md`).

### Mochii — round blue drop
- **Character bundle:** `public/assets/show-bundles/mochii/` (rig spec: `show/production/rigs/CAST-RIG-SPECS.md`; scaffold: `show/production/rigs/scaffolds/mochii.rig.json`). Game portrait: `sprite-art/portraits-scripted-v3/mochii-portrait-scripted-v3.png`. Game cry file exists (`public/audio/cries/mochii-cry-r1.wav`) — GAME ONLY, never a show asset (sanitize rule).
- **Likeness lock:** Compact round blue drop body plan. Mochii blue #50b0f0. Welcome, speed, joy; the Garden's heartbeat. Bouncy — always moving, half a bounce behind or ahead.
- **Voice:** none in the show — performance only (sanitize rule; see the flagged conflict above).
- **Personality & speech style:** Excitable, bouncy; gives the tour at high speed. No words, no name-saying — meaning by performance + rationed intertitles only.

### Dorowani — bipedal amphibian, the steady hand
- **Character bundle:** `public/assets/show-bundles/dorowani/` (rig scaffold: `show/production/rigs/scaffolds/dorowani.rig.json`). Game portrait: `sprite-art/portraits-scripted-v3/dorowani-portrait-scripted-v3.png`. Avatar-stack animations (frame-verified living proofs): `show/assets/animations/dorowani-avatar-stack/` — idle, working, making_something, milestone_level_up (mp4 + transparent webm). Game cry file exists (`public/audio/cries/dorowani-cry-r1.wav`) — GAME ONLY.
- **Likeness lock:** Bipedal amphibian, red fin cheeks, shell. Dorowani body #30b0d0, belly #d0f0f0, deep #3070b0; accent red #a03436 for fins/eyes/alerts ONLY. Carries the Manual. 3D model is the master (via Tripo) — renders baked to 2D sheets; the show never sees the difference.
- **Voice:** none in the show — performance only.
- **Personality & speech style:** Steady hand; thesis keeper. Checks the Manual before acting. Low, steady presence — the one who says "Rule 12. You belonged here the whole time."

### Gabu — long-armed turtle bruiser, the comedy engine
- **Character bundle:** `public/assets/show-bundles/gabu/` (rig scaffold: `show/production/rigs/scaffolds/gabu.rig.json`). Game portrait: `sprite-art/portraits-scripted-v3/gabu-portrait-scripted-v3.png`. Game cry file exists (`public/audio/cries/gabu-cry-r1.wav`) — GAME ONLY.
- **Likeness lock:** Long-armed turtle bruiser, bulky body plan. Confidence without plans; the muscle. 3D model is the master (via Tripo) — renders baked to 2D sheets.
- **Voice:** none in the show — performance only.
- **Personality & speech style:** All confidence, no plan. Volunteers as ghost-catcher. The bucket-orbit gag (V3-018): his arms are too long for the bucket handle, so the bucket orbits him once per stride like a moon — not one drop spilled. Keeps the ghost-catcher net as a hat after EP01.

### Kittember — black cat, the sensor
- **Character bundle:** `public/assets/show-bundles/kittember/` (rig scaffold: `show/production/rigs/scaffolds/kittember.rig.json`). Game portrait: `sprite-art/portraits-scripted-v3/kittember-portrait-scripted-v3.png`. Game cry file exists — GAME ONLY.
- **Likeness lock:** Small feline, black cat. **Flame ON THE TAIL TIP, ATTACHED (owner canon)** — never free-floating, never on the head, never detached. Species default is quadrupedal; the BIPEDAL Kittember is a special-case wild individual (Mochiko's first wild Kittember encounter: stare-down in the woods, vanishes, reappears, battle + capture, joins the team) — use the bundle that matches the scene's canon beat.
- **Voice:** none in the show — performance only.
- **Personality & speech style:** Sensor; the tail flame reacts before anyone sees. Thin, watchful presence. The flame flickering at nothing is the oddity that starts an investigation.

### Sproutle — plant biped, the noticer
- **Character bundle:** `public/assets/show-bundles/sproutle/` (rig scaffold: `show/production/rigs/scaffolds/sproutle.rig.json`). Game portrait: `sprite-art/portraits-scripted-v3/sproutle-portrait-scripted-v3.png`. Game cry file exists — GAME ONLY.
- **Likeness lock:** Plant biped. Reads the ground; gentle courage.
- **Voice:** none in the show — performance only.
- **Personality & speech style:** Noticer; reads the ground. Sees the pattern — the moved things spell a wobbly arrow to the pond. The sprout silhouette is the false-scare gag (a tall shadow that is only Sproutle).

### Wispkin — dark wisp, the night keeper (EP01's heart)
- **Character bundle:** `public/assets/show-bundles/wispkin/` (rig scaffold: `show/production/rigs/scaffolds/wispkin.rig.json`). Game portrait: `sprite-art/portraits-scripted-v3/wispkin-portrait-scripted-v3.png`. Flashback asset: `show/assets/flashback/wispkin-premask-float.mp4`. Game cry file exists — GAME ONLY.
- **Likeness lock:** Dark wisp over smoke. **Wears a SKULL MASK (owner canon).** Pre-mask Wispkin appears in flashback ONLY — never show the unmasked face in the present-day Garden. Night keeper; the Garden's secret shift. Too shy to say hello in daylight — it moved things to get Mochiko's attention; it has been keeping the garden alone and wanted to be introduced properly.
- **Voice:** none in the show — performance only.
- **Personality & speech style:** Whisper-quiet presence; smoke swirl + first full float-up is the reveal beat. Gets its name on the keeper board at the resolution.

### Full roster
- **47 species** — source of truth `src/data/core/species.json` (roster index `src/lib/global_roster.json`; two-way cast index `show/shared/cast.json`, which seeds the principal cast above). **Digimon rotation law:** featured sequences distribute evenly across the cast across a season; the featured species is fixed at planning (Pokémon meeting rule) and tracked in the season grid.
- **Human cast** — `docs/human-characters/CANON-HUMAN-CHARACTERS.md` (Mochiko, Hex, Prof. Aeon, Mom, players A–D, Falk, dojo/elite cast). **Diversity rule (standing, do not overwrite):** no character defaults to white / pale skin; every new character gets a named race/ethnicity; the cast as a whole must be varied (Black, East Asian, Latina/Mexican, and other backgrounds). Player characters already varied: A Black, B East Asian, C Latina, D white/blonde — D is ONE option, not the default. If a batch comes back all-pale, it is a failed batch: redo it.
- **Falk** — owner-locked model sheet `docs/human-characters/falk-model-sheet-OWNER-LOCKED-2026-10-27.webp` + walk-cycle sheets (`falk-walk-sheet-FULLSIZE-2026-10-27.webp`, direction steps). Full likeness details: TBD — read `docs/human-characters/FALK-CANON-RECORD-2026-10-27.md` before directing a Falk scene; do not invent from the filename.
- **Professor Aeon** — Black older professor (v2 primary), dark brown skin, grey afro + grey beard, round glasses, white lab coat over teal tech suit, data tablet. v1 (pale) kept as a VARIANT only. Knows the Secret secretly: may slip and say "the Mainframe," then corrects himself to "the mainland" — the slip-and-correction is the ONLY shape in which the truth may surface in a script.
- **Hex (rival)** — Black (v2 primary), dark brown skin, black hair with purple streak, amber eyes, black/purple high-collar jacket. v1 (pale) kept as a VARIANT only.
- **Mom** — VARIABLE, not a fixed race: her race varies with the player character picked (same outfit/personality, low bun, teal apron, mug). Build as a VARIANT SET, not a single fixed sheet. Whether the player gets a separate "select your parents' race" option: OPEN, owner undecided.
- **Players A–D (locked art style anchors):** A — Black, short curly afro, teal/chrome jacket, cargo pants, wrist data-device (acceptable second anchor). B — East Asian, tall slim, navy/green (outfit + face/hair correction owed; NOT OK for in-game sheets yet). C — Latina, orange/cream windbreaker (face/hair correction owed; NOT OK yet). D — white/blonde, spiky blonde hair, goggles, purple/silver tech vest, data tablet — LOCKED, primary anchor. In-game sheets exist only for pieces the owner has OK'd (D full, A full).
- **Luigi** — has a hint of the Secret, not knowledge: he may circle it, never state it.
- **The Hacker cell leader (Stoneport docks)** — personal name is a NAME GAP (owner slot; `docs/MOMENTS.md` M1 "The Kick at the Docks"). Never invent a name for him. Antagonist of R1-BEAT4.
- **Locked human art style (use this exact block in every future prompt):** Clean 2D anime cel-shaded game art, full-body front view, standing pose, plain light grey background, character centred head to feet. Faces: large expressive anime eyes with clean highlights, small nose, small mouth, clean dark outlines, face about 1/6 to 1/7 of body height, youthful trainer proportions (about 6–7 heads tall). NO soft realistic rendering, NO small narrow realistic eyes, NO wide realistic smile with detailed teeth, NO painterly skin shading. Hair: clean anime hair — bold separated strands / spikes / curls with dark outlines and flat colour + simple highlight, NOT soft realistic wavy hair, NOT a loose realistic braid mass. Hair shape must read as a silhouette at sprite size. Bodies/outfits: clean flat colours + simple cel shading, dark outlines, techwear with chrome/silver accents and simple circuit/panel details. Outfits readable at small size: one jacket/vest, one trouser, one shoe — NO layered shorts-over-leggings, NO crystal backpack pods, NO stacked gimmick accessories.

## LOCATIONS

### The Garden — home base
- **Plates:** gate `show/assets/backgrounds/gate/EP01-PLATE-gate-v1-still-1280.png` (+ dawn derived `EP01-PLATE-gate-dawn-v1-derived-living.mp4` / still); pond `show/assets/backgrounds/pond/EP01-PLATE-pond-day-v1-derived-still.png` (dawn + dusk variants in the same folder); green `show/assets/backgrounds/green/EP01-PLATE-green-day-v1-derived-still.png`; berry store `show/assets/backgrounds/berry-store/EP01-PLATE-berry-store-v1-still.png`.
- **Mood & lighting:** Warm brand-blue world (identity-kit palette: brand blue #70b0d0, light #b0d0f0, mid #90b0d0, ink #101010). Gate, pond, green, keeper board, berry store. Runs on the Manual and its Rules. One dominant colour per sequence. World clock owns the time-of-day tint; tint is OUTDOORS-ONLY.
- **Canon:** "Everything in the garden belongs to somebody... And everybody belongs to the Garden." (Rule 12.)

### The Gate — the threshold
- **Plates:** same gate plates as above (day + dawn).
- **Mood & lighting:** Everything crosses here: arrivals, introductions, names on the board. Cold opens happen at the Gate.
- **Canon:** Proper introductions happen at the gate sign; Wispkin gets its name on the keeper board here.

### The Dark Forest — daylight horror
- **Plates:** `show/assets/backgrounds/dark-forest/EP01-PLATE-dark-forest-day-v1-still.png` (+ `EP01-PLATE-dark-forest-day-v1-STILL.mp4`).
- **Mood & lighting:** Past where the path gives up. A horror of **anticipation in daylight**: the sun is up; the forest floor is in night anyway. No birdsong from inside it. Dread by stillness, never by gore. The most numinous ground in the world: a dual read — the deepest dread and the game's highest luck coexisting — at peak. Base charge ONLY, no drift; the depths spawn table stays EMPTY (0 rows). Its blessings arrive through DREAD mediation: bent kindness, at first indistinguishable from a haunting, never explained by anyone, and **never making the Forest safe**.
- **Canon:** What stopped moving in there in EP01 is an OPEN ITEM (Show Bible §9 item 1) — it is not decided, and it will not be invented quietly. The Forest's in-world name (if it has one): OPEN ITEM (§9 item 4). The Forest is charge-extreme, NOT a legendary site, unless the owner says so. Legendary sites (peak class, bound to a one-time event) ship with ZERO instances — no legendary site exists in canon until the owner rules one.

### The wider world — hyper-future Japan
- **Plates:** TBD — grows per season grid, Pokémon-style. Enters the show as the keeper tech, visitors, and journeys out. Game-side locations (towns, dojo, arena, Stoneport docks) exist in the game's world; show plates for them are made when a scene needs them, never invented ahead of the bible.
- **Mood & lighting:** TBD per location. The Stoneport docks (working hours, gulls and forklifts) are the setting of "The Kick at the Docks" (`docs/MOMENTS.md`).
- **Canon:** The region reads IRIDESCENCE on every map and sign, whatever it is called in the production room (the Secret's cover).

## PROPS

- **The Manual (keeper's manual):** Dorowani carries it. The Rules live in it. Mochiko reads it aloud. — Asset path: TBD (no saved Manual prop found in `show/assets/props/`; mark the exact path when it lands — never invent one).
- **Keeper board:** names on the board — Wispkin's name goes on it at the EP01 resolution. — Asset path: TBD (created as a reusable EP01 asset per the beat sheet; exact path not verified in this pass).
- **Garden gate sign:** proper introductions happen here. — Asset path: TBD.
- **Tool rack / aligned tools:** `show/assets/props/EP01-PROP-tool-rack-v1.png` — timber pond-side rack, five pond tools hung in a row, every handle top flush on one line. The alignment IS the story (V3-056: "handles aligned, in a row like type in a case" — evidence of the night keeper's tidiness). Registry: `show/assets/props/PROPS-REGISTRY.md`.
- **Bucket:** `show/assets/props/EP01-PROP-bucket-v1.png` — tapered galvanised bucket, full of pond water, raised swing handle on two lugs. The handle is a story part (V3-018: the bucket orbits Gabu once per stride like a moon; not one drop spilled). Composite it swinging from the handle pivot, water surface level.
- **Moth:** `show/assets/props/EP01-PROP-moth-v1-SPEC.md` — spec only; asset status TBD.
- **Cold-spot trail FX:** reusable EP01 asset (trail of cold spots spelling a wobbly arrow to the pond). — Asset path: TBD.
- **Wispkin smoke cycle:** reusable EP01 asset. — Asset path: TBD.
- **Keeper device (digicore unit):** the eyecatch is a keeper-device check-in. Design is Show Bible §9 open item 5 (bible art pass) — TBD.
- **Luigi Cubes:** capture devices (game: Trainer Mode catch). Show use: TBD.
- **All props:** flat cartoon style, transparent background, **no baked ground/contact shadow** (shadows are a compositing step).

## UNIVERSE LANGUAGES (one set, never flattened)

1. **PRIMARY — THE GARDEN.** The show itself. Hyper-future Japan that runs on care.
2. **SECONDARY — THE KEEPER TECH.** Tamagotchi / digicore hyper-pop. Cute is a design system.
3. **TERTIARY — PERSONA POP.** One dominant colour per sequence, stylish title cards, UI as performance. Title-card layout fixed; logo never redrawn.
4. **JOJO ART-FORWARD.** Dramatic posing, held tension, menace played straight, sound-effect typography as graphics.
5. **THE DARK FOREST (daylight horror).** Anticipation in daylight; dread by stillness, never gore.
6. **EXISTENTIAL CHARGE (production-layer only).** BLESSED / LUCKY / HAUNTED / CURSED / UNMARKED × faint / settled / deep / peak. Felt, never itemised. Production words never in UI, signs, or in-world speech.
7. **LIGHTING LAWS (production).** World clock owns the tint; tint outdoors-only; indoors daylight only through windows (shafts + floor patches); interiors declare WINDOWED / LOCAL / MIXED / DARK.
8. **THE SECRET (production-layer truth, never an in-world fact).** The world is a computer that grew a wilderness. "The mainland" is the cover word. Aeon's slip-and-correction is the only shape in which the truth may surface in a script.
9. **RULE 12 (the thesis).** The show's promise and its threat are the same sentence.
10. **BATTLE DOCTRINE — AUTONOMOUS-ACTION MODEL.** Show battles are continuous living fights; creatures fight with their own agency. Rangers sometimes command; the fight runs between commands and without them. Canon term for the human who commands in battle: RANGERS. "Keeper" is the Garden role only.

## EPISODE NOTES

- **EP01 "The Garden Has a Ghost"** — ~6 minutes · Cast: Mochiko + pilot six · Locations: Garden Gate, Garden Pond, Garden Green (battle-bg-garden) · Featured species: **Wispkin**. 6-beat engine: 1. Arrival (0:00–1:00) — Mochiko's first morning; Mochii gives the tour at high speed; Dorowani carries the Manual. 2. The oddity (1:00–1:45) — berries un-stacked; a toy rolls uphill; Kittember's tail flame flickers at nothing. 3. Investigation (1:45–3:15) — Gabu volunteers as ghost-catcher; Dorowani checks the Manual: "Garden Rule 12: everything in the garden belongs to somebody." Footprints? No — a trail of cold spots; Sproutle notices the pattern: the moved things spell a wobbly arrow to the pond. 4. False scare (3:15–4:15) — pond at dusk; Gabu's big grab catches only smoke; Kittember's tail flame flares; a tall shadow looms (Sproutle's sprout silhouette, gag); then the real shape: small, dark, shaking. 5. Reveal (4:15–5:15) — Wispkin, the night keeper, too shy to say hello in daylight; Dorowani: "Rule 12. You belonged here the whole time." 6. Resolution + tag (5:15–6:00) — proper introductions at the gate sign; Wispkin's name on the keeper board; tag: Gabu still wearing the ghost-catcher net as a hat. He keeps it. **Action beats (motion budget):** (A) Beat 3 — Gabu's pond-side lunge-and-miss, full-body. (B) Beat 5 — Wispkin's reveal: smoke swirl + first full float-up. **Stinger:** after the tag, cut to the DARK FOREST in full daylight — light that doesn't reach in, no birdsong, suspense held on stillness. The Rule 12 line appears as a SUBTITLE over the forest and holds. What stopped moving in there is NOT shown in EP01. Shooting script v3 + beat sheet + colour script + generation package: `show/episodes/EP01/`.
- **M1 "The Kick at the Docks" (Season 1, `docs/MOMENTS.md`):** Stoneport docks, working hours. The Hacker cell leader (name GAP — never invent) kicks a netted Tiidebiite pup without stopping his sentence. Mochiko puts herself between the man and the net, works the net loose with her teeth in the cord, takes the pup's panic-snapping on her own sleeve, lets it bolt into the harbour water; it bites her hand on the way out and she lets it. Button: *"It likes you."* The foreman becomes a quiet ally from this scene on. Mochiko carries a small scar and a new fact about herself. Licence: exception shape 4 — cruelty of opportunity, under the organised-villain clause (doctrine: `docs/THE-RULE.md`; count: `docs/DOSE-LEDGER.md`).
- **Voice refs held: 0.** No voice reference held for any character (cast.json `voice_entry: null` across the principal cast). Voice tags in any scene prompt are PLACEHOLDERS until the owner approves a reference per character. Never invent a voice.
- **Animation law (Show Bible §5 law 6, FIRST-START.md §3):** only frame-verified real performance counts as animation. No slideshows, ever. Characters in the playable path are animated sprites — idle stance and 4-direction walk cycles from real sprite assets. Static cutouts and whole-sprite bob/tilt/zoom do not count.
- **Follower system (game-side, `docs/MOCHII-MOVEMENT-SYSTEM.md`):** the lead partner walks with the Ranger — command-buffer replay, follower replays the Ranger's exact path one step behind once at least two steps are buffered; follower speed always equals Ranger speed. Species × place permission lives in map data (allow / height_restrict / prevent); the exception list ships EMPTY — entries are canon rulings, never inferred.
- **A cut the owner confirmed good must NOT be extended.** New beats go in a NEW scene, later in the flow — never inserted between confirmed beats. Work forward.
- **Skin-tone lock:** never whitewash/lighten any character. **Body fidelity:** draw the person's real build, never slim. **Diversity rule:** no character defaults to white/pale; if a batch comes back all-pale, it is a failed batch.

## OPEN ITEMS (never filled in silently — Show Bible §9 + this lane's gaps)

1. What stopped moving in the Dark Forest (EP01 stinger).
2. Mochiko's voice casting (owner records? cast? TBD).
3. Season length + episode runtime beyond the pilot format.
4. The Forest's name in-world (if it has one).
5. Keeper device design (digicore unit) — bible art pass.
6. Whether the Manual's other Rules get written before EP02.
7. **CLOSED (owner lock, 2026-10-27):** the canon term for the human who commands in battle is RANGERS (game data said "trainers"; the Garden role is "keeper").
8. **Sanitize-rule vs voice-law conflict (this lane, 2026-11-12):** Show Bible §5 law 1 says creatures are "pure cries and sounds only"; the owner's sanitize rule says cries never go in the show. Owner call — do not resolve silently.
9. **Scope of "literal dialogue" in the sanitize rule** — owner call; scene prompts keep Mochiko's lines short and Manual/Rule-carrying until ruled.
10. **Exact asset paths TBD:** the Manual prop, keeper board, garden gate sign, cold-spot trail FX, Wispkin smoke cycle (all created or specced for EP01; exact repo paths not verified in this pass — verify against `show/shared/parts-catalog.json` and `show/assets/README.md` before citing in a prompt).
11. **Falk's full likeness details** — read `docs/human-characters/FALK-CANON-RECORD-2026-10-27.md` before directing a Falk scene.
12. **Default cut length** — 15s is the method default; EP01's per-cut lengths live on the e-konte boards (`show/episodes/EP01/`); no repo-wide default cut length was found in the docs read for this bible. Confirm per board.
13. **Dojo leader NAME GAPs** (game dialogue spine, `src/lib/wiring/dialogue/`) stay flagged; they are the owner's calls.
