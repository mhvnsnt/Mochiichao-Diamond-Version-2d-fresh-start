#!/usr/bin/env python3
"""Regions 3-5 maps + NPC wiring generator (2026-11-13).

Reads the merged dialogue JSONs + trainer files + SPECIES_DB + ink knots
(all fetched from main cd4088f1 into /tmp/r35), emits the full PR file set
into /tmp/r35/out/, and runs the PR #423-style pre-flight (exits/doors
resolve, enterAt in bounds, battle species in SPECIES_DB, ink knots exist,
trainer-teams dedupe simulation, FULL_WORLD count, encounters.json parses).

Nothing here is hand-invented canon: NPC lines come from the dialogue JSONs,
teams/rewards from the trainer rows, badge/theme names from the rows, map
keys from the dialogue mapKeys. Town display names that are verbatim
reference-game town names are NOT repeated (GAP placeholder + entry id,
per the R2 audit section 8 rule).
"""
import json, re, os, sys

BASE = "/tmp/r35"
OUT = "/tmp/r35/out"
os.makedirs(OUT, exist_ok=True)

def load_json(p):
    with open(f"{BASE}/{p}") as f:
        return json.load(f)

# ---------------------------------------------------------------- sources
SPECIES_TS = open(f"{BASE}/src/lib/species.ts").read()
# Strip // comment lines: 147/150 carry source-note comments between fields
SPECIES_TS = re.sub(r'(?m)^\s*//.*$', '', SPECIES_TS)

def parse_species(src):
    out = {}
    # "001": { id: "001", name: "Mochii", types: ["WATER"], baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    pat = re.compile(
        r'"(\d{3})": \{\s*id: "\d{3}",\s*name: "([^"]+)",\s*types: \[([^\]]+)\],\s*'
        r'baseStats: \{ hp: (\d+), atk: (\d+), def: (\d+), spa: (\d+), spd: (\d+), spe: (\d+) \}',
    )
    for m in pat.finditer(src):
        sid, name, types, hp, atk, df, spa, spd, spe = m.groups()
        t1 = re.findall(r'"([A-Z]+)"', types)[0]
        out[sid] = {"name": name, "type_raw": t1,
                    "hp": int(hp), "atk": int(atk), "def": int(df), "spe": int(spe)}
    return out

SPECIES = parse_species(SPECIES_TS)
print(f"SPECIES_DB parsed: {len(SPECIES)} entries")
assert len(SPECIES) == 49, f"expected 49 promoted species, got {len(SPECIES)}"

TYPE_DISPLAY = {"WATER": "Water", "STEEL": "Chrome", "GROUND": "Earth",
                "FIRE": "Flame", "GRASS": "Grass"}

def display_type(raw):
    return TYPE_DISPLAY.get(raw, raw.capitalize())

def parse_trainers(n):
    src = open(f"{BASE}/src/lib/trainers-region{n}.ts").read()
    pat = re.compile(
        r'\{ id: "(R\d-\d+)", trainerClass: "([^"]+)", name: "((?:[^"\\]|\\.)*)", '
        r'display: "(?:[^"\\]|\\.)*", location: "([^"]+)", ai: "([^"]+)", '
        r'team: \[(.*?)\], reward: (\d+), status: "(\w+)"(?:, note: "(?:[^"\\]|\\.)*")?(?:, statsHeld: (true|false))? \}',
    )
    rows = {}
    for m in pat.finditer(src):
        rid, tclass, name, loc, ai, team_s, reward, status = m.groups()[:8]
        team = re.findall(r'\{ speciesId: "(\d+)", level: (\d+) \}', team_s)
        rows[rid] = {"id": rid, "trainerClass": tclass, "name": name,
                     "location": loc, "ai": ai,
                     "team": [(s, int(l)) for s, l in team],
                     "reward": int(reward), "status": status}
    return rows

TRAINERS = {n: parse_trainers(n) for n in (3, 4, 5)}
for n, rows in TRAINERS.items():
    print(f"trainers region {n}: {len(rows)} rows")
    assert len(rows) == {3: 46, 4: 43, 5: 47}[n]

DIALOGUE = {n: load_json(f"src/lib/wiring/dialogue/region{n}-dialogue.json") for n in (3, 4, 5)}

def knots_of(n):
    src = open(f"{BASE}/src/lib/wiring/dialogue/region{n}-story.ink").read()
    return set(re.findall(r"^=== ([a-z0-9_]+) ===", src, re.M))

KNOTS = {n: knots_of(n) for n in (3, 4, 5)}
for n in (3, 4, 5):
    print(f"region {n}: {len(DIALOGUE[n]['entries'])} dialogue entries, {len(KNOTS[n])} ink knots")

def entry(n, eid):
    for e in DIALOGUE[n]["entries"]:
        if e["id"] == eid:
            return e
    raise KeyError(f"{eid} not in region {n}")

def entry_knot(n, eid):
    """Main talk knot for an entry: the non-_after knot starting with r{n}_<nn>."""
    prefix = eid.lower().replace("-", "_")  # R3-01 -> r3_01
    cands = [k for k in KNOTS[n] if k.startswith(prefix + "_") and not k.endswith("_after")]
    assert len(cands) == 1, f"{eid}: expected 1 main knot, got {cands}"
    return cands[0]

def npc_lines(e, speaker_sub):
    """Find an npc/antagonist/hex/dojo block by speaker substring; return its lines."""
    for npc in (e.get("npcs") or []):
        if speaker_sub.lower() in npc.get("speaker", "").lower():
            return npc["lines"]
    ant = e.get("antagonist")
    if ant and speaker_sub.lower() in ant.get("speaker", "").lower():
        return ant["lines"]
    return None

def slug(s):
    s = re.sub(r"\(.*?\)", "", s)           # drop parentheticals
    s = re.sub(r"[^A-Za-z0-9]+", "_", s).strip("_").lower()
    s = re.sub(r"_+", "_", s)
    return s or "npc"

# ---------------------------------------------------------------- TS emit
def ts_str(s):
    return json.dumps(s, ensure_ascii=False)

def team_literal(row):
    parts = []
    for sid, lvl in row["team"]:
        sp = SPECIES[sid]
        parts.append(
            f'{{id:{ts_str(sid)},name:{ts_str(sp["name"])},hp:{sp["hp"]},maxHp:{sp["hp"]},'
            f'atk:{sp["atk"]},def:{sp["def"]},spd:{sp["spe"]},moves:["Tackle","Swift Movement"],'
            f'type:{ts_str(display_type(sp["type_raw"]))},level:{lvl}}}'
        )
    return "[" + ",".join(parts) + "]"

def npc_literal(n):
    """n: dict with id,x,y,sprite,name,facing,dialog,post?,battle?(row),ink?(story,knot),isHeal?,isShop?"""
    bits = [f'id:{ts_str(n["id"])}', f'x:{n["x"]}', f'y:{n["y"]}',
            f'sprite:{ts_str(n["sprite"])}', f'name:{ts_str(n["name"])}',
            f'facing:{ts_str(n.get("facing", "down"))}']
    if n.get("isHeal"):
        bits.append("isHeal: true")
    if n.get("isShop"):
        bits.append("isShop: true")
    bits.append("dialog:[" + ",".join(ts_str(d) for d in n["dialog"]) + "]")
    if n.get("ink"):
        bits.append(f'inkStory:{ts_str(n["ink"][0])}')
        bits.append(f'inkKnot:{ts_str(n["ink"][1])}')
    if n.get("post") is not None:
        bits.append("postBattleDialog:[" + ",".join(ts_str(d) for d in n["post"]) + "]")
    if n.get("battle"):
        row = n["battle"]
        bits.append(f'battle:{{ team:{team_literal(row)}, reward:{row["reward"]}, badge:null }}')
    return "    { " + ", ".join(bits) + " }"

def battle_npc(n, row, x, y, sprite="🧢"):
    """Wired battle NPC from a trainer row. Name = class + name (R2 convention),
    except Hex (R3-001) whose display name is the row label 'lab-exit battle' —
    the NPC is named 'Hex', inline team mirrors the row exactly."""
    name = "Hex" if row["id"] == "R3-001" else f'{row["trainerClass"]} {row["name"]}'
    slug_name = "hex" if row["id"] == "R3-001" else slug(row["name"] or row["trainerClass"])
    nid = f'{row["id"].lower().replace("-", "_")}_{slug_name}'
    return {"id": nid, "x": x, "y": y, "sprite": sprite, "name": name,
            "dialog": [f'PLACEHOLDER — battle line GAP FOR MARS (trainer row {row["id"]}; Mars fills the line).'],
            "post": [f'PLACEHOLDER — post-battle line GAP FOR MARS (trainer row {row["id"]}).'],
            "battle": row}

def dialogue_npc(n, e, speaker_sub, x, y, sprite, nid=None, ink=True, post=None):
    lines = npc_lines(e, speaker_sub)
    assert lines is not None, f"speaker {speaker_sub!r} not found in {e['id']}"
    d = {"id": nid or slug(speaker_sub), "x": x, "y": y, "sprite": sprite,
         "name": speaker_sub.split(",")[0].split("(")[0].strip(), "dialog": lines}
    if ink:
        d["ink"] = (f"region{n}-story", entry_knot(n, e["id"]))
    if post is not None:
        d["post"] = post
    return d

def antagonist_npc(n, e, x, y, sprite="🕶️", nid=None, name=None):
    ant = e.get("antagonist")
    assert ant is not None, f"no antagonist in {e['id']}"
    return {"id": nid or slug(ant["speaker"]), "x": x, "y": y, "sprite": sprite,
            "name": name or ant["speaker"].split(",")[0].split("(")[0].strip(),
            "dialog": ant["lines"],
            "ink": (f"region{n}-story", entry_knot(n, e["id"]))}

def dojo_leader_npc(n, e, dojo_no):
    dj = e["dojo"]
    badge = dj["badge"]  # e.g. "R3-1/8" — the row carries the fragment name, in the comment
    suffix = ("Your old team opens one slot wider now." if dojo_no == 1
              else "Your old team opens another slot.")
    post = [dj["post"][0] + " " + suffix]
    return {"id": "dojo_leader", "x": 7, "y": 2, "sprite": "🥋", "name": "Dojo Leader",
            "dialog": dj["pre"],
            "ink": (f"region{n}-story", entry_knot(n, e["id"])),
            "post": post}

def acolyte_npc(n, row, x):
    d = battle_npc(n, row, x, 10, sprite="🥋")
    return d

def sign(x, y, text):
    return {"x": x, "y": y, "text": text}

def exit_(x, y, to, enterAt, dir_, condition=None, hm=None):
    e = {"x": x, "y": y, "to": to, "enterAt": enterAt, "dir": dir_}
    if condition:
        e["condition"] = condition
    if hm:
        e["hmNeeded"] = hm
    return e

def door(x, y, to, enterAt, label):
    return {"x": x, "y": y, "to": to, "enterAt": enterAt, "label": label}

def exits_lit(exits):
    out = []
    for e in exits:
        s = f'{{ x:{e["x"]}, y:{e["y"]}, to:{ts_str(e["to"])}, enterAt:{{x:{e["enterAt"]["x"]}, y:{e["enterAt"]["y"]}}}, dir:{ts_str(e["dir"])}'
        if e.get("condition"):
            s += f', condition:{ts_str(e["condition"])}'
        if e.get("hmNeeded"):
            s += f', hmNeeded:{ts_str(e["hmNeeded"])}'
        s += " }"
        out.append("    " + s)
    return ",\n".join(out)

def doors_lit(doors):
    out = []
    for d in doors:
        out.append(f'    {{ x:{d["x"]}, y:{d["y"]}, to:{ts_str(d["to"])}, enterAt:{{x:{d["enterAt"]["x"]}, y:{d["enterAt"]["y"]}}}, label:{ts_str(d["label"])} }}')
    return ",\n".join(out)

def signs_lit(signs):
    return ",\n".join(
        f'    {{ x:{s["x"]}, y:{s["y"]}, text:{ts_str(s["text"])} }}' for s in signs)

# ---------------------------------------------------------------- kinds
# kind -> (width, height, centre-x) for edge-exit enterAt computation.
KIND_DIMS = {
    "town": (30, 30, 14), "route": (28, 40, 14), "site": (24, 24, 12),
    "lake": (28, 30, 14), "searoad": (28, 40, 14), "house1f": (13, 12, 6),
    "house2f": (13, 12, 6), "mochiiplex": (15, 12, 7), "dojo": (16, 18, 7),
    "sub": (20, 20, 9), "smallsub": (16, 18, 7),
}
KEY_KIND = {}

def register_kind(key, kind):
    KEY_KIND[key] = kind

def edge_enter(target_key, edge):
    """enterAt for stepping into target_key from the given edge.
    North exit -> arrive at the target's south edge (y = height-1);
    south exit -> arrive at the target's north edge (y = 1). R2 precedent
    uses the border row itself (e.g. Dawnfield -> route_1 enterAt y=39)."""
    w, h, cx = KIND_DIMS[KEY_KIND[target_key]]
    return {"x": cx, "y": h - 1} if edge == "north" else {"x": cx, "y": 1}

# ---------------------------------------------------------------- templates
def const_name(key):
    return key.upper()

def emit_map(m):
    """m: dict(key, kind, name, music, weather?, npcs, signs, exits, doors, comment?)"""
    lines = []
    if m.get("comment"):
        lines.append(m["comment"])
    lines.append(f'export const {const_name(m["key"])}: any = {{')
    lines.append(f'  name: {ts_str(m["name"])},')
    lines.append(f'  music: {ts_str(m["music"])},')
    lines.append(f'  weather: {ts_str(m.get("weather", "clear"))},')
    if m.get("interior"):
        lines.append("  interior: true,")
    lines.append(f'  width: {m["width"]}, height: {m["height"]},')
    lines.append(f'  playerStart: {{ x:{m["playerStart"]["x"]}, y:{m["playerStart"]["y"]} }},')
    lines.append("  tiles: (() => {")
    lines.append(f'    return buildMap({m["width"]}, {m["height"]}, (x, y) => {{')
    for t in m["tiles"]:
        lines.append(f"      {t}")
    lines.append("    });")
    lines.append("  })(),")
    lines.append("  npcs: [")
    lines.append(",\n".join(npc_literal(n) for n in m["npcs"]) if m["npcs"] else "")
    lines.append("  ],")
    lines.append("  signs: [")
    lines.append(signs_lit(m["signs"]) if m["signs"] else "")
    lines.append("  ],")
    lines.append("  exits: [")
    lines.append(exits_lit(m["exits"]) if m["exits"] else "")
    lines.append("  ],")
    lines.append("  doors: [")
    lines.append(doors_lit(m["doors"]) if m["doors"] else "")
    lines.append("  ],")
    lines.append("  events: [],")
    lines.append("  encounters: []")
    lines.append("};")
    lines.append("")
    return "\n".join(lines)

TOWN_TILES = [
    "if (x===0||x===29||y===0||y===29) return TILE.WALL;",
]
def town_tiles(door_xs):
    t = list(TOWN_TILES)
    for dx in sorted(set(door_xs)):
        t.append(f"if (x==={dx}&&y===7) return TILE.DOOR;")
    t += [
        "if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;",
        "if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;",
        "if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;",
        "if (y===15) return TILE.PATH;",
        "if (x===14) return TILE.PATH;",
        "return TILE.GRASS;",
    ]
    return t

ROUTE_TILES = [
    "if (x===0||x===27||y===0||y===39) return TILE.WALL;",
    "if (x>=12&&x<=16) return TILE.PATH;",
    "if (y>=18&&y<=20) return TILE.PATH;",
    "return TILE.TALL_GRASS;",
]

DOJO_TILES = [
    "if (x===7&&y===17) return TILE.DOOR;",
    "if (x===0||x===15||y===0||y===17) return TILE.WALL;",
    "return TILE.PATH;",
]

SUB_TILES = [
    "if (x===9&&y===19) return TILE.DOOR;",
    "if (x===0||x===19||y===0||y===19) return TILE.WALL;",
    "if (x===9||x===10) return TILE.PATH;",
    "if (y===10) return TILE.PATH;",
    "return TILE.GRASS;",
]

SMALLSUB_TILES = DOJO_TILES  # 16x18 interior, same shape as R2_WELL

SITE_TILES = [
    "if (x===0||x===23||y===0||y===23) return TILE.WALL;",
    "if (y===12) return TILE.PATH;",
    "if (x===12) return TILE.PATH;",
    "return TILE.GRASS;",
]

LAKE_TILES = [
    "if (x===0||x===27||y===0||y===29) return TILE.WALL;",
    "if (y>=26) return TILE.PATH;",
    "if (x===14) return TILE.PATH;",
    "return TILE.WATER;",
]

SEAROAD_TILES = [
    "if ((x===0||x===27)&&y!==20) return TILE.WALL;",
    "if (y===0||y===39) return TILE.WALL;",
    "if (x>=12&&x<=16&&y>=18&&y<=22) return TILE.DOCK;",
    "return TILE.WATER;",
]

HOUSE1F_TILES = [
    "if (x===6&&y===11) return TILE.DOOR;",
    "if (x===6&&y===1) return TILE.STAIRS_UP;",
    "if (x===6&&y===2) return TILE.PATH; // stair approach, else the stair is unreachable",
    "if (x===0||x===12||y===0||y===11) return TILE.WALL;",
    "if ((x===1||x===11)&&y===10) return TILE.PLANT;",
    "if (x>=8&&x<=9&&y>=5&&y<=6) return TILE.BUILDING; // mid-room table island",
    "if (y>=1&&y<=2) return TILE.BUILDING; // kitchen counter / table",
    "return TILE.PATH;",
]

HOUSE2F_TILES = [
    "if (x===6&&y===11) return TILE.STAIRS_DOWN;",
    "if (x===0||x===12||y===0||y===11) return TILE.WALL;",
    "if (x>=2&&x<=4&&y>=2&&y<=3) return TILE.TERMINAL; // PC desk",
    "if (x>=8&&x<=10&&y>=2&&y<=3) return TILE.BED; // bed",
    "return TILE.PATH;",
]

MOCHIIPLEX_TILES = [
    "if ((x===7||x===8)&&y===11) return TILE.DOOR;",
    "if (x===0||x===14||y===0||y===11) return TILE.WALL;",
    "if ((x===5||x===6)&&y===1) return TILE.HEAL_MACHINE;",
    "if ((x===11||x===12)&&y===1) return TILE.TERMINAL;",
    "if (y===1) return TILE.BUILDING;",
    "if (y===2&&x>=2&&x<=12) return TILE.COUNTER;",
    "if ((x===2||x===3||x===11||x===12)&&y===9) return TILE.BENCH;",
    "if ((x===1||x===13)&&y===10) return TILE.PLANT;",
    "return TILE.PATH;",
]

def healer_npc(n, key, x=7, y=10):
    return {"id": f"healer_{key}", "x": x, "y": y, "sprite": "👩‍⚕️", "name": "Center Nurse",
            "facing": "down", "isHeal": True,
            "dialog": ["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."]}

def shop_npc(n, key, x=22, y=10):
    return {"id": f"shop_{key}", "x": x, "y": y, "sprite": "🛒", "name": "Clerk",
            "facing": "down", "isShop": True,
            "dialog": ["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."]}

def mochiiplex_map(n, key, parent_key, parent_name, display_name):
    k = key
    return {
        "key": k, "kind": "mochiiplex", "name": display_name, "music": "route1_theme",
        "interior": True, "width": 15, "height": 12, "playerStart": {"x": 7, "y": 10},
        "tiles": MOCHIIPLEX_TILES,
        "npcs": [
            healer_npc(n, k, 7, 3), shop_npc(n, k, 3, 3),
            {"id": f"plex_waiting_{k}", "x": 11, "y": 7, "sprite": "🧢", "name": "Waiting Trainer",
             "facing": "left",
             "dialog": ["PLACEHOLDER — waiting-trainer line GAP FOR MARS (no beats line for this NPC)."]},
        ],
        "signs": [sign(4, 2, "MOCHII CENTER\nHealing is free — it is always free. Cubes and patches at the west end of the counter.")],
        "exits": [],
        "doors": [
            door(7, 11, parent_key, {"x": 13, "y": 8}, "Exit"),
            door(8, 11, parent_key, {"x": 14, "y": 8}, "Exit"),
        ],
    }

