// Field-technique engine — stub-kill S-3 / gap-fill S24 (2026-10-29).
//
// Before this module, WorldConstants.HM_REQUIRED and the technique
// tiles (HM_ROCK / HM_CUT / HM_WATERFALL, water) were dead data: 22
// references, all inside WorldConstants.ts itself, and the engine's
// movement code hard-blocked water and ignored the rest. This module
// is the gate-object engine that reads the table; WorldEngine calls
// it from the movement path.
//
// PROVENANCE (source-first): the check/perform shape is Pokémon's
// field-move flow, ported at the language seam — pret-pokeemerald
// src/fldeff_cut.c / fldeff_rocksmash.c / fldeff_strength.c (the
// field effect that plays when the verb is used on its obstacle) and
// the party-check that precedes them (a party member must know the
// move; the field-move scripts refuse otherwise), plus
// pret-pokeheartgold src/field/rock_smash_item.c for the smash side.
// Our differences are data, not design: the verbs carry OUR Rare
// names (src/registry-completion: RARE-FIELD-EFFECTS.md — Slice,
// Mist Clear, Deep Dive, Illuminate, Ascend, Crag Climb, Boulder
// Break, Mighty Push, Wave, Cascade, Vortex), and "held" is read
// from the tech.* flag namespace of our own event-flag schema
// (src/data/core/schemas/event-flag.schema.json, condition kind
// technique_held) instead of a badge check.
//
// Held vs performed are separate facts (List 13): `techniqueFlags`
// (gameStore) records HELD; a performance additionally needs a live
// party member who knows the source move or the verb itself. Every
// flag starts un-granted — acquisition fiction and grants are owner
// slots, wired here as checks only.
//
// Tile 15 split (completeness addenda S24): the old HM_ROCK tile
// conflated two different verbs — Boulder Break smashes a rock in
// place, Mighty Push moves a boulder. Tile 15 is now the smashable
// rock (what Cave of Echoes authors at (15,8) and (10,16)); the new
// tile 26 is the pushable boulder. No map authors tile 26 yet —
// placements are content, recorded as owed, not invented here.
//
// Context verbs (Illuminate, Deep Dive, Vortex, Crag Climb,
// Mist Clear, Ascend) have their CHECK wired here; their world hooks
// belong to systems that do not exist in this tree yet (dark-map
// lighting, paired dive maps, fog, map travel) and land with those
// systems — see the stub-kill KILL-LEDGER for the exact split.

import { TILE } from "../world/WorldConstants";
import type { MochiiInstance } from "./types";

export type TechniqueKind = "tile" | "traverse" | "context";

export interface FieldTechnique {
  /** Our Rare display name. */
  name: string;
  /** The Pokémon field move it ports. */
  sourceMove: string;
  /** tech.* flag key (event-flag schema namespace). */
  flag: string;
  kind: TechniqueKind;
  /** Tiles this verb gates (tile/traverse kinds). */
  tiles?: number[];
  /** What the player reads when the gate refuses, before the reason. */
  obstacleText: string;
}

const T = (
  name: string,
  sourceMove: string,
  kind: TechniqueKind,
  obstacleText: string,
  tiles?: number[],
): FieldTechnique => ({
  name,
  sourceMove,
  flag: `tech.${name.toLowerCase().replace(/[^a-z]+/g, "_")}`,
  kind,
  tiles,
  obstacleText,
});

