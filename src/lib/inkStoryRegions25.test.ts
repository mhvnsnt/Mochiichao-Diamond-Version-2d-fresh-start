// Regions 2-5 Ink stories — Vitest coverage (step i continuation).
//
// The four region stories (regionN-story.json, compiled from the
// regionN-story.ink sources with the inkjs Compiler, inkVersion 21)
// are the Regions 2-5 half of the Region 1 pattern: one story per
// region, one talk knot per dialogue entry plus an _after knot where
// the entry has post-battle/post-event lines, linear to END, no
// player choices (the locked md has none). The content-only beat
// specs (regionN-dialogue.json) stay the audit source: every walked
// line must round-trip to a line in them, and no walked line may
// carry an invented name, a NAME GAP / ROSTER GAP marker, or a
// reworded line (Ranger / Mochiioteca-as-Codex / Iridescence /
// Illuminate were all drift in the pre-correction JSONs).
//
// Regions 2-5 maps do NOT exist in FULL_WORLD yet, so no NPC is wired
// to these knots here — these tests pin the stories themselves (play,
// flags, validator), not a map that does not exist.
import { describe, expect, it } from "vitest";
import {
  INK_STORIES,
  InkSession,
  createInkSession,
  splitSpeaker,
} from "./inkStory";
import { validateDialogueJson } from "./wiring/validate-dialogue";
import region2Story from "./wiring/dialogue/region2-story.json";
import region3Story from "./wiring/dialogue/region3-story.json";
import region4Story from "./wiring/dialogue/region4-story.json";
import region5Story from "./wiring/dialogue/region5-story.json";
import region2Beats from "./wiring/dialogue/region2-dialogue.json";
import region3Beats from "./wiring/dialogue/region3-dialogue.json";
import region4Beats from "./wiring/dialogue/region4-dialogue.json";
import region5Beats from "./wiring/dialogue/region5-dialogue.json";

type BeatsDoc = {
  entries: Array<{
    id: string;
    npcs?: Array<{ speaker: string; lines: string[] }>;
    dojo?: { pre?: string[]; post?: string[] } | null;
    antagonist?: { lines: string[] } | null;
    elite?: Array<{ pre?: string[]; post?: string[] }>;
    champion?: { pre?: string[]; post?: string[] } | null;
    hex?: { pre?: string[]; post?: string[] } | null;
    flags?: string[];
  }>;
};

/** Every dialogue line in a beats doc, in order (duplicates kept). */
function beatLines(doc: BeatsDoc): string[] {
  const out: string[] = [];
  for (const e of doc.entries) {
    for (const n of e.npcs ?? []) out.push(...n.lines);
    if (e.antagonist) out.push(...e.antagonist.lines);
    if (e.dojo) out.push(...(e.dojo.pre ?? []), ...(e.dojo.post ?? []));
    for (const el of e.elite ?? [])
      out.push(...(el.pre ?? []), ...(el.post ?? []));
    if (e.champion)
      out.push(...(e.champion.pre ?? []), ...(e.champion.post ?? []));
    if (e.hex) out.push(...(e.hex.pre ?? []), ...(e.hex.post ?? []));
  }
  return out;
}

/**
 * The one line whose .ink form differs from its beats form: R3-09a's
 * third antagonist line is written "You: pick a side, ..." in the
 * locked md, so the .ink carries it as speaker You + the remainder.
 * Normalise both sides the same way before comparing.
 */
function normalise(text: string): string {
  return text.startsWith("You: ") ? text.slice("You: ".length) : text;
}

const FORBIDDEN = [
  "NAME GAP",
  "ROSTER GAP",
  "Merv",
  "Kairos",
  "Shimo",
  "Nagisa",
  "Delta",
  "Bannon",
  "Rin & Ren",
  "Iridescence",
  "Ranger",
  "Mochiioteca",
  "Illuminate",
];

