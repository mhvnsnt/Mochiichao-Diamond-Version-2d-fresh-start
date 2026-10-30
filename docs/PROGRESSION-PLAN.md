# Mochiichao — Progression Plan (player-order build)

Owner direction (2026-10-29): stop building scattered pieces and far-future canon. Build in the order a player experiences the game, so every milestone is a complete slice Marquis can open and play.

**Live game repo:** `mhvnsnt/Mochiichao-Diamond-Version-2d-fresh-start` (private, React + Vite + Pixi). `…-public-fork` now only says "this repo has moved"; `…-2d--mirror` is a backup.

## Audit: what a player gets today, in play order (read from `main`, 2026-10-29)

| # | Step | Status | Notes |
|---|---|---|---|
| 0 | **Playable link** | **MISSING** | The private repo has no Pages site (404). The only live link, the public fork's Pages, is a stale Oct 28 build. Actions are billing-blocked, so nothing new deploys. **The owner can't play the current build at all.** |
| 1 | Intro movie / studio scene | Runs, placeholder | Shows "GAP: studio scene art — original art needed" on screen. |
| 2 | Title screen + main menu | Works | Rotating title creature, New Game / Continue / Settings, plus a large menu editor. |
| 3 | Prof. Aeon intro | Works | Uses the shared DialogueBox. |
| 4 | Gender, name and rival name (Hex) | Works | `IntroSequence.tsx` covers GENDER_SELECT, NAME_ENTRY and RIVAL_NAME. |
| 5 | Boot Harbor (home town), Mom, house | Works, art placeholder | Mom's intro, Sprint Boots and the "go to the lab" goal are wired. |
| 6 | Aeon's Lab, starter pick | Works | Five starter balls (Mochii, Razorgater, Tyrage, Kittember, Sproutle), Mochiioteca + Capture Cubes, and Hex counter-picks. |
| 7 | First rival battle (Hex, lab exit) | Wired | `hex_battle_event`, level 5. |
| 8 | Route 1.0 (Greenfield Path) | Wired | Four trainers and wild encounters in tall grass. |
| 9 | Silicon Town + MochiiPlex (heal/shop) | Wired | Nurse heal and the Clerk shop. |
| 10 | Dojo 1 (Master Lin, Core Fragment) | Wired | Four acolytes and the boss; the badge and the "Mighty Push" field move are rewarded. |

**Does it feel like Pokémon?** Not yet. The *structure* matches Pokémon (Gen 3/4 flow), but the *look* doesn't:
- **Tiles are flat-colour rectangles.** `src/lib/tilesets/tilesets.ts` marks field and forest as `original-placeholder` and the town set (Kenney Tiny Town, CC0) as `cc0-pending-download` with `sheet: null`. No real tile art renders.
- **Buildings** come out as coloured blocks.
- **NPCs:** the map data still uses emoji fields (🔬 👩 😤). The Pixi renderer draws placeholder figures unless a sprite sheet exists. Human sheets exist for dojo/elite leaders, but not for Mom, the Youngsters and other common NPCs.
- **Menus:** many custom-built options, not a classic Pokémon window and start menu.
- **Scope creep in the app:** a MochiiMind button, Cheat console, Arena, Creature, Garden and Ring views all sit beside the core loop and distract from it.

## Milestones (each one ends with something the owner can play)

### Milestone 1 — "Leave home with a partner" (first playable slice)
**Owner test (exit criteria):**
1. Open one link on a phone or PC. The game loads within 10 s with no errors.
2. Skip the intro, then choose New Game.
3. Prof. Aeon talks; pick boy/girl, type your name, name the rival.
4. Wake up in your house. Mom talks. Walk downstairs and out the door into Boot Harbor.
5. The town looks like a Pokémon town: grass, paths, fences, trees, houses with roofs and doors, and real people sprites, with no coloured blocks and no emoji.
6. Walk to the lab, go inside, pick a starter, then battle Hex at the door and win or lose without the game breaking.
7. Save, reload the page, and Continue in the same spot.

**Fixes, smallest first:**
1. Turn on a playable link for the private repo. Options: Pages from a `gh-pages` branch built on the box (no Actions minutes), Netlify/Cloudflare Pages free tier, or briefly making the repo public, as the owner allowed before. Put the link at the top of the README.
2. Hide the non-core buttons (MochiiMind, Cheats, Arena, Creature, Garden, Ring) behind a dev flag, so the player sees only the core game.
3. Replace the intro "GAP" placeholder with a simple studio-logo card, or skip straight to the title.
4. Bring the CC0 town/field tilesets into the repo (Kenney Tiny Town plus an open 16×16 Gen-3-style CC0 set) and switch `sheet: null` to real sheets for Boot Harbor, the house and the lab.
5. Give every Milestone 1 NPC (Mom, Hex, Prof. Aeon, Mochiko, Local Kid, Fisherman) a 4-direction walk sheet, with no emoji fallback.
6. Classic Pokémon-style text box and start menu (Party / Bag / Mochiioteca / Save) on the main path.
7. Check that the starter battle UI shows HP bars, move names and a win/lose result.
8. Do an end-to-end play-through of steps 1–7 on the live link and record it (video and screenshots in `docs/proof/`).

### Milestone 2 — "Route 1 and the first catch"
- **Exit criteria:** walk Route 1, get a wild encounter in tall grass, throw a Capture Cube and catch something, beat the four trainers, and reach Silicon Town.
- **Fixes:** route tiles (tall grass, ledges, trees), wild encounter rates and a battle-transition swipe, a working catch animation and result, party menu switching, an EXP and level-up popup, a trainer "!" spotting walk-up, and a whiteout back to Mom when you lose.

### Milestone 3 — "Silicon Town"
- **Exit criteria:** heal at the MochiiPlex, buy cubes in the shop, talk to townspeople, use the PC box, and get turned away from the Dojo until you're ready.
- **Fixes:** building interiors for the Center, Mart and a house; working shop money (CR); PC deposit and withdraw; town music.

### Milestone 4 — "Dojo 1: Master Lin"
- **Exit criteria:** beat four acolytes and Master Lin, get the Core Fragment badge and Mighty Push, and see the badge in the trainer card.
- **Fixes:** dojo interior art, a boss intro and badge ceremony, the trainer card, a level-difficulty check (Lin's level 14 against a level ~10 player), and a save after the badge.

### Milestone 5 — Route to Dojo 2 (Dark Forest, Quartz Caverns, Crag-Peak City)
- Same pattern: one route, one town, one dojo per milestone, each playable before the next starts.

### Milestones 6+ — Dojos 2–8, Elite Four, Champion (Region 1 only)
- One dojo per milestone, in story order. Wire in story beats only as the player reaches them.

## Parked — not before Region 1 is finished and playable end to end
- Region 2+ (Pantera foreshadowing, the Chao-Ranger unlock), Region 4 (Wizard Gang, the Western Heart elements tournament, Diablo, Sun Rā as host), Region 5.
- The Chao-Ranger battle swap mechanic (a Region 2 unlock).
- Creature Mode, Garden, Ring capture, Arena battles, MochiiMind, the cheat console, the menu/title editors and music/sound creators.
- The MochiiQombat Pack DLC (lives in the Western Heart repo).
- Show/video pipeline work (separate lane; it doesn't block the game).
