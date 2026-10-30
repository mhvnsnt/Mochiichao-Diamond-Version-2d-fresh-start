# Pack Manifest — CURRENT packs (v1, landed 2026-10-28)

| Character | Pack version | Front view | 3/4 | Side | Back | Expressions | LoRA set |
|---|---|---|---|---|---|---|---|
| Wispkin | v1 CURRENT + CANDIDATE turnaround views (2026-10-28) | CANON (`wispkin/front.png`) | CANDIDATE | CANDIDATE | CANDIDATE | GAP (candidate attempt FAILED anchor check 2026-10-28 - see wispkin record) | exists (Wan2.1-1.3B — see `../lora/LORA-MANIFEST.md`) |
| Dorowani | v1 CURRENT + CANDIDATE views (2026-10-28) | CANON (`dorowani/front.png`) | CANDIDATE | CANDIDATE | CANDIDATE | CANDIDATE | exists (Wan2.1-1.3B) |
| Mochii | v1 CURRENT + CANDIDATE views (2026-10-28) | CANON (`mochii/front.png`) | CANDIDATE | CANDIDATE | CANDIDATE | CANDIDATE | GAP |
| Gabu | v1 CURRENT + CANDIDATE views (2026-10-28) | CANON (`gabu/front.png`) | CANDIDATE | CANDIDATE | CANDIDATE | CANDIDATE | GAP |
| Kittember | v1 CURRENT + CANDIDATE views (2026-10-28) | CANON (`kittember/front.png`) | CANDIDATE | CANDIDATE | CANDIDATE | CANDIDATE | GAP |
| Sproutle | v1 CURRENT + CANDIDATE views (2026-10-28) | CANON, cleaned (`sproutle/front.png`) | CANDIDATE | CANDIDATE | CANDIDATE | CANDIDATE | GAP |

## What the gaps mean, plainly

Every pack today is a **single-view pack**. That is enough for image-to-video
and reference-to-video generation (all engines accept a front reference), but
it is below what the platforms' own guides recommend and below what our own
LoRA round 2 already called for:

- Kling's Element guide builds an Element from a frontal image **plus up to
  3 supplementary angle images** — our supplementary slots are empty until
  sheets exist.
- Higgsfield's Soul ID trains on **20+ images** — impossible from canon today.
- Our own LoRA manifest already states round 2 needs real model sheets
  (front/¾/side/back + expressions).

**The sheet step is the same step for every engine**: produce owner-visible
model sheets for the pilot cast, approve them as canon, then upgrade each
pack to v2 with the new views marked CANON. Until then, no engine — ours or
theirs — gets more than the front view, and no generated angle may be
labelled canon.

## Superseded / excluded

- `sproutle-v1-baked-shadow.png` — excluded from the Sproutle pack
  (baked ground shadow; no-baked-shadows rule). Cleaned cutout is current.

## Candidate views (2026-10-28, Work Package C)

Dorowani and Kittember gained CANDIDATE turnaround + expression/pose sheets
(`candidate-turnaround.png`, `candidate-expressions.png` in each pack, with a
`CANDIDATE-SHEETS-RECORD.md` carrying the per-view anchor grades). CANDIDATE is
not canon: the owner locks sheets only after seeing them. Mochii, Gabu,
Sproutle and Wispkin remain GAP for all non-front views in this package —
they were not attempted in this run, not failed.

## Candidate views (2026-10-28, Work Package C2b)

Sproutle gained CANDIDATE turnaround + expression sheets and Wispkin gained
CANDIDATE turnaround views (`candidate-turnaround.png` /
`candidate-expressions.png` in each pack, with a `CANDIDATE-SHEETS-RECORD.md`
carrying the per-view anchor grades). CANDIDATE is not canon: the owner locks
sheets only after seeing them. Wispkin expressions remain GAP: the C2b
candidate expression sheet FAILED its anchor check (the generator duplicated
the mask - one worn as a face, a second held - breaking the held-not-worn
anchor in every panel) and was not landed. Sproutle was seeded only from the
cleaned cutout; the baked-shadow v1 file was not used.

## Candidate views (2026-10-28, Work Package C2a)

Mochii and Gabu gained CANDIDATE turnaround + expression sheets
(`candidate-turnaround.png`, `candidate-expressions.png` in each pack, with a
`CANDIDATE-SHEETS-RECORD.md` carrying the per-view anchor grades). CANDIDATE is
not canon: the owner locks sheets only after seeing them. With Work Packages
C, C2a and C2b landed, every pilot-cast pack now carries CANDIDATE non-front
views except Wispkin expressions, which remain GAP after the failed C2b
attempt (see the C2b note above).
