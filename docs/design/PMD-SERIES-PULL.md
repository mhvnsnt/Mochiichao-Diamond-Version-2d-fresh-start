# PMD-SERIES-PULL — every Pokémon Mystery Dungeon game, systems level

**Owner order:** Jamar, 2026-10-29 ~20:12 CDT — "pull in and wire up all of the
Pokemon Mystery Dungeon games that you can. I love those." This pull sits ON
TOP of the wave-2 PMD teardown package (`~/workspace/wave2-teardown/
pmd-explorers-of-sky/` — TEARDOWN / TRANSFER-MAP / WIRING-PLAN, Explorers-depth,
CODE-grade from `pret-pmd-sky` + `pret-pmd-red` in the code-study tree). That
package's grades stand and are not re-litigated here: rank-over-ledger (T1),
secret-seal (T2), capacity-as-rank (T3), guild liturgy (T4), partner dyad +
night talk (T7), mission record shape (T8), generated boards (T9), outlaw
board (T10), recruitment = habitat housing (T11), connection-orb bond graph
(T13), preference table (T14) all PASS and remain the transfer spine.

**Construction-kit rule (standing):** shapes, tables, flows, and systems move;
donor characters, species, names, logos, text, and assets do not. PMD's own
place/person names, rank names, quiz content, and guild creed are refused as
content and used only as functional descriptors.

**What this pull adds over the wave-2 package:**
1. The per-title systems inventory for the titles the wave-2 pass treated
   only through Explorers (Rescue Team, Gates to Infinity, Super, DX) —
   what each title uniquely contributes.
2. The one transfer the wave-2 package could not contain because the order
   did not exist yet: **playing AS the creature is a first-class control
   mode of the main game** (the owner's mode-swap order), specified in
   MODE-SWAP-SPEC.md and ENCOUNTER-MODEL.md in this folder.

---

## 1. Per-title systems inventory

### 1.1 Rescue Team (Red/Blue, 2005; DX remake, 2020)

| System | Shape | Transfer verdict |
|---|---|---|
| Rescue missions (save a stranded creature, letter-driven) | A creature in trouble posts a letter; you go to the place, reach them, they join/ reward | **Already in T8/T9 shape** — mission record `type: rescue`, client = the stranded one. No new machinery. |
| Friend Areas (DX: camps) | Recruited creatures live in biome habitat places you hold; party forms by visiting | **T11 PASS (wave-2).** Recruitment = habitat housing; the Garden is our Friend Area surface. |
| Recruitment by defeat-with-chance | A defeated wild creature may ask to join, chance keyed to level/rank/items | **Transfers as the recruit flavour of the engagement layer** (ENCOUNTER-MODEL §4): a ranged-KO or battle-KO can resolve as *joins* instead of *caught*, read through habitat housing (T11) — the creature walks home to the Garden rather than into a cube. Chance inputs: effective bond band of the lead, habitat fit, species temperament (Arceus T3). |
| Personality quiz → you ARE the creature | Scored answers → temperament → embodied form | **T6 PASS (wave-2)** as Ranger-creation ceremony. The mode-swap order gives the quiz a second, deeper use: it is the fiction precedent for the Ranger/creature dyad (T7) — the two are one household, which is why control can pass between them. |
| Makuhita-style training grounds / dojo maze | Practice space with typed rooms | Stock only: dojo training rooms already exist in our Dojo line; no new system. |
| DX: rank gates holdings (storage, camp capacity, team presets) | **T3 PASS (wave-2)** — capacity-as-rank. |
| DX: Rare Qualities / squad traits | Whole-party passive traits | **AT-RISK → adapted:** lands only as *bond-band reads* (BOND-INTEGRATION: blessings scale with effective bond), never as loot-rolled traits (wave-2 refused Emera personality-loot, T18 — the same refusal covers trait-rolling). |
| DX: auto mode / smarter partner AI defaults | Companion acts sensibly without orders | Transfers into the companion command model (MODE-SWAP-SPEC §4): `free` command = companion picks sensible acts from its behaviour profile. |

### 1.2 Explorers (Time/Darkness/Sky, 2007–2009) — the depth anchor

Fully torn down at CODE grade in the wave-2 package; its systems are the
spine (T1–T15). Title-unique additions beyond the transfer map:

| System | Shape | Transfer verdict |
|---|---|---|
| IQ skills (behaviour vocabulary learned by living) | Creature habits/manners that change how it acts beside you (avoids traps, shares food, follows close) | **T15 AT-RISK (wave-2)** — transfers as *manners data on the individual record*, read by the follower/companion layer. In creature mode this is what your party members' autonomy runs on. |
| Sentry duty / footprint reading | Identify a visitor by trace evidence | Transfers as an observation verb in the Arceus stack (`observe` quality tally): reading traces at habitat-recognition level. Small; stock. |
| Spinda café / juice = stat care through food made for you | A resident turns your items into care | Composes with T14 preference table: favoured care counts more. Stock for the Garden. |
| Sky: special episodes (playable side-stories as other characters) | Short chapters where you control a non-lead character | **Direct precedent for mode swap.** Explorers already lets the player *be* someone else for a chapter. Our swap generalises it from chapter-locked to a button. Fiction framing is an owner slot (see MODE-SWAP-SPEC §7). |
| Sky: Shaymin-village / sky-peak social hub | A place whose residents are all creatures, no humans | Stock: creature-social places are authored-life content (EW3), seeded by habitat zones, not a system. |

### 1.3 Gates to Infinity (2012)

| System | Shape | Transfer verdict |
|---|---|---|
| Paradise: a hub the player builds up piece by piece | Player-directed construction grows the home town | **T12 AT-RISK (wave-2)** — transfers ONLY inside the Garden fence (the Pokopia/Chao-bridge scope split): land-shaping lives in the Garden + light overworld tending, never as the world core (EMPTY-WORLD rule). |
| Companion mode (post-story: play as a partner directly) | After the authored point, control passes to the partner creature | **The closest donor precedent for the owner's swap** — but Gates locks it behind story completion. Ours is a button from early game (owner's explicit design: "just by the press of a button"), so the transfer is the *control-passing machinery*, not Gates' gating. |
| DLC dungeons / Magnagates (camera gimmick) | — | **REFUSED (wave-2 T19 stands).** |

