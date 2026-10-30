# HYBRID-FINDING — the hunt for the hybrid class's written form

*Show-side harvest lane (register item 38), 2026-10-29. Owner
directive ~21:54–21:57 CDT: the hybrid thing — "Mochi Ranger" /
"Ranger Mochi" or similar — was written on the show side of the repo
and never on the game side; go find it.*

## The verdict, plainly

**NOT FOUND.** After the full hunt recorded below, the name —
"Mochi Ranger", "Ranger Mochi", or any spelling variant — does **not**
exist as a written class name anywhere on the show side this lane can
reach: not in the repo (main, read fresh tonight), not in any local
show copy, not in the list-system corpus, not in the bibles. The
closest written phrase in the entire corpus is **"Ranger-Mochi
bond"** — and that is a different thing (the Ranger↔Mochi bond
standing in the Persona bond system; its own file says "Human pairs
only — a Mochi is not a confidant").

The **situation** the owner described, though, is real canon — it
exists on the show side in pieces, under other names:

1. **The soul-vessel persons** — the transplant roster
   (`show/production/transplant-roster/TRANSPLANT-ROSTER.md` §2.1,
   "THE SEVEN (primary vessels)"): named people who are vessels of
   named creature souls — DEMONIO (Demon Soul, vessel of RIN),
   PANTERA (Panther Soul, vessel of TOU), PHANTOM (Ghost Blade Soul,
   vessel of JIN), DIABLO (Devil Soul) and kin.
2. **Pantera's anchor record** (roster §1, Anchor 2, owner-directed):
   a black panther head on a humanoid body in wrestling gear — an
   anthropomorphic panther *person* who "becomes a Mochichao" in
   Region 2. His own home-canon attire description, quoted in the
   harvest: *"a humanoid cat like robot cyborg."*
3. **The speech guardrail** — `REGIONAL-FLAVOR-LAW.md`, in its canon
   guardrails: *"no speech (cries only — Digimon talk, Mochi
   don't)"* — the show-side written form of the rule that a
   creature-bodied person has no human words.
4. **Demonio's gimmick** (role brief, owner-ruled 2026-10-27,
   summarised in the beats package and consistent with the roster):
   a person possessed, whose other form the world mistakes for a
   creature and battles as one — the misreading, written down.
5. **The reverse shape** — Mythar, a creature who wears a human
   form (roster + beats package): the class's mirror image, already
   in canon.

So: the owner's memory of *a document* under that name does not
survive verification (verify-then-state law — this lane reports what
the files say, not what would be convenient). What survives is
better: the class is real, its carriers are named in canon, and the
owner's own words tonight are its naming source. The class
definition has therefore been written from the owner's 2026-10-29
definition (labelled OWNER-GIVEN), anchored to the five written
pieces above, and staged for the game side as
`HYBRID-CLASS-CANON.md` in this lane folder. If the owner later
produces or recalls the original document, the search record below
shows exactly where it is not — and the class doc gets reconciled
against it then.

## The search record (what was searched, how, and what came back)

**Authoritative source — repo main, read fresh 2026-10-29 via the
GitHub API (PAT connector):**

- Full recursive tree: **26,548 entries, not truncated**. Show side:
  **9,107 entries / 7,524 files**. Filename scan for `hybrid`,
  `anthro`, `half`: **0 hits**. Ranger filenames: exactly 8
  (`87/98/116/169/201/221/244` + model-sheet wardrobe) — the whole
  Ranger family, all about human Rangers (all read: licence #98,
  rematch #87, hideouts #169, reputation #201, mentorship #221,
  etiquette #244 — licences, standings, customs, rematch ladders;
  no hybrid content in any of them).
- **Content fetch: 1,032 show-side text files pulled from main, 0
  errors** (all of `show/bible`, `show/production` except
  tooling/wielder internals, episodes, species data — excluding
  `show/research`, which is reverse-engineering material, not his
  show writing; see catalogue note). Greps over all 1,032:
  - `mochi[- ]?ranger | ranger[- ]?mochi` (all case/spacing
    variants): **1 hit** — "Ranger-Mochi bond"
    (`bond-calendar-fragment.json`), the bond system, not a class.
  - `hybrid`: production-method uses only (hybrid animation
    methods), plus Rancher-mixture species talk ("Food and object
    hybrids are ordinary citizens" — a species-flavour line in the
    mixture context) and one wrestling-style label ("Wrestling /
    Technical Hybrid" in Pantera's own roster entry).
  - `anthropomorph`: 1 hit — a research report on pose-detection
    software. `half-human`, `part-human`, `human-creature`: **0**.
  - Concept greps — "mistaken for a creature", "cannot speak", "no
    human words", "vessel of": the vessel hits are the transplant
    roster only; the speech hits are the Voice Law (creatures speak
    in cries) and the flavour-law guardrail quoted above.

**GitHub code search (PAT): tested and found non-functional for
this repo** — control queries for strings certainly on main
("Mochii", "Boot Harbor", "Pantera") return total 0, exactly like
the hybrid queries. Recorded as a dead channel: it is evidence of
nothing in either direction and was not relied on.

**Local copies searched (content greps, same query families):**

- `~/workspace/landing/main/show` + `~/workspace/landing/build/`
  (the list-build copies) — variant hits: only the same
  "Ranger-Mochi bond" fragment.
- `~/workspace/canon-sweep-show/{main,new,branch}/show`,
  `~/workspace/bible-charge-logging/staged/` (Game Bible + Show
  Bible staged copies — no hybrid, no vessel taxonomy),
  `~/workspace/mochiichao-show/` whole workspace **including the
  teardown list corpus: 617 list-system documents, Lists 3–50** —
  variant hits: none; `hybrid` hits: pipeline-method uses and one
  record-keeping line ("two records, not one hybrid").
- `~/workspace/mochiichao-show/moral-choices-system/` (the
  place-charge machinery, which lives local-only, not on main) —
  no hybrid content.
- `~/workspace/western-heart-work/` (Pantera's and Demonio's home
  canon) — no variant hits.
- Conversation/memory search (parent, tonight): no past use of the
  term found either.

**Also read in full for the hunt:** the Show Bible
(`show/bible/SHOW-BIBLE.md`), the season canon map and EP01–EP10
arc note, `FUTURE-CONSIDERED-IDEAS-NAME-GAPS.md` (no hybrid entry),
the transplant roster §1–§2.1 entire, `REGIONAL-FLAVOR-LAW.md`,
`NEW-SPECIES-IDEAS.md`.

## What this means for the game side

The game side never got the class because the class was never
written as a class anywhere — it lived as roster entries, an anchor
record, a role brief, and a guardrail. That gap is now closed by
writing it once, properly: **`HYBRID-CLASS-CANON.md`** (this lane,
staged ready-to-land). The beats package has been amended to match
(see `~/workspace/human-violence-beats/`, amendment notes dated
2026-10-29): Pantera's moment M5 is recognised as what it always
was — the hybrid class's own moment.

## Owner slots hit during the hunt (flagged, never filled)

- **The class name itself** is recorded as the owner's recalled
  name ("Mochi Ranger") — if he rules a different written name, the
  rename is display-layer only.
- **Demonio's dojo theme/town and the demon's nature** — still
  unruled (carried over from the role brief's own flags).
- Nothing else: the class definition needed no invented facts —
  every clause traces to the owner's tonight words or a cited
  show-side file.
