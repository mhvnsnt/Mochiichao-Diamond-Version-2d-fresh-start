# TOP-10 TEARDOWN PROGRAMME — in-repo wiring ledger

Owner order (Jamar, main chat, 2026-10-30 ~13:35 CDT): the top-10
industry-standard teardown targets get 100% teardowns, extraction and
reverse engineering, each in **its own private repo**, wired up here.

Each teardown repo carries: README (target, sources, honest grade,
blockers) · TEARDOWN (systems extraction) · TRANSFER-MAP (what becomes
what in Mochiichao / Western Heart) · WIRING-PLAN (transfers keyed to
real systems in this repo, with honest states). Grades follow the
wiring law: CODE = held source/decomp read at file level · DATA = held
data/formats extracted · DOCS = public documentation + community RE
literature only. Construction-kit rule binds every package: systems,
formats, pipelines, environments and mechanics wire 100%; the five
exclusions (a Pokémon/character itself, Pokémon names, logos, cries,
literal word-for-word dialogue) are replaced with original material.

| # | Target | Teardown repo | Grade | Wiring landed / open from this programme |
|---|--------|---------------|-------|-------------------------------------------|
| 1 | Pokémon HeartGold/SoulSilver | mhvnsnt/teardown-hgss | CODE (pret pokeheartgold held) | PR #50 — follower mood + findState on the individual schema (T-H1) |
| 2 | Pokémon Black 2/White 2 | mhvnsnt/teardown-bw2 | DOCS (deep); pokeblack held for the CODE deepening | PR #56 — Habitat List derivation core (T-B4). Season core already wired (`worldClock.ts`) |
| 3 | Tekken 7 | mhvnsnt/teardown-tekken7 | DOCS/systems (binary on owner's PC) | Western Heart lane: the 0x8000 common-bank join for `t7_clipmap.py` is PR-ready in that lane (prepared on its agent-ops branch) — lands through Western Heart, not this repo |
| 4 | Skyrim Special Edition | mhvnsnt/teardown-skyrim-se | DOCS/systems (binary on owner's PC) | PR #57 — place-record schema + places data seat (T-K8) and marquee roster shape (T-K10), data halves |
| 5 | Fallout: New Vegas + Fallout 3 | mhvnsnt/teardown-fallout | DATA/DOCS (FNV) + DOCS (F3) | PR #55 — companion affinity fragment (patterns only). Honor core already wired (deed ledger + derivation library) |
| 6 | Persona 5 | mhvnsnt/teardown-persona5 | DOCS/DATA | PR #53 — dialect register types + v2 data carrier (PR-P1) and schedules schema + home (PR-P3) |
| 7 | Fire Pro Wrestling World | mhvnsnt/teardown-fire-pro | DOCS/systems (binary on owner's PC) | Western Heart: F3 Priority Attacks is that lane's PR-ready item (fp-cpu data + resolver branch) — lands through Western Heart |
| 8 | Spore | mhvnsnt/teardown-spore | DOCS/systems (binary on owner's PC) | PR #52 — part grammar + ability-from-parts derivation core (T1/T2) |
| 9 | Shadow of War (Nemesis) | mhvnsnt/teardown-shadow-of-war | DOCS/systems (binary on owner's PC) | PR #51 — rivalry module + rival trait schema (N1/N2) |
| 10 | Yakuza 0/Kiwami | mhvnsnt/teardown-yakuza | DOCS/systems (binary on owner's PC) | PR #54 — civic help effects table (PR-Y3, table half) |

## What is deliberately NOT in these PRs

Every package's WIRING-PLAN separates ALREADY WIRED / PR-READY /
QUEUED / BLOCKED-ON-FILES. The QUEUED items are named with their seams
in the teardown repos — examples: Join Avenue (whole-system build,
owner placement slot), the dialect resolver + validator (the dialect
lane's steps 2–3, sequenced after PR #53), Spore's species-record
`build` field (species-data seam + canon part content), Nemesis
promotion churn (honor/director seam), the tournament summit pool
(owner canon). No QUEUED item is dressed as wired anywhere in this
programme.

## Owner-file blockers (the only open items of that kind)

CODE/DATA-grade extraction for the seven Steam titles needs files that
live on Jamar's PC, itemised exactly in each teardown repo's README
with the staging route (TeraBox for archives, GitHub for small files):
Tekken 7, Skyrim SE, Fallout 3, Fire Pro, Spore, Shadow of War, Yakuza
installs (Fallout: New Vegas is not on the Steam account; its lane ran
at DATA/DOCS grade from the honor-west teardown). Nothing was
downloaded from third parties to close these gaps.

Programme record of record: the ten teardown repos above + the
follow-through register item for this programme. Local working tree:
`~/workspace/teardown-top10/` (PROGRAMME.md).
