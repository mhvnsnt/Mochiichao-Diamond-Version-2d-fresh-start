import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  checkInNews,
  CHECK_IN_NEWS_KINDS,
  type CheckInNewsOptions,
} from "./garden-news";
import type { MovementRecord } from "./garden-movement";

const ARRIVAL: MovementRecord = {
  id: "m1",
  creatureId: "c1",
  verb: "garden-arrival",
  from: "wild",
  to: "meadow",
  at: 10,
};
const DEPARTURE: MovementRecord = {
  id: "m2",
  creatureId: "c2",
  verb: "garden-departure",
  from: "meadow",
  to: "wild",
  at: 20,
};
const RELEASE_EDGE: MovementRecord = {
  id: "m3",
  creatureId: "c3",
  verb: "release",
  from: "keep",
  to: "garden-edge",
  at: 30,
};
const RELEASE_FAR: MovementRecord = {
  id: "m4",
  creatureId: "c4",
  verb: "release",
  from: "keep",
  to: "far-field",
  at: 40,
};
const GIFT: MovementRecord = {
  id: "m5",
  creatureId: "c5",
  verb: "gift",
  from: "keep-a",
  to: "keep-b",
  at: 50,
};

describe("garden check-in news read (B3 §2.5, pure form)", () => {
  it("a garden arrival after the last check-in is arrival news", () => {
    expect(checkInNews([ARRIVAL], { since: 5 })).toEqual([
      { creatureId: "c1", kind: "arrival", movementId: "m1", at: 10, from: "wild", to: "meadow" },
    ]);
  });

  it("movements at or before the check-in stamp are already seen, not news", () => {
    expect(checkInNews([ARRIVAL], { since: 10 })).toEqual([]);
    expect(checkInNews([ARRIVAL], { since: 11 })).toEqual([]);
  });

  it("a null since means never checked in: the whole log is news", () => {
    const items = checkInNews([ARRIVAL, DEPARTURE], { since: null });
    expect(items.map((i) => i.kind)).toEqual(["arrival", "departure"]);
  });

  it("a garden departure is departure news", () => {
    expect(checkInNews([DEPARTURE], { since: null })[0].kind).toBe("departure");
  });

  it("a release to a caller-supplied edge place is an edge-sighting", () => {
    expect(
      checkInNews([RELEASE_EDGE], { since: null, gardenEdge: new Set(["garden-edge"]) }),
    ).toEqual([
      { creatureId: "c3", kind: "edge-sighting", movementId: "m3", at: 30, from: "keep", to: "garden-edge" },
    ]);
  });

  it("a release elsewhere is not an edge-sighting, and without an edge set no release is one", () => {
    expect(
      checkInNews([RELEASE_FAR], { since: null, gardenEdge: ["garden-edge"] }),
    ).toEqual([]);
    expect(checkInNews([RELEASE_EDGE], { since: null })).toEqual([]);
  });

  it("a supplied garden-homes set filters arrivals and departures by place", () => {
    const opts: CheckInNewsOptions = { since: null, gardenHomes: ["meadow"] };
    expect(checkInNews([ARRIVAL, DEPARTURE], opts)).toHaveLength(2);
    const elsewhere: MovementRecord = { ...ARRIVAL, id: "m9", to: "other" };
    expect(checkInNews([elsewhere], opts)).toEqual([]);
    const fromElsewhere: MovementRecord = { ...DEPARTURE, id: "m10", from: "other" };
    expect(checkInNews([fromElsewhere], opts)).toEqual([]);
  });

  it("keeper-to-keeper verbs are never Garden news", () => {
    const trade: MovementRecord = { ...GIFT, id: "m6", verb: "trade" };
    const transfer: MovementRecord = { ...GIFT, id: "m7", verb: "transfer" };
    expect(checkInNews([GIFT, trade, transfer], { since: null })).toEqual([]);
  });

  it("news is in stamp order, stable for equal stamps", () => {
    const late: MovementRecord = { ...ARRIVAL, id: "m8", at: 5 };
    const items = checkInNews([ARRIVAL, DEPARTURE, late], { since: null });
    expect(items.map((i) => i.movementId)).toEqual(["m8", "m1", "m2"]);
    const tied: MovementRecord = { ...DEPARTURE, id: "m11", at: 10 };
    const tiedItems = checkInNews([ARRIVAL, tied], { since: null });
    expect(tiedItems.map((i) => i.movementId)).toEqual(["m1", "m11"]);
  });

  it("the kind set is exactly arrival / departure / edge-sighting: no social kind exists", () => {
    expect([...CHECK_IN_NEWS_KINDS].sort()).toEqual([
      "arrival",
      "departure",
      "edge-sighting",
    ]);
    // A log of movements alone can never produce a "fell out" item.
    const items = checkInNews([ARRIVAL, DEPARTURE, RELEASE_EDGE], {
      since: null,
      gardenEdge: ["garden-edge"],
    });
    expect(items.every((i) => CHECK_IN_NEWS_KINDS.includes(i.kind))).toBe(true);
  });

  it("purity: the input log and its records are never mutated or reordered", () => {
    const log = [DEPARTURE, ARRIVAL];
    const before = JSON.stringify(log);
    checkInNews(log, { since: null });
    expect(JSON.stringify(log)).toBe(before);
    expect(log.map((r) => r.id)).toEqual(["m2", "m1"]);
  });

  it("loud failures: malformed record, non-finite since, malformed caller set", () => {
    const bad = { ...ARRIVAL, verb: "teleport" } as unknown as MovementRecord;
    expect(() => checkInNews([bad], { since: null })).toThrow();
    expect(() => checkInNews([ARRIVAL], { since: Number.NaN })).toThrow();
    expect(() => checkInNews([ARRIVAL], { since: null, gardenHomes: [""] })).toThrow();
    expect(() => checkInNews([ARRIVAL], { since: null, gardenEdge: ["", "edge"] })).toThrow();
  });

  it("staging locks: no live module imports the news module yet", () => {
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
    expect(wiring).not.toContain("garden-news");
    expect(view).not.toContain("garden-news");
    expect(phase4).not.toContain("garden-news");
    expect(register).not.toContain("garden-news");
  });
});
