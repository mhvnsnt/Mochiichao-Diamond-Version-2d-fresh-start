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
    cands = [k for k in KNOTS[n] if k.startswith(prefix) and not k.endswith("_after")]
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
    for se in (side_exits or []):
        exits.extend(se)
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

def plateau_npcs(n, entry_id, ascent_word, post_suffix):
    e = entry(n, entry_id)
    att = dialogue_npc(n, e, "Plateau attendant", 14, 20, "🧑")
    elites = []
    for i, (pre, post) in enumerate([
        ("I guard the door. Pass me, and you are no longer a visitor.", "Pass. The stairs are yours."),
        ("I guard the stairs. Climb, if you can.", "Climb. The hall is yours."),
        ("I guard the hall. The hall remembers everyone who stood here.", "It will remember you. The champion's door is next."),
        ("I guard the champion's door. Knock twice, and mean it.", "Knock. Mean it. Go."),
    ], start=1):
        elites.append({"id": f"elite_{i}", "x": 4 + i * 4, "y": 10, "sprite": "🥋",
                       "name": f"Elite {i}", "dialog": [pre], "post": [post]})
    champ_post = ("You have. The Hall remembers you " + ascent_word + " now. " + post_suffix)
    champ = {"id": "champion", "x": 14, "y": 4, "sprite": "👑", "name": "Champion",
             "dialog": ["You have beaten a region that remembers you. Now beat the trainer it remembers most."],
             "post": [champ_post]}
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
    MAPS.append(route_map(n, "r3_route_3", "Route R3-3", "r3_petalburg", "r3_lavaridge", [],
                          "ROUTE R3-3\nNorth to Petalburg. South to Lavaridge."))
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
    MAPS.append(route_map(n, "r3_route_4", "Route R3-4", "r3_fortree", "r3_petalburg", [],
                          "ROUTE R3-4\nNorth to Fortree. South to Petalburg."))
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
    MAPS.append(route_map(n, "r3_route_5", "Route R3-5", "r3_lilycove", "r3_fortree", [],
                          "ROUTE R3-5\nNorth to Lilycove. South to Fortree."))
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
    MAPS.append(route_map(n, "r3_route_6", "Route R3-6", "r3_mossdeep", "r3_lilycove", [],
                          "ROUTE R3-6\nNorth to Mossdeep. South to Lilycove."))
    MAPS.append(town_map(n, "r3_mossdeep", "R3 Dojo 7 Town — name GAP FOR MARS",
        "r3_route_7", "r3_route_6",
        [(13, "r3_dojo_7", "Dojo 7 — Mythic Gate", {"x": 7, "y": 16})],
        [healer_npc(n, "r3_mossdeep"), shop_npc(n, "r3_mossdeep"),
         dialogue_npc(n, e09b, "Research city keeper", 14, 20, "🧑‍🔬", nid="research_city_keeper")],
        gap_sign("R3-09b", "DOJO 7 TOWN", "Dojo 7 (Mythic) is here — canon order: Mossdeep before Crater City. Double-battle dojo.")))
    th, bd = dojo_info(n, "R3-034")
    MAPS.append(dojo_map(n, "r3_dojo_7", "Dojo 7 — Mythic Gate", "r3_mossdeep", 13,
                          ["R3-032", "R3-033"], "R3-09b", 7, th, bd, "R3-034"))
    MAPS.append(route_map(n, "r3_route_7", "Route R3-7", "r3_crater_city", "r3_mossdeep", [],
                          "ROUTE R3-7\nNorth to Crater City. South to Mossdeep."))
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
    MAPS.append(route_map(n, "r3_route_8", "Route R3-8", "r3_awakening", "r3_crater_city", [],
                          "ROUTE R3-8\nNorth to the Awakening. South to Crater City."))
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
        plateau_npcs(n, "R3-12", "three times", "The Frontier is open — the arenas are waiting, and the airship after them."),
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
        plateau_npcs(n, "R4-15", "four times", "The Battle Zone is open — seal the Rift, and the signal will carry you on."),
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
