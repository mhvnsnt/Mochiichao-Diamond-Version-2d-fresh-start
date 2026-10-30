# Fork Dorowani frames restore — 2026-10-28

Source: mhvnsnt/Mochiichao-Diamond-Version-2d-public-fork @ main 2adedde8
("MOVED — work now happens in the private fresh-start repo"; the fork is
kept for reference only, and this restore brings its surviving runtime
frames into the fresh-start restore line).

Why: the fresh-start tree (PR #99, 220850ee) contains
src/assets/walk-frames/dorowani/dorowani.walk.json, which lists the plain
walk frames dorowani_walk_down_0/1, up_0/1, left_0/1, right_0/1 — but those
files themselves were missing from the fresh-start tree (only the
dorowani-walkfix-20261026 rebuilt variants existed, under a different
folder). The same gap applied to the hurt atlas cell
dorowani_hurt_cell_00.png. The fork tree still had all of them.

What this PR adds (21 files, 0 deletions, additions only):
- 8 walk frames under src/assets/walk-frames/dorowani/
- 1 hurt cell under src/assets/sprite-atlases/animation/hurt/dorowani/
- the same 9 frames under sprite-art/ (source copies) + the 2
  media-generation source files (hurt PNG, walk WEBP)
- this note

NOT brought over: MOVED-TO-PRIVATE-REPO.md (fork-specific notice, not
game content). No file in the fresh-start tree was modified or deleted;
the differing src files (IntroSequence, species, learnsets, menu data)
were left alone — fresh-start's versions are newer (Oct 28) than the
fork's (Oct 27) for those, so overwriting them with fork copies would
have been a regression.

Verification: after merge into the restore line, the walk manifest's 8
listed frames and the hurt cell must resolve to files at the paths
above. Play-verify (phone, portrait): Dorowani overworld walk in all
four directions + hurt frame, before any Netlify publish.
