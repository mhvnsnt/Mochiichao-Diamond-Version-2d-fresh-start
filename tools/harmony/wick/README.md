# Wick Editor — Flash-Style Vector Animation + Games

**Version:** 1.19.0 (pre-release, 2020-12-11) · **Licence:** GPL-3.0
(free, open source)
**Upstream:** https://www.wickeditor.com/ · https://github.com/Wicklets/wick-editor
**Staged:** 2026-11-20, branch `tools/free-stack-wireup-20261120` (Harmony + free-stack wire-up).
Binaries live on the release, not in this repo.

> **STALE DESKTOP — say so plainly:** the newest official DESKTOP release is
> the 1.19.0 pre-release from 2020-12-11 — the desktop Electron builds have
> not been re-cut since, though the web editor at editor.wickeditor.com and
> the community forum stayed active into 2026, and a community fork
> (Candlestick) carries the spirit forward. The 1.19.0 Linux AppImage is
> real and verified below; treat it as a stable-but-old seat, not a live
> project.

## Landed binary (verified)

| | |
|---|---|
| Release | `harmony-equivalents-20261120` on mhvnsnt/dream-girl |
| Asset | `Wick.Editor-1.19.0.AppImage` (upstream name `Linux_Wick.Editor-1.19.0.AppImage`) |
| Size | 216,087,317 B (matches upstream asset size exactly) |
| SHA-256 (observed) | `92ff24c6f162e0144108d6dd47bf5f6d6ca6972d405c21b73c6da3a7d35f059b` — **no upstream checksum file is published for this release**, so this is the observed hash of the downloaded file, recorded here |
| Format | AppImage, Type 2 (squashfs v4.0 payload at offset 188392, block 131072, 112 inodes, bytes_used 215,673,152) |

Contents verified by a read-only in-memory squashfs parse (111/111 entries
resolved): `AppRun`, `wick-editor` binary (115,543,344 B),
`wick-editor.desktop`, `resources/app.asar`, `libEGL.so`, `libGLESv2.so`.
A complete Electron app — the real desktop build, not a stub.

## What it is

A free and open-source tool for creating games, animations and everything
in-between, in the browser or on the desktop — Adobe Flash in spirit:
vector drawing, frame-by-frame animation, symbols, motion tweens, a
timeline, and in-editor JavaScript scripting so clips can be interactive
games. Runs at editor.wickeditor.com with nothing to install; this AppImage
is the offline desktop (Electron) build of the same editor.

## Install / run

```bash
# From our release (recommended — verified copy):
gh release download harmony-equivalents-20261120 --repo mhvnsnt/dream-girl \
  --pattern 'Wick.Editor-1.19.0.AppImage'
chmod +x Wick.Editor-1.19.0.AppImage
./Wick.Editor-1.19.0.AppImage
# No FUSE: extract instead of mounting:
LD_LIBRARY_PATH=<dir-with-libfuse.so.2> ./Wick.Editor-1.19.0.AppImage --appimage-extract
./squashfs-root/AppRun
# Or just use the web editor: https://editor.wickeditor.com/
```

Electron app — if GPU-backed rendering is wanted, use a GPU route
(Kaggle GPU / Colab / Lightning AI / Oracle); the web editor runs anywhere.

## Harmony comparison

| Harmony does | Wick covers | Gap |
|---|---|---|
| Vector drawing + timeline | Vector drawing, timeline, symbols, motion tweens | No bone rigging, no deformers, no IK |
| Frame-by-frame | Yes — Flash-style frame-by-frame | No X-sheet / pegs / camera |
| Interactivity / scripting | In-editor JavaScript, games + interactive clips | Nothing like this in Harmony — a Wick-only strength |
| Node compositing | No | Tahoma2D / OpenToonz cover compositing |
| Maintenance | **Desktop builds stale since 2020** (web editor + forum live) | Prefer the web editor or Synfig for anything new |

**Verdict:** the Flash-shaped seat in the stack — best free option for
quick vector cartoons and interactive/game-like clips. Not a Harmony
replacement (no rigging, no compositing, old desktop build), but the only
tool here that does timeline + code, and the most approachable for fast
sketches.

## Licence

GPL-3.0. Repo integration is legal — document the version pin on upgrade.
Source + licence logged honestly next to the item; licence never gated the pull.
