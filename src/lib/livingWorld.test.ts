/**
 * livingWorld.test.ts — the world-encounter director's coverage.
 *
 * The load-bearing tests:
 *  - every placed event resolves its triggers (phase / place /
 *    radius / flags / cooldown) and writes its deed to the REAL game
 *    store's ledger through honor's recordDeed;
 *  - the Dark Forest class is silent by construction — no event
 *    fires there, and data that tries to place one is refused;
 *  - the smoke proof: Boot Harbor's bay-steps snatch, end to end —
 *    eligible, joined, won, deed in the real ledger, standing moved,
 *    the stranger arc interlock reading `already-resolved`.
 */

import { beforeEach, describe, expect, it } from "vitest";
import {
  AMBIENT_ROUTINES,
  STRANGER_ARCS,
  WITNESSED_EVENTS,
  arcAvailability,
  completeArcStage,
  currentArcStage,
  eligibleEvents,
  emptyLivingWorldState,
  phaseForHour,
  resolveOutcome,
  routineFor,
  routinesForMap,
  validateLivingWorldData,
} from "./livingWorld";
import type { DirectorContext, HonorSink, WitnessedEvent } from "./livingWorld";
import { DEED_TABLE, deriveMorale } from "./honor";
import type { DeedEntry } from "./honor";
import { useGameStore } from "../store/gameStore";
import { FULL_WORLD } from "../world/FullWorldMaps";

/** The real store, through the structural sink recordDeed writes to.
 *  The getter keeps `deedLedger` fresh (recordDeed reads its length
 *  to mint ids). */
function realSink(): HonorSink {
  return {
    get deedLedger() {
      return useGameStore.getState().deedLedger;
    },
    appendDeed: (e: DeedEntry) => useGameStore.getState().appendDeed(e),
  };
}

function ctx(partial: Partial<DirectorContext>): DirectorContext {
  return {
    mapId: "sector0",
    phase: "DAY",
    beat: 1000,
    ledger: useGameStore.getState().deedLedger,
    state: emptyLivingWorldState(),
    ...partial,
  };
}

const freshCtx = (partial: Partial<DirectorContext>) =>
  ctx({ ...partial, ledger: useGameStore.getState().deedLedger });

beforeEach(() => {
  useGameStore.setState({ deedLedger: [] });
});

// ------------------------------------------------------------ phases

describe("clock design phase table (as data)", () => {
  it("maps hours to the canonical five phases", () => {
    expect(phaseForHour(0)).toBe("LATE");
    expect(phaseForHour(3)).toBe("LATE");
    expect(phaseForHour(4)).toBe("MORN");
    expect(phaseForHour(9)).toBe("MORN");
    expect(phaseForHour(10)).toBe("DAY");
    expect(phaseForHour(16)).toBe("DAY");
    expect(phaseForHour(17)).toBe("EVE");
    expect(phaseForHour(19)).toBe("EVE");
    expect(phaseForHour(20)).toBe("NITE");
    expect(phaseForHour(23)).toBe("NITE");
    expect(phaseForHour(24)).toBe("LATE");
  });
});

// ------------------------------------------------------------ data validity

