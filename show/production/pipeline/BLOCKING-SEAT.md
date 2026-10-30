# Blocking seat (gap G17) — Blender 3D layout pass

**Tool:** Blender 4.0.2 (apt package `blender`). Licence verified from
`/usr/share/doc/blender/copyright`: GNU GPL version 2 or later.
Bucket: open source (GPL-2+).

**Where it seats:** step **1.5** of the 12-step pipeline — after the
board (step 1), before sheet validation (step 2). In TV terms this is
the layout (LO) assist: for shots with staging or camera questions —
turns, walks, perspective moves, multi-character staging — the rough
3D blockout settles composition, character placement and the camera
move in minutes, before any 2D drawing time is spent. It is requested
per cut (`run_pipeline.py --blocking`), never a silent default.

**How it works:** `blender_blocking.py` runs inside Blender headless
and reads the cut's own X-sheet — nothing is re-entered by hand:

* background track → staging sets (garden proxies / white void),
  visibility keyframed at the sheet's switch frame;
* head track → the character proxy's waypoints (plate positions
  M/L/R at 60 px = 1 unit), moved on threes per the sheet's pose rate;
* camera track → `push-in-Npct` becomes an ease-out dolly giving the
  matching framing scale change over the rest of the cut.

Rendering is the Workbench engine with flat object colours — proxy
shading on purpose: this pass answers staging questions, it is not a
finish and never ships as one.

**Driver + validation:** `blocking_stage.py <sheet> <work-dir>` runs
Blender, assembles `blocking/blocking.mp4`, writes
`blocking/blocking-manifest.json`, and validates: rendered frame
count equals the sheet's duration, and the staging change at a
background-switch frame is measured from pixels (lower-half colour
saturation before/after — plain luminance does not discriminate
these pale palettes; 10.9 garden vs 0.9 void on the proof run).

**Proof (CALIB-02, 96 frames):** `calibration/blocking-run/blocking/`
— 96 frames + blocking.mp4 + manifest. Frame 1 shows the Garden Gate
blockout (posts, lintel, bushes, path, Mochii teardrop proxy on the
path); post-switch frames show the white void with the proxy only,
matching the sheet's frame-72 background event. The same seat runs
inside the full chain: proven by the pipeline proof run with
`--blocking` recorded as step 1.5 PASS on its run card.
