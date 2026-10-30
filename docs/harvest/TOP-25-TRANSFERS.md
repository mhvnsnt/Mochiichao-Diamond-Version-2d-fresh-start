# TOP-25 TRANSFERS — the owner's list of 25

*Show-side harvest lane (register item 38), 2026-10-29. The 25
highest-value show-side → game-side transfers, ranked by gaps
closed, Region 1 first. Every game-side target below was checked
against repo main's tree (fresh read, 2026-10-29): a named file
exists there, or the entry says "target to be built" and names the
gap-fill step that builds it. Board refs: [A§n] full-audit
register, [C-X] completeness families, S-steps per GAP-FILL-PLAN
+ WIRING-ADDENDA. Grades: **carry** = the show file's data/spec
lands as-is; **adapt** = show spec reconciled with live code;
**spec** = the show doc is the design source, code is built to it
(source-first: where a donor game's code exists, code wires from
the decomp and the show doc supplies canon/presentation).*

**Transfer #0 (the hunt's own, unranked): the hybrid class.**
`HYBRID-CLASS-CANON.md` (this lane — the show side held it only in
pieces: transplant roster, flavour-law guardrail, role brief) →
game canon docs + a person-flag on the S7 individual record
(target to be built, S7). Closes: the class the game side never
had; unblocks beats M5.