export const FIELD_TECHNIQUES: FieldTechnique[] = [
  T("Slice", "Cut", "tile", "A small tree blocks the way.", [TILE.HM_CUT]),
  T("Boulder Break", "Rock Smash", "tile", "A cracked rock blocks the way.", [TILE.HM_ROCK]),
  T("Mighty Push", "Strength", "tile", "A huge boulder blocks the way.", [TILE.HM_BOULDER]),
  T("Cascade", "Waterfall", "traverse", "A waterfall bars the way up.", [TILE.HM_WATERFALL]),
  T("Wave", "Surf", "traverse", "The water's edge. A partner could carry you across.", [TILE.WATER]),
  T("Deep Dive", "Dive", "context", "Deep water, dark below."),
  T("Vortex", "Whirlpool", "context", "A whirlpool churns, barring the way."),
  T("Crag Climb", "Rock Climb", "context", "A sheer rock face rises here."),
  T("Mist Clear", "Defog", "context", "Thick mist swallows the path."),
  T("Illuminate", "Flash", "context", "It is pitch black. A light would help."),
  T("Ascend", "Fly", "context", "Open sky stretches above."),
];

const BY_TILE = new Map<number, FieldTechnique>();
for (const tech of FIELD_TECHNIQUES) {
  for (const tile of tech.tiles ?? []) BY_TILE.set(tile, tech);
}

export function techniqueForTile(tileId: number): FieldTechnique | null {
  return BY_TILE.get(tileId) ?? null;
}

export function techniqueByName(name: string): FieldTechnique | null {
  return FIELD_TECHNIQUES.find((t) => t.name === name) ?? null;
}

/** HELD: the tech.* acquisition fact (schema namespace). */
export function techniqueHeld(
  tech: FieldTechnique,
  flags: Record<string, boolean>,
): boolean {
  return flags[tech.flag] === true;
}

const idForm = (name: string) => name.toUpperCase().replace(/[^A-Z]+/g, "_");

/** PERFORMER: a live party member who knows the move or the verb.
 *  Instance move lists carry move IDs (MOVES_DB keys); display-name
 *  forms are accepted too so authored teams read either way. */
export function performerFor(
  tech: FieldTechnique,
  party: readonly MochiiInstance[],
): MochiiInstance | null {
  const wanted = new Set([
    tech.sourceMove,
    tech.name,
    idForm(tech.sourceMove),
    idForm(tech.name),
  ]);
  return (
    party.find((m) => m.hp > 0 && (m.moves ?? []).some((mv) => wanted.has(mv))) ?? null
  );
}

export type GateVerdict =
  | { open: true; tech: FieldTechnique; performer: MochiiInstance }
  | {
      open: false;
      tech: FieldTechnique;
      reason: "not-held" | "no-performer";
      text: string;
    };

/**
 * The gate evaluation the engine runs when a step targets a gated
 * tile. Returns null when the tile carries no technique gate.
 */
export function evaluateTileGate(
  tileId: number,
  flags: Record<string, boolean>,
  party: readonly MochiiInstance[],
): GateVerdict | null {
  const tech = techniqueForTile(tileId);
  if (!tech) return null;
  if (!techniqueHeld(tech, flags)) {
    return {
      open: false,
      tech,
      reason: "not-held",
      text: `${tech.obstacleText} A partner who knows ${tech.name} could get past — but your party hasn't learned that technique.`,
    };
  }
  const performer = performerFor(tech, party);
  if (!performer) {
    return {
      open: false,
      tech,
      reason: "no-performer",
      text: `${tech.obstacleText} You carry the ${tech.name} technique, but no one in your party knows ${tech.sourceMove} to perform it.`,
    };
  }
  return { open: true, tech, performer };
}

/** The line the game speaks when a partner performs the verb. */
export function performedText(tech: FieldTechnique, performer: MochiiInstance): string {
  const who = performer.nickname || "Your partner";
  switch (tech.name) {
    case "Boulder Break":
      return `${who} used Boulder Break! The rock shattered!`;
    case "Slice":
      return `${who} used Slice! The tree was cut away!`;
    case "Mighty Push":
      return `${who} used Mighty Push! The boulder rolled aside!`;
    case "Cascade":
      return `${who} used Cascade! You climbed the waterfall!`;
    case "Wave":
      return `${who} used Wave! You set out across the water!`;
    default:
      return `${who} used ${tech.name}!`;
  }
}
