# Pencil2D — Hand-Drawn Frame-by-Frame Animation

**Version:** 0.7.2 (release tag `v0.7.2`) · **Licence:** GPL-2.0
**Upstream:** https://github.com/pencil2d/pencil — https://www.pencil2d.org/
**Staged:** 2026-11-20, branch `tools/free-stack-wireup-20261120` (Harmony + free-stack wire-up).
Binaries live on the release, not in this repo.
Source: dream-girl branch `tools/production-stack-free`, `sweep/pencil2d/README.md`.

## Verdict

PULLED and verified. The TVPaint-equivalent find of the sweep: a free,
open-source, raster+vector hand-drawn animation tool — the closest free
pen-first frame-by-frame tool not already in the stack. (OpenToonz and
Krita already cover adjacent ground; Pencil2D is the lightweight,
single-purpose traditional-animation option.)
Repo last push: 2026-11-13 (active). Platforms: Windows, macOS, Linux, FreeBSD.

Features: raster + vector layers in one timeline, bitmap/vector/camera/
sound layers, onion skinning, direct export to MP4, AVI, animated GIF,
PNG sequences. No automatic tweening, no skeletal bones — every
in-between is drawn by hand (by design).

## Binary pulled

- File: `pencil2d-linux-amd64-v0.7.2.AppImage`
- Size: 60,471,800 B (matches published release asset size exactly)
- SHA-256: `4034b036258b6a13d4540911ebce085f31ee18a9dacf438845ac71998d42ff91`
- Release: `production-stack-free-20261120` on mhvnsnt/dream-girl
- Note: the project publishes no SHA256SUMS file for this release, so
  verification is size-exact + GitHub release provenance, not a
  hash-against-published-sums check (unlike AniCraft/Rigby2D).

## Extract + headless probe (2026-11-20, Linux VM)

- `--appimage-extract` exit 0, no FUSE needed. Extracted 154M.
- Contents: `AppRun`, `org.pencil2d.Pencil2D.desktop`,
  `usr/bin/pencil2d`, `qt.conf`.
- GUI app. CPU-only work — no GPU route needed.

## Stage it serves

Hand-drawn frame-by-frame / cel animation — the TVPaint slot for roughs,
timing tests, and simple hand-drawn cuts. Lightweight complement to
Tahoma2D/OpenToonz, not a replacement for either.

## Honest limits

- No bones, no tweening, no mesh deformation — pure traditional
  frame-by-frame. Anything rigged still goes through the rigging seats
  (Synfig / Rigby2D).
- Small volunteer project; 0.7.2 is the current stable, not a
  studio-scale pipeline.

## Licence

GPL-2.0. Repo integration is legal — document the version pin on upgrade.
Source + licence logged honestly next to the item; licence never gated the pull.
