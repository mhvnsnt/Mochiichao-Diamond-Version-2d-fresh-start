# Garden pacing audit — DQB2 W8 (gap-fill S14, slice 8)

**Status: CHECKLIST ONLY.** This page is the DQB2 wiring plan's W8 step:
a pacing-audit page, not a system. It builds no board, no target rows,
no rewards, no Garden Level aggregation, and no thanks-emission, and
it changes no game code. Those are host and content slices that come
later; this page is the checklist they are audited against.

**Sources.** DQB2 `WIRING-PLAN.md` W8 and `TRANSFER-MAP.md` X8/X9/X10;
`GAP-FILL-PLAN.md` S14 (W1–W8, with W5 as corrected — unmet needs can
push comfort below neutral). The plan's own ordering rule binds this
page: W8 paperwork does not land before W1–W6 code. That condition
is checked below, in plain terms, with what is still missing named
rather than hidden.

## Precondition check — what W1–W7 actually are on main today

Checked against main `81b40bd4` at landing (2026-10-31). The Garden
machinery exists as pure library code, proven by unit tests, with no
live host yet. That is the exact state this audit audits — library,
not a playable Garden system.

| Step | Seat on main | State |
|---|---|---|
| W2 solver | `src/lib/garden-habitats.ts` (+ 17 tests) | Landed. Recipes are caller-supplied; nothing is authored here. |
| W2 composition | `src/lib/garden-composition.ts` (+ 18 tests) | Landed. Modifier/combo tables are caller-supplied. |
| W3 placements | `src/lib/garden-wiring.ts` placements block (+ 20 tests) | Landed. Cells carry item id + rotation only; no item catalogue exists. |
| W4 attraction | `src/lib/garden-attraction.ts` (+ 14 tests) | Landed. Attaches class/richness tags; adds no spawn stock, changes no weights. |
| W5 comfort/needs | `src/lib/garden-comfort.ts` (+ 17 tests) | Landed, to the corrected X6 (below neutral allowed). Needs, rates and factors are caller-supplied. |
| W6 register | `src/lib/garden-register.ts` (+ 14 tests) | Landed as a pure record. No GardenView register state exists yet. |
| W7 labour | `src/lib/garden-labour.ts` (+ 12 tests) | Landed as pure conditions. No job-tick host exists to call them. |

**W1 caveat, stated plainly:** the recipe file's *contents* — the
Garden's native item and habitat names — are owner slot S1 and are
not authored anywhere in this programme. W1 is structure-ready only:
the solver accepts recipes, but no recipe for any real Garden habitat
exists yet. Any audit row that needs a named habitat therefore reads
NOT YET PROVABLE, not PASS.

**Host caveats, stated plainly:** no screen or store calls the
placement functions yet; GardenView imports none of the W2–W7
modules; no job-tick host exists; no Garden Level aggregation host
exists. Nothing in W2–W7 runs in live play yet, and this page does
not pretend otherwise.

## X8 — The commute (journey ↔ home)

**The rule, in plain words.** Each story sequence's new systems and
materials are earned inside that sequence's own places, and then
become permanent in the home systems (the Garden, the towns). A
sequence's gates are keyed to that sequence's own discoveries — a
player cannot trivialise a sequence by bringing a stockpile from an
earlier one. The Garden is the commute's home port: what is earned
out on the journey comes home to the Garden and stays there.

**Audit questions, asked of every sequence at its build:**

1. What does this sequence newly give the player (verb, material,
   capability, Garden item)? Name each one.
2. Where, inside this sequence's own places, is each one earned?
   A giver outside the sequence fails the audit.
3. What gate, if any, does each one open — and is that gate keyed
   to this sequence's discovery, not to a stockpile?
4. What comes home to the Garden or a town from this sequence, and
   does it stay there afterwards?

**Application to the built stretch (Sequences 1–3).** Sequences 1–2
are playable with named gaps; Sequence 3 (Dojo 1 + the Mochi Garden)
is NOT STARTED, and the Garden's first opening is Sequence 3's work
per `SEQUENCE-PLAN.md`. So the Garden half of X8 is UNPROVEN today,
not passed: there are no placements in live play, no item catalogue,
and no earned Garden material to trace home yet. The audit re-runs
at the Sequence 3 build, when the Garden actually opens, and answers
questions 1–4 for that sequence from its beat file — not from this
page's guesses.

## X9 — Story-gated capability (every new thing names its giver)

**The rule, in plain words.** Every new verb or system in a sequence
names its giver: a person, a place, a discovery, or a bond.
Capability is received from the world, never bought from a tree.
Where grinding alone would let a player skip a sequence's authored
beats, a sequence-scoped soft cap may be set — that is a landing
decision per system, not a blanket cap, and the rule is the audit
itself, not the cap.

**Audit questions, asked of every sequence at its build:**

1. For each new verb/system: who or what gives it? (Person, place,
   discovery, bond — one named giver each. "The shop" or "the menu"
   is not a giver; the person or discovery behind it is.)
2. Is any capability bought from a tree or a shop with no giver in
   the world? That fails the audit until a giver is named.
3. Could grinding alone skip this sequence's authored beats? If yes,
   what sequence-scoped soft cap is proposed, and where is it
   decided? If no, say why in one line.