def town_map(n, key, name, north, south, doors, npcs, sign_text,
             side_exits=None, music="fields_theme"):
    """north/south: next/prev map keys (None = no edge exit that way).
    doors: list of (door_x, target, label) — door pair at (door_x,7),(door_x+1,7)
    with return enterAt (door_x,8) on the target side handled by the target map."""
    dlist = []
    door_xs = []
    for dx, target, label, enter in doors:
        dlist.append(door(dx, 7, target, enter, label))
        dlist.append(door(dx + 1, 7, target, enter, label))
        door_xs += [dx, dx + 1]
    exits = []
    if north:
        exits.append(exit_(14, 0, north, edge_enter(north, "north"), "up"))
    if south:
        exits.append(exit_(14, 29, south, edge_enter(south, "south"), "down"))
    exits.extend(side_exits or [])
    return {
        "key": key, "kind": "town", "name": name, "music": music,
        "width": 30, "height": 30, "playerStart": {"x": 14, "y": 29},
        "tiles": town_tiles(door_xs),
        "npcs": npcs, "signs": [sign(14, 14, sign_text)],
        "exits": exits, "doors": dlist,
    }

def route_map(n, key, name, north, south, npcs, sign_text, music="route1_theme"):
    return {
        "key": key, "kind": "route", "name": name, "music": music,
        "width": 28, "height": 40, "playerStart": {"x": 14, "y": 39},
        "tiles": ROUTE_TILES, "npcs": npcs,
        "signs": [sign(14, 10, sign_text)],
        "exits": [
            exit_(14, 0, north, edge_enter(north, "north"), "up"),
            exit_(14, 39, south, edge_enter(south, "south"), "down"),
        ],
        "doors": [],
    }

def dojo_map(n, key, name, parent_key, parent_door_x, acolyte_rows, leader_entry, dojo_no,
             theme, badge_name, row_leader_id):
    e = entry(n, leader_entry)
    npcs = [acolyte_npc(n, TRAINERS[n][r], x) for r, x in zip(acolyte_rows, (3, 11))]
    npcs.append(dojo_leader_npc(n, e, dojo_no))
    comment = (f"// Dojo {dojo_no} — {theme} Gate — Dojo theme {theme}, badge {badge_name} "
               f"(trainer row {row_leader_id}). Leader is NAME GAP:\n"
               f"// present and dialogued, battle + badge award owed by the trainer\n"
               f"// wiring batch — not silently invented here (DOJO_3 precedent).")
    return {
        "key": key, "kind": "dojo", "name": name, "music": "dojo_theme",
        "interior": True, "width": 16, "height": 18, "playerStart": {"x": 7, "y": 16},
        "tiles": DOJO_TILES, "npcs": npcs, "signs": [],
        "exits": [],
        "doors": [door(7, 17, parent_key, {"x": parent_door_x, "y": 8}, name)],
        "comment": comment,
    }

def sub_map(n, key, name, parent_key, parent_door_x, npcs, sign_text, music="dojo_theme",
            small=False, label=None):
    w, h = (16, 18) if small else (20, 20)
    px, py = (7, 16) if small else (9, 18)
    dx, dy = (7, 17) if small else (9, 19)
    return {
        "key": key, "kind": "smallsub" if small else "sub", "name": name, "music": music,
        "interior": True, "width": w, "height": h, "playerStart": {"x": px, "y": py},
        "tiles": SMALLSUB_TILES if small else SUB_TILES, "npcs": npcs,
        "signs": [sign(px, 12 if small else 12, sign_text)] if sign_text else [],
        "exits": [],
        "doors": [door(dx, dy, parent_key, {"x": parent_door_x, "y": 8}, label or parent_key)],
    }

def site_map(n, key, name, north, south, npcs, sign_text, music="route1_theme"):
    exits = []
    if north:
        exits.append(exit_(12, 0, north, edge_enter(north, "north"), "up"))
    if south:
        exits.append(exit_(12, 23, south, edge_enter(south, "south"), "down"))
    return {
        "key": key, "kind": "site", "name": name, "music": music,
        "width": 24, "height": 24, "playerStart": {"x": 12, "y": 22},
        "tiles": SITE_TILES, "npcs": npcs,
        "signs": [sign(12, 12, sign_text)],
        "exits": exits, "doors": [],
    }

def lake_map(n, key, name, north, south, npcs, sign_text):
    return {
        "key": key, "kind": "lake", "name": name, "music": "water_theme",
        "width": 28, "height": 30, "playerStart": {"x": 14, "y": 29},
        "tiles": LAKE_TILES, "npcs": npcs,
        "signs": [sign(14, 10, sign_text)],
        "exits": [
            exit_(14, 0, north, edge_enter(north, "north"), "up"),
            exit_(14, 29, south, edge_enter(south, "south"), "down"),
        ],
        "doors": [],
    }

# ---------------------------------------------------------------- sprites
def sprite_for(speaker):
    s = speaker.lower()
    if "hex" in s: return "😤"
    if "aeon" in s: return "🔬"
    if "mochiko" in s: return "🧑"
    if "mom" in s: return "👩"
    if "captain" in s or "boat" in s or "port keeper" in s: return "⚓"
    if "researcher" in s or "research" in s: return "🧑‍🔬"
    if "fisher" in s: return "🎣"
    if "elder" in s: return "🧓"
    if "announcer" in s: return "📣"
    if "clerk" in s: return "🛒"
    if "conductor" in s: return "🚂"
    if "attendant" in s: return "🧑"
    if "scout" in s or "operative" in s or "leader" in s or "speaker" in s and "front" in s: return "🕶️"
    if "speaker" in s: return "📣"
    if "flower" in s: return "🌸"
    if "temple" in s: return "⛩️"
    if "library" in s or "lore" in s or "painting" in s: return "📚"
    if "solar" in s: return "☀️"
    if "hot-spring" in s: return "♨️"
    if "weather" in s: return "🌦️"
    if "canopy" in s or "forest" in s: return "🌲"
    if "electric" in s: return "⚡"
    if "stone" in s or "mine" in s: return "⛏️"
    if "marsh" in s or "preserve" in s: return "🌿"
    if "cave" in s: return "🕯️"
    if "tower" in s: return "🗼"
    if "shrine" in s: return "⛩️"
    if "well" in s: return "🪣"
    if "lake" in s: return "🎣"
    if "den" in s: return "🐉"
    if "gate keeper" in s: return "🏔️"
    if "veteran" in s: return "🎖️"
    if "warden" in s: return "🛡️"
    if "challenger" in s: return "🥋"
    return "🚶"

def gap_sign(entry_id, label, extra):
    n = int(entry_id.split("-")[0][1:])
    return (f"{entry_id} — {label}\nName GAP FOR MARS (see region{n}-dialogue.json {entry_id}).\n{extra}")

def dojo_info(n, leader_row_id):
    row = TRAINERS[n][leader_row_id]
    m = re.search(r"Dojo \d+ ([^,]+),", row["location"])
    theme = m.group(1)
    b = re.search(r"badge ([^,]+)", row["location"])
    badge = b.group(1)
    return theme, badge

def plateau_npcs(n, entry_id):
    """Plateau NPCs from the dialogue entry's own elite/champion blocks.
    R2-13's blocks ARE the generic lines, so R2's plateau matches; R3/R4/R5
    have region-specific lines — hardcoding R2's words here would put R2's
    lines into later regions (fixed 2026-11-13 while finishing gen.py)."""
    e = entry(n, entry_id)
    att = dialogue_npc(n, e, "Plateau attendant", 14, 20, "🧑")
    elites = []
    for i, el in enumerate(e["elite"], start=1):
        elites.append({"id": f"elite_{i}", "x": 4 + i * 4, "y": 10, "sprite": "🥋",
                       "name": f"Elite {i}", "dialog": el["pre"], "post": el["post"]})
    ch = e["champion"]
    champ = {"id": "champion", "x": 14, "y": 4, "sprite": "👑", "name": "Champion",
             "dialog": ch["pre"], "post": ch["post"]}
    return [att] + elites + [champ]

# ================================================================= REGION 3
MAPS = []

def build_region3():
    n = 3
    e01, e02, e03, e04, e05 = entry(n, "R3-01"), entry(n, "R3-02"), entry(n, "R3-03"), entry(n, "R3-04"), entry(n, "R3-05")
    e06, e07, e08, e09, e09a = entry(n, "R3-06"), entry(n, "R3-07"), entry(n, "R3-08"), entry(n, "R3-09"), entry(n, "R3-09a")
    e09b, e10, e11, e12, e13 = entry(n, "R3-09b"), entry(n, "R3-10"), entry(n, "R3-11"), entry(n, "R3-12"), entry(n, "R3-13")
    T = TRAINERS[n]

    # -- Template L chapter opening: bedroom -> ground floor -> hamlet -> lab
    MAPS.append({
        "key": "r3_outpost_2f", "kind": "house2f", "name": "Root Hamlet Outpost — Bedroom",
        "music": "fields_theme", "interior": True, "width": 13, "height": 12,
        "playerStart": {"x": 6, "y": 10}, "tiles": HOUSE2F_TILES,
        "npcs": [],
        "signs": [sign(9, 2, "POSTER\nA poster of a legendary Mochiichao. One day.")],
        "exits": [exit_(6, 11, "r3_outpost_1f", {"x": 6, "y": 2}, "down")],
        "doors": [],
    })
    MAPS.append({
        "key": "r3_outpost_1f", "kind": "house1f", "name": "Root Hamlet Outpost — Ground Floor",
        "music": "fields_theme", "interior": True, "width": 13, "height": 12,
        "playerStart": {"x": 6, "y": 10}, "tiles": HOUSE1F_TILES,
        "npcs": [dialogue_npc(n, e01, "Outpost keeper", 5, 9, "🚶", nid="outpost_keeper")],
        "signs": [sign(10, 2, "KITCHEN\nThe keeper's kettle is always on. The lab is down the road.")],
        "exits": [exit_(6, 1, "r3_outpost_2f", {"x": 6, "y": 10}, "up")],
        "doors": [door(6, 11, "r3_root_hamlet", {"x": 22, "y": 8}, "Root Hamlet")],
    })
    MAPS.append(town_map(n, "r3_root_hamlet", "Root Hamlet — Region 3 Chapter Opening",
        "r3_oldale_road", None,
        [(13, "r3_lab", "Root Hamlet Lab", {"x": 9, "y": 18}),
         (4, "r3_mochiiplex_root_hamlet", "Root Hamlet MochiiPlex", {"x": 7, "y": 10}),
         (22, "r3_outpost_1f", "Outpost", {"x": 6, "y": 10})],
        [healer_npc(n, "r3_root_hamlet") if False else
         {"id": "root_hamlet_resident", "x": 10, "y": 20, "sprite": "🚶", "name": "Root Hamlet Resident",
          "dialog": ["PLACEHOLDER — town NPC line GAP FOR MARS (region3-dialogue.json R3-01 names no town-map NPC; the keeper is downstairs, the researcher is in the lab)."]}],
        "ROOT HAMLET\nChapter opening, not a new game. Outpost upstairs, lab down the road.\nNorth: the opening road to Rustboro."))
    MAPS.append({
        "key": "r3_lab", "kind": "sub", "name": "Root Hamlet Lab", "music": "fields_theme",
        "interior": True, "width": 20, "height": 20, "playerStart": {"x": 9, "y": 18},
        "tiles": SUB_TILES,
        "npcs": [
            {**battle_npc(n, T["R3-001"], 9, 4, sprite="😤"),
             "dialog": e01["hex"]["pre"], "post": e01["hex"]["post"],
             "ink": ("region3-story", entry_knot(n, "R3-01"))},
            dialogue_npc(n, e01, "Region 3 researcher", 9, 10, "🧑‍🔬", nid="r3_researcher"),
        ],
        "signs": [sign(9, 12, "LAB TABLE\nRegion 3 starter balls, cursor + confirm. The partner travels WITH your main team, not instead of it.")],
        "exits": [],
        "doors": [door(9, 19, "r3_root_hamlet", {"x": 13, "y": 8}, "Root Hamlet")],
    })
    MAPS.append(mochiiplex_map(n, "r3_mochiiplex_root_hamlet", "r3_root_hamlet", "Root Hamlet",
                                "Root Hamlet MochiiPlex"))
    # -- R3-02 opening road
    MAPS.append(route_map(n, "r3_oldale_road", "Route R3-1 — Opening Road",
        "r3_rustboro", "r3_root_hamlet",
        [battle_npc(n, T["R3-002"], 10, 15), battle_npc(n, T["R3-003"], 18, 25),
         dialogue_npc(n, e02, "Oldale road keeper", 14, 20, "🚶", nid="oldale_road_keeper"),
         dialogue_npc(n, e02, "Oldale fisher", 10, 20, "🎣", nid="oldale_fisher")],
        "ROUTE R3-1 — OPENING ROAD\nNorth to Rustboro. South to Root Hamlet."))
    # -- R3-03 Rustboro, Dojo 1
    MAPS.append(town_map(n, "r3_rustboro", "R3 Dojo 1 Town — name GAP FOR MARS",
        "r3_route_1", "r3_oldale_road",
        [(13, "r3_dojo_1", "Dojo 1 — Core Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r3_rustboro"), shop_npc(n, "r3_rustboro"),
         dialogue_npc(n, e03, "Rustboro stone keeper", 14, 20, "⛏️", nid="rustboro_stone_keeper"),
         antagonist_npc(n, e03, 18, 20)],
        gap_sign("R3-03", "DOJO 1 TOWN", "Dojo 1 (Core) is here. The first faction was seen here.")))
    th, bd = dojo_info(n, "R3-016")
    MAPS.append(dojo_map(n, "r3_dojo_1", "Dojo 1 — Core Gate", "r3_rustboro", 13,
                          ["R3-014", "R3-015"], "R3-03", 1, th, bd, "R3-016"))
    MAPS.append(route_map(n, "r3_route_1", "Route R3-2 — Rustboro Road",
        "r3_dewford", "r3_rustboro", [],
        "ROUTE R3-2 — RUSTBORO ROAD\nNorth to Dewford. South to Rustboro."))
    # -- R3-04 Dewford, Dojo 2, cave (sea route east)
    sea_exits = [exit_(29, y, "r3_sea_route", {"x": 1, "y": 20}, "right", hm="Wave")
                 for y in range(15, 26)]
    MAPS.append(town_map(n, "r3_dewford", "R3 Dojo 2 Town — name GAP FOR MARS",
        None, "r3_route_1",
        [(13, "r3_dojo_2", "Dojo 2 — Strike Gate", {"x": 7, "y": 16}),
         (4, "r3_cave", "Cave", {"x": 7, "y": 16})],
        [healer_npc(n, "r3_dewford"), shop_npc(n, "r3_dewford"),
         dialogue_npc(n, e04, "Dewford boat keeper", 14, 20, "⚓", nid="dewford_boat_keeper")],
        gap_sign("R3-04", "DOJO 2 TOWN", "Dojo 2 (Strike) is here. The cave is west. Sea road east needs Wave-Ride."),
        side_exits=sea_exits))
    MAPS.append(sub_map(n, "r3_cave", "Cave — Island Dark", "r3_dewford", 4,
                         [dialogue_npc(n, e04, "Cave guide", 7, 8, "🕯️", nid="cave_guide")],
                         "THE CAVE\nDark, but not empty. Bring Light-Pulse, and bring patience.",
                         small=True, label="Dojo 2 Town"))
    th, bd = dojo_info(n, "R3-019")
    MAPS.append(dojo_map(n, "r3_dojo_2", "Dojo 2 — Strike Gate", "r3_dewford", 13,
                          ["R3-017", "R3-018"], "R3-04", 2, th, bd, "R3-019"))
    # -- sea road Dewford <-> Mauville
    MAPS.append({
        "key": "r3_sea_route", "kind": "searoad", "name": "Sea Road — Wave Crossing",
        "music": "water_theme", "width": 28, "height": 40, "playerStart": {"x": 1, "y": 20},
        "tiles": SEAROAD_TILES, "npcs": [],
        "signs": [sign(14, 20, "SEA ROAD\nWave-Ride crossing. West: the Dojo 2 town (R3-04). East: the Dojo 3 city (R3-05).")],
        "exits": [
            exit_(0, 20, "r3_dewford", {"x": 28, "y": 20}, "left"),
            exit_(27, 20, "r3_mauville", {"x": 1, "y": 20}, "right"),
        ],
        "doors": [],
    })
    # -- R3-05 Mauville, Dojo 3, Arena (sea road west)
    sea_west = [exit_(0, y, "r3_sea_route", {"x": 26, "y": 20}, "left", hm="Wave")
                for y in range(15, 26)]
    MAPS.append(town_map(n, "r3_mauville", "R3 Dojo 3 City — name GAP FOR MARS",
        "r3_route_2", None,
        [(13, "r3_dojo_3", "Dojo 3 — Chrome Gate", {"x": 7, "y": 16}),
         (4, "r3_arena", "Arena", {"x": 9, "y": 18})],
        [healer_npc(n, "r3_mauville"), shop_npc(n, "r3_mauville"),
         dialogue_npc(n, e05, "Mauville electric keeper", 14, 20, "⚡", nid="mauville_electric_keeper"),
         antagonist_npc(n, e05, 18, 20)],
        gap_sign("R3-05", "DOJO 3 CITY", "Dojo 3 (Chrome) is here. Arena: west. Sea road west needs Wave-Ride."),
        side_exits=sea_west))
    MAPS.append(sub_map(n, "r3_arena", "Arena — First Bracket", "r3_mauville", 4,
                         [battle_npc(n, T["R3-004"], 6, 10, sprite="🏅"),
                          battle_npc(n, T["R3-005"], 13, 10, sprite="🏅"),
                          dialogue_npc(n, e05, "Arena announcer", 9, 4, "📣", nid="arena_announcer")],
                         "ARENA\nFirst full tournament bracket in the story. Win it, and the city remembers your name.",
                         label="Dojo 3 City"))
    th, bd = dojo_info(n, "R3-022")
    MAPS.append(dojo_map(n, "r3_dojo_3", "Dojo 3 — Chrome Gate", "r3_mauville", 13,
                          ["R3-020", "R3-021"], "R3-05", 3, th, bd, "R3-022"))
    MAPS.append(route_map(n, "r3_route_2", "Route R3-3 — Mauville Road",
        "r3_lavaridge", "r3_mauville", [],
        "ROUTE R3-3 — MAUVILLE ROAD\nNorth to Lavaridge. South to Mauville."))
    # -- R3-06 Lavaridge, Dojo 4, Land base
    MAPS.append(town_map(n, "r3_lavaridge", "R3 Dojo 4 Town — name GAP FOR MARS",
        "r3_route_3", "r3_route_2",
        [(13, "r3_dojo_4", "Dojo 4 — Flame Gate", {"x": 7, "y": 16}),
         (4, "r3_land_base", "Land Base", {"x": 9, "y": 18})],
        [healer_npc(n, "r3_lavaridge"), shop_npc(n, "r3_lavaridge"),
         dialogue_npc(n, e06, "Hot-spring keeper", 14, 20, "♨️", nid="hot_spring_keeper")],
        gap_sign("R3-06", "DOJO 4 TOWN", "Dojo 4 (Flame) is here. Land base: west. The springs are warm because the mountain is awake.")))
    th, bd = dojo_info(n, "R3-025")
    MAPS.append(dojo_map(n, "r3_dojo_4", "Dojo 4 — Flame Gate", "r3_lavaridge", 13,
                          ["R3-023", "R3-024"], "R3-06", 4, th, bd, "R3-025"))
    MAPS.append(sub_map(n, "r3_land_base", "Land Base", "r3_lavaridge", 4,
                         [antagonist_npc(n, e06, 9, 10, nid="land_faction_leader")],
                         "LAND BASE\nThe land remembers. Wake it, and it will remember us first.",
                         label="Dojo 4 Town"))
    # -- routes / towns R3-07..R3-09b
    MAPS.append(route_map(n, "r3_route_3", "Route R3-4", "r3_petalburg", "r3_lavaridge", [],
                          "ROUTE R3-4\nNorth to Petalburg. South to Lavaridge."))
    MAPS.append(town_map(n, "r3_petalburg", "R3 Dojo 5 Town — name GAP FOR MARS",
        "r3_route_4", "r3_route_3",
        [(13, "r3_dojo_5", "Dojo 5 — Beast Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r3_petalburg"), shop_npc(n, "r3_petalburg"),
         dialogue_npc(n, e07, "Petalburg elder", 14, 20, "🧓", nid="petalburg_elder"),
         dialogue_npc(n, e07, "Mochiko", 10, 20, "🧑", nid="mochiko_petalburg")],
        gap_sign("R3-07", "DOJO 5 TOWN", "Dojo 5 (Beast) is here. A return dojo — strong when you were new, strong now.")))
    th, bd = dojo_info(n, "R3-028")
    MAPS.append(dojo_map(n, "r3_dojo_5", "Dojo 5 — Beast Gate", "r3_petalburg", 13,
                          ["R3-026", "R3-027"], "R3-07", 5, th, bd, "R3-028"))
    MAPS.append(route_map(n, "r3_route_4", "Route R3-5", "r3_fortree", "r3_petalburg", [],
                          "ROUTE R3-5\nNorth to Fortree. South to Petalburg."))
    MAPS.append(town_map(n, "r3_fortree", "R3 Dojo 6 Town — name GAP FOR MARS",
        "r3_route_5", "r3_route_4",
        [(13, "r3_dojo_6", "Dojo 6 — Aero Gate", {"x": 7, "y": 16}),
         (4, "r3_weather_institute", "Weather Institute", {"x": 9, "y": 18})],
        [healer_npc(n, "r3_fortree"), shop_npc(n, "r3_fortree"),
         dialogue_npc(n, e08, "Canopy guide", 14, 20, "🌲", nid="canopy_guide")],
        gap_sign("R3-08", "DOJO 6 TOWN", "Dojo 6 (Aero) is here. Weather institute: west. The city is in the trees.")))
    MAPS.append(sub_map(n, "r3_weather_institute", "Weather Institute", "r3_fortree", 4,
                         [dialogue_npc(n, e08, "Weather institute keeper", 9, 10, "🌦️", nid="weather_institute_keeper"),
                          antagonist_npc(n, e08, 13, 10, nid="sea_faction_operative_weather")],
                         "WEATHER INSTITUTE\nThe weather is not weather here. It is a signal, and someone is sending it.",
                         label="Dojo 6 Town"))
    th, bd = dojo_info(n, "R3-031")
    MAPS.append(dojo_map(n, "r3_dojo_6", "Dojo 6 — Aero Gate", "r3_fortree", 13,
                          ["R3-029", "R3-030"], "R3-08", 6, th, bd, "R3-031"))
    MAPS.append(route_map(n, "r3_route_5", "Route R3-6", "r3_lilycove", "r3_fortree", [],
                          "ROUTE R3-6\nNorth to Lilycove. South to Fortree."))
    MAPS.append(town_map(n, "r3_lilycove", "R3 Port Town — name GAP FOR MARS",
        "r3_route_6", "r3_route_5",
        [(13, "r3_hideout", "Hideout", {"x": 9, "y": 18})],
        [healer_npc(n, "r3_lilycove"), shop_npc(n, "r3_lilycove"),
         dialogue_npc(n, e09a, "Port keeper", 14, 20, "⚓", nid="port_keeper")],
        gap_sign("R3-09a", "PORT TOWN", "No dojo here. Hideout: under the city. The two factions are colliding down there, not up here.")))
    # hideout: 2 wired faction members + 2 NAME GAP leaders (dialogue-only) + 2 operatives (dialogue)
    def _faction_leader(n, row_id, x, y):
        row = TRAINERS[n][row_id]
        return {"id": f"{row_id.lower().replace('-', '_')}_leader", "x": x, "y": y,
                "sprite": "🕶️", "name": row["trainerClass"],
                "dialog": [f"PLACEHOLDER — battle line GAP FOR MARS (trainer row {row_id}; leader is NAME GAP, battle owed)."],
                "post": [f"PLACEHOLDER — post-battle line GAP FOR MARS (trainer row {row_id})."]}
    ant09a = e09a["antagonist"]
    MAPS.append(sub_map(n, "r3_hideout", "Hideout — Under the City", "r3_lilycove", 13,
                         [battle_npc(n, T["R3-006"], 6, 10, sprite="🕶️"),
                          battle_npc(n, T["R3-007"], 13, 10, sprite="🕶️"),
                          _faction_leader(n, "R3-008", 6, 4),
                          _faction_leader(n, "R3-009", 13, 4),
                          {"id": "land_faction_operative", "x": 4, "y": 14, "sprite": "🕶️",
                           "name": "Land Faction Operative", "dialog": [ant09a["lines"][0]],
                           "ink": ("region3-story", entry_knot(n, "R3-09a"))},
                          {"id": "sea_faction_operative", "x": 15, "y": 14, "sprite": "🕶️",
                           "name": "Sea Faction Operative", "dialog": ant09a["lines"][1:],
                           "ink": ("region3-story", entry_knot(n, "R3-09a"))}],
                         "HIDEOUT\nThe land remembers. The sea forgets. Pick a side, or pick the balance.",
                         label="Port Town"))
    MAPS.append(route_map(n, "r3_route_6", "Route R3-7", "r3_mossdeep", "r3_lilycove", [],
                          "ROUTE R3-7\nNorth to Mossdeep. South to Lilycove."))
    MAPS.append(town_map(n, "r3_mossdeep", "R3 Dojo 7 Town — name GAP FOR MARS",
        "r3_route_7", "r3_route_6",
        [(13, "r3_dojo_7", "Dojo 7 — Mythic Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r3_mossdeep"), shop_npc(n, "r3_mossdeep"),
         dialogue_npc(n, e09b, "Research city keeper", 14, 20, "🧑‍🔬", nid="research_city_keeper")],
        gap_sign("R3-09b", "DOJO 7 TOWN", "Dojo 7 (Mythic) is here — canon order: Mossdeep before Crater City. Double-battle dojo.")))
    th, bd = dojo_info(n, "R3-034")
    MAPS.append(dojo_map(n, "r3_dojo_7", "Dojo 7 — Mythic Gate", "r3_mossdeep", 13,
                          ["R3-032", "R3-033"], "R3-09b", 7, th, bd, "R3-034"))
    MAPS.append(route_map(n, "r3_route_7", "Route R3-8", "r3_crater_city", "r3_mossdeep", [],
                          "ROUTE R3-8\nNorth to Crater City. South to Mossdeep."))
    MAPS.append(town_map(n, "r3_crater_city", "R3 Dojo 8 Town — name GAP FOR MARS",
        "r3_route_8", "r3_route_7",
        [(13, "r3_dojo_8", "Dojo 8 — Water Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r3_crater_city"), shop_npc(n, "r3_crater_city"),
         dialogue_npc(n, e09, "Crater city elder", 14, 20, "🧓", nid="crater_city_elder")],
        gap_sign("R3-09", "DOJO 8 TOWN", "Dojo 8 (Water) is here. Deep-Dive is the gate (flag r3_deep_dive). Dive, and come back with the city.")))
    th, bd = dojo_info(n, "R3-037")
    MAPS.append(dojo_map(n, "r3_dojo_8", "Dojo 8 — Water Gate", "r3_crater_city", 13,
                          ["R3-035", "R3-036"], "R3-09", 8, th, bd, "R3-037"))
    # -- R3-10 awakening, R3-11 victory route, R3-12 plateau, R3-13 frontier
    MAPS.append(route_map(n, "r3_route_8", "Route R3-9", "r3_awakening", "r3_crater_city", [],
                          "ROUTE R3-9\nNorth to the Awakening. South to Crater City."))
    MAPS.append(site_map(n, "r3_awakening", "The Awakening — Legendary Climax",
                         "r3_victory_route", "r3_route_8",
                         [dialogue_npc(n, e10, "Crater city elder", 12, 16, "🧓", nid="crater_city_elder_after"),
                          dialogue_npc(n, e10, "Land faction leader", 8, 16, "🕶️", nid="land_faction_leader_awakening"),
                          dialogue_npc(n, e10, "Sea faction leader", 16, 16, "🕶️", nid="sea_faction_leader_awakening")],
                         "THE AWAKENING\nYou stopped both wakes. That is not a victory. That is a balance. Keep it."))
    beats11 = npc_lines(e11, "Veteran trainer")
    vets = [battle_npc(n, T[r], x, y, sprite="🎖️")
            for r, x, y in [("R3-010", 10, 15), ("R3-011", 18, 15), ("R3-012", 10, 25), ("R3-013", 18, 25)]]
    vets[0]["dialog"] = [beats11[0]]
    vets[0]["post"] = [beats11[1]]
    MAPS.append(route_map(n, "r3_victory_route", "Victory Route — Region 3 Gauntlet",
        "r3_plateau", "r3_awakening",
        [dialogue_npc(n, e11, "Victory gate keeper", 14, 20, "🏔️", nid="victory_gate_keeper")] + vets,
        "VICTORY ROUTE\nNorth to the Plateau, third ascent. South to the Awakening."))
    # gate the gauntlet: awakening -> victory route is badges>=24 (8 R1 + 8 R2 + 8 R3)
    for m in MAPS:
        if m["key"] == "r3_awakening":
            m["exits"][0]["condition"] = "badges>=24"
    MAPS.append(town_map(n, "r3_plateau", "Mainframe Plateau — Third Ascent",
        "r3_frontier_arenas", "r3_victory_route", [],
        plateau_npcs(n, "R3-12"),
        "HALL OF RECORDS\nThird entry is set on Champion defeat. Flag r3_hall_third_entry — owed: no Champion battle yet."))
    MAPS.append(town_map(n, "r3_frontier_arenas", "Frontier Arenas — Post-Game",
        None, "r3_plateau", [],
        [dialogue_npc(n, e13, "Frontier announcer", 14, 20, "📣", nid="frontier_announcer"),
         dialogue_npc(n, e13, "Arena keeper", 10, 20, "🚶", nid="arena_keeper"),
         antagonist_npc(n, e13, 18, 20)],
        "FRONTIER ARENAS\nSingles, doubles, rental teams, streaks. North: the airship route to Region 4 (flag r4_airship_route_open)."))
    # onward link R3 -> R4 (airship, master doc section 9)
    for m in MAPS:
        if m["key"] == "r3_frontier_arenas":
            m["exits"].append(exit_(14, 0, "r4_twinleaf", {"x": 14, "y": 29}, "up"))