const REGIONS = [
  {
    n: 2,
    storyId: "region2-story",
    story: region2Story,
    beats: region2Beats as BeatsDoc,
    knots: 24,
    lines: 72,
    flags: 28,
    firstKnot: "r2_01_dawnfield",
    firstLines: [
      { speaker: "Ferry Captain", text: "Dawnfield. End of the ferry, start of the chapter." },
      { speaker: "Ferry Captain", text: "Aeon sent word ahead. Your team is on the list, but the list opens badge by badge. Earn them." },
      { speaker: "Ferry Captain", text: "The MochiiPlex here is small, but the heal is free, same as home. Rest before you walk." },
      { speaker: "Dawnfield Researcher", text: "Aeon handed you to me by radio, so I will say it plain: this region remembers trainers." },
      { speaker: "Dawnfield Researcher", text: "Walk the opening road first. Do not skip to the tower. The tower notices skippers." },
    ],
    firstFlagsTrue: ["r2_arrived", "r2_badge_gate_active"],
    firstFlagsFalse: ["r2_badge_gate_step_1"],
  },
  {
    n: 3,
    storyId: "region3-story",
    story: region3Story,
    beats: region3Beats as BeatsDoc,
    knots: 27,
    lines: 70,
    flags: 19,
    firstKnot: "r3_01_outpost_2f",
    firstLines: [
      { speaker: "Outpost Keeper", text: "You are awake. Good. The lab is down the road." },
      { speaker: "Outpost Keeper", text: "The researcher is waiting, and Hex is already there, looking impatient. Go. Do not keep Hex waiting \u2014 he keeps score." },
      { speaker: "Region 3 Researcher", text: "Welcome to Root Hamlet. Pick a partner from the table. It will travel with your main team, not instead of it." },
      { speaker: "Region 3 Researcher", text: "Take the Codex upgrade, and the Capture Cubes. The sea is wide, and you will need both." },
      { speaker: "Hex", text: "You pick first, I pick stronger. That is the rule, and the rule has not changed." },
    ],
    firstFlagsTrue: ["r3_lab_starter", "r3_codex_upgrade"],
    firstFlagsFalse: ["r3_frontier_done"],
  },
  {
    n: 4,
    storyId: "region4-story",
    story: region4Story,
    beats: region4Beats as BeatsDoc,
    knots: 26,
    lines: 65,
    flags: 17,
    firstKnot: "r4_01_twinleaf",
    firstLines: [
      { speaker: "Airship Captain", text: "Twinleaf Hamlet. Edge of the snow, edge of the old story. Step off careful \u2014 the ground here is older than the map." },
      { speaker: "Hamlet Elder", text: "The Rift is not a place. It is a wound in a place. Walk carefully. The creatures here are not wild \u2014 they are lost." },
    ],
    firstFlagsTrue: ["r4_arrived", "r4_airship_docked"],
    firstFlagsFalse: ["r4_rift_sealed"],
  },
  {
    n: 5,
    storyId: "region5-story",
    story: region5Story,
    beats: region5Beats as BeatsDoc,
    knots: 29,
    lines: 62,
    flags: 19,
    firstKnot: "r5_01_start_city",
    firstLines: [
      // Locked md writes the compound "Portal-train" as one word; the
      // generator title-cases per space-separated word, so it stays
      // "Portal-train" (not "Portal-Train") in the compiled story.
      { speaker: "Portal-train Conductor", text: "Start City. Last continent, first stop. The portal train does not go back on its own. You have to choose to go back, and you have not finished here yet." },
      { speaker: "Start City Elder", text: "This is the last continent. Not the last story. The Liberation Front is here, in full, and they are not hiding anymore." },
    ],
    firstFlagsTrue: ["r5_arrived", "r5_portal_train_docked"],
    firstFlagsFalse: ["r5_mythar_beat"],
  },
];

describe("splitSpeaker — region 2-5 labels", () => {
  it("splits labels with digits (Elite 1, Region 3 Researcher)", () => {
    expect(splitSpeaker("Elite 1: I guard the door.")).toEqual({
      speaker: "Elite 1",
      text: "I guard the door.",
    });
    expect(
      splitSpeaker("Region 3 Researcher: Welcome to Root Hamlet."),
    ).toEqual({
      speaker: "Region 3 Researcher",
      text: "Welcome to Root Hamlet.",
    });
  });

  it("splits the clean display labels (Dojo Leader, First Champion, Land, You)", () => {
    expect(
      splitSpeaker("Dojo Leader: Show me work, not wishes."),
    ).toEqual({ speaker: "Dojo Leader", text: "Show me work, not wishes." });
    expect(splitSpeaker("First Champion: \u2026")).toEqual({
      speaker: "First Champion",
      text: "\u2026",
    });
    expect(splitSpeaker("Land: The land remembers.")).toEqual({
      speaker: "Land",
      text: "The land remembers.",
    });
    expect(splitSpeaker("You: pick a side, or pick the balance.")).toEqual({
      speaker: "You",
      text: "pick a side, or pick the balance.",
    });
  });
});

