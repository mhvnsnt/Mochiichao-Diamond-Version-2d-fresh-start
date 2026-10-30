# SHOW DIALECT USE — the Syndicate register in the show's presentation layer

**What this is.** The show-side half of the reserved UI dialect
whose game-side law lives in `docs/ui-art/persona-dialect/
MOCHII-UI-DIALECT.md` (the Syndicate register: a Persona-5-derived
presentation grammar — angular slashes, dominant-colour fields,
kinetic type, shard/burst punctuation — reserved to the
Mysterious Figure / Luigi Castagnoli and the Syndicate, spent
elsewhere only as fragments and traces, building up toward him,
presence-first). That spec's §7 sketched the show translation
*by analogy*. This document is the extension the owner ordered
(2026-10-28): the same reserved grammar applied to the show's
presentation layer as a **binding spec in the show's own
machinery**, with its data beside it
(`show-dialect-fragment.json`, `mochiichao/show-ui-dialect/v1`).

**The governing principle.** The show has no UI. It has
*presentation furniture* — intertitle cards, the eyecatch,
title cards, transitions, dialogue staging — and the dialect in
the show is a **styling register over that existing furniture,
never a new content channel**. The dialect styles; it never
authors. Every dialect surface in an episode is an ordinary
furniture seat (a card row, an eyecatch record, a transition)
carrying a register key. If a proposed dialect moment is not an
existing seat wearing the register, it is not a dialect moment —
it is new content, and it goes through story process, not this
spec.

**Reservation law — unchanged from the game.** Full dialect
belongs to Luigi/Syndicate material. Elsewhere: fragments at
high points, traces before he is named, nothing in ordinary
episodes. The show's build-up runs on **season story position**,
mirroring the game's B0–B4 curve (§4). Presence-first holds on
screen exactly as in the game: a shard transition in an early
episode is the show's Frost trace — the style is a presence
before it is a person, and no episode, card, or caption ever
explains a trace.

---

## 1. The seats — where the dialect may sit in an episode

Each seat names the real show machinery it rides. Fences of the
host system are inherited whole; this spec adds styling and
dose, never exemptions.

### 1.1 Dialogue presentation (human speakers only)

At admitted beats, human dialogue staging may wear the
register: shard-tag speaker presentation on title/furniture
cards where the episode already carries them, opposed-slant
panel-split framing in staged two-person beats, and the
**cut-in** — a close framing in a slanted field — as the
dialogue system's reserved emphasis move, spendable only at
Class S-A/S-B beats (§3), never in ordinary conversation.

**Voice-law fence (absolute).** Creatures speak in cries only;
humans speak in words. Dialect presentation is human-world
presentation. There is no creature dialogue to style, and the
dialect never puts words, name-tags, or text of any kind on a
creature. A dialect-styled card may sit *over* a creature's
moment only as film furniture under §1.2's rules (the card's
voice is the film's, never the creature's) — the same fence the
intertitle system already carries.

### 1.2 Intertitle cards (`mochiichao/intertitle-craft/v1` rows)

An intertitle row may carry a register key; the dialect then
styles the **plate** — slanted field, shard tag, rationed
accent, kinetic settle — over the held shot, in the card's
existing mid-cut form. Inherited fences, unamended:

- **Scarcity is the craft.** The per-episode card budget is
  script data under the subtitle law; a dialect card spends
  from the same budget. The register never adds a card.
- **Law-class wording is owner-exact.** The dialect may style a
  law card's plate; it may never touch, re-set, or re-word the
  line. A paraphrased rule on a dialect plate is the same
  defect as on a plain plate.
- **Moment-class lines stay in the film's voice** — dialect
  typography performs on the plate's furniture (tags, numerals,
  section marks), never by collage-treating the line itself.
- Cards are versioned plates under the standing plate
  discipline; a dialect re-style of an existing card is a new
  plate version, wording unchanged.

*Landing status of the host format:* the intertitle grammar
(List 43 #422, `mochiichao/intertitle-craft/v1`) is built and
in production use (EP01: five cards, plates at
`fx/cards/intertitle-*.png` in the episode's production home)
but its grammar doc/fragment had **not landed on main** at this
spec's audit (2026-10-28) — see §6. This spec is written
against the fragment as built; if #422's landed form renames a
field, this seat's key names follow it by citation, not by
silent drift.

### 1.3 The eyecatch (`mochiichao/eyecatch/v1` + #34 format)

The episode's single eyecatch — bank-cast, never shot for the
purpose, `EC-<LOCATION>-<nn>` / `EC-DEVICE-<nn>` records with
A/B sides — may carry dialect **dressing** on admitted
episodes: the B-form's overlay key or the device frame's
treatment rendered in the register. Inherited fences,
unamended:

- **Identity furniture only** — no readable data, no plot beat,
  no reveal, no new cast. A dialect-dressed eyecatch that the
  audience could *learn something* from is defective twice
  over.
- **There is no Forest eyecatch**, in any register. A segment
  break adjacent to a Forest scene uses the outgoing location's
  eyecatch or the device-only form — the dialect does not ease
  anyone across the Forest threshold, and the Syndicate
  register and the Forest's Unseen register never share a
  surface (§5).
- The pairing rule stands: an eyecatch is cast for its pair of
  neighbours; dialect dressing applies to the pair's record,
  not improvised per side.

### 1.4 Title cards and high-point transitions

- **Episode title cards** on admitted episodes may carry the
  register's composition (slant field, shard punctuation,
  collage headline behaviour on the title line only — episode
  titles are labels, and labels are where the game's grammar
  lets typography perform).
- **Scene transitions at high points**: shard transition cards
  and **held poster frames** at reveals — the game's held
  splash translated to screen grammar. Transitions stay
  snap/cut in behaviour; a slow dissolve is off-register in the
  show exactly as in the game.
- **Part transitions** (#286 grammar; `mochiichao/part-
  transition/v1`) inherit the append-only law: a dialect
  reveal at a part boundary is a new fact written after, in
  order — it never reaches back to re-dress an earlier part's
  traces.
- **Day-arrival**: where an episode's story turns on a day
  boundary at an admitted beat, the date may *arrive* as a
  dialect splash card (big-numeral title card) — the show
  analogue of the game's calendar seat. Ordinary day changes
  arrive plainly.

### 1.5 Promo and trailers (#156)

Syndicate-subject promos may run the fuller register (Class
S-A by analogy — a trailer *about* him is his surface).
General promos follow fragment discipline. Promo use never
raises an episode's own dose: the build-up curve is keyed to
story position in the episodes themselves, and a trailer
cannot spend the season's mystery early.

## 2. What the dialect never does in the show

- Never styles creature communication (c
...[truncated 6400 chars]