# ---------------------------------------------------------------- kind table
# Every new map key -> kind, registered BEFORE any spec runs so edge_enter
# can resolve forward references.
ALL_KEYS = {}
def _reg(prefix, items):
    for k, kind in items:
        ALL_KEYS[f"{prefix}_{k}"] = kind

_reg("r3", [
    ("outpost_2f", "house2f"), ("outpost_1f", "house1f"), ("root_hamlet", "town"),
    ("lab", "sub"), ("mochiiplex_root_hamlet", "mochiiplex"), ("oldale_road", "route"),
    ("rustboro", "town"), ("dojo_1", "dojo"), ("route_1", "route"), ("dewford", "town"),
    ("cave", "smallsub"), ("dojo_2", "dojo"), ("sea_route", "searoad"),
    ("mauville", "town"), ("arena", "sub"), ("dojo_3", "dojo"), ("route_2", "route"),
    ("lavaridge", "town"), ("dojo_4", "dojo"), ("land_base", "sub"), ("route_3", "route"),
    ("petalburg", "town"), ("dojo_5", "dojo"), ("route_4", "route"),
    ("fortree", "town"), ("weather_institute", "sub"), ("dojo_6", "dojo"),
    ("route_5", "route"), ("lilycove", "town"), ("hideout", "sub"), ("route_6", "route"),
    ("mossdeep", "town"), ("dojo_7", "dojo"), ("route_7", "route"),
    ("crater_city", "town"), ("dojo_8", "dojo"), ("route_8", "route"),
    ("awakening", "site"), ("victory_route", "route"), ("plateau", "town"),
    ("frontier_arenas", "town"),
])
_reg("r4", [
    ("twinleaf", "town"), ("mochiiplex_twinleaf", "mochiiplex"),
    ("sandgem", "town"), ("jubilife", "town"), ("oreburgh", "town"),
    ("dojo_1", "dojo"), ("floaroma", "town"), ("eterna", "town"), ("dojo_2", "dojo"),
    ("statue", "sub"), ("hearthome", "town"), ("contest_hall", "sub"), ("dojo_3", "dojo"),
    ("veilstone", "town"), ("warehouse", "sub"), ("dojo_4", "dojo"),
    ("pastoria", "town"), ("preserve", "lake"), ("dojo_5", "dojo"),
    ("celestic", "town"), ("cave_painting", "smallsub"), ("canalave", "town"),
    ("library", "sub"), ("island", "sub"), ("dojo_6", "dojo"),
    ("snowpoint", "town"), ("temple", "sub"), ("dojo_7", "dojo"),
    ("sunyshore", "town"), ("dojo_8", "dojo"),
    ("victory_route", "route"), ("plateau", "town"), ("battle_zone", "town"),
    ("rift_dungeon", "sub"),
] + [(f"route_{i}", "route") for i in range(1, 11)])
_reg("r5", [
    ("start_city", "town"), ("mochiiplex_start_city", "mochiiplex"),
    ("sandgem", "town"), ("jubilife", "town"), ("oreburgh", "town"),
    ("dojo_1", "dojo"), ("floaroma", "town"), ("eterna", "town"), ("dojo_2", "dojo"),
    ("hearthome", "town"), ("contest_hall", "sub"), ("dojo_3", "dojo"),
    ("veilstone", "town"), ("warehouse", "sub"), ("dojo_4", "dojo"),
    ("pastoria", "town"), ("preserve", "lake"), ("dojo_5", "dojo"),
    ("celestic", "town"), ("canalave", "town"), ("library", "sub"), ("dojo_6", "dojo"),
    ("snowpoint", "town"), ("temple", "sub"), ("dojo_7", "dojo"),
    ("sunyshore", "town"), ("dojo_8", "dojo"),
    ("victory_route", "route"), ("plateau", "town"), ("grand_tournament", "town"),
    ("mythar_final", "site"),
] + [(f"route_{i}", "route") for i in range(1, 11)])
# R2 keys referenced as link targets (frost peak) + R1-adjacent
KEY_KIND.update(ALL_KEYS)
KEY_KIND["r2_frost_peak"] = "site"
assert len(ALL_KEYS) == 126, f"expected 126 maps, got {len(ALL_KEYS)}"