describe("regions 2-5 stories registered", () => {
  it("registers all four region stories", () => {
    expect(INK_STORIES["region2-story"]).toEqual(region2Story);
    expect(INK_STORIES["region3-story"]).toEqual(region3Story);
    expect(INK_STORIES["region4-story"]).toEqual(region4Story);
    expect(INK_STORIES["region5-story"]).toEqual(region5Story);
  });

  it("returns null for a bad knot in a region story", () => {
    expect(createInkSession("region2-story", "no_such_knot")).toBeNull();
    expect(createInkSession("region5-story", "no_such_knot")).toBeNull();
  });
});

describe("regions 2-5 validator (PR #414 gate)", () => {
  for (const r of REGIONS) {
    it(`region ${r.n} compiled ink passes: ${r.knots} knots, ${r.lines} lines, 0 errors`, () => {
      const result = validateDialogueJson(r.story, `region${r.n}-story.json`);
      expect(result.format).toBe("compiled-ink");
      expect(result.errors).toEqual([]);
      expect(result.stats.knots).toBe(r.knots);
      expect(result.stats.lines).toBe(r.lines);
      expect(result.stats.choices).toBe(0);
      expect(result.stats.flagsDeclared).toBe(r.flags);
      expect(result.stats.flagsWritten).toBe(r.flags);
      // Every flag is written but never read inside its story (badge
      // steps / Hall entries / region links are consumed by game and
      // progression code, not by an ink condition) — warnings, not errors.
      expect(result.warnings.length).toBe(r.flags);
    });
  }
});

describe("regions 2-5 full-story walk (followDiverts)", () => {
  for (const r of REGIONS) {
    it(`region ${r.n} walks every knot to END with no choices, all ${r.flags} flags true`, () => {
      const s = new InkSession(r.story, undefined, true);
      const walked: string[] = [];
      let guard = 0;
      while (!s.done && guard++ < 500) {
        const line = s.next();
        if (line) {
          walked.push(line.text);
          continue;
        }
        const ch = s.choices;
        expect(ch).toEqual([]);
        break;
      }
      expect(s.done).toBe(true);
      expect(walked.length).toBe(r.lines);
      // Round-trip: the walked lines are exactly the beats lines
      // (multiset, with the R3-09a "You: " normalisation).
      const expected = beatLines(r.beats).map(normalise).sort();
      expect(walked.map(normalise).sort()).toEqual(expected);
      for (const text of walked) {
        for (const tok of FORBIDDEN) {
          expect(text).not.toContain(tok);
        }
      }
      for (const [name, value] of Object.entries(s.variables)) {
        expect(value).toBe(true);
      }
      expect(Object.keys(s.variables).length).toBe(r.flags);
    });
  }
});

describe("regions 2-5 knot-scoped play (first knot)", () => {
  for (const r of REGIONS) {
    it(`region ${r.n} ${r.firstKnot} plays its lines, then ends at the next knot`, () => {
      const s = createInkSession(r.storyId, r.firstKnot);
      expect(s).not.toBeNull();
      const seen: Array<{ speaker: string | null; text: string }> = [];
      let line = s!.next();
      while (line) {
        seen.push(line);
        line = s!.next();
      }
      expect(seen).toEqual(r.firstLines);
      expect(s!.choices).toEqual([]);
      expect(s!.done).toBe(true);
      for (const f of r.firstFlagsTrue) {
        expect(s!.variables[f]).toBe(true);
      }
      for (const f of r.firstFlagsFalse) {
        expect(s!.variables[f]).toBe(false);
      }
    });
  }
});

