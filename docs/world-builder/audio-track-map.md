# Mochiichao Audio Track Map — slots, packs, credits

World Builder lane, 2026-10-25. Companion to `audio-system.ts`.
This map names a *slot* for every scene. It does NOT claim any
track is in the game: every slot's file is `null` in the
registry until main downloads a loop, re-checks its licence,
and calls `audio.registerFile(scene, url)`. Until then the
game plays the original synth fallback in `audio-system.ts`,
so it works with zero audio files.

## Licence rule — read before downloading anything

- Re-check the licence on the pack's own page at download
  time. Licences on itch.io / OpenGameArt pages change, and
  a search snippet is not a licence. If the page at download
  time says something different from the table below, the
  page wins — record the new terms in the PR, do not ship
  on the old table.
- CC0 = no credit required, no royalty, may be modified.
  Giving a credit anyway is polite, not required.
- Credit-required = the game may use the track ONLY if the
  exact credit string below is on the game's credits screen.
  No credit on screen = do not ship that track.
- Never ship a commercial game's track, melody, or sample.
  If a downloaded loop turns out to be one, remove it and
  fall back to synth. Do not rename it and keep it.
- Do not resell or redistribute a pack's files as-is where
  the pack forbids it (jlim sampler: resale / redistribution
  as-is prohibited — use in the built game only).

## Packs, in priority order (CC0 first)

| Priority | Pack | Licence as found 2026-10-25 | Exact credit string (if any) | Use for |
| 1 | hyperpixel — 33 Free Chiptune Loops (itch.io) | CC0 1.0, seamless loops, no credit / royalty required | — (none required) | Default for almost every scene: title, town, route, forest, cave, harbour, dojo, tower, lake, snow, sea, dive, garden, creature |
| 2 | Tallbeard / Abstraction — Free Chiptune Music Loops / Three Red Hearts (itch.io) | CC0, no credit required (artist asks for credit as "Abstraction", not a licence requirement) | "Abstraction" (courtesy, not required) | Victory Route, Plateau, ending, second CC0 pick when hyperpixel has no fitting mood |
| 3 | Quillbit Chiptune Free Sampler — 9 tracks, 6 loops + 3 jingles (itch.io) | Free for commercial games WITH credit | `Music: Quillbit Chiptune (quillbit-type.itch.io)` | Neon City, ferry, airship — only if the credit is added to the credits screen |
| 4 | Vacuous BGM — 8BIT GAME BGM Vol.01 — 12 loop-ready tracks (itch.io) | Free for commercial / non-commercial indie use WITH credit | `BGM: 8BIT GAME BGM Vol.01 — Vacuous BGM` | Arena, tournament, Region 3 arena, Region 5 tournament — only if the credit is added |
| 5 (sampler only) | jlim — 8-Bit Sampler, 4 tracks (town / mystery / arcade / boss) | Royalty-free, no credit required; resale / redistribution of the files as-is prohibited | — (none required) | Sampler / prototype only; do not assume it covers the whole game |

Not used, and why: LPC / OpenGameArt music with CC-BY-SA /
GPL share-alike terms is reference-only until main makes a
licence decision — do not vendor it on the basis of this map.

## Scene -> slot -> pack (Region 1 + shared)

| Scene (SceneId) | In-game place | CC0-first pack | Credit alternative | Synth fallback |
| title | Title screen | hyperpixel | — | calm |
| intro | Aeon intro / truck intro | hyperpixel | — | calm |
| house | House 1F / 2F, outpost bedroom | hyperpixel | — | calm |
| lab | Aeon's Lab, Region 3 lab | hyperpixel | — | calm |
| town | Sector 0, Silicon Town, all Region 1 towns | hyperpixel | Quillbit (town loop) | bright |
| route | Route 1.0 and all Region 1 routes | hyperpixel | — | bright |
| forest | Binary Woods | hyperpixel | Quillbit (forest loop) | calm |
| cave | Cave of Echoes, Signal Tunnel | hyperpixel | — | tense |
| harbour | Stoneport, Harbor City | hyperpixel | — | bright |
| neon | Neon City | hyperpixel (first) | Quillbit (neon city loop) | bright |
| dojo | All dojos (interior) | hyperpixel | — | tense |
| tower | Pale Town tower, memorial towers | hyperpixel | — | tense |
| market | Market City, shops | hyperpixel | — | bright |
| preserve | Harbor preserve / safari | hyperpixel | — | calm |
| island | Ember Island, Seven Data Isles | hyperpixel | — | calm |
| victory_route | Victory Route (all regions, default) | Tallbeard | — | tense |
| plateau | Mainframe Plateau (all regions, default) | Tallbeard | — | boss |
| hall | Hall of Records | hyperpixel | — | calm |
| garden | Mochi Garden | hyperpixel | — | bright |
| arena | Mauveville Arena, Arena Mode | hyperpixel (first) | Vacuous (battle) | battle |
| creature | Creature Mode overworld | hyperpixel | — | battle |
| ferry | Data Ferry, Region 1 -> 2 | hyperpixel (first) | Quillbit (starship / sailing loop) | bright |
| airship | Region 3 -> 4 airship | hyperpixel (first) | Quillbit (starship loop) | bright |
| sea | Sea routes (all regions, default) | hyperpixel | — | calm |
| dive | Deep-Dive areas (all regions, default) | hyperpixel | — | tense |
| tree_city | Fortree-shape tree cities | hyperpixel | — | calm |
| crater | Sootopolis-shape crater city | hyperpixel | — | tense |
| rift | Umbral Rift | hyperpixel | — | tense |
| snow | Snow routes, Frost Peak | hyperpixel | — | calm |
| lake | Lakes, guardians | hyperpixel | — | calm |
| lighthouse | Glitter Lighthouse | hyperpixel | — | bright |
| tournament | Grand Tournament | hyperpixel (first) | Vacuous (boss / battle) | battle |
| ending | True ending, credits | Tallbeard | — | calm |

