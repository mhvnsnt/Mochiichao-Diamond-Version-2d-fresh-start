// Gap-fill S4 — Habitat Landing 5: the sound-ecology binding check.
//
// Turns the show-side #84 binding law into a mechanical check against the
// game tables, instead of a prose rule:
//
//   "A resident row may only name a species that the place's spawn table
//   stocks, in a window when that species is active."
//   (teardowns/list9-systems/84-SOUND-ECOLOGY.md — "The binding law".)
//
// Source of the rows checked: that same #84 document's "Starter tables
// (structure + canon rows only)" section. ONLY its authored rows are
// encoded here — Garden Mochii + Sproutle, Forest-surface Kittember, and
// the depths' deliberate zero. The document itself marks full row sets for
// Gate, Pond, routes, and later regions as "lane fill work" from beds that
// exist — those rows are NOT invented here, and this check does not claim
// to cover them.
//
// Grain, stated plainly because it decides two rows:
// - "Garden" in #84 is Mochiko's domain, the garden complex — checked at
//   BIOME grain (garden-complex = meadow + pond zones, S2 Landing 3). So
//   Mochii passes via the pond tables and Sproutle via the meadow table,
//   even though neither zone alone stocks both. A zone-grain reading would
//   fail Mochii in the meadow; the #84 text ("Garden resident species",
//   no zone split) does not support that reading, and the check records
//   the grain it used per row so the choice stays visible.
// - Forest surface and depths are checked at ZONE grain (one zone each).
//
// Window honesty (HAB-G5, AUDIT-REGISTER §3): every spawn slot in both
// bundles carries timeOfDay null — canon has not split these tables by
// time, and no split is invented here. So the window half of the law
// CANNOT be verified from data today: each row's window result is
// 'unverified-null', never 'active'. A future time split must flip those
// rows to a real active/inactive verdict, and this module's report shape
// already carries that field — the check fails loudly if a future edit
// seats a resident row naming a species its place does not stock, and it
// reports (never hides) that windows are still unverified.
//
// The depths fence, three ways: #84 carries zero resident rows for the
// depths, the depths ecology zone carries zero residents, and the depths
// spawn table carries zero slots. Any one of those going non-zero is a
// canon event (per #84: "adding one is a canon event requiring an owner
// ruling"), and checkSoundEcology reports it as a fence breach, not a
// quiet pass.

import { REGION1_PLACE_DATA, type PlaceData } from "./place";

export type SoundLayer = "bed" | "resident" | "event" | "absence";

export interface SoundEcologyRow {
  // #84 place label, verbatim ("Garden", "Dark Forest — surface",
  // "Dark Forest — depths"). Place labels are show-side text, not ids.
  place: string;
  layer: SoundLayer;
  // Species for resident rows (lowercase, as in the ecology + bundle
  // files); null for bed/event/absence rows, which name no species.
  species: string | null;
  window: string;
  note: string;
}

// The #84 starter rows, and only those rows. Bed/event/absence rows are
// carried so the table's shape stays auditable, but only resident rows
// are stock-checked (a bed names no species; an absence names a NOT-sound).
export const SOUND_ECOLOGY_ROWS: SoundEcologyRow[] = [
  {
    place: "Garden",
    layer: "bed",
    species: null,
    window: "morning",
    note: "Garden morning bed (exists, EP01 Scene 1); gated bed, canon.",
  },
  {
    place: "Garden",
    layer: "resident",
    species: "mochii",
    window: "morning/day",
    note: "Garden resident species (#84 Garden table).",
  },
  {
    place: "Garden",
    layer: "resident",
    species: "sproutle",
    window: "dawn/day",
    note: "Garden-plant register (#84 Garden table).",
  },
  {
    place: "Garden",
    layer: "event",
    species: null,
    window: "on beat",
    note: "Gate bell (foley-first, exists in EP01 spot list); not a loop.",
  },
  {
    place: "Garden",
    layer: "absence",
    species: null,
    window: "night",
    note: "Garden sleeps: resident rows off; bed thins to night register.",
  },
  {
    place: "Dark Forest — surface",
    layer: "bed",
    species: null,
    window: "always",
    note: "Hum bed (the Forest's humming surface, canon).",
  },
  {
    place: "Dark Forest — surface",
    layer: "resident",
    species: "kittember",
    window: "dusk/night",
    note: "Wild Kittember is canon in the Forest (#84 surface table).",
  },
  {
    place: "Dark Forest — surface",
    layer: "absence",
    species: null,
    window: "always",
    note: "No birdsong from inside — canon, engineered absence.",
  },
  // Depths: deliberately NO resident row. The absence row below is the
  // data form of the fence; it is not a resident row and is not
  // stock-checked.
  {
    place: "Dark Forest — depths",
    layer: "absence",
    species: null,
    window: "always",
    note: "The depths table is empty on purpose; SCORE-STATE: ABSENCE.",
  },
];

