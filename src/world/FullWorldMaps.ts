import { TILE, buildMap } from "./WorldConstants";
import { ENCOUNTER_TABLES } from "../lib/encounters";

function buildEdgeExits(xStart: number, xEnd: number, y: number, to: string, enterY: number, dir: string) {
  const exits = [];
  for (let x = xStart; x <= xEnd; x++) {
    exits.push({ x, y, to, enterAt: { x, y: enterY }, dir });
  }
  return exits;
}

function buildVertExits(x: number, yStart: number, yEnd: number, to: string, enterX: number, dir: string) {
  const exits = [];
  for (let y = yStart; y <= yEnd; y++) {
    exits.push({ x, y, to, enterAt: { x: enterX, y }, dir });
  }
  return exits;
}

export const SECTOR_0: any = {
  name: "Sector 0 — Boot Harbor",
  music: "sector0_theme",
  weather: "clear",
  width: 32, height: 28,
  playerStart: { x:15, y:18 },
  tiles: [
    // v5: Route 1.0 gate corridor at x=15. Before v5 the north edge
    // (y=0) and the gap between the two north buildings (x=14-17,
    // y=1-4) were all wall/building tiles, so the sector0 -> route_1
    // exit at (13-17, 0) was unreachable no matter how the player
    // walked — that, not a missing exit, is why Route 1.0 was never
    // reached in the v4 playtest. The x=15 column is now PATH from
    // the y=5 path row up to the y=0 exit row. Step (i): the
    // block_route_1 step-back events at y=1 are gone — the Route 1.0
    // rescue (Prof. Aeon + his bag, on route_1) is the starter
    // source now, so the gate corridor stays open and the player
    // meets Aeon on the route instead of being stepped back here.
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,4,4,4,4,4,4,1,3,1,1,4,4,4,4,4,4,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,4,4,4,4,4,4,1,3,1,1,4,4,4,4,4,4,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,4,4,5,4,4,4,1,3,1,1,4,5,4,4,4,4,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,3,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
    [1,1,1,1,0,0,0,0,0,0,3,3,3,0,0,3,3,3,0,0,3,3,0,0,0,0,0,1,1,1,1,1],
    [1,1,1,1,0,1,1,0,0,0,3,0,3,0,0,3,0,3,0,0,3,3,0,0,0,1,1,1,1,1,1,1],
    [1,1,1,1,4,4,5,4,0,0,3,0,3,0,0,3,0,3,0,0,0,0,0,0,4,4,5,4,1,1,1,1],
    [1,1,1,1,4,4,3,4,0,0,3,3,3,0,0,3,3,3,0,0,0,0,0,0,4,4,3,4,1,1,1,1],
    [1,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,10,0,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,10,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,0,0,0,0,0,1],
    [1,0,0,0,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,0,0,0,0,0,1],
    [1,0,0,0,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,6,6,6,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,0,0,0,0,0,1],
    [1,0,0,0,0,0,22,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,22,0,0,0,0,0,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,13,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
  ],
  npcs: [
    // v5.2 home heal (implementation choice, NOT Mars canon): no
    // home interior or heal point existed in Sector 0 — the
    // playtest found no Mom/home heal anywhere — so talking to
    // Mom now fully heals the party (finishDialog's existing
    // npc.isHeal path, already used by the MochiiPlex nurse).
    // The first-time Mom intro dialogue is a separate event
    // (v4_mom_intro, no isHeal flag) and is unaffected.
    // v5.3 Mom findability: Mom used to sit at (5,7), which is a
    // BUILDING tile inside the west house block (rows 7-8, cols
    // 4-7), with wall/building/door-with-no-doors-entry neighbours
    // — no walkable tile is ever adjacent, so the facing-tile
    // interact prompt could never fire and the v5.2 playtest found
    // a "yellow figure at the west house" with no prompt. Mom now
    // stands at (5,9), on the path row directly in front of that
    // house, facing down; the player approaches from the row-10
    // grass and faces her. Dialogue, name and isHeal are unchanged;
    // the first-time v4_mom_intro event is separate and untouched.
    // This placement is an implementation addition, NOT Mars canon.
    { id:"mom", x:5, y:9, sprite:"👩", name:"Your Mom", facing:"down", movement:"wander", wanderRadius:1, isHeal: true, dialog:["There you are! The truck beat us here.","Come inside. Your room is upstairs. The boxes can wait. Go set the clock first — a new home needs a correct time.","Good. Now go say hello next door. Hex's family just moved in too. You two will need each other out there.","Wait. Before you run off — here. Sprint Boots. Hold B and you can run. A trainer who cannot run will always be late."] },
    { id:"rival_hex", x:15, y:10, sprite:"😤", name:"Hex", facing:"down", dialog:["You again? I already picked my starter. Razorgater, obviously.","Don't think I'll go easy on you just because we grew up here.","Next time we meet, we BATTLE. Count on it."], battle: { team:[{ id:"004", name:"Razorgater", hp:50, maxHp:50, atk:65, def:64, spd:48, moves:["Chrome Claw","Tackle"], type:"Water", level:5 }], reward:100, badge:null } },
    { id:"fat_guy", x:9, y:13, sprite:"🧑‍🦲", name:"Technology Enthusiast", facing:"down", movement:"wander", wanderRadius:1, dialog:["Technology is incredible!", "You can now store up to 6 Mochiichao in your party!", "Any more you catch are instantly sent to your PC!"] },
    // M1 (2026-10-29): Local Kid + Fisherman moved over from the old
    // Maps.ts Sector 0 list (same names and dialogue) so the town has
    // its full M1 cast with walking art. Placed on free grass tiles.
    { id:"local_kid", x:18, y:15, sprite:"👤", name:"Local Kid", facing:"down", movement:"wander", wanderRadius:1, dialog:["I heard there's a branded Kittember in the tall grass near the woods...","It had a glowing 'H' burned into its side. Creepy."] },
    { id:"fisherman", x:12, y:19, sprite:"🎣", name:"Fisherman", facing:"down", dialog:["The waters here are calm, but I've seen something HUGE moving deep below...","The old-timers call it Astroleviathan. I call it my nightmare."] },
    // Living-world placements (world-encounter package): townsfolk and
    // creature citizens for the encounter director (src/lib/livingWorld.ts,
    // data in src/data/core/living-world/). The director owns their
    // routines (phase schedules) and the events/arcs they anchor; these
    // entries are their placed home positions + stock talk. Creatures
    // speak in cries only — their dialog renders sound, never words.
    // Personal names beyond role are owner slots; role names follow the
    // maps' existing pattern (Technology Enthusiast, Dockhand Juno).
    { id:"dock_fisher", x:8, y:18, sprite:"🎣", name:"Dock Fisher", facing:"down", dialog:["You didn't see a runner, did you? Grey hood, fast feet?","He took my Pupbble right off the bay steps. Forty years I've fished this harbour. She's been beside me for nine of them.","They say he makes camp in the tall grass on Route 1. If you're headed that way... that's all. That's everything I have to ask with."] },
    { id:"fisher_pupbble", x:9, y:18, sprite:"🐶", name:"Pupbble", facing:"down", dialog:["Pupbble: *contented yip, watching the water*"] },
    { id:"lab_mochii", x:12, y:5, sprite:"🐾", name:"Mochii", facing:"down", dialog:["Mochii: *a bright chirp at everyone who passes the lab door*"] },
    { id:"duel_ranger_a", x:14, y:12, sprite:"🧢", name:"Street Ranger", facing:"down", dialog:["That's MY partner he's fighting with. Say it plainly, or fight me for the right to."] },
    { id:"duel_ranger_b", x:16, y:12, sprite:"🎒", name:"Street Ranger", facing:"down", dialog:["Mind your own battles, Ranger."] },
    { id:"bh_net_mender", x:20, y:18, sprite:"🧶", name:"Net Mender", facing:"down", dialog:["Mending nets is just knots, all the way down. Like most honest work."] },
    // BW2 lane: the town resident — a Mochii that lives by the dock
    // (spec §6 town roamers are residents, not encounters). Wanders
    // the sand/dock strip on the existing NPC step; talking to it is
    // a cry, as creatures speak in cries.
    { id:"dock_mochii", creatureId:"001", x:12, y:17, sprite:"", name:"Mochii", facing:"down", movement:"wander", wanderRadius:2, dialog:["Mochi! Mochii~!", "(The harbor Mochii watches the water. It seems to live here.)"] },
    // Item meaning S-IM1: the Harbor Bell relic object (unique,
    // hand-placed — src/lib/itemMeaning.ts RELIC_NPCS). Its grant
    // resolves in WorldEngine interact/finishDialog; once claimed
    // it shows its empty lines. Never in shop stock or drop tables.
    { id:"relic_harbor_bell", x:24, y:18, sprite:"🔔", name:"Something in the Sand", facing:"down", dialog:["Something green with salt is half-buried by the dock steps…"] },
  ],
  signs: [
    // v5: Sector 0 had sign TILES (tile 10) but an empty signs array,
    // so facing them did nothing in the playtest. These are real
    // interactable sign objects now (interact() checks signs).
    { x:2, y:11, text:"BOOT HARBOR\nProf. Aeon's Lab is north — walk into the door." },
    { x:11, y:11, text:"TALL GRASS\nWild Mochiichao live here — bring a partner first!" },
    { x:19, y:11, text:"BOOT HARBOR\nThe lab is north of here. Route 1.0 is north past the lab." },
    { x:15, y:5, text:"ROUTE 1.0 GATE\nNorth to Route 1.0 and Silicon Town.\nNo partner yet? Prof. Aeon is out on Route 1.0 — go help him!" },
  ],
  exits: [
    ...buildEdgeExits(13, 17, 0, "route_1", 38, "up"),
    { x:15, y:27, to:"boot_bay", enterAt:{x:15, y:0}, dir:"down", hmNeeded:"Wave" },
  ],
  doors: [
    { x:10, y:3, to:"aeon_lab", enterAt:{x:6, y:12}, label:"Prof. Aeon's Lab" },
    // Truck/house maps: (6,7) and (26,7) were DOOR tiles with no door
    // entry and no walkable approach. The y=8 tiles below them are
    // now PATH, so the player can step (6,9)->(6,8)->(6,7) and
    // (26,9)->(26,8)->(26,7) into the houses.
    { x:6, y:7, to:"sector0_house_1f", enterAt:{x:6, y:10}, label:"Your House" },
    { x:19, y:3, to:"sector0_neighbor_house", enterAt:{x:5, y:8}, label:"Neighbor's House" },
    { x:26, y:7, to:"sector0_rival_house", enterAt:{x:6, y:10}, label:"Hex's House" }
  ],
  events: [
    // Living-world witnessed scenes (director: src/lib/livingWorld.ts).
    // Stock step-on presentations of bh_snatch_at_bay_steps and
    // bh_duel_in_the_plaza: the scene (and, for the duel, the battle
    // against the cheat) plays through the engine's existing event
    // path today. Outcome branching + the witnessed deed writes
    // resolve through the director — the engine hook is specified in
    // the living-world package's LANDING-RECORD, not claimed here.
  ],
  encounters: []
};

export const AEON_LAB: any = {
  name: "Aeon's Lab",
  music: "sector0_theme",
  interior: true, // BW2 lane: the Lab is an interior — it was the one opening-stretch interior missing the flag, so the interior light law (no screen tint indoors) could not see it
  weather: "clear",
  width: 13, height: 14,
  playerStart: { x:6, y:12 },
  tiles: (() => {
    return buildMap(13, 14, (x, y) => {
      if (x===6&&y===13) return TILE.DOOR;
      if (x===0||x===12||y===0||y===13) return TILE.WALL;
      if ((x===2||x===10)&&y===1) return TILE.TERMINAL; // BW2 lane: working terminals in the bench block, not generic blocks
      if ((x===1||x===11)&&y===12) return TILE.PLANT; // BW2 lane: door plants
      if (y>=1&&y<=3) return TILE.BUILDING; // computers / books
      return TILE.PATH; // inside
    });
  })(),
  npcs: [
    // Step (i): the "pick one" lines are gone — the starter pick
    // happens out on Route 1.0 now (the rescue, Aeon's bag), so the
    // lab Aeon no longer offers a partner here. The Mochiioteca /
    // Capture Cubes lines stay: they are the lab talk, unchanged.
    { id:"prof_aeon", x:6, y:4, sprite:"🔬", name:"Prof. Aeon", facing:"down", movement:"wander", wanderRadius:1, dialog:["Welcome! I'm glad you could make it.","This is the Mochiioteca. It records every Mochiichao you meet. Keep it safe.","And these are Capture Cubes. Throw one at a wild Mochiichao, and if it stays, it travels with you. That is the whole job, really."] },
    { id:"asst_mochiko", x:9, y:4, sprite:"👩‍🔬", name:"Assistant Mochiko", facing:"down", movement:"wander", wanderRadius:1, dialog:["I'm Professor Aeon's assistant, Mochiko!","He's been waiting for you to choose your first partner."] },
    // v4: in-lab Hex is dialogue-only. The FIRST battle is the
    // lab-exit event (hex_battle_event, dynamic team, rival name),
    // not this NPC — keeping both would give three Hex battles
    // (lab NPC + exit event + Boot Harbor rival) and the lab NPC's
    // fixed Razorgater contradicted the player's pick.
    { id:"hex_lab_battle", x:4, y:8, sprite:"😤", name:"Hex", facing:"right", dialog:["I already have my starter. I will be waiting at the door when you leave — do not keep me waiting."] },
    // Step (i): the five lab balls are display-only now — the
    // rescue on Route 1.0 is the only starter source (master
    // Template T), so no isChoice / pick_starter_XXX here. Each ball
    // keeps its label line and points the player at Aeon's bag.
    { id:"starter_mochii", creatureId:"001", x:2, y:6, sprite:"🔵", name:"Mochii Ball", facing:"down", dialog:["Mochii! (A bouncy water-type)","The bag is out on Route 1.0 with Prof. Aeon — pick your partner there."] },
    { id:"starter_razorgater", creatureId:"004", x:4, y:6, sprite:"🐊", name:"Razorgater Ball", facing:"down", dialog:["Razorgater! (A strong, metallic crocodile)","The bag is out on Route 1.0 with Prof. Aeon — pick your partner there."] },
    { id:"starter_tyrage", creatureId:"007", x:6, y:6, sprite:"🪨", name:"Tyrage Ball", facing:"down", dialog:["Tyrage! (An earthy dinosaur)","The bag is out on Route 1.0 with Prof. Aeon — pick your partner there."] },
    { id:"starter_kittember", creatureId:"010", x:8, y:6, sprite:"😼", name:"Kittember Ball", facing:"down", dialog:["Kittember! (A fast and fiery feline)","The bag is out on Route 1.0 with Prof. Aeon — pick your partner there."] },
    { id:"starter_sproutle", creatureId:"038", x:10, y:6, sprite:"🐢", name:"Sproutle Ball", facing:"down", dialog:["Sproutle! (A grassy plant turtle)","The bag is out on Route 1.0 with Prof. Aeon — pick your partner there."] },
    { id:"dorowani_display", x:3, y:10, sprite:"", creatureId:"147", name:"Dorowani", facing:"down", dialog:["Dorowani! A Gen 2 starter.","Dorowani arrives later in the journey."] },
    { id:"gabu_display", x:9, y:10, sprite:"", creatureId:"148", name:"Gabu", facing:"down", dialog:["Gabu! A Gen 2 starter.","Gabu arrives later in the journey."] },
    // Item meaning S-IM1: the appraisal service's first seat. Its
    // dialogue is COMPUTED at interact time from the player's bag
    // (src/lib/itemMeaning.ts appraisalTerminalLines) and the
    // identification is applied in WorldEngine.finishDialog — the
    // static lines here are only a fallback.
    { id:"appraisal_terminal", x:6, y:10, sprite:"🔭", name:"Research Terminal", facing:"down", dialog:["LAB RESEARCH TERMINAL","Bring me anything you can't name. Fossils, finds, things that hum — the Lab will tell you what they are."] }
  ],
  signs: [],
  exits: [],
  doors: [
    { x:6, y:13, to:"sector0", enterAt:{x:10, y:4}, label:"Boot Harbor" }
  ],
  events: [
    { id: "hex_battle_event", condition: "hasStarter", x:6, y:12, dialog:["Hex: Hold up! Before you leave, let's see what your partner can do!"], npc: { name: "Hex", sprite: "😤" }, battle: { team:[{id:"004",name:"Razorgater",hp:45,maxHp:45,atk:60,def:40,spd:55,moves:["Chrome Claw","Tackle"],type:"Steel", level:5}], reward:100, badge:null } },
    { id: "prof_speech_event", condition: "hasStarter", x:6, y:7, dialog:["Prof. Aeon: Excellent choice! Your adventure begins now!","Take good care of your new partner!"] }
  ]
};

export const ROUTE_1: any = {
  name: "Route 1.0 — Greenfield Path",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:37 },
  tiles: (() => {
    const W=28, H=40;
    const m = buildMap(W, H, (x,y) => {
      if (x===0 || x===W-1) return TILE.WALL;
      if ((x>=2&&x<=7&&y>=5&&y<=10)||(x>=18&&x<=24&&y>=5&&y<=10)) return TILE.TALL_GRASS;
      if ((x>=8&&x<=13&&y>=18&&y<=24)||(x>=15&&x<=20&&y>=18&&y<=24)) return TILE.TALL_GRASS;
      if ((x===13||x===14||x===15)&&y>=0&&y<=38) return TILE.PATH;
      if (y===15&&x>=3&&x<=24) return TILE.PATH;
      if (y===28&&x>=2&&x<=26&&(x<13||x>15)) return TILE.LEDGE;
      if (x>=22&&x<=26&&y>=30&&y<=38) return TILE.WATER;
      if (x===22&&y===15) return TILE.HM_CUT;
      if ((x>=4&&x<=6&&y>=2&&y<=4)||(x>=20&&x<=22&&y>=2&&y<=4)) return TILE.FLOWER;
      if (x<=1||x>=W-2) return TILE.WALL;
      if (x>=21&&x<=26&&y>=28&&y<=29) return TILE.SAND;
      return TILE.GRASS;
    });
    m[20][9] = TILE.HM_ROCK;
    m[1][0] = TILE.SIGN;
    m[1][15] = TILE.SIGN;
    m[30][24] = TILE.HM_WATERFALL;
    return m;
  })(),
  npcs: [
    { id:"trainer_youngster", x:8, y:7, sprite:"👦", name:"Youngster Jay", facing:"down", dialog:["Hey! You're a trainer, right?", "Sproutle's defenses are rock solid!", "Let's go!"], postBattleDialog: ["Looks like defense isn't everything.", "I need to train harder..."], battle:{ team:[{id:"038",name:"Sproutle",hp:35,maxHp:35,atk:35,def:35,spd:50,moves:["Web Blast","Tackle"],type:"Grass", level:3}], reward:120, badge:null } },
    { id:"trainer_lass", x:19, y:20, sprite:"👧", name:"Lass Amy", facing:"left", dialog:["My Mochiichao is the cutest!", "It's super bouncy! Watch out!"], postBattleDialog: ["Aww, my cute Mochii...", "You're really strong!"], battle:{ team:[{id:"001",name:"Mochii",hp:38,maxHp:38,atk:35,def:35,spd:45,moves:["Foam Burst","Tackle"],type:"Water", level:4}], reward:100, badge:null } },
    { id:"trainer_hiker", x:14, y:30, sprite:"⛏️", name:"Hiker Dan", facing:"up", dialog:["This path is rough, but my partner is tough!", "Tyrage, show them your earth-shattering power!"], postBattleDialog: ["We crumbled like rocks...", "I'll carve a new path to victory next time."], battle:{ team:[{id:"007",name:"Tyrage",hp:45,maxHp:45,atk:40,def:40,spd:35,moves:["Punch","Tackle"],type:"Earth", level:5}], reward:180, badge:null } },
    { id:"trainer_bugcatcher", x:4, y:6, sprite:"🐛", name:"Bug Catcher Rick", facing:"right", dialog:["I use the tall grass to find bug Mochiichao!"], postBattleDialog: ["I should've caught stronger bugs!"], battle:{ team:[{id:"016",name:"Squirmite",hp:30,maxHp:30,atk:35,def:35,spd:50,moves:["Web Blast","Tackle"],type:"Bug", level:3}], reward:80, badge:null } },
    // Region 1 step (i): the Route 1.0 rescue — Prof. Aeon is
    // cornered here by a wild creature, his bag beside him. The
    // five bag NPCs reuse the lab balls' pick_starter_XXX choices
    // (same dialog lines); the lab balls are display-only now, so
    // the rescue is the only starter source (master Template T).
    // Aeon stands at (10,35) facing down the south path; the bag
    // sits on the grass west of the path column (x=13-15). The
    // intro lines are the ink route_rescue knot, verbatim.
    { id:"prof_aeon_route1", x:10, y:35, sprite:"🔬", name:"Prof. Aeon", facing:"down", dialog:["Help! This wild creature has me cornered!","Quick — take one from my bag and drive it off!"] },
    { id:"aeon_bag_mochii", creatureId:"001", x:7, y:35, sprite:"🔵", name:"Mochii Ball", facing:"down", dialog:["Mochii! (A bouncy water-type)","Are you sure you want to choose Mochii?", ""], isChoice: true, eventId: "pick_starter_001" },
    { id:"aeon_bag_razorgater", creatureId:"004", x:8, y:35, sprite:"🐊", name:"Razorgater Ball", facing:"down", dialog:["Razorgater! (A strong, metallic crocodile)","Are you sure you want to choose Razorgater?", ""], isChoice: true, eventId: "pick_starter_004" },
    { id:"aeon_bag_tyrage", creatureId:"007", x:9, y:35, sprite:"🪨", name:"Tyrage Ball", facing:"down", dialog:["Tyrage! (An earthy dinosaur)","Are you sure you want to choose Tyrage?", ""], isChoice: true, eventId: "pick_starter_007" },
    { id:"aeon_bag_kittember", creatureId:"010", x:11, y:35, sprite:"😼", name:"Kittember Ball", facing:"down", dialog:["Kittember! (A fast and fiery feline)","Are you sure you want to choose Kittember?", ""], isChoice: true, eventId: "pick_starter_010" },
    { id:"aeon_bag_sproutle", creatureId:"038", x:12, y:35, sprite:"🐢", name:"Sproutle Ball", facing:"down", dialog:["Sproutle! (A grassy plant turtle)","Are you sure you want to choose Sproutle?", ""], isChoice: true, eventId: "pick_starter_038" },
    // BW2 lane — visible roamers v1 (spec §6): species from this
    // map's own encounter pool, living in its tall-grass patches on
    // the existing NPC wander step. They are seen, they wander, they
    // answer in cries. NOT yet battle-linked: flee/chase behaviour
    // and touch-encounters are the roamer engine step in ROLLOUT.
    { id:"roamer_sproutle_r1", creatureId:"038", x:5, y:8, sprite:"", name:"Sproutle", facing:"down", movement:"wander", wanderRadius:2, dialog:["Sproutle! Sprout~!", "(A wild Sproutle, grazing the tall grass.)"] },
    { id:"roamer_mochii_r1", creatureId:"001", x:17, y:21, sprite:"", name:"Mochii", facing:"down", movement:"wander", wanderRadius:2, dialog:["Mochi! Mochii~!", "(A wild Mochii. It watches you, curious.)"] },
    { id:"roamer_zephling_r1", creatureId:"019", x:21, y:7, sprite:"", name:"Zephling", facing:"down", movement:"wander", wanderRadius:2, dialog:["Zeph! Zephling!", "(A wild Zephling, quick as the wind.)"] },
  ],
  signs: [
    { x:15, y:35, text:"ROUTE 1.0\nNorth to Silicon Town" },
    { x:12, y:12, text:"TRAINER TIP:\nTap Mochiichao in the wild to encounter them!" }
  ],
  exits: [
    ...buildEdgeExits(13, 17, 39, "sector0", 1, "down"),
    ...buildEdgeExits(13, 17, 0, "binary_fields", 33, "up")
  ],
  doors: [],
  events: [],
  encounters: []
};

