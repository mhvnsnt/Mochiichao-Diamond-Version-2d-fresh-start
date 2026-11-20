# AniCraft — Clean-Room Adobe Animate Reimplementation

**Version:** 0.2.1 (release tag `v0.2.1`) · **Licence:** Apache-2.0
**Upstream:** https://github.com/storytold/anicraft
**Staged:** 2026-11-20, branch `tools/free-stack-wireup-20261120` (Harmony + free-stack wire-up).
Binaries live on the release, not in this repo.
Source: dream-girl branch `tools/production-stack-free`, `sweep/anicraft/README.md`.

## Verdict

PULLED and verified. The decomp/recomp find of the sweep: a clean-room,
open-source 2D animation editor written from scratch in pure Rust,
file-compatible with Adobe Animate (XFL/FLA, SWF) per the project
description. The closest thing in the sweep to a free reimplementation of
a paid animation tool — and it is real, released, and runnable on Linux.
Repo last push: 2026-11-20 (active — pushed the same day as the sweep).

Note: a second repo of the same name, `soof-golan/anicraft`, describes
itself the same way but has NO releases; `storytold/anicraft` is the one
shipping builds.

## Binary pulled

- File: `anicraft-0.2.1-linux-x86_64.AppImage`
- Size: 19,024,376 B (matches published release asset size exactly)
- SHA-256: `352456384d1e82f373d836dcbcd9f1473b1603c5c9c7b185d763218470091b31`
- Verified against the project's published `SHA256SUMS.txt`: **OK**
- Release: `production-stack-free-20261120` on mhvnsnt/dream-girl

## Extract + headless probe (2026-11-20, Linux VM)

- `--appimage-extract` exit 0, no FUSE needed. Extracted 44M.
- Contents: `AppRun`, `ai.storyteller.anicraft.desktop`, `usr/bin/anicraft`,
  `usr/bin/anicraft-cli`.
- GUI app; the `anicraft-cli` binary is the headless candidate for a
  later lane (convert/render via CLI, if it supports it). CPU-only work —
  no GPU route needed.

## Stage it serves

2D vector/raster animation authoring — the Adobe Animate slot. Candidate
for Animate-format (XFL/FLA) interchange. NOT a core replacement for the
show's rig/animation core (see `tools/free-stack/PIPELINE-STAGE.md`).

## Honest limits

- v0.2.1 is early (0.x). No production history on our shots yet.
- FLA compatibility is claimed by the sibling fork's description, not
  yet proven by us against a real .fla — a follow-up lane must test it.
- No Windows/macOS testing done here (Linux AppImage only).

## Licence

Apache-2.0. Repo integration is legal — document the version pin on upgrade.
Source + licence logged honestly next to the item; licence never gated the pull.
