# MATCH PRESENTATION — broadcast grammar for BANNON matches + show battles

**Sources:** TEARDOWN-riot-blizzard.md §4 (LoL/Overwatch broadcast
practice, DOCS) + the fighting-major tradition (TEARDOWN-fighting-
sega-capcom.md §4). **Homes:** Brutal Fist/BANNON (live match
presentation) and the Mochiichao show (battle episodes / tournament
arcs), where it composes with — never overrides — the show's existing
battle staging (movement system PR #66) and animscript grammar.

Presentation is a **layer over the sim**, fed by the same recorded
inputs and state the replay system keeps (`../replay-format-spec.md`).
Nothing in this document touches an outcome.

## 1. The furniture (what is always on screen, and why)

| Element | BANNON form | Show form | Source pattern |
|---|---|---|---|
| Side identity colours | Each corner owns one colour family for the whole match — gear trim, UI, effects accents | Each side's presentation accents in battle scenes | Overwatch League home/away readability colours |
| Momentum graph | A running swing line (damage + control differential) in the broadcast HUD | Post-battle recap card; in-scene only at tournament arcs | LoL gold/XP differential graph |
| Objective / state strip | Round, fall count, match point, time — one strip, always visible | Battle state strip in tournament-arc episodes only | LoL objective timers strip |
| Tale-of-the-tape | Pre-match card: the two competitors, their records, their signature data | Trainer/creature intro cards (existing show furniture, same grammar) | Fighting-major + LoL pre-game cards |
| Loadout card | Declared moves/ruleset shown before the bell (the frame-data ids, display names only) | — (show keeps this diegetic) | LoL item/rune pages |

## 2. Replay bumps

- Between rounds/falls (BANNON) and at act breaks (show), a **replay
  bump** re-shows the decisive exchange from a second camera. Because
  matches run on the deterministic sim, a bump is a replay file +
  a camera script — no footage needs to be captured or stored, and
  the bump can be re-rendered at any resolution, forever.
- The bump's camera never invents coverage the sim didn't contain:
  it re-frames the recorded inputs, it does not re-stage them.
  (Show-side, staged re-shoots are ordinary production and live under
  the show's rules — they are not bumps and are not labelled as such.)

## 3. Spectator rules (when BANNON ever runs live/online)

- Spectating is a **separate, delayed feed** (delay is a fairness
  feature — the LoL spectator lesson). The delay value is a match
  ruleset field, not a client setting.
- The spectator client is the replay viewer with a live input feed —
  one codebase, two feed sources (`../replay-format-spec.md` §2.3
  is written to allow exactly this).

## 4. Readability law (the one rule that outranks the furniture)

In any presented frame, a first-time viewer must be able to answer
*who is who, who is winning, and what just happened* without commentary.
Side colours (§1) serve it, the state strip serves it, and any effect
or camera choice that breaks it loses to it — this is the OWL
home/away lesson generalized, and it composes with the house colour
discipline: presentation colours are an overlay layer; identity
colours underneath are never recoloured (the tint/colorway boundary,
show bible, stands unchanged).