describe("placement data validity", () => {
  it("shipped data validates clean against the laws", () => {
    expect(validateLivingWorldData()).toEqual([]);
  });

  it("every deed an outcome or arc names exists in the closed deed table", () => {
    const ids = new Set(DEED_TABLE.deeds.map((d) => d.deed));
    for (const ev of WITNESSED_EVENTS)
      for (const o of ev.outcomes) if (o.deed) expect(ids.has(o.deed.deed), `${ev.id}/${o.id}`).toBe(true);
    for (const arc of STRANGER_ARCS)
      for (const s of arc.stages)
        for (const d of s.completionDeeds ?? []) expect(ids.has(d.deed), `${arc.id}/stage-${s.stage}`).toBe(true);
  });

  it("every deed-writing outcome is witnessed (the ledger's witnessed half)", () => {
    for (const ev of WITNESSED_EVENTS)
      for (const o of ev.outcomes)
        if (o.deed) expect(o.deed.witnessedBy.length, `${ev.id}/${o.id}`).toBeGreaterThan(0);
  });

  it("a synthetic placement in the Dark Forest is refused at validation", () => {
    const fake: WitnessedEvent = {
      id: "fake_forest_event",
      kind: "witnessed",
      eventClass: "theft-item",
      title: "Fake",
      mapId: "binary_woods",
      anchor: { x: 1, y: 1 },
      radiusTiles: 2,
      phases: ["DAY"],
      scene: [],
      requiresFlags: [],
      forbidsFlags: [],
      outcomes: [{ id: "ignore", label: "x", setsFlags: [], cooldownBeats: 10 }],
    };
    const problems = validateLivingWorldData([fake], [], undefined);
    expect(problems.some((p) => p.problem.includes("forbidden"))).toBe(true);
  });

  it("a synthetic outcome naming an unknown deed is refused at validation", () => {
    const fake: WitnessedEvent = {
      id: "fake_deed_event",
      kind: "witnessed",
      eventClass: "theft-item",
      title: "Fake",
      mapId: "sector0",
      anchor: { x: 1, y: 1 },
      radiusTiles: 2,
      phases: ["DAY"],
      scene: [],
      requiresFlags: [],
      forbidsFlags: [],
      outcomes: [
        {
          id: "win",
          label: "x",
          deed: { deed: "not-a-real-deed", subject: {}, witnessedBy: ["mom"] },
          setsFlags: [],
          cooldownBeats: null,
        },
      ],
    };
    const problems = validateLivingWorldData([fake], [], undefined);
    expect(problems.some((p) => p.problem.includes("unknown deed"))).toBe(true);
  });

  it("every placed event and arc sits on a real map; givers and routine NPCs are real placed NPCs", () => {
    for (const ev of WITNESSED_EVENTS) expect(FULL_WORLD[ev.mapId], ev.id).toBeTruthy();
    for (const arc of STRANGER_ARCS) {
      const npcs = (FULL_WORLD[arc.mapId].npcs ?? []).map((n: any) => n.id);
      expect(npcs, arc.id).toContain(arc.giverNpcId);
    }
    for (const r of AMBIENT_ROUTINES) {
      const npcs = (FULL_WORLD[r.mapId].npcs ?? []).map((n: any) => n.id);
      expect(npcs, `${r.mapId}/${r.npcId}`).toContain(r.npcId);
    }
  });
});

// ------------------------------------------------------------ eligibility

describe("director eligibility", () => {
  it("each placed event is eligible at its anchor in one of its phases", () => {
    for (const ev of WITNESSED_EVENTS) {
      const c = freshCtx({ mapId: ev.mapId, phase: ev.phases[0], playerPos: ev.anchor });
      expect(eligibleEvents(c).map((e) => e.id), ev.id).toContain(ev.id);
    }
  });

  it("nothing is eligible at LATE for the shipped placements (the world sleeps)", () => {
    for (const ev of WITNESSED_EVENTS) {
      const c = freshCtx({ mapId: ev.mapId, phase: "LATE", playerPos: ev.anchor });
      expect(eligibleEvents(c).map((e) => e.id)).not.toContain(ev.id);
    }
  });

  it("radius gates: standing across town, the event does not fire", () => {
    const ev = WITNESSED_EVENTS.find((e) => e.id === "bh_snatch_at_bay_steps")!;
    const far = freshCtx({ mapId: "sector0", phase: "DAY", playerPos: { x: 1, y: 1 } });
    expect(eligibleEvents(far).map((e) => e.id)).not.toContain(ev.id);
  });

  it("the Dark Forest is silent: no eligibility, no routines, even under a permissive context", () => {
    const c = freshCtx({ mapId: "binary_woods", phase: "DAY", beat: 99999 });
    expect(eligibleEvents(c)).toEqual([]);
    expect(routinesForMap("binary_woods", c)).toEqual([]);
  });

  it("a place reclassified dark-forest by the caller goes silent at evaluation too", () => {
    const c = freshCtx({
      mapId: "sector0",
      phase: "DAY",
      playerPos: { x: 15, y: 18 },
      areas: { sector0: { placeClass: "dark-forest", charge: "UNMARKED", displayName: "Sector 0" } },
    });
    expect(eligibleEvents(c)).toEqual([]);
  });
});

// ------------------------------------------------------------ SMOKE: the bay-steps snatch, end to end

