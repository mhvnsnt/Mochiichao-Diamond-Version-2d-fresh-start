#!/usr/bin/env python3
"""Build TI2V-5B LoRA training sets for Dorowani + Wispkin from REFERENCE PACK stills.

Primary source (owner clarification 2026-10-28): the multi-view stills in the
characters' reference packs —
  <repo>/show/production/tooling/avatar-stack/reference-packs/<character>/
(read pack.json's `views` map; every view with status CANON and a file enters
the dataset). A parallel sheets audit is inventorying exactly which views each
pack holds; this builder takes the pack as it finds it and REPORTS short slots
as dataset gaps — it never invents a view and never labels generated art canon.

Expansion recipe mirrors the repo's own round-1 builder
(avatar-stack/lora/build_datasets.py): plain backgrounds (white/black/cream/
gray) x scales, upper-body and head crops, trigger-first captions. Flip rule is
canon: Wispkin NEVER flipped (asymmetric cracked mask), Dorowani flip allowed.

Outputs (for character <c>):
  aitoolkit/datasets/<c>/<c>_NNN.png + .txt     (ai-toolkit stills form)
  diffsynth/dataset/<c>/stills/<c>_NNN.png      (stills the clips render from)
  diffsynth/dataset/<c>/metadata.csv            (rows for make_clips.py output)
  BUILD-REPORT-<c>.json                         (sources, sha256, view gaps)

Usage:
  python3 build_dataset_from_refpacks.py --pack-root /path/to/reference-packs \
      --character dorowani|wispkin [--out .]

Expects Pillow. Backgrounds are flat fields — no baked shadows anywhere.
"""
import argparse, csv, hashlib, json, os, sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow required: pip install Pillow")

CHARS = {
    "wispkin": {
        "trigger": "wispkin_mochii",
        "desc": ("Wispkin, a small ghost creature with a round black shadowy body, a cracked white skull mask "
                 "with two round black eye holes held by two small black hands, a black flame tip on top of its head, "
                 "and a wispy black smoke tail dissolving below"),
        "flip": False,
    },
    "dorowani": {
        "trigger": "dorowani_mochii",
        "desc": ("Dorowani, a blue bipedal crocodile-like creature with a tall blue dorsal fin on its head, "
                 "red star-shaped cheek fins, red oval eyes, a long snout with small fangs, a pale cream belly, "
                 "long blue arms with clawed webbed hands, and a tan segmented shell on its back"),
        "flip": True,
    },
}
STYLE = "flat 2D cartoon illustration, clean black outlines, cel shading"
BGS = {"white": (255, 255, 255), "black": (16, 16, 16), "cream": (245, 238, 220), "gray": (160, 160, 160)}
VIEW_TAGS = {
    "front": "front view", "three_quarter": "three-quarter view", "side": "side view",
    "back": "back view", "expressions": "close-up of the face",
}
MIN_PER_VIEW = {"front": 8, "three_quarter": 6, "side": 6, "back": 6, "expressions": 6}


