# WIRING LAW — source-first, always

Set by Jamar, 2026-10-29. This is the method every system in this repo is
built by. It extends the real-code wiring law: not only must wiring touch
real code — the code wired in must BE the source's code wherever a source
exists.

## The order

1. **Exists in Pokémon → Pokémon's code, exactly, 100%.** Port the held
   code (pret decomps Gens 1–4 including HeartGold; Black's disassembly
   where readable) into the game: algorithms, state machines, formulas,
   window geometry, timing. Adaptation happens only at the language seam
   (C/ASM → TypeScript). Never re-design, never approximate from memory.
   Where Gen 5's disassembly is unreadable, readable Gen 4 code governs
   and the record says so.
2. **Not in Pokémon → wherever it actually exists.** The donor where the
   mechanic genuinely lives, at the honest grade of what is held: CODE
   where code is held, DATA/DOCS shape where that is all that exists.
   The grade is written on the wiring and never upgraded in the telling.
3. **Exists nowhere → hand-built, and labelled.** Only genuinely new
   Mochiichao mechanics are built from scratch, marked DORO-BUILT /
   original in their records.
4. **The owner's ideas build on top.** Canon, names, twists, and new
   systems stack onto the ported machinery. They never replace it with a
   hand-made imitation.

## Provenance

Every wired system records: source project + file + function → our file +
what changed at the seam. A "wired" claim without provenance is not a
wired claim.

## Retroactive

Existing builds are audited against this law. A hand-tooled
re-implementation of something that exists in held source code is a
defect; the fix is a re-port, not a polish.

## Universal — and the uniqueness layer (added 2026-10-29, owner's expansion)

This law is not Pokémon-only. Sonic Adventure / Sonic Adventure 2 and
every other donor get the same treatment: if it exists in a game, wire
it 100% from that game's code; an extra the owner asks for gets wired
from whichever other game already has it; hand-build only what is
literally brand new or so specific no system exists anywhere behind it.
Grades stay honest: 100% from the best source actually held, with the
grade (CODE / DATA / DOCS) written on the wiring.

On top of every ported base go the owner's own pieces — his canon,
names, systems, personal touches, in the conversations and in the code —
so the finished work is unique and proprietary to him no matter whose
code is underneath. A build that is only a port, with none of his layer
on it, is as unfinished as a build with no port under it.