export const MOCHIIPLEX_1: any = {
  name: "Silicon Town MochiiPlex",
  music: "route1_theme",
  interior: true,
  weather: "clear",
  width: 15, height: 12,
  playerStart: { x: 7, y: 10 },
  tiles: (() => {
    return buildMap(15, 12, (x, y) => {
      if ((x===7||x===8)&&y===11) return TILE.DOOR;
      if (x===0||x===14||y===0||y===11) return TILE.WALL;
      // BW2 lane — no bare interiors: back wall carries the working
      // set (heal machines + PC terminals + stocked shelves), a real
      // counter row the staff stand at, seating and door plants.
      if ((x===5||x===6)&&y===1) return TILE.HEAL_MACHINE;
      if ((x===11||x===12)&&y===1) return TILE.TERMINAL;
      if (y===1) return TILE.BUILDING; // stocked shelves (shelf texture)
      if (y===2&&x>=2&&x<=12) return TILE.COUNTER;
      if ((x===2||x===3||x===11||x===12)&&y===9) return TILE.BENCH;
      if ((x===1||x===13)&&y===10) return TILE.PLANT;
      return TILE.PATH;
    });
  })(),
  npcs: [
    // BW2 lane: staff hold their posts at the counter (roles, not
    // wanderers) — the nurse heals, the clerk sells, a patient waits.
    { id: "healer_1", x: 7, y: 3, sprite: "👩‍⚕️", name: "Center Nurse", facing: "down", dialog: ["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."], isHeal: true },
    { id: "shop_1", x: 3, y: 3, sprite: "🛒", name: "Clerk", facing: "down", dialog: ["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."], isShop: true },
    { id: "plex_waiting_trainer", x: 11, y: 7, sprite: "🧢", name: "Waiting Trainer", facing: "left", dialog: ["My Zephling got clipped by a Kittember on Route 1.0.", "The nurse says rest here is free. It really is, huh."] }
  ],
  signs: [
    { x:4, y:2, text:"MOCHII CENTER\nHealing is free — it is always free. Cubes and patches at the west end of the counter." }
  ],
  exits: [],
  doors: [
    { x:7, y:11, to:"binary_fields", enterAt:{x:24, y:7}, label:"Exit" },
    { x:8, y:11, to:"binary_fields", enterAt:{x:24, y:7}, label:"Exit" }
  ],
  events: [],
  encounters: []
};

export const BINARY_FIELDS: any = {
  name: "Silicon Town",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 35,
  playerStart: { x:14, y:32 },
  tiles: (() => {
    const W=30, H=35;
    return buildMap(W, H, (x,y) => {
      if (x===0||x===W-1||y===0) return TILE.WALL;
      if (x>=10&&x<=19&&y>=2&&y<=8) return TILE.BUILDING;
      if (x===14&&y===8) return TILE.DOOR;
      if (x===15&&y===8) return TILE.DOOR;
      if (x>=22&&x<=27&&y>=2&&y<=6) return TILE.BUILDING;
      if (x===24&&y===6) return TILE.DOOR;
      if (x>=22&&x<=27&&y>=10&&y<=14) return TILE.BUILDING;
      if (x===24&&y===14) return TILE.DOOR;
      if ((x===14||x===15)&&y>8&&y<35) return TILE.PATH;
      if (y===20&&x>=2&&x<=27) return TILE.PATH;
      if ((x>=2&&x<=9&&y>=10&&y<=18)||(x>=20&&x<=27&&y>=10&&y<=18)) return TILE.TALL_GRASS;
      if ((x>=2&&x<=9&&y>=22&&y<=30)) return TILE.TALL_GRASS;
      if (y===19&&x>=2&&x<=13) return TILE.LEDGE;
      if (x===6&&y===20) return TILE.HM_ROCK;
      if ((x>=11&&x<=13&&y===9)||(x>=16&&x<=18&&y===9)) return TILE.FLOWER;
      if (x>=2&&x<=5&&y>=24&&y<=30) return TILE.WATER;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"dojo1_guard", x:13, y:9, sprite:"🥋", name:"Dojo Acolyte", facing:"right", dialog:["The Binary Dojo awaits within!", "Master Lin is the strongest trainer in Silicon Town."] },
    { id:"town_lass", x:10, y:20, sprite:"👧", name:"Town Girl", facing:"down", movement:"wander", wanderRadius:1, dialog:["This is Silicon Town! It's a bustling hub of commerce.", "You should check out the MochiiPlex to the East!"] },
    { id:"town_oldman", x:23, y:12, sprite:"👴", name:"Old Man", facing:"left", movement:"wander", wanderRadius:1, dialog:["They say before the Mainframe Region was made...", "There was a glowing ethereal creator named Mythar...", "He's the origin of all Mochiichao. A true mythical deity!"] },
    // Living-world placements (world-encounter package): the stranger
    // arc giver, her creature citizen, and townsfolk for the encounter
    // director (src/lib/livingWorld.ts, data in
    // src/data/core/living-world/). Same rules as the Boot Harbor
    // placements: role names (personal names are owner slots),
    // creatures speak in cries only.
    { id:"travelling_herbalist", x:23, y:7, sprite:"🧕", name:"Travelling Herbalist", facing:"down", dialog:["Mind the pack, it bruises. ...Sorry. I'm not usually short with strangers.","My Kittember slipped her lead on Route 1, two dusks past. She won't come to a shout — she comes to the smell of the pack at dusk, when her flame burns low.","West grass, south of the cross path. If you're there at dusk and you see a little flame that won't come closer... just be still. She'll decide."] },
    { id:"herbalist_kittember", x:25, y:7, sprite:"🐈", name:"Kittember", facing:"left", dialog:["Kittember: *tail-flame low and calm, curled against the herbalist's pack*"] },
    { id:"field_hand", x:6, y:20, sprite:"🧑‍🌾", name:"Field Hand", facing:"right", dialog:["Pupbble! Here, girl — HERE— ...Sorry. She's been gone since the grass rustled at dawn.","She's small, she's quick, and she's TERRIFIED of strangers. Which is everyone, to her, except me."] },
    { id:"plex_shopper", x:22, y:9, sprite:"🛍️", name:"Plex Shopper", facing:"down", dialog:["The Plex had a queue out the door this morning. Good. Busy means alive."] }
  ],
  signs: [
    { x:12, y:8, text:"BINARY DOJO\nMaster Lin - The Unbreakable Core" },
    { x:22, y:6, text:"MOCHIIPLEX\nAll your trainer needs in one spot!" },
    { x:16, y:30, text:"SILICON TOWN\nThe genesis of your digital journey." }
  ],
  exits: [
    ...buildEdgeExits(13, 17, 34, "route_1", 1, "down"),
    ...buildVertExits(0, 15, 25, "binary_woods", 30, "left"),
    // Victory Route gate: badges>=8, enforced in WorldEngine.move
    // via doorGate.isExitOpen (step i) — this used to be unenforced
    // metadata, the OWED engine-lane change this comment called for.
    // The mauveville_arena 'ciphers>=10' door stays unenforceable
    // (ciphers exist nowhere in the store/engine) — pre-existing.
    { x:14, y:0, to:"victory_route", enterAt:{x:14, y:39}, dir:"up", condition:"badges>=8" },
  ],
  doors: [
    { x:14, y:8, to:"dojo_1", enterAt:{x:7, y:16}, label:"Binary Dojo — Core Gate" },
    // Four-fixes lane (Fix 4): the tile builder above declares BOTH
    // (14,8) and (15,8) as the dojo's door (the DOOR rules are
    // shadowed by the earlier BUILDING rule, which is harmless —
    // doors fire by coordinate, checked before the solid-tile
    // return in WorldEngine's move()). Only (14,8) had a doors[]
    // entry, so the right half of the dojo's two-tile front door
    // was a dead bump. It mirrors (14,8) now, the same two-tile
    // pattern the MochiiPlex uses at (7,11)+(8,11).
    { x:15, y:8, to:"dojo_1", enterAt:{x:7, y:16}, label:"Binary Dojo — Core Gate" },
    { x:24, y:6, to:"mochiiplex_1", enterAt:{x:7, y:10}, label:"MochiiPlex" },
    // Sequence 3 gate: Dojo 8 is the eighth dojo (Sequence 7's beat),
    // so its Silicon Town door stays sealed until the player holds
    // 7 badges — i.e. until Dojo 7 is beaten. Count-based, not a
    // named fragment, because the Dojo 7 fragment name is not
    // settled in canon (progression.ts leaves it null). The
    // victory_route exit's "badges>=8" precedent is the model.
    // Enforced by WorldEngine via src/lib/doorGate.ts; before this
    // patch the door opened unconditionally, early in Sequence 3.
    { x:24, y:14, to:"dojo_8", enterAt:{x:7, y:16}, label:"Return Dojo — Dojo 8", condition:"badges>=7" }
  ],
  events: [
    // Living-world witnessed scenes (director: src/lib/livingWorld.ts).
    // Stock step-on presentations of st_stray_in_the_fields and
    // st_cube_snatch_at_the_plex — the scenes play through the
    // engine's existing event path today; outcome branching + the
    // witnessed deed writes resolve through the director (engine
    // hook specified in the living-world LANDING-RECORD).
  ],
  encounters: []
};

export const DOJO_1: any = {
  name: "Dojo 1 — The Core Gate",
  music: "dojo_theme",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    const W=16, H=18;
    return buildMap(W, H, (x,y) => {
      if (x===0||x===W-1||y===0) return TILE.BUILDING;
      if ((x+y)%4===0) return TILE.PATH;
      if (y===7&&(x===3||x===7||x===11)) return TILE.HM_ROCK;
      if (y<=3&&x>=4&&x<=11) return TILE.WARP;
      if ((x===7||x===8)&&y===17) return TILE.DOOR;
      return TILE.CAVE;
    });
  })(),
  npcs: [
    { id:"dojo_acolyte_1", x:7, y:12, sprite:"🥋", name:"Acolyte Ken", dialog:["Master Lin does not shout. He builds. Watch how his creatures stand."], battle:{ team:[{id:"007",name:"Tyrage",hp:45,maxHp:45,atk:60,def:40,spd:35,moves:["Punch","Tackle"],type:"Earth",level:7}], reward:300, badge:null } },
    { id:"dojo_acolyte_2", x:4, y:8, sprite:"🥷", name:"Acolyte Ren", dialog:["Feel the power of the Core!"], battle:{ team:[{id:"004",name:"Razorgater",hp:50,maxHp:50,atk:65,def:64,spd:48,moves:["Chrome Claw","Tackle"],type:"Steel",level:8}], reward:350, badge:null } },
    { id:"dojo_acolyte_3", x:11, y:8, sprite:"🤺", name:"Acolyte Shin", dialog:["Speed and precision. Can you handle it?"], battle:{ team:[{id:"001",name:"Mochii",hp:40,maxHp:40,atk:45,def:35,spd:50,moves:["Water Orb","Swift Movement"],type:"Water",level:8}], reward:400, badge:null } },
    { id:"dojo_acolyte_4", x:8, y:5, sprite:"💂", name:"Acolyte Ryu", dialog:["You must have an iron will to pass me!"], battle:{ team:[{id:"038",name:"Sproutle",hp:55,maxHp:55,atk:45,def:60,spd:30,moves:["Vine Lash","Tackle"],type:"Grass",level:9}], reward:450, badge:null } },
    { id:"master_lin", x:8, y:2, sprite:"🥋", name:"Master Lin", dialog:["A dojo is a machine. Every part has a place. Show me where you fit."], postBattleDialog:["You fit. Take the Core Fragment. It opens roads that only a steady trainer can open."], battle:{ team:[{id:"039",name:"Shellguard",hp:90,maxHp:90,atk:55,def:95,spd:25,moves:["Chrome Guard","Tackle","Shell Burst","Rockfall"],type:"Grass",level:12}], reward:1500, badge:"Core Fragment", hmReward:"Mighty Push" }, isDojoBoss: true },
  ],
  signs: [],
  exits: [
    { x:7, y:17, to:"binary_fields", enterAt:{x:14, y:9}, dir:"down" },
    { x:8, y:17, to:"binary_fields", enterAt:{x:14, y:9}, dir:"down" }
  ],
  doors: [],
  events: [
    { id: "dojo_acolyte_1_event", x:6, y:13, dialog:["Acolyte Ken: Stop right there! You must prove yourself!"], npc: { name: "Acolyte Ken", sprite: "🥋" }, battle: { team:[{id:"007",name:"Tyrage",hp:45,maxHp:45,atk:60,def:40,spd:35,moves:["Punch","Tackle"],type:"Earth",level:7}], reward:300, badge:null } },
    { id: "dojo_acolyte_1_event", x:7, y:13, dialog:["Acolyte Ken: Stop right there! You must prove yourself!"], npc: { name: "Acolyte Ken", sprite: "🥋" }, battle: { team:[{id:"007",name:"Tyrage",hp:45,maxHp:45,atk:60,def:40,spd:35,moves:["Punch","Tackle"],type:"Earth",level:7}], reward:300, badge:null } },
    { id: "dojo_acolyte_1_event", x:8, y:13, dialog:["Acolyte Ken: Stop right there! You must prove yourself!"], npc: { name: "Acolyte Ken", sprite: "🥋" }, battle: { team:[{id:"007",name:"Tyrage",hp:45,maxHp:45,atk:60,def:40,spd:35,moves:["Punch","Tackle"],type:"Earth",level:7}], reward:300, badge:null } },
    { id: "dojo_acolyte_2_event", x:3, y:9, dialog:["Acolyte Ren: Feel the power of the Core!"], npc: { name: "Acolyte Ren", sprite: "🥷" }, battle: { team:[{id:"004",name:"Razorgater",hp:50,maxHp:50,atk:65,def:64,spd:48,moves:["Chrome Claw","Tackle"],type:"Steel",level:8}], reward:350, badge:null } },
    { id: "dojo_acolyte_2_event", x:4, y:9, dialog:["Acolyte Ren: Feel the power of the Core!"], npc: { name: "Acolyte Ren", sprite: "🥷" }, battle: { team:[{id:"004",name:"Razorgater",hp:50,maxHp:50,atk:65,def:64,spd:48,moves:["Chrome Claw","Tackle"],type:"Steel",level:8}], reward:350, badge:null } },
    { id: "dojo_acolyte_2_event", x:5, y:9, dialog:["Acolyte Ren: Feel the power of the Core!"], npc: { name: "Acolyte Ren", sprite: "🥷" }, battle: { team:[{id:"004",name:"Razorgater",hp:50,maxHp:50,atk:65,def:64,spd:48,moves:["Chrome Claw","Tackle"],type:"Steel",level:8}], reward:350, badge:null } }
  ],
  encounters: []
};

