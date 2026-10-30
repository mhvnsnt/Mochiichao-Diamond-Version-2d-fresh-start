"""Blender blocking seat (gap G17) - rough 3D layout for a cut.

Runs INSIDE Blender (headless):  blender -b --factory-startup \
    -P blender_blocking.py -- --sheet cut.xsheet.json --out blocking-dir

Reads the cut's X-sheet and builds a proxy blockout:
  * stage: ground, path, Garden Gate proxy (posts + lintel + bushes)
    for the 'garden' staging; a plain white void for the 'white'
    staging - visibility keyframed at the sheet's background event;
  * character proxy (Mochii teardrop) keyframed through the sheet's
    head-track waypoints (M/L/R plate positions), stepped on threes
    per the sheet's pose rate;
  * camera keyframed from the sheet's camera track ('push-in-Npct'
    becomes an eased dolly of the matching framing scale).
Renders the whole cut with the Workbench engine (flat proxy shading -
this is a layout tool, not a finish) and lets the driver assemble
the mp4. Positions are plate-space: 60 px = 1 unit, plate centre = 0.
"""
import json
import math
import sys
from pathlib import Path

import bpy

PLATE_W = 960.0
PX_PER_UNIT = 60.0
WAYPOINT_X = {"L": 450.0, "M": 480.0, "R": 502.0}


def plate_x_to_world(px):
    return (px - PLATE_W / 2.0) / PX_PER_UNIT


def ease_out(t):
    return 1 - (1 - t) ** 3


def smoothstep(t):
    return t * t * (3 - 2 * t)


