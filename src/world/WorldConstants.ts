export const TILE = {
  GRASS:0, WALL:1, WATER:2, PATH:3, BUILDING:4, DOOR:5,
  TALL_GRASS:6, SAND:7, CAVE:8, LEDGE:9, SIGN:10,
  NEON_PATH:11, INDUSTRIAL:12, SHALLOW:13, ICE:14,
  HM_ROCK:15, HM_CUT:16, HM_WATERFALL:17, WARP:18, HM_BOULDER:26,
  STAIRS_UP:19, STAIRS_DOWN:20, FLOWER:21, DOCK:22,
  FENCE:23, SAND_DUNE:24, LAVA:25,
  // BW2 world-upgrade lane (composed into this tree 2026-10-29,
  // world-compose lane): interior furnishing tiles so interiors ship
  // complete (counter/PC/stairs class pieces), never bare rooms of
  // generic blocks. Solid; interactables sit on the NPC/sign data as
  // before. NUMBERING: the BW2 lane numbered these 26–31 in its own
  // tree; 26 is HM_BOULDER in this tree (fieldTechniques S-3), so at
  // composition they sit at 32–37. Names and order are BW2's.
  TERMINAL:32, COUNTER:33, PLANT:34, HEAL_MACHINE:35, BENCH:36, BED:37,
  // Traversal-build lane (2026-10-30): the tile-behaviour family —
  // behaviour lives in src/lib/tileBehaviors.ts, ported from
  // pret-pokeemerald's metatile-behaviour / forced-movement code
  // (see that file for per-system provenance). Numbers 27 and 38–49
  // were free in this numbering.
  CRACKED_FLOOR:27,
  SPIN:38,
  CONVEYOR_E:39, CONVEYOR_N:40, CONVEYOR_W:41, CONVEYOR_S:42,
  HOLE:43, SNOW:44, MUD:45,
  CURRENT_E:46, CURRENT_N:47, CURRENT_W:48, CURRENT_S:49,
  // Traversal part 2 (2026-10-30): the completion family's tiles.
  // Behaviour in src/lib/tileBehaviors.ts (climb/cascade chains),
  // src/lib/boulders.ts (switches), src/lib/bike.ts (hop/slope).
  ROCK_CLIMB:50,   // HGSS climbable rock face (Crag Climb verb)
  SEAWEED:51,      // underwater encounter ground (RSE seaweed)
  DIVE_SPOT:52,    // deep-water dive / emerge point (emerald dive warp)
  HOP_RAIL:53,     // acro-bike hop obstacle (ledge-class hop target)
  SLOPE:54,        // muddy slope — speed/wheelie ascent (MB_MUDDY_SLOPE)
  FLOOR_SWITCH:55, // floor switch plate — held by weight
  SWITCH_GATE:56,  // barrier linked to the map's floor switches
};

export const PASSABLE: Record<number, boolean> = {
  0:true,1:false,2:false,3:true,4:false,5:true,
  6:true,7:true,8:true,9:false,10:true,
  11:true,12:true,13:true,14:true,
  15:false,16:false,17:false,18:true,
  19:true,20:true,21:true,22:true,
  // 24 SAND_DUNE: traversal-build lane (2026-10-30) — deep sand is
  // PASSABLE movement-cost terrain (pokeemerald MB_DEEP_SAND), not a
  // wall; the cost rule lives in src/lib/tileBehaviors.ts. The
  // tilesets mirror (src/lib/tilesets/metatiles.ts) is updated to
  // match in the same lane.
  23:false,24:true,25:true,26:false,
  32:false,33:false,34:false,35:false,36:false,37:false,
  // Traversal family: all steppable — their rules (slide, spin,
  // convey, drop, cost, current) run in tileBehaviors.ts, not here.
  27:true, 38:true, 39:true, 40:true, 41:true, 42:true, 43:true,
  44:true, 45:true, 46:true, 47:true, 48:true, 49:true,
  // Part 2 family. ROCK_CLIMB and HOP_RAIL are solid: their crossing
  // rules (climb chain, acro hop) live in the behaviour layer, like
  // the ledge. SEAWEED / DIVE_SPOT / FLOOR_SWITCH are steppable
  // grounds. SLOPE is steppable; its ascent rule is the bike layer's.
  // SWITCH_GATE is solid here and opened dynamically by the boulder
  // layer when a floor switch on the map is held (WorldEngine reads
  // switchesHeld before PASSABLE, the same override pattern as the
  // technique gates).
  50:false, 51:true, 52:true, 53:false, 54:true, 55:true, 56:false,
};

