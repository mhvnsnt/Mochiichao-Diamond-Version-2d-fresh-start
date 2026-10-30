# Assets + Code Fill Plan — sprites, music, code, with licences

World Builder lane, 2026-10-25. This is the fill plan
for the slots named in story-fill-region1.md and
story-fill-regions2-5.md. Template source: reference
games' system shapes (map + NPC + event + battle +
dialogue), plus open-source and industry-standard
practices (Tiled maps-as-data, JSON data files,
CC0 / CC-BY asset packs). No commercial game's
sprites, music, code, or dialogue are in here.

## 1. Sprites — open source first, Mochiichao restyle second

Rule, from the earlier open-source pull: Kenney first,
CC0, no attribution required, but restyle to the
Mochiichao palette (teal / cream / data-blue, Y2K
panels) — do not drop raw generic art in unstyled,
or the game drifts.

| Slot | Pack | Licence | Use in Mochiichao |
| Town exteriors, houses, roads | Kenney Tiny Town / Tiny City, 16x16, 130+ files (Tiny City) | CC0, no attribution required | Sector 0, Silicon Town, Stoneport, Neon, all town exteriors, restyled |
| Interiors, furniture, props | Kenney Furniture Kit | CC0 | House 1F/2F, MochiiPlex, dojo interiors, mansion, Hall |
| Caves, dungeons, rift | 0x72 DungeonTileset II | CC0 | Cave of Echoes, Signal Tunnel, Rift dungeon, Victory Route |
| UI panels, buttons, bars | Kenney UI Pack | CC0, structural reference only in earlier work | Dialogue box, menu windows, already used as structure, not raw art |
| Farm, village, beach, water | Free top-down town tileset, itch.io (reodesuxz, earlier pull) | Free for commercial use, credit not required, no redistribution / resale of the pack itself | Preserve, Data Isles, beach routes — use tiles in game, do NOT put the raw ZIP in the public repo |
| Icons, items, tech icons | game-icons.net | CC BY 3.0, attribution required if used | Capture Cube, Sprint Boots, tech icons — attribute in credits, or draw Mochiichao-original icons instead |
| LPC / OpenGameArt tiles | LPC, OpenGameArt | Commonly CC-BY-SA + GPL, share-alike travels | DESIGN REFERENCE ONLY until a licence decision in main — do NOT vendor LPC art / code into the public repo without that decision |

Creature sprites: NOT from any pack above. Creature
sprites are Mochiichao-original, from the Sprite Art
lane (roster sheets, Dorowani / Gabu 3-sheet sets
already verified locally). No pack above is a creature
substitute. Human sprites: Human Characters lane
(Aeon, Mom, Hex, Lin, Falk, etc.), not a pack.

Sprite code slot: one atlas per theme (town, cave,
interior), texture filtering nearest, integer scaling
for pixel art, no resampling blur. Record the atlas
name in the PR, per map.

## 2. Music — open source first, no commercial tunes

No commercial game's music, melody, or arrangement
is in here. Music slots map to CC0 / credit-required
chiptune packs, with the licence checked at download
time (licences on itch.io pages change — re-check
before shipping, do not ship on a search snippet alone).