| # | Transfer (show-side source) | Game-side target | Closes | Grade |
|---|---|---|---|---|
| 1 | **Battle damage formula** — `show/production/battle/248-BATTLE-DAMAGE-FORMULA.md` (+ damage-fragment.json) | `src/lib/battle-math.ts` (exists; audit found the live path divergent) | [A§2] battle core; S6 | adapt |
| 2 | **Type effectiveness chart** — `show/production/list3-systems/249-TYPE-EFFECTIVENESS-CHART.md` | `src/lib/battleTypeChart.ts` (exists, chart never wired into the live resolver) | [A§2/§15]; S6 (behind the Draco flag — owner slot, untouched) | adapt |
| 3 | **Priority & turn order** — `show/production/battle/251-PRIORITY-TURN-ORDER.md` | `src/lib/battleResolver.ts` (exists) | [A§2]; S6 | adapt |
| 4 | **Status conditions** — `show/production/battle/182-STATUS-CONDITIONS.md` | `src/lib/battleResolver.ts` + battle state model | [A§2], [C—battle rows]; S6 | spec |
| 5 | **Ability trigger resolution** — `show/production/battle/184-ABILITY-TRIGGER-RESOLUTION.md` | `src/data/core/ability-registry.json` (exists as data) + resolver hooks | [A§2/§18]; S6/S7 | adapt |
| 6 | **Experience gain** — `show/production/battle/177-EXPERIENCE-GAIN.md` (+ gain-fragment) | The payoff lane's HGSS port (in flight) — this doc is its canon twin: pool split, participant rules | [A§2]; S6/S21 | spec |
| 7 | **Bond effects** — `show/production/battle/180-BOND-EFFECTS.md` | `src/data/core/bond-effects-table.json` (exists) + the bond lane's band model (B0–B5 over care history) | [A§5/§15]; S7/S8 | carry (table semantics) |
| 8 | **Individual variation** — `show/production/species-data/80-INDIVIDUAL-VARIATION.md` | The individual record (target to be built, S7) — this doc is its field list | [A§15]; S7 — and every person-system downstream | spec |
| 9 | **Species behaviour profiles** — `show/production/species-data/152-SPECIES-BEHAVIOUR-PROFILES.md` (+ behaviour fragment) | Behaviour scorer + visible roamers (target to be built, S10); data lands in `src/data/core/` beside species.json | [A§3]; S10 | carry (data) |
| 10 | **Spawn tables + encounter modifiers** — `show/production/world-systems/SPAWN-TABLES.md`, `112-ENCOUNTER-MODIFIERS.md`, `113-SWARM-EVENTS.md`, `255-ENCOUNTER-RATE-PACING.md` | `src/data/core/encounters.json` (exists, unread — stub S-6) + the S5 selector | [A§3]; S5; kills stub S-6 | carry (data) |
| 11 | **NPC schedules + travelling NPCs + living presence** — `93-NPC-SCHEDULES.md`, `145-TRAVELLING-NPCS.md`, `306-LIVING-OVERWORLD-PRESENCE.md` | Living-world director (built in its lane; engine hook missing — stub S-2) + S12 schedules data | [A§7]; S12; kills stub S-2's content half | spec |
| 12 | **Ranger licence** — `show/production/world-systems/98-RANGER-LICENCE.md` (+ licence-fragment; game doc `src/data/core/docs/238-RANGER-LICENCE-CARD.md` is its card twin) | Licence view over save facts (target: `src/lib/` licence module, to be built with S18's Ranger tree) | [A§9/§18]; S18 | spec |
| 13 | **Reputation + witnesses/wanted** — `201-RANGER-REPUTATION.md`, `272-WITNESSES-WANTED.md`, `276-SHOW-MORALE-REPUTATION.md` (production root), local-only place-charge package (catalogue §10) | Honor store (built: deedLedger in gameStore) — these docs supply the *derived standing* rules + witness/wanted surfaces its consumers lack (stubs S-7/S-8) | [A§1]; S3/S9/S32 | adapt |
| 14 | **Ranger rematch system** — `87-RANGER-REMATCH.md` (carries the `rematch.schema` shape in-doc) + `173-REMATCH-SYSTEM.md` (battle) | Rematch tables per Ranger (target to be built, S32 — the Vs-Seeker analogue step) | [C-L1]; S32 | spec |
| 15 | **Mythical habitat sealing** — `163-MYTHICAL-HABITAT-SEALING.md` + `sealing-records.json` | Sealing data beside `src/data/core/` (target file to be built; consumer = S29's seal-refusing placed encounters) — Goddgachuu's sealed state becomes data, not folklore | [A§3]; S29 | carry (data) |
| 16 | **Capture system** — `show/production/list5-systems/38-CAPTURE-SYSTEM.md` | Live capture path (cube system in WorldEngine; audit §11 found it partial) | [A§11]; S6 | adapt |
| 17 | **Snag system + stolen Mochi** — `show/production/battle/268-SNAG-SYSTEM.md`, `273-STOLEN-MOCHI.md`, `288-PURIFICATION.md` (world-systems) | The steal mechanic (designed in the cheat-to-mechanic lane from the Colosseum decomp): these docs are its fiction + deed grammar (`steal-mochi` −6 already in honor data) | [C-N]; S29/S32 | spec |
| 18 | **Field techniques (presentation & usage layer)** — `117-FIELD-TECHNIQUES.md` (+ techniques-fragment) | S24's gate engine (target to be built, S24; names governed by the locked Rare sheet) | [C-A/B]; S24; kills stub S-3's spec half | adapt |
| 19 | **Water traversal & dive** — `192-WATER-TRAVERSAL-AND-DIVE.md` (+ water-traversal-fragment) | S25 Wave + S26 Deep Dive paired maps (targets to be built) | [C-D]; S25/S26 | spec |
| 20 | **Egg system + breeding + daycare** — `77-EGG-SYSTEM.md`, `171-BREEDING-COMPATIBILITY.md` (species-data), `193-DAYCARE-SERVICES.md`, `204-EGG-MOVE-INHERITANCE.md` (species-data-system) | `src/lib/creatureDaycare.ts` (exists) + party-egg extension (S29 G7) | [C-I]; S29/S14 | adapt |
| 21 | **Evolution methods** — `199-EVOLUTION-METHODS.md` + `EVOLUTION-DATA-MODEL.md` + `evolution-edges.wave1.json` | `src/data/core/evolutions.json` (exists) + `src/lib/evolution-hook.ts` (exists; hook on the live path is S6's) | [A§15]; S6 | carry (data) |
| 22 | **Forme change + weather formes + regional variants** — `130-FORME-CHANGE.md` (species-data), `175-WEATHER-FORMES.md` (battle), `40-REGIONAL-VARIANTS.md` (list folders) | `src/lib/variants.ts` (exists) + S13's B2 battle-pressure transforms | [A§17]; S13 | adapt |
| 23 | **Completion ceremony + hall of fame** — `216-COMPLETION-CEREMONY.md`, `126-HALL-OF-FAME.md`, `69-ACHIEVEMENTS.md` | Completion recognition (target to be built, S17/S31 with [C-K5]) | [A§8]; S17/S31 | spec |
| 24 | **Sound identity rules** — `344-MUSIC-IDENTITY.md`, `345-SOUNDTRACK-CONSTRUCTION.md` (production root), `84-SOUND-ECOLOGY.md`, `215-REGIONAL-AMBIENT-BEDS.md` | The sound-full-coverage lane's cue/music system (26 cue IDs built in-lane; per-region ladder is the owner's 2026-10-29 ruling) | [A§10]; S15 | carry (rules) |
| 25 | **The transplant roster (cast seats)** — `show/production/transplant-roster/TRANSPLANT-ROSTER.md` (§1 anchors, §2 role map, §2.1 the vessel persons) | Cast data: `src/lib/trainers-region1..5.ts` (exist), `src/lib/champion-mythar.ts` (exists), species programme (Pantera R2) — the roster is the seat map they all read from | [A§18]; S18/S22; carries the hybrid class's carriers | spec |

**First among equals for Region 1:** #10 (encounters — Region 1
routes are the playable surface today), #11 (schedules — Boot
Harbor/Silicon Town NPCs), #13 (honor consumers — first towns),
#1–#6 (every battle in Sequences 1–3), #24 (Region 1's approved
sound). The region1-completion coordinator takes these in that
order; WIRING-SPECS.md covers #1–#10 in execution detail.
