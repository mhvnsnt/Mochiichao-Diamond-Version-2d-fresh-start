# TEARDOWN — id Software (Doom / Quake)

**Licence (verified at source):** the engine source is **open source —
GPL-2.0-or-later** (`LICENSE.TXT` in the repos is the GPL v2 text; the Doom
engine was re-released under GPL in 1999 after a 1997 non-commercial source
release). The GPL covers **code only** — id retained all rights in game data
(levels, textures, sounds). Repos: `github.com/id-Software/DOOM`,
`github.com/id-Software/Quake`.

**Evidence grade: CODE.** For this pass the two repos were cloned and read
directly (shallow clones, study-only, held locally outside the game repo).
File/line citations below are from those clones. Systems transfer; no id
code is copied into any shipping artifact — GPL copyleft is also why: our
native rewrites keep the repos' own licensing clean. (Studying GPL code and
re-implementing the *design* natively is the house pattern; pasting GPL code
into a non-GPL tree would contaminate it.)

---

## 1. Fixed-timestep deterministic simulation (Doom)

- `linuxdoom-1.10/doomdef.h:122` — `#define TICRATE 35`. The game world
  advances in discrete **tics** at exactly 35 Hz, independent of how fast
  frames render. Rendering interpolates nothing in the original; the sim
  *is* the clock.
- Every participant advances the *same* simulation from the *same* inputs:
  each tic, each player's `ticcmd_t` (`d_ticcmd.h` — movement, turn, buttons)
  is distributed to all peers, and every machine runs the identical world
  step. There is no server state to trust — determinism is the authority.
- The RNG is a fixed table walk (`m_random.c`, `P_Random`) — same calls in
  the same order give the same numbers on every machine, forever. Randomness
  is a *shared script*, not a dice roll.
- Desync detection is built in: `g_game.c` (~line 686) raises
  `I_Error("consistency failure (%i should be %i)")` when a peer's check
  value disagrees — the sim carries its own proof of agreement.

**Native mapping → `native/sim-core-spec.md` §§1–3.** Mochiichao adopts:
fixed sim tick decoupled from render; inputs recorded per tick; seeded,
named RNG streams (our analogue of the fixed table, with stream separation
id never needed); periodic state-hash checkpoints playing the consistency
check's role.

## 2. Demo recording = the input stream (Doom)

- `g_game.c:80-81` declares `G_ReadDemoTiccmd` / `G_WriteDemoTiccmd`;
  `g_game.c:666-668` shows playback and recording feeding the *same* per-tic
  command slot the live network path feeds. A `.lmp` demo is therefore just:
  header (version, skill, episode/map, player count) + **one serialized
  ticcmd per player per tic** — a few bytes per tic, minutes of gameplay in
  kilobytes.
- Playback is not video. It is re-simulation: because §1 makes the sim
  deterministic, replaying the inputs *is* replaying the game, bit-exact,
  including the RNG.
- Consequence id exploited for decades: demos double as regression tests,
  attract modes, and shareable proofs — all free once the sim is
  deterministic.

**Native mapping → `native/replay-format-spec.md`.** Our replay header
generalizes Doom's: it adds the two things 1993 didn't need — content-pack
hashes (so a replay names the exact data it was recorded against) and
periodic state hashes (so a desync is *located*, not just detected).

## 3. WAD packaging + PWAD override (Doom)

- `w_wad.c` `W_AddFile` (~line 141): a WAD is a header (identification
  `"IWAD"`/`"PWAD"`, lump count, directory offset) + a flat directory of
  named **lumps** (offset, size, 8-char name). The engine loads the IWAD,
  then any number of PWADs; **a lump in a later file with the same name
  replaces the earlier one** (the identification check at ~lines 185-191 is
  the only gate).
- That single rule — *named entries, later packs override earlier by name* —
  is the entire mod system. No registry, no merge logic, no code changes:
  content is data, packs are ordered, names are the API.
- Quake kept the shape: `WinQuake/common.c` `COM_LoadPackFile` (~line 1619)
  loads `.pak` archives (header `"PACK"`, up to `MAX_FILES_IN_PACK` 2048
  entries) into the same virtual filesystem, later packs shadowing earlier
  files by path.

**Native mapping → `native/content-pack-spec.md`.** Mochiichao's
`src/data/core/*.json` already *is* a base pack in everything but name; the
spec formalizes entry naming, override order, and per-entry hashes, and
shows today's core files as the worked example (real sha256, real sizes).

## 4. Client–server + prediction (Quake / QuakeWorld)

- Quake replaced lockstep with a **client–server** model: the server owns
  the world; clients send movement commands and receive entity updates.
  Demos changed accordingly — `WinQuake/cl_demo.c` `CL_WriteDemoMessage`
  (~line 66) records the *server message stream*, because with a server
  there is no single input stream that describes the game.
- QuakeWorld (`QW/client/`) added the two ideas every networked game since
  has reused: **client-side prediction** (`cl_pred.c` — run your own
  movement locally, immediately, using the same code the server runs) and
  reconciliation when the server's answer arrives. This is the direct
  ancestor of the Source and Overwatch models in the sibling teardowns.
- Two demo philosophies, one lesson: *record whichever stream fully
  determines playback* — inputs when the sim is deterministic and local,
  messages when a server mediates. Our replay spec records inputs (our sim
  is deterministic and local) and reserves a message-stream mode for any
  future server surface.

## 5. Data-driven game logic (QuakeC)

- Quake's gameplay code is not in the engine binary: it is **QuakeC**
  compiled to a bytecode file, `progs.dat`, loaded at runtime
  (`WinQuake/pr_edict.c` `PR_LoadProgs`, ~line 985; sources in `qw-qc/`).
  Mods replaced `progs.dat`, not the engine.
- The transferable idea is the *separation*: engine = stable machinery;
  game rules = replaceable data-side code. Mochiichao already lives this
  way (JSON data core + TypeScript engine), so the adoption is a rule, not
  a build: **packs carry data only**; rule changes are engine changes and go
  through code review, never through content. (The content-pack spec §5
  records this as a deliberate road-not-taken, with the reason.)

## 6. What we did NOT take

- **BSP/rendering** — 3D-specific; our world is a 2D tile renderer
  (`src/world/WorldRenderer.tsx`). Nothing transfers.
- **The GPL code itself** — study-only here by design (see header).
- **Doom's 8.3 lump names / binary layouts** — the *pattern* transfers, the
  1993 constraints don't. Our entries are repo paths; our manifest is JSON.

## Sources (this pass)

- Cloned + read: `id-Software/DOOM` (linuxdoom-1.10: `doomdef.h`, `g_game.c`,
  `d_net.c`, `w_wad.c`, `m_random.c`, `d_ticcmd.h`), `id-Software/Quake`
  (WinQuake: `common.c`, `cl_demo.c`, `pr_edict.c`; `QW/client/cl_pred.c`;
  `qw-qc/`), both GPL-2.0 (`LICENSE.TXT` / `gnu.txt` in-tree).
- Corroborating: Doom engine + Quake engine licence summaries (Wikipedia,
  retrieved 2026-10-28).
