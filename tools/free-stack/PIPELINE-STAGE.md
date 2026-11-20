# Pipeline Stage — Mochiichao Diamond (Pokemon-Anime Production, Crystal Feeder)

Staged 2026-11-20, branch `tools/free-stack-wireup-20261120` (Harmony + free-stack wire-up).
Source: this repo's own `docs/FREE-STACK-PRODUCTION-NOTES.md` (same production notes
as Crystal) + dream-girl branch `tools/production-stack-free`, `PIPELINE.md`.

## Standing rules for this show

- **Same production as Crystal.** Full Pokemon-anime production: 24 fps, default
  exposure on threes (hold each drawing 3 frames) unless a beat needs ones or twos.
- **Sanitize rule (hard): no cries, no literal dialogue, no logos, no images in.**
- **Diamond feeds Crystal one way.** Roughs, timing tests, character exploration
  and pipeline proving done here flow one way into Crystal. Nothing flows back —
  Crystal is the show of record; Diamond is the feeder.
- **Per-character generation → cutout → overlay on the living plate.** One character
  per generative pass, reference pack locked (VACE); matte to transparent; overlay
  on the shared living plate; composite shadows matched to the plate (never baked
  into character art); final grade / colour last.
- **Cleanup path:** Krita for pixel-level cleanup and colour sets → Tahoma2D /
  OpenToonz for painting, animation, linked palettes, multiplane.
- **Grease Pencil / Tahoma2D stay the core.** These tools join for cleanup,
  hand-drawn 2D, compositing and rigging experiments — never presented as a core
  replacement unless verified better on our own shots.

## Stage map — where each tool sits in THIS show

### Draw (hand-drawn 2D, cleanup, roughs)
| Tool | Slot here |
|---|---|
| Pencil2D 0.7.2 | Lightweight raster+vector hand-drawn roughs, timing tests, simple hand-drawn cuts (TVPaint slot, light end). The feeder's sketch seat — roughs proven here go to Crystal. |
| Douga build 1116 | Pen-first cel timing work with a real dope sheet (keys, holds, loops, exposure on ones/twos). **Windows-only; free exports carry a small "made with douga.app" watermark.** Run on Windows. |
| Tahoma2D 1.6.3 (already wired, dream-girl) | Cleanup / hand-drawn 2D / compositing spine. Not re-pulled here. |

### Rig / Tween (cut-out + skeletal)
| Tool | Slot here |
|---|---|
| Synfig Studio 1.5.5 | **Best new pull for this show.** Bone-rigged cut-out characters + automatic vector tweening — rig a character, pose keys, let the tweener do the in-betweens. Actively maintained (2026). |
| Rigby2D 0.5.1 | Skeletal/mesh/IK/physics rigging, JSON/.skel export for game-engine runtimes — the live Spine/Moho cover. GPU-dependent (EGL): GPU route is Kaggle GPU / Colab / Lightning AI / Oracle. |
| Enve (continuous d919d4d) | **STALE (last push 2022-09-25).** Spare vector/rigging seat only — do not plan new production on it. Synfig is the live rigging pick. |
| AniCraft 0.2.1 | Flash-style vector animation, Animate-format (XFL/FLA) interchange candidate. Early alpha (0.x); FLA compat still unproven against a real .fla. |

### Motion graphics / titles
| Tool | Slot here |
|---|---|
| Glaxnimate 0.6.0 | Titles, UI motion, Lottie + animated SVG export; Kdenlive companion. **Not character rigging.** |
| Wick Editor 1.19.0 | Flash-style quick vector cartoons + interactive/game-like clips (in-editor JavaScript). **Desktop builds stale since 2020** — web editor at editor.wickeditor.com is live. |

### Composite / Finish (edit + assembly)
| Tool | Slot here |
|---|---|
| Kdenlive 26.08.3 | **Primary editor.** Cutting episodes, assembling renders, subtitles, colour. GPU route for OpenGL smoke: Kaggle GPU / Colab / Lightning AI / Oracle. |
| Olive 0.2.0-nightly | Secondary / alpha NLE only — node-based experiments and fallback. **Do NOT cut deadline work in it** (paused upstream, unstable by its own README). |
| ffmpeg / Blender | Final encode + composite path (already in stack, per dream-girl PIPELINE.md). |

## Fetch

`tools/free-stack/fetch-verify.sh` pulls all 10 tools from the two releases
(`harmony-equivalents-20261120`, `production-stack-free-20261120`) with size +
SHA-256 checks; already-verified binaries are not re-downloaded. Per-tool
versions, licences, sizes and full hashes are in each tool's README.