// Technique gates, read by src/lib/fieldTechniques.ts (stub-kill
// S-3). Values are OUR Rare verb names (RARE-FIELD-EFFECTS.md), not
// the source games' move names. Tile 15 split (addenda S24): the old
// single rock tile conflated Boulder Break (smash in place) with
// Mighty Push (pushable boulder, new tile 26).
export const HM_REQUIRED: Record<number, string> = { 2:"Wave", 15:"Boulder Break", 16:"Slice", 17:"Cascade", 26:"Mighty Push" };

export const TILE_STYLE: Record<number, { bg: string, label: string }> = {
  0: { bg:"#3a7a2a", label:"" },
  1: { bg:"#2d5a1e", label:"🌲" },
  2: { bg:"#1a5a9e", label:"" },
  3: { bg:"#c8a870", label:"" },
  4: { bg:"#7a5c3a", label:"" },
  5: { bg:"#a07850", label:"🚪" },
  6: { bg:"#2a6a18", label:"" },
  7: { bg:"#d4b870", label:"" },
  8: { bg:"#3a3028", label:"" },
  9: { bg:"#3a7a2a", label:"" }, // ledge — looks like grass with edge
  10: { bg:"#b09060", label:"🪧" },
  11: { bg:"#1a1a2e", label:"" },
  12: { bg:"#4a3820", label:"" },
  13: { bg:"#5a9acc", label:"" },
  14: { bg:"#c8e8f8", label:"" },
  15: { bg:"#8a8a8a", label:"🪨" },
  16: { bg:"#3a7a2a", label:"🌳" },
  17: { bg:"#1a5a9e", label:"💧" },
  18: { bg:"#8050d0", label:"" },
  19: { bg:"#806040", label:"▲" },
  20: { bg:"#806040", label:"▼" },
  21: { bg:"#4a8a30", label:"🌸" },
  22: { bg:"#7a5a30", label:"" },
  23: { bg:"#8a6a40", label:"" },
  24: { bg:"#c8b080", label:"" },
  25: { bg:"#8a2a0a", label:"🔥" },
  26: { bg:"#6a6a6a", label:"🪨" },
  32: { bg:"#34404e", label:"💻" },
  33: { bg:"#ccc2ba", label:"" },
  34: { bg:"#4a7a30", label:"🪴" },
  35: { bg:"#c4ccd2", label:"✚" },
  36: { bg:"#96684a", label:"" },
  37: { bg:"#f0eee8", label:"🛏️" },
  // Traversal family fallback styles (DOM renderer only — the Pixi
  // canvas draws these from the HGSS kit / drawn motifs; see
  // PixiWorldCanvas). Labels stay empty: no emoji tiles.
  27: { bg:"#4a4038", label:"" }, // cracked floor
  38: { bg:"#7050a0", label:"" }, // spin tile
  39: { bg:"#607080", label:"" }, 40: { bg:"#607080", label:"" },
  41: { bg:"#607080", label:"" }, 42: { bg:"#607080", label:"" }, // conveyor / arrow floors
  43: { bg:"#0a0a0a", label:"" }, // hole
  44: { bg:"#eef4fa", label:"" }, // deep snow
  45: { bg:"#6a5136", label:"" }, // mud
  46: { bg:"#1a6ab0", label:"" }, 47: { bg:"#1a6ab0", label:"" },
  48: { bg:"#1a6ab0", label:"" }, 49: { bg:"#1a6ab0", label:"" }, // currents (on water)
  50: { bg:"#6a5136", label:"" }, // rock climb face
  51: { bg:"#0e4a6e", label:"" }, // seaweed ground (underwater)
  52: { bg:"#0a3a6e", label:"" }, // dive spot (deep water)
  53: { bg:"#8a6a40", label:"" }, // hop rail
  54: { bg:"#7a5c36", label:"" }, // muddy slope
  55: { bg:"#b0a060", label:"" }, // floor switch
  56: { bg:"#5a4a3a", label:"" }, // switch gate
};

