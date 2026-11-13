// Ink / inkjs dialogue — exit / flag gate tests (no browser).
// Pins what step (e) wires up: the exit/flag validator in
// src/lib/wiring/validate-dialogue.ts runs over the real dialogue files
// (hand-shaped locked file + compiled ink truck start), and the gate cases
// below FAIL ON PURPOSE — a dead end, a flag read with no write, a divert
// to a missing knot, and a choice to a missing stitch must all be errors,
// so a bad dialogue file cannot slip through silently. The CLI that runs
// this validator on every file (npm run validate:dialogue) is the CI step;
// these tests pin the validator itself.
//
// Pokemon-first note: a FireRed decomp event script is lock, faceplayer,
// msgbox, flag set, then an exit — in that order, with a flag that stops
// the scene repeating. The dead-end rule below is that structure: a stitch
// with neither exit nor a way onward strands the player, exactly like a
// script that never releases. The "no line repeats after its flag" half
// lives in the session: a stitch's setFlags land in the flag store on
// entry, so the caller can branch on hasFlag instead of replaying the
// one-time lines — pinned by the session test, not by a validator guess.
import { describe, it, expect } from "vitest";
import {
  validateDialogueJson,
  flagsReadByCondition,
} from "../src/lib/wiring/validate-dialogue";
import {
  parseHandShapedDialogue,
  createHandShapedSession,
} from "../src/lib/wiring/dialogue-ink";
import truckStart from "../src/lib/wiring/dialogue/region1-truck-start.json";
import locked from "../src/lib/wiring/dialogue/ink-dialogue-locked-2026-10-26.json";
import region1 from "../src/lib/wiring/dialogue/region1-dialogue.json";

/** Replace the first ink divert target in a cloned compiled story. */
function retargetFirstDivert(doc: unknown, target: string): void {
  const walk = (v: unknown): boolean => {
    if (Array.isArray(v)) {
      for (const el of v) if (walk(el)) return true;
      return false;
    }
    if (typeof v === "object" && v !== null) {
      const rec = v as Record<string, unknown>;
      if (typeof rec["->"] === "string") {
        rec["->"] = target;
        return true;
      }
      for (const val of Object.values(rec)) if (walk(val)) return true;
    }
    return false;
  };
  walk(doc);
}

describe("dialogue exit/flag checks — live files", () => {
  it("locked hand-shaped file passes: 37 knots, 189 stitches, 0 errors", () => {
    const result = validateDialogueJson(locked, "ink-dialogue-locked-2026-10-26.json");
    expect(result.format).toBe("hand-shaped");
    expect(result.errors).toEqual([]);
    expect(result.stats.knots).toBe(37);
    expect(result.stats.stitches).toBe(189);
    expect(result.stats.lines).toBe(314);
    expect(result.stats.choices).toBe(189);
    expect(result.stats.exitChoices).toBe(37);
    expect(result.stats.flagsDeclared).toBe(10);
    expect(result.stats.flagsWritten).toBe(10);
    // Warnings, not errors: 1 superseded knot (iwao, retained for history)
    // + 10 flags set by a stitch but never read by a dialogue condition
    // (dojo_N_defeated / iwao_*_fragment are consumed by game/progression
    // code outside dialogue — the reader must be recorded, not invented).
    expect(result.warnings.length).toBe(11);
    expect(result.warnings.map((w) => w.message)).toContain(
      "superseded knot retained for history; use its replacement, not this knot, for live play",
    );
  });

  it("region 1 truck-start compiled ink passes: 7 knots, 0 errors", () => {
    const result = validateDialogueJson(truckStart, "region1-truck-start.json");
    expect(result.format).toBe("compiled-ink");
    expect(result.errors).toEqual([]);
    expect(result.stats.knots).toBe(7);
    expect(result.stats.lines).toBe(19);
    expect(result.stats.choices).toBe(5);
    // 3 ink variables written but never read inside the story
    // (clock_set / codex_get / sprint_boots are consumed by the game
    // flow, not by an ink condition) — warnings, not errors.
    expect(result.warnings.length).toBe(3);
  });

  it("region 1-5 content files are NOT dialogue formats (CLI skips them)", () => {
    // region1-dialogue.json is beats/entries source material for the later
    // Regions 2-5 Ink conversion — the validator must not silently accept
    // it as dialogue, and the CLI must skip it explicitly instead of
    // failing the gate on a file that is not dialogue yet. When a region
    // file is converted to ink, this test is updated with it.
    const result = validateDialogueJson(region1, "region1-dialogue.json");
    expect(result.format).toBe("unknown");
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].message).toContain("unrecognised dialogue format");
  });
});

