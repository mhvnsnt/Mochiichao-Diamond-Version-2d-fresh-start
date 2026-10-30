export const TILE = {
  GRASS:0, WALL:1, WATER:2, PATH:3, BUILDING:4, DOOR:5,
  TALL_GRASS:6, SAND:7, CAVE:8, LEDGE:9, SIGN:10,
  NEON_PATH:11, INDUSTRIAL:12, SHALLOW:13, ICE:14,
  HM_ROCK:15, HM_CUT:16, HM_WATERFALL:17, WARP:18,
  STAIRS_UP:19, STAIRS_DOWN:20, FLOWER:21, DOCK:22,
  FENCE:23, SAND_DUNE:24, LAVA:25,
};

export const PASSABLE: Record<number, boolean> = {
  0:true,1:false,2:false,3:true,4:false,5:true,
  6:true,7:true,8:true,9:false,10:true,
  11:true,12:true,13:true,14:true,
  15:false,16:false,17:false,18:true,
  19:true,20:true,21:true,22:true,
  23:false,24:false,25:true,
};

export const HM_REQUIRED: Record<number, string> = { 2:"Surf", 15:"Strength", 16:"Cut", 17:"Waterfall" };

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
