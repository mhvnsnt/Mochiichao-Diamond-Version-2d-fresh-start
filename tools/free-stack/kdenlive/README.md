# Kdenlive — Primary Free Video Editor

**Version:** 26.08.3 (released 2026-11-07; maintenance release of
the 26.08 series, includes an important security fix for manipulated
`.kdenlive` project files — upgrade advised by the project)
· **Licence:** GPL-3.0 (KDE project)
**Upstream:** https://kdenlive.org/ — downloads at
https://download.kde.org/stable/kdenlive/26.08/linux/
**Staged:** 2026-11-20, branch `tools/free-stack-wireup-20261120` (Harmony + free-stack wire-up).
Binaries live on the release, not in this repo.
Source: dream-girl branch `tools/production-stack-free`, `sweep/kdenlive/README.md`.

## Verdict

PULLED and verified. The PRIMARY free video editor for the stack:
stable, actively maintained, current release. Olive (see `../olive/`)
is the secondary/alpha editor only.

Features: multi-track non-linear editing, nested sequences,
multicam, 3-point editing, markers, automatic backups, proxy
editing, motion tracking, colour correction, video scopes
(histogram, vectorscope, RGB parade, waveform), subtitling,
speech-to-subtitles.
Platforms: Linux (AppImage / Flatpak — the only two Linux formats
the Kdenlive team supports), Windows, macOS, BSD.

## Binary pulled

- File: `kdenlive-26.08.3-x86_64.AppImage`
- Size: 214,346,232 B (confirmed by Content-Length from the KDE
  mirror and by the completed download)
- SHA-256: `2c8322edfc86605e4c98a78a019310d9b4fc46bb8e94e6fe313dc7dd987e7671`
  (published by KDE alongside the AppImage; verified locally with
  `sha256sum -c`)
- Release: `production-stack-free-20261120` on mhvnsnt/dream-girl

## Extract + probe (2026-11-20, Linux VM)

- `--appimage-extract` exit 0, no FUSE needed.
- Contents: `AppRun`, `org.kde.kdenlive.desktop`, `usr/bin/kdenlive`,
  `usr/bin/kdenlive_render`, plus bundled `ffmpeg`/`ffplay`/`ffprobe`.
- GUI app.

> **GPU route:** Kdenlive uses OpenGL. Run its GPU smoke test on a GPU
> route — Kaggle GPU / Colab / Lightning AI / Oracle (the coordinator
> owns GPU routing). The Flatpak route is the project's other supported
> Linux route; AppImage is the working route here.

## Stage it serves

Video editing — the primary editor: cutting episodes, assembling
renders, subtitles, colour. This is the editing slot's real answer.

## Honest limits

- Needs proxies for smooth playback of heavy footage on low-end
  systems (the project's own guidance).
- The 26.08.3 AppImage is ~200 MB.

## Licence

GPL-3.0. Repo integration is legal — document the version pin on upgrade.
Source + licence logged honestly next to the item; licence never gated the pull.