export const getDayPhase = (h: number) => {
  if (h >= 6 && h < 10) return "dawn";
  if (h >= 10 && h < 18) return "day";
  if (h >= 18 && h < 21) return "dusk";
  return "night";
};

export const DAY_TINT: Record<string, string> = {
  dawn: "rgba(255,160,80,0.18)",
  day: "rgba(255,255,200,0.0)",
  dusk: "rgba(180,80,40,0.22)",
  night: "rgba(0,20,60,0.55)",
};

export const DAY_AMBIENT: Record<string, string> = {
  dawn: "#e8c090", day: "#ffffff", dusk: "#e08060", night: "#5080c0",
};

export function buildMap(w: number, h: number, fillFn: (x:number,y:number)=>number) {
  return Array.from({length:h}, (_,y) => Array.from({length:w}, (_,x) => fillFn(x,y)));
}

export const WEATHER_CONFIG: Record<string, any> = {
  clear: { fog: "none", particles: null },
  mist: { fog: "rgba(200,220,255,0.3)", particles: "mist" },
  neon_rain: { fog: "rgba(80,0,150,0.18)", particles: "rain" },
  smog: { fog: "rgba(120,80,40,0.35)", particles: "smog" },
  jungle: { fog: "rgba(20,80,20,0.18)", particles: "leaves" },
  snow: { fog: "rgba(200,220,255,0.2)", particles: "snow" },
};

export const NPC_SPRITES: Record<string, any> = {
  "🧑": { idle:"🧑", shadow:"rgba(0,0,0,0.3)" },
  "🔬": { idle:"🔬", shadow:"rgba(0,0,0,0.3)" },
  "👩": { idle:"👩", shadow:"rgba(0,0,0,0.3)" },
  "😤": { idle:"😤", shadow:"rgba(0,0,0,0.3)" },
  "🎣": { idle:"🎣", shadow:"rgba(0,0,0,0.3)" },
  "⚓": { idle:"⚓", shadow:"rgba(0,0,0,0.2)" },
  "👦": { idle:"👦", shadow:"rgba(0,0,0,0.4)" },
  "🏃": { idle:"🏃", shadow:"rgba(0,0,0,0.4)" },
  "👧": { idle:"👧", shadow:"rgba(0,0,0,0.3)" },
  "🕶️": { idle:"🕶️", shadow:"rgba(255,0,80,0.3)" },
  "🧗": { idle:"🧗", shadow:"rgba(100,0,200,0.3)" },
  "⛵": { idle:"⛵", shadow:"rgba(0,100,200,0.3)" },
  "🥋": { idle:"🥋", shadow:"rgba(200,150,0,0.4)" },
  "✨": { idle:"✨", shadow:"rgba(255,215,0,0.5)" },
  "👩‍⚕️":{ idle:"👩‍⚕️", shadow:"rgba(0,0,0,0.3)" },
  "⚡": { idle:"⚡", shadow:"rgba(255,220,0,0.5)" },
  "🌊": { idle:"🌊", shadow:"rgba(0,80,200,0.4)" },
  "🌿": { idle:"🌿", shadow:"rgba(0,150,0,0.4)" },
};
