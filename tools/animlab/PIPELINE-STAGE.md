# AnimLab pipeline stage — Mochiichao-Diamond-Version-2d-fresh-start

Staged 2026-11-20 on branch `tools/animlab-wireup-20261120` (AnimLab wire-up, binaries UNFETCHED — see
`tools/animlab/README.md`).

## Where AnimLab slots in

This repo mirrors the Crystal production (docs/FREE-STACK-PRODUCTION-NOTES.md, show/episodes/EP01/ animatic flow): full Pokemon-anime production, Diamond feeding Crystal one way, Crystal as the building focus, same sanitize rule (no cries, literal dialogue, logos or images). AnimLab slots in as Draw -> Rig/Tween -> Composite -> Finish for 2D episode cuts: vector drawing, Bone/Game Bone/Curve/Envelope rigging and tweening, node-graph compositing, multi-camera timeline, audio mixer, MP4/PNG export.

## Stages AnimLab covers (for this show)

1. **Draw** — vector drawing, pegs.
2. **Rig/Tween** — Bone / Game Bone / Curve / Envelope rigging, tweening.
3. **Composite** — node-graph compositing, multi-camera timeline, audio mixer.
4. **Finish** — MP4 / PNG export.

## What AnimLab does NOT do here

- It does not replace this show's existing core pipeline or its locked rules.
- It does not ship unproofed: AnimLab output goes through the same own-eyes / proof
  gate as every other stage before it reaches the owner.
- Binaries are UNFETCHED as of 2026-11-20 (itch 429). Until `fetch-animlab.sh` lands
  them on Release `animlab-v0.2.26`, this stage is docs + fetch route only.
