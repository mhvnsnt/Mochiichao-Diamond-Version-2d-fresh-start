// Ability-from-parts derivation (teardown-spore, T2).
//
// The documented Spore derivation shape, in Mochiichao vocabulary: what
// a creature CAN do is read off the parts it is built from. This core is
// a pure function over the T1 build record + catalogue — every output
// comes from the catalogue rows' own declared grants, so the derivation
// invents nothing: no part content, no stats.
//
// FIDELITY RULE (owner law): canon stats Jamar has set always win. This
// profile ANNOTATES and gap-fills; it never overwrites an owner-set
// value, and consumers must treat it that way (consumption is QUEUED
// behind the species-records `build` field — see teardown-spore
// WIRING-PLAN T2b).

import { catalogueIndex, type BuildRecord, type PartGrammar } from "./partGrammar";

export interface DerivedProfile {
  /** Movement class conferred by the build's parts, or null if none declare one. */
  movementClass: string | null;
  /** Diet class conferred by the build's mouth parts, or null if none declare one. */
  dietClass: string | null;
  /** Union of capability ids granted by the placed parts, in placement order. */
  capabilityGrants: string[];
}

export function deriveProfile(build: BuildRecord, grammar: PartGrammar): DerivedProfile {
  const index = catalogueIndex(grammar);
  const grants: string[] = [];
  let movementClass: string | null = null;
  let dietClass: string | null = null;
  for (const placed of build.parts) {
    const part = index.get(placed.partId);
    if (!part) continue;
    for (const g of part.grants) {
      if (!grants.includes(g)) grants.push(g);
    }
    if (movementClass === null && part.movementClass) movementClass = part.movementClass;
    if (dietClass === null && part.dietClass) dietClass = part.dietClass;
  }
  return { movementClass, dietClass, capabilityGrants: grants };
}
