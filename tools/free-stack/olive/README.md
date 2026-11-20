# Olive Video Editor — Secondary / Alpha NLE

**Version:** 0.2.0-nightly (build `8ac191ce`, rebuild of master from
2024-12-04; last code change 2023-09-24) · **Licence:** GPL-3.0
**Upstream:** https://github.com/olive-editor/olive
**Staged:** 2026-11-20, branch `tools/free-stack-wireup-20261120` (Harmony + free-stack wire-up).
Binaries live on the release, not in this repo.
Source: dream-girl branch `tools/production-stack-free`, `sweep/olive/README.md`.

## Verdict

PULLED and verified — as the SECONDARY / ALPHA editor, not the primary.
Kdenlive (see `../kdenlive/`) is the primary free editor: stable,
maintained, current. Olive is the node-based promise that stalled.

Repo last push: 2024-12-05. The project is PAUSED, not dead: the
official site now serves an "Olive will return" placeholder; the
0.1.0 alpha and this 0.2.0-nightly are the only GitHub binaries.

Design: free, node-based, non-linear editor; billed by the project
as a fully-featured alternative to high-end professional editors.
The README itself calls Olive alpha software and highly unstable.

## Binary pulled

- File: `Olive-8ac191ce-Linux-x86_64.AppImage`
- Size: 154,107,880 B (matches published release asset size exactly)
- SHA-256: `30a6c0d18dfb4ff77addd06984348656fd69d153cfa913eb3cde56a60aa14160` (computed locally 2026-11-20; no published sums to check against)
- Release: `production-stack-free-20261120` on mhvnsnt/dream-girl
- Note: the project publishes no SHA256SUMS file for this release, so
  verification is size-exact + GitHub release provenance, not a
  hash-against-published-sums check (unlike AniCraft/Rigby2D).

## Extract + headless probe (2026-11-20, Linux VM)

- `--appimage-extract` exit 0, no FUSE needed. Extracted 353M.
- Contents: `AppRun`, `org.olivevideoeditor.Olive.desktop`,
  `usr/bin/olive-editor`, plus `crashpad_handler` and
  `olive-crashhandler` (it ships its own crash handler — consistent
  with the alpha/unstable status).
- GUI app. Note the AppImage needs FUSE 2 to run normally (per
  community install guides); extraction works without it.

## Stage it serves

Video editing — node-based timeline/compositing experiments, and a
fallback if Kdenlive ever blocks. NOT the primary editor.

## Honest limits

- Alpha, unstable by its own README; community reports freezes
  several times per hour on the stock AppImage. No releases since
  Dec 2024; no code changes since Sep 2023.
- Do NOT cut anything deadline-critical in Olive. Kdenlive is the
  editor for real work.

## Licence

GPL-3.0. Repo integration is legal — document the version pin on upgrade.
Source + licence logged honestly next to the item; licence never gated the pull.