# ================================================================= REGION 4
def build_region4():
    n = 4
    e01, e02, e03, e04, e05 = entry(n, "R4-01"), entry(n, "R4-02"), entry(n, "R4-03"), entry(n, "R4-04"), entry(n, "R4-05")
    e06, e07, e08, e09, e10 = entry(n, "R4-06"), entry(n, "R4-07"), entry(n, "R4-08"), entry(n, "R4-09"), entry(n, "R4-10")
    e11, e12, e13, e14, e15 = entry(n, "R4-11"), entry(n, "R4-12"), entry(n, "R4-13"), entry(n, "R4-14"), entry(n, "R4-15")
    e16 = entry(n, "R4-16")
    T = TRAINERS[n]

    # -- R4-01 airship arrival
    MAPS.append(town_map(n, "r4_twinleaf", "R4 Arrival Town — name GAP FOR MARS",
        "r4_route_1", None,
        [(13, "r4_mochiiplex_twinleaf", "Twinleaf MochiiPlex", {"x": 7, "y": 10})],
        [dialogue_npc(n, e01, "Airship captain", 14, 20, "⚓", nid="airship_captain"),
         dialogue_npc(n, e01, "Hamlet elder", 10, 20, "🧓", nid="hamlet_elder")],
        gap_sign("R4-01", "ARRIVAL TOWN", "Airship docked. Edge of the snow, edge of the old story.")))
    MAPS.append(mochiiplex_map(n, "r4_mochiiplex_twinleaf", "r4_twinleaf", "Twinleaf",
                                "Twinleaf MochiiPlex"))
    MAPS.append(route_map(n, "r4_route_1", "Route R4-1 — First Route",
        "r4_sandgem", "r4_twinleaf",
        [battle_npc(n, T["R4-001"], 10, 15), battle_npc(n, T["R4-002"], 18, 25)],
        "ROUTE R4-1 — FIRST ROUTE\nNorth to the researcher's town. South to Twinleaf."))
    # -- R4-02 Sandgem-shape town
    MAPS.append(town_map(n, "r4_sandgem", "R4 Research Town — name GAP FOR MARS",
        "r4_route_2", "r4_route_1", [],
        [healer_npc(n, "r4_sandgem"), shop_npc(n, "r4_sandgem"),
         dialogue_npc(n, e02, "Town researcher", 14, 20, "🧑‍🔬", nid="town_researcher"),
         dialogue_npc(n, e02, "Route keeper", 10, 20, "🚶", nid="route_keeper")],
        gap_sign("R4-02", "RESEARCH TOWN", "Three lakes, three guardians, one mystery. Walk the first route first.")))
    MAPS.append(route_map(n, "r4_route_2", "Route R4-2", "r4_jubilife", "r4_sandgem", [],
                          "ROUTE R4-2\nNorth to the media city. South to the researcher's town."))
    # -- R4-03 Jubilife-shape city
    MAPS.append(town_map(n, "r4_jubilife", "R4 Media City — name GAP FOR MARS",
        "r4_route_3", "r4_route_2", [],
        [healer_npc(n, "r4_jubilife"), shop_npc(n, "r4_jubilife"),
         dialogue_npc(n, e03, "Media clerk", 14, 20, "🛒", nid="media_clerk"),
         dialogue_npc(n, e03, "City elder", 10, 20, "🧓", nid="city_elder"),
         antagonist_npc(n, e03, 18, 20)],
        gap_sign("R4-03", "MEDIA CITY", "The institute is on every screen. That is advertising, not truth.")))
    MAPS.append(route_map(n, "r4_route_3", "Route R4-3", "r4_oreburgh", "r4_jubilife", [],
                          "ROUTE R4-3\nNorth to Oreburgh. South to the media city."))
    # -- R4-04 Oreburgh, Dojo 1
    MAPS.append(town_map(n, "r4_oreburgh", "R4 Dojo 1 Town — name GAP FOR MARS",
        "r4_route_4", "r4_route_3",
        [(13, "r4_dojo_1", "Dojo 1 — Core Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r4_oreburgh"), shop_npc(n, "r4_oreburgh"),
         dialogue_npc(n, e04, "Mine keeper", 14, 20, "⛏️", nid="mine_keeper")],
        gap_sign("R4-04", "DOJO 1 TOWN", "Dojo 1 (Core) is here, in the mine's shadow.")))
    th, bd = dojo_info(n, "R4-017")
    MAPS.append(dojo_map(n, "r4_dojo_1", "Dojo 1 — Core Gate", "r4_oreburgh", 13,
                          ["R4-015", "R4-016"], "R4-04", 1, th, bd, "R4-017"))
    MAPS.append(route_map(n, "r4_route_4", "Route R4-4", "r4_floaroma", "r4_oreburgh", [],
                          "ROUTE R4-4\nNorth to Floaroma. South to Oreburgh."))
    # -- R4-05 Floaroma (valley trainers in town)
    MAPS.append(town_map(n, "r4_floaroma", "R4 Flower Town — name GAP FOR MARS",
        "r4_route_5", "r4_route_4", [],
        [healer_npc(n, "r4_floaroma"), shop_npc(n, "r4_floaroma"),
         dialogue_npc(n, e05, "Flower keeper", 14, 20, "🌸", nid="flower_keeper"),
         dialogue_npc(n, e05, "Valley wanderer", 10, 20, "🚶", nid="valley_wanderer"),
         battle_npc(n, T["R4-003"], 8, 25, sprite="🌸"),
         battle_npc(n, T["R4-004"], 20, 25, sprite="🔭")],
        gap_sign("R4-05", "FLOWER TOWN", "The valley is beautiful, and the crack in the ground is beautiful too, in a way that worries me.")))
    MAPS.append(route_map(n, "r4_route_5", "Route R4-5", "r4_eterna", "r4_floaroma", [],
                          "ROUTE R4-5\nNorth to Eterna. South to Floaroma."))
    # -- R4-06 Eterna, Dojo 2, statue
    MAPS.append(town_map(n, "r4_eterna", "R4 Dojo 2 Town — name GAP FOR MARS",
        "r4_route_6", "r4_route_5",
        [(13, "r4_dojo_2", "Dojo 2 — Flora Gate", {"x": 7, "y": 16}),
         (4, "r4_statue", "Statue", {"x": 9, "y": 18})],
        [healer_npc(n, "r4_eterna"), shop_npc(n, "r4_eterna"),
         dialogue_npc(n, e06, "Forest keeper", 14, 20, "🌲", nid="forest_keeper")],
        gap_sign("R4-06", "DOJO 2 TOWN", "Dojo 2 (Flora) is here. The statue is west. The institute took something from it.")))
    th, bd = dojo_info(n, "R4-020")
    MAPS.append(dojo_map(n, "r4_dojo_2", "Dojo 2 — Flora Gate", "r4_eterna", 13,
                          ["R4-018", "R4-019"], "R4-06", 2, th, bd, "R4-020"))
    MAPS.append(sub_map(n, "r4_statue", "Statue — Old History", "r4_eterna", 4,
                         [antagonist_npc(n, e06, 9, 10, nid="institute_operative_statue")],
                         "THE STATUE\nThe forest is old. The statue is older. The institute took something from it.",
                         label="Dojo 2 Town"))
    MAPS.append(route_map(n, "r4_route_6", "Route R4-6", "r4_hearthome", "r4_eterna", [],
                          "ROUTE R4-6\nNorth to Hearthome. South to Eterna."))
    # -- R4-07 Hearthome, Dojo 3, contest hall
    MAPS.append(town_map(n, "r4_hearthome", "R4 Dojo 3 Town — name GAP FOR MARS",
        "r4_route_7", "r4_route_6",
        [(13, "r4_dojo_3", "Dojo 3 — Umbral Gate", {"x": 7, "y": 16}),
         (4, "r4_contest_hall", "Contest Hall", {"x": 9, "y": 18})],
        [healer_npc(n, "r4_hearthome"), shop_npc(n, "r4_hearthome"),
         dialogue_npc(n, e07, "Mochiko", 14, 20, "🧑", nid="mochiko_hearthome")],
        gap_sign("R4-07", "DOJO 3 TOWN", "Dojo 3 (Umbral) is here. Contest hall: west. Garden branch: here, new soil.")))
    MAPS.append(sub_map(n, "r4_contest_hall", "Contest Hall", "r4_hearthome", 4,
                         [dialogue_npc(n, e07, "Contest hall keeper", 9, 10, "📣", nid="contest_hall_keeper")],
                         "CONTEST HALL\nThe contest is not a battle. It is a showing. Show your creature, and show it kindly.",
                         label="Dojo 3 Town"))
    th, bd = dojo_info(n, "R4-023")
    MAPS.append(dojo_map(n, "r4_dojo_3", "Dojo 3 — Umbral Gate", "r4_hearthome", 13,
                          ["R4-021", "R4-022"], "R4-07", 3, th, bd, "R4-023"))
    MAPS.append(route_map(n, "r4_route_7", "Route R4-7", "r4_veilstone", "r4_hearthome", [],
                          "ROUTE R4-7\nNorth to Veilstone. South to Hearthome."))
    # -- R4-08 Veilstone, Dojo 4, warehouse
    MAPS.append(town_map(n, "r4_veilstone", "R4 Dojo 4 Town — name GAP FOR MARS",
        "r4_route_8", "r4_route_7",
        [(13, "r4_dojo_4", "Dojo 4 — Strike Gate", {"x": 7, "y": 16}),
         (4, "r4_warehouse", "Warehouse", {"x": 9, "y": 18})],
        [healer_npc(n, "r4_veilstone"), shop_npc(n, "r4_veilstone"),
         dialogue_npc(n, e08, "Warehouse keeper", 14, 20, "🛒", nid="warehouse_keeper")],
        gap_sign("R4-08", "DOJO 4 TOWN", "Dojo 4 (Strike) is here. Warehouses: west. Unlabelled things are not lost. They are hidden.")))
    MAPS.append(sub_map(n, "r4_warehouse", "Warehouse — Meteorite", "r4_veilstone", 4,
                         [antagonist_npc(n, e08, 9, 10, nid="institute_operative_warehouse")],
                         "WAREHOUSE\nThe meteorite is research. Research is not yours to touch.",
                         label="Dojo 4 Town"))
    th, bd = dojo_info(n, "R4-026")
    MAPS.append(dojo_map(n, "r4_dojo_4", "Dojo 4 — Strike Gate", "r4_veilstone", 13,
                          ["R4-024", "R4-025"], "R4-08", 4, th, bd, "R4-026"))
    MAPS.append(route_map(n, "r4_route_8", "Route R4-8", "r4_pastoria", "r4_veilstone", [],
                          "ROUTE R4-8\nNorth to Pastoria. South to Veilstone."))
    # -- R4-09 Pastoria, Dojo 5, preserve (on the path, lake shape)
    MAPS.append(town_map(n, "r4_pastoria", "R4 Dojo 5 Town — name GAP FOR MARS",
        "r4_preserve", "r4_route_8",
        [(13, "r4_dojo_5", "Dojo 5 — Water Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r4_pastoria"), shop_npc(n, "r4_pastoria"),
         dialogue_npc(n, e09, "Marsh keeper", 14, 20, "🌿", nid="marsh_keeper")],
        gap_sign("R4-09", "DOJO 5 TOWN", "Dojo 5 (Water) is here. Preserve: north. Wave-Ride works here, same as before.")))
    th, bd = dojo_info(n, "R4-029")
    MAPS.append(dojo_map(n, "r4_dojo_5", "Dojo 5 — Water Gate", "r4_pastoria", 13,
                          ["R4-027", "R4-028"], "R4-09", 5, th, bd, "R4-029"))
    MAPS.append(lake_map(n, "r4_preserve", "Preserve — Marsh Waters",
                         "r4_route_9", "r4_pastoria",
                         [dialogue_npc(n, e09, "Preserve guide", 14, 27, "🌿", nid="preserve_guide")],
                         "PRESERVE\nLook, learn, do not take more than the marsh offers."))
    MAPS.append(route_map(n, "r4_route_9", "Route R4-9", "r4_celestic", "r4_preserve", [],
                          "ROUTE R4-9\nNorth to Celestic. South to the preserve."))
    # -- R4-10 Celestic, cave painting (lore trainers in town)
    MAPS.append(town_map(n, "r4_celestic", "R4 Old Town — name GAP FOR MARS",
        "r4_route_10", "r4_route_9",
        [(13, "r4_cave_painting", "Cave Painting", {"x": 7, "y": 16})],
        [healer_npc(n, "r4_celestic"), shop_npc(n, "r4_celestic"),
         dialogue_npc(n, e10, "Celestic elder", 14, 20, "🧓", nid="celestic_elder"),
         battle_npc(n, T["R4-005"], 8, 25, sprite="📜"),
         battle_npc(n, T["R4-006"], 20, 25, sprite="🎨")],
        gap_sign("R4-10", "OLD TOWN", "No dojo here. Cave painting: east. Regions 1–3 were chapters. This town is the footnote.")))
    MAPS.append(sub_map(n, "r4_cave_painting", "Cave Painting — Old Mainframe", "r4_celestic", 13,
                         [dialogue_npc(n, e10, "Cave painting keeper", 7, 8, "📚", nid="cave_painting_keeper")],
                         "CAVE PAINTING\nThe painting shows the Mainframe before any region. Before Mochiichao, even.",
                         small=True, label="Old Town"))
    MAPS.append(route_map(n, "r4_route_10", "Route R4-10", "r4_canalave", "r4_celestic", [],
                          "ROUTE R4-10\nNorth to Canalave. South to Celestic."))
    # -- R4-11 Canalave, Dojo 6, library, island
    MAPS.append(town_map(n, "r4_canalave", "R4 Dojo 6 Town — name GAP FOR MARS",
        "r4_snowpoint", "r4_route_10",
        [(13, "r4_dojo_6", "Dojo 6 — Chrome Gate", {"x": 7, "y": 16}),
         (4, "r4_library", "Library", {"x": 9, "y": 18}),
         (22, "r4_island", "Island", {"x": 9, "y": 18})],
        [healer_npc(n, "r4_canalave"), shop_npc(n, "r4_canalave"),
         dialogue_npc(n, e11, "Port keeper", 14, 20, "⚓", nid="port_keeper_canalave")],
        gap_sign("R4-11", "DOJO 6 TOWN", "Dojo 6 (Chrome) is here. Library: west. Island: east, across the water.")))
    MAPS.append(sub_map(n, "r4_library", "Library — Every Book Except One", "r4_canalave", 4,
                         [dialogue_npc(n, e11, "Library keeper", 9, 10, "📚", nid="library_keeper")],
                         "LIBRARY\nThe library has every book except the one you need. That book is on the island.",
                         label="Dojo 6 Town"))
    MAPS.append(sub_map(n, "r4_island", "Island — Nightmare", "r4_canalave", 22,
                         [],
                         "THE ISLAND\nThe creature here is not wild. It is a nightmare, and nightmares do not follow Codex rules.",
                         label="Dojo 6 Town"))
    th, bd = dojo_info(n, "R4-032")
    MAPS.append(dojo_map(n, "r4_dojo_6", "Dojo 6 — Chrome Gate", "r4_canalave", 13,
                          ["R4-030", "R4-031"], "R4-11", 6, th, bd, "R4-032"))
    # -- R4-12 Snowpoint, Dojo 7, temple (direct links: canalave -> snowpoint -> sunyshore)
    MAPS.append(town_map(n, "r4_snowpoint", "R4 Dojo 7 Town — name GAP FOR MARS",
        "r4_sunyshore", "r4_canalave",
        [(13, "r4_dojo_7", "Dojo 7 — Water-Ice Gate", {"x": 7, "y": 16}),
         (4, "r4_temple", "Temple", {"x": 9, "y": 18})],
        [healer_npc(n, "r4_snowpoint"), shop_npc(n, "r4_snowpoint")],
        gap_sign("R4-12", "DOJO 7 TOWN", "Dojo 7 (Water-ice) is here. Temple: west. Snow does not hurry.")))
    MAPS.append(sub_map(n, "r4_temple", "Temple — Cold Truth", "r4_snowpoint", 4,
                         [dialogue_npc(n, e12, "Temple keeper", 9, 10, "⛩️", nid="temple_keeper")],
                         "TEMPLE\nThe temple is cold because the truth is cold. Warm up inside, then go back out and face it.",
                         label="Dojo 7 Town"))
    th, bd = dojo_info(n, "R4-035")
    MAPS.append(dojo_map(n, "r4_dojo_7", "Dojo 7 — Water-Ice Gate", "r4_snowpoint", 13,
                          ["R4-033", "R4-034"], "R4-12", 7, th, bd, "R4-035"))
    # -- R4-13 Sunyshore, Dojo 8
    MAPS.append(town_map(n, "r4_sunyshore", "R4 Dojo 8 Town — name GAP FOR MARS",
        "r4_victory_route", "r4_snowpoint",
        [(13, "r4_dojo_8", "Dojo 8 — Chrome Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r4_sunyshore"), shop_npc(n, "r4_sunyshore"),
         dialogue_npc(n, e13, "Solar keeper", 14, 20, "☀️", nid="solar_keeper"),
         dialogue_npc(n, e13, "Lighthouse road keeper", 10, 20, "🚶", nid="lighthouse_road_keeper")],
        gap_sign("R4-13", "DOJO 8 TOWN", "Dojo 8 (Chrome) is here. The road to the lighthouse is the last road in the region.")))
    th, bd = dojo_info(n, "R4-038")
    MAPS.append(dojo_map(n, "r4_dojo_8", "Dojo 8 — Chrome Gate", "r4_sunyshore", 13,
                          ["R4-036", "R4-037"], "R4-13", 8, th, bd, "R4-038"))
    # gate the gauntlet: sunyshore -> victory route is badges>=32
    for m in MAPS:
        if m["key"] == "r4_sunyshore":
            m["exits"][0]["condition"] = "badges>=32"
    # -- R4-14 victory route, R4-15 plateau, R4-16 battle zone + rift
    beats14 = npc_lines(e14, "Veteran trainer")
    vets = [battle_npc(n, T[r], x, y, sprite="🎖️")
            for r, x, y in [("R4-007", 10, 15), ("R4-008", 18, 15), ("R4-009", 10, 25), ("R4-010", 18, 25)]]
    vets[0]["dialog"] = [beats14[0]]
    vets[0]["post"] = [beats14[1]]
    MAPS.append(route_map(n, "r4_victory_route", "Victory Route — Region 4 Gauntlet",
        "r4_plateau", "r4_sunyshore",
        [dialogue_npc(n, e14, "Victory gate keeper", 14, 20, "🏔️", nid="victory_gate_keeper")] + vets,
        "VICTORY ROUTE\nNorth to the Plateau, fourth ascent. South to Sunyshore."))
    MAPS.append(town_map(n, "r4_plateau", "Mainframe Plateau — Fourth Ascent",
        "r4_battle_zone", "r4_victory_route", [],
        plateau_npcs(n, "R4-15"),
        "HALL OF RECORDS\nFourth entry is set on Champion defeat. Flag r4_hall_fourth_entry — owed: no Champion battle yet."))
    MAPS.append(town_map(n, "r4_battle_zone", "Battle Zone — Volcano Island",
        "r4_rift_dungeon", "r4_plateau", [],
        [dialogue_npc(n, e16, "Battle Zone keeper", 14, 20, "🌋", nid="battle_zone_keeper")]
        + [{"id": f"r4_0{11+i}_challenger", "x": 8 + i * 4, "y": 10, "sprite": "🥋",
            "name": "Battle Zone Challenger",
            "dialog": [f"PLACEHOLDER — battle line GAP FOR MARS (trainer row R4-0{11+i}; challenger is NAME GAP, battle owed)."],
            "post": [f"PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R4-0{11+i})."]}
           for i in range(3)],
        "BATTLE ZONE\nAn island with a volcano in it, and a legendary creature in the volcano. North: the Rift dungeon."))
    rift_lines = (npc_lines(e16, "Rift keeper, before") or []) + (npc_lines(e16, "Rift keeper, after") or [])
    MAPS.append(sub_map(n, "r4_rift_dungeon", "Rift Dungeon — The Wound", "r4_battle_zone", 13,
                         [{"id": "rift_keeper", "x": 9, "y": 10, "sprite": "🛡️", "name": "Rift Keeper",
                           "dialog": rift_lines,
                           "ink": ("region4-story", entry_knot(n, "R4-16"))},
                          {"id": "r4_014_warden", "x": 9, "y": 4, "sprite": "🛡️", "name": "Rift Warden",
                           "dialog": ["PLACEHOLDER — battle line GAP FOR MARS (trainer row R4-014; warden is NAME GAP, battle owed)."],
                           "post": ["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R4-014)."]}],
                         "RIFT DUNGEON\nDown there, the Mainframe shows its bones. Do not touch the bones. Just close the wound.",
                         label="Battle Zone"))
    # onward link R4 -> R5 (signal: train / ship / portal all point the same way)
    for m in MAPS:
        if m["key"] == "r4_rift_dungeon":
            m["exits"] = [exit_(9, 0, "r5_start_city", {"x": 14, "y": 29}, "up")]

