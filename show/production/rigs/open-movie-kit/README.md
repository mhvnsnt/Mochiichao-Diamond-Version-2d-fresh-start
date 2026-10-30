# Open-movie kit — CC-BY carry-over

This folder carries a small set of rig-constraint scripts from a
Creative Commons open-movie production tree, kept verbatim as
reference implementations for Mochiichao's 3D rig track (the
pattern they embody — rig behaviour as small, named, reusable
scripts — is written up in `../RIG-AND-SHEET-SPEC.md` §5).

## Attribution and licence

Big Buck Bunny production files — **(c) copyright Blender
Foundation | www.bigbuckbunny.org**. Licensed under the
**Creative Commons Attribution 3.0 (CC-BY 3.0)** licence, per the
licensor's own statement for Project Peach: all project results
(film, files, models, documentation) are CC-BY 3.0; logos and
trademarks are excluded from that licence and none are carried
here. The film's score is separately CC-BY-NC-ND 3.0 and is not
used.

Bucket (owner's licence-classification law): **free with
attribution** — not open source in the software sense, not a
paid licence, no non-commercial restriction on these files.

## What is here

`pyconstraints/` — the five rig-constraint scripts from
`production/chars/pyconstraints/` of the production tree:
foot roll, pivot change, rotation difference (two variants),
and bone volume preservation, written for Blender 2.4x-era
Python. Each file's MD5 was verified against the production
tree's own `MD5SUMS` before landing (record:
`../DONOR-PROVENANCE-2026-10-29.md` §A2). They are
carried **verbatim** (CC-BY permits it; attribution above) as
study/reference code. They are not wired into any Mochiichao
build as-is — a modern port would be new work under the
source-first wiring law, with these as its source.

## Provenance

Verified chain: Blender Foundation (licensor) → Internet Archive
item `bickbuckbunnyblenderfiles` → the owner's pull in
`mhvnsnt/disney-tva-bbb-pulls` release `v1.0.0`
(`bbb-production-files-2026-10-12.zip`, MD5-verified at pull time
per that repo's catalogue) → this folder. Full record:
`../DONOR-PROVENANCE-2026-10-29.md` §A2/§B1.
