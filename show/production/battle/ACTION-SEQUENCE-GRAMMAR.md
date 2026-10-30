# ACTION-SEQUENCE GRAMMAR — the build order for staging an action sequence in an episode

**What this is:** the one path an episode build follows to stage
an action sequence (a battle, a chase-class set piece, a
signature-move moment). The grammar itself already exists — it
lives in this seat's battle library (63 docs), the posing
system, and the timing seats. Until this file, **no episode
build had ever cited any of it**: measured by the 2026-10-28
canon & craft sweep, 62 of the 63 battle docs were named by no
episode build file at all. This doc wires them into a sequence
an episode can actually consume. It invents no new grammar —
it orders the existing grammar and names the record an episode
files when it uses it.

**Status, honestly:** WIRED, not yet CONSUMED. No episode has
staged a full action sequence yet (EP01 performs zero named
battle moves, by the owner's script). First consumption is the
first episode build that files a sequence sheet (§8) against
this path.

---

## The build order

### 1. Budget the spectacle first — `307-SPECTACLE-DOCTRINE.md`
Spectacle is a budget, spent on purpose or it is noise. The
doctrine fixes the four-class ladder, the per-episode budget,
and the environment-response rule. Decide the sequence's class
and budget before any shot is designed; trailer/promo cuts may
only use climax-class shots that exist as registered
performances (#156 gate, via 307).

### 2. Pick the power family's dialect — the spectacle family
Every power family stages differently (owner doctrine, via
#296): **308-LIGHTNING-SPECTACLE** · **309-WATER-SPECTACLE** ·
**310-STRENGTH-SPECTACLE** · **311-EARTH-SPECTACLE** ·
**312-AERIAL-SPECTACLE** · **313-GHOST-SPECTACLE** ·
**290-SHADOW-MOVES** · **289-FRENZY**. Signature-class work
rides **316-SIGNATURE-SPECTACLE** (over #131's register).
A sequence names its dialect per beat; mixed-family beats name
a primary dialect and subordinate the rest to it.

### 3. Signatures and named moves — `../CANON-SIGNATURE-ATTACKS.md`
A character's signature attack is staged from the signature
seat, with its Mochiichao display name from
`../moves-registry/MOCHIICHAO-NAME-MAP.md` (display names
change; internal ids never do). Move coverage and anatomy
variance are read from **147-MOVE-ANIM-COVERAGE.md** — a move's
animation is anatomy-dependent (performer shape/size/class);
one creature's performance is never treated as the universal
animation.

### 4. Poses and pairing — `../POSING-SYSTEM.md`
Body grammar comes from the posing system: §2.6 (battle
choreography grammar) and Part 3 (the native application —
pose vocabulary per creature type, creature + keeper paired
composition, pose-holds × camera vocabulary). Menace, reveals
and held tension are posed, not improvised per shot.
Contact/defence anatomy for strikes and blocks:
**260-CONTACT-DEFENCE-ANATOMY.md**.

### 5. Motion grammar — smears, timing, floors
**`../SMEAR-FRAME-GRAMMAR.md`** for smear/blink frames;
**`../TIMING-SYSTEM.md`** for the show's timing practice and
**`../animation-method/TIMING-STANDARD.md`** for the floors
(24 fps master; story work largely on 3s with 2s/1s accents —
the industry bar is the floor, not the target). Timing charts
are written before animation, per the method registry.

### 6. Entrances and transitions — how the sequence starts and cuts
**148-BATTLE-INTRO-TRANSITIONS.md** for battle intros;
**`../BOSS-INTRO-FORMAT.md`** for boss-class entrances;
**`../120-CUTSCENE-STAGING.md`** when the sequence is
cutscene-class rather than playable-class. Battle presentation
surface: **BATTLE-FIELD.md**, **BATTLE-UI-FLOW.md**,
**83-BATTLE-SPRITE-PRESENTATION.md**; plates come from
**`../128-BATTLE-PLATES.md`** + `show/shared/PLATES-REGISTRY.md`
(registry-current versions only).

### 7. Script the moves — `MOVE-ANIM-SCRIPT-FORMAT.md`
Each move performance is written as an animscript in the
seat's format (worked example: `animscripts/hydro-rush.animscript.json`).
The script is the buildable artefact: staging, timing and
spectacle class per move, in data — not prose intentions.

### 8. File the sequence sheet — the consumption record
The episode's build package files a **sequence sheet** naming,
per beat: spectacle class + budget line (§1), dialect (§2),
signature/move + animscript (§§3, 7), pose set (§4), timing
chart (§5), intro/transition (§6), plate ids (§6). The sheet
sits with the episode's staging record (the `STAGING-*.md`
pattern in this seat is the staging-note precedent), and the
episode's build package cites this grammar by name. **That
citation is what moves the battle library from written to
consumed** — per the consumption rule registered in
`../animation-method/METHOD-REGISTRY.md` (owner, 2026-10-28).

### Formats that change the shape
Multi-battles **157-MULTI-BATTLE-FORMATS.md** · hordes
**158-HORDE-BATTLES.md** · field duels **210-FIELD-DUELS.md** ·
weather formes/effects **175-WEATHER-FORMES.md**,
**252-WEATHER-BATTLE-EFFECTS.md** · peak transformation
**185-PEAK-TRANSFORMATION.md** · evolution mid-sequence
**228-EVOLUTION-SEQUENCE.md**. These modify the build order;
they do not replace it.

---

*Wired by the canon & craft sweep, 2026-10-28. Registered in
`../animation-method/METHOD-REGISTRY.md`; the spectacle
doctrine's own wiring section points here.*