### 1.4 Super Mystery Dungeon (2015)

| System | Shape | Transfer verdict |
|---|---|---|
| Connection Orb: the bond graph IS the map | Every creature is a node; helping one reveals its connections; recruitment = completing someone's connection | **T13 PASS (wave-2)** — bond graph as navigable map; our #39 care history + derived reads give it data. In creature mode this is also the fiction for *why* wild creatures may join after engagement (ENCOUNTER-MODEL §4). |
| Looplets / Emera (socketed temporary powers) | — | **REFUSED (wave-2 T18 stands)** — personality-loot treadmill. |
| Alliance attacks / team coordination moves | Party acts together on a trigger | **AT-RISK → adapted narrowly:** transfers as a *battle* flourish only (bond-band-gated combined presentation in classic battles, B3 per-personality blessings), never as a separate overworld combat system. |
| World-spanning rescue network (any creature, any place, one graph) | Missions can target any node of the graph | Composes T8+T9+T13: board generation may draw clients from the bond graph, not only from place tables. Stock. |

### 1.5 Cross-series constants (true of every PMD title)

1. **You are the creature; the world is creature-social.** Humans are absent
   or legendary. Our transfer inverts the ratio, not the grammar: creature
   mode is a *mode* of a human-led game, entered and left at will.
2. **Moves in the field.** PMD creatures use their real moves in the
   overworld, plus one regular attack that costs nothing. This is the
   creature-mode moveset contract (MODE-SWAP-SPEC §3) and the engine of the
   engagement layer (ENCOUNTER-MODEL §4).
3. **The partner is a person, not a unit.** Dialogue, worry, initiative —
   the dyad (T7) is the emotional axle; our companion Ranger inherits this
   grammar in mirror (MODE-SWAP-SPEC §4).
4. **Turns tick with steps.** PMD's world moves when you move. Our overworld
   already steps on a timer (140 ms walk / 70 ms sprint in WorldEngine);
   roamers step on the same heartbeat (ENCOUNTER-MODEL §3) — PMD's
   step-synchrony without its grid combat (T17 refusal stands: grid/tactics
   battle never transfers as the battle system; the PMD *skirmish* in our
   model is an overworld engagement resolution, not a dungeon battle mode —
   see ENCOUNTER-MODEL §5 for the fence).

---

## 2. What "wired up 100%" means for this pull

Every PASS/AT-RISK transfer above already has a wiring home in the wave-2
WIRING-PLAN or in tonight's packages (honor P0, bond, habitat binding,
gap-fill S-sequence). This package adds exactly three new builds, specified
here and landed as code in `tree/`:

| Build | Spec | Status in this package |
|---|---|---|
| Mode swap (Ranger ⇄ creature control) | MODE-SWAP-SPEC §2–3 | **Built** — `src/lib/creatureMode.ts` + WorldEngine wiring |
| Companion Ranger (Fallout layer over follower + bond) | MODE-SWAP-SPEC §4 | **Built** — command model in `creatureMode.ts`; engine reuses the existing follower trail with roles reversed |
| Dual encounters + engagement layer | ENCOUNTER-MODEL | **Built (prototype scope)** — roamer species live on roamer-mix maps, ranged engagement resolves KO/catch/recruit, contact escalates to the classic battle |

Everything else in the PMD catalogue stands on the wave-2 wiring plan and
the gap-fill sequence; this package does not duplicate it.
