#!/usr/bin/env python3
"""Episode board (gap G16) - cut rhythm made measurable.

A derived view over timing data that already exists:
  * X-sheets (frame-exact cuts, the production source of truth), and
  * storyboard/spec sets (per-cut duration_s JSONs, e.g. EP01
    storyboard draft 1 - a storyboard's rhythm, NOT a finished
    episode's; the board names which kind of source it read).

For each source it reports: cut count, total runtime, mean/median/
min/max cut length, a duration distribution, and cuts per minute.
The rhythm read compares against the TV reference from the
production research (Pokemon TV spec pass, 2026-10-28): ~300+ shots
per ~21 min of content -> ~4.2 s average cut, ~14 cuts/min.

Usage: episode_board.py --out episode-board-dir \
    --xsheet CALIB-02=calibration/calib02.xsheet.json \
    --specset EP01-DRAFT1=/home/hatch/workspace/ep01-finish/EP01-V3-episode.json
Writes episode-board.json + EPISODE-BOARD.md into --out.
"""
from __future__ import annotations

import argparse
import json
import statistics
from pathlib import Path

TV_REFERENCE = {
    "source": "Pokemon TV production research 2026-10-28 (OLM: "
              ">300 shots, 4,000-5,000 drawings per ~21 min episode)",
    "avg_cut_s": 4.2,
    "cuts_per_min": 14.3,
    "content_runtime_s": 1260,
}
BUCKETS = [(0, 2), (2, 4), (4, 6), (6, 10), (10, float("inf"))]


def summarise(name, kind, durations):
    total = sum(durations)
    dist = {}
    for lo, hi in BUCKETS:
        label = f"{lo}-{hi if hi != float('inf') else '+'}s"
        dist[label] = sum(1 for d in durations if lo <= d < hi)
    return {
        "name": name, "kind": kind, "cuts": len(durations),
        "total_s": round(total, 2),
        "mean_cut_s": round(statistics.mean(durations), 2),
        "median_cut_s": round(statistics.median(durations), 2),
        "min_cut_s": round(min(durations), 2),
        "max_cut_s": round(max(durations), 2),
        "cuts_per_min": round(60.0 * len(durations) / total, 2)
        if total else 0,
        "distribution": dist,
        "durations_s": [round(d, 2) for d in durations],
    }


def rhythm_read(s):
    ref = TV_REFERENCE
    ratio = s["mean_cut_s"] / ref["avg_cut_s"]
    if s["cuts"] == 1:
        verdict = ("single-cut source: its one cut sits "
                   f"{ratio:.1f}x the TV average cut length - a "
                   "calibration unit, not an episode rhythm")
    elif ratio > 1.6:
        verdict = (f"cuts run LONG: mean {s['mean_cut_s']}s is "
                   f"{ratio:.1f}x the TV average ({ref['avg_cut_s']}s); "
                   f"{s['cuts_per_min']} cuts/min vs ~{ref['cuts_per_min']} "
                   "on the reference - expected for storyboard timing, "
                   "a gap to close at production timing")
    elif ratio < 0.6:
        verdict = (f"cuts run SHORT/fast: mean {s['mean_cut_s']}s vs "
                   f"TV average {ref['avg_cut_s']}s")
    else:
        verdict = (f"in the TV band: mean {s['mean_cut_s']}s vs "
                   f"reference {ref['avg_cut_s']}s")
    return verdict


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--xsheet", action="append", default=[],
                    help="NAME=path.xsheet.json")
    ap.add_argument("--specset", action="append", default=[],
                    help="NAME=path-to-episode.json (scenes->cuts->spec)")
    a = ap.parse_args()
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)

    boards = []
    for item in a.xsheet:
        name, path = item.split("=", 1)
        sheet = json.loads(Path(path).read_text())
        fps = float(sheet.get("fps", 24))
        boards.append(summarise(
            name, "xsheet (production timing)",
            [sheet["duration_frames"] / fps]))
    for item in a.specset:
        name, path = item.split("=", 1)
        ep = json.loads(Path(path).read_text())
        durations, missing = [], 0
        for scene in ep["scenes"]:
            for cut in scene["cuts"]:
                spec_path = Path(cut["shot"])
                if not spec_path.exists():
                    missing += 1
                    continue
                spec = json.loads(spec_path.read_text())
                durations.append(float(spec["duration_s"]))
        b = summarise(name, "spec set (storyboard draft timing)",
                      durations)
        b["specs_missing"] = missing
        boards.append(b)

    for b in boards:
        b["rhythm_read"] = rhythm_read(b)
    board = {"tv_reference": TV_REFERENCE, "sources": boards}
    (out / "episode-board.json").write_text(json.dumps(board, indent=1))

    lines = ["# Episode board - cut rhythm (gap G16)", "",
             f"TV reference: ~{TV_REFERENCE['avg_cut_s']}s average cut, "
             f"~{TV_REFERENCE['cuts_per_min']} cuts/min "
             f"({TV_REFERENCE['source']}).", ""]
    for b in boards:
        lines += [f"## {b['name']} - {b['kind']}",
                  f"- cuts: {b['cuts']} | total {b['total_s']}s | "
                  f"mean {b['mean_cut_s']}s | median "
                  f"{b['median_cut_s']}s | min {b['min_cut_s']}s | "
                  f"max {b['max_cut_s']}s | {b['cuts_per_min']} cuts/min",
                  f"- distribution: {b['distribution']}",
                  f"- rhythm read: {b['rhythm_read']}", ""]
    (out / "EPISODE-BOARD.md").write_text("\n".join(lines))
    print("\n".join(lines))


if __name__ == "__main__":
    main()
