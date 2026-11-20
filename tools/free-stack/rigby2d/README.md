# Rigby2D — 2D Skeletal Animation (Spine / Moho Cover)

**Version:** 0.5.1 (release tag `v0.5.1`) · **Licence:** Apache-2.0
**Upstream:** https://github.com/jaisurya-dev-art/rigby2d — docs: rigby2d.com/docs
**Staged:** 2026-11-20, branch `tools/free-stack-wireup-20261120` (Harmony + free-stack wire-up).
Binaries live on the release, not in this repo.
Source: dream-girl branch `tools/production-stack-free`, `sweep/rigby2d/README.md`.

## Verdict

PULLED and verified. The strongest live Spine/Moho cover found in the
sweep: a real, actively developed open-source 2D skeletal animation
editor with a Linux AppImage — the role DragonBones' dead editor used
to hold. Repo last push: 2026-11-19 (active).

Features (project description): open-source 2D skeletal animation
editor for games and film. AutoRig layered PSDs, animate with
meshes, IK and physics, lip-sync from audio, render video, export
JSON/.skel. JavaScript, Rust, Godot and Unity runtimes. Built-in MCP
server for AI assistants.

## Binary pulled

- File: `Rigby2D_0.5.1_amd64.AppImage`
- Size: 96,979,448 B (matches published release asset size exactly)
- SHA-256: `27afa7de71a43e2fe45f27e605176a62b9a559db4b7f5f00f3a105870bdbd6ee`
- Verified against the project's published `SHA256SUMS.txt`: **OK**
- Release: `production-stack-free-20261120` on mhvnsnt/dream-girl
- Also published (not pulled): `.deb`, Godot/Unity/Phaser/Pixi
  runtimes, `SHA256SUMS.txt`.

## Extract + probe (2026-11-20, Linux VM)

- `--appimage-extract` exit 0, no FUSE needed. Extracted 280M.
- Contents: `AppRun`, `AppRun.wrapped`, `Rigby2D.desktop`,
  `usr/bin/rigby2d`.
- GUI app. The built-in MCP server is a later-lane integration
  candidate, not tested here.

> **GPU route:** Rigby2D is GPU-dependent (EGL). Run its GPU smoke test
> on a GPU route — Kaggle GPU / Colab / Lightning AI / Oracle (the
> coordinator owns GPU routing). Never a dead end: the route is named
> here, the test runs there.

## Stage it serves

2D skeletal/bone rig + mesh animation with game-engine runtimes — the
Spine slot (replacing the dead DragonBones editor) and the Moho slot
(vector/mesh rig + IK + physics). Exports JSON/.skel, so it can feed
engines directly.

## Honest limits

- v0.5.1 is young and moving fast (0.x); API/format stability is not
  Spine-grade yet. No production history on our shots.
- No headless/CLI proof run done here; GUI-only probing so far.

## Licence

Apache-2.0. Repo integration is legal — document the version pin on upgrade.
Source + licence logged honestly next to the item; licence never gated the pull.