4. Are any givers in this sequence owner canon (a named person, a
   named rite, a named place)? If so, the row reads BLOCKED ON OWNER
   with the slot named — the giver is never invented here.

**Application to the Garden verbs.** The Garden itself is given by
its first opening in Sequence 3 — that is the sourced giver for the
Garden as a home system, taken from `SEQUENCE-PLAN.md`, not invented.
The individual Garden verbs (placing, hosting a visitor, comfort,
registering a resident, labour) get their givers named at the
Sequence 3 build from that sequence's beat file. Until then their
giver column reads UNNAMED — PENDING SEQUENCE 3, and this page does
not fill it with plausible names. The allocation/skill-tree audit is
a separate row for when S18 lands; it is not answered here.

## X10 — Tablet Targets (the ambient goal board — NOT built here)

**The rule, in plain words.** After each sequence, the home systems
offer a board of unordered, optional, discovery-shaped targets:
suggestions that teach the systems' breadth and pay only in
core-loop currency (research, honours, Garden Level). They never
gate the story. A target may *suggest* tending a patch (B6); it
never *requires* it. The board is a teaching layer, not the purpose
of the game.

**The warning that rides with it (TRANSFER-MAP §9).** Targets are
exhaustible: a player can finish the board. What remains when the
board is done is the eternal loop underneath — discover, battle,
bond. If the board ever looks like the point of the game, the audit
has failed; the loop is the floor, the board is the suggestion.

**What is NOT built by this page — the addition gate.** No board UI
exists, no target row is authored, and no target is added by this
page. The pattern shapes from the transfer map — "build a habitat
of X character; host a visitor of Y class; witness Z behaviour" —
are patterns only: X, Y and Z are placeholders, not targets. Filling
them needs, at minimum: (a) S1 recipe content (owner slot), (b) a
Garden board UI host, (c) a Garden Level read (the M5 host slice),
and (d) research/honour payers wired to pay a target out. Until
those four exist, adding a target row would be wiring to nothing,
and this audit forbids it. The board is added only after W1–W6
exist *to be targeted* — library code alone does not satisfy that
gate; the hosts above are part of "exist".

**Audit questions, asked before any target row is added:**

1. Does this target teach a real system breadth (a character, a
   class, a behaviour) rather than padding a checklist?
2. Is it unordered and optional — can the player ignore it forever
   and still finish the story?
3. Does it pay only in core-loop currency, and is that payer
   actually wired? (An unwired payer fails the row.)
4. Does it require anything (tending, a purchase, a grind) instead
   of suggesting it? A requirement fails the row.
5. When the board is done, what loop remains for the player? Name it.

## How to run this audit at each sequence

1. Copy the X8/X9/X10 question sets above into that sequence's
   build record. Do not pre-fill answers from earlier sequences.
2. Answer from evidence only: the sequence's beat file, a live-play
   drive, a save probe, or a named code read. A giver named from
   memory is not evidence.
3. Give every row one verdict: PASS, FAIL (with the fix), NOT YET
   PROVABLE (with what would prove it), or BLOCKED ON OWNER (with
   the exact slot named). A row with no verdict is an unfinished
   audit, not a pass.
4. A FAIL or NOT YET PROVABLE row on a sequence's gate or giver
   blocks that sequence's DONE claim until it is fixed or the
   owner waives it in the open. The audit never quietly passes a
   sequence to keep the programme moving.
5. Re-run this page's own precondition check when a host slice
   lands: the moment placements, a board, or a job tick runs in
   live play, the rows that read NOT YET PROVABLE must be
   re-answered against live play, not carried forward as library
   theory.

## Per-sequence audit table (to be filled at each sequence's build)

| Sequence | X8: earned in-sequence, comes home? | X9: giver per new verb? | X10: board rows added? | Verdict |
|---|---|---|---|---|
| 1 — Opening | Not audited under this page (pre-dates W8; re-audit if its systems change) | — | None (no board exists) | NOT YET PROVABLE |
| 2 — Route 1 / Silicon Town | Not audited under this page (pre-dates W8) | — | None (no board exists) | NOT YET PROVABLE |
| 3 — Dojo 1 + Mochi Garden | PENDING — Garden opens here; answer from the beat file at build | PENDING — givers named at build, never here | None until the X10 addition gate above clears | PENDING |
| 4–71 | (one row each, filled at that sequence's build; never pre-filled) | | | |

## Deliberately NOT in this page

- No target rows, no board UI, no reward numbers, no Garden Level
  numbers, no thanks-emission. (Host/content slices, gated above.)
- No recipe, habitat, item, or resident names. (Owner slot S1.)
- No giver names for any Garden verb. (Sequence 3's beat file,
  at its build.)
- No soft-cap numbers. (Per-system landing decisions, per X9.)
- No claim that any Garden system runs in live play. (No host
  reads W2–W7 yet; the unit tests prove the library, not the game.)

*Landing: gap-fill S14 slice 8, 2026-10-31 — docs only, one new file,
no code touched. Precondition verified against main `81b40bd4` this
run; baseline re-proven on the main-faithful tree (tsc exit 0,
`src/lib` 953/953, vite bundle byte-identical to the slice-7 bundle).*
