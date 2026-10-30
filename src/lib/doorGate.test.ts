import { describe, expect, it } from "vitest";
import { isDoorOpen, sealedDoorText } from "./doorGate";

describe("isDoorOpen", () => {
  it("opens a door with no condition", () => {
    expect(isDoorOpen(undefined, [])).toBe(true);
    expect(isDoorOpen(null, [])).toBe(true);
    expect(isDoorOpen("", [])).toBe(true);
  });
  it("opens badges>=7 at exactly 7 badges", () => {
    const badges = ["a", "b", "c", "d", "e", "f", "g"];
    expect(isDoorOpen("badges>=7", badges)).toBe(true);
  });
  it("keeps badges>=7 closed below 7 badges", () => {
    expect(isDoorOpen("badges>=7", ["a", "b", "c", "d", "e", "f"])).toBe(false);
    expect(isDoorOpen("badges>=7", [])).toBe(false);
  });
  it("opens badges>=8 (the victory_route precedent) at 8", () => {
    const badges = ["a", "b", "c", "d", "e", "f", "g", "h"];
    expect(isDoorOpen("badges>=8", badges)).toBe(true);
    expect(isDoorOpen("badges>=8", badges.slice(0, 7))).toBe(false);
  });
  it("fails closed on an unrecognised condition", () => {
    expect(isDoorOpen("flag:dojo_8_badge", ["a", "b", "c", "d", "e", "f", "g", "h"])).toBe(false);
    expect(isDoorOpen("badges>7", ["a", "b", "c", "d", "e", "f", "g"])).toBe(false);
  });
  it("tolerates surrounding whitespace in the condition", () => {
    expect(isDoorOpen(" badges>=7 ", ["a", "b", "c", "d", "e", "f", "g"])).toBe(true);
  });
});

describe("sealedDoorText", () => {
  it("names the badge count for a badges>=N door", () => {
    expect(sealedDoorText("Return Dojo — Dojo 8", "badges>=7")).toContain("at least 7 badges");
  });
  it("falls back to a plain sealed line for unknown conditions", () => {
    expect(sealedDoorText("Return Dojo — Dojo 8", "flag:x")).toBe(
      "Return Dojo — Dojo 8 is sealed.",
    );
  });
});
