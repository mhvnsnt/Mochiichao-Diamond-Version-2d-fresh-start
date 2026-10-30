# Persona UI teardown → the Syndicate register (reserved UI dialect)

Owner order (Jamar, 2026-10-28): tear down Persona 5's menus,
overlays, and dialogue presentation — the hyper-futuristic
Japanese manga register — and build it as a **reserved UI
dialect** over Mochiichao's Pokémon-base UI, mixed into what
Pokémon does but spent by law: most often by and around the
**Mysterious Figure / Luigi Castagnoli** and the Syndicate;
elsewhere sparingly, at high points and interaction points,
**building up** toward him. Presence-first applies to the UI
itself — fragments of the dialect appear before Luigi is ever
identified; the style is a presence before it is a person.

## Files

- **`PERSONA5-UI-TEARDOWN.md`** — the teardown, **DOCS/DATA
  grade, stated plainly**: Persona 5 has no public source code
  and no decomp; nothing here comes from its code or files.
  Menu architecture, the manga-panel composition grammar,
  dialogue presentation, battle UI, confidant overlays,
  calendar/day-transition screens, shops — sourced from Atlus's
  own CEDEC design talk and published breakdowns. Plus the
  **tooling inventory**: Atlus-Script-Tools verified in hand
  (GPL-3.0; covers P5/P5R **script** formats — `.bf`/`.bmd` —
  not UI), AtlusFileSystemLibrary pulled (GPL-2.0), and
  Aemulus / Reloaded II / CriPakTools / Amicitia surveyed with
  licences verified at source and honest reasons for not pulling.
- **`MOCHII-UI-DIALECT.md`** — the dialect spec: the Syndicate
  register's composition rules, the **reservation rules**
  (Class A full dialect = Syndicate surfaces only; Class B
  high-point fragments; Class C unattributed traces; Class D
  base-only ordinary play; Jax's lesser, one-degree-off share),
  the **build-up curve B0–B4** across Region 1, show-lane
  translation, wiring notes (verified vs flagged, real-code
  law), and **7 owner slots** — the accent colour and Luigi's
  reveal specifics first among them. Story facts invented: none.
- **`persona-dialect-fragment.json`** —
  `mochiichao/ui-dialect/v1`, validated: classes + dose caps,
  curve bands, composition constants (accent colour and glyph
  set as named nulls), #331 seats, validation rules.

## Standing relations

- **Extends List 34 #331** (Persona bond ranks + calendar
  engine) as its presentation layer — bond-rank ceremonies and
  calendar day-arrivals are dialect seats; #331's machinery and
  fences unchanged.
- **Two territories, two skins:** the Syndicate register must
  never share palette or glyph with the Dark Forest's Unseen
  (Malakor) register.
- Lands with the next landing pass; nothing here is in the repo
  yet. All dose values DRAFT.

---

## Landing addendum (2026-10-28)

This package landed in the repo at `docs/ui-art/persona-dialect/`
(original four files as authored; this addendum is the only
addition to this README). Verification record:
`LANDING-NOTES.md` beside this file — the package had **not**
landed before; Tier 1 persona dialogue code
(`src/lib/personaDialogue.ts`) already exists as a precursor
seat and is *not* this dialect implemented; the game-side
implementation gaps are flagged there, not hidden.

The owner's show-side extension ordered the same day lands
with it: `show/production/SHOW-DIALECT-USE.md` +
`show/production/show-dialect-fragment.json`
(`mochiichao/show-ui-dialect/v1`) — the reserved grammar over
the show's presentation furniture (intertitle cards, the
eyecatch, title cards, high-point transitions), same
reservation law, same owner slots.
