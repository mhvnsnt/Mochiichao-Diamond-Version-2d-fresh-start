# RESEARCH NOTE — Goddgachuu's rarity: how Pokémon wires its rarest

Owner direction (Jamar, 2026-10-28, ~18:04 CT): "look up
whatever Pokémon is the rarest Pokémon and do research on
that and wire them up just like that" — with the ruling
that Goddgachuu is the rarest Mochiichao. This note is the
research half. The wiring half is recorded in
`DESIGN-BRIEF-goddgachuu.md` (the "Rarity + typing"
section) and on the species record itself
(`src/data/core/species.json`, record 400).

Sources: the public record of the Pokémon games —
Bulbapedia's Mythical Pokémon and event-distribution
documentation, Serebii's event and Pokédex records, and
the games' own data as documented in both.

## The finding: the rarest class is the Mythicals — and their rarity is OBTAINABILITY

Pokémon's rarest tier is not a low encounter rate. It is
the **Mythical** class (Mew, Celebi, Jirachi, Deoxys,
Manaphy, Darkrai, Shaymin, Arceus, Victini, Keldeo,
Meloetta, Genesect, Diancie, Hoopa, Volcanion, Magearna,
Marshadow, Zeraora, Meltan, Zarude, Pecharunt), and the
class is defined by how you cannot get one:

- **No normal-gameplay obtainability at reveal.** A
  Mythical sits in no wild encounter table, no static
  encounter, no in-story gift. It arrives only through
  **distribution** — Mystery Gift, event codes, special
  promotions — entirely outside ordinary play.
- **Dex-final placement.** Mythicals occupy the hidden
  final numbers of their regional dex, after the regular
  roster ends.
- **Excused from completion.** The in-game completion
  diplomas/certificates do not require Mythicals — the
  games excuse the unobtainable from the count.
- **The exceptions are authored set-pieces.** When a
  Mythical later became obtainable in-game — Deoxys in
  Omega Ruby/Alpha Sapphire's Delta Episode (2014),
  Arceus in Pokémon Legends: Arceus (2022) — it arrived
  as a one-off authored story encounter, never as a
  table entry a player can farm.
- **Data marks.** Gender unknown across the class;
  near-never breed (Manaphy is the standing exception,
  and it produces Phione, not another Manaphy) and
  near-never evolve (Meltan → Melmetal, in Pokémon GO
  only).
- **When one is battleable, its catch rate is 3** — the
  floor of the 3–255 scale, the same floor the
  battleable Legendaries sit on.

## The extreme benchmarks below the Mythicals (for scale — NOT Goddgachuu's wiring)

- **Feebas** (Gen III): on Route 119, catchable on only
  **6 of the 444 water tiles**, the tiles randomized per
  save file.
- **Munchlax** (Gen IV): roughly **1% (≈0.93%)** of
  honey-tree checks, on only 4 of the 21 honey trees,
  the trees chosen per save.
- **Roaming Legendaries** (Raikou/Entei/Suicune, the
  Lati twins, Mesprit, Cresselia): a single unique
  individual released into the world; it flees every
  meeting and relocates, damage and status persisting
  between meetings — rarity as pursuit.
- **Shiny-locks:** premier encounters (several cover
  Legendaries; Victini and Keldeo in their generations)
  are code-locked out of the shiny roll entirely.

The pattern in one line: **Pokémon's rarest are absent
from every table; presence enters only as an authored
event.** A ~1% row is how Pokémon wires "very rare".
Zero rows is how it wires "rarest".

## What that maps to here

| Pokémon's wiring | Goddgachuu's wiring (landed 2026-10-28) |
|---|---|
| In no encounter table | No row in any spawn/encounter table in the data core — verified at landing (the files are named on his species record); per #163, a sealed species has no row |
| Distribution / authored event only | Sealed habitat — `show/production/world-systems/sealing-records.json` (`mochiichao/habitat-sealing/v1`); obtainable only via an owner-authored set-piece under #163/#52 — none exists, so `accessFacts` is empty by fact |
| Dex-final placement | #400 — outside and after every existing range, owner-ruled |
| Catch rate 3 when battleable | Recorded here, not landed: `catchRate` stays null (owner-set numbers family) until an authored encounter exists |
| Excused from completion | No completion/diploma system found in the data core — flagged in the brief, not wired |