// Additional Maps
export const BINARY_WOODS: any = {
  name: "The Dark Forest",
  music: "woods_theme",
  weather: "mist",
  width: 32, height: 45,
  playerStart: { x:28, y:22 },
  tiles: (() => {
    const W=32, H=45;
    return buildMap(W, H, (x,y) => {
      if (x===0||x===W-1||y===0||y===H-1) return TILE.WALL;
      if (x>=12&&x<=14&&y>=0&&y<=15) return TILE.PATH;
      if (x>=8&&x<=14&&y===15) return TILE.PATH;
      if (x>=8&&x<=10&&y>=15&&y<=28) return TILE.PATH;
      if (x>=8&&x<=22&&y===28) return TILE.PATH;
      if (x>=20&&x<=22&&y>=8&&y<=28) return TILE.PATH;
      if (x>=20&&x<=28&&y===8) return TILE.PATH;
      
      if ((x>=2&&x<=7&&y>=2&&y<=14)||(x>=15&&x<=19&&y>=2&&y<=14)) return TILE.WALL;
      if ((x>=2&&x<=7&&y>=16&&y<=27)||(x>=11&&x<=19&&y>=16&&y<=27)) return TILE.WALL;
      if ((x>=23&&x<=29&&y>=2&&y<=7)||(x>=23&&x<=29&&y>=9&&y<=22)) return TILE.WALL;
      
      if (y>=2&&y<=14&&x>=12&&x<=14) return TILE.PATH; 
      if (x===11&&y>=2&&y<=14) return TILE.TALL_GRASS;
      if (x===15&&y>=2&&y<=14) return TILE.TALL_GRASS;
      if (x>=4&&x<=10&&y>=30&&y<=38) return TILE.BUILDING;
      if (x===7&&y===38) return TILE.DOOR;
      if (x>=26&&x<=28&&y>=38&&y<=42) return TILE.CAVE;
      if (x===27&&y===38) return TILE.DOOR;
      if (x===19&&y===22) return TILE.HM_CUT;
      if (x===8&&y===5) return TILE.HM_CUT;
      if (x>=13&&x<=18&&y>=30&&y<=36) return TILE.WATER;
      if (x>=14&&x<=18&&y>=16&&y<=20) return TILE.FLOWER;
      if (x>=26&&x<=30&&y>=20&&y<=24) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"hacker_grunt2", x:13, y:10, sprite:"🕶️", name:"Hacker Grunt", facing:"down", dialog:["The woods belong to the Liberation Front now!"], battle:{ team:[{id:"010",name:"Kittember",hp:36,maxHp:36,atk:55,def:28,spd:68,moves:["Night Stealth","Stare Down"],type:"Fire",level:12}], reward:350, badge:null } },
    { id:"trainer_bugcatcher_mira", x:9, y:20, sprite:"🐛", name:"Bug Catcher Mira", facing:"down", dialog:["The woods hum. Listen, and you will hear where the wild ones are."], battle:{ team:[{id:"016",name:"Squirmite",hp:30,maxHp:30,atk:35,def:30,spd:50,moves:["Tackle","Swift Movement"],type:"Bug",level:10},{id:"017",name:"Cocoonode",hp:50,maxHp:50,atk:20,def:55,spd:30,moves:["Tackle","Swift Movement"],type:"Bug",level:11}], reward:220, badge:null } },
    { id:"trainer_woodswalker_tess", x:21, y:15, sprite:"🌲", name:"Woods Walker Tess", facing:"down", dialog:["The woods are deep. Watch your step."], battle:{ team:[{id:"038",name:"Sproutle",hp:55,maxHp:55,atk:68,def:64,spd:31,moves:["Tackle","Swift Movement"],type:"Grass",level:11},{id:"041",name:"Pixilite",hp:40,maxHp:40,atk:30,def:30,spd:70,moves:["Tackle","Swift Movement"],type:"Grass",level:11}], reward:280, badge:null } },
  ],
  exits: [
    ...buildVertExits(31, 15, 25, "binary_fields", 1, "right"),
  ],
  doors: [
    { x:7, y:38, to:"dojo_2", enterAt:{x:5, y:14}, label:"Aero Dojo — Wind Wing" },
    { x:27, y:38, to:"cave_of_echoes", enterAt:{x:5, y:0}, label:"Cave of Echoes" }
  ],
  events: [
    { id: "hacker_grunt2_event", x:12, y:11, dialog:["Hacker Grunt: The woods belong to the Liberation Front now!"], npc: { name: "Hacker Grunt", sprite: "🕶️" }, battle: { team:[{id:"010",name:"Kittember",hp:36,maxHp:36,atk:55,def:28,spd:68,moves:["Claw","Stare Down"],type:"Fire",level:12}], reward:350, badge:null } },
    { id: "hacker_grunt2_event", x:13, y:11, dialog:["Hacker Grunt: The woods belong to the Liberation Front now!"], npc: { name: "Hacker Grunt", sprite: "🕶️" }, battle: { team:[{id:"010",name:"Kittember",hp:36,maxHp:36,atk:55,def:28,spd:68,moves:["Claw","Stare Down"],type:"Fire",level:12}], reward:350, badge:null } },
    { id: "hacker_grunt2_event", x:14, y:11, dialog:["Hacker Grunt: The woods belong to the Liberation Front now!"], npc: { name: "Hacker Grunt", sprite: "🕶️" }, battle: { team:[{id:"010",name:"Kittember",hp:36,maxHp:36,atk:55,def:28,spd:68,moves:["Claw","Stare Down"],type:"Fire",level:12}], reward:350, badge:null } }
  ],
  encounters: []
};

export const CAVE_OF_ECHOES: any = {
  name: "Cave of Echoes — B1F",
  music: "cave_theme",
  interior: true,
  width: 28, height: 30,
  playerStart: { x:5, y:1 },
  tiles: (() => {
    const W=28, H=30;
    return buildMap(W, H, (x,y) => {
      if (x===0||x===W-1||y===0||y===H-1) return TILE.BUILDING;
      if (x>=3&&x<=7&&y>=1&&y<=8) return TILE.CAVE;
      if (x>=3&&x<=20&&y===8) return TILE.CAVE;
      if (x>=18&&x<=20&&y>=8&&y<=20) return TILE.CAVE;
      if (x>=10&&x<=20&&y===20) return TILE.CAVE;
      if (x>=10&&x<=12&&y>=20&&y<=28) return TILE.CAVE;
      if (x>=8&&x<=14&&y>=12&&y<=16) return TILE.CAVE;
      if (x>=14&&x<=22&&y>=22&&y<=26) return TILE.WATER;
      if (x===15&&y===8) return TILE.HM_ROCK;
      if (x===10&&y===16) return TILE.HM_ROCK;
      if (x===11&&y===27) return TILE.STAIRS_DOWN;
      if (x===5&&y===2) return TILE.STAIRS_UP;
      return TILE.BUILDING;
    });
  })(),
  npcs: [
    { id:"miner_npc", x:12, y:13, sprite:"🧗", name:"Miner Cleff", movement:"wander", wanderRadius:1, dialog:["This cave runs DEEP."], battle:{ team:[{id:"007",name:"Tyrage",hp:45,maxHp:45,atk:60,def:40,spd:50,moves:["Tackle","Swift Movement"],type:"Earth",level:16}], reward:340, badge:null } },
    // Dialogue attribution R1-BEAT5: Cave guide, previously the only
    // missing Region 1 speaker with a world map (Mochiko garden gate
    // belongs to GardenView, not a world map). Line is verbatim from
    // region1-dialogue.json; placed at (4,2) on a CAVE tile by the
    // entrance, clear of the STAIRS_UP tile at (5,2). No battle.
    { id:"cave_guide", x:4, y:2, sprite:"🕯️", name:"Cave Guide", facing:"down", dialog:["The cave echoes what you bring into it. Bring a steady team, and it echoes back steady."] },
    { id:"trainer_caverunner_pike", x:19, y:10, sprite:"🏃", name:"Cave Runner Pike", facing:"down", dialog:["I run these tunnels every day."], battle:{ team:[{id:"013",name:"Pupbble",hp:45,maxHp:45,atk:60,def:50,spd:50,moves:["Tackle","Swift Movement"],type:"Earth",level:16},{id:"036",name:"Cragarm",hp:65,maxHp:65,atk:105,def:130,spd:30,moves:["Tackle","Swift Movement"],type:"Steel",level:17}], reward:380, badge:null } },
    // Item meaning S-IM1: the Singing Stone relic object (unique,
    // hand-placed in the cave's deep chamber — RELIC_NPCS). Grant
    // resolves in WorldEngine; never in shop stock or drop tables.
    { id:"relic_echo_shard", x:14, y:16, sprite:"🪨", name:"Singing Stone", facing:"down", dialog:["Something at the back of the chamber is humming…"] },
  ],
  exits: [
    { x:5, y:0, to:"binary_woods", enterAt:{x:27, y:38}, dir:"up" },
    // Phase A: STAIRS_DOWN tile at (11,27) was a dead end — no exit.
    // It now leads to Neon City at its STAIRS_DOWN tile (18,35).
    { x:11, y:27, to:"neon_city", enterAt:{x:18, y:35}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const NEON_CITY: any = {
  name: "Neon City",
  music: "neon_theme",
  weather: "neon_rain",
  width: 36, height: 38,
  playerStart: { x:18, y:35 },
  tiles: (() => {
    const W=36, H=38;
    return buildMap(W, H, (x,y) => {
      if (x===0||x===W-1||y===0||y===H-1) return TILE.BUILDING;
      if (y===10||y===20||y===30) return TILE.NEON_PATH;
      if (x===8||x===18||x===28) return TILE.NEON_PATH;
      if (x>=2&&x<=6&&y>=2&&y<=8) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=8) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=8) return TILE.BUILDING;
      if (x>=30&&x<=34&&y>=2&&y<=8) return TILE.BUILDING;
      if (x>=2&&x<=6&&y>=12&&y<=18) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=12&&y<=18) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=12&&y<=18) return TILE.BUILDING;
      if (x>=30&&x<=34&&y>=12&&y<=18) return TILE.BUILDING;
      if (x>=2&&x<=6&&y>=22&&y<=28) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=22&&y<=28) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=22&&y<=28) return TILE.BUILDING;
      if (x>=30&&x<=34&&y>=22&&y<=28) return TILE.BUILDING;
      
      if (x===4&&y===8) return TILE.DOOR; 
      if (x===13&&y===28) return TILE.DOOR;
      if (x===23&&y===28) return TILE.DOOR;
      if (x===33&&y===28) return TILE.DOOR;
      if (x===13&&y===18) return TILE.DOOR;
      if (x>=12&&x<=24&&y>=2&&y<=6) return TILE.WARP;
      if (x===18&&y===6) return TILE.DOOR;
      
      if ((x>=7&&x<=9&&y>=12&&y<=18)||(x>=27&&x<=29&&y>=12&&y<=18)) return TILE.TALL_GRASS;
      if (x===18&&y===35) return TILE.STAIRS_DOWN;
      
      return TILE.NEON_PATH;
    });
  })(),
  npcs: [
    { id:"neon_astrologer", x:14, y:30, sprite:"🔮", name:"Data Astrologer", facing:"down", movement:"wander", wanderRadius:1, dialog:["The stars are aligning in the Mainframe.", "I have sensed legendary beings, built from raw data, myth, and stars!"] },
    { id:"neon_shaman", x:24, y:20, sprite:"📿", name:"Cyber Shaman", facing:"left", movement:"wander", wanderRadius:1, dialog:["Mythar, the first legend... he slumbers deep in the digital cosmos.", "But numerology and myths say more celestial Mochiichao will awaken soon."] },
    // Region 1 step (i): the Neon ferry captain (Beat 5 spec
    // lines, region1-dialogue.json, verbatim). First talk teaches
    // Slice (Data-Cut) — the ferry-cell battle itself is owed (no
    // ferry map yet), so the grant is the talk, not the cell clear.
    { id:"neon_ferry_captain", x:20, y:30, sprite:"⚓", name:"Ferry Captain", facing:"down", dialog:["The ferry runs on data, not diesel. Help me clear the Hacker cell on the ferry, and I will teach you Data-Cut. It cuts vines, and it cuts lies, if you use it right."] }
  ],
  exits: [
    ...buildVertExits(0, 15, 25, "scrap_junkyard", 32, "left"),
    ...buildVertExits(35, 15, 25, "coral_approach", 1, "right"),
    { x:18, y:0, to:"route_2", enterAt:{x:14, y:38}, dir:"up" },
    // Phase A return: WorldEngine checks exits before the solid-tile
    // return, so this border tile (18,37) fires even though it renders
    // as BUILDING. It returns to the Cave STAIRS_DOWN tile (11,27).
    { x:18, y:37, to:"cave_of_echoes", enterAt:{x:11, y:27}, dir:"down" }
  ],
  doors: [
    { x:18, y:6, to:"mauveville_arena", enterAt:{x:8, y:18}, label:"Mauveville Arena", condition:"ciphers>=10" },
    { x:13, y:18, to:"dojo_3", enterAt:{x:7, y:16}, label:"Dojo 3 — Chrome Gate" }
  ],
  events: [],
  encounters: []
};

// Additional Maps 2
export const SCRAP_JUNKYARD: any = {
  name: "The Scrap Junkyard",
  music: "junkyard_theme",
  weather: "smog",
  width: 34, height: 36,
  playerStart: { x:30, y:18 },
  tiles: (() => {
    const W=34, H=36;
    return buildMap(W, H, (x,y) => {
      if (x===0||x===W-1||y===0||y===H-1) return TILE.WALL;
      if (y>=2&&y<=6&&x>=2&&x<=6) return TILE.WALL;
      if (y>=2&&y<=6&&x>=28&&x<=32) return TILE.WALL;
      if ((x+y)%6===0) return TILE.WALL;
      if (x===15||x===16) return TILE.INDUSTRIAL;
      if (y===18) return TILE.INDUSTRIAL;
      if (x>=8&&x<=12&&y>=8&&y<=14) return TILE.LAVA;
      if (x>=22&&x<=26&&y>=22&&y<=28) return TILE.LAVA;
      if (x===20&&y===10) return TILE.HM_ROCK;
      if (x===10&&y===24) return TILE.HM_ROCK;
      if (x===26&&y===15) return TILE.HM_ROCK;
      if (x>=6&&x<=12&&y>=28&&y<=34) return TILE.BUILDING;
      if (x===9&&y===34) return TILE.DOOR;
      if (y>=30&&y<=34&&x>=2&&x<=4) return TILE.HM_ROCK;
      if (x>=14&&x<=20&&y>=24&&y<=30) return TILE.LAVA;
      if (x>=22&&x<=30&&y>=6&&y<=10) return TILE.HM_CUT;
      if (x>=15&&x<=17&&y>=6&&y<=12) return TILE.PATH;
      return TILE.INDUSTRIAL;
    });
  })(),
  npcs: [
    { id:"junk_boss", x:16, y:9, sprite:"🏭", name:"Junk Warlord Krix", dialog:["Think you can survive the Junkyard?"], battle:{ team:[{id:"005",name:"Chromejaww",hp:75,maxHp:75,atk:72,def:80,spd:48,moves:["Chrome Claw"],type:"Steel",level:24}], reward:750, badge:null } },
    // Item meaning S-IM1: the Ticking Junk relic object (unique,
    // hand-placed on the junkyard's central aisle — RELIC_NPCS).
    { id:"relic_scrap_core", x:20, y:18, sprite:"⚙️", name:"Ticking Junk", facing:"down", dialog:["Buried in the scrap: something warm, ticking…"] }
  ],
  exits: [
    ...buildVertExits(33, 15, 25, "neon_city", 1, "right")
  ],
  doors: [],
  events: [],
  encounters: []
};

export const CORAL_APPROACH: any = {
  name: "Coral Reef Approach",
  music: "water_theme",
  weather: "clear",
  width: 30, height: 35,
  playerStart: { x:0, y:20 },
  tiles: (() => {
    const W=30, H=35;
    return buildMap(W, H, (x,y) => {
      if (x===29||y===0||y===34||x===0) return TILE.WALL;
      if (x>=2&&x<=10&&y>=2&&y<=12) return TILE.SAND;
      if (x>=1&&x<=10&&y>=13&&y<=32) return TILE.SAND;
      if (x>=8&&x<=14&&y>=18&&y<=28) return TILE.SHALLOW;
      if (x>=12&&x<=28&&y>=10&&y<=32) return TILE.WATER;
      if (x>=12&&x<=28&&y>=2&&y<=8) return TILE.WATER;
      if (y===20&&x<=10) return TILE.DOCK;
      if (x>=8&&x<=10&&y>=8&&y<=12) return TILE.TALL_GRASS;
      if (x>=6&&x<=8&&y>=26&&y<=30) return TILE.TALL_GRASS;
      if (y===20&&x===12) return TILE.HM_WATERFALL;
      if (x>=18&&x<=22&&y>=16&&y<=20) return TILE.SHALLOW;
      if (x===20&&y===18) return TILE.SAND;
      return TILE.SAND;
    });
  })(),
  npcs: [
    { id:"boat_captain", x:4, y:20, sprite:"⛵", name:"Capt. Neri", movement:"wander", wanderRadius:1, dialog:["My boat can take you to Castagnoli Island"] }
  ],
  exits: [
    ...buildVertExits(0, 15, 25, "neon_city", 34, "left"),
    ...buildEdgeExits(13, 17, 34, "castagnoli_island", 1, "down")
  ],
  doors: [],
  events: [],
  encounters: []
};