export interface SoundEcologyRowResult {
  row: SoundEcologyRow;
  // Stock check, at the grain recorded in `grain`.
  stocked: boolean | null; // null = not a resident row, nothing to stock
  grain: "biome" | "zone" | null;
  // Window check: 'unverified-null' while every slot carries timeOfDay
  // null (today, for every row); 'active'/'inactive' only once a canon
  // time split exists to check against.
  window: "unverified-null" | "active" | "inactive" | null;
  stockedSpecies: string[];
}

export interface SoundEcologyReport {
  rows: SoundEcologyRowResult[];
  depthsResidentRows: number;
  depthsEcologyResidents: number;
  depthsBundleSlots: number;
  // True only while all three depths counts are zero (the fence holds).
  depthsFenceHolds: boolean;
  // True only while every resident row is stocked. Window verification
  // is NOT part of this flag — see the header: windows are unverified
  // today by data, and folding them in would fake a pass or a fail.
  allResidentRowsStocked: boolean;
}

function speciesInBiome(data: PlaceData, biomeId: string): string[] {
  const biome = data.biomes.find((b) => b.biomeId === biomeId);
  if (!biome) return [];
  const zoneIds = new Set(biome.zoneIds);
  const areaIds = new Set(
    data.zones.filter((z) => zoneIds.has(z.zoneId) && z.areaId !== null).map((z) => z.areaId as string),
  );
  const out: string[] = [];
  for (const areas of data.bundles) {
    for (const area of areas) {
      if (!areaIds.has(area.areaId)) continue;
      for (const table of area.tables) {
        for (const slot of table.slots) {
          if (!out.includes(slot.speciesId)) out.push(slot.speciesId);
        }
      }
    }
  }
  return out;
}

function speciesInZone(data: PlaceData, zoneId: string, depthTier?: string): string[] {
  const zone = data.zones.find((z) => z.zoneId === zoneId);
  if (!zone || zone.areaId === null) return [];
  const out: string[] = [];
  for (const areas of data.bundles) {
    for (const area of areas) {
      if (area.areaId !== zone.areaId) continue;
      if (depthTier !== undefined && area.depthTier !== undefined && area.depthTier !== depthTier) continue;
      for (const table of area.tables) {
        for (const slot of table.slots) {
          if (!out.includes(slot.speciesId)) out.push(slot.speciesId);
        }
      }
    }
  }
  return out;
}

function allSlotsTimeOfDayNull(data: PlaceData): boolean {
  for (const areas of data.bundles) {
    for (const area of areas) {
      for (const table of area.tables) {
        for (const slot of table.slots) {
          if (slot.timeOfDay !== null) return false;
        }
      }
    }
  }
  return true;
}

export function checkSoundEcology(
  rows: SoundEcologyRow[] = SOUND_ECOLOGY_ROWS,
  data: PlaceData = REGION1_PLACE_DATA,
): SoundEcologyReport {
  const windowsUnverified = allSlotsTimeOfDayNull(data);
  const results: SoundEcologyRowResult[] = rows.map((row) => {
    if (row.layer !== "resident" || row.species === null) {
      return { row, stocked: null, grain: null, window: null, stockedSpecies: [] };
    }
    let stockedSpecies: string[] = [];
    let grain: "biome" | "zone";
    if (row.place === "Garden") {
      stockedSpecies = speciesInBiome(data, "garden-complex");
      grain = "biome";
    } else if (row.place === "Dark Forest — surface") {
      stockedSpecies = speciesInZone(data, "dark-forest-surface", "surface");
      grain = "zone";
    } else {
      // A resident row for any other #84 place has no stocked set this
      // module can prove — it must not pass by default. (Today no such
      // row exists in SOUND_ECOLOGY_ROWS; the depths carry none.)
      stockedSpecies = [];
      grain = "zone";
    }
    return {
      row,
      stocked: stockedSpecies.includes(row.species),
      grain,
      window: windowsUnverified ? "unverified-null" : null,
      stockedSpecies,
    };
  });
  const depthsZone = data.zones.find((z) => z.zoneId === "dark-forest-depths");
  const depthsBundleSlots = data.bundles
    .flat()
    .filter((a) => a.areaId === "dark-forest" && a.depthTier === "depths")
    .flatMap((a) => a.tables.flatMap((t) => t.slots)).length;
  const depthsResidentRows = rows.filter(
    (r) => r.place === "Dark Forest — depths" && r.layer === "resident",
  ).length;
  const depthsEcologyResidents = depthsZone ? depthsZone.residents.length : -1;
  return {
    rows: results,
    depthsResidentRows,
    depthsEcologyResidents,
    depthsBundleSlots,
    depthsFenceHolds:
      depthsResidentRows === 0 && depthsEcologyResidents === 0 && depthsBundleSlots === 0,
    allResidentRowsStocked: results
      .filter((r) => r.row.layer === "resident")
      .every((r) => r.stocked === true),
  };
}