describe("SMOKE — witnessed event end to end (real store)", () => {
  it("Boot Harbor theft: eligible → join → win → witnessed deed in the real ledger → standing moves → arc interlock", () => {
    const sink = realSink();
    const start = freshCtx({ mapId: "sector0", phase: "DAY", beat: 1000, playerPos: { x: 15, y: 18 } });
    expect(eligibleEvents(start).map((e) => e.id)).toContain("bh_snatch_at_bay_steps");
    expect(arcAvailability(start, "arc_fishers_empty_lead")).toBe("available");

    const result = resolveOutcome(sink, start, "bh_snatch_at_bay_steps", "join-win");

    // The deed is in the REAL store ledger, witnessed.
    const ledger = useGameStore.getState().deedLedger;
    expect(ledger).toHaveLength(1);
    expect(result.entry).not.toBeNull();
    expect(result.entry!.deed).toBe("return-stolen-mochi");
    expect(result.entry!.areaId).toBe("sector0");
    expect(result.entry!.witnessedBy).toContain("dock_fisher");
    expect(ledger[0].id).toBe(result.entry!.id);

    // Standing (derived, never stored) moved good-side.
    const morale = deriveMorale(ledger);
    expect(morale.value).toBeGreaterThan(0);
    expect(morale.band.side).toBe("good");

    // The event closed: flag set, never eligible again.
    const after = freshCtx({ state: result.state, beat: 999999, playerPos: { x: 15, y: 18 } });
    expect(result.state.flags).toContain("bh_snatch_resolved");
    expect(eligibleEvents(after).map((e) => e.id)).not.toContain("bh_snatch_at_bay_steps");

    // The stranger arc reads the interlock: already resolved, no second deed.
    expect(arcAvailability(after, "arc_fishers_empty_lead")).toBe("already-resolved");
  });

  it("ignore writes nothing and the world waits out its cooldown before offering again", () => {
    const sink = realSink();
    const start = freshCtx({ beat: 1000, playerPos: { x: 15, y: 18 } });
    const result = resolveOutcome(sink, start, "bh_snatch_at_bay_steps", "ignore");
    expect(result.entry).toBeNull();
    expect(useGameStore.getState().deedLedger).toHaveLength(0);

    const soon = freshCtx({ state: result.state, beat: 1000 + 239, playerPos: { x: 15, y: 18 } });
    expect(eligibleEvents(soon).map((e) => e.id)).not.toContain("bh_snatch_at_bay_steps");
    const later = freshCtx({ state: result.state, beat: 1000 + 240, playerPos: { x: 15, y: 18 } });
    expect(eligibleEvents(later).map((e) => e.id)).toContain("bh_snatch_at_bay_steps");
  });

  it("abetting writes witnessed infamy (steal-attempt) and closes the event dark", () => {
    const sink = realSink();
    const start = freshCtx({ beat: 1000, playerPos: { x: 15, y: 18 } });
    const result = resolveOutcome(sink, start, "bh_snatch_at_bay_steps", "abet");
    const ledger = useGameStore.getState().deedLedger;
    expect(ledger).toHaveLength(1);
    expect(ledger[0].deed).toBe("steal-attempt");
    expect(deriveMorale(ledger).value).toBeLessThan(0);
    expect(result.state.flags).toContain("bh_snatch_abetted");
  });

  it("taking the stray for yourself is theft, and a witness saw it", () => {
    const sink = realSink();
    const start = freshCtx({ mapId: "binary_fields", beat: 500, playerPos: { x: 14, y: 19 } });
    const result = resolveOutcome(sink, start, "st_stray_in_the_fields", "take");
    expect(result.entry!.deed).toBe("steal-mochi");
    expect(result.entry!.witnessedBy).toContain("town_lass");
    expect(deriveMorale(useGameStore.getState().deedLedger).band.side).toBe("bad");
  });

  it("unknown events and outcomes throw — bugs are loud, never absorbed", () => {
    const sink = realSink();
    expect(() => resolveOutcome(sink, freshCtx({}), "nope", "ignore")).toThrow();
    expect(() => resolveOutcome(sink, freshCtx({}), "bh_snatch_at_bay_steps", "nope")).toThrow();
  });
});

// ------------------------------------------------------------ stranger arcs