# ================================================================= REGION 5
def build_region5():
    n = 5
    e01, e02, e03, e04, e05 = entry(n, "R5-01"), entry(n, "R5-02"), entry(n, "R5-03"), entry(n, "R5-04"), entry(n, "R5-05")
    e06, e07, e08, e09, e10 = entry(n, "R5-06"), entry(n, "R5-07"), entry(n, "R5-08"), entry(n, "R5-09"), entry(n, "R5-10")
    e11, e12, e13, e14, e15 = entry(n, "R5-11"), entry(n, "R5-12"), entry(n, "R5-13"), entry(n, "R5-14"), entry(n, "R5-15")
    e16, e17 = entry(n, "R5-16"), entry(n, "R5-17")
    T = TRAINERS[n]

    # -- R5-01 portal-train arrival (Start City is a Mochiichao-original name)
    MAPS.append(town_map(n, "r5_start_city", "Start City — Region 5 Arrival",
        "r5_route_1", None,
        [(13, "r5_mochiiplex_start_city", "Start City MochiiPlex", {"x": 7, "y": 10})],
        [dialogue_npc(n, e01, "Portal-train conductor", 14, 20, "🚂", nid="portal_train_conductor"),
         dialogue_npc(n, e01, "Start City elder", 10, 20, "🧓", nid="start_city_elder")],
        "START CITY\nLast continent, first stop. The portal train does not go back on its own."))
    MAPS.append(mochiiplex_map(n, "r5_mochiiplex_start_city", "r5_start_city", "Start City",
                                "Start City MochiiPlex"))
    MAPS.append(route_map(n, "r5_route_1", "Route R5-1 — First Route",
        "r5_sandgem", "r5_start_city",
        [battle_npc(n, T["R5-001"], 10, 15), battle_npc(n, T["R5-002"], 18, 25)],
        "ROUTE R5-1 — FIRST ROUTE\nNorth to the researcher's town. South to Start City."))
    # -- R5-02 Sandgem-shape town
    MAPS.append(town_map(n, "r5_sandgem", "R5 Research Town — name GAP FOR MARS",
        "r5_route_2", "r5_route_1", [],
        [healer_npc(n, "r5_sandgem"), shop_npc(n, "r5_sandgem"),
         dialogue_npc(n, e02, "Town researcher", 14, 20, "🧑‍🔬", nid="town_researcher"),
         dialogue_npc(n, e02, "Route keeper", 10, 20, "🚶", nid="route_keeper")],
        gap_sign("R5-02", "RESEARCH TOWN", "The last continent has its own first route. Walk it like it is your first route ever.")))
    MAPS.append(route_map(n, "r5_route_2", "Route R5-2", "r5_jubilife", "r5_sandgem", [],
                          "ROUTE R5-2\nNorth to the media city. South to the researcher's town."))
    # -- R5-03 Jubilife-shape city (Front Recruits R5-003/004 have no dialogue
    # mapKey — left unwired, owed; the rally speaker is dialogue-only here)
    MAPS.append(town_map(n, "r5_jubilife", "R5 Media City — name GAP FOR MARS",
        "r5_route_3", "r5_route_2", [],
        [healer_npc(n, "r5_jubilife"), shop_npc(n, "r5_jubilife"),
         dialogue_npc(n, e03, "Media clerk", 14, 20, "🛒", nid="media_clerk"),
         dialogue_npc(n, e03, "City elder", 10, 20, "🧓", nid="city_elder"),
         antagonist_npc(n, e03, 18, 20)],
        gap_sign("R5-03", "MEDIA CITY", "The Front is on every screen here. That is a rally, not a conversation.")))
    MAPS.append(route_map(n, "r5_route_3", "Route R5-3", "r5_oreburgh", "r5_jubilife", [],
                          "ROUTE R5-3\nNorth to Oreburgh. South to the media city."))
    # -- R5-04 Oreburgh, Dojo 1 (CONFLICT: row R5-012 names Hex as Dojo 1
    # leader; R5-04 dialogue says NAME GAP. Leader stays dialogue-only,
    # flagged for Mars — see the dojo comment override below.)
    MAPS.append(town_map(n, "r5_oreburgh", "R5 Dojo 1 Town — name GAP FOR MARS",
        "r5_route_4", "r5_route_3",
        [(13, "r5_dojo_1", "Dojo 1 — Beast Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r5_oreburgh"), shop_npc(n, "r5_oreburgh"),
         dialogue_npc(n, e04, "Mine keeper", 14, 20, "⛏️", nid="mine_keeper")],
        gap_sign("R5-04", "DOJO 1 TOWN", "Dojo 1 (Beast) is here. The mine is the same work, new rock.")))
    th, bd = dojo_info(n, "R5-012")
    _d1 = dojo_map(n, "r5_dojo_1", "Dojo 1 — Beast Gate", "r5_oreburgh", 13,
                   ["R5-010", "R5-011"], "R5-04", 1, th, bd, "R5-012")
    _d1["comment"] = ("// Dojo 1 — Beast Gate — Dojo theme Beast, badge Beast Fragment "
                      "(trainer row R5-012).\n"
                      "// CONFLICT flagged for Mars: row R5-012 names Hex as the Dojo 1 "
                      "leader, but R5-04 dialogue says the leader is NAME GAP.\n"
                      "// Leader stays dialogue-only here; Mars decides which is canon.")
    MAPS.append(_d1)
    MAPS.append(route_map(n, "r5_route_4", "Route R5-4", "r5_floaroma", "r5_oreburgh", [],
                          "ROUTE R5-4\nNorth to Floaroma. South to Oreburgh."))
    # -- R5-05 Floaroma (flower keeper; Front pamphlet is dialogue, no row)
    MAPS.append(town_map(n, "r5_floaroma", "R5 Flower Town — name GAP FOR MARS",
        "r5_route_5", "r5_route_4", [],
        [healer_npc(n, "r5_floaroma"), shop_npc(n, "r5_floaroma"),
         dialogue_npc(n, e05, "Flower keeper", 14, 20, "🌸", nid="flower_keeper")],
        gap_sign("R5-05", "FLOWER TOWN", "The valley here is not the valley in Region 4. Same flowers, different soil.")))
    MAPS.append(route_map(n, "r5_route_5", "Route R5-5", "r5_eterna", "r5_floaroma", [],
                          "ROUTE R5-5\nNorth to Eterna. South to Floaroma."))
    # -- R5-06 Eterna, Dojo 2
    MAPS.append(town_map(n, "r5_eterna", "R5 Dojo 2 Town — name GAP FOR MARS",
        "r5_route_6", "r5_route_5",
        [(13, "r5_dojo_2", "Dojo 2 — Flame Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r5_eterna"), shop_npc(n, "r5_eterna"),
         dialogue_npc(n, e06, "Forest keeper", 14, 20, "🌲", nid="forest_keeper")],
        gap_sign("R5-06", "DOJO 2 TOWN", "Dojo 2 (Flame) is here. Young trees bend, and bending is a skill.")))
    th, bd = dojo_info(n, "R5-015")
    MAPS.append(dojo_map(n, "r5_dojo_2", "Dojo 2 — Flame Gate", "r5_eterna", 13,
                          ["R5-013", "R5-014"], "R5-06", 2, th, bd, "R5-015"))
    MAPS.append(route_map(n, "r5_route_6", "Route R5-6", "r5_hearthome", "r5_eterna", [],
                          "ROUTE R5-6\nNorth to Hearthome. South to Eterna."))
    # -- R5-07 Hearthome, Dojo 3, contest hall
    MAPS.append(town_map(n, "r5_hearthome", "R5 Dojo 3 Town — name GAP FOR MARS",
        "r5_route_7", "r5_route_6",
        [(13, "r5_dojo_3", "Dojo 3 — Chrome Gate", {"x": 7, "y": 16}),
         (4, "r5_contest_hall", "Contest Hall", {"x": 9, "y": 18})],
        [healer_npc(n, "r5_hearthome"), shop_npc(n, "r5_hearthome"),
         dialogue_npc(n, e07, "Mochiko", 14, 20, "🧑", nid="mochiko_hearthome")],
        gap_sign("R5-07", "DOJO 3 TOWN", "Dojo 3 (Chrome) is here. Contest hall: west. Garden branch: here, new soil.")))
    MAPS.append(sub_map(n, "r5_contest_hall", "Contest Hall", "r5_hearthome", 4,
                         [dialogue_npc(n, e07, "Contest hall keeper", 9, 10, "📣", nid="contest_hall_keeper")],
                         "CONTEST HALL\nThe contest here is the same showing, new lights. Show your creature, and show it kindly.",
                         label="Dojo 3 Town"))
    th, bd = dojo_info(n, "R5-018")
    MAPS.append(dojo_map(n, "r5_dojo_3", "Dojo 3 — Chrome Gate", "r5_hearthome", 13,
                          ["R5-016", "R5-017"], "R5-07", 3, th, bd, "R5-018"))
    MAPS.append(route_map(n, "r5_route_7", "Route R5-7", "r5_veilstone", "r5_hearthome", [],
                          "ROUTE R5-7\nNorth to Veilstone. South to Hearthome."))
    # -- R5-08 Veilstone, Dojo 4, warehouse
    MAPS.append(town_map(n, "r5_veilstone", "R5 Dojo 4 Town — name GAP FOR MARS",
        "r5_route_8", "r5_route_7",
        [(13, "r5_dojo_4", "Dojo 4 — Strike Gate", {"x": 7, "y": 16}),
         (4, "r5_warehouse", "Warehouse", {"x": 9, "y": 18})],
        [healer_npc(n, "r5_veilstone"), shop_npc(n, "r5_veilstone"),
         dialogue_npc(n, e08, "Warehouse keeper", 14, 20, "🛒", nid="warehouse_keeper")],
        gap_sign("R5-08", "DOJO 4 TOWN", "Dojo 4 (Strike) is here. Warehouses: west. Supplies are not arguments.")))
    MAPS.append(sub_map(n, "r5_warehouse", "Warehouse — Front Supplies", "r5_veilstone", 4,
                         [antagonist_npc(n, e08, 9, 10, nid="liberation_front_operative_warehouse")],
                         "WAREHOUSE\nThe warehouses here are full of Front supplies. Supplies are not arguments.",
                         label="Dojo 4 Town"))
    th, bd = dojo_info(n, "R5-021")
    MAPS.append(dojo_map(n, "r5_dojo_4", "Dojo 4 — Strike Gate", "r5_veilstone", 13,
                          ["R5-019", "R5-020"], "R5-08", 4, th, bd, "R5-021"))
    MAPS.append(route_map(n, "r5_route_8", "Route R5-8", "r5_pastoria", "r5_veilstone", [],
                          "ROUTE R5-8\nNorth to Pastoria. South to Veilstone."))
    # -- R5-09 Pastoria, Dojo 5, preserve (frozen plot: guide + Front operative)
    MAPS.append(town_map(n, "r5_pastoria", "R5 Dojo 5 Town — name GAP FOR MARS",
        "r5_preserve", "r5_route_8",
        [(13, "r5_dojo_5", "Dojo 5 — Core Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r5_pastoria"), shop_npc(n, "r5_pastoria"),
         dialogue_npc(n, e09, "Marsh keeper", 14, 20, "🌿", nid="marsh_keeper")],
        gap_sign("R5-09", "DOJO 5 TOWN", "Dojo 5 (Core) is here. Preserve: north. Cold is not the same as dead.")))
    th, bd = dojo_info(n, "R5-024")
    MAPS.append(dojo_map(n, "r5_dojo_5", "Dojo 5 — Core Gate", "r5_pastoria", 13,
                          ["R5-022", "R5-023"], "R5-09", 5, th, bd, "R5-024"))
    MAPS.append(lake_map(n, "r5_preserve", "Preserve — Frozen Plot",
                         "r5_route_9", "r5_pastoria",
                         [dialogue_npc(n, e09, "Preserve guide", 14, 27, "🌿", nid="preserve_guide"),
                          antagonist_npc(n, e09, 18, 27, nid="liberation_front_operative_cold_corner")],
                         "PRESERVE\nSomething frozen is in the marsh's cold corner, and the Front is interested in it."))
    MAPS.append(route_map(n, "r5_route_9", "Route R5-9", "r5_celestic", "r5_preserve", [],
                          "ROUTE R5-9\nNorth to Celestic. South to the preserve."))
    # -- R5-10 Celestic (no dojo, no sub — lore town only)
    MAPS.append(town_map(n, "r5_celestic", "R5 Old Town — name GAP FOR MARS",
        "r5_route_10", "r5_route_9", [],
        [healer_npc(n, "r5_celestic"), shop_npc(n, "r5_celestic"),
         dialogue_npc(n, e10, "Lore keeper", 14, 20, "📚", nid="lore_keeper"),
         dialogue_npc(n, e10, "Celestic elder", 10, 20, "🧓", nid="celestic_elder")],
        gap_sign("R5-10", "OLD TOWN", "No dojo here. The bond is the story here. Not the battle, not the badge.")))
    MAPS.append(route_map(n, "r5_route_10", "Route R5-10", "r5_canalave", "r5_celestic", [],
                          "ROUTE R5-10\nNorth to Canalave. South to Celestic."))
    # -- R5-11 Canalave, Dojo 6, library (Front speaker on the library steps)
    MAPS.append(town_map(n, "r5_canalave", "R5 Dojo 6 Town — name GAP FOR MARS",
        "r5_snowpoint", "r5_route_10",
        [(13, "r5_dojo_6", "Dojo 6 — Aero Gate", {"x": 7, "y": 16}),
         (4, "r5_library", "Library", {"x": 9, "y": 18})],
        [healer_npc(n, "r5_canalave"), shop_npc(n, "r5_canalave")],
        gap_sign("R5-11", "DOJO 6 TOWN", "Dojo 6 (Aero) is here. Library: west. The book does not say what the Front says it says.")))
    MAPS.append(sub_map(n, "r5_library", "Library — The Frozen One's Book", "r5_canalave", 4,
                         [dialogue_npc(n, e11, "Library keeper", 9, 10, "📚", nid="library_keeper"),
                          antagonist_npc(n, e11, 13, 10, nid="liberation_front_speaker_library")],
                         "LIBRARY\nThe library here has a book about the frozen one. Read it yourself. That is the whole job.",
                         label="Dojo 6 Town"))
    th, bd = dojo_info(n, "R5-027")
    MAPS.append(dojo_map(n, "r5_dojo_6", "Dojo 6 — Aero Gate", "r5_canalave", 13,
                          ["R5-025", "R5-026"], "R5-11", 6, th, bd, "R5-027"))
    # -- R5-12 Snowpoint, Dojo 7, temple (direct town exits canalave ->
    # snowpoint -> sunyshore, no route maps — R4 precedent)
    MAPS.append(town_map(n, "r5_snowpoint", "R5 Dojo 7 Town — name GAP FOR MARS",
        "r5_sunyshore", "r5_canalave",
        [(13, "r5_dojo_7", "Dojo 7 — Water-Ice Gate", {"x": 7, "y": 16}),
         (4, "r5_temple", "Temple", {"x": 9, "y": 18})],
        [healer_npc(n, "r5_snowpoint"), shop_npc(n, "r5_snowpoint")],
        gap_sign("R5-12", "DOJO 7 TOWN", "Dojo 7 (Water-ice) is here. Temple: west. Cold is not evil. Cold is just cold.")))
    MAPS.append(sub_map(n, "r5_temple", "Temple — Cold Truth", "r5_snowpoint", 4,
                         [dialogue_npc(n, e12, "Temple keeper", 9, 10, "⛩️", nid="temple_keeper")],
                         "TEMPLE\nThe temple is cold, and the frozen one is colder. Cold is not evil. Cold is just cold.",
                         label="Dojo 7 Town"))
    th, bd = dojo_info(n, "R5-030")
    MAPS.append(dojo_map(n, "r5_dojo_7", "Dojo 7 — Water-Ice Gate", "r5_snowpoint", 13,
                          ["R5-028", "R5-029"], "R5-12", 7, th, bd, "R5-030"))
    # -- R5-13 Sunyshore, Dojo 8
    MAPS.append(town_map(n, "r5_sunyshore", "R5 Dojo 8 Town — name GAP FOR MARS",
        "r5_victory_route", "r5_snowpoint",
        [(13, "r5_dojo_8", "Dojo 8 — Mythic Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r5_sunyshore"), shop_npc(n, "r5_sunyshore"),
         dialogue_npc(n, e13, "Solar keeper", 14, 20, "☀️", nid="solar_keeper")],
        gap_sign("R5-13", "DOJO 8 TOWN", "Dojo 8 (Mythic) is here. The city runs on sun, even on the last continent.")))
    th, bd = dojo_info(n, "R5-033")
    MAPS.append(dojo_map(n, "r5_dojo_8", "Dojo 8 — Mythic Gate", "r5_sunyshore", 13,
                          ["R5-031", "R5-032"], "R5-13", 8, th, bd, "R5-033"))
    # gate the gauntlet: sunyshore -> victory route is badges>=40
    for m in MAPS:
        if m["key"] == "r5_sunyshore":
            m["exits"][0]["condition"] = "badges>=40"
    # -- R5-14 victory route (FIVE veterans: R5-005..009), R5-15 plateau,
    # R5-16 grand tournament, R5-17 mythar final
    beats14 = npc_lines(e14, "Veteran trainer")
    vets = [battle_npc(n, T[r], x, y, sprite="🎖️")
            for r, x, y in [("R5-005", 10, 15), ("R5-006", 18, 15), ("R5-007", 10, 25),
                            ("R5-008", 18, 25), ("R5-009", 14, 30)]]
    vets[0]["dialog"] = [beats14[0]]
    vets[0]["post"] = [beats14[1]]
    MAPS.append(route_map(n, "r5_victory_route", "Victory Route — Region 5 Gauntlet",
        "r5_plateau", "r5_sunyshore",
        [dialogue_npc(n, e14, "Victory gate keeper", 14, 20, "🏔️", nid="victory_gate_keeper")] + vets,
        "VICTORY ROUTE\nNorth to the Plateau, fifth ascent. South to Sunyshore."))
    MAPS.append(town_map(n, "r5_plateau", "Mainframe Plateau — Fifth Ascent",
        "r5_grand_tournament", "r5_victory_route", [],
        plateau_npcs(n, "R5-15"),
        "HALL OF RECORDS\nFifth entry is set on Champion defeat. Flag r5_hall_fifth_entry — owed: no Champion battle yet."))
    # Grand Tournament: announcer + keeper + Hex (dialogue-only, hex block)
    # + 6 NAME GAP tournament challengers (R5-039..044, dialogue-only).
    challengers = [{"id": f"r5_0{39+i}_challenger", "x": 8 + i * 4, "y": 10, "sprite": "🥋",
                    "name": "Tournament Challenger",
                    "dialog": [f"PLACEHOLDER — battle line GAP FOR MARS (trainer row R5-0{39+i}; challenger is NAME GAP, battle owed)."],
                    "post": [f"PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R5-0{39+i})."]}
                   for i in range(6)]
    MAPS.append(town_map(n, "r5_grand_tournament", "Grand Tournament — Final Bracket",
        "r5_mythar_final", "r5_plateau", [],
        [dialogue_npc(n, e16, "Tournament announcer", 14, 20, "📣", nid="tournament_announcer"),
         dialogue_npc(n, e16, "Tournament keeper", 10, 20, "🚶", nid="tournament_keeper"),
         {"id": "hex_grand_tournament", "x": 18, "y": 20, "sprite": "😤", "name": "Hex",
          "dialog": e16["hex"]["pre"], "post": e16["hex"]["post"],
          "ink": ("region5-story", entry_knot(n, "R5-16"))}] + challengers,
        "GRAND TOURNAMENT\nEvery champion, every region, one bracket. Win it, and you face Mythar."))
    # Mythar final: attendant + Aeon only. R5-047 Mythar (species 331, not in
    # SPECIES_DB) gets NO battle NPC; the R5-17 champion block is Mythar's
    # battle lines, owed with the battle itself.
    MAPS.append(site_map(n, "r5_mythar_final", "Mythar — True Final",
                         None, "r5_grand_tournament",
                         [dialogue_npc(n, e17, "Plateau attendant", 12, 16, "🧑", nid="plateau_attendant_final"),
                          dialogue_npc(n, e17, "Prof. Aeon", 8, 16, "🔬", nid="prof_aeon_mythar")],
                         "MYTHAR — TRUE FINAL\nFinal ascent. This is not a region champion. This is the champion of the whole Mainframe."))

# ================================================================= EMISSION
# Wild pools grounded in trainer-row species + levels (R2 audit section 9
# rule). 7 tables: one opening pool + one victory pool per region, plus
# R4 route_1 (its own Sandgem Route trainers, R2 route-1/route-2
# precedent). 038 rides the three opening pools (see dexAreas update).
# minLevel=maxLevel=row level; a species on two rows spans min-max
# (046 in R3 victory: 74-77).
def _slots(pairs):
    """pairs: [(speciesId, level), ...] in trainer-row order; merge dup species into a span."""
    merged = {}
    order = []
    for sid, lvl in pairs:
        if sid in merged:
            lo, hi = merged[sid]
            merged[sid] = (min(lo, lvl), max(hi, lvl))
        else:
            merged[sid] = (lvl, lvl)
            order.append(sid)
    return [{"speciesId": sid, "minLevel": merged[sid][0], "maxLevel": merged[sid][1], "weight": 1}
            for sid in order]

POOLS = [
    ("r3-oldale-road-grass", "r3_oldale_road", "grass", 0.15,
     _slots([("013", 60), ("038", 60), ("019", 61), ("022", 61)])),
    ("r3-victory-route-grass", "r3_victory_route", "grass", 0.22,
     _slots([("021", 74), ("046", 74), ("006", 75), ("003", 75),
             ("012", 76), ("028", 76), ("009", 77), ("046", 77)])),
    ("r4-route-1-grass", "r4_route_1", "grass", 0.15,
     _slots([("041", 78), ("019", 78), ("013", 79), ("022", 79)])),
    ("r4-floaroma-grass", "r4_floaroma", "grass", 0.15,
     _slots([("038", 80), ("041", 80), ("042", 81), ("035", 81)])),
    ("r4-victory-route-grass", "r4_victory_route", "grass", 0.22,
     _slots([("006", 88), ("015", 88), ("021", 89), ("028", 89),
             ("003", 90), ("046", 90), ("012", 91), ("009", 91)])),
    ("r5-route-1-grass", "r5_route_1", "grass", 0.15,
     _slots([("013", 88), ("038", 88), ("019", 89), ("022", 89)])),
    ("r5-victory-route-grass", "r5_victory_route", "grass", 0.22,
     _slots([("006", 96), ("015", 96), ("021", 97), ("028", 97), ("012", 97),
             ("046", 97), ("009", 98), ("003", 98), ("002", 98), ("043", 98)])),
]

# Battle-background scene + music placement by map kind (R2 precedents:
# plateau "route", frost peak "route", lake "water", MochiiPlex "center",
# dojo-theme interiors "dojo", civic interiors "town", caves "cave").
# Open competition grounds (plateau / battle zone / frontier / grand
# tournament) are "route" in both — they are open ground, not built towns.
def battle_bg_for(kind, key):
    if kind == "town":
        return "route" if key in ("r3_plateau", "r4_plateau", "r5_plateau",
                                  "r3_frontier_arenas", "r4_battle_zone",
                                  "r5_grand_tournament") else "town"
    if kind in ("route", "site"):
        return "route"
    if kind == "searoad":
        return "water"
    if kind == "lake":
        return "water"
    if kind == "dojo":
        return "dojo"
    if kind in ("mochiiplex", "house1f", "house2f"):
        return "interior"
    if kind in ("sub", "smallsub"):
        return "cave" if key in ("r3_cave", "r4_cave_painting") else "interior"
    raise AssertionError(f"no battle-bg rule for kind {kind} ({key})")