def main():
    argv = sys.argv[sys.argv.index("--") + 1:]
    args = dict(zip(argv[::2], argv[1::2]))
    sheet = json.loads(Path(args["--sheet"]).read_text())
    out = Path(args["--out"])
    frames_dir = out / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)
    duration = int(sheet["duration_frames"])
    fps = int(sheet.get("fps", 24))

    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "FLAT"
    scene.display.shading.color_type = "OBJECT"
    scene.render.resolution_x = 480
    scene.render.resolution_y = 270
    scene.render.fps = fps
    scene.frame_start = 1
    scene.frame_end = duration
    scene.render.filepath = str(frames_dir / "f_")
    scene.render.image_settings.file_format = "PNG"

    def box(name, loc, scale, colour, parent_set):
        bpy.ops.mesh.primitive_cube_add(location=loc)
        ob = bpy.context.object
        ob.name = name
        ob.scale = scale
        ob.color = (*colour, 1.0)
        parent_set.append(ob)
        return ob

    def ball(name, loc, scale, colour, parent_set):
        bpy.ops.mesh.primitive_uv_sphere_add(location=loc)
        ob = bpy.context.object
        ob.name = name
        ob.scale = scale
        ob.color = (*colour, 1.0)
        parent_set.append(ob)
        return ob

    garden, white = [], []
    # --- garden staging -------------------------------------------------
    box("ground", (0, 2, -0.1), (9, 5, 0.1), (0.45, 0.62, 0.38), garden)
    box("path", (0, -1.5, -0.04), (1.6, 3.4, 0.06), (0.78, 0.72, 0.6), garden)
    box("gate-post-L", (-2.6, 3.4, 1.6), (0.28, 0.28, 1.6), (0.4, 0.3, 0.22), garden)
    box("gate-post-R", (2.6, 3.4, 1.6), (0.28, 0.28, 1.6), (0.4, 0.3, 0.22), garden)
    box("gate-lintel", (0, 3.4, 3.3), (2.9, 0.3, 0.28), (0.45, 0.34, 0.25), garden)
    ball("bush-L", (-4.4, 3.0, 0.7), (1.3, 1.0, 0.75), (0.3, 0.5, 0.28), garden)
    ball("bush-R", (4.4, 3.0, 0.7), (1.3, 1.0, 0.75), (0.3, 0.5, 0.28), garden)
    # --- white void staging --------------------------------------------
    box("white-ground", (0, 2, -0.12), (9, 5, 0.1), (0.95, 0.95, 0.95), white)
    box("white-back", (0, 6.5, 3), (9, 0.1, 3.2), (0.97, 0.97, 0.97), white)

    # background switch from the sheet (default: garden whole cut)
    bg_events = sorted(sheet["tracks"].get("background", []),
                       key=lambda e: e["frame"])
    switch_blender_frame = None
    for e in bg_events:
        if e["value"] == "white" and e["frame"] > 0:
            switch_blender_frame = e["frame"] + 1  # sheet f -> blender f+1
    for ob in garden:
        ob.hide_render = False
        ob.keyframe_insert("hide_render", frame=1)
        if switch_blender_frame:
            ob.hide_render = True
            ob.keyframe_insert("hide_render", frame=switch_blender_frame)
    for ob in white:
        if switch_blender_frame:
            ob.hide_render = True
            ob.keyframe_insert("hide_render", frame=1)
            ob.hide_render = False
            ob.keyframe_insert("hide_render", frame=switch_blender_frame)
        else:
            ob.hide_render = True

    # --- character proxy: teardrop from a lathe profile -----------------
    bpy.ops.mesh.primitive_uv_sphere_add(location=(0, 0, 0))
    char = bpy.context.object
    char.name = "mochii-proxy"
    char.scale = (0.62, 0.55, 0.85)
    char.color = (0.35, 0.72, 0.95, 1.0)
    # taper the top verts toward a drop point
    me = char.data
    for v in me.vertices:
        t = max(0.0, v.co.z)  # 0..1 over the top half
        v.co.x *= (1 - 0.45 * t)
        v.co.y *= (1 - 0.45 * t)
        v.co.z *= (1 + 0.35 * t)

    head_events = sorted(sheet["tracks"].get("head", []),
                         key=lambda e: e["frame"])
    waypoints = [(e["frame"], plate_x_to_world(WAYPOINT_X[e["value"]]))
                 for e in head_events if e["value"] in WAYPOINT_X]
    if not waypoints:
        waypoints = [(0, 0.0)]

    def char_x(sheet_frame):
        if sheet_frame <= waypoints[0][0]:
            return waypoints[0][1]
        for (f0, x0), (f1, x1) in zip(waypoints, waypoints[1:]):
            if f0 <= sheet_frame <= f1:
                t = smoothstep((sheet_frame - f0) / max(1, f1 - f0))
                return x0 + (x1 - x0) * t
        return waypoints[-1][1]

    for bf in range(1, duration + 1):
        sf = bf - 1
        stepped = sf - (sf % 3)  # body moves on threes (sheet pose rate)
        char.location = (char_x(stepped), 0.0, 0.85)
        char.keyframe_insert("location", frame=bf)

    # --- camera ----------------------------------------------------------
    cam_data = bpy.data.cameras.new("cam")
    cam = bpy.data.objects.new("cam", cam_data)
    scene.collection.objects.link(cam)
    scene.camera = cam
    cam_data.lens = 32
    base_loc = (0.0, -13.5, 3.1)
    cam.rotation_euler = (math.radians(84), 0, 0)
    cam_events = sorted(sheet["tracks"].get("camera", []),
                        key=lambda e: e["frame"])
    push = None
    for e in cam_events:
        v = str(e.get("value", ""))
        if v.startswith("push-in-"):
            push = (e["frame"], float(v.split("-")[2].rstrip("pct")) / 100.0)
    for bf in range(1, duration + 1):
        sf = bf - 1
        dist = 1.0
        if push and sf >= push[0]:
            t = ease_out((sf - push[0]) / max(1, duration - push[0]))
            dist = 1.0 - push[1] * t / (1 + push[1])  # dolly for +N% framing
        cam.location = (base_loc[0], base_loc[1] * dist, base_loc[2])
        cam.keyframe_insert("location", frame=bf)

    bpy.ops.render.render(animation=True)
    print("BLOCKING_RENDER_DONE frames:", duration)


if __name__ == "__main__":
    main()
