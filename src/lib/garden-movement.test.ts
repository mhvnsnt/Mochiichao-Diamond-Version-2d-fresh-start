import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  MOVEMENT_VERBS,
  appendMovement,
  currentHome,
  isGardenResident,
  lastMovementForCreature,
  movementsForCreature,
  validateMovement,
  type MovementRecord,
} from "./garden-movement";

const GIFT: MovementRecord = {
  id: "m1",
  creatureId: "c1",
  verb: "gift",
  from: "keeper-a",
  to: "keeper-b",
  at: 10,
};
const ARRIVAL: MovementRecord = {
  id: "m2",
  creatureId: "c1",
  verb: "garden-arrival",
  from: "keeper-b",
  to: "garden-zone-1",
  at: 20,
};
const DEPARTURE: MovementRecord = {
  id: "m3",
  creatureId: "c1",
  verb: "garden-departure",
  from: "garden-zone-1",
  to: "keeper-b",
  at: 30,
};

describe("garden-movement one doorway (B3 §2.8, pure form)", () => {
  it("the verb set is exactly the spec's six verbs, in the spec's order", () => {
    expect([...MOVEMENT_VERBS]).toEqual([
      "gift",
      "trade",
      "transfer",
      "release",
      "garden-arrival",
      "garden-departure",
    ]);
  });

  it("a well-formed record validates silently", () => {
    expect(() => validateMovement(GIFT)).not.toThrow();
  });

  it("validation fails loudly: empty id, empty creatureId, unknown verb, bad endpoints, non-finite stamp", () => {
    expect(() => validateMovement({ ...GIFT, id: "" })).toThrow(/id/);
    expect(() => validateMovement({ ...GIFT, creatureId: "" })).toThrow(/creatureId/);
    expect(() => validateMovement({ ...GIFT, verb: "teleport" })).toThrow(/unknown movement verb/);
    expect(() => validateMovement({ ...GIFT, from: 7 })).toThrow(/from/);
    expect(() => validateMovement({ ...GIFT, to: "" })).toThrow(/to/);
    expect(() => validateMovement({ ...GIFT, at: Number.NaN })).toThrow(/at/);
    expect(() => validateMovement(null)).toThrow(/object/);
  });

  it("append returns a new log and never mutates the input", () => {
    const log: MovementRecord[] = [GIFT];
    const next = appendMovement(log, ARRIVAL);
    expect(next).toEqual([GIFT, ARRIVAL]);
    expect(next).not.toBe(log);
    expect(log).toEqual([GIFT]);
  });

  it("append fails loudly on a duplicate id and on a malformed record, appending nothing", () => {
    expect(() => appendMovement([GIFT], { ...ARRIVAL, id: "m1" })).toThrow(/duplicate/);
    expect(() =>
      appendMovement([GIFT], { ...ARRIVAL, verb: "teleport" as never }),
    ).toThrow(/unknown movement verb/);
  });

  it("movementsForCreature filters by creature and orders by stamp, stable on ties", () => {
    const log = appendMovement(
      appendMovement(appendMovement([], DEPARTURE), GIFT),
      { ...ARRIVAL, at: 10 },
    );
    // c1's records in stamp order: GIFT (10, inserted first) then ARRIVAL (10), then DEPARTURE (30)
    expect(movementsForCreature(log, "c1").map((r) => r.id)).toEqual(["m1", "m2", "m3"]);
    expect(movementsForCreature(log, "c2")).toEqual([]);
  });

  it("movementsForCreature fails loudly on an empty creature id", () => {
    expect(() => movementsForCreature([GIFT], "")).toThrow(/creatureId/);
  });

  it("lastMovementForCreature returns the latest record, or null when the creature never moved", () => {
    const log = appendMovement(appendMovement([], GIFT), ARRIVAL);
    expect(lastMovementForCreature(log, "c1")).toEqual(ARRIVAL);
    expect(lastMovementForCreature(log, "c2")).toBeNull();
    expect(lastMovementForCreature([], "c1")).toBeNull();
  });

  it("currentHome reads the last destination, or null with no movement or no destination", () => {
    const log = appendMovement(appendMovement([], GIFT), ARRIVAL);
    expect(currentHome(log, "c1")).toBe("garden-zone-1");
    expect(currentHome(log, "c2")).toBeNull();
    const released = appendMovement([], {
      id: "m9",
      creatureId: "c9",
      verb: "release",
      from: "keeper-b",
      to: null,
      at: 5,
    });
    // A release recorded with no destination reads no home — the caller
    // owns the destination encoding; this module invents none.
    expect(currentHome(released, "c9")).toBeNull();
  });

  it("a release recorded to a caller-supplied destination reads that destination as home", () => {
    const log = appendMovement([], {
      id: "m9",
      creatureId: "c9",
      verb: "release",
      from: "keeper-b",
      to: "wild",
      at: 5,
    });
    expect(currentHome(log, "c9")).toBe("wild");
  });

  it("isGardenResident is true only while the last destination is a caller-supplied Garden home", () => {
    const homes = ["garden-zone-1", "garden-zone-2"];
    const arrived = appendMovement(appendMovement([], GIFT), ARRIVAL);
    expect(isGardenResident(arrived, "c1", homes)).toBe(true);
    expect(isGardenResident(arrived, "c1", new Set(homes))).toBe(true);
    const departed = appendMovement(arrived, DEPARTURE);
    expect(isGardenResident(departed, "c1", homes)).toBe(false);
    expect(isGardenResident([], "c1", homes)).toBe(false);
    expect(isGardenResident(arrived, "c2", homes)).toBe(false);
  });

  it("no ending is decided here: no verb, field, or function names death, loss, or succession", () => {
    const src = readFileSync(new URL("./garden-movement.ts", import.meta.url), "utf8");
    expect(src).not.toMatch(/death|reincarnation|succession|grey cocoon/i);
  });

  it("purity: reads return fresh arrays and never reorder the log", () => {
    const log = appendMovement(appendMovement([], DEPARTURE), GIFT);
    const first = movementsForCreature(log, "c1");
    const second = movementsForCreature(log, "c1");
    expect(first).not.toBe(second);
    expect(first).toEqual(second);
    expect(log.map((r) => r.id)).toEqual(["m3", "m1"]);
  });

  it("staging locks: no live module imports the movement module yet", () => {
    const wiring = readFileSync(new URL("./garden-wiring.ts", import.meta.url), "utf8");
    const view = readFileSync(
      new URL("../components/views/GardenView.tsx", import.meta.url),
      "utf8",
    );
    const phase4 = readFileSync(
      new URL("./wiring/phase4-garden.ts", import.meta.url),
      "utf8",
    );
    const register = readFileSync(new URL("./garden-register.ts", import.meta.url), "utf8");
    expect(wiring).not.toContain("garden-movement");
    expect(view).not.toContain("garden-movement");
    expect(phase4).not.toContain("garden-movement");
    expect(register).not.toContain("garden-movement");
  });
});
