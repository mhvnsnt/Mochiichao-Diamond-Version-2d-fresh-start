// Stub-kill S-2 receipts: the director hook, driven against the
// REAL game store. The Boot Harbor theft fires in evaluation, its
// outcome writes the witnessed deed into the real ledger through
// honor's recordDeed, the Dark Forest refusal holds in evaluation,
// and the engine seam itself is locked by a source scan (the hook
// cannot silently fall out of WorldEngine again).
import { describe, it, expect, beforeEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import {
  eligibleEvents, resolveOutcome, arcAvailability, emptyLivingWorldState,
  LIVING_WORLD_AREAS, type DirectorContext,
} from "./livingWorld";
import { useGameStore } from "../store/gameStore";

function ctx(mapId: string, pos = { x: 15, y: 18 }, phase: DirectorContext["phase"] = "DAY"): DirectorContext {
  const st = useGameStore.getState();
  return { mapId, phase, beat: 10, playerPos: pos, ledger: st.deedLedger, state: st.livingWorld };
}
function sink() {
  return {
    get deedLedger() { return useGameStore.getState().deedLedger; },
    appendDeed: useGameStore.getState().appendDeed,
  };
}

beforeEach(() => {
  useGameStore.setState({ deedLedger: [], livingWorld: emptyLivingWorldState() });
});

describe("S-2 living-world director hook (driven session)", () => {
  it("Boot Harbor theft is eligible at its anchor in DAY phase", () => {
    const ids = eligibleEvents(ctx("sector0")).map((e) => e.id);
    expect(ids).toContain("bh_snatch_at_bay_steps");
  });

  it("resolving join-win writes the witnessed deed into the REAL store ledger via recordDeed", () => {
    const res = resolveOutcome(sink(), ctx("sector0"), "bh_snatch_at_bay_steps", "join-win");
    expect(res.entry?.deed).toBe("return-stolen-mochi");
    useGameStore.getState().setLivingWorld(res.state);
    const ledger = useGameStore.getState().deedLedger;
    expect(ledger).toHaveLength(1);
    expect(ledger[0].deed).toBe("return-stolen-mochi");
    expect(ledger[0].witnessedBy).toContain("dock_fisher");
    expect(ledger[0].areaId).toBe("sector0");
    // Once-ever outcome: the event no longer evaluates as eligible.
    expect(eligibleEvents(ctx("sector0")).map((e) => e.id)).not.toContain("bh_snatch_at_bay_steps");
  });

  it("the fisher arc reads already-resolved after the snatch resolution (interlock, no second deed)", () => {
    const res = resolveOutcome(sink(), ctx("sector0"), "bh_snatch_at_bay_steps", "join-win");
    useGameStore.getState().setLivingWorld(res.state);
    expect(arcAvailability(ctx("sector0"), "arc_fishers_empty_lead")).toBe("already-resolved");
    expect(useGameStore.getState().deedLedger).toHaveLength(1);
  });

  it("the wrong side writes witnessed infamy instead (abet -> steal-attempt)", () => {
    const res = resolveOutcome(sink(), ctx("sector0"), "bh_snatch_at_bay_steps", "abet");
    useGameStore.getState().setLivingWorld(res.state);
    expect(useGameStore.getState().deedLedger[0]?.deed).toBe("steal-attempt");
    expect(res.entry?.witnessedBy).toContain("dock_fisher");
  });

  it("Dark Forest refusal holds in evaluation: zero eligible events, ever", () => {
    expect(LIVING_WORLD_AREAS["binary_woods"]?.placeClass).toBe("dark-forest");
    for (const phase of ["LATE", "MORN", "DAY", "EVE", "NITE"] as const) {
      expect(eligibleEvents(ctx("binary_woods", { x: 14, y: 19 }, phase))).toEqual([]);
    }
  });

  it("the engine seam is present in WorldEngine (source lock)", () => {
    const src = fs.readFileSync(path.resolve(__dirname, "../world/WorldEngine.tsx"), "utf8");
    for (const needle of ["eligibleEvents(", "resolveOutcome(", "routineFor(", "completeArcStage(", "setLivingWorld("]) {
      expect(src.includes(needle), needle).toBe(true);
    }
  });
});