def sha256(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()


def trim_rgba(im):
    bbox = im.getchannel("A").getbbox()
    return im.crop(bbox) if bbox else im


def place(src_rgba, bg_rgb, canvas=512, frac_h=0.92, flip=False, upper=False, head=False):
    im = trim_rgba(src_rgba.copy())
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    if head:
        im = im.crop((0, 0, im.width, int(im.height * 0.48)))
    elif upper:
        im = im.crop((0, 0, im.width, int(im.height * 0.68)))
    scale = (canvas * frac_h) / im.height
    im = im.resize((max(1, int(im.width * scale)), int(canvas * frac_h)), Image.LANCZOS)
    out = Image.new("RGB", (canvas, canvas), bg_rgb)
    out.paste(im, ((canvas - im.width) // 2, canvas - im.height - int(canvas * 0.03)), im)
    return out


def caption(cfg, view_slot, bg_name, kind):
    view = VIEW_TAGS.get(view_slot, view_slot)
    scope = {"full": "full body", "upper": "upper body", "head": "close-up of the face"}[kind]
    return f"{cfg['trigger']}, {cfg['desc']}, {view}, {scope}, on a plain {bg_name} background, {STYLE}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pack-root", required=True, help="path to reference-packs/ (repo checkout)")
    ap.add_argument("--character", required=True, choices=list(CHARS))
    ap.add_argument("--out", default=os.path.dirname(os.path.abspath(__file__)))
    a = ap.parse_args()
    cfg = CHARS[a.character]
    pack_dir = os.path.join(a.pack_root, a.character)
    pack = json.load(open(os.path.join(pack_dir, "pack.json")))
    views = pack.get("views", {})

    ai_dir = os.path.join(a.out, "aitoolkit", "datasets", a.character)
    still_dir = os.path.join(a.out, "diffsynth", "dataset", a.character, "stills")
    os.makedirs(ai_dir, exist_ok=True)
    os.makedirs(still_dir, exist_ok=True)

    items, gaps, sources = [], [], []
    n = 0
    for slot, v in views.items():
        if v.get("status") != "CANON" or not v.get("file"):
            gaps.append({"view": slot, "status": v.get("status", "ABSENT"),
                         "note": "slot not CANON in pack at build time — pending sheets-audit confirmation; NOT assumed absent from the pack's staged stills"})
            continue
        src = os.path.join(pack_dir, v["file"])
        sources.append({"view": slot, "file": src, "sha256": sha256(src)})
        im = Image.open(src).convert("RGBA")
        variants = []
        for bg_name, bg_rgb in BGS.items():
            variants.append((bg_name, bg_rgb, "full", False))
        variants += [("white", BGS["white"], "upper", False), ("white", BGS["white"], "head", False),
                     ("black", BGS["black"], "upper", False)]
        if cfg["flip"]:
            variants.append(("white", BGS["white"], "full", True))
        for bg_name, bg_rgb, kind, flip in variants:
            n += 1
            stem = f"{a.character}_{n:03d}"
            img = place(im, bg_rgb, flip=flip, upper=(kind == "upper"), head=(kind == "head"))
            img.save(os.path.join(ai_dir, stem + ".png"))
            img.save(os.path.join(still_dir, stem + ".png"))
            cap = caption(cfg, slot, bg_name, kind)
            open(os.path.join(ai_dir, stem + ".txt"), "w").write(cap)
            items.append({"stem": stem, "view": slot, "kind": kind, "bg": bg_name,
                          "flipped": flip, "caption": cap})
        if len([i for i in items if i["view"] == slot]) < MIN_PER_VIEW.get(slot, 0):
            gaps.append({"view": slot, "status": "THIN",
                         "note": f"only {len([i for i in items if i['view']==slot])} items vs spec minimum {MIN_PER_VIEW.get(slot)}"})

    meta_path = os.path.join(a.out, "diffsynth", "dataset", a.character, "metadata.csv")
    with open(meta_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["video", "prompt"])
        w.writeheader()
        for it in items:
            w.writerow({"video": it["stem"] + ".mp4", "prompt": it["caption"]})

    report = {"character": a.character, "trigger": cfg["trigger"], "sources": sources,
              "items": len(items), "gaps": gaps,
              "note": "Views are read from the reference pack as found. GAP rows mean 'not CANON in the pack folder at build time' — the parallel sheets audit is the authority on the pack's full staged contents."}
    json.dump(report, open(os.path.join(a.out, f"BUILD-REPORT-{a.character}.json"), "w"), indent=2)
    print(f"{a.character}: {len(items)} items from {len(sources)} pack views; gaps: {[g['view'] for g in gaps]}")
    print(f"report -> BUILD-REPORT-{a.character}.json ; metadata -> {meta_path}")


if __name__ == "__main__":
    main()