export const CASTAGNOLI_ISLAND: any = {
  name: "Castagnoli Island — Luigi's Reserve",
  music: "island_theme",
  weather: "jungle",
  width: 40, height: 45,
  playerStart: { x:20, y:2 },
  tiles: (() => {
    const W=40, H=45;
    return buildMap(W, H, (x,y) => {
      if (x===0||x===W-1||y===0||y===H-1) return TILE.WATER;
      if (x>=2&&x<=37&&y>=2&&y<=42) return TILE.SAND;
      if (x>=4&&x<=35&&y>=4&&y<=40) return TILE.GRASS;
      if (x>=6&&x<=33&&y>=6&&y<=38) return TILE.TALL_GRASS;
      if (x>=16&&x<=24&&y>=6&&y<=14) return TILE.BUILDING;
      if (x===20&&y===14) return TILE.DOOR;
      if (x>=18&&x<=22&&y>=15&&y<=42) return TILE.PATH;
      if (x===20&&y===42) return TILE.DOCK;
      
      if (x>=8&&x<=12&&y>=20&&y<=24) return TILE.WATER;
      if (x>=28&&x<=32&&y>=20&&y<=24) return TILE.WATER;
      if (x===10&&y===22) return TILE.HM_WATERFALL;
      if (x===30&&y===22) return TILE.HM_WATERFALL;
      
      if (x>=12&&x<=16&&y>=30&&y<=34) return TILE.FLOWER;
      if (x>=24&&x<=28&&y>=30&&y<=34) return TILE.FLOWER;
      
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
    { id:"luigi_castagnoli", x:20, y:22, sprite:"🤵", name:"Luigi Castagnoli", dialog:["Ah, the famous trainer. I've heard SO much about you."], battle:{ team:[{id:"009",name:"Oblivirex",hp:110,maxHp:110,atk:90,def:70,spd:55,moves:["Crush"],type:"Water",level:48}], reward:5000, badge:"Island Key", isVillainBoss:true } }
  ],
  exits: [
    ...buildEdgeExits(13, 17, 0, "coral_approach", 33, "up")
  ],
  doors: [
    { x:20, y:14, to:"luigi_mansion", enterAt:{x:5, y:12}, label:"Luigi's Mansion" }
  ],
  events: [],
  encounters: []
};

export const MAUVEVILLE_ARENA: any = {
  name: "Mauveville Arena — The Gauntlet",
  music: "arena_theme",
  weather: "neon_rain",
  interior: true,
  width: 20, height: 28,
  playerStart: { x:9, y:26 },
  tiles: (() => {
    return buildMap(20, 28, (x,y) => {
      if (x===0||x===19) return TILE.BUILDING;
      if (y===0||y===27) return TILE.BUILDING;
      if (x>=3&&x<=16&&y>=4&&y<=20) return TILE.WARP;
      if (x>=8&&x<=11&&y>=20&&y<=27) return TILE.NEON_PATH;
      return TILE.NEON_PATH;
    });
  })(),
  npcs: [
    { id:"champion_mythar", x:9, y:4, sprite:"✨", name:"Champion — MYTHAR", dialog:["I am Mythar. The end of all challengers."], battle:{ team:[{id:"003",name:"AquariiOS",hp:120,maxHp:120,atk:130,def:100,spd:110,moves:["Mythic Pulse"],type:"Water",level:65}], reward:10000, badge:"Champion", isChampion:true } }
  ],
  exits: [
    { x:9, y:27, to:"neon_city", enterAt:{x:18, y:6}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const BOOT_BAY: any = {
  name: "Boot Bay",
  music: "water_theme",
  weather: "clear",
  width: 32, height: 20,
  playerStart: { x:15, y:1 },
  tiles: (() => {
    return buildMap(32, 20, (x, y) => {
      if (x===0||x===31||y===19) return TILE.WALL;
      return TILE.WATER;
    });
  })(),
  npcs: [], exits: [{ x:15, y:0, to:"sector0", enterAt:{x:15, y:27}, dir:"up" }], doors: [], events: [], encounters: []
};

export const LUIGI_MANSION: any = {
  name: "Luigi's Mansion",
  music: "dojo_theme",
  interior: true,
  width: 11, height: 14,
  playerStart: { x:5, y:12 },
  tiles: (() => {
    return buildMap(11, 14, (x,y) => {
      if (x===0||x===10||y===0||y===13) return TILE.BUILDING;
      if (x===5&&y===13) return TILE.DOOR;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"luigi_indoor", x:5, y:4, sprite:"🤵", name:"Luigi", dialog:["This is my sanctuary!"], battle:{ team:[{id:"009",name:"Oblivirex",hp:110,maxHp:110,atk:90,def:70,spd:55,moves:["Crush"],type:"Water",level:48}], reward:5000, badge:"Island Key", isVillainBoss:true } }
  ],
  exits: [{ x:5, y:13, to:"castagnoli_island", enterAt:{x:20, y:14}, dir:"down" }], doors: [], events: [], encounters: []
};

export const DOJO_2: any = {
  name: "Aero Dojo — Wind Wing",
  music: "dojo_theme",
  interior: true,
  width: 11, height: 16,
  playerStart: { x:5, y:14 },
  tiles: (() => {
    return buildMap(11, 16, (x,y) => {
      if (x===0||x===10||y===0||y===15) return TILE.BUILDING;
      if (x===5&&y===15) return TILE.DOOR;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"master_falk", x:5, y:2, sprite:"🥋", name:"Master Falk", dialog:["Hey, hey, welcome up here. I'm Master Falk, and I'm high as a kite today, so you better keep up.","You made it to my Dojo? Good. I live free like a bird up here, no cage, no chain, just wind.","The winds favor the swift! So show me you're swift, or get blown right back down."], postBattleDialog:["Ha! Okay, okay, you clipped my wings. I'm high as a kite, but you flew higher.","Free like a bird, and today that bird is you. Take the wind with you.","Here's your Wind Fragment. Hold it tight, or the wind will take it.","Next Dojo's down the road, not up in the clouds. Don't get too comfortable on the ground, though. Stay free, stay fast."], battle:{ team:[{id:"019",name:"Zephling",hp:40,maxHp:40,atk:55,def:35,spd:60,moves:["Tackle","Swift Movement"],type:"Aero",level:18},{id:"020",name:"Aerobeak",hp:60,maxHp:60,atk:75,def:55,spd:80,moves:["Tackle","Swift Movement"],type:"Aero",level:19},{id:"021",name:"Stormtalon",hp:80,maxHp:80,atk:105,def:75,spd:110,moves:["Tackle","Swift Movement"],type:"Aero",level:20}], reward:1500, badge:"Wind Fragment" }, isDojoBoss: true },
    { id:"dojo_acolyte_gale", x:3, y:6, sprite:"🥋", name:"Acolyte Gale", facing:"down", dialog:["The wind tests everyone who climbs."], battle:{ team:[{id:"019",name:"Zephling",hp:40,maxHp:40,atk:55,def:35,spd:60,moves:["Tackle","Swift Movement"],type:"Aero",level:17}], reward:500, badge:null } },
    { id:"dojo_acolyte_skye", x:7, y:6, sprite:"🥋", name:"Acolyte Skye", facing:"down", dialog:["Master Falk's wind shows no mercy."], battle:{ team:[{id:"019",name:"Zephling",hp:40,maxHp:40,atk:55,def:35,spd:60,moves:["Tackle","Swift Movement"],type:"Aero",level:18},{id:"020",name:"Aerobeak",hp:60,maxHp:60,atk:75,def:55,spd:80,moves:["Tackle","Swift Movement"],type:"Aero",level:18}], reward:600, badge:null } },
  ],
  exits: [{ x:5, y:15, to:"binary_woods", enterAt:{x:7, y:37}, dir:"down" }], doors: [], events: [], encounters: []
};


export const SECTOR0_TRUCK: any = {
  name: "Moving Truck — Sector 0",
  music: "sector0_theme",
  weather: "clear",
  interior: true,
  width: 12, height: 10,
  playerStart: { x:6, y:8 },
  tiles: (() => {
    return buildMap(12, 10, (x, y) => {
      if (x===6&&y===9) return TILE.DOOR;
      if (x===0||x===11||y===0||y===9) return TILE.WALL;
      if (y>=1&&y<=3) return TILE.BUILDING; // stacked boxes
      return TILE.PATH;
    });
  })(),
  npcs: [
    // Sequence build (2026-10-28): Mom rides in the truck, per the
    // canon opening (region1-truck-start.ink, knot mom_truck). Her
    // lines are the ink's, verbatim; the engine carries the speaker
    // name, so the ink's "Mom:" script labels are not repeated in
    // the line text. She points the player at the house + clock,
    // which is the ink's next beat (house_2f_clock, now a real
    // event in sector0_house_2f). Dialog only — the heal-Mom is the
    // town/house Mom, as in the ink.
    // Step (i, 2026-11-13): inkStory/inkKnot — the talk plays the
    // mom_truck knot live via InkDialogueBox (knot-scoped: it stops
    // at the house_1f divert). dialog[] stays as the fallback if the
    // story cannot load.
    { id:"mom_truck", x:6, y:4, sprite:"", name:"Mom", facing:"down", dialog:["There you are! The truck beat us here.", "Our new house is just up the road. Go on in and set the clock upstairs — movers hate waiting."], inkStory:"region1-truck-start", inkKnot:"mom_truck" },
    { id:"mover_1", x:3, y:5, sprite:"📦", name:"Mover", facing:"down", dialog:["Careful with that one — it is the clock. A new home needs a correct time."] },
    { id:"mover_2", x:8, y:5, sprite:"📦", name:"Mover", facing:"down", dialog:["Last box out, then we are done. Your room is upstairs."] },
  ],
  signs: [
    { x:6, y:2, text:"MOVING BOXES\\nMom's things, your things, and one very important clock." },
  ],
  exits: [],
  doors: [
    { x:6, y:9, to:"sector0", enterAt:{x:15, y:10}, label:"Step off the truck" }
  ],
  events: [],
  encounters: []
};

export const SECTOR0_HOUSE_1F: any = {
  name: "Your House — 1F",
  music: "sector0_theme",
  weather: "clear",
  interior: true,
  width: 13, height: 12,
  playerStart: { x:6, y:10 },
  tiles: (() => {
    return buildMap(13, 12, (x, y) => {
      if (x===6&&y===11) return TILE.DOOR;
      if (x===6&&y===1) return TILE.STAIRS_UP;
      if (x===6&&y===2) return TILE.PATH; // stair approach, else the stair is unreachable
      if (x===0||x===12||y===0||y===11) return TILE.WALL;
      if ((x===1||x===11)&&y===10) return TILE.PLANT; // BW2 lane: door plants
      if (x>=8&&x<=9&&y>=5&&y<=6) return TILE.BUILDING; // BW2 lane: mid-room table island — the room was one big empty floor
      if (y>=1&&y<=2) return TILE.BUILDING; // kitchen counter / table
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"mom_house", x:5, y:8, sprite:"👩", name:"Your Mom", facing:"down", isHeal: true, dialog:["There you are! The truck beat us here.","Come inside. Your room is upstairs. The boxes can wait. Go set the clock first — a new home needs a correct time.","Good. Now go say hello next door. Hex's family just moved in too. You two will need each other out there.","Wait. Before you run off — here. Sprint Boots. Hold B and you can run. A trainer who cannot run will always be late."] },
  ],
  signs: [
    { x:10, y:2, text:"KITCHEN\\nMom's cooking smells like a new start." },
  ],
  exits: [
    { x:6, y:1, to:"sector0_house_2f", enterAt:{x:6, y:10}, dir:"up" }
  ],
  doors: [
    { x:6, y:11, to:"sector0", enterAt:{x:6, y:9}, label:"Boot Harbor" }
  ],
  events: [],
  encounters: []
};

export const SECTOR0_HOUSE_2F: any = {
  name: "Your House — 2F",
  music: "sector0_theme",
  weather: "clear",
  interior: true,
  width: 13, height: 12,
  playerStart: { x:6, y:10 },
  tiles: (() => {
    return buildMap(13, 12, (x, y) => {
      if (x===6&&y===11) return TILE.STAIRS_DOWN;
      if (x===0||x===12||y===0||y===11) return TILE.WALL;
      if (x>=2&&x<=4&&y>=2&&y<=3) return TILE.TERMINAL; // BW2 lane: the PC desk is a terminal, not a block
      if (x>=8&&x<=10&&y>=2&&y<=3) return TILE.BED; // BW2 lane: the bed is a bed
      return TILE.PATH;
    });
  })(),
  npcs: [],
  signs: [
    { x:3, y:2, text:"PC\\nYour PC. Items and Mochiichao storage live here." },
    { x:6, y:5, text:"CLOCK\\nSet the clock. A new home needs a correct time." },
    { x:9, y:2, text:"POSTER\\nA poster of a legendary Mochiichao. One day." },
  ],
  exits: [
    { x:6, y:11, to:"sector0_house_1f", enterAt:{x:6, y:2}, dir:"down" }
  ],
  doors: [],
  // Sequence build (2026-10-28): the clock is a real beat, not just a
  // sign. The canon opening (region1-truck-start.ink, knot
  // house_2f_clock) has the player SET the clock — "You set the clock
  // on the wall. It ticks, once, and keeps going." / "Home. For real
  // this time." — and sets its clock_set VAR. Stepping to the clock
  // now fires those exact lines once (the engine's completedEvents
  // gate) and records 'clock_set'. The sign above stays as the
  // pre-read flavour text. The ink's "You:" script label on the
  // second line is the speaker tag; the words are verbatim.
  events: [
    { id:"clock_set", x:6, y:5, dialog:["You set the clock on the wall. It ticks, once, and keeps going.", "Home. For real this time."] }
  ],
  encounters: []
};

export const SECTOR0_RIVAL_HOUSE: any = {
  name: "Hex's House",
  music: "sector0_theme",
  weather: "clear",
  interior: true,
  width: 13, height: 12,
  playerStart: { x:6, y:10 },
  tiles: (() => {
    return buildMap(13, 12, (x, y) => {
      if (x===6&&y===11) return TILE.DOOR;
      if (x===0||x===12||y===0||y===11) return TILE.WALL;
      if (x===10&&y===1) return TILE.TERMINAL; // BW2 lane: Hex's desk terminal — his house is lived-in differently
      if ((x===1||x===11)&&y===10) return TILE.PLANT; // BW2 lane: door plants
      if (y>=1&&y<=2) return TILE.BUILDING;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"hex_mom", x:5, y:8, sprite:"👩", name:"Hex's Mom", facing:"down", dialog:["Hex just moved in too. You two will need each other out there.","Go say hello — he is already talking about his starter."] },
    { id:"rival_hex_home", x:8, y:5, sprite:"😤", name:"Hex", facing:"down", dialog:["You again? I already picked my starter. Razorgater, obviously.","Don't think I'll go easy on you just because we grew up here.","Next time we meet, we BATTLE. Count on it."] },
  ],
  signs: [],
  exits: [],
  doors: [
    { x:6, y:11, to:"sector0", enterAt:{x:26, y:9}, label:"Boot Harbor" }
  ],
  events: [],
  encounters: []
};

export const SECTOR0_NEIGHBOR_HOUSE: any = {
  name: "Sector 0 — Neighbor's House",
  music: "sector0_theme",
  weather: "clear",
  interior: true,
  width: 11, height: 10,
  playerStart: { x:5, y:8 },
  tiles: buildMap(11, 10, (x, y) => {
    if (x===5&&y===9) return TILE.DOOR;
    if (x===0||x===10||y===0||y===9) return TILE.WALL;
    if (y>=1&&y<=2) return TILE.BUILDING;
    return TILE.PATH;
  }),
  npcs: [
    { id:"neighbor_tinker", x:3, y:5, sprite:"🧑‍🔧", name:"Tinker Ollo", facing:"right", dialog:["Moving day, huh? Boot Harbor runs on two things: dock coffee and Mochiichao.","Tall grass is where wild ones hide. Weaken one first, THEN throw a Luigi Cube.","A cube thrown at a full-HP Mochiichao usually just bounces off."] },
    { id:"neighbor_kid", x:7, y:4, sprite:"🧒", name:"Pip", facing:"down", dialog:["Fire beats steel! My big sister says the Silicon Town dojo master uses a steel shell.","If I had a fire-type I'd go win that badge myself."] },
  ],
  signs: [],
  exits: [],
  doors: [
    { x:5, y:9, to:"sector0", enterAt:{x:19, y:4}, label:"Boot Harbor" }
  ],
  events: [],
  encounters: []
};
export const ROUTE_2: any = {
  name: "Route 2.0 — Harbour Road",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
    { id:"route2_walker", x:14, y:20, sprite:"🚶", name:"Road Walker", facing:"down", dialog:["Stoneport is north. The harbour road is long — bring a partner."] },
  ],
  signs: [
    { x:14, y:10, text:"ROUTE 2.0\\nNorth to Stoneport City. South to Neon City." },
  ],
  exits: [
    { x:14, y:0, to:"stoneport_city", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"neon_city", enterAt:{x:18, y:1}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: [] // wild pool owed: 022 name not verified in live species data, not invented here
};

export const STONEPORT_CITY: any = {
  name: "Stoneport City",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      if (y>=25) return TILE.DOCK;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"dockhand_juno", x:14, y:20, sprite:"⚓", name:"Dockhand Juno", facing:"down", dialog:["The docks run on time here. Stoneport ships out to everywhere the Mainframe touches."] },
    { id:"harbour_guard", x:14, y:10, sprite:"🧑", name:"Harbour Guard", facing:"down", dialog:["Neon City's dojo is Chrome — hard, bright, and it does not bend."] },
    { id:"healer_stoneport", x:7, y:10, sprite:"👩‍⚕️", name:"Nurse Faye", facing:"down", isHeal: true, dialog:["Welcome to the Stoneport MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
  ],
  signs: [
    { x:14, y:14, text:"STONEPORT CITY\\nHarbour, docks, and the road south to Neon City." },
  ],
  exits: [
    { x:14, y:0, to:"route_3", enterAt:{x:14, y:39}, dir:"up" },
    { x:14, y:29, to:"route_2", enterAt:{x:14, y:1}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const DOJO_3: any = {
  name: "Dojo 3 — Chrome Gate",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"dojo3_acolyte_volt", x:3, y:10, sprite:"🥋", name:"Acolyte Volt", facing:"down", dialog:["Chrome does not bend. It holds."] },
    { id:"dojo3_acolyte_alloy", x:11, y:10, sprite:"🥋", name:"Acolyte Alloy", facing:"down", dialog:["The Neon Fragment is earned, not given."] },
    // Leader battle is NOT wired here: trainer file R1-041 gives
    // species + levels (005 Lv23, 033 Lv23, 034 Lv24) but no stats,
    // and inventing a boss team here would clash with the trainer
    // wiring batch. The leader is present, dialogued, and the
    // battle is owed by that batch — not silently invented.
    { id:"dojo3_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["Chrome is the Mainframe's spine. Bright, hard, unbent.","Beat my acolytes, then come back and show me you hold."] },
  ],
  signs: [],
  exits: [],
  doors: [
    { x:7, y:17, to:"neon_city", enterAt:{x:13, y:19}, label:"Neon City" }
  ],
  events: [],
  encounters: []
};

export const ROUTE_3: any = {
  name: "Route 3.0 — Stoneport Road",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
    { id:"route3_walker", x:14, y:20, sprite:"🚶", name:"Road Walker", facing:"down", dialog:["Stoneport is south. Signal Tunnel is north."] },
  ],
  signs: [
    { x:14, y:10, text:"ROUTE 3.0\\nNorth to Signal Tunnel. South to Stoneport City." },
  ],
  exits: [
    { x:14, y:0, to:"signal_tunnel", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"stoneport_city", enterAt:{x:14, y:1}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: [] // wild pool owed: trainer lane / roster expansion, not invented here
};

export const SIGNAL_TUNNEL: any = {
  name: "Signal Tunnel",
  music: "cave_theme",
  interior: true,
  width: 28, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(28, 30, (x, y) => {
      if (x===0||x===27||y===0||y===29) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y===15) return TILE.PATH;
      return TILE.CAVE;
    });
  })(),
  npcs: [
    { id:"tunnel_keeper", x:14, y:15, sprite:"🔦", name:"Tunnel Keeper", facing:"down", dialog:["Route 3.0 is south. Pale Town is north."] },
  ],
  signs: [
    { x:14, y:10, text:"SIGNAL TUNNEL\\nNorth to Pale Town. South to Route 3.0." },
  ],
  exits: [
    { x:14, y:0, to:"pale_town", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:29, to:"route_3", enterAt:{x:14, y:1}, dir:"down" }
  ],
  doors: [],
  events: [],
  // Illuminate gate for the dark section is owed in the story/engine
  // pass (region1-wiring.md Break/Phase B note): no engine gate string
  // is invented here, and none is claimed as live.
  encounters: [] // wild pool owed: trainer lane / roster expansion, not invented here
};

export const PALE_TOWN: any = {
  name: "Pale Town",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"pale_tower_keeper", x:14, y:20, sprite:"🗼", name:"Tower Keeper", facing:"down", dialog:["This tower remembers the first trainers. The Syndicate is trying to rewrite what it remembers. Do not let them."] },
  ],
  signs: [
    { x:14, y:14, text:"PALE TOWN\\nThe Tower. South to Signal Tunnel. North to Market City." },
  ],
  exits: [
    { x:14, y:0, to:"market_city", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:29, to:"signal_tunnel", enterAt:{x:14, y:1}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const MARKET_CITY: any = {
  name: "Market City",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (x===13&&y===6) return TILE.DOOR;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"market_hideout_leader", x:14, y:20, sprite:"🎩", name:"Hideout Leader", facing:"down", dialog:["The market sells everything, even the truth. We bought the truth first."] },
    { id:"market_clerk", x:7, y:10, sprite:"🧑", name:"Market Clerk", facing:"down", dialog:["Pale Town is south. Central City is north."] },
  ],
  signs: [
    { x:14, y:14, text:"MARKET CITY\\nSouth to Pale Town. North to Central City." },
  ],
  exits: [
    { x:14, y:0, to:"central_city", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:29, to:"pale_town", enterAt:{x:14, y:1}, dir:"down" }
  ],
  doors: [
    { x:13, y:6, to:"dojo_4", enterAt:{x:7, y:16}, label:"Dojo 4" }
  ],
  events: [],
  encounters: []
};

export const DOJO_4: any = {
  name: "Dojo 4",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    // Leader battle is NOT wired here: no leader name, team, or badge
    // name exists in the source spec (NAME GAP / ROSTER GAP). The
    // leader is present and dialogued; the battle is owed by the
    // trainer lane — same pattern as dojo_3 on main.
    { id:"dojo4_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["Beat my acolytes, then come back and show me you hold."] },
  ],
  signs: [],
  exits: [],
  doors: [
    { x:7, y:17, to:"market_city", enterAt:{x:13, y:7}, label:"Market City" }
  ],
  events: [],
  encounters: []
};

export const CENTRAL_CITY: any = {
  name: "Central City",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (x===13&&y===6) return TILE.DOOR;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"central_citizen", x:14, y:20, sprite:"🧑", name:"Central Citizen", facing:"down", dialog:["The tower is ours again. Thank you. The dojo is open — go, before they regroup."] },
  ],
  signs: [
    { x:14, y:14, text:"CENTRAL CITY\\nSouth to Market City. North to Harbor City." },
  ],
  exits: [
    { x:14, y:0, to:"harbor_city", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:29, to:"market_city", enterAt:{x:14, y:1}, dir:"down" }
  ],
  doors: [
    { x:13, y:6, to:"dojo_5", enterAt:{x:7, y:16}, label:"Dojo 5" }
  ],
  events: [],
  encounters: []
};

export const DOJO_5: any = {
  name: "Dojo 5",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    // Leader battle owed by the trainer lane (NAME GAP / ROSTER GAP),
    // same pattern as dojo_3 on main.
    { id:"dojo5_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["Beat my acolytes, then come back and show me you hold."] },
  ],
  signs: [],
  exits: [],
  doors: [
    { x:7, y:17, to:"central_city", enterAt:{x:13, y:7}, label:"Central City" }
  ],
  events: [],
  encounters: []
};

export const HARBOR_CITY: any = {
  name: "Harbor City",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (x===13&&y===6) return TILE.DOOR;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      if (y>=25) return TILE.DOCK;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"harbor_preserve_keeper", x:14, y:20, sprite:"🌿", name:"Preserve Keeper", facing:"down", dialog:["The preserve is not a zoo. It is a promise. Keep the promise, and I will teach you Wave-Ride. Water is a road, if you respect it."] },
    { id:"harbor_ferry_captain", x:7, y:26, sprite:"⚓", name:"Ferry Captain", facing:"down", dialog:["The Data Ferry runs from this dock, once the Hall of Records is yours."] },
  ],
  signs: [
    { x:14, y:14, text:"HARBOR CITY\\nSouth to Central City. Water route to Ember Island. Data Ferry to the Data Isles." },
  ],
  exits: [
    { x:14, y:0, to:"ember_island", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:29, to:"central_city", enterAt:{x:14, y:1}, dir:"down" },
    // Data Ferry: Hall of Records flag gate is owed in the story/engine
    // pass — no gate string is invented here, and none is claimed live.
    { x:7, y:29, to:"data_isle_1", enterAt:{x:12, y:22}, dir:"down" }
  ],
  doors: [
    { x:13, y:6, to:"dojo_6", enterAt:{x:7, y:16}, label:"Dojo 6" }
  ],
  events: [],
  encounters: []
};

export const DOJO_6: any = {
  name: "Dojo 6",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    // Leader battle owed by the trainer lane (NAME GAP / ROSTER GAP),
    // same pattern as dojo_3 on main.
    { id:"dojo6_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["Beat my acolytes, then come back and show me you hold."] },
  ],
  signs: [],
  exits: [],
  doors: [
    { x:7, y:17, to:"harbor_city", enterAt:{x:13, y:7}, label:"Harbor City" }
  ],
  events: [],
  encounters: []
};

export const EMBER_ISLAND: any = {
  name: "Ember Island",
  music: "island_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x===13&&y===6) return TILE.DOOR;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      if (y>=25) return TILE.DOCK;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"ember_ruins_guide", x:14, y:20, sprite:"🏛️", name:"Ruins Guide", facing:"down", dialog:["Harbor City is south. The lab ruins are here — read the logs, do not take them."] },
  ],
  signs: [
    // Mansion log, readable not spoken (story-fill-region1.md Beat 7).
    { x:14, y:14, text:"LOG 7\\nThe Mythic data is not a weapon. It is a memory. Whoever holds the memory holds the Mainframe. We buried it here so no one would hold it alone." },
    { x:14, y:10, text:"EMBER ISLAND\\nSouth to Harbor City. Silicon Town return route east." },
  ],
  exits: [
    { x:14, y:29, to:"harbor_city", enterAt:{x:14, y:1}, dir:"down" },
    { x:29, y:15, to:"binary_fields", enterAt:{x:1, y:20}, dir:"right" }
  ],
  doors: [
    { x:13, y:6, to:"dojo_7", enterAt:{x:7, y:16}, label:"Dojo 7" }
  ],
  events: [],
  encounters: []
};

export const DOJO_7: any = {
  name: "Dojo 7",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    // Leader battle owed by the trainer lane (NAME GAP / ROSTER GAP),
    // same pattern as dojo_3 on main.
    { id:"dojo7_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["Beat my acolytes, then come back and show me you hold."] },
  ],
  signs: [],
  exits: [],
  doors: [
    { x:7, y:17, to:"ember_island", enterAt:{x:13, y:7}, label:"Ember Island" }
  ],
  events: [],
  encounters: []
};

export const DOJO_8: any = {
  name: "Dojo 8 — Return Dojo",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    // Syndicate boss lines verbatim from story-fill-region1.md Beat 7.
    // Team is owed by the trainer lane (ROSTER GAP) — no team invented.
    { id:"syndicate_boss", x:7, y:2, sprite:"🎩", name:"Syndicate Boss", facing:"down", dialog:["You have followed us across the whole Mainframe. Good. Now you will stop, here, in the town where you started."], postBattleDialog:["Take the last badge. Victory Route is open. The Plateau is waiting. Hex is already there."] },
  ],
  signs: [],
  exits: [],
  doors: [
    { x:7, y:17, to:"binary_fields", enterAt:{x:24, y:15}, label:"Silicon Town" }
  ],
  events: [],
  encounters: []
};

export const VICTORY_ROUTE: any = {
  name: "Victory Route — the Gauntlet",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
    { id:"victory_gate_keeper", x:14, y:20, sprite:"🏔️", name:"Victory Gate Keeper", facing:"down", dialog:["Eight badges. That is the gate, and it is the only gate. Walk it."] },
  ],
  signs: [
    { x:14, y:10, text:"VICTORY ROUTE\\nNorth to Mainframe Plateau. South to Silicon Town." },
  ],
  exits: [
    { x:14, y:0, to:"mainframe_plateau", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"binary_fields", enterAt:{x:14, y:1}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: [] // wild pool owed: trainer lane / roster expansion, not invented here
};

export const MAINFRAME_PLATEAU: any = {
  name: "Mainframe Plateau",
  music: "dojo_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x===13&&y===6) return TILE.DOOR;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"plateau_attendant", x:14, y:20, sprite:"🧑", name:"Plateau Attendant", facing:"down", dialog:["Victory Route is south. The Hall is here, when you have earned it."] },
    // Elite Four + Champion Hex battles are owed by the trainer lane
    // (NAME GAP for the four, ROSTER GAP teams). Their Region 1 lines
    // live in region1-dialogue.json (Beat 8) and are not duplicated
    // as map NPC dialog here.
  ],
  signs: [
    { x:14, y:14, text:"MAINFRAME PLATEAU\\nElite Four + Champion Hex. South to Victory Route." },
  ],
  exits: [
    { x:14, y:29, to:"victory_route", enterAt:{x:14, y:1}, dir:"down" },
    // After the Hall of Records flag, the road home: Hall flag itself
    // is owed in the story/engine pass.
    { x:14, y:0, to:"sector0", enterAt:{x:14, y:1}, dir:"up" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const DATA_ISLE_1: any = {
  name: "Data Isle 1",
  music: "water_theme",
  weather: "clear",
  width: 24, height: 24,
  playerStart: { x:12, y:23 },
  tiles: (() => {
    return buildMap(24, 24, (x, y) => {
      if (x===0||x===23||y===0||y===23) return TILE.WALL;
      if (x===12) return TILE.PATH;
      if (y===12) return TILE.PATH;
      if (y>=20) return TILE.DOCK;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"isle1_ferry", x:12, y:20, sprite:"⚓", name:"Ferry Captain", facing:"down", dialog:["Harbor City is back down the dock. The next isle is north."] },
  ],
  signs: [
    { x:12, y:12, text:"DATA ISLE 1\\nNorth to Data Isle 2. Dock to Harbor City." },
  ],
  exits: [
    { x:12, y:0, to:"data_isle_2", enterAt:{x:12, y:22}, dir:"up" },
    { x:12, y:23, to:"harbor_city", enterAt:{x:7, y:28}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const DATA_ISLE_2: any = {
  name: "Data Isle 2",
  music: "water_theme",
  weather: "clear",
  width: 24, height: 24,
  playerStart: { x:12, y:23 },
  tiles: (() => {
    return buildMap(24, 24, (x, y) => {
      if (x===0||x===23||y===0||y===23) return TILE.WALL;
      if (x===12) return TILE.PATH;
      if (y===12) return TILE.PATH;
      if (y>=20) return TILE.DOCK;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"isle2_ferry", x:12, y:20, sprite:"⚓", name:"Ferry Captain", facing:"down", dialog:["Harbor City is back down the dock. The next isle is north."] },
  ],
  signs: [
    { x:12, y:12, text:"DATA ISLE 2\\nNorth to Data Isle 3. Dock to Harbor City." },
  ],
  exits: [
    { x:12, y:0, to:"data_isle_3", enterAt:{x:12, y:22}, dir:"up" },
    { x:12, y:23, to:"harbor_city", enterAt:{x:7, y:28}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const DATA_ISLE_3: any = {
  name: "Data Isle 3",
  music: "water_theme",
  weather: "clear",
  width: 24, height: 24,
  playerStart: { x:12, y:23 },
  tiles: (() => {
    return buildMap(24, 24, (x, y) => {
      if (x===0||x===23||y===0||y===23) return TILE.WALL;
      if (x===12) return TILE.PATH;
      if (y===12) return TILE.PATH;
      if (y>=20) return TILE.DOCK;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"isle3_ferry", x:12, y:20, sprite:"⚓", name:"Ferry Captain", facing:"down", dialog:["Harbor City is back down the dock. The next isle is north."] },
  ],
  signs: [
    { x:12, y:12, text:"DATA ISLE 3\\nNorth to Data Isle 4. Dock to Harbor City." },
  ],
  exits: [
    { x:12, y:0, to:"data_isle_4", enterAt:{x:12, y:22}, dir:"up" },
    { x:12, y:23, to:"harbor_city", enterAt:{x:7, y:28}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const DATA_ISLE_4: any = {
  name: "Data Isle 4",
  music: "water_theme",
  weather: "clear",
  width: 24, height: 24,
  playerStart: { x:12, y:23 },
  tiles: (() => {
    return buildMap(24, 24, (x, y) => {
      if (x===0||x===23||y===0||y===23) return TILE.WALL;
      if (x===12) return TILE.PATH;
      if (y===12) return TILE.PATH;
      if (y>=20) return TILE.DOCK;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"isle4_ferry", x:12, y:20, sprite:"⚓", name:"Ferry Captain", facing:"down", dialog:["Harbor City is back down the dock. The next isle is north."] },
  ],
  signs: [
    { x:12, y:12, text:"DATA ISLE 4\\nNorth to Data Isle 5. Dock to Harbor City." },
  ],
  exits: [
    { x:12, y:0, to:"data_isle_5", enterAt:{x:12, y:22}, dir:"up" },
    { x:12, y:23, to:"harbor_city", enterAt:{x:7, y:28}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const DATA_ISLE_5: any = {
  name: "Data Isle 5",
  music: "water_theme",
  weather: "clear",
  width: 24, height: 24,
  playerStart: { x:12, y:23 },
  tiles: (() => {
    return buildMap(24, 24, (x, y) => {
      if (x===0||x===23||y===0||y===23) return TILE.WALL;
      if (x===12) return TILE.PATH;
      if (y===12) return TILE.PATH;
      if (y>=20) return TILE.DOCK;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"isle5_ferry", x:12, y:20, sprite:"⚓", name:"Ferry Captain", facing:"down", dialog:["Harbor City is back down the dock. The next isle is north."] },
  ],
  signs: [
    { x:12, y:12, text:"DATA ISLE 5\\nNorth to Data Isle 6. Dock to Harbor City." },
  ],
  exits: [
    { x:12, y:0, to:"data_isle_6", enterAt:{x:12, y:22}, dir:"up" },
    { x:12, y:23, to:"harbor_city", enterAt:{x:7, y:28}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const DATA_ISLE_6: any = {
  name: "Data Isle 6",
  music: "water_theme",
  weather: "clear",
  width: 24, height: 24,
  playerStart: { x:12, y:23 },
  tiles: (() => {
    return buildMap(24, 24, (x, y) => {
      if (x===0||x===23||y===0||y===23) return TILE.WALL;
      if (x===12) return TILE.PATH;
      if (y===12) return TILE.PATH;
      if (y>=20) return TILE.DOCK;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"isle6_ferry", x:12, y:20, sprite:"⚓", name:"Ferry Captain", facing:"down", dialog:["Harbor City is back down the dock. The next isle is north."] },
  ],
  signs: [
    { x:12, y:12, text:"DATA ISLE 6\\nNorth to Data Isle 7. Dock to Harbor City." },
  ],
  exits: [
    { x:12, y:0, to:"data_isle_7", enterAt:{x:12, y:22}, dir:"up" },
    { x:12, y:23, to:"harbor_city", enterAt:{x:7, y:28}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const DATA_ISLE_7: any = {
  name: "Data Isle 7",
  music: "water_theme",
  weather: "clear",
  width: 24, height: 24,
  playerStart: { x:12, y:23 },
  tiles: (() => {
    return buildMap(24, 24, (x, y) => {
      if (x===0||x===23||y===0||y===23) return TILE.WALL;
      if (x===12) return TILE.PATH;
      if (y===12) return TILE.PATH;
      if (y>=20) return TILE.DOCK;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"isle7_aeon", x:12, y:12, sprite:"🔬", name:"Prof. Aeon", facing:"down", dialog:["There. A second signal. A second Mainframe shard. The ferry can reach it, now that you cleared the isles. Take the ticket. Region 2 is waiting."] },
  ],
  signs: [
    { x:12, y:10, text:"DATA ISLE 7\\nNorth to Region 2 arrival. Dock to Harbor City." },
  ],
  exits: [
    { x:12, y:0, to:"region2_arrival", enterAt:{x:14, y:29}, dir:"up" },
    { x:12, y:23, to:"harbor_city", enterAt:{x:7, y:28}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

export const REGION2_ARRIVAL: any = {
  name: "Region 2 Arrival — Dawnfield",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    // Region 2 maps are wired now (regions2-5-maps PR, 2026-11-13): the
    // north edge leads to Dawnfield, the first Region 2 town.
    { id:"arrival_ferry", x:14, y:20, sprite:"⚓", name:"Ferry Captain", facing:"down", dialog:["Dawnfield. End of the ferry, start of the chapter."] },
  ],
  signs: [
    { x:14, y:14, text:"REGION 2 ARRIVAL\\nNorth to Dawnfield. The ferry docks here." },
  ],
  exits: [
    { x:14, y:0, to:"r2_dawnfield", enterAt:{x:14, y:28}, dir:"up" },
    { x:14, y:29, to:"data_isle_7", enterAt:{x:12, y:1}, dir:"down" }
  ],
  doors: [],
  events: [],
  encounters: []
};

// Region 2 — Twin / Return (2026-11-13, regions2-5-maps PR).
// Skeleton only: every dialogue mapKey in region2-dialogue.json now has a
// map (32 direct + 6 folded into r2_plateau), routes between towns, gates
// named, wild pools only where trainer rows ground them. Trainer teams
// and lines come from trainers-region2.ts / region2-dialogue.json —
// nothing is invented here. Town names that are verbatim Pokemon town
// names in the merged dialogue are NOT repeated as display names: those
// towns carry a labelled GAP FOR MARS placeholder and the dialogue entry
// id, so Mars can rename them in one pass (see docs audit).
export const R2_DAWNFIELD: any = {
  name: "Dawnfield — Region 2 Arrival",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x===13&&y===7) return TILE.DOOR;
      if (x===14&&y===7) return TILE.DOOR;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"ferry_captain", x:14, y:20, sprite:"⚓", name:"Ferry Captain", facing:"down", dialog:["Dawnfield. End of the ferry, start of the chapter.","Aeon sent word ahead. Your team is on the list, but the list opens badge by badge. Earn them.","The MochiiPlex here is small, but the heal is free, same as home. Rest before you walk."], inkStory:"region2-story", inkKnot:"r2_01_dawnfield" },
    { id:"dawnfield_researcher", x:10, y:20, sprite:"🧑‍🔬", name:"Dawnfield Researcher", facing:"down", dialog:["Aeon handed you to me by radio, so I will say it plain: this region remembers trainers.","Walk the opening road first. Do not skip to the tower. The tower notices skippers."] },
  ],
  signs: [
    { x:14, y:14, text:"DAWNFIELD\\nFirst stop after the ferry. MochiiPlex heal is free.\\nNorth: the opening road to Cherryport." },
  ],
  exits: [
    { x:14, y:0, to:"r2_route_1", enterAt:{x:14, y:39}, dir:"up" },
    { x:14, y:29, to:"region2_arrival", enterAt:{x:14, y:28}, dir:"down" },
  ],
  doors: [
    { x:13, y:7, to:"r2_mochiiplex_dawnfield", enterAt:{x:7, y:10}, label:"Dawnfield MochiiPlex" },
    { x:14, y:7, to:"r2_mochiiplex_dawnfield", enterAt:{x:8, y:10}, label:"Dawnfield MochiiPlex" },
  ],
  events: [],
  encounters: []
};

export const R2_MOCHIIPLEX_DAWNFIELD: any = {
  name: "Dawnfield MochiiPlex",
  music: "route1_theme",
  weather: "clear",
  interior: true,
  width: 15, height: 12,
  playerStart: { x:7, y:10 },
  tiles: (() => {
    return buildMap(15, 12, (x, y) => {
      if ((x===7||x===8)&&y===11) return TILE.DOOR;
      if (x===0||x===14||y===0||y===11) return TILE.WALL;
      if ((x===5||x===6)&&y===1) return TILE.HEAL_MACHINE;
      if ((x===11||x===12)&&y===1) return TILE.TERMINAL;
      if (y===1) return TILE.BUILDING;
      if (y===2&&x>=2&&x<=12) return TILE.COUNTER;
      if ((x===2||x===3||x===11||x===12)&&y===9) return TILE.BENCH;
      if ((x===1||x===13)&&y===10) return TILE.PLANT;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"healer_1", x:7, y:3, sprite:"👩‍⚕️", name:"Center Nurse", facing:"down", isHeal: true, dialog:["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
    { id:"shop_1", x:3, y:3, sprite:"🛒", name:"Clerk", facing:"down", isShop: true, dialog:["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."] },
    { id:"plex_waiting_trainer", x:11, y:7, sprite:"🧢", name:"Waiting Trainer", facing:"left", dialog:["PLACEHOLDER — waiting-trainer line GAP FOR MARS (no beats line for this NPC)."] },
  ],
  signs: [
    { x:4, y:2, text:"MOCHII CENTER\\nHealing is free — it is always free. Cubes and patches at the west end of the counter." },
  ],
  exits: [
  ],
  doors: [
    { x:7, y:11, to:"r2_dawnfield", enterAt:{x:13, y:8}, label:"Exit" },
    { x:8, y:11, to:"r2_dawnfield", enterAt:{x:14, y:8}, label:"Exit" },
  ],
  events: [],
  encounters: []
};

export const R2_ROUTE_1: any = {
  name: "Route R2-1 — Dawnfield Road",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
    { id:"r2_001_nia", x:10, y:15, sprite:"🚶", name:"Ferry Walker Nia", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-001; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-001)."], battle:{ team:[{id:"147",name:"Dorowani",hp:55,maxHp:55,atk:55,def:45,spd:45,moves:["Tackle","Swift Movement"],type:"Water",level:10}], reward:200, badge:null } },
    { id:"r2_002_pim", x:18, y:25, sprite:"🚶", name:"Ferry Walker Pim", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-002; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-002)."], battle:{ team:[{id:"150",name:"Gabu",hp:65,maxHp:65,atk:63,def:45,spd:45,moves:["Tackle","Swift Movement"],type:"Normal",level:10},{id:"016",name:"Squirmite",hp:30,maxHp:30,atk:35,def:30,spd:50,moves:["Tackle","Swift Movement"],type:"Bug",level:11}], reward:220, badge:null } },
  ],
  signs: [
    { x:14, y:10, text:"ROUTE R2-1 — DAWNFIELD ROAD\\nNorth to Cherryport. South to Dawnfield." },
  ],
  exits: [
    { x:14, y:0, to:"r2_cherryport", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"r2_dawnfield", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_CHERRYPORT: any = {
  name: "Cherryport — Opening Road",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"cherryport_road_keeper", x:14, y:20, sprite:"🚶", name:"Cherryport Road Keeper", facing:"down", dialog:["This is the opening road. First wilds, first trainers, nothing fancy — and that is the point.","If your team feels thin, catch here. The grass is kind to new arrivals."], inkStory:"region2-story", inkKnot:"r2_02_cherryport" },
    { id:"cherryport_fisher", x:10, y:20, sprite:"🎣", name:"Cherryport Fisher", facing:"down", dialog:["The water here is shallow. Wave-Ride is not needed yet. Walk the bank and watch the data.","A trainer who rushes past Cherryport misses the whole region. I have seen it happen."] },
    { id:"healer_cherryport", x:7, y:10, sprite:"👩‍⚕️", name:"Center Nurse", facing:"down", isHeal: true, dialog:["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
    { id:"shop_cherryport", x:22, y:10, sprite:"🛒", name:"Clerk", facing:"down", isShop: true, dialog:["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."] },
  ],
  signs: [
    { x:14, y:14, text:"CHERRYPORT\\nOpening road town. First wilds, first trainers.\\nNorth: the road to the Dojo 1 town (R2-03). South: Dawnfield." },
  ],
  exits: [
    { x:14, y:0, to:"r2_route_2", enterAt:{x:14, y:39}, dir:"up" },
    { x:14, y:29, to:"r2_route_1", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_ROUTE_2: any = {
  name: "Route R2-2 — Cherryport Road",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
    { id:"r2_003_oda", x:10, y:15, sprite:"🧢", name:"Route Trainer Oda", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-003; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-003)."], battle:{ team:[{id:"041",name:"Pixilite",hp:40,maxHp:40,atk:30,def:30,spd:70,moves:["Tackle","Swift Movement"],type:"Grass",level:12},{id:"147",name:"Dorowani",hp:55,maxHp:55,atk:55,def:45,spd:45,moves:["Tackle","Swift Movement"],type:"Water",level:12}], reward:260, badge:null } },
    { id:"r2_004_ren", x:18, y:25, sprite:"🧢", name:"Route Trainer Ren", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-004; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-004)."], battle:{ team:[{id:"019",name:"Zephling",hp:40,maxHp:40,atk:55,def:35,spd:60,moves:["Tackle","Swift Movement"],type:"Flying",level:13},{id:"150",name:"Gabu",hp:65,maxHp:65,atk:63,def:45,spd:45,moves:["Tackle","Swift Movement"],type:"Normal",level:13}], reward:280, badge:null } },
  ],
  signs: [
    { x:14, y:10, text:"ROUTE R2-2 — CHERRYPORT ROAD\\nNorth to the Dojo 1 town (R2-03). South to Cherryport." },
  ],
  exits: [
    { x:14, y:0, to:"r2_violet", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"r2_cherryport", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_VIOLET: any = {
  name: "R2 Dojo 1 Town — name GAP FOR MARS",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x===13&&y===7) return TILE.DOOR;
      if (x===14&&y===7) return TILE.DOOR;
      if (x===4&&y===7) return TILE.DOOR;
      if (x===5&&y===7) return TILE.DOOR;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"violet_town_elder", x:14, y:20, sprite:"🧓", name:"Town Elder", facing:"down", dialog:["The dojo is older. Respect both and the badge will not feel heavy."] },
    { id:"healer_violet", x:7, y:10, sprite:"👩‍⚕️", name:"Center Nurse", facing:"down", isHeal: true, dialog:["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
    { id:"shop_violet", x:22, y:10, sprite:"🛒", name:"Clerk", facing:"down", isShop: true, dialog:["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."] },
  ],
  signs: [
    { x:14, y:14, text:"R2-03 — DOJO 1 TOWN\\nName GAP FOR MARS (see region2-dialogue.json R2-03).\\nDojo 1 (Flora) is here. Tower puzzle: west door." },
  ],
  exits: [
    { x:14, y:0, to:"r2_route_3", enterAt:{x:14, y:39}, dir:"up" },
    { x:14, y:29, to:"r2_route_2", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
    { x:13, y:7, to:"r2_dojo_1", enterAt:{x:7, y:16}, label:"Dojo 1 — Flora Gate" },
    { x:14, y:7, to:"r2_dojo_1", enterAt:{x:7, y:16}, label:"Dojo 1 — Flora Gate" },
    { x:4, y:7, to:"r2_tower", enterAt:{x:9, y:18}, label:"Tower" },
    { x:5, y:7, to:"r2_tower", enterAt:{x:9, y:18}, label:"Tower" },
  ],
  events: [],
  encounters: []
};

export const R2_TOWER: any = {
  name: "Tower — Dojo 1 Puzzle",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 20, height: 20,
  playerStart: { x:9, y:18 },
  tiles: (() => {
    return buildMap(20, 20, (x, y) => {
      if (x===9&&y===19) return TILE.DOOR;
      if (x===0||x===19||y===0||y===19) return TILE.WALL;
      if (x===9||x===10) return TILE.PATH;
      if (y===10) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"tower_guide", x:9, y:10, sprite:"🗼", name:"Tower Guide", facing:"down", dialog:["The tower is a puzzle, not a wall. Each floor teaches you one thing. Do not climb angry.","The first beast was seen here. Seen, not caught. Remember the difference."], inkStory:"region2-story", inkKnot:"r2_03_violet" },
  ],
  signs: [
    { x:9, y:12, text:"TOWER\\nA puzzle, not a wall. Each floor teaches one thing.\\nUpper floors owed — no floor maps yet (flag r2_tower_puzzle)." },
  ],
  exits: [
  ],
  doors: [
    { x:9, y:19, to:"r2_violet", enterAt:{x:4, y:8}, label:"Dojo 1 Town" },
  ],
  events: [],
  encounters: []
};

// Dojo 1 — Flora Gate — Dojo theme Flora, badge Flora Fragment (trainer row R2-018). Leader is NAME GAP:
// present and dialogued, battle + badge award owed by the trainer
// wiring batch — not silently invented here (DOJO_3 precedent).
export const R2_DOJO_1: any = {
  name: "Dojo 1 — Flora Gate",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"r2_016_leaf", x:3, y:10, sprite:"🥋", name:"Acolyte Leaf", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-016; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-016)."], battle:{ team:[{id:"038",name:"Sproutle",hp:55,maxHp:55,atk:68,def:64,spd:31,moves:["Tackle","Swift Movement"],type:"Grass",level:14}], reward:400, badge:null } },
    { id:"r2_017_moss", x:11, y:10, sprite:"🥋", name:"Acolyte Moss", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-017; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-017)."], battle:{ team:[{id:"041",name:"Pixilite",hp:40,maxHp:40,atk:30,def:30,spd:70,moves:["Tackle","Swift Movement"],type:"Grass",level:15},{id:"038",name:"Sproutle",hp:55,maxHp:55,atk:68,def:64,spd:31,moves:["Tackle","Swift Movement"],type:"Grass",level:15}], reward:450, badge:null } },
    { id:"dojo_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["A tower stands because every stone knows its place. Show me you know yours."], inkStory:"region2-story", inkKnot:"r2_03_violet", postBattleDialog:["You know it. Take the first badge of this region. Your old team opens one slot wider now."] },
  ],
  signs: [
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_violet", enterAt:{x:13, y:8}, label:"Dojo 1 — Flora Gate" },
  ],
  events: [],
  encounters: []
};

export const R2_ROUTE_3: any = {
  name: "Route R2-3",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
  ],
  signs: [
    { x:14, y:10, text:"ROUTE R2-3\\nNorth to the Dojo 2 town (R2-04). South to the Dojo 1 town (R2-03)." },
  ],
  exits: [
    { x:14, y:0, to:"r2_azalea", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"r2_violet", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_AZALEA: any = {
  name: "R2 Dojo 2 Town — name GAP FOR MARS",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x===13&&y===7) return TILE.DOOR;
      if (x===14&&y===7) return TILE.DOOR;
      if (x===4&&y===7) return TILE.DOOR;
      if (x===5&&y===7) return TILE.DOOR;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"healer_azalea", x:7, y:10, sprite:"👩‍⚕️", name:"Center Nurse", facing:"down", isHeal: true, dialog:["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
    { id:"shop_azalea", x:22, y:10, sprite:"🛒", name:"Clerk", facing:"down", isShop: true, dialog:["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."] },
  ],
  signs: [
    { x:14, y:14, text:"R2-04 — DOJO 2 TOWN\\nName GAP FOR MARS (see region2-dialogue.json R2-04).\\nDojo 2 (Bug) is here. The well is west." },
  ],
  exits: [
    { x:14, y:0, to:"r2_route_4", enterAt:{x:14, y:39}, dir:"up" },
    { x:14, y:29, to:"r2_route_3", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
    { x:13, y:7, to:"r2_dojo_2", enterAt:{x:7, y:16}, label:"Dojo 2 — Bug Gate" },
    { x:14, y:7, to:"r2_dojo_2", enterAt:{x:7, y:16}, label:"Dojo 2 — Bug Gate" },
    { x:4, y:7, to:"r2_well", enterAt:{x:7, y:16}, label:"Well" },
    { x:5, y:7, to:"r2_well", enterAt:{x:7, y:16}, label:"Well" },
  ],
  events: [],
  encounters: []
};

export const R2_WELL: any = {
  name: "Well — Spring Rescue",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"well_keeper", x:7, y:8, sprite:"🪣", name:"Well Keeper", facing:"down", dialog:["The well is not dry. It is drained. Someone is taking the spring, one bucket at a time.","Go down. Bring the spring back. The town will remember who did it."], inkStory:"region2-story", inkKnot:"r2_04_azalea" },
    { id:"syndicate_well", x:7, y:4, sprite:"🕶️", name:"Syndicate Operative", facing:"down", dialog:["The spring flows where we say it flows. You are not on the list.","Fine. Battle me, then. The list does not change, but you can try."] },
  ],
  signs: [
    { x:7, y:12, text:"THE WELL\\nThe spring is drained, not dry. Someone is taking it." },
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_azalea", enterAt:{x:4, y:8}, label:"Dojo 2 Town" },
  ],
  events: [],
  encounters: []
};

// Dojo 2 — Bug Gate — Dojo theme Bug, badge Bug Fragment (trainer row R2-021). Leader is NAME GAP:
// present and dialogued, battle + badge award owed by the trainer
// wiring batch — not silently invented here (DOJO_3 precedent).
export const R2_DOJO_2: any = {
  name: "Dojo 2 — Bug Gate",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"r2_019_web", x:3, y:10, sprite:"🥋", name:"Acolyte Web", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-019; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-019)."], battle:{ team:[{id:"016",name:"Squirmite",hp:30,maxHp:30,atk:35,def:30,spd:50,moves:["Tackle","Swift Movement"],type:"Bug",level:18}], reward:500, badge:null } },
    { id:"r2_020_silk", x:11, y:10, sprite:"🥋", name:"Acolyte Silk", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-020; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-020)."], battle:{ team:[{id:"017",name:"Cocoonode",hp:50,maxHp:50,atk:20,def:55,spd:30,moves:["Tackle","Swift Movement"],type:"Bug",level:19},{id:"016",name:"Squirmite",hp:30,maxHp:30,atk:35,def:30,spd:50,moves:["Tackle","Swift Movement"],type:"Bug",level:19}], reward:550, badge:null } },
    { id:"dojo_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["You brought the spring back. Now bring a steady team. I test steadiness, not speed."], inkStory:"region2-story", inkKnot:"r2_04_azalea", postBattleDialog:["Steady. Take the second badge. Your old team opens another slot."] },
  ],
  signs: [
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_azalea", enterAt:{x:13, y:8}, label:"Dojo 2 — Bug Gate" },
  ],
  events: [],
  encounters: []
};

export const R2_ROUTE_4: any = {
  name: "Route R2-4",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
  ],
  signs: [
    { x:14, y:10, text:"ROUTE R2-4\\nNorth to the forest (R2-05). South to the Dojo 2 town (R2-04)." },
  ],
  exits: [
    { x:14, y:0, to:"r2_ilex_forest", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"r2_azalea", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_ILEX_FOREST: any = {
  name: "Forest — Shrine Maze",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if ((x===13||x===14)&&y===7) return TILE.DOOR;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      if ((x+y)%5===0) return TILE.FLOWER;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
    { id:"forest_wanderer", x:10, y:20, sprite:"🌲", name:"Forest Wanderer", facing:"down", dialog:["I got lost here three times. The fourth time, I stopped rushing, and the path found me.","Cut nothing here unless the path asks you to. Data-Cut is a tool, not a shortcut."] },
    { id:"r2_005_faye", x:8, y:18, sprite:"🌲", name:"Forest Walker Faye", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-005; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-005)."], battle:{ team:[{id:"017",name:"Cocoonode",hp:50,maxHp:50,atk:20,def:55,spd:30,moves:["Tackle","Swift Movement"],type:"Bug",level:20},{id:"041",name:"Pixilite",hp:40,maxHp:40,atk:30,def:30,spd:70,moves:["Tackle","Swift Movement"],type:"Grass",level:20}], reward:480, badge:null } },
    { id:"r2_006_lorn", x:22, y:18, sprite:"🧎", name:"Shrine Keeper Lorn", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-006; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-006)."], battle:{ team:[{id:"042",name:"Wispkin",hp:40,maxHp:40,atk:30,def:30,spd:70,moves:["Tackle","Swift Movement"],type:"Dark",level:21},{id:"018",name:"Mothrix",hp:60,maxHp:60,atk:45,def:50,spd:100,moves:["Tackle","Swift Movement"],type:"Bug",level:21}], reward:500, badge:null } },
  ],
  signs: [
    { x:14, y:14, text:"FOREST\\nA maze on purpose. The shrine is in the middle.\\nNorth: the road to the Dojo 3 city (R2-06). Shrine: north door." },
  ],
  exits: [
    { x:14, y:0, to:"r2_route_5", enterAt:{x:14, y:39}, dir:"up" },
    { x:14, y:29, to:"r2_route_4", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
    { x:13, y:7, to:"r2_shrine", enterAt:{x:7, y:14}, label:"Shrine" },
    { x:14, y:7, to:"r2_shrine", enterAt:{x:7, y:14}, label:"Shrine" },
  ],
  events: [],
  encounters: []
};

export const R2_SHRINE: any = {
  name: "Shrine — Forest Middle",
  music: "fields_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 16,
  playerStart: { x:7, y:14 },
  tiles: (() => {
    return buildMap(16, 16, (x, y) => {
      if (x===7&&y===15) return TILE.DOOR;
      if (x===0||x===15||y===0||y===15) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"forest_shrine_keeper", x:7, y:6, sprite:"⛩️", name:"Forest Shrine Keeper", facing:"down", dialog:["The forest is a maze on purpose. The shrine is in the middle, and the middle is quiet.","The second beast was seen at the shrine. It did not stay. Beasts do not stay for crowds."], inkStory:"region2-story", inkKnot:"r2_05_ilex_forest" },
  ],
  signs: [
    { x:7, y:10, text:"SHRINE\\nQuiet, in the middle of the maze. The second beast was seen here." },
  ],
  exits: [
  ],
  doors: [
    { x:7, y:15, to:"r2_ilex_forest", enterAt:{x:14, y:8}, label:"Forest" },
  ],
  events: [],
  encounters: []
};

export const R2_ROUTE_5: any = {
  name: "Route R2-5",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
  ],
  signs: [
    { x:14, y:10, text:"ROUTE R2-5\\nNorth to the Dojo 3 city (R2-06). South to the forest (R2-05)." },
  ],
  exits: [
    { x:14, y:0, to:"r2_goldenrod", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"r2_ilex_forest", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_GOLDENROD: any = {
  name: "R2 Dojo 3 City — name GAP FOR MARS",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x===13&&y===7) return TILE.DOOR;
      if (x===14&&y===7) return TILE.DOOR;
      if (x===4&&y===7) return TILE.DOOR;
      if (x===5&&y===7) return TILE.DOOR;
      if (x===22&&y===7) return TILE.DOOR;
      if (x===23&&y===7) return TILE.DOOR;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"market_clerk", x:10, y:20, sprite:"🛍️", name:"Market Clerk", facing:"down", dialog:["Big city, big market. The Garden branch here sells what Silicon Town cannot stock yet.","Do not buy everything. Buy what your team actually needs for the next road."] },
    { id:"healer_goldenrod", x:7, y:10, sprite:"👩‍⚕️", name:"Center Nurse", facing:"down", isHeal: true, dialog:["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
    { id:"shop_goldenrod", x:22, y:10, sprite:"🛒", name:"Clerk", facing:"down", isShop: true, dialog:["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."] },
  ],
  signs: [
    { x:14, y:14, text:"R2-06 — DOJO 3 CITY\\nName GAP FOR MARS (see region2-dialogue.json R2-06).\\nDojo 3 (Chrome) is here. Radio Tower: west. Garden branch: east." },
  ],
  exits: [
    { x:14, y:0, to:"r2_route_6", enterAt:{x:14, y:39}, dir:"up" },
    { x:14, y:29, to:"r2_route_5", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
    { x:13, y:7, to:"r2_dojo_3", enterAt:{x:7, y:16}, label:"Dojo 3 — Chrome Gate" },
    { x:14, y:7, to:"r2_dojo_3", enterAt:{x:7, y:16}, label:"Dojo 3 — Chrome Gate" },
    { x:4, y:7, to:"r2_radio_tower", enterAt:{x:7, y:16}, label:"Radio Tower" },
    { x:5, y:7, to:"r2_radio_tower", enterAt:{x:7, y:16}, label:"Radio Tower" },
    { x:22, y:7, to:"r2_garden_branch", enterAt:{x:7, y:14}, label:"Garden Branch" },
    { x:23, y:7, to:"r2_garden_branch", enterAt:{x:7, y:14}, label:"Garden Branch" },
  ],
  events: [],
  encounters: []
};

export const R2_RADIO_TOWER: any = {
  name: "Radio Tower",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"radio_tower_clerk", x:7, y:8, sprite:"📻", name:"Radio Tower Clerk", facing:"down", dialog:["The tower talks to the whole region. Right now it is talking too much, and listening too little.","Come back after the tower story. It will make sense then, and not before."], inkStory:"region2-story", inkKnot:"r2_06_goldenrod" },
    { id:"r2_007_dex", x:3, y:12, sprite:"📻", name:"Radio Runner Dex", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-007; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-007)."], battle:{ team:[{id:"032",name:"Gearkid",hp:40,maxHp:40,atk:55,def:70,spd:30,moves:["Tackle","Swift Movement"],type:"Chrome",level:28},{id:"026",name:"Inklet",hp:40,maxHp:40,atk:40,def:40,spd:50,moves:["Tackle","Swift Movement"],type:"Water",level:28}], reward:700, badge:null } },
    { id:"r2_008_vee", x:11, y:12, sprite:"📻", name:"Radio Runner Vee", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-008; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-008)."], battle:{ team:[{id:"033",name:"Mechapion",hp:60,maxHp:60,atk:75,def:95,spd:50,moves:["Tackle","Swift Movement"],type:"Chrome",level:29},{id:"019",name:"Zephling",hp:40,maxHp:40,atk:55,def:35,spd:60,moves:["Tackle","Swift Movement"],type:"Flying",level:29}], reward:720, badge:null } },
    { id:"syndicate_tower", x:7, y:4, sprite:"🕶️", name:"Syndicate Operative", facing:"down", dialog:["The tower is ours on paper. Paper is stronger than you think."] },
  ],
  signs: [
    { x:7, y:12, text:"RADIO TOWER\\nIt talks to the whole region. Right now it talks too much." },
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_goldenrod", enterAt:{x:4, y:8}, label:"Dojo 3 City" },
  ],
  events: [],
  encounters: []
};

export const R2_GARDEN_BRANCH: any = {
  name: "Garden Branch",
  music: "fields_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 16,
  playerStart: { x:7, y:14 },
  tiles: (() => {
    return buildMap(16, 16, (x, y) => {
      if (x===7&&y===15) return TILE.DOOR;
      if (x===0||x===15||y===0||y===15) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"garden_clerk", x:7, y:6, sprite:"🌱", name:"Garden Clerk", facing:"down", dialog:["PLACEHOLDER — Garden branch line GAP FOR MARS (stock list owed; see master §11.5)."] },
  ],
  signs: [
    { x:7, y:10, text:"GARDEN BRANCH\\nSells what Silicon Town cannot stock yet. Stock list GAP FOR MARS." },
  ],
  exits: [
  ],
  doors: [
    { x:7, y:15, to:"r2_goldenrod", enterAt:{x:22, y:8}, label:"Dojo 3 City" },
  ],
  events: [],
  encounters: []
};

// Dojo 3 — Chrome Gate — Dojo theme Chrome, badge Chrome Fragment (trainer row R2-024). Leader is NAME GAP:
// present and dialogued, battle + badge award owed by the trainer
// wiring batch — not silently invented here (DOJO_3 precedent).
export const R2_DOJO_3: any = {
  name: "Dojo 3 — Chrome Gate",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"r2_022_wire", x:3, y:10, sprite:"🥋", name:"Acolyte Wire", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-022; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-022)."], battle:{ team:[{id:"032",name:"Gearkid",hp:40,maxHp:40,atk:55,def:70,spd:30,moves:["Tackle","Swift Movement"],type:"Chrome",level:25}], reward:650, badge:null } },
    { id:"r2_023_bolt", x:11, y:10, sprite:"🥋", name:"Acolyte Bolt", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-023; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-023)."], battle:{ team:[{id:"033",name:"Mechapion",hp:60,maxHp:60,atk:75,def:95,spd:50,moves:["Tackle","Swift Movement"],type:"Chrome",level:26},{id:"004",name:"Razorgater",hp:50,maxHp:50,atk:65,def:64,spd:43,moves:["Tackle","Swift Movement"],type:"Water",level:26}], reward:700, badge:null } },
    { id:"dojo_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["A big city dojo is not a big dojo. It is a dojo that has to be exact, because everyone is watching."], inkStory:"region2-story", inkKnot:"r2_06_goldenrod", postBattleDialog:["Exact. Take the third badge. Your old team opens another slot."] },
  ],
  signs: [
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_goldenrod", enterAt:{x:13, y:8}, label:"Dojo 3 — Chrome Gate" },
  ],
  events: [],
  encounters: []
};

export const R2_ROUTE_6: any = {
  name: "Route R2-6",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
  ],
  signs: [
    { x:14, y:10, text:"ROUTE R2-6\\nNorth to the Dojo 4 town (R2-07). South to the Dojo 3 city (R2-06)." },
  ],
  exits: [
    { x:14, y:0, to:"r2_ecruteak", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"r2_goldenrod", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_ECRUTEAK: any = {
  name: "R2 Dojo 4 Town — name GAP FOR MARS",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x===13&&y===7) return TILE.DOOR;
      if (x===14&&y===7) return TILE.DOOR;
      if (x===4&&y===7) return TILE.DOOR;
      if (x===5&&y===7) return TILE.DOOR;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"ecruteak_elder", x:14, y:20, sprite:"🧓", name:"Town Elder", facing:"down", dialog:["This city remembers fire. It also remembers the trainers who walked out of the fire calm."] },
    { id:"healer_ecruteak", x:7, y:10, sprite:"👩‍⚕️", name:"Center Nurse", facing:"down", isHeal: true, dialog:["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
    { id:"shop_ecruteak", x:22, y:10, sprite:"🛒", name:"Clerk", facing:"down", isShop: true, dialog:["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."] },
  ],
  signs: [
    { x:14, y:14, text:"R2-07 — DOJO 4 TOWN\\nName GAP FOR MARS (see region2-dialogue.json R2-07).\\nDojo 4 (Umbral) is here. Burned Tower: west door." },
  ],
  exits: [
    { x:14, y:0, to:"r2_route_7", enterAt:{x:14, y:39}, dir:"up" },
    { x:14, y:29, to:"r2_route_6", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
    { x:13, y:7, to:"r2_dojo_4", enterAt:{x:7, y:16}, label:"Dojo 4 — Umbral Gate" },
    { x:14, y:7, to:"r2_dojo_4", enterAt:{x:7, y:16}, label:"Dojo 4 — Umbral Gate" },
    { x:4, y:7, to:"r2_burned_tower", enterAt:{x:9, y:18}, label:"Burned Tower" },
    { x:5, y:7, to:"r2_burned_tower", enterAt:{x:9, y:18}, label:"Burned Tower" },
  ],
  events: [],
  encounters: []
};

export const R2_BURNED_TOWER: any = {
  name: "Burned Tower",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 20, height: 20,
  playerStart: { x:9, y:18 },
  tiles: (() => {
    return buildMap(20, 20, (x, y) => {
      if (x===9&&y===19) return TILE.DOOR;
      if (x===0||x===19||y===0||y===19) return TILE.WALL;
      if (x===9||x===10) return TILE.PATH;
      if (y===10) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"burned_tower_keeper", x:9, y:10, sprite:"🔥", name:"Burned Tower Keeper", facing:"down", dialog:["The tower burned, and the beasts woke in the smoke. They are not yours to catch yet.","They are yours to follow. Follow, do not chase. Chasing scares a beast into the next region."], inkStory:"region2-story", inkKnot:"r2_07_ecruteak" },
  ],
  signs: [
    { x:9, y:12, text:"BURNED TOWER\\nIt burned, and the beasts woke in the smoke.\\nBeasts: follow, do not chase (flag r2_beasts_wake)." },
  ],
  exits: [
  ],
  doors: [
    { x:9, y:19, to:"r2_ecruteak", enterAt:{x:4, y:8}, label:"Dojo 4 Town" },
  ],
  events: [],
  encounters: []
};

// Dojo 4 — Umbral Gate — Dojo theme Umbral, badge Umbral Fragment (trainer row R2-027). Leader is NAME GAP:
// present and dialogued, battle + badge award owed by the trainer
// wiring batch — not silently invented here (DOJO_3 precedent).
export const R2_DOJO_4: any = {
  name: "Dojo 4 — Umbral Gate",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"r2_025_ember", x:3, y:10, sprite:"🥋", name:"Acolyte Ember", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-025; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-025)."], battle:{ team:[{id:"042",name:"Wispkin",hp:40,maxHp:40,atk:30,def:30,spd:70,moves:["Tackle","Swift Movement"],type:"Dark",level:31}], reward:800, badge:null } },
    { id:"r2_026_night", x:11, y:10, sprite:"🥋", name:"Acolyte Night", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-026; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-026)."], battle:{ team:[{id:"043",name:"Duskfiend",hp:60,maxHp:60,atk:60,def:60,spd:100,moves:["Tackle","Swift Movement"],type:"Dark",level:32},{id:"026",name:"Inklet",hp:40,maxHp:40,atk:40,def:40,spd:50,moves:["Tackle","Swift Movement"],type:"Water",level:32}], reward:850, badge:null } },
    { id:"dojo_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["Fire teaches, if you let it. Show me what the tower taught you."], inkStory:"region2-story", inkKnot:"r2_07_ecruteak", postBattleDialog:["You learned. Take the fourth badge. Your old team opens another slot."] },
  ],
  signs: [
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_ecruteak", enterAt:{x:13, y:8}, label:"Dojo 4 — Umbral Gate" },
  ],
  events: [],
  encounters: []
};

export const R2_ROUTE_7: any = {
  name: "Route R2-7",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
  ],
  signs: [
    { x:14, y:10, text:"ROUTE R2-7\\nNorth to the Dojo 5 town (R2-08). South to the Dojo 4 town (R2-07)." },
  ],
  exits: [
    { x:14, y:0, to:"r2_olivine", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"r2_ecruteak", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_OLIVINE: any = {
  name: "R2 Dojo 5 Town — name GAP FOR MARS",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x===13&&y===7) return TILE.DOOR;
      if (x===14&&y===7) return TILE.DOOR;
      if (x===4&&y===7) return TILE.DOOR;
      if (x===5&&y===7) return TILE.DOOR;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"olivine_harbour_keeper", x:14, y:20, sprite:"⚓", name:"Harbour Keeper", facing:"down", dialog:["Wave-Ride works here, same as Region 1. Water is a road, if you respect it. Do not surf angry."] },
    { id:"healer_olivine", x:7, y:10, sprite:"👩‍⚕️", name:"Center Nurse", facing:"down", isHeal: true, dialog:["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
    { id:"shop_olivine", x:22, y:10, sprite:"🛒", name:"Clerk", facing:"down", isShop: true, dialog:["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."] },
  ],
  signs: [
    { x:14, y:14, text:"R2-08 — DOJO 5 TOWN\\nName GAP FOR MARS (see region2-dialogue.json R2-08).\\nDojo 5 (Water) is here. Lighthouse: west. Sea road east needs Wave-Ride." },
  ],
  exits: [
    { x:14, y:29, to:"r2_route_7", enterAt:{x:14, y:1}, dir:"down" },
    { x:29, y:15, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
    { x:29, y:16, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
    { x:29, y:17, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
    { x:29, y:18, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
    { x:29, y:19, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
    { x:29, y:20, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
    { x:29, y:21, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
    { x:29, y:22, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
    { x:29, y:23, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
    { x:29, y:24, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
    { x:29, y:25, to:"r2_sea_road", enterAt:{x:1, y:20}, dir:"right", hmNeeded:"Wave" },
  ],
  doors: [
    { x:13, y:7, to:"r2_dojo_5", enterAt:{x:7, y:16}, label:"Dojo 5 — Water Gate" },
    { x:14, y:7, to:"r2_dojo_5", enterAt:{x:7, y:16}, label:"Dojo 5 — Water Gate" },
    { x:4, y:7, to:"r2_lighthouse", enterAt:{x:7, y:16}, label:"Lighthouse" },
    { x:5, y:7, to:"r2_lighthouse", enterAt:{x:7, y:16}, label:"Lighthouse" },
  ],
  events: [],
  encounters: []
};

export const R2_LIGHTHOUSE: any = {
  name: "Lighthouse",
  music: "fields_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"lighthouse_keeper", x:7, y:8, sprite:"🔦", name:"Lighthouse Keeper", facing:"down", dialog:["The light is not for ships. It is for trainers who have forgotten where the shore is.","Keep the light, and I will keep the sea road open for you. That is the deal, and it is fair."], inkStory:"region2-story", inkKnot:"r2_08_olivine" },
  ],
  signs: [
    { x:7, y:12, text:"LIGHTHOUSE\\nThe light is not for ships. It is for trainers who forgot where the shore is." },
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_olivine", enterAt:{x:4, y:8}, label:"Dojo 5 Town" },
  ],
  events: [],
  encounters: []
};

// Dojo 5 — Water Gate — Dojo theme Water, badge Water Fragment (trainer row R2-030). Leader is NAME GAP:
// present and dialogued, battle + badge award owed by the trainer
// wiring batch — not silently invented here (DOJO_3 precedent).
export const R2_DOJO_5: any = {
  name: "Dojo 5 — Water Gate",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"r2_028_foam", x:3, y:10, sprite:"🥋", name:"Acolyte Foam", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-028; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-028)."], battle:{ team:[{id:"022",name:"Finblade",hp:45,maxHp:45,atk:70,def:50,spd:70,moves:["Tackle","Swift Movement"],type:"Chrome",level:37}], reward:950, badge:null } },
    { id:"r2_029_wave", x:11, y:10, sprite:"🥋", name:"Acolyte Wave", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-029; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-029)."], battle:{ team:[{id:"023",name:"Megalochrome",hp:70,maxHp:70,atk:115,def:80,spd:100,moves:["Tackle","Swift Movement"],type:"Chrome",level:38},{id:"001",name:"Mochii",hp:45,maxHp:45,atk:49,def:49,spd:45,moves:["Tackle","Swift Movement"],type:"Water",level:38}], reward:1000, badge:null } },
    { id:"dojo_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["A lighthouse keeper's dojo is a dojo of patience. Wait for the right move, then take it."], inkStory:"region2-story", inkKnot:"r2_08_olivine", postBattleDialog:["Patient. Take the fifth badge. Your old team opens another slot."] },
  ],
  signs: [
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_olivine", enterAt:{x:13, y:8}, label:"Dojo 5 — Water Gate" },
  ],
  events: [],
  encounters: []
};

export const R2_SEA_ROAD: any = {
  name: "Sea Road — Wave Crossing",
  music: "water_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:1, y:20 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if ((x===0||x===27)&&y!==20) return TILE.WALL;
      if (y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16&&y>=18&&y<=22) return TILE.DOCK;
      return TILE.WATER;
    });
  })(),
  npcs: [
  ],
  signs: [
    { x:14, y:20, text:"SEA ROAD\\nWave-Ride crossing. West: the Dojo 5 town (R2-08). East: the Dojo 6 town (R2-09)." },
  ],
  exits: [
    { x:0, y:20, to:"r2_olivine", enterAt:{x:28, y:20}, dir:"left" },
    { x:27, y:20, to:"r2_cianwood", enterAt:{x:1, y:20}, dir:"right" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_CIANWOOD: any = {
  name: "R2 Dojo 6 Town — name GAP FOR MARS",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x===13&&y===7) return TILE.DOOR;
      if (x===14&&y===7) return TILE.DOOR;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"medicine_keeper", x:14, y:20, sprite:"💊", name:"Medicine Keeper", facing:"down", dialog:["The medicine is not magic. It is care, measured out, one dose at a time. Bring it to the island dojo, and bring it whole.","The water crossing is short. The lesson is long. Do not mix them up."], inkStory:"region2-story", inkKnot:"r2_09_cianwood" },
    { id:"healer_cianwood", x:7, y:10, sprite:"👩‍⚕️", name:"Center Nurse", facing:"down", isHeal: true, dialog:["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
    { id:"shop_cianwood", x:22, y:10, sprite:"🛒", name:"Clerk", facing:"down", isShop: true, dialog:["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."] },
  ],
  signs: [
    { x:14, y:14, text:"R2-09 — DOJO 6 TOWN\\nName GAP FOR MARS (see region2-dialogue.json R2-09).\\nDojo 6 (Strike) is here. Medicine keeper: ask about the island dojo." },
  ],
  exits: [
    { x:14, y:0, to:"r2_route_8", enterAt:{x:14, y:39}, dir:"up" },
    { x:0, y:15, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
    { x:0, y:16, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
    { x:0, y:17, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
    { x:0, y:18, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
    { x:0, y:19, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
    { x:0, y:20, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
    { x:0, y:21, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
    { x:0, y:22, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
    { x:0, y:23, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
    { x:0, y:24, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
    { x:0, y:25, to:"r2_sea_road", enterAt:{x:26, y:20}, dir:"left", hmNeeded:"Wave" },
  ],
  doors: [
    { x:13, y:7, to:"r2_dojo_6", enterAt:{x:7, y:16}, label:"Dojo 6 — Strike Gate" },
    { x:14, y:7, to:"r2_dojo_6", enterAt:{x:7, y:16}, label:"Dojo 6 — Strike Gate" },
  ],
  events: [],
  encounters: []
};

// Dojo 6 — Strike Gate — Dojo theme Strike, badge Strike Fragment (trainer row R2-033). Leader is NAME GAP:
// present and dialogued, battle + badge award owed by the trainer
// wiring batch — not silently invented here (DOJO_3 precedent).
export const R2_DOJO_6: any = {
  name: "Dojo 6 — Strike Gate",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"r2_031_fist", x:3, y:10, sprite:"🥋", name:"Acolyte Fist", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-031; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-031)."], battle:{ team:[{id:"029",name:"Punchkid",hp:50,maxHp:50,atk:70,def:50,spd:60,moves:["Tackle","Swift Movement"],type:"Rock",level:41}], reward:1050, badge:null } },
    { id:"r2_032_spar", x:11, y:10, sprite:"🥋", name:"Acolyte Spar", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-032; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-032)."], battle:{ team:[{id:"030",name:"Strikechamp",hp:70,maxHp:70,atk:110,def:70,spd:80,moves:["Tackle","Swift Movement"],type:"Rock",level:42},{id:"029",name:"Punchkid",hp:50,maxHp:50,atk:70,def:50,spd:60,moves:["Tackle","Swift Movement"],type:"Rock",level:42}], reward:1100, badge:null } },
    { id:"dojo_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["You crossed water to get here. Now cross the gap between a good team and a cared-for team."], inkStory:"region2-story", inkKnot:"r2_09_cianwood", postBattleDialog:["Cared for. Take the sixth badge. Your old team opens another slot."] },
  ],
  signs: [
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_cianwood", enterAt:{x:13, y:8}, label:"Dojo 6 — Strike Gate" },
  ],
  events: [],
  encounters: []
};

export const R2_ROUTE_8: any = {
  name: "Route R2-8",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
  ],
  signs: [
    { x:14, y:10, text:"ROUTE R2-8\\nNorth to the Dojo 7 town (R2-10). South to the Dojo 6 town (R2-09)." },
  ],
  exits: [
    { x:14, y:0, to:"r2_mahogany", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"r2_cianwood", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_MAHOGANY: any = {
  name: "R2 Dojo 7 Town — name GAP FOR MARS",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x===13&&y===7) return TILE.DOOR;
      if (x===14&&y===7) return TILE.DOOR;
      if (x===4&&y===7) return TILE.DOOR;
      if (x===5&&y===7) return TILE.DOOR;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"healer_mahogany", x:7, y:10, sprite:"👩‍⚕️", name:"Center Nurse", facing:"down", isHeal: true, dialog:["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
    { id:"shop_mahogany", x:22, y:10, sprite:"🛒", name:"Clerk", facing:"down", isShop: true, dialog:["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."] },
  ],
  signs: [
    { x:14, y:14, text:"R2-10 — DOJO 7 TOWN\\nName GAP FOR MARS (see region2-dialogue.json R2-10).\\nDojo 7 (Flame) is here. Lake: north. Hideout: west, under the town." },
  ],
  exits: [
    { x:14, y:0, to:"r2_lake", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:29, to:"r2_route_8", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
    { x:13, y:7, to:"r2_dojo_7", enterAt:{x:7, y:16}, label:"Dojo 7 — Flame Gate" },
    { x:14, y:7, to:"r2_dojo_7", enterAt:{x:7, y:16}, label:"Dojo 7 — Flame Gate" },
    { x:4, y:7, to:"r2_hideout", enterAt:{x:9, y:18}, label:"Hideout" },
    { x:5, y:7, to:"r2_hideout", enterAt:{x:9, y:18}, label:"Hideout" },
  ],
  events: [],
  encounters: []
};

export const R2_LAKE: any = {
  name: "Lake — R2-10 Waters",
  music: "water_theme",
  weather: "clear",
  width: 28, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(28, 30, (x, y) => {
      if (x===0||x===27||y===0||y===29) return TILE.WALL;
      if (y>=26) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.WATER;
    });
  })(),
  npcs: [
    { id:"lake_watcher", x:14, y:27, sprite:"🎣", name:"Lake Watcher", facing:"down", dialog:["The lake is angry. Something red is in it, and it is not red by nature. Someone made it red.","The hideout is under the town. Raid it, and the lake calms. Do not raid it angry — raid it steady."], inkStory:"region2-story", inkKnot:"r2_10_mahogany" },
    { id:"r2_009_bryn", x:10, y:27, sprite:"🎣", name:"Lake Watcher Bryn", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-009; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-009)."], battle:{ team:[{id:"028",name:"Krakenox",hp:85,maxHp:85,atk:85,def:85,spd:90,moves:["Tackle","Swift Movement"],type:"Water",level:44},{id:"024",name:"Floatcalf",hp:80,maxHp:80,atk:40,def:45,spd:40,moves:["Tackle","Swift Movement"],type:"Water",level:44}], reward:1100, badge:null } },
  ],
  signs: [
    { x:18, y:27, text:"THE LAKE\\nSomething red is in it, and it is not red by nature." },
  ],
  exits: [
    { x:14, y:29, to:"r2_mahogany", enterAt:{x:14, y:1}, dir:"down" },
    { x:14, y:0, to:"r2_route_9", enterAt:{x:14, y:39}, dir:"up" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_HIDEOUT: any = {
  name: "Hideout — Under the Town",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 20, height: 20,
  playerStart: { x:9, y:18 },
  tiles: (() => {
    return buildMap(20, 20, (x, y) => {
      if (x===9&&y===19) return TILE.DOOR;
      if (x===0||x===19||y===0||y===19) return TILE.WALL;
      if (x===9||x===10) return TILE.PATH;
      if (y===10) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"r2_010_kest", x:6, y:10, sprite:"🕶️", name:"Syndicate Operative Kest", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-010; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-010)."], battle:{ team:[{id:"027",name:"Toxitacle",hp:60,maxHp:60,atk:60,def:60,spd:70,moves:["Tackle","Swift Movement"],type:"Water",level:45},{id:"008",name:"Duneclaw",hp:60,maxHp:60,atk:75,def:55,spd:65,moves:["Tackle","Swift Movement"],type:"Earth",level:45}], reward:1150, badge:null } },
    { id:"r2_011_nyx", x:13, y:10, sprite:"🕶️", name:"Syndicate Operative Nyx", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-011; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-011)."], battle:{ team:[{id:"043",name:"Duskfiend",hp:60,maxHp:60,atk:60,def:60,spd:100,moves:["Tackle","Swift Movement"],type:"Dark",level:46},{id:"006",name:"Reaperdile",hp:85,maxHp:85,atk:105,def:100,spd:78,moves:["Tackle","Swift Movement"],type:"Chrome",level:46}], reward:1200, badge:null } },
    { id:"syndicate_hideout_leader", x:9, y:4, sprite:"🕶️", name:"Syndicate Hideout Leader", facing:"down", dialog:["The lake is a battery. We charge it, we use it. You are not part of the circuit."] },
  ],
  signs: [
    { x:9, y:12, text:"HIDEOUT\\nThe lake is a battery. We charge it, we use it." },
  ],
  exits: [
  ],
  doors: [
    { x:9, y:19, to:"r2_mahogany", enterAt:{x:4, y:8}, label:"Dojo 7 Town" },
  ],
  events: [],
  encounters: []
};

// Dojo 7 — Flame Gate — Dojo theme Flame, badge Flame Fragment (trainer row R2-036). Leader is NAME GAP:
// present and dialogued, battle + badge award owed by the trainer
// wiring batch — not silently invented here (DOJO_3 precedent).
export const R2_DOJO_7: any = {
  name: "Dojo 7 — Flame Gate",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"r2_034_kindling", x:3, y:10, sprite:"🥋", name:"Acolyte Kindling", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-034; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-034)."], battle:{ team:[{id:"011",name:"Pyropaw",hp:60,maxHp:60,atk:65,def:55,spd:90,moves:["Tackle","Swift Movement"],type:"Flame",level:46}], reward:1150, badge:null } },
    { id:"r2_035_flare", x:11, y:10, sprite:"🥋", name:"Acolyte Flare", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-035; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-035)."], battle:{ team:[{id:"044",name:"Ashemit",hp:40,maxHp:40,atk:50,def:40,spd:60,moves:["Tackle","Swift Movement"],type:"Flame",level:47},{id:"011",name:"Pyropaw",hp:60,maxHp:60,atk:65,def:55,spd:90,moves:["Tackle","Swift Movement"],type:"Flame",level:47}], reward:1200, badge:null } },
    { id:"dojo_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["You calmed a lake. Now calm a dojo. Same skill, smaller water."], inkStory:"region2-story", inkKnot:"r2_10_mahogany", postBattleDialog:["Calm. Take the seventh badge. Your old team opens another slot."] },
  ],
  signs: [
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_mahogany", enterAt:{x:13, y:8}, label:"Dojo 7 — Flame Gate" },
  ],
  events: [],
  encounters: []
};

export const R2_ROUTE_9: any = {
  name: "Route R2-9",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
  ],
  signs: [
    { x:14, y:10, text:"ROUTE R2-9\\nNorth to the Dojo 8 town (R2-11). South to the lake (R2-10)." },
  ],
  exits: [
    { x:14, y:0, to:"r2_blackthorn", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"r2_lake", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_BLACKTHORN: any = {
  name: "R2 Dojo 8 Town — name GAP FOR MARS",
  music: "fields_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x===13&&y===7) return TILE.DOOR;
      if (x===14&&y===7) return TILE.DOOR;
      if (x===4&&y===7) return TILE.DOOR;
      if (x===5&&y===7) return TILE.DOOR;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"healer_blackthorn", x:7, y:10, sprite:"👩‍⚕️", name:"Center Nurse", facing:"down", isHeal: true, dialog:["Welcome to the MochiiPlex. Your team is tired? Rest here. It is free, and it is always free."] },
    { id:"shop_blackthorn", x:22, y:10, sprite:"🛒", name:"Clerk", facing:"down", isShop: true, dialog:["Capture Cubes, Mend Patches, and a few Data Cards. Come back when you have more CR — the good stock comes with the badges."] },
  ],
  signs: [
    { x:14, y:14, text:"R2-11 — DOJO 8 TOWN\\nName GAP FOR MARS (see region2-dialogue.json R2-11).\\nDojo 8 (Mythic) is here. The den: west." },
  ],
  exits: [
    { x:14, y:0, to:"r2_victory_route", enterAt:{x:14, y:39}, dir:"up", condition:"badges>=16" },
    { x:14, y:29, to:"r2_route_9", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
    { x:13, y:7, to:"r2_dojo_8", enterAt:{x:7, y:16}, label:"Dojo 8 — Mythic Gate" },
    { x:14, y:7, to:"r2_dojo_8", enterAt:{x:7, y:16}, label:"Dojo 8 — Mythic Gate" },
    { x:4, y:7, to:"r2_den", enterAt:{x:9, y:18}, label:"Den" },
    { x:5, y:7, to:"r2_den", enterAt:{x:9, y:18}, label:"Den" },
  ],
  events: [],
  encounters: []
};

export const R2_DEN: any = {
  name: "Den — Dragon Trial",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 20, height: 20,
  playerStart: { x:9, y:18 },
  tiles: (() => {
    return buildMap(20, 20, (x, y) => {
      if (x===9&&y===19) return TILE.DOOR;
      if (x===0||x===19||y===0||y===19) return TILE.WALL;
      if (x===9||x===10) return TILE.PATH;
      if (y===10) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"den_elder", x:9, y:10, sprite:"🐉", name:"Den Elder", facing:"down", dialog:["The den is a trial, not a test. A test asks what you know. A trial asks who you are.","Walk the den. If you come out, the badge is already yours. The battle just confirms it."], inkStory:"region2-story", inkKnot:"r2_11_blackthorn" },
  ],
  signs: [
    { x:9, y:12, text:"THE DEN\\nA trial, not a test. Walk it. If you come out, the badge is already yours." },
  ],
  exits: [
  ],
  doors: [
    { x:9, y:19, to:"r2_blackthorn", enterAt:{x:4, y:8}, label:"Dojo 8 Town" },
  ],
  events: [],
  encounters: []
};

// Dojo 8 — Mythic Gate — Dojo theme Mythic, badge Mythic Fragment (trainer row R2-039). Leader is NAME GAP:
// present and dialogued, battle + badge award owed by the trainer
// wiring batch — not silently invented here (DOJO_3 precedent).
export const R2_DOJO_8: any = {
  name: "Dojo 8 — Mythic Gate",
  music: "dojo_theme",
  weather: "clear",
  interior: true,
  width: 16, height: 18,
  playerStart: { x:7, y:16 },
  tiles: (() => {
    return buildMap(16, 18, (x, y) => {
      if (x===7&&y===17) return TILE.DOOR;
      if (x===0||x===15||y===0||y===17) return TILE.WALL;
      return TILE.PATH;
    });
  })(),
  npcs: [
    { id:"r2_037_myth", x:3, y:10, sprite:"🥋", name:"Acolyte Myth", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-037; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-037)."], battle:{ team:[{id:"002",name:"Tiidebiite",hp:59,maxHp:59,atk:63,def:80,spd:58,moves:["Tackle","Swift Movement"],type:"Water",level:52}], reward:1250, badge:null } },
    { id:"r2_038_legend", x:11, y:10, sprite:"🥋", name:"Acolyte Legend", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-038; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-038)."], battle:{ team:[{id:"044",name:"Ashemit",hp:40,maxHp:40,atk:50,def:40,spd:60,moves:["Tackle","Swift Movement"],type:"Flame",level:53},{id:"002",name:"Tiidebiite",hp:59,maxHp:59,atk:63,def:80,spd:58,moves:["Tackle","Swift Movement"],type:"Water",level:53}], reward:1300, badge:null } },
    { id:"dojo_leader", x:7, y:2, sprite:"🥋", name:"Dojo Leader", facing:"down", dialog:["You walked the den. Now stand in it. Show me the trainer the den saw."], inkStory:"region2-story", inkKnot:"r2_11_blackthorn", postBattleDialog:["The den saw you. Take the eighth badge. Your old team is fully open now."] },
  ],
  signs: [
  ],
  exits: [
  ],
  doors: [
    { x:7, y:17, to:"r2_blackthorn", enterAt:{x:13, y:8}, label:"Dojo 8 — Mythic Gate" },
  ],
  events: [],
  encounters: []
};

export const R2_VICTORY_ROUTE: any = {
  name: "Victory Route — Region 2 Gauntlet",
  music: "route1_theme",
  weather: "clear",
  width: 28, height: 40,
  playerStart: { x:14, y:39 },
  tiles: (() => {
    return buildMap(28, 40, (x, y) => {
      if (x===0||x===27||y===0||y===39) return TILE.WALL;
      if (x>=12&&x<=16) return TILE.PATH;
      if (y>=18&&y<=20) return TILE.PATH;
      return TILE.TALL_GRASS;
    });
  })(),
  npcs: [
    { id:"victory_gate_keeper", x:14, y:20, sprite:"🏔️", name:"Victory Gate Keeper", facing:"down", dialog:["Eight badges. That is the gate, and it is the only gate. Walk it. Do not run it — run it and you will miss the trainers who teach you."], inkStory:"region2-story", inkKnot:"r2_12_victory_route" },
    { id:"r2_012_taro", x:10, y:15, sprite:"🎖️", name:"Veteran Taro", facing:"down", dialog:["I have walked this route in Region 1 and here. The route remembers. Show me you do too."], postBattleDialog:["You remember. Good. The Plateau is next, and it remembers more."], battle:{ team:[{id:"009",name:"Oblivirex",hp:80,maxHp:80,atk:100,def:80,spd:85,moves:["Tackle","Swift Movement"],type:"Earth",level:56},{id:"015",name:"Quakehound",hp:85,maxHp:85,atk:110,def:95,spd:90,moves:["Tackle","Swift Movement"],type:"Earth",level:56}], reward:1400, badge:null } },
    { id:"r2_013_iska", x:18, y:15, sprite:"🎖️", name:"Veteran Iska", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-013; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-013)."], battle:{ team:[{id:"021",name:"Stormtalon",hp:80,maxHp:80,atk:105,def:75,spd:110,moves:["Tackle","Swift Movement"],type:"Flying",level:57},{id:"046",name:"Yogiferno",hp:80,maxHp:80,atk:90,def:70,spd:110,moves:["Tackle","Swift Movement"],type:"Flame",level:57}], reward:1450, badge:null } },
    { id:"r2_014_ruel", x:10, y:25, sprite:"🎖️", name:"Veteran Ruel", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-014; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-014)."], battle:{ team:[{id:"003",name:"AquariiOS",hp:79,maxHp:79,atk:83,def:100,spd:78,moves:["Tackle","Swift Movement"],type:"Water",level:58},{id:"034",name:"Gorokappa",hp:80,maxHp:80,atk:105,def:125,spd:70,moves:["Tackle","Swift Movement"],type:"Chrome",level:58}], reward:1500, badge:null } },
    { id:"r2_015_miri", x:18, y:25, sprite:"🎖️", name:"Veteran Miri", facing:"down", dialog:["PLACEHOLDER — battle line GAP FOR MARS (trainer row R2-015; Mars fills the line)."], postBattleDialog:["PLACEHOLDER — post-battle line GAP FOR MARS (trainer row R2-015)."], battle:{ team:[{id:"012",name:"Manticlaw",hp:75,maxHp:75,atk:90,def:70,spd:110,moves:["Tackle","Swift Movement"],type:"Flame",level:59},{id:"028",name:"Krakenox",hp:85,maxHp:85,atk:85,def:85,spd:90,moves:["Tackle","Swift Movement"],type:"Water",level:59}], reward:1550, badge:null } },
  ],
  signs: [
    { x:14, y:10, text:"VICTORY ROUTE\\nNorth to the Plateau, second ascent. South to the Dojo 8 town (R2-11)." },
  ],
  exits: [
    { x:14, y:0, to:"r2_plateau", enterAt:{x:14, y:29}, dir:"up" },
    { x:14, y:39, to:"r2_blackthorn", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_PLATEAU: any = {
  name: "Mainframe Plateau — Second Ascent",
  music: "route1_theme",
  weather: "clear",
  width: 30, height: 30,
  playerStart: { x:14, y:29 },
  tiles: (() => {
    return buildMap(30, 30, (x, y) => {
      if (x===0||x===29||y===0||y===29) return TILE.WALL;
      if (x>=2&&x<=6&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=10&&x<=16&&y>=2&&y<=6) return TILE.BUILDING;
      if (x>=20&&x<=26&&y>=2&&y<=6) return TILE.BUILDING;
      if (y===15) return TILE.PATH;
      if (x===14) return TILE.PATH;
      return TILE.GRASS;
    });
  })(),
  npcs: [
    { id:"plateau_attendant", x:14, y:20, sprite:"🧑", name:"Plateau Attendant", facing:"down", dialog:["Second ascent. Same Plateau, different trainer. The Hall has a second page for you, if you earn it."], inkStory:"region2-story", inkKnot:"r2_13_plateau" },
    { id:"elite_1", x:8, y:10, sprite:"🥋", name:"Elite 1", facing:"down", dialog:["I guard the door. Pass me, and you are no longer a visitor."], postBattleDialog:["Pass. The stairs are yours."] },
    { id:"elite_2", x:12, y:10, sprite:"🥋", name:"Elite 2", facing:"down", dialog:["I guard the stairs. Climb, if you can."], postBattleDialog:["Climb. The hall is yours."] },
    { id:"elite_3", x:16, y:10, sprite:"🥋", name:"Elite 3", facing:"down", dialog:["I guard the hall. The hall remembers everyone who stood here."], postBattleDialog:["It will remember you. The champion's door is next."] },
    { id:"elite_4", x:20, y:10, sprite:"🥋", name:"Elite 4", facing:"down", dialog:["I guard the champion's door. Knock twice, and mean it."], postBattleDialog:["Knock. Mean it. Go."] },
    { id:"champion", x:14, y:4, sprite:"👑", name:"Champion", facing:"down", dialog:["You have beaten a region that remembers you. Now beat the trainer it remembers most."], postBattleDialog:["You have. The Hall remembers you twice now. Go back and finish what you started in Region 1 — it is waiting, stronger."] },
  ],
  signs: [
    { x:14, y:14, text:"HALL OF RECORDS\\nSecond entry is set on Champion defeat. Flag r2_hall_second_entry — owed: no Champion battle yet." },
  ],
  exits: [
    { x:14, y:0, to:"r2_frost_peak", enterAt:{x:12, y:22}, dir:"up" },
    { x:14, y:29, to:"r2_victory_route", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const R2_FROST_PEAK: any = {
  name: "Frost Peak — First Champion",
  music: "fields_theme",
  weather: "clear",
  width: 24, height: 24,
  playerStart: { x:12, y:22 },
  tiles: (() => {
    return buildMap(24, 24, (x, y) => {
      if (x===0||x===23||y===0||y===23) return TILE.WALL;
      if (y===12) return TILE.PATH;
      if (x===12) return TILE.PATH;
      return TILE.ICE;
    });
  })(),
  npcs: [
    { id:"frost_peak_guide", x:12, y:16, sprite:"🏔️", name:"Frost Peak Guide", facing:"down", dialog:["The top is snow and silence. The First Champion waits there. He does not talk. He battles."], inkStory:"region2-story", inkKnot:"r2_14_frost_peak" },
    { id:"prof_aeon_radio", x:8, y:16, sprite:"📻", name:"Prof. Aeon", facing:"down", dialog:["You beat the First Champion. The expedition signal is clean. Take the storm route. Region 3 is on the other side of it."] },
    { id:"first_champion", x:12, y:4, sprite:"👑", name:"First Champion", facing:"down", dialog:["…"], postBattleDialog:["The sea route is open. Storm-locked, but open. Region 3 is waiting."] },
  ],
  signs: [
    { x:12, y:12, text:"FROST PEAK\\nThe First Champion waits at the top. He does not talk. He battles.\\nStorm route to Region 3: owed by the Region 3 pass (flag r3_storm_route_open)." },
  ],
  exits: [
    { x:12, y:23, to:"r2_plateau", enterAt:{x:14, y:1}, dir:"down" },
  ],
  doors: [
  ],
  events: [],
  encounters: []
};

export const FULL_WORLD: Record<string, any> = {
  aeon_lab: AEON_LAB,
  sector0: SECTOR_0,
  route_1: ROUTE_1,
  mochiiplex_1: MOCHIIPLEX_1,
  binary_fields: BINARY_FIELDS,
  dojo_1: DOJO_1,
  binary_woods: BINARY_WOODS,
  cave_of_echoes: CAVE_OF_ECHOES,
  neon_city: NEON_CITY,
  scrap_junkyard: SCRAP_JUNKYARD,
  coral_approach: CORAL_APPROACH,
  castagnoli_island: CASTAGNOLI_ISLAND,
  mauveville_arena: MAUVEVILLE_ARENA,
  boot_bay: BOOT_BAY,
  luigi_mansion: LUIGI_MANSION,
  dojo_2: DOJO_2,
  sector0_truck: SECTOR0_TRUCK,
  sector0_house_1f: SECTOR0_HOUSE_1F,
  sector0_house_2f: SECTOR0_HOUSE_2F,
  sector0_rival_house: SECTOR0_RIVAL_HOUSE,
  sector0_neighbor_house: SECTOR0_NEIGHBOR_HOUSE,
  route_2: ROUTE_2,
  stoneport_city: STONEPORT_CITY,
  dojo_3: DOJO_3,
  route_3: ROUTE_3,
  signal_tunnel: SIGNAL_TUNNEL,
  pale_town: PALE_TOWN,
  market_city: MARKET_CITY,
  dojo_4: DOJO_4,
  central_city: CENTRAL_CITY,
  dojo_5: DOJO_5,
  harbor_city: HARBOR_CITY,
  dojo_6: DOJO_6,
  ember_island: EMBER_ISLAND,
  dojo_7: DOJO_7,
  dojo_8: DOJO_8,
  victory_route: VICTORY_ROUTE,
  mainframe_plateau: MAINFRAME_PLATEAU,
  data_isle_1: DATA_ISLE_1,
  data_isle_2: DATA_ISLE_2,
  data_isle_3: DATA_ISLE_3,
  data_isle_4: DATA_ISLE_4,
  data_isle_5: DATA_ISLE_5,
  data_isle_6: DATA_ISLE_6,
  data_isle_7: DATA_ISLE_7,
  region2_arrival: REGION2_ARRIVAL,
  r2_dawnfield: R2_DAWNFIELD,
  r2_mochiiplex_dawnfield: R2_MOCHIIPLEX_DAWNFIELD,
  r2_route_1: R2_ROUTE_1,
  r2_cherryport: R2_CHERRYPORT,
  r2_route_2: R2_ROUTE_2,
  r2_violet: R2_VIOLET,
  r2_tower: R2_TOWER,
  r2_dojo_1: R2_DOJO_1,
  r2_route_3: R2_ROUTE_3,
  r2_azalea: R2_AZALEA,
  r2_well: R2_WELL,
  r2_dojo_2: R2_DOJO_2,
  r2_route_4: R2_ROUTE_4,
  r2_ilex_forest: R2_ILEX_FOREST,
  r2_shrine: R2_SHRINE,
  r2_route_5: R2_ROUTE_5,
  r2_goldenrod: R2_GOLDENROD,
  r2_radio_tower: R2_RADIO_TOWER,
  r2_garden_branch: R2_GARDEN_BRANCH,
  r2_dojo_3: R2_DOJO_3,
  r2_route_6: R2_ROUTE_6,
  r2_ecruteak: R2_ECRUTEAK,
  r2_burned_tower: R2_BURNED_TOWER,
  r2_dojo_4: R2_DOJO_4,
  r2_route_7: R2_ROUTE_7,
  r2_olivine: R2_OLIVINE,
  r2_lighthouse: R2_LIGHTHOUSE,
  r2_dojo_5: R2_DOJO_5,
  r2_sea_road: R2_SEA_ROAD,
  r2_cianwood: R2_CIANWOOD,
  r2_dojo_6: R2_DOJO_6,
  r2_route_8: R2_ROUTE_8,
  r2_mahogany: R2_MAHOGANY,
  r2_lake: R2_LAKE,
  r2_hideout: R2_HIDEOUT,
  r2_dojo_7: R2_DOJO_7,
  r2_route_9: R2_ROUTE_9,
  r2_blackthorn: R2_BLACKTHORN,
  r2_den: R2_DEN,
  r2_dojo_8: R2_DOJO_8,
  r2_victory_route: R2_VICTORY_ROUTE,
  r2_plateau: R2_PLATEAU,
  r2_frost_peak: R2_FROST_PEAK
};

// Encounter mirror (stub-kill S-6, 2026-10-29): the core tables in
// src/data/core/encounters.json are the SINGLE source for wild
// spawns. The four inline zone arrays that used to live in the map
// literals above were migrated into those tables verbatim and are
// retired; each map's `encounters` is now DERIVED from its core
// table at module load (legacy zone shape, for any reader that still
// looks at the map object). WorldEngine itself rolls through
// src/lib/encounters.ts and never reads this mirror. If a table and
// this mirror ever disagree, the table is right by construction —
// the mirror is generated from it, never edited by hand.
for (const table of ENCOUNTER_TABLES) {
  if (table.method === "placed") continue;
  const map = FULL_WORLD[table.mapId];
  if (!map) continue;
  map.encounters = [
    {
      mapZone: table.method === "cave" ? "cave" : "tall_grass",
      rate: table.rate ?? 0,
      pool: table.slots.map((s) => ({ id: s.speciesId, level: s.minLevel })),
      mirrorOfCoreTable: table.areaId,
    },
  ];
}
