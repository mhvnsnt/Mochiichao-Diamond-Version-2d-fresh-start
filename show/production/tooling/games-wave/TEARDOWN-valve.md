# TEARDOWN — Valve (Source SDK / Steamworks / GameNetworkingSockets)

**Licences (verified at source, three different buckets — keep them apart):**
- **Source SDK 2013** (`github.com/ValveSoftware/source-sdk-2013`, incl. the
  Feb 2025 update adding the full Team Fortress 2 client+server game code):
  **free-but-restricted** — the SOURCE 1 SDK LICENSE. Non-commercial only;
  distributions must be free of charge, in source and object form; modified
  games must run on the Source engine; Valve's LICENSE file and third-party
  notices must ship; commercial use only by direct agreement with Valve
  (the licence names `sourceengine@valvesoftware.com`).
- **GameNetworkingSockets** (`github.com/ValveSoftware/GameNetworkingSockets`):
  **open source — BSD-3-Clause.** Valve's production transport (Dota 2,
  CS:GO lineage), deliberately usable without Steam.
- **Steamworks / SteamPipe documentation** (partner.steamgames.com public
  docs + the Valve Developer Community wiki): public documentation.

**Evidence grades:** SDK systems + Steamworks practice **DOCS** (we read the
documentation and licence, not a private tree); GameNetworkingSockets
**CODE** (public repo, BSD-3).

**Disposition up front:** no Source SDK code is adopted — its licence bars
exactly our situation (a commercial-intent project not running on Source).
What transfers is Valve's *documented system design*, which is considerable,
plus one genuinely open library held in reserve.

---

## 1. The Source multiplayer model (documented, VDC wiki)

Valve's published networking model is the QuakeWorld lineage (§4 of the id
teardown) industrialized:

- **Server-authoritative snapshots with delta compression** — the server
  sends each client only what changed since the last snapshot that client
  acknowledged.
- **Client-side prediction** for the local player's movement, using the same
  movement code on client and server, with error correction on the server's
  reply.
- **Entity interpolation** — remote entities render ~100 ms in the past,
  interpolated between two known snapshots, so other players move smoothly
  despite discrete updates.
- **Lag compensation** — when a player fires, the server temporarily
  rewinds other entities to where the shooter saw them, tests the hit,
  then restores. Fairness is defined as *the shooter's view*, bounded by
  the rewind window.

**Native mapping:** these four are the vocabulary of sim-core's authority
menu (`native/sim-core-spec.md` §4) for any future networked surface. For
today's single-player game the adoptable piece is the *interpolation
discipline*: render state is a read-only view interpolated between sim
ticks — the same separation, minus the network.

## 2. Demo / replay systems (documented)

Source has both recording philosophies from the id teardown, side by side:

- **.dem files** record the client's received network-message stream
  (the Quake model) — playback re-renders a past session, with the demo
  tools adding free-camera and timeline control after the fact.
- **TF2's Replay system** moved recording *server-side*: the server records
  every session and clients download finished replays — the direct ancestor
  of Riot's replay-distribution model (sibling teardown §2).

**Native mapping:** our replay spec stays with input-stream recording
(Doom model) because our sim is deterministic and local — cheaper and
bit-exact. The TF2 lesson adopted is *distribution*: a replay is a file a
player can hand to anyone whose build + content packs match the header,
which the replay spec's header is designed to verify.

## 3. Animation + AI state machines (documented)

- Source characters animate through **sequences grouped into activities**
  (ACT_RUN, ACT_IDLE…): gameplay asks for an *activity*, the model layer
  picks/blends sequences — gameplay code never names an animation file.
- NPC behaviour runs on **schedules** (condition-driven task lists) over a
  state machine — the HL2 pattern: states select schedules, schedules run
  tasks, conditions interrupt.

**Native mapping:** the activities pattern is the same separation the
movement system already applies to battle staging (staging classes, not
file names — PR #66) and that the show's animscript grammar uses
(`move-animscript/v1`). Recorded here as convergent evidence, nothing new
to build. The schedules pattern cross-references the Unreal behaviour-tree
teardown — two giants, same answer, ours is the native behaviour axes +
tables already in the data core.

## 4. GameNetworkingSockets (BSD-3) — the reserve transport

What it is, from the repo: a connection-oriented, message-based transport
over UDP — mixed reliable/unreliable messages, fragmentation/reassembly
above MTU, encryption, TCP-friendly bandwidth estimation (RFC 5348), and
built-in loss simulation + stats tooling. It is a subset of the Steamworks
networking API; on Steam it can ride the **Steam Datagram Relay** (Valve's
relay network: hides player IPs, improves routes), off Steam it is plain
peer/server UDP.

**Native mapping — decision, not integration:** if/when a Mochiichao or
BANNON surface goes online peer-style, GNS is the pre-approved transport
(BSD-3, commercial-clean, battle-tested at Valve scale). For 1v1 versus,
the fighting package's rollback decision (GGPO-pattern, MIT) sits *above*
whichever transport carries the inputs — GNS is compatible with that role.
No code is wired today because no netplay surface exists; writing netcode
against no feature would be fake wiring.

## 5. SteamPipe distribution practice (documented)

Steam's content system is the WAD pattern grown up, and it's the part of
Valve that applies to us *now*:

- Content ships as **depots** (per-platform/per-language file sets) built
  from manifests; updates are **chunk-level deltas** — changed chunks only.
- **Branches** (default / beta / named) let one app serve stable and test
  audiences from the same depot pool; a build is promoted by moving a
  branch pointer, never by re-uploading.
- Every build is content-addressed: a manifest ID *is* the build.

**Native mapping → `native/content-pack-spec.md` §4:** our content packs
adopt depot discipline in miniature — a pack manifest with per-entry hashes
*is* the pack version; "channels" (stable/test) are named orderings of the
same packs. For a web-shipped game the practical form is: the build serves
pack manifests in channel order, and a replay/QA check can name exactly
which manifest set it ran against.

## Sources (this pass)

- Source SDK 2013 licence terms as summarized from the repo LICENSE via
  DeepWiki's licensing analysis + Valve's TF2 source-release announcement
  (teamfortress.com), retrieved 2026-10-28.
- GameNetworkingSockets: repo README + Phoronix/Open Hub licence records
  (BSD-3-Clause), retrieved 2026-10-28.
- Source multiplayer networking / interpolation / lag compensation: Valve
  Developer Community wiki (public), long-standing documentation.
- SteamPipe / uploading documentation: partner.steamgames.com/doc (public).