| Scene | Pack / slot | Licence (as found 2026-10-25) | Notes |
| Title, town, route, forest, harbour, neon, cave, elite, champion, ending | hyperpixel — 33 Free Chiptune Loops | CC0 1.0, no credit / royalty required, seamless loops | Best first pick for loops: town, route, cave, battle, boss — pick loop by mood, not by title, and record the loop name in the PR |
| Title, town, battle, boss | Tallbeard / Abstraction — Free Chiptune Music Loops / Three Red Hearts | CC0, no credit required (artist asks for a credit as "Abstraction", not a licence requirement) | Second CC0 pick, same rule: record loop name, do not resell unmodified |
| Town, forest, neon city, starship / airship, victory jingle | Quillbit Chiptune Free Sampler (9 tracks: 6 loops + 3 jingles) | Free for commercial games WITH credit: "Music: Quillbit Chiptune (quillbit-type.itch.io)" | Use only if the credit is added to the game's credits screen — do not use without the credit |
| Town, battle, boss, title | Vacuous BGM — 8BIT GAME BGM Vol.01 (12 tracks, loop-ready) | Free for commercial / non-commercial indie use WITH credit: "BGM: 8BIT GAME BGM Vol.01 — Vacuous BGM" | Same credit rule as Quillbit |
| Town, battle, boss (sampler) | jlim 8-Bit Sampler (4 tracks: town / mystery / arcade / boss) | Royalty-free, no credit required, resale / redistribution as-is prohibited | Sampler only — full packs are separate, do not assume the sampler covers the whole game |

Music code slot: one audio manager, one loop per
scene, crossfade on map change, battle loop overrides
route loop, victory jingle on win, no music change
on dialogue alone. Music is 0% wired in the current
game (no audio system in the spec yet) — that is a
code gap, not a music gap, and it is listed in §4.

## 3. Code — templates, not copied code

Industry-standard shape, already used in this game:
maps as data (FULL_WORLD), events as data (npcs /
events / doors / exits), dialogue as data (dialogue
strings in map data or a dialogue file), battles as
a view (BattleView), save as slots (SaveMenu).
Do not copy a reference game's code — use the game's
own WorldEngine / BattleView / DialogueBox shapes,
and extend them only where a new behaviour is needed.

Map template (apply-ready JSON shape, original):
{
  "id": "sector0_house_2f",
  "name": "Sector 0 — Your Room",
  "tiles": "interior_house",
  "spawn": {"x": 6, "y": 6},
  "npcs": [
    {"id": "mom", "x": 8, "y": 4, "dialogue": ["…"] }
  ],
  "exits": [
    {"x": 10, "y": 2, "to": "sector0_house_1f", "enterAt": {"x": 10, "y": 2}}
  ],
  "signs": [
    {"x": 1, "y": 1, "text": "PC — check your storage."}
  ],
  "music": "town_loop_cc0",
  "spriteAtlas": "interior_house"
}

NPC event template (original):
- talk: dialogue array, in order, no battle.
- battle: trainer class, AI profile (see wiring master
  §8), team (roster IDs only, levels), reward, defeat
  flag, after-dialogue.
- gate: condition (flag / badge / tech), blocked
  dialogue naming the requirement, open dialogue
  when the condition is met.
- heal: full party heal, free.
- shop: shop list ID, buy / sell confirm.

Dialogue template (original):
- One dialogue box, one speaker name, lines in order,
  advance on input, no auto-advance, no skipping
  past a gift / flag (gift / flag fires after the
  last line, not before).
- Rival name, player name, and creature name are
  substituted from the save, never hard-coded in
  the dialogue text.

Trainer AI template (original, see wiring master §8):
- profile: novice / balanced / type-aware / defensive /
  aggressive / elite.
- move pick: highest-power, super-effective first
  (type-aware and above), defensive move below half HP
  (defensive and above), switch on type disadvantage
  (type-aware and above), item once per battle
  (defensive / aggressive / elite, recorded per boss).

## 4. What is still 0% — code, not writing

- Audio system: 0/1 = 0% wired. Music packs are
  named, the audio manager is not built.
- Regions 2–5 town-by-town dialogue: 0/4 regions = 0%
  fully dialogued (outlines done, dialogue not).
- Trainer teams for Regions 1–5 beyond Route 1.0 /
  Dojo 1 outline: ROSTER GAP, not invented.
- Dojo / Elite / Champion names for Regions 2–5:
  NAME GAP, not invented.
- Creature sprites for new roster species: Sprite Art
  lane, not this lane, and not from a pack.

When a gap is filled, remove it from this plan in
the next version, with the PR number that filled it.
A placeholder is labelled placeholder until then.
