# GAME-FLOW-MAP — Pokémon's game-narrative flow as a beat grammar, and ours laid against it

*Lane: narrative-flow (owner directive 2026-10-29 ~21:57 CDT). Method in
METHODS.md. The line, stated once and binding on every line below: what
transfers is FLOW — structure, cadence, beat grammar, escalation shapes.
What never transfers: plots, episodes, characters, places, text, twists.
Every grammar rule below is abstracted from the source material; every
fill in GAP-FILLS.md is an original Mochiichao beat built from his canon.*

## Sources actually read for this map

- `~/workspace/pokemon-code-study/projects/pret-pokeemerald/` — the
  journey as event scripts lay it out: `data/maps/<Map>/scripts.inc`
  per-map script files (opening town, laboratory, first rival
  encounters, captain/ferry and teacher NPCs), `data/scripts/` shared
  event scripts. Structure read, not text lifted.
- `~/workspace/pokemon-code-study/projects/pret-pokeheartgold/` — same
  structural read (opening, rival script placement, gym ladder data).
- `~/workspace/pokemon-black-decomp/pokeblack/` — Gen 5 disassembly,
  consulted at structure level only (its story data is the least
  readable of the three; where Gen 5 would matter, Gen 4 governs and
  this map says so).
- `~/workspace/bw2-hgss-teardown/TEARDOWN-HGSS.md` and
  `TEARDOWN-BW2.md` — the digested flow facts with the teardown lane's
  own citations: HGSS's sixteen-badge two-region structure and its
  aftershock threads (TEARDOWN-HGSS §"The structure"), the rival's
  scheduled post-game days and the phone/rematch appointment web
  (same file, §"The rival's days" / §"Rematch scheduling"), the final
  summit encounter framed as "post-game as a *person to meet*, not a
  facility to clear" (same file), BW2's post-game key ring and
  legendary-trio door keys (TEARDOWN-BW2 §6).
- OURS: `~/workspace/bible-charge-logging/staged/SEQUENCE-PLAN.md`
  (71 sequences, statuses verified there), the locked Region 1 beat
  file `src/lib/wiring/dialogue/region1-dialogue.json` (read via the
  canon-sweep copy: 8 beats R1-BEAT2…R1-BEAT9, 6 dojos + Elite Four +
  post-game flags), `region1-truck-start.ink`, the Game Bible
  (staged, same folder), and the rulings in MEMORY.md/AGENTS.md.

---

## Part 1 — The grammar (Pokémon's game flow, abstracted)

**GF-1 · The threshold opening.** The journey begins in transit or in
a bedroom, crosses a home interior (a parent, one keepsake object,
one piece of equipment), then reaches the authority figure who gives
the first partner. Three thresholds — vehicle/room, home, lab —
before the world opens. *(Emerald's truck + Littleroot + lab script
chain; HGSS's bedroom + lab chain. The shape is identical across
generations even though the furniture changes.)*

**GF-2 · The gift is a covenant, and it is tested immediately.** The
partner is a gift with a speech attached, and the rival battle comes
within minutes of the gift — the game makes you prove the bond before
it lets you travel. The rival is introduced as a *person in your
household's orbit* (neighbour, grandchild, childhood figure), never
a stranger.

**GF-3 · Tools arrive as people.** Every new traversal verb (cut,
surf, light, strength…) is handed over by a named person inside an
errand, shortly before the terrain that needs it — never from a
menu, never from a shop shelf alone. The teacher beat is small,
personal, and placed just upstream of the gate it opens.

**GF-4 · The ladder loop, lengthening.** Town → route → town with a
gated interior (gym) → new verb → longer route. The loop repeats
eight times; each repetition is longer, the towns stranger, the
interior's theme more specific. Badges/fragments are not trophies —
they are keys that re-price the world (prices, access, respect).

**GF-5 · Rival cadence at thresholds.** The rival re-appears at
journey thresholds — after the first badge, mid-ladder, before the
final approach — each time measurably grown, each time leaving
toward the same destination you are heading to. The cadence
resolves in one of two canonical shapes: the rival *is* the final
gate (Champion), or the rival becomes a post-game person you can
still meet (GF-10).

**GF-6 · Antagonist escalation in three sizes.** The evil team
appears first as street-level nuisance (a grunt, a petty theft),
second as an installation (a hideout, a captured place, a scheme
with a address), third as a world-stakes confrontation placed near
the legendary beat. The same organisation every time; the audience
learns its face in size order. Local faces recur — the organisation
is abstract, its agents are specific people you have met before.

