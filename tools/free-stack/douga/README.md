# Douga — Pen-First Cel Animation (Windows-only)

**Version:** build 1116, updated 2026-11-17 13:18 UTC · **Licence:** free (see watermark note)
**Upstream:** https://douga.app · https://keihoag.itch.io/douga (author: keihoag)
**Staged:** 2026-11-20, branch `tools/free-stack-wireup-20261120` (Harmony + free-stack wire-up).
Binaries live on the release, not in this repo.
Source: dream-girl branch `tools/production-stack-free`, `sweep/douga/README.md`.

## Verdict

VERIFIED REAL, LANDED on the release via a browser download (2026-11-20).
Pen-first cel animation with a real dope sheet.

- Price: **free · no installer · no account**
- Tagline: "Pen-first cel animation with a real dope sheet."
- Platform: **Windows 10 / 11, 64-bit ONLY** — `douga.exe`, Direct3D 11;
  Wacom / XP-Pen / Huion / Surface Pen. No Linux build, no macOS build.
- Features: pressure-sensitive brush engine (ink, pencil, splatter,
  marker, airbrush; custom `.dbrush` files), stabilizer, perspective/
  grid/symmetry guides, drop a GLB/GLTF/OBJ to trace over, real dope
  sheet (keys, holds, loops, exposure on ones/twos, warm/cool onion
  skin), scenes > cuts > layers, managed palettes (`.dpal`), one `.dga`
  file per project.
- Export: PNG sequence, GIF, APNG, H.264 MP4 with sound, built in.
- Status: beta, one person's program. "It draws, it times, it saves, it
  exports." Vector layers + more of the shooting stage (glow, focus,
  motion blur) are next, not shipped.

> **Watermark — say so plainly:** free exports carry a small
> "made with douga.app" line in the bottom-right corner. A licence key
> from douga.app/buy removes it. The tool itself is free; the
> watermark-free export is paid. Do not present Douga as watermark-free.

## Binary pulled

- File: `browser-download-20261120T160026.367892390Z-0-douga-windows.zip`
  (Windows build zip, browser download)
- Size: 3,766,009 B
- SHA-256: `bf3bd41c5593736caf4b7d74ebcf4c00c52766691c3596f3d3c7b34a9ea0b774`
- Release: `production-stack-free-20261120` on mhvnsnt/dream-girl
- Contents verified: Douga/douga.exe 6,263,648 B, EULA.txt, lang/en.ini + ja.ini,
  plugins (effects blur/levels/mosaic/noise/sample_invert/smooth, ffmpeg exporter).
- Related plugins NOT pulled: douga-rig-import.zip 190 kB, brush_convert 279 kB,
  video_import 83 kB, update_check 85 kB, poses 13 MB.

## Stage it serves

Pen-first cel animation with a real dope sheet — the TVPaint-adjacent
slot for hand-drawn timing work. Complements Pencil2D (Linux, pulled)
and Tahoma2D (in stack).

## Honest limits

- Windows-only. Beta, single author. Watermark on free exports (see above).
- Windows-only is a hard limit on a Linux VM: even pulled, it can only
  be staged for Windows — run it on a Windows machine or a Windows GPU
  route, never presented as Linux-runnable.

## Licence

Freeware (free to use; watermark-free export is a paid key). No purchase,
no account, no card needed for the free build. Source + terms logged
honestly next to the item; licence never gated the pull.