describe("dialogue exit/flag checks — gate cases (fail on purpose)", () => {
  it("a stitch with neither exit nor choices is a dead-end error", () => {
    const deadEnd = {
      knots: {
        test: {
          stitches: {
            main: {
              lines: [{ speaker: "Mom", text: "Hi." }],
              choices: [],
              exit: false,
              setFlags: [],
            },
          },
        },
      },
      flags: [],
    };
    const result = validateDialogueJson(deadEnd, "dead-end.json");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.map((e) => e.message).join(" ")).toContain("dead end");
  });

  it("a flag read by a choice condition but never written is an error", () => {
    const flagGap = {
      knots: {
        test: {
          stitches: {
            main: {
              lines: [{ speaker: "Mom", text: "Hi." }],
              choices: [
                {
                  text: "Go",
                  target: { knot: "test", stitch: "next" },
                  condition: { flag: "never_set" },
                },
              ],
              exit: false,
              setFlags: [],
            },
            next: {
              lines: [{ speaker: "Mom", text: "Next." }],
              choices: [{ text: "Leave", exit: true }],
              exit: false,
              setFlags: [],
            },
          },
        },
      },
      flags: [],
    };
    const result = validateDialogueJson(flagGap, "flag-gap.json");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.map((e) => e.message).join(" ")).toContain(
      'flag "never_set" is read by a choice condition but never written',
    );
    // The condition reader itself is sound: it finds the flag name.
    expect(flagsReadByCondition({ flag: "never_set" })).toEqual(["never_set"]);
  });

  it("a compiled-ink divert to a missing knot is an error", () => {
    const bad = JSON.parse(JSON.stringify(truckStart)) as unknown;
    retargetFirstDivert(bad, "missing_knot");
    const result = validateDialogueJson(bad, "bad-divert.json");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.map((e) => e.message).join(" ")).toContain(
      'ink divert "-> missing_knot" resolves to no knot',
    );
  });

  it("a choice target to a missing stitch is an error", () => {
    const bad = JSON.parse(JSON.stringify(locked)) as unknown as {
      knots: Record<string, { stitches: Record<string, { choices: { target?: { stitch: string } }[] }> }>;
    };
    const firstKnot = Object.values(bad.knots)[0];
    const firstStitch = Object.values(firstKnot.stitches).find(
      (s) => s.choices.some((c) => c.target),
    )!;
    firstStitch.choices.find((c) => c.target)!.target!.stitch = "no_such_stitch";
    const result = validateDialogueJson(bad, "bad-target.json");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.map((e) => e.message).join(" ")).toContain(
      "does not exist",
    );
  });

  it("a declared flag never written by any stitch is an error", () => {
    const orphan = {
      knots: {
        test: {
          stitches: {
            main: {
              lines: [{ speaker: "Mom", text: "Hi." }],
              choices: [{ text: "Leave", exit: true }],
              exit: false,
              setFlags: [],
            },
          },
        },
      },
      flags: ["orphan_flag"],
    };
    const result = validateDialogueJson(orphan, "orphan-flag.json");
    expect(result.errors.map((e) => e.message).join(" ")).toContain(
      'declared flag "orphan_flag" is never written by any stitch',
    );
  });
});

describe("dialogue session — exit and flag behaviour", () => {
  it("exit choices end the session, setFlags land on entry, gated choices hide until the flag is set", () => {
    const doc = parseHandShapedDialogue({
      knots: {
        mom: {
          character: "Mom",
          stitches: {
            main: {
              lines: [{ speaker: "Mom", text: "First visit." }],
              choices: [
                { text: "Take the boots", target: { knot: "mom", stitch: "boots" } },
                {
                  text: "Ask about the boots",
                  target: { knot: "mom", stitch: "after" },
                  condition: { flag: "sprint_boots" },
                },
                { text: "Leave", exit: true },
              ],
              exit: false,
              setFlags: [],
            },
            boots: {
              lines: [{ speaker: "Mom", text: "Here — Sprint Boots." }],
              choices: [{ text: "Thanks", exit: true }],
              exit: false,
              setFlags: ["sprint_boots"],
            },
            after: {
              lines: [{ speaker: "Mom", text: "Come back any time." }],
              choices: [{ text: "Leave", exit: true }],
              exit: false,
              setFlags: [],
            },
          },
        },
      },
      flags: ["sprint_boots"],
      superseded_knots: [],
    });
    const session = createHandShapedSession(doc);
    // First visit: the flag-gated choice is hidden.
    expect(session.load("mom").map((l) => l.text)).toEqual(["First visit."]);
    expect(session.choices().map((c) => c.text)).toEqual([
      "Take the boots",
      "Leave",
    ]);
    // Take the boots: setFlags lands in the flag store on entry.
    const bootsLines = session.choose(0);
    expect(bootsLines?.map((l) => l.text)).toEqual(["Here — Sprint Boots."]);
    expect(session.hasFlag("sprint_boots")).toBe(true);
    // The exit choice ends the session.
    expect(session.choose(0)).toBeNull();
    expect(session.ended).toBe(true);
    // Return visit: the gated choice is now offered — and the caller can
    // branch on hasFlag("sprint_boots") instead of replaying the
    // first-visit lines (the no-repeat guard is the flag check, pinned
    // here by hasFlag; the session itself replays a re-loaded stitch).
    session.load("mom");
    expect(session.choices().map((c) => c.text)).toEqual([
      "Take the boots",
      "Ask about the boots",
      "Leave",
    ]);
    expect(session.loadEvent("mom", "after").map((l) => l.text)).toEqual([
      "Come back any time.",
    ]);
  });
});