**GF-7 · The roadblock is an errand with a reason.** A route is
blocked by a person, creature, or event with an in-world reason,
and the solution is a small errand that teaches you a place or a
person — never a bare locked door. *(Our own canon states the same
law from the other side: SEQUENCE-PLAN's standing register carries
List 31 #297 — invisible walls are unrepresentable; every gate
carries a required in-world reason.)*

**GF-8 · The mythical is signed long before it is met.** Legendary
and mythical beings are foreshadowed by *presence signs* — weather
wrongness, a silhouette, a place behaving strangely — spread across
the journey, pointing at existence, never at access. The meeting,
when canon allows one at all, is late and singular. (Our canon's
foreshadowing class and the Goddgachuu seal are this rule already,
stated in our own words: hints point at existence, never access.)

**GF-9 · Services breathe before danger.** A heal/shop rest point
sits just before every sustained danger stretch (cave, forest,
gauntlet). The rhythm is care → risk → care; the game never stacks
two danger stretches without a service beat between them.

**GF-10 · The endgame is a person, and the post-game is doors.**
The league is a gauntlet of known faces ending in one person with a
history with you. After the credits, the world does not end — it
changes key: rematch appointments on a weekly rhythm, facilities,
key systems, a second landmass or island chain, and (HGSS's shape)
a final summit figure who is a *person to meet*, not a facility to
clear.

**GF-11 · The world keeps a calendar.** Weekly and seasonal rhythms
run under the journey (days matter, certain people appear on
certain days, rematches are appointments). The journey is long
enough that the calendar becomes a texture, not a tutorial.

**GF-12 · Home is a place you return to changed.** The opening home
is re-entered at least once mid-journey and once at the end, and
both times the home — not the hero — shows what time has done
(the parent has moved something, kept something, counted
something).

---

## Part 2 — Our sequence plan laid against the grammar

**ORIGIN NOTE (owner correction 2026-10-29 ~22:02 CDT — read before
the table):** where his beats below "match" the grammar, the match
is **his-own-first**. His canon (the Game Bible, the Show Bible,
the game's development material) predates this lane and this
comparison; where it rhymes with Pokémon's flow — the Syndicate
boss seated as Dojo 8's leader, the Mysterious Figure, the whole
Luigi situation — that is his own authorship carrying subconscious
influence from a lifetime of playing Pokémon, in his words: "it
was actually my idea I came up with, and it just so happened to
read like Pokemon." The correct note for every such match is
**"converges with the grammar independently — his,"** an
observation, never a defect, never a derivation. Nothing of his is
ever flagged, rewritten, or "fixed" for resembling Pokémon. The
names-swapped rewrite test in METHODS.md applies ONLY to fills
this lane authors in GAP-FILLS.md. See METHODS.md §0 for the
ruling in full.


| Grammar | Our state | Verdict |
|---|---|---|
| GF-1 threshold opening | Seq 1: truck → Boot Harbor home (Mom, the clock, Sprint Boots) → Aeon's Lab → starter gift. Locked ink, playable end-to-end. | **Matches** — and the furniture is ours (the clock, five starters). |
| GF-2 gift + immediate test | Starter gift → Hex's first battle, fixed counter-pick, post-battle goal dialogue. | **Matches.** |
| GF-3 tools as people | Ferry captain teaches Data-Cut (R1-BEAT5 dialogue, locked); `heavy_lift` flag at Dojo 1 (Seq 3). Illuminate exists as a named technique for the Cave of Echoes. | **Partial** — one teacher beat exists (Seq 5); the pattern is not yet established early, and Illuminate has no teacher. → Gap GF-G3. |
| GF-4 ladder loop | 8 dojos / Fragments across R1 Seqs 3–7, towns lengthening (Silicon Town → Stoneport → Neon City → Market/Central → Harbor/Ember). | **Matches in shape.** |
| GF-5 rival cadence | Hex battles in Seq 1 — then does not appear again until he is Champion (Seq 8). | **GAP** — the middle of the cadence is missing entirely. → GF-G1. |
| GF-6 antagonist escalation | One antagonist beat per dojo stretch (Hacker at the Stoneport docks Seq 4, ferry cell Seq 5, hideout leader Seq 6) + a Syndicate boss revealed as Dojo 8's leader (canon). | **Partial** — the three sizes exist but are not connected as one organisation with recurring faces; the Dojo 8 payoff has no early seeds. → GF-G2. |
| GF-7 roadblock errand | Seq 3's exit gates on the Dojo 1 flag; the Dark Forest (Seq 4) is the first true danger stretch. | **Partial** — no roadblock-errand beat between the first wilds and the Forest. → GF-G4 (merged with GF-G3). |
| GF-8 mythical signs | Goddgachuu presence-sign doctrine is canon (existence, never access; seal untouched). | **Partial** — the doctrine exists; no sign is *placed* in any R1 sequence. → GF-G5. |
| GF-9 services before danger | Silicon Town services precede Dojo 1/Forest path; MochiiPlex heal/shop live (Seq 2 smoke-proven). | **Matches** for the opening; unexamined past Seq 4 (later sequences are header-grade). |
| GF-10 endgame person + post-game doors | Champion Hex (canon) ends R1; Seq 9 (Seven Mochii Isles, post-game) exists as a header with flags (`national_codex`, `ferry_ticket`, `region2_gate_open`). | **Partial** — the person is right; the post-game has no beats, no rematch structure, no appointments. → GF-G6. |
| GF-11 calendar | The world clock is built (gap-fill S-steps); weekly rhythm is an HGSS transfer already in the programme. | **Partial** — machinery yes, story appointments no (folds into GF-G6). |
| GF-12 home returns | Home is Seq 1 only. Mom never re-appears in the plan after the opening. | **GAP.** → GF-G7. |

**Where ours deliberately differs — his canon wins, and the grammar
bends, not the canon:**
- *Five starters, not three* (Seq 1) — the gift beat is wider; the
  rival's counter-pick carries the grammar's "test" alone.
- *The Garden is a second home base* (opens Seq 3) with no Pokémon
  equivalent weight; return beats to it are ours to invent in
  Pokémon's *cadence* but not its content (→ GF-G8).
- *Honor and the witnessed world*: deeds are seen and remembered
  (honor ledger, living-world director). Pokémon's townsfolk
  largely forget; ours must not — antagonist beats therefore carry
  witnesses in our fills where Pokémon's would not.
- *Creature mode*: the player can *be* the creature. No grammar
  rule covers it; fills that touch it are flagged as ours-only.
- *Existential charge*: places have authored charge that does not
  drift. Pokémon's places are neutral stages; our fills must let
  the charge do story work (the Forest's Refusal above all).
- *The Champion is the Seq 1 rival* (Hex) — Pokémon usually splits
  these roles (HGSS being the exception that proves the shape);
  ours fuses them, which makes the missing middle cadence (GF-G1)
  *more* necessary, not less: a fused rival-champion must be met
  all the way up the ladder.

## Part 3 — The gap list (game)

**Region 1 (the priority — fills for all of these are in
GAP-FILLS.md, complete):**
- **GF-G1** Rival mid-cadence missing (Hex: Seq 1 → Seq 8, nothing between).
- **GF-G2** Antagonist thread unconnected (three one-off beats; the Syndicate/Dojo 8 payoff is unseeded).
- **GF-G3** Tool-teacher pattern unestablished early; Illuminate has no teacher (Cave of Echoes, Seq 5).
- **GF-G4** No roadblock-errand between the first wilds (Seq 2) and the Dark Forest (Seq 4).
- **GF-G5** No Goddgachuu presence sign placed anywhere in R1.
- **GF-G6** Post-game (Seq 9) is a header: no beats, no rematch/appointment structure, Isles contentless.
- **GF-G7** No home return beat (Mom, the clock) after Seq 1.
- **GF-G8** The Garden opens (Seq 3) and is never narratively returned to in Seqs 4–8.
- **GF-G9** Victory Route (Seq 8) has no callback faces — nobody from the road is there.
- **GF-G10** No Champion foreshadow scene before Seq 8 (Hex's ambition is asserted, never shown).

**Beyond Region 1 (fills drafted in GAP-FILLS.md §C, compact):**
- **GF-B1** Regions 2–5 sequences are header-grade: no per-region antagonist through-line is written for R2 or R3 (R2 has a Seq 19 hideout raid and R3 a Seq 35 legendary climax as isolated headers).
- **GF-B2** No rival/person cadence after R1: Hex's story closes at the R1 championship; R2 Seq 23's "post-game final battle" names no person.
- **GF-B3** R4's Rift cracks appear in headers (Seqs 43, 52) with no escalation ladder between first crack and the R4 league.
- **GF-B4** R5's "frozen plot" is named in three headers (Seqs 63, 65, 66) with no written escalation shape.
- **GF-B5** R3's legendary climax (Seq 35) has no foreshadow signs planted in R3's earlier sequences (the Seq 32 "awakening" header is the only seed).

**Explicitly NOT a gap:** what stopped moving in the Dark Forest.
That is the owner's open item (Show Bible §10.1; the depths stay
authored-empty). This lane does not fill it, hint-fill it, or route
around it. It is named here only so no future reader mistakes its
absence from the gap list for an oversight.