describe("stranger arcs", () => {
  it("the herbalist's arc walks its stages and writes reunite-stray at the return", () => {
    const sink = realSink();
    let c = freshCtx({ mapId: "binary_fields", beat: 2000 });
    expect(arcAvailability(c, "arc_herbalists_kittember")).toBe("available");
    expect(currentArcStage(c, "arc_herbalists_kittember")!.trigger).toMatchObject({ type: "talk", npcId: "travelling_herbalist" });

    const s0 = completeArcStage(sink, c, "arc_herbalists_kittember");
    expect(s0.completed).toBe(false);
    expect(s0.entries).toEqual([]);
    c = freshCtx({ mapId: "binary_fields", beat: 2100, state: s0.state });
    expect(arcAvailability(c, "arc_herbalists_kittember")).toBe("in-progress");

    // The middle stage is dusk-gated in its trigger data.
    const stage1 = currentArcStage(c, "arc_herbalists_kittember")!;
    expect(stage1.trigger).toMatchObject({ type: "tile", mapId: "route_1" });
    if (stage1.trigger.type === "tile") expect(stage1.trigger.phases).toEqual(["EVE", "NITE"]);

    const s1 = completeArcStage(sink, c, "arc_herbalists_kittember");
    c = freshCtx({ mapId: "binary_fields", beat: 2200, state: s1.state });
    const s2 = completeArcStage(sink, c, "arc_herbalists_kittember");
    expect(s2.completed).toBe(true);
    expect(s2.entries.map((e) => e.deed)).toEqual(["reunite-stray"]);
    expect(s2.entries[0].witnessedBy).toContain("travelling_herbalist");
    expect(s2.state.flags).toContain("arc-done:arc_herbalists_kittember");
    expect(arcAvailability(freshCtx({ state: s2.state }), "arc_herbalists_kittember")).toBe("done");
    expect(useGameStore.getState().deedLedger.map((e) => e.deed)).toEqual(["reunite-stray"]);
  });

  it("the fisher's arc, walked the slow way, writes the return deed only at the return", () => {
    const sink = realSink();
    let state = emptyLivingWorldState();
    for (let i = 0; i < 3; i++) {
      const r = completeArcStage(sink, freshCtx({ beat: 3000 + i * 10, state }), "arc_fishers_empty_lead");
      state = r.state;
      expect(r.entries).toEqual([]);
    }
    const last = completeArcStage(sink, freshCtx({ beat: 3100, state }), "arc_fishers_empty_lead");
    expect(last.completed).toBe(true);
    expect(last.entries.map((e) => e.deed)).toEqual(["return-stolen-mochi"]);
  });
});

// ------------------------------------------------------------ ambient routines

describe("ambient routines", () => {
  it("mom is home-front by day and authored-absent late (quiet is a phase of life)", () => {
    const day = routineFor("mom", freshCtx({ phase: "DAY" }));
    expect(day?.present).toBe(true);
    expect(day?.entry.x).toBe(5);
    const late = routineFor("mom", freshCtx({ phase: "LATE" }));
    expect(late?.present).toBe(false);
  });

  it("the fisher's lines turn to thanks after the return — same man, changed world", () => {
    const before = routineFor("dock_fisher", freshCtx({ phase: "DAY" }));
    expect(before?.lines?.join(" ")).toContain("Forty years");
    const after = routineFor(
      "dock_fisher",
      freshCtx({ phase: "DAY", state: { ...emptyLivingWorldState(), flags: ["bh_snatch_resolved"] } }),
    );
    expect(after?.lines?.join(" ")).toContain("Still can't quite believe it");
  });

  it("the herbalist speaks differently to a Ranger the world has vouched for (derived standing, no number shown)", () => {
    const stranger = routineFor("travelling_herbalist", freshCtx({ phase: "DAY" }));
    expect(stranger?.lines?.[0]).toContain("Mind the pack");
    const sink = realSink();
    resolveOutcome(sink, freshCtx({ beat: 700, playerPos: { x: 15, y: 18 } }), "bh_snatch_at_bay_steps", "join-win");
    const known = routineFor("travelling_herbalist", freshCtx({ phase: "DAY" }));
    expect(known?.lines?.[0]).toContain("I know your face");
  });

  it("routines resolve for every placed NPC on both opening towns, at every phase", () => {
    for (const mapId of ["sector0", "binary_fields"]) {
      for (const phase of ["LATE", "MORN", "DAY", "EVE", "NITE"] as const) {
        const reads = routinesForMap(mapId, freshCtx({ phase }));
        const placed = new Set(AMBIENT_ROUTINES.filter((r) => r.mapId === mapId).map((r) => r.npcId));
        expect(reads.length, `${mapId}/${phase}`).toBe(placed.size);
      }
    }
  });
});
