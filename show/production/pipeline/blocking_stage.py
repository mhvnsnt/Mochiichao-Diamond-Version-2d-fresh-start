#!/usr/bin/env python3
"""Blender blocking stage driver (gap G17).

Seats between pipeline step 1 (board) and step 2 (sheet validation):
for shots with staging/camera questions it renders a rough 3D
blocking pass straight from the cut's X-sheet so staging is decided
in 3D before any 2D drawing time is spent.

Usage: blocking_stage.py <cut.xsheet.json> <work-dir>
Writes <work-dir>/blocking/ {frames/, blocking.mp4,
blocking-manifest.json} and validates its own outputs (frame count,
switch-frame staging change measured from pixels).
"""
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image
import numpy as np

HERE = Path(__file__).resolve().parent
BLENDER = "/usr/bin/blender"


def main():
    sheet_path = Path(sys.argv[1]).resolve()
    work = Path(sys.argv[2])
    out = work / "blocking"
    out.mkdir(parents=True, exist_ok=True)
    sheet = json.loads(sheet_path.read_text())
    duration = int(sheet["duration_frames"])

    r = subprocess.run(
        [BLENDER, "-b", "--factory-startup", "-P",
         str(HERE / "blender_blocking.py"), "--",
         "--sheet", str(sheet_path), "--out", str(out)],
        capture_output=True, text=True)
    (out / "blender.log").write_text(r.stdout + r.stderr)
    if "BLOCKING_RENDER_DONE" not in r.stdout:
        print("BLOCKING FAIL: blender did not finish; see blocking/blender.log")
        return 1
    frames = sorted((out / "frames").glob("f_*.png"))
    if len(frames) != duration:
        print(f"BLOCKING FAIL: {len(frames)} frames rendered, sheet wants {duration}")
        return 1

    subprocess.run(["ffmpeg", "-y", "-v", "error", "-framerate", "24",
                    "-i", str(out / "frames" / "f_%04d.png"),
                    "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    str(out / "blocking.mp4")], check=True)

    # measured staging check: lower-half colour saturation before vs
    # after the sheet's background switch. (Mean luminance does NOT
    # discriminate here: the garden palette is pale and the white
    # void renders light grey - 188 -> 196. Saturation does: 10.9
    # garden vs 0.9 void, measured on the CALIB-02 run.)
    def lower_sat(p):
        a = np.asarray(Image.open(p).convert("RGB"), dtype=float)
        lower = a[a.shape[0] // 2:]
        return float((lower.max(axis=2) - lower.min(axis=2)).mean())
    bg = sorted(sheet["tracks"].get("background", []),
                key=lambda e: e["frame"])
    check = {"checked": False}
    for e in bg:
        if e["value"] == "white" and e["frame"] > 0:
            before = lower_sat(frames[e["frame"] - 1])
            after = lower_sat(frames[e["frame"] + 1])
            check = {"checked": True, "switch_sheet_frame": e["frame"],
                     "lower_sat_before": round(before, 1),
                     "lower_sat_after": round(after, 1),
                     "staging_change_measured": before > after + 5}
    manifest = {
        "seat": "G17 blender-blocking",
        "sheet": str(sheet_path),
        "engine": "Blender 4.0.2, BLENDER_WORKBENCH flat proxy shading",
        "frames_rendered": len(frames),
        "duration_frames": duration,
        "camera_track": sheet["tracks"].get("camera"),
        "head_waypoints": sheet["tracks"].get("head"),
        "staging_check": check,
        "outputs": ["frames/f_0001.png ...", "blocking.mp4",
                    "blocking-manifest.json", "blender.log"],
    }
    (out / "blocking-manifest.json").write_text(json.dumps(manifest, indent=1))
    print("BLOCKING PASS:", json.dumps(check))
    return 0


if __name__ == "__main__":
    sys.exit(main())
