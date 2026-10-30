#!/usr/bin/env python3
"""Render DiffSynth training clips from reference-pack stills.

DiffSynth-Studio's TI2V-5B LoRA recipe trains on VIDEO (49 frames, first frame
= the TI2V conditioning image). This renders each still built by
build_dataset_from_refpacks.py into a 49-frame, 832x480, locked-off clip with
a subtle scale "breathing" (ffmpeg zoompan). Same pixels, no redraw — the same
principle as the repo's TextRig frames, which deform canon pixels and were
accepted round-1 training sources. No baked shadows: the stills sit on plain
fields already.

Usage:
  python3 make_clips.py --character dorowani|wispkin [--fps 16]
Reads  diffsynth/dataset/<c>/stills/*.png + metadata.csv (same folder)
Writes diffsynth/dataset/<c>/<stem>.mp4 for every metadata row.
Requires ffmpeg on PATH.
"""
import argparse, csv, os, subprocess, sys

FRAMES, W, H = 49, 832, 480


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--character", required=True, choices=["dorowani", "wispkin"])
    ap.add_argument("--fps", type=int, default=16)
    ap.add_argument("--base", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "diffsynth", "dataset"))
    a = ap.parse_args()
    d = os.path.join(a.base, a.character)
    rows = list(csv.DictReader(open(os.path.join(d, "metadata.csv"))))
    if not rows:
        sys.exit("metadata.csv is empty — run build_dataset_from_refpacks.py first")
    for r in rows:
        stem = os.path.splitext(r["video"])[0]
        src = os.path.join(d, "stills", stem + ".png")
        dst = os.path.join(d, r["video"])
        if not os.path.exists(src):
            print(f"SKIP {r['video']}: still {src} missing (dataset gap — see BUILD-REPORT)")
            continue
        # pad still onto an 832x480 plain field, then a gentle 1.00->1.04 zoom over 49 frames
        vf = (f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
              f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:white,"
              f"zoompan=z='1+0.04*on/{FRAMES}':d={FRAMES}:s={W}x{H}:fps={a.fps}")
        subprocess.run(["ffmpeg", "-y", "-loop", "1", "-i", src, "-vf", vf,
                        "-frames:v", str(FRAMES), "-c:v", "libx264", "-pix_fmt", "yuv420p", dst],
                       check=True, capture_output=True)
        print("wrote", dst)
    print("done. First frame of each clip is the pack still itself (TI2V input_image).")


if __name__ == "__main__":
    main()
