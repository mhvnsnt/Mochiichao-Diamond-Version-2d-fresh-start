/**
 * Move-animation coverage lock (owner order 2026-10-29).
 * Fails if: any live move lacks a profile, any profile is a generic
 * fallback, any two moves share a rendered signature outside the
 * justified same-source groups, or the owner's proof pair — Tackle vs
 * Swift Movement (Quick Attack) — ever collapse back into one animation.
 */
import { describe, expect, it } from "vitest";
import { MOVES_DB } from "./moves";
import { MOCHIICHAO_FULLPOOL_MOVES } from "./generated/fullpool_moves_catalogue";
import { SPECIES_DB } from "./species";
import {
  getMoveAnimation,
  getMoveAnimationProfile,
  validateMoveAnimationCoverage,
} from "./moveAnimation";

describe("move animation wiring", () => {
  it("covers every live move with a bespoke or composed-unique profile", () => {
    // 122 original + batch-3 full pool (move-completion composition)
    expect(Object.keys(MOVES_DB)).toHaveLength(122 + Object.keys(MOCHIICHAO_FULLPOOL_MOVES).length);
    expect(validateMoveAnimationCoverage()).toEqual([]);
    for (const id of Object.keys(MOVES_DB)) {
      const entry = getMoveAnimation(id);
      expect(entry, id).not.toBeNull();
      expect(entry!.profile.delivery, id).toBeTruthy();
      expect(entry!.profile.signature, id).toBeTruthy();
    }
  });

  it("proof pair: Tackle and Swift Movement are visibly different animations", () => {
    const tackle = getMoveAnimationProfile("TACKLE")!;
    const swift = getMoveAnimationProfile("QUICK_ATTACK")!;
    expect(tackle.delivery).toBe("contact_lunge");
    expect(swift.delivery).toBe("blitz_afterimage");
    expect(swift.trail?.kind).toBe("speed_streaks");
    expect(swift.trail?.afterimages).toBeGreaterThan(0);
    expect(tackle.trail).toBeNull();
    expect(tackle.timelineMs.total).toBeGreaterThan(swift.timelineMs.total);
    expect(tackle.impact.amplitudePx).toBeGreaterThan(swift.impact.amplitudePx);
    expect(tackle.signature).not.toBe(swift.signature);
    // and neither is Body Slam (the old shared BODY_SLAM_MOVE label):
    const slam = getMoveAnimationProfile("BODY_SLAM_MOVE")!;
    expect(slam.signature).not.toBe(tackle.signature);
    expect(slam.impact.amplitudePx).toBeGreaterThan(tackle.impact.amplitudePx);
  });

  it("every move used by species learnsets (Sequences 1-3 roster) is covered", () => {
    const used = new Set<string>();
    for (const sp of Object.values(SPECIES_DB)) {
      for (const step of sp.learnset ?? []) used.add(step.moveId);
    }
    expect(used.size).toBeGreaterThan(0);
    for (const id of used) expect(getMoveAnimation(id), id).not.toBeNull();
  });

  it("representative deliveries exist across the grammar families", () => {
    const deliveries = new Set(Object.keys(MOVES_DB).map((id) => getMoveAnimationProfile(id)!.delivery));
    for (const d of ["contact_lunge", "blitz_afterimage", "projectile", "beam", "spread",
                     "multi_hit", "field_impact", "self_aura", "status_gaze", "status_cloud",
                     "charge_release", "drain_link", "protect_wall"]) {
      expect(deliveries.has(d as never), d).toBe(true);
    }
  });

  it("renamed moves carry their source move on the stable id", () => {
    expect(getMoveAnimation("QUICK_ATTACK")!.displayName).toBe("Swift Movement");
    expect(getMoveAnimation("QUICK_ATTACK")!.sourcePokemonMove).toBe("QUICK_ATTACK");
    expect(getMoveAnimation("AQUA_JET")!.displayName).toBe("Hydro Rush");
    expect(getMoveAnimation("RAZOR_LEAF")!.displayName).toBe("Leaf Blast");
    expect(getMoveAnimation("SHADOW_PULSE")!.displayName).toBe("Dark Wave");
    expect(getMoveAnimation("SHADOW_PULSE")!.sourcePokemonMove).toBe("SHADOW_BALL");
  });
});