_CIVIC_SUBS = {"r3_lab", "r3_weather_institute", "r4_statue", "r4_contest_hall",
               "r4_library", "r4_temple", "r4_cave_painting",
               "r5_contest_hall", "r5_library", "r5_temple"}
def music_for(kind, key):
    if kind == "town":
        return "route" if key in ("r3_plateau", "r4_plateau", "r5_plateau",
                                  "r3_frontier_arenas", "r4_battle_zone",
                                  "r5_grand_tournament") else "town"
    if kind in ("route", "searoad", "lake", "site"):
        return "route"
    if kind == "dojo":
        return "dojo"
    if kind == "mochiiplex":
        return "center"
    if kind in ("house1f", "house2f"):
        return "town"
    if kind in ("sub", "smallsub"):
        if key == "r4_island":
            return "route"
        return "town" if key in _CIVIC_SUBS else "dojo"
    raise AssertionError(f"no music rule for kind {kind} ({key})")

# ---------------------------------------------------------------- trainer-teams simulation
def _norm(s):
    return re.sub(r"\s+", " ", s).strip()

def _team_key(team):
    return ",".join(f"{sid}@{lvl}" for sid, lvl in team)

def parse_all_rows():
    """All 265 trainer rows from regions 1-5 (region files on main)."""
    rows = {}
    for n in (1, 2, 3, 4, 5):
        rows.update(parse_trainers(n))
    return rows

ALL_ROWS = parse_all_rows()
print(f"ALL_TRAINER_ROWS parsed: {len(ALL_ROWS)} (expect 265)")
assert len(ALL_ROWS) == 265, f"expected 265 rows, got {len(ALL_ROWS)}"

def display_name(row):
    return f'{row["trainerClass"]} {row["name"]}' if row["name"] else row["trainerClass"]

def resolve_row(npc_name, npc_team=None, npc_reward=None):
    """Faithful port of trainer-teams-resolver.ts resolveTrainerRow."""
    key = _norm(npc_name)
    cands = [r for r in ALL_ROWS.values()
             if "[NAME GAP]" not in r["name"] and _norm(display_name(r)) == key]
    if not cands:
        return None
    if len(cands) == 1:
        return cands[0]
    if npc_team is not None:
        by_team = [c for c in cands if _team_key(c["team"]) == _team_key(npc_team)]
        if len(by_team) == 1:
            return by_team[0]
    if npc_reward is not None:
        by_reward = [c for c in cands if c["reward"] == npc_reward]
        if len(by_reward) == 1:
            return by_reward[0]
    return None

def parse_existing_battles(src):
    """Unique map trainer battles already on main, mirroring the test's
    uniqueMapBattles(): NPC literals + event npc literals, deduped by
    [name, team, reward]. Handles both `battle:{` and `battle: {`
    spellings and badge:null / badge:"..." + optional hmReward."""
    found = []
    pat = re.compile(
        r'battle:\s*\{\s*team:\[(.*?)\],\s*reward:\s*(\d+),\s*badge:(?:null|"[^"]*")[^}]*\}',
        re.S)
    team_pat = re.compile(
        r'\{\s*id:\s*"(\d+)",\s*name:\s*"[^"]*",\s*hp:\s*\d+,\s*maxHp:\s*\d+,\s*atk:\s*\d+,'
        r'\s*def:\s*\d+,\s*spd:\s*\d+,\s*moves:\s*\[[^\]]*\],\s*type:\s*"[^"]*",\s*level:\s*(\d+)\s*\}')
    for m in pat.finditer(src):
        team_s, reward = m.group(1), int(m.group(2))
        names = re.findall(r'name:\s*"((?:[^"\\]|\\.)*)"', src[:m.start()])
        name = names[-1]
        team = [(s, int(l)) for s, l in team_pat.findall(team_s)]
        assert team, f"battle for {name} parsed with empty team"
        found.append({"name": name, "team": team, "reward": reward})
    seen = {}
    for b in found:
        seen[json.dumps([b["name"], b["team"], b["reward"]])] = b
    return list(seen.values())

def new_battles():
    """Battle NPCs in the generated maps (MAPS), in test-dedupe shape."""
    out = []
    for m in MAPS:
        for npc in m["npcs"]:
            if "battle" not in npc:
                continue
            row = npc["battle"]
            out.append({"name": npc["name"],
                        "team": [(s, l) for s, l in row["team"]],
                        "reward": row["reward"]})
    seen = {}
    for b in out:
        seen[json.dumps([b["name"], b["team"], b["reward"]])] = b
    return list(seen.values())

def simulate_parity(existing_src):
    """Returns (battles, matched_names, unmatched_names) for the merged world."""
    battles = parse_existing_battles(existing_src) + new_battles()
    seen = {}
    for b in battles:
        seen[json.dumps([b["name"], b["team"], b["reward"]])] = b
    battles = list(seen.values())
    matched, unmatched = [], []
    for b in battles:
        row = resolve_row(b["name"], b["team"], b["reward"])
        (matched if row else unmatched).append(b["name"])
    return battles, matched, unmatched

# ---------------------------------------------------------------- file emission
def _read(rel):
    with open(f"{BASE}/{rel}") as f:
        return f.read()

def _write(rel, text):
    path = f"{OUT}/{rel}"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(text)

def emit_full_world():
    src = _read("src/world/FullWorldMaps.ts")
    # (a) R2_FROST_PEAK gains its north exit to Region 3 (R2 audit section 6:
    # the link was owed by the Region 3 pass). Plain exit — story flags are
    # not engine gates (R2 audit section 6); the flag stays on the sign.
    i0 = src.find("export const R2_FROST_PEAK")
    i1 = src.find("export const FULL_WORLD")
    assert i0 != -1 and i1 != -1 and i0 < i1
    span = src[i0:i1]
    old_exits = ('  exits: [\n    { x:12, y:23, to:"r2_plateau", enterAt:{x:14, y:1}, dir:"down" },\n  ],')
    new_exits = ('  exits: [\n    { x:12, y:0, to:"r3_outpost_2f", enterAt:{x:6, y:11}, dir:"up" },\n'
                 '    { x:12, y:23, to:"r2_plateau", enterAt:{x:14, y:1}, dir:"down" },\n  ],')
    assert span.count(old_exits) == 1, "frost peak exits block not found exactly once"
    span = span.replace(old_exits, new_exits)
    old_sign = "Storm route to Region 3: owed by the Region 3 pass (flag r3_storm_route_open)."
    new_sign = "Storm route to Region 3: open. North to the Root Hamlet outpost (flag r3_storm_route_open)."
    assert span.count(old_sign) == 1, "frost peak sign not found exactly once"
    span = span.replace(old_sign, new_sign)
    src = src[:i0] + span + src[i1:]
    # (b) 126 new map consts, in MAPS order, before FULL_WORLD.
    consts = "\n".join(emit_map(m) for m in MAPS)
    anchor = "export const FULL_WORLD"
    assert src.count(anchor) == 1
    src = src.replace(anchor, consts + anchor, 1)
    # (c) FULL_WORLD entries, in MAPS order.
    old_tail = "  r2_frost_peak: R2_FROST_PEAK\n};"
    assert src.count(old_tail) == 1
    entries = "\n".join(f"  {m['key']}: {const_name(m['key'])}," for m in MAPS)
    src = src.replace(old_tail, f"  r2_frost_peak: R2_FROST_PEAK,\n{entries}\n}};", 1)
    _write("src/world/FullWorldMaps.ts", src)
    return src

def emit_encounters():
    src = _read("src/data/core/encounters.json")
    tables = []
    for area_id, map_id, method, rate, slots in POOLS:
        tbl = {"areaId": area_id, "mapId": map_id, "method": method,
               "rate": rate, "slots": slots}
        tables.append("\n".join("  " + ln for ln in json.dumps(tbl, indent=2).split("\n")))
    anchor = '    }\n  ],\n  "_worldAreasNote"'
    assert src.count(anchor) == 1, "encounters worldAreas tail anchor not found"
    src = src.replace(anchor, "    },\n" + ",\n".join(tables) + '\n  ],\n  "_worldAreasNote"', 1)
    json.loads(src)  # must still parse
    _write("src/data/core/encounters.json", src)
    return src

def emit_battle_bg():
    src = _read("src/data/core/map-battle-bg.json")
    anchor = '    "r2_well": "cave",\n    "region2_arrival": "town",'
    assert src.count(anchor) == 1
    rows = "\n".join(f'    "{m["key"]}": "{battle_bg_for(m["kind"], m["key"])}",'
                     for m in sorted(MAPS, key=lambda m: m["key"]))
    src = src.replace(anchor, '    "r2_well": "cave",\n' + rows + '\n    "region2_arrival": "town",', 1)
    json.loads(src)
    _write("src/data/core/map-battle-bg.json", src)
    return src

def emit_music():
    src = _read("src/lib/musicPlacement.ts")
    anchor = '  r2_frost_peak: "route",\n};'
    assert src.count(anchor) == 1
    rows = "\n".join(f'  {m["key"]}: "{music_for(m["kind"], m["key"])}",'
                     for m in MAPS)
    src = src.replace(anchor,
        '  r2_frost_peak: "route",\n'
        '  // Regions 3-5 (this PR): same classes as Region 2 — towns "town",\n'
        '  // routes / open grounds "route", dojos "dojo", MochiiPlex "center",\n'
        '  // civic interiors "town", dark interiors "dojo", the island "route".\n'
        + rows + '\n};', 1)
    _write("src/lib/musicPlacement.ts", src)
    return src

def emit_battle_bg_test(battles, matched, unmatched):
    src = _read("src/lib/battleBackground.test.ts")
    anchor = '  r2_frost_peak: "route",\n  garden: "garden",'
    assert src.count(anchor) == 1
    rows = "\n".join(f'  {m["key"]}: "{battle_bg_for(m["kind"], m["key"])}",'
                     for m in MAPS)
    src = src.replace(anchor,
        '  r2_frost_peak: "route",\n'
        '  // Regions 3-5 (this PR) — same "what the place IS" rule: towns\n'
        '  // "town", open grounds / routes / sites "route", sea road +\n'
        '  // preserve "water", dojos "dojo", built interiors "interior",\n'
        '  // the cave + cave painting "cave".\n'
        + rows + '\n  garden: "garden",', 1)
    _write("src/lib/battleBackground.test.ts", src)
    return src

def emit_trainer_teams_test(matched, unmatched):
    src = _read("src/lib/trainer-teams.test.ts")
    assert "wires 48 of 53 unique map trainer battles; 5 keep hand-built teams" in src
    src = src.replace(
        "wires 48 of 53 unique map trainer battles; 5 keep hand-built teams",
        "wires 123 of 129 unique map trainer battles; 6 keep hand-built teams")
    assert "expect(battles.length).toBe(53);" in src
    src = src.replace("expect(battles.length).toBe(53);", "expect(battles.length).toBe(129);")
    # matched list: keep the Region 1 + Region 2 groups verbatim, append the
    # Regions 3-5 group (sorted). The test sorts both sides, so group order
    # does not matter — only the multiset does. Multiset difference against
    # the file's existing list gives the 75 new names (including the second
    # 'Acolyte Gale', 'Acolyte Pup', 'Acolyte Frost', 'Acolyte Wire').
    m = re.search(r"(    expect\(matched\.sort\(\)\)\.toEqual\(\n      \[\n.*?)(      \]\.sort\(\),\n    \);)",
                  src, re.S)
    assert m, "matched expect block not found"
    from collections import Counter
    existing = Counter(re.findall(r"'([^']+)'", m.group(1)))
    new_names = list((Counter(matched) - existing).elements())
    assert len(new_names) == 75, f"expected 75 new matched names, got {len(new_names)}"
    new_names.sort()
    group = ("        // Regions 3-5 (75, this PR): 26 Region 3 + 26 Region 4 + 23 Region 5.\n"
             + "".join(f"        '{nm}',\n" for nm in new_names))
    src = src[:m.start(1)] + m.group(1) + group + m.group(2) + src[m.end(2):]
    # unmatched list: the computed list (with 'Hex' twice).
    m2 = re.search(r"    expect\(unmatched\.sort\(\)\)\.toEqual\(\n      \[(.*?)\]\.sort\(\),\n    \);",
                   src, re.S)
    assert m2, "unmatched expect block not found"
    want_un = ", ".join(f"'{nm}'" for nm in sorted(unmatched))
    src = src[:m2.start(1)] + want_un + src[m2.end(1):]
    _write("src/lib/trainer-teams.test.ts", src)
    return src

def emit_dex_areas_test():
    src = _read("src/lib/dexAreas.test.ts")
    old = '''  it("Sproutle 038 reads route-1-grass only", () => {
    expect(worldAreasForSpecies("038")).toEqual([
      { areaId: "route-1-grass", mapId: "route_1", method: "grass" },
    ]);
  });'''
    new = '''  it("Sproutle 038 reads route-1-grass plus the Regions 3-5 opening pools", () => {
    expect(worldAreasForSpecies("038")).toEqual([
      { areaId: "route-1-grass", mapId: "route_1", method: "grass" },
      { areaId: "r3-oldale-road-grass", mapId: "r3_oldale_road", method: "grass" },
      { areaId: "r4-floaroma-grass", mapId: "r4_floaroma", method: "grass" },
      { areaId: "r5-route-1-grass", mapId: "r5_route_1", method: "grass" },
    ]);
  });'''
    assert src.count(old) == 1
    src = src.replace(old, new, 1)
    _write("src/lib/dexAreas.test.ts", src)
    return src

def emit_region1_rescue_test():
    src = _read("tests/region1-rescue.test.ts")
    old = '''  // PR #423 added the 43 Region 2 maps (46 -> 89). The count below is
  // the new total; the Region 1 keys themselves are pinned by the
  // tests below (sector0 events/signs, Aeon, bags, gates).
  it('FULL_WORLD has 46 Region 1 keys + 43 Region 2 keys (89)', () => {
    expect(Object.keys(FULL_WORLD).length).toBe(89);
  });'''
    new = '''  // PR #423 added the 43 Region 2 maps (46 -> 89); this PR adds the
  // 126 Regions 3-5 maps (89 -> 215). The count below is the new total;
  // the Region 1 keys themselves are pinned by the tests below (sector0
  // events/signs, Aeon, bags, gates).
  it('FULL_WORLD has 46 Region 1 keys + 43 Region 2 keys + 126 Regions 3-5 keys (215)', () => {
    expect(Object.keys(FULL_WORLD).length).toBe(215);
  });'''
    assert src.count(old) == 1
    src = src.replace(old, new, 1)
    _write("tests/region1-rescue.test.ts", src)
    return src

def emit_package():
    src = _read("package.json")
    old = "tests/regions2-maps.test.ts\""
    assert src.count(old) == 1
    src = src.replace(old, "tests/regions2-maps.test.ts tests/regions3-5-maps.test.ts\"", 1)
    _write("package.json", src)
    return src

# ---------------------------------------------------------------- new test file + audit doc
def _ts_list(items):
    return ", ".join(f'"{x}"' for x in items)

