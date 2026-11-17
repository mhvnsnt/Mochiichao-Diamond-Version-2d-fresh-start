import { describe, expect, it } from "vitest";
import { deriveProfile } from "./partDerivation";
import type { PartGrammar } from "./partGrammar";

const GRAMMAR: PartGrammar = {
  budget: { complexityMax: null, costMax: null },
  catalogue: [
    { partId: "beak", category: "mouth", cost: 5, complexity: 1, grants: ["peck"], dietClass: "seed-eater" },
    { partId: "wing", category: "movement", cost: 20, complexity: 3, grants: ["glide"], movementClass: "aerial" },
    { partId: "claw", category: "weapon", cost: 8, complexity: 1, grants: ["peck", "slash"] },
  ],
};

describe("deriveProfile", () => {
  it("reads movement, diet and capabilities off the placed parts", () => {
    const profile = deriveProfile(
      {
        spine: { lengthClass: "short", postureClass: "biped" },
        parts: [
          { partId: "beak", slot: "head" },
          { partId: "wing", slot: "back" },
          { partId: "claw", slot: "arm-l" },
        ],
      },
      GRAMMAR,
    );
    expect(profile.movementClass).toBe("aerial");
    expect(profile.dietClass).toBe("seed-eater");
    expect(profile.capabilityGrants).toEqual(["peck", "glide", "slash"]);
  });

  it("derives nothing from unknown parts", () => {
    const profile = deriveProfile(
      { spine: { lengthClass: "short", postureClass: "biped" }, parts: [{ partId: "ghost", slot: "head" }] },
      GRAMMAR,
    );
    expect(profile).toEqual({ movementClass: null, dietClass: null, capabilityGrants: [] });
  });
});
