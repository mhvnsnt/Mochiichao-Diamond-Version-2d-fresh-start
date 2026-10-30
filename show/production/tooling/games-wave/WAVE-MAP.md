# WAVE-MAP — Games Wave (2026-10-28)

Per target: licence verified at source · evidence grade (**CODE** = real code
read · **DATA** = published data/docs tables read · **DOCS** = public
documentation/talks only) · status **HAVE / PARTIAL / GAP** · true home ·
what landed. "100%" means as far as public/open sources allow — the GAP rows
are the honest edge of that, not unfinished work.

| # | Target | True home | Licence (verified) | Grade | Status | What landed |
|---|--------|-----------|--------------------|-------|--------|-------------|
| 1 | id Software (Doom / Quake) | Mochiichao game (`src/world/`, `src/data/core/`) | **Open source — GPL-2.0-or-later** (engine code; game data/assets NOT included) | CODE | **HAVE** | TEARDOWN-id-software.md; the sim-core, content-pack, and replay specs in `native/` are built primarily on this teardown |
| 2 | Valve (Source SDK / Steamworks / GNS) | Mochiichao game + show distribution practice | Source SDK 2013: **free-but-restricted** (SOURCE 1 SDK LICENSE — non-commercial, free distribution only, must run on Source; commercial use only by direct Valve agreement). GameNetworkingSockets: **open source — BSD-3-Clause**. Steamworks/SteamPipe docs: public documentation | DOCS (SDK + Steamworks) · CODE (GNS) | **PARTIAL** | TEARDOWN-valve.md — prediction/interpolation/lag-compensation model folded into sim-core; SteamPipe depot/branch practice folded into content-pack spec. No Source code adopted (licence bars the use we would need); GNS named as the adopt-when-netplay-exists transport, not wired (no netplay exists yet) |
| 3 | Epic / Unreal | Mochiichao game (behaviour + future co-op) | Engine source: **proprietary, EULA-gated** (private GitHub repo; access requires the owner's Epic account ↔ GitHub linkage + EULA acceptance). Public docs: public documentation | DOCS (patterns) | **PARTIAL + GAP** | TEARDOWN-epic-unreal.md — state-machine / behaviour-tree+blackboard / replication patterns from Epic's public docs, mapped natively. **GAP: the source itself** — unreachable from this seat; the unlock is one owner action (link his Epic and GitHub accounts), named in the teardown; no workaround attempted |
| 4 | Sega + Capcom (fighting) | **Brutal Fist / BANNON** (`mhvnsnt/brutalfistgrokversion*` family) — transfer package | Sonic 1/2 2013 decompilation: **custom licence in-repo (not OSI)** — study-reference only under the house decomp rule. Capcom: no open code; official frame data + documented conventions = public documentation. GGPO: **open source — MIT** | CODE (Sonic decomp exists/read at structure level; GGPO) · DOCS (Capcom conventions) | **HAVE** (as spec/data) | TEARDOWN-fighting-sega-capcom.md; `native/fighting/` — FIGHTING-SYSTEMS.md, frame-data.schema.json (JSON Schema 2020-12, house style), example-move.json (format example, placeholder values), match-presentation.md |
| 5 | Riot + Blizzard (netcode / replay / broadcast) | Mochiichao game + BANNON + the show's battle presentation | No code released; engineering blogs, GDC talks, and published system documentation = public documentation | DOCS | **HAVE** (as design law) | TEARDOWN-riot-blizzard.md — determinism/Chronobreak/Delta-Checker pattern folded into the replay spec; Overwatch prediction/reconciliation + favour-the-shooter as the authority-model menu in sim-core; broadcast grammar in `native/fighting/match-presentation.md` |

## The synthesis (what the five teardowns agree on, and what we adopted)

Five independent giants converge on one architecture, and it is the one this
wave wires in as Mochiichao's simulation constitution (`native/sim-core-spec.md`):

1. **Fixed-timestep deterministic simulation, decoupled from rendering.**
   Doom's 35 Hz tic (CODE), Riot's unified clock + fixed-step movement sim
   (DOCS), Blizzard's deterministic client/server sim (DOCS), Unreal's
   fixed-frame behaviour evaluation (DOCS) — same shape every time.
2. **A match/session is fully described by (initial state, seed, per-tick
   inputs).** That one decision buys demos (id), replays (Riot/Blizzard),
   rewind (Chronobreak), regression testing (Riot's Delta Checker), and
   rollback netcode (GGPO) — all five are the same mechanism wearing
   different coats. Our replay spec is built on exactly this.
3. **Content ships as named-entry packs with override order** (WAD/PWAD,
   Quake PAK, SteamPipe depots, RSDK data archives) — our content-pack spec.
4. **Authority is a menu, not a religion:** lockstep where every peer must
   agree (StarCraft-line, GGPO), server-authoritative with client prediction
   and reconciliation where a trusted host exists (QuakeWorld → Source →
   Overwatch), local determinism where the session is single-player (us,
   today). Sim-core names which model applies to which Mochiichao surface.

## Wiring notes per home

- **Mochiichao game** — sim-core is the target contract for `src/world/
  WorldEngine.tsx` (exists; variable-frame loop today — migrating it is
  engine work, specified here, **not claimed done**). Content-pack spec
  layers over `src/data/core/` as-is. Replay spec serves the battle system
  and QA. Movement system (PR #66) sits on top of sim ticks unchanged.
- **Brutal Fist / BANNON** — `native/fighting/` is the transfer package:
  frame-data schema + conventions + netplay decision + presentation
  furniture, written repo-agnostic so it drops into whichever
  `brutalfistgrokversion*` tree the owner rules canonical (that ruling is
  an owner slot — ten versioned repos exist; this wave does not pick one).
- **Western Heart** — no separate package: it inherits sim-core +
  content-pack + replay through the shared game technology; its
  rig/animation standards are untouched.
- **The show** — battle presentation grammar (observer furniture, replay
  bumps, readability colours) cross-references the animscript seat; nothing
  here changes show canon or the subtitle/cries laws.

## GAP register (complete)

1. **Unreal Engine source** — EULA-gated private repo. Unlock = owner links
   Epic ↔ GitHub and accepts the EULA (his accounts, his action). Patterns
   teardown delivered from public docs instead. No workaround.
2. **Source SDK code adoption** — licence is non-commercial/free-only and
   requires running on Source; incompatible with these repos. Patterns and
   documentation adopted; code not adopted, by licence, permanently unless
   Valve's terms change.
3. **Capcom / Riot / Blizzard code** — none is public. Their systems are
   adopted at the level they publish them (docs/talks/data), graded DOCS.
4. **Netplay itself** — no Mochiichao or BANNON surface has live multiplayer
   today, so transport code (GameNetworkingSockets, GGPO) is *specified and
   decided*, not integrated. Integration is real work for the first
   netplay feature, with the decisions already made in these docs.
5. **Engine migration** — sim-core is a spec + config, not a rewrite of
   `WorldEngine.tsx`. The migration is the follow-on engineering task.