## Scene -> slot -> pack (Regions 2–5 equivalents)

These slots exist so a region can swap its loop later without
touching Region 1's mapping. Default behaviour until a region
picks its own loop: main may map a region scene to its shared
equivalent (e.g. `r2_town` -> the same file as `town`), or
register a different loop for it. Either way, record the choice
in the PR — do not silently reuse a credit-required track for
a second scene without checking its credit still covers it.

| Scene | Region / place | CC0-first pack | Credit alternative | Synth fallback |
| r2_town | Dawnfield, Region 2 towns | hyperpixel | — | bright |
| r2_forest | Ilex Forest | hyperpixel | — | calm |
| r2_tower | Burned Tower, Sprout Tower | hyperpixel | — | tense |
| r2_lighthouse | Glitter Lighthouse | hyperpixel | — | bright |
| r2_lake | Lake of Rage-shape | hyperpixel | — | calm |
| r2_snow | Frost Peak | hyperpixel | — | calm |
| r3_sea | Region 3 sea routes | hyperpixel | — | calm |
| r3_dive | Region 3 diving | hyperpixel | — | tense |
| r3_tree | Fortree City | hyperpixel | — | calm |
| r3_crater | Crater city | hyperpixel | — | tense |
| r3_arena | Frontier Arenas | hyperpixel (first) | Vacuous (battle) | battle |
| r4_rift | Rift dungeon | hyperpixel | — | tense |
| r4_snow | Snowpoint-shape | hyperpixel | — | calm |
| r4_lake | Lake guardians | hyperpixel | — | calm |
| r5_tournament | Grand Tournament | hyperpixel (first) | Vacuous (battle) | battle |
| r5_market | Market Avenue | hyperpixel | — | bright |

## Battle tracks (override, then restore)

Battle music is not a scene: `audio.startBattle(kind)` plays
the battle pattern and `audio.endBattle()` restores the scene
loop. If main registers a real battle file, it should be
registered as a battle slot (wild / trainer / dojo / elite /
champion / arena) in a follow-up to `audio-system.ts`, with
its pack and credit recorded the same way as a scene slot.
Until then, synth patterns apply: wild / trainer / dojo /
arena = `battle`, elite / champion = `boss`. Victory uses
the synth `victory` jingle, or the Quillbit victory jingle
if that pack is used AND its credit is on screen.

## SFX hooks (all synth, no files needed)

| Hook | Call | Where (main wiring) |
| select | `playSfx('select')` | Menu cursor move |
| confirm | `playSfx('confirm')` | Menu confirm, dialogue advance on a choice |
| cancel | `playSfx('cancel')` | Menu back |
| error | `playSfx('error')` | Invalid choice, blocked gate |
| door | `playSfx('door')` | Door warp, stairs |
| step | `playSfx('step')` | Overworld step (throttled to 180ms in the manager) |
| heal | `playSfx('heal')` | MochiiPlex heal complete |
| catch | `playSfx('catch')` | Capture Cube success |
| catch_fail | `playSfx('catch_fail')` | Capture Cube breaks out |
| badge | `playSfx('badge')` | Dojo badge earned |
| item | `playSfx('item')` | Ground item pickup, shop purchase |
| save | `playSfx('save')` | Save complete |
| levelup | `playSfx('levelup')` | Creature levels up |
| evolve | `playSfx('evolve')` | Evolution / Data Rebirth |
| faint | `playSfx('faint')` | Creature faints in battle |

## Credits screen text (paste only the lines for packs actually used)

```
Music:
- Chiptune loops: hyperpixel (CC0) — https://hyperpixel.itch.io/33-free-chiptune-loops
- Chiptune loops: Abstraction / Tallbeard Studios (CC0)
- Music: Quillbit Chiptune (quillbit-type.itch.io)   [only if a Quillbit track is shipped]
- BGM: 8BIT GAME BGM Vol.01 — Vacuous BGM            [only if a Vacuous track is shipped]
- All other music in this build is original synth generated
  in-game by the Mochiichao audio system.
```

Delete the Quillbit / Vacuous lines if those packs are not
shipped. Do not leave a credit for a track that is not in
the build, and do not ship a track whose credit is missing.

## Download checklist for main (PR gate)

1. [ ] Pick a loop per scene from the CC0-first pack, by mood,
       not by the pack track's title. Record the loop's file
       name next to its SceneId in the PR description.
2. [ ] Re-check that loop's licence on its own page at
       download time. If it changed, stop and record the
       new terms.
3. [ ] If the loop is credit-required, add its exact credit
       string to the credits screen before merging.
4. [ ] Place files under the game's audio folder (suggested:
       `public/audio/<scene>.ogg`), never as a raw pack ZIP
       in the repo where the pack forbids redistribution.
5. [ ] Call `registerFile(scene, '/audio/<scene>.ogg')` for
       each downloaded scene at boot (after `init()`).
6. [ ] Verify: title loop plays after first click, town ->
       route crossfades, battle overrides and restores,
       victory jingle plays, mute silences music AND sfx,
       settings persist across reload (localStorage key
       `mochiichao_audio_v1`).
7. [ ] Verify: with NO audio files registered, the game
       still plays synth fallbacks — no silence, no crash,
       no console error that blocks play.
8. [ ] No commercial track, melody, or sample in the PR.
       If one is found, remove it and report it.