def emit_regions_test(matched, unmatched):
    towns_r3 = ["r3_root_hamlet", "r3_rustboro", "r3_dewford", "r3_mauville",
                "r3_lavaridge", "r3_petalburg", "r3_fortree", "r3_lilycove",
                "r3_mossdeep", "r3_crater_city"]
    towns_r4 = ["r4_twinleaf", "r4_sandgem", "r4_jubilife", "r4_oreburgh",
                "r4_floaroma", "r4_eterna", "r4_hearthome", "r4_veilstone",
                "r4_pastoria", "r4_celestic", "r4_canalave", "r4_snowpoint",
                "r4_sunyshore"]
    towns_r5 = ["r5_start_city", "r5_sandgem", "r5_jubilife", "r5_oreburgh",
                "r5_floaroma", "r5_eterna", "r5_hearthome", "r5_veilstone",
                "r5_pastoria", "r5_celestic", "r5_canalave", "r5_snowpoint",
                "r5_sunyshore"]
    dojos = [f"r{n}_dojo_{i}" for n in (3, 4, 5) for i in range(1, 9)]
    folded = {n: [f"r{n}_elite_{i}" for i in range(1, 5)] + [f"r{n}_champion", f"r{n}_hall"]
              for n in (3, 4, 5)}
    entry_knots = []
    for n, ids in ((3, ["R3-01", "R3-02", "R3-03", "R3-04", "R3-05", "R3-06", "R3-07",
                         "R3-08", "R3-09", "R3-09a", "R3-09b", "R3-10", "R3-11",
                         "R3-12", "R3-13"]),
                   (4, [f"R4-{i:02d}" for i in range(1, 17)]),
                   (5, [f"R5-{i:02d}" for i in range(1, 18)])):
        for eid in ids:
            entry_knots.append(entry_knot(n, eid))
    wired_rows = sorted({npc["battle"]["id"] for m in MAPS for npc in m["npcs"]
                         if "battle" in npc})
    # The Hex lab battle (R3-001) is wired but never resolves (see the
    # trainer-teams parity test); the row-matching check below covers the
    # other 75, and Hex is pinned separately.
    assert len(wired_rows) == 76, f"expected 76 wired rows, got {len(wired_rows)}"
    assert "R3-001" in wired_rows
    wired_match_rows = [r for r in wired_rows if r != "R3-001"]
    assert len(wired_match_rows) == 75
    pools_by_map = {map_id: {"method": method, "species": sorted({s["speciesId"] for s in slots})}
                    for area, map_id, method, rate, slots in POOLS}
    test = """// Regions 3-5 maps — Regions 3-5 skeleton tests (2026-11-13).
//
// Pins what the regions3-5-maps PR wires: every region3/4/5-dialogue.json
// mapKey resolves to a FULL_WORLD map (or to the region's plateau, which
// folds the Elite 1-4 / Champion / Hall keys per the R1 mainframe_plateau
// precedent), every exit/door target exists, every map has an entry and
// an exit, every gate names a recognised requirement (fail-closed), every
// town has heal + shop + sign + a non-battle NPC, no dead door, the wired
// battle NPCs match their trainer rows (species + levels + reward), the
// seven grounded wild pools exist in the core tables, and every referenced
// Ink knot resolves in the compiled region stories.
//
// What this does NOT pin (owed, see docs/regions3-5-maps-audit-20261113.md):
// dojo leader battles + badge awards (leaders are NAME GAP, dialogue-only;
// R5-012 names Hex as Dojo 1 leader against R5-04's NAME GAP — flagged for
// Mars), Elite / Champion / Mythar battles, Front Recruit battles
// (R5-003/004), Battle Zone / Tournament / Frontier Brain battles, wild
// pools on the other routes, and the R5 tower climbers (no tower maps).
import { describe, it, expect } from "vitest";
import { FULL_WORLD } from "../src/world/FullWorldMaps";
import {
  TRAINERS_REGION_3,
  type TrainerTeam,
} from "../src/lib/trainers-region3";
import { TRAINERS_REGION_4 } from "../src/lib/trainers-region4";
import { TRAINERS_REGION_5 } from "../src/lib/trainers-region5";
import { tableFor } from "../src/lib/encounters";
import { createInkSession } from "../src/lib/inkStory";
import { isExitOpen, isDoorOpen } from "../src/lib/doorGate";
import { techniqueByName } from "../src/lib/fieldTechniques";
import region3Beats from "../src/lib/wiring/dialogue/region3-dialogue.json";
import region4Beats from "../src/lib/wiring/dialogue/region4-dialogue.json";
import region5Beats from "../src/lib/wiring/dialogue/region5-dialogue.json";

type AnyMap = Record<string, any>;
const M = (k: string): AnyMap => (FULL_WORLD as any)[k];
const r3Keys = Object.keys(FULL_WORLD).filter((k) => k.startsWith("r3_"));
const r4Keys = Object.keys(FULL_WORLD).filter((k) => k.startsWith("r4_"));
const r5Keys = Object.keys(FULL_WORLD).filter((k) => k.startsWith("r5_"));
const NEW_KEYS = [...r3Keys, ...r4Keys, ...r5Keys];

/** All exits + doors of a map, tagged with their kind. */
function links(m: AnyMap): Array<{ kind: string; to: string; condition?: string; hmNeeded?: string }> {
  const out: Array<{ kind: string; to: string; condition?: string; hmNeeded?: string }> = [];
  for (const e of m.exits ?? []) out.push({ kind: "exit", to: e.to, condition: e.condition, hmNeeded: e.hmNeeded });
  for (const d of m.doors ?? []) out.push({ kind: "door", to: d.to, condition: d.condition, hmNeeded: d.hmNeeded });
  return out;
}

function allNpcs(m: AnyMap): any[] {
  return [...(m.npcs ?? []), ...(m.events ?? []).map((e: any) => e.npc).filter(Boolean)];
}

const TOWNS = [
@@TOWNS@@
];
const DOJOS = [
@@DOJOS@@
];
// Dialogue keys folded into each region's plateau (R1 mainframe_plateau
// precedent: one map, 5 battle slots, Hall of Records as a flag, not a map).
const FOLDED: Record<string, Set<string>> = {
  r3_plateau: new Set([@@FOLDED_R3@@]),
  r4_plateau: new Set([@@FOLDED_R4@@]),
  r5_plateau: new Set([@@FOLDED_R5@@]),
};
// One talk knot per dialogue entry (the _after knots are post-battle and
// trigger with the leader battles, which are owed — see the audit doc).
const ENTRY_KNOTS = [
@@ENTRY_KNOTS@@
];
// Trainer rows wired as battle NPCs in this PR: 27 Region 3 + 26 Region 4
// + 23 Region 5 = 76 NPCs, of which 75 resolve to rows. R3-001 (Hex, lab
// battle) is the exception: the NPC is named "Hex", which never resolves,
// so its row is pinned separately below and NOT in this list.
const WIRED_ROWS = [
@@WIRED_ROWS@@
];
// Wild pools grounded in trainer-row species + levels (see the audit doc).
const GROUNDED_POOLS: Record<string, { method: "grass" | "surf"; species: string[] }> = {
@@POOLS@@
};

describe("regions3-5 maps — Regions 3-5 skeleton", () => {
  it("126 Regions 3-5 maps exist in FULL_WORLD (41 + 44 + 41)", () => {
    expect(r3Keys.length).toBe(41);
    expect(r4Keys.length).toBe(44);
    expect(r5Keys.length).toBe(41);
    expect(NEW_KEYS.length).toBe(126);
    expect(M("r3_root_hamlet")).toBeDefined();
    expect(M("r4_twinleaf")).toBeDefined();
    expect(M("r5_start_city")).toBeDefined();
    expect(M("r5_mythar_final")).toBeDefined();
  });

  it("all 112 region3/4/5-dialogue.json mapKeys resolve (18 folded into the plateaus)", () => {
    const keys = new Set<string>();
    for (const beats of [region3Beats, region4Beats, region5Beats] as any[]) {
      for (const e of beats.entries) {
        for (const k of e.mapKeys as string[]) keys.add(k);
      }
    }
    expect(keys.size).toBe(112);
    for (const k of keys) {
      const region = k.slice(0, 2);
      if (FOLDED[`${region}_plateau`].has(k)) continue;
      expect(M(k), `dialogue mapKey ${k} has no map`).toBeDefined();
    }
    for (const p of ["r3_plateau", "r4_plateau", "r5_plateau"]) {
      expect(M(p)).toBeDefined();
    }
  });

  it("inter-region links: Frost Peak -> Root Hamlet outpost, Frontier -> Twinleaf, Rift -> Start City", () => {
    const frost = M("r2_frost_peak");
    expect(frost.exits.some((e: any) => e.to === "r3_outpost_2f")).toBe(true);
    expect(frost.exits.some((e: any) => e.to === "r2_plateau")).toBe(true);
    expect(M("r3_frontier_arenas").exits.some((e: any) => e.to === "r4_twinleaf")).toBe(true);
    expect(M("r4_rift_dungeon").exits.some((e: any) => e.to === "r5_start_city")).toBe(true);
  });

  it("every exit/door target in Regions 3-5 maps exists", () => {
    for (const k of [...NEW_KEYS, "r2_frost_peak"]) {
      for (const l of links((FULL_WORLD as any)[k])) {
        expect((FULL_WORLD as any)[l.to], `${k} -> ${l.to} is missing`).toBeDefined();
      }
    }
  });

  it("every Regions 3-5 map has an outbound link and an inbound link", () => {
    const inbound = new Map<string, number>();
    for (const k of Object.keys(FULL_WORLD)) {
      for (const l of links((FULL_WORLD as any)[k])) {
        inbound.set(l.to, (inbound.get(l.to) ?? 0) + 1);
      }
    }
    for (const k of NEW_KEYS) {
      expect(links(M(k)).length, `${k} has no way out`).toBeGreaterThan(0);
      expect(inbound.get(k) ?? 0, `${k} has no way in`).toBeGreaterThan(0);
    }
  });

  it("every gate names a recognised requirement, fail-closed", () => {
    for (const k of NEW_KEYS) {
      for (const l of links(M(k))) {
        if (l.condition) {
          expect(l.condition, `${k} gate ${l.condition}`).toMatch(/^badges>=\\d+$/);
          expect(isDoorOpen(l.condition, [])).toBe(false);
        }
        if (l.hmNeeded) {
          expect(techniqueByName(l.hmNeeded), `${k} hmNeeded ${l.hmNeeded}`).not.toBeNull();
          expect(isExitOpen({ to: l.to, hmNeeded: l.hmNeeded }, [], {})).toBe(false);
        }
      }
    }
  });

  it("victory gates are badges>=24 (R3), >=32 (R4), >=40 (R5)", () => {
    const cases: [string, string, string, number][] = [
      ["r3_awakening", "r3_victory_route", "badges>=24", 24],
      ["r4_sunyshore", "r4_victory_route", "badges>=32", 32],
      ["r5_sunyshore", "r5_victory_route", "badges>=40", 40],
    ];
    for (const [from, to, cond, need] of cases) {
      const exit = M(from).exits.find((e: any) => e.to === to);
      expect(exit, `${from} -> ${to}`).toBeDefined();
      expect(exit.condition).toBe(cond);
      const short = Array.from({ length: need - 1 }, (_, i) => `b${i}`);
      const full = [...short, `b${need - 1}`];
      expect(isExitOpen(exit, short, {})).toBe(false);
      expect(isExitOpen(exit, full, {})).toBe(true);
    }
  });

  it("sea-road exits are Wave-gated on both shores", () => {
    expect(techniqueByName("Wave")).not.toBeNull();
    for (const town of ["r3_dewford", "r3_mauville"]) {
      const gates = M(town).exits.filter((e: any) => e.to === "r3_sea_route");
      expect(gates.length, `${town} -> sea road`).toBeGreaterThan(0);
      for (const g of gates) expect(g.hmNeeded).toBe("Wave");
    }
  });

  it("every town has heal + shop + sign + a non-battle NPC", () => {
    const hasFlag = (mapKey: string, flag: string, seen = new Set<string>()): boolean => {
      if (seen.has(mapKey)) return false;
      seen.add(mapKey);
      const m = M(mapKey);
      if (!m) return false;
      if (allNpcs(m).some((n) => n[flag])) return true;
      return links(m).some((l) => l.kind === "door" && hasFlag(l.to, flag, seen));
    };
    for (const t of TOWNS) {
      const m = M(t);
      expect(hasFlag(t, "isHeal"), `${t} has no heal`).toBe(true);
      expect(hasFlag(t, "isShop"), `${t} has no shop`).toBe(true);
      expect((m.signs ?? []).length, `${t} has no sign`).toBeGreaterThan(0);
      expect(allNpcs(m).some((n) => !n.battle), `${t} has no non-battle NPC`).toBe(true);
    }
  });

  it("no dead door: every door's target has a way back to the source map", () => {
    for (const k of NEW_KEYS) {
      for (const d of M(k).doors ?? []) {
        const back = links(M(d.to)).some((l) => l.to === k);
        expect(back, `door ${k} -> ${d.to} has no way back`).toBe(true);
      }
    }
  });

  it("dojos: 2 wired acolytes + dialogue-only leader each (badge award owed)", () => {
    for (const d of DOJOS) {
      const npcs = allNpcs(M(d));
      const fighters = npcs.filter((n) => n.battle);
      expect(fighters.length, `${d} acolytes`).toBe(2);
      const leader = npcs.find((n) => n.name === "Dojo Leader");
      expect(leader, `${d} leader`).toBeDefined();
      expect(leader.battle, `${d} leader must stay dialogue-only until named`).toBeUndefined();
    }
  });

  it("75 wired battle NPCs match their trainer rows (species + levels + reward)", () => {
    const rows: TrainerTeam[] = [
      ...(TRAINERS_REGION_3 as TrainerTeam[]),
      ...(TRAINERS_REGION_4 as TrainerTeam[]),
      ...(TRAINERS_REGION_5 as TrainerTeam[]),
    ];
    // Duplicate display names exist across regions (Acolyte Pup, Acolyte
    // Frost, Acolyte Wire, Acolyte Gale), so the row match is by
    // name + team + reward, not by name alone.
    const rowFor = (name: string, team: any[], reward: number): TrainerTeam | undefined => {
      const cands = rows.filter(
        (r) => (r.name ? `${r.trainerClass} ${r.name}` : r.trainerClass) === name,
      );
      return cands.find(
        (r) =>
          JSON.stringify(r.team.map((s) => `${s.speciesId}@${s.level}`)) ===
            JSON.stringify(team.map((m: any) => `${m.id}@${m.level}`)) &&
          r.reward === reward,
      );
    };
    const seen = new Set<string>();
    for (const k of NEW_KEYS) {
      for (const n of allNpcs(M(k))) {
        if (!n.battle) continue;
        if (n.name === "Hex") continue; // R3-001, pinned separately below
        const row = rowFor(n.name, n.battle.team, n.battle.reward);
        expect(row, `${k} NPC ${n.name} has no trainer row`).toBeDefined();
        seen.add(row!.id);
        const inline = n.battle.team.map((m: any) => `${m.id}@${m.level}`);
        const expected = row!.team.map((s) => `${s.speciesId}@${s.level}`);
        expect(inline, `${n.name} inline team`).toEqual(expected);
        expect(n.battle.reward, `${n.name} reward`).toBe(row!.reward);
      }
    }
    expect([...seen].sort()).toEqual([...WIRED_ROWS].sort());
  });

  it("Hex lab battle mirrors row R3-001 exactly (name never resolves)", () => {
    const lab = M("r3_lab");
    const hex = allNpcs(lab).find((n) => n.name === "Hex");
    expect(hex).toBeDefined();
    expect(hex.battle).toBeDefined();
    const row = (TRAINERS_REGION_3 as TrainerTeam[]).find((r) => r.id === "R3-001")!;
    expect(hex.battle.team.map((m: any) => `${m.id}@${m.level}`)).toEqual(
      row.team.map((s) => `${s.speciesId}@${s.level}`),
    );
    expect(hex.battle.reward).toBe(row.reward);
  });

  it("grounded wild pools exist in the core tables with the row species", () => {
    for (const [mapId, want] of Object.entries(GROUNDED_POOLS)) {
      const t = tableFor(mapId, want.method);
      expect(t, `${mapId} ${want.method} table`).not.toBeNull();
      expect(t!.slots.map((s) => s.speciesId).sort()).toEqual([...want.species].sort());
    }
  });

  it("every referenced Ink knot resolves in its region story", () => {
    const referenced = new Set<string>();
    for (const k of NEW_KEYS) {
      const story = `region${k[1]}-story`;
      for (const n of allNpcs(M(k))) {
        if (!n.inkStory) continue;
        expect(n.inkStory, `${k} NPC ${n.id}`).toBe(story);
        referenced.add(`${story}:${n.inkKnot}`);
        expect(
          createInkSession(story, n.inkKnot),
          `${k} NPC ${n.id} knot ${n.inkKnot}`,
        ).not.toBeNull();
      }
    }
    for (const knot of ENTRY_KNOTS) {
      const story = `region${knot[1]}-story`;
      expect(referenced.has(`${story}:${knot}`), `entry knot ${knot} is referenced by no NPC`).toBe(true);
    }
  });

  it("plateaus fold the Elite / Champion / Hall keys and hold 5 dialogue-only slots each", () => {
    for (const p of ["r3_plateau", "r4_plateau", "r5_plateau"]) {
      const npcs = allNpcs(M(p));
      expect(npcs.filter((n) => n.name.startsWith("Elite ")).length, p).toBe(4);
      expect(npcs.some((n) => n.name === "Champion"), p).toBe(true);
      expect(npcs.filter((n) => n.battle).length, p).toBe(0);
      expect(M(p).signs.some((s: any) => s.text.includes("HALL OF RECORDS")), p).toBe(true);
    }
  });

  it("Grand Tournament: 6 dialogue-only challengers + Hex (dialogue-only)", () => {
    const npcs = allNpcs(M("r5_grand_tournament"));
    const challengers = npcs.filter((n) => n.name === "Tournament Challenger");
    expect(challengers.length).toBe(6);
    expect(challengers.filter((n) => n.battle).length).toBe(0);
    const hex = npcs.find((n) => n.name === "Hex");
    expect(hex).toBeDefined();
    expect(hex.battle).toBeUndefined();
    expect(hex.dialog[0]).toContain("I am here too.");
  });

  it("Mythar final: attendant + Aeon only, no Mythar battle NPC", () => {
    const npcs = allNpcs(M("r5_mythar_final"));
    expect(npcs.length).toBe(2);
    expect(npcs.some((n) => n.name === "Plateau Attendant")).toBe(true);
    expect(npcs.some((n) => n.name === "Prof. Aeon")).toBe(true);
    expect(npcs.filter((n) => n.battle).length).toBe(0);
    expect(npcs.some((n) => n.name === "Mythar")).toBe(false);
  });
});
"""
    test = test.replace("@@TOWNS@@",
                        ",\n".join(f'  "{t}"' for t in towns_r3 + towns_r4 + towns_r5) + ",")
    test = test.replace("@@DOJOS@@",
                        ",\n".join(f'  "{d}"' for d in dojos) + ",")
    for n in (3, 4, 5):
        test = test.replace(f"@@FOLDED_R{n}@@",
                            ", ".join(f'"{k}"' for k in folded[n]))
    test = test.replace("@@ENTRY_KNOTS@@",
                        ",\n".join(f'  "{k}"' for k in entry_knots) + ",")
    test = test.replace("@@WIRED_ROWS@@",
                        ",\n".join(f'  "{r}"' for r in wired_match_rows) + ",")
    pools_lines = []
    for map_id in sorted(pools_by_map):
        want = pools_by_map[map_id]
        species = ", ".join(f'"{s}"' for s in want["species"])
        pools_lines.append(f'  {map_id}: {{ method: "{want["method"]}", species: [{species}] }},')
    test = test.replace("@@POOLS@@", "\n".join(pools_lines))
    _write("tests/regions3-5-maps.test.ts", test)
    return test