describe("regions 2-5 spot knots", () => {
  it("R2-03 dojo post sets the badge flag, and only in the _after knot", () => {
    const pre = createInkSession("region2-story", "r2_03_violet");
    expect(pre!.next()).toEqual({
      speaker: "Tower Guide",
      text: "The tower is a puzzle, not a wall. Each floor teaches you one thing. Do not climb angry.",
    });
    expect(pre!.variables.r2_badge_gate_step_1).toBe(false);
    const post = createInkSession("region2-story", "r2_03_violet_after");
    expect(post!.next()).toEqual({
      speaker: "Dojo Leader",
      text: "You know it. Take the first badge of this region. Your old team opens one slot wider now.",
    });
    expect(post!.next()).toBeNull();
    expect(post!.variables.r2_badge_gate_step_1).toBe(true);
    expect(post!.variables.r2_tower_puzzle).toBe(true);
  });

  it("R2-14 First Champion pre is the silent ellipsis; the post opens Region 3", () => {
    const pre = createInkSession("region2-story", "r2_14_frost_peak");
    const lines: string[] = [];
    let l = pre!.next();
    while (l) {
      lines.push(l.text);
      l = pre!.next();
    }
    expect(lines).toContain("\u2026");
    expect(pre!.variables.r3_storm_route_open).toBe(false);
    const post = createInkSession("region2-story", "r2_14_frost_peak_after");
    expect(post!.next()).toEqual({
      speaker: "First Champion",
      text: "The sea route is open. Storm-locked, but open. Region 3 is waiting.",
    });
    // Drain the knot: the ~ flag assignments sit after the last line, so
    // inkjs only runs them once the session is continued past it (same
    // pattern as the R2-03 test above, which calls next() to null first).
    expect(post!.next()).toEqual({
      speaker: "Prof. Aeon",
      text: "You beat the First Champion. The expedition signal is clean. Take the storm route. Region 3 is on the other side of it.",
    });
    expect(post!.next()).toBeNull();
    expect(post!.variables.r3_storm_route_open).toBe(true);
    expect(post!.variables.r2_frost_peak_beat).toBe(true);
  });

  it("R3-01 Hex lab-exit pre/post split across the talk and _after knots", () => {
    const talk = createInkSession("region3-story", "r3_01_outpost_2f");
    const seen: string[] = [];
    let l = talk!.next();
    while (l) {
      seen.push(l.text);
      l = talk!.next();
    }
    expect(seen).toContain(
      "You pick first, I pick stronger. That is the rule, and the rule has not changed.",
    );
    expect(seen).not.toContain(
      "You win here too. Fine. The sea is bigger than both of us. Let's see who crosses it first.",
    );
    const after = createInkSession("region3-story", "r3_01_outpost_2f_after");
    expect(after!.next()).toEqual({
      speaker: "Hex",
      text: "You win here too. Fine. The sea is bigger than both of us. Let's see who crosses it first.",
    });
  });

  it("R3-09a splits the two factions and You across three speakers", () => {
    const s = createInkSession("region3-story", "r3_09a_lilycove");
    const seen: Array<{ speaker: string | null; text: string }> = [];
    let l = s!.next();
    while (l) {
      seen.push(l);
      l = s!.next();
    }
    expect(seen).toContainEqual({
      speaker: "Land",
      text: "The land remembers. It will not share the memory with the sea.",
    });
    expect(seen).toContainEqual({
      speaker: "Sea",
      text: "The sea forgets. It will not share the forgetting with the land.",
    });
    expect(seen).toContainEqual({
      speaker: "You",
      text: "pick a side, or pick the balance. The balance is harder, and it is the only one that holds.",
    });
  });

  it("R5-17 Mythar pre/post split, and the _after knot sets the true-ending flags", () => {
    const talk = createInkSession("region5-story", "r5_17_mythar_final");
    const seen: string[] = [];
    let l = talk!.next();
    while (l) {
      seen.push(l.text);
      l = talk!.next();
    }
    expect(seen).toContain(
      "I am not a region champion. I am the champion of the whole Mainframe. Show me why you belong in the Hall with me.",
    );
    expect(talk!.variables.r5_mythar_beat).toBe(false);
    const after = createInkSession("region5-story", "r5_17_mythar_final_after");
    expect(after!.next()).toEqual({
      speaker: "Mythar",
      text: "You belong. The Hall is yours, all five times over. Now go play. The world is open.",
    });
    // Drain the knot first: the ~ flag assignments sit after the last line,
    // so inkjs only runs them once the session is continued past it.
    expect(after!.next()).toEqual({
      speaker: "Prof. Aeon",
      text: "Five regions, five Halls, one trainer. The Mainframe remembers you now, the way it remembers Mythar. That is the true ending, and it is not an ending. It is an opening.",
    });
    expect(after!.next()).toBeNull();
    expect(after!.variables.r5_mythar_beat).toBe(true);
    expect(after!.variables.r5_true_ending).toBe(true);
    expect(after!.variables.r5_free_play).toBe(true);
  });
});