def emit_audit(battles, matched, unmatched, preflight_lines):
    wired = sorted({npc["battle"]["id"] for m in MAPS for npc in m["npcs"] if "battle" in npc})
    doc = f"""# Regions 3–5 Maps Audit — Regions 3–5 Skeleton Shipped

2026-11-13, regions3-5-maps PR (branch `feature/regions3-5-maps-20261113`,
base main `cd4088f1`, PR #423 merge). Audit source:
`src/lib/wiring/dialogue/regionN-dialogue.json` (merged in PR #421) +
`src/lib/trainers-regionN.ts` + `FULL_WORLD` on main
(`src/world/FullWorldMaps.ts`, 89 maps: 46 Region 1 + 43 Region 2).
Follows the Region 2 audit (`docs/regions2-5-maps-audit-20261113.md`).

## 1. What the dialogue references vs what exists

| Region | Entries | Dialogue mapKeys | Keys wired before | Keys wired by this PR |
|---|---|---|---|---|
| 3 — Sea / Land | 15 | 37 | 0/37 = 0% | 37/37 = 100% (31 direct + 6 folded into `r3_plateau`) |
| 4 — Rift | 16 | 39 | 0/39 = 0% | 39/39 = 100% (33 direct + 6 folded into `r4_plateau`) |
| 5 — New Continent | 17 | 36 | 0/36 = 0% | 36/36 = 100% (30 direct + 6 folded into `r5_plateau`) |
| **Total** | **48** | **112** | **0/112 = 0%** | **112/112 = 100%** |

All 150 dialogue keys (38 Region 2 + 112 here) are now wired: 38/150 = 25%
was Region 2, 150/150 = 100% after this PR.

Region 3's 37 keys resolve to 41 physical maps: 31 keys map 1:1, the 6
Plateau keys (`r3_elite_1..4`, `r3_champion`, `r3_hall`) fold into one
`r3_plateau` map, and 10 new keys are added that the dialogue does not
name but the skeleton requires — 8 route maps (`r3_route_1..8`, one per
town-to-town link, R1 `route_1/2/3` pattern), `r3_sea_route` (Dewford–
Mauville Wave-Ride crossing), and `r3_mochiiplex_root_hamlet`. (The
Template L chapter opening — `r3_outpost_2f`, `r3_outpost_1f`,
`r3_root_hamlet`, `r3_lab` — IS named: all four are R3-01 keys.) Region 4's 39 keys resolve to 44 physical
maps: 33 keys 1:1, 6 fold into `r4_plateau`, 10 route maps
(`r4_route_1..10`) + `r4_mochiiplex_twinleaf`. Region 5's 36 keys
resolve to 41 physical maps: 30 keys 1:1, 6 fold into `r5_plateau`,
10 route maps (`r5_route_1..10`) + `r5_mochiiplex_start_city`.

## 2. Slices shipped (126 maps)

Play order R3: `r2_frost_peak` → `r3_outpost_2f` → `r3_outpost_1f` →
`r3_root_hamlet` (+ `r3_lab`, `r3_mochiiplex_root_hamlet`) →
`r3_oldale_road` → `r3_rustboro` (+ `r3_dojo_1`) → `r3_route_1` →
`r3_dewford` (+ `r3_cave`, `r3_dojo_2`) → `r3_sea_route` →
`r3_mauville` (+ `r3_arena`, `r3_dojo_3`) → `r3_route_2` →
`r3_lavaridge` (+ `r3_land_base`, `r3_dojo_4`) → `r3_route_3` →
`r3_petalburg` (+ `r3_dojo_5`) → `r3_route_4` → `r3_fortree` (+
`r3_weather_institute`, `r3_dojo_6`) → `r3_route_5` → `r3_lilycove`
(+ `r3_hideout`) → `r3_route_6` → `r3_mossdeep` (+ `r3_dojo_7`) →
`r3_route_7` → `r3_crater_city` (+ `r3_dojo_8`) → `r3_route_8` →
`r3_awakening` → `r3_victory_route` → `r3_plateau` →
`r3_frontier_arenas`.

Play order R4: `r3_frontier_arenas` → `r4_twinleaf` (+
`r4_mochiiplex_twinleaf`) → `r4_route_1` → `r4_sandgem` →
`r4_route_2` → `r4_jubilife` → `r4_route_3` → `r4_oreburgh` (+
`r4_dojo_1`) → `r4_route_4` → `r4_floaroma` → `r4_route_5` →
`r4_eterna` (+ `r4_statue`, `r4_dojo_2`) → `r4_route_6` →
`r4_hearthome` (+ `r4_contest_hall`, `r4_dojo_3`) → `r4_route_7` →
`r4_veilstone` (+ `r4_warehouse`, `r4_dojo_4`) → `r4_route_8` →
`r4_pastoria` (+ `r4_dojo_5`) → `r4_preserve` → `r4_route_9` →
`r4_celestic` (+ `r4_cave_painting`) → `r4_route_10` → `r4_canalave`
(+ `r4_library`, `r4_island`, `r4_dojo_6`) → `r4_snowpoint` (+
`r4_temple`, `r4_dojo_7`) → `r4_sunyshore` (+ `r4_dojo_8`) →
`r4_victory_route` → `r4_plateau` → `r4_battle_zone` →
`r4_rift_dungeon`.

Play order R5: `r4_rift_dungeon` → `r5_start_city` (+
`r5_mochiiplex_start_city`) → `r5_route_1` → `r5_sandgem` →
`r5_route_2` → `r5_jubilife` → `r5_route_3` → `r5_oreburgh` (+
`r5_dojo_1`) → `r5_route_4` → `r5_floaroma` → `r5_route_5` →
`r5_eterna` (+ `r5_dojo_2`) → `r5_route_6` → `r5_hearthome` (+
`r5_contest_hall`, `r5_dojo_3`) → `r5_route_7` → `r5_veilstone` (+
`r5_warehouse`, `r5_dojo_4`) → `r5_route_8` → `r5_pastoria` (+
`r5_dojo_5`) → `r5_preserve` → `r5_route_9` → `r5_celestic` →
`r5_route_10` → `r5_canalave` (+ `r5_library`, `r5_dojo_6`) →
`r5_snowpoint` (+ `r5_temple`, `r5_dojo_7`) → `r5_sunyshore` (+
`r5_dojo_8`) → `r5_victory_route` → `r5_plateau` →
`r5_grand_tournament` → `r5_mythar_final`.

Per-map check (all 126): entry + exit, every exit/door target exists,
every gate names its requirement, no dead door — pinned by
`tests/regions3-5-maps.test.ts`.

## 3. Towns — heal + shop + sign + NPC

36/36 towns have heal + shop + sign + a non-battle NPC. Inline
nurse/clerk follow the Stoneport precedent; only the three arrival
towns get a full MochiiPlex interior (`MOCHIIPLEX_1` pattern):
Root Hamlet, Twinleaf, Start City. R3 Root Hamlet's town NPC is a
labelled placeholder resident (R3-01 names no town-map NPC; the keeper
is downstairs, the researcher is in the lab). R5 Canalave and
Snowpoint carry no dialogue NPC in the town itself (their keepers are
in the library / temple subs); the inline nurse + clerk are the
non-battle NPCs there.

## 4. Trainers wired from rows (nothing invented)

`trainers-region3.ts` has 46 rows, `trainers-region4.ts` 43 rows,
`trainers-region5.ts` 47 rows (136 rows). This PR wires 76/136 = 56%
as battle NPCs; the rest are dialogue-only slots (see §5).

- Region 3, 27/46: R3-001 Hex lab battle (named "Hex"), R3-002/003
  (Oldale Road), R3-004/005 (Mauville Arena), R3-006/007 (Lilycove
  Hideout), R3-010..013 (Victory Route), 16 dojo acolytes (2 per dojo).
- Region 4, 26/43: R4-001/002 (Sandgem Route), R4-003/004 (Floaroma
  Valley, wired on the town map), R4-005/006 (Celestic), R4-007..010
  (Victory Route), 16 dojo acolytes.
- Region 5, 23/47: R5-001/002 (Start City Route), R5-005..009 (Victory
  Route — five veterans, not four), 16 dojo acolytes.
- Inline teams mirror the row (species + levels); the resolver swaps
  in the row team at battle time (`trainer-teams-resolver.ts`). Inline
  stats are the species' `SPECIES_DB` base stats, moves are
  `BASIC_MOVES` (Tackle + Swift Movement). Trainer dialog lines are
  NOT in the trainer file: each battle NPC carries one labelled
  placeholder line. Exceptions: the first Veteran on each victory route
  carries the entry's beats veteran lines (R3-11 / R4-14 / R5-14), and
  the Hex lab battle carries the R3-01 hex pre/post lines.
- Dojo themes + badge names come from the rows (R3: Core / Strike /
  Chrome / Flame / Beast / Aero / Mythic / Water; R4: Core / Flora /
  Umbral / Strike / Water / Chrome / Water-ice / Chrome; R5: Beast /
  Flame / Chrome / Strike / Core / Aero / Water-ice / Mythic).

## 5. Dialogue-only slots (owed, not silently filled)

- 24/24 dojo leaders: NAME GAP, present + dialogued (dojo pre lines +
  `inkKnot` for the entry's main knot), no battle, no badge award.
  Badge names are recorded in the map comments from the rows.
  Post-battle `_after` knots exist in the compiled stories and trigger
  with the leader battles when they land.
- 12/12 Elite Four + 3/3 Champions (R3-12 / R4-15 / R5-15): NAME GAP,
  dialogue-only, pre lines as dialog, post lines as `postBattleDialog`.
  The plateau NPCs use each entry's OWN elite/champion lines — R2-13's
  blocks are the generic lines, but R3/R4/R5 have region-specific ones
  (fixed while finishing this generator: the draft hardcoded R2's words).
- R5-012 / R5-04 CONFLICT (flagged for Mars): row R5-012 names Hex as
  the Dojo 1 leader, but R5-04 dialogue says the leader is NAME GAP.
  Leader stays dialogue-only; the dojo comment records the conflict.
- R5-003/004 Front Recruits ("Castelia Rally"): no dialogue mapKey —
  left unwired, owed.
- R5-039..044 Tournament rounds + R4-011..013 Battle Zone + R4-014
  Rift Warden: NAME GAP rows → dialogue-only NPCs with PLACEHOLDER
  lines, battles owed.
- R5-047 Mythar: species 331 not in `SPECIES_DB` → no battle NPC;
  the Mythar final map holds the attendant + Prof. Aeon only. The
  R5-17 champion block is Mythar's battle lines, owed with the battle.
- R5-045/046 Tower Climbers (Bright / Umbral Tower, post-game): no
  tower maps exist — left unwired, owed.
- R3-043..046 Frontier Brains: no Frontier Arena battle maps yet —
  left unwired, owed.
- 147/150 (Dorowani/Gabu): provisional Black 2 starter-pattern stats
  (total 308 each) already in `SPECIES_DB`; no new numbers invented here.

## 6. Gates and story transport

- Storm route R2→R3: `r2_frost_peak` gains its north exit to
  `r3_outpost_2f` (plain exit — story flags are not engine gates, R2
  audit §6; the flag `r3_storm_route_open` stays on the Frost Peak
  sign, now reading "open"). The outpost has no south exit back to
  Frost Peak: inter-region links are one-way by design, same as the
  airship and the signal.
- Airship R3→R4: `r3_frontier_arenas` north → `r4_twinleaf` (flag
  `r4_airship_route_open` recorded on the Frontier sign).
- Signal R4→R5: `r4_rift_dungeon` north → `r5_start_city` (flag
  `r5_signal_open` is the story flag; the exit is plain, R2 audit §6).
- Victory Routes: `r3_awakening` → `r3_victory_route` is
  `badges>=24`; `r4_sunyshore` → `r4_victory_route` is `badges>=32`;
  `r5_sunyshore` → `r5_victory_route` is `badges>=40` (8 per region,
  cumulative — R2 precedent: `badges>=16`).
- Sea road R3: `r3_dewford` / `r3_mauville` exits to `r3_sea_route`
  are `hmNeeded: "Wave"` on both shores (R2 sea road precedent).
  Canalave → Snowpoint and Snowpoint → Sunyshore (R4/R5) are direct
  town exits, no route map (R4 audit note, carried to R5).
- Story flags (`r3_storm_route_open`, `r4_airship_route_open`,
  `r5_signal_open`, `r3_hall_third_entry`, etc.) live in the compiled
  Ink stories; WorldEngine exit conditions only understand `badges>=N`
  and techniques, so no exit is gated on a story flag in this PR. A
  story-flag engine is a separate, owed task.

## 7. Stale notes found while wiring (not silently fixed)

- R3-11 / R4-14 / R5-14 beats: "Veteran trainer (talk-to-battle,
  ROSTER GAP team)" — stale. The trainer files HAVE the Veterans
  (R3-010..013, R4-007..010, R5-005..009) with teams, levels, rewards.
  All wire here; the first Veteran on each route carries the beats lines.
- R5-14 has FIVE veterans (R5-005..009); the fifth stands on the route
  centre path at (14, 30), south of the gate keeper.

## 8. TOWN-NAME RULE — 0 new copies added (R2 audit §8, carried over)

The merged Region 3–5 dialogue files (PR #421) use verbatim reference
town/location names as their town names. This PR uses the dialogue
`mapKeys` as the wiring contract (structural identifiers already on
main) but does NOT repeat those names as display names: affected towns
carry a labelled `name GAP FOR MARS` placeholder + the dialogue entry
id, and Mars renames them in one pass (dialogue + maps together).
Mochiichao-original names ARE used as display names: Root Hamlet, The
Awakening, Frontier Arenas, Battle Zone, Rift Dungeon, Start City,
Grand Tournament, Mythar.

## 9. Wild pools

Grounded in trainer-row species + levels, added to
`src/data/core/encounters.json` `worldAreas` (the single source;
`FullWorldMaps` mirrors them at load): 7 tables — `r3-oldale-road`
(013/038/019/022 @60–61), `r3-victory-route` (8 species @74–77, 046
spanning 74–77), `r4-route-1` (041/019/013/022 @78–79),
`r4-floaroma` (038/041/042/035 @80–81), `r4-victory-route` (8 species
@88–91), `r5-route-1` (013/038/019/022 @88–89), `r5-victory-route`
(10 species @96–98). All other R3–R5 maps keep `encounters: []` in
the literal. 038 now reads 4 areas (route-1-grass + the three opening
pools) — `dexAreas.test.ts` updated from the R2 precedent for 147.
Owed pools: all other routes (R3 routes 1–8, R4 routes 2–10, R5 routes
2–10), the sea road, and the preserves — no trainer-row species for
those stretches.

## 10. Verification

- `tests/regions3-5-maps.test.ts` (new, added to `test:tests` in
  `package.json`): 15 tests — key resolution, reachability, gates,
  towns, dead doors, dojo shape, 75 wired rows + Hex mirror, 7 pools,
  48 Ink knots, plateau fold, Grand Tournament, Mythar final. Local
  checks run before upload (no runnable checkout exists — same
  constraint as the R2 audit §11): Python pre-flight below. CI is the
  verifier for the actual vitest run — the test counts above are from
  the pre-flight, not from a test run.
- Pre-flight (Python, before upload):

{preflight}

## 11. Files in this PR (11: 9 modified, 2 new, 0 deleted)

- `src/world/FullWorldMaps.ts` (modified): 126 map consts + FULL_WORLD
  89 → 215 + `r2_frost_peak` north exit to `r3_outpost_2f` + Frost Peak
  sign updated (storm route now open).
- `src/data/core/encounters.json` (modified): 7 new wild-pool tables.
- `src/data/core/map-battle-bg.json` (modified): 126 new bindings.
- `src/lib/musicPlacement.ts` (modified): 126 new placement rows.
- `src/lib/battleBackground.test.ts` (modified): GOLDEN +126.
- `src/lib/trainer-teams.test.ts` (modified): map parity 53 → 129
  battles, 48 → 123 matched, 5 → 6 unmatched (second 'Hex').
- `src/lib/dexAreas.test.ts` (modified): 038 reads 4 areas.
- `tests/region1-rescue.test.ts` (modified): FULL_WORLD 89 → 215.
- `package.json` (modified): `test:tests` gains
  `tests/regions3-5-maps.test.ts`.
- `tests/regions3-5-maps.test.ts` (new).
- `docs/regions3-5-maps-audit-20261113.md` (new, this file).
"""
    _write("docs/regions3-5-maps-audit-20261113.md", doc)
    return doc

# ---------------------------------------------------------------- pre-flight
def preflight(existing_src):
    lines = []
    def ok(msg):
        lines.append(f"  PASS {msg}")
        print(f"  PASS {msg}")
    # 1. map count + uniqueness + kind registration
    assert len(MAPS) == 126, f"expected 126 maps, got {len(MAPS)}"
    keys = [m["key"] for m in MAPS]
    assert len(set(keys)) == 126, "duplicate map keys"
    for m in MAPS:
        assert m["key"] in KEY_KIND, f"{m['key']} has no registered kind"
    ok("126 maps, keys unique, kinds registered")
    # 2. exits/doors resolve; enterAt + NPCs + signs in bounds
    existing_keys = set(re.findall(r"^  (\w+): [A-Z0-9_]+,?$", existing_src, re.M))
    all_keys = existing_keys | set(keys)
    assert len(existing_keys) == 89, f"expected 89 existing FULL_WORLD keys, got {len(existing_keys)}"
    dims = {}
    for k in keys:
        w, h, _cx = KIND_DIMS[KEY_KIND[k]]
        dims[k] = (w, h)
    def check_in_bounds(target, x, y, what):
        w, h = dims[target]
        assert 0 <= x < w and 0 <= y < h, f"{what}: ({x},{y}) outside {target} {w}x{h}"
    for m in MAPS:
        for e in m["exits"]:
            assert e["to"] in all_keys, f"{m['key']} exit -> {e['to']} missing"
            assert e["to"] in dims, f"{m['key']} exit -> old map {e['to']} (not expected)"
            check_in_bounds(e["to"], e["enterAt"]["x"], e["enterAt"]["y"], f"{m['key']} exit")
            assert 0 <= e["x"] < m["width"] and 0 <= e["y"] < m["height"], f"{m['key']} exit tile out of bounds"
        for d in m["doors"]:
            assert d["to"] in all_keys, f"{m['key']} door -> {d['to']} missing"
            assert d["to"] in dims, f"{m['key']} door -> old map {d['to']} (not expected)"
            check_in_bounds(d["to"], d["enterAt"]["x"], d["enterAt"]["y"], f"{m['key']} door")
        for npc in m["npcs"]:
            assert 0 <= npc["x"] < m["width"] and 0 <= npc["y"] < m["height"], \
                f"{m['key']} NPC {npc['id']} out of bounds"
        for s in m["signs"]:
            assert 0 <= s["x"] < m["width"] and 0 <= s["y"] < m["height"], \
                f"{m['key']} sign out of bounds"
    # frost peak link (existing map -> new map)
    check_in_bounds("r3_outpost_2f", 6, 11, "r2_frost_peak north exit")
    ok("all exits/doors resolve; enterAt/NPCs/signs in bounds (incl. frost peak link)")
    # 3. battle species in SPECIES_DB
    nb = 0
    for m in MAPS:
        for npc in m["npcs"]:
            if "battle" not in npc:
                continue
            nb += 1
            for sid, _lvl in npc["battle"]["team"]:
                assert sid in SPECIES, f"{m['key']} {npc['id']}: species {sid} not in SPECIES_DB"
    assert nb == 76, f"expected 76 wired battle NPCs, got {nb}"
    ok("76 wired battle NPCs; all battle species in SPECIES_DB (49)")
    # 4. ink knots resolve
    refs = set()
    for m in MAPS:
        for npc in m["npcs"]:
            if npc.get("ink"):
                story, knot = npc["ink"]
                n = int(story.replace("region", "").replace("-story", ""))
                assert knot in KNOTS[n], f"{m['key']} {npc['id']}: knot {knot} missing in {story}"
                refs.add((story, knot))
    for n, ids in ((3, ["R3-01", "R3-02", "R3-03", "R3-04", "R3-05", "R3-06", "R3-07",
                         "R3-08", "R3-09", "R3-09a", "R3-09b", "R3-10", "R3-11",
                         "R3-12", "R3-13"]),
                   (4, [f"R4-{i:02d}" for i in range(1, 17)]),
                   (5, [f"R5-{i:02d}" for i in range(1, 18)])):
        for eid in ids:
            k = entry_knot(n, eid)
            assert (f"region{n}-story", k) in refs, f"entry knot {k} referenced by no NPC"
    ok(f"{len(refs)} referenced ink knots resolve; all 48 entry knots referenced")
    # 5. dialogue keys resolve (111; 18 folded into plateaus)
    for n in (3, 4, 5):
        folded_n = {f"r{n}_elite_{i}" for i in range(1, 5)} | {f"r{n}_champion", f"r{n}_hall"}
        for e in DIALOGUE[n]["entries"]:
            for k in e["mapKeys"]:
                assert k in keys or k in folded_n, f"dialogue mapKey {k} has no map"
    total_keys = sum(len(e["mapKeys"]) for n in (3, 4, 5) for e in DIALOGUE[n]["entries"])
    assert total_keys == 112, f"expected 112 dialogue mapKeys, got {total_keys}"
    ok("112 dialogue mapKeys resolve (94 direct + 18 folded into plateaus)")
    # 6. trainer-teams parity simulation
    battles, matched, unmatched = simulate_parity(existing_src)
    assert len(battles) == 129, f"expected 129 unique battles, got {len(battles)}"
    assert len(matched) == 123, f"expected 123 matched, got {len(matched)}"
    assert len(unmatched) == 6, f"expected 6 unmatched, got {len(unmatched)}"
    assert sorted(unmatched) == sorted(["Champion — MYTHAR", "Hex", "Hex",
                                        "Junk Warlord Krix", "Luigi", "Luigi Castagnoli"]), \
        f"unexpected unmatched set: {sorted(unmatched)}"
    # the existing 53 must reproduce the locked 48/5 split
    ex_battles = parse_existing_battles(existing_src)
    assert len(ex_battles) == 53, f"expected 53 existing battles, got {len(ex_battles)}"
    ex_matched = [b["name"] for b in ex_battles
                  if resolve_row(b["name"], b["team"], b["reward"])]
    assert len(ex_matched) == 48, f"expected 48 existing matched, got {len(ex_matched)}"
    ok("trainer-teams parity: 129 battles, 123 matched, 6 unmatched (Hex x2)")
    # 7. FULL_WORLD count
    assert len(existing_keys) + 126 == 215
    ok("FULL_WORLD 89 -> 215")
    # 8. encounters.json parses (emitted copy re-checked in main)
    enc = json.loads(_read("src/data/core/encounters.json"))
    assert len(enc["worldAreas"]) == 10, f"expected 10 existing worldAreas, got {len(enc['worldAreas'])}"
    ok("encounters.json parses (10 existing worldAreas; 7 new checked on emit)")
    return lines, battles, matched, unmatched

# ---------------------------------------------------------------- main
build_region3()
build_region4()
build_region5()
assert len(MAPS) == 126, f"expected 126 maps, got {len(MAPS)}"
existing_src = _read("src/world/FullWorldMaps.ts")
pre_lines, battles, matched, unmatched = preflight(existing_src)
# emit (order matters: trainer-teams test needs the parity simulation)
fw_src = emit_full_world()
enc_src = emit_encounters()
emit_battle_bg()
emit_music()
emit_battle_bg_test(battles, matched, unmatched)
emit_trainer_teams_test(matched, unmatched)
emit_dex_areas_test()
emit_region1_rescue_test()
emit_package()
emit_regions_test(matched, unmatched)
# re-verify the emitted encounters copy parses and holds the 7 tables
enc_new = json.loads(open(f"{OUT}/src/data/core/encounters.json").read())
areas = {a["areaId"]: a for a in enc_new["worldAreas"]}
for area_id, map_id, method, rate, slots in POOLS:
    assert area_id in areas, f"pool {area_id} missing from emitted encounters.json"
    assert areas[area_id]["mapId"] == map_id and areas[area_id]["method"] == method
    assert [s["speciesId"] for s in areas[area_id]["slots"]] == [s["speciesId"] for s in slots]
# re-verify the emitted FullWorldMaps has 215 FULL_WORLD entries
fw_new = open(f"{OUT}/src/world/FullWorldMaps.ts").read()
fw_start = fw_new.find("export const FULL_WORLD")
fw_end = fw_new.find("\n};", fw_start)
fw_entries = re.findall(r"^  (\w+): [A-Z0-9_]+,$", fw_new[fw_start:fw_end], re.M)
assert len(fw_entries) == 215, f"FULL_WORLD entries != 215 (got {len(fw_entries)})"
emit_audit(battles, matched, unmatched, "\n".join(pre_lines))
print(f"EMITTED 11 files to {OUT}")
print(f"maps={len(MAPS)} battles={len(battles)} matched={len(matched)} unmatched={len(unmatched)}")
print("PRE-FLIGHT: all checks passed")
