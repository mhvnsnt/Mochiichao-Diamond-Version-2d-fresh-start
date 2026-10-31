// W3 placement records — gap-fill S14 slice 3 (2026-10-31).
//
// Tests the placements block + derived habitats cache added to
// garden-wiring.ts. All fixtures are synthetic ("item-a", "zone-a");
// no recipe, item, or habitat content is authored here (owner slots
// S1/S5 in the wiring plan).
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  emptyPlacements,
  harvestPlot,
  newGardenRecord,
  placementCellsInZone,
  plantPlot,
  recomputeHabitats,
  removePlacementCell,
  setPlacementCell,
  solveZoneHabitat,
  upgradeGardenRecord,
  zonePlacementToHabitatPlacement,
  type GardenSaveRecord,
} from './garden-wiring';
import type { HabitatRecipe } from './garden-habitats';

const pairRecipe: HabitatRecipe = {
  id: 'hab-a',
  tier: 1,
  requires: [{ item: 'item-a', count: 2 }],
};

const zonedRecipe: HabitatRecipe = {
  id: 'hab-z',
  tier: 2,
  requires: [{ item: 'item-a', count: 1 }],
  zone: 'zone-a',
};

function placed(zone: string, key: string, itemId: string, rotation = 0): GardenSaveRecord {
  return setPlacementCell(newGardenRecord('sp-a', 1), zone, key, { itemId, rotation });
}

describe('W3 — placements block on the record', () => {
  it('new records carry an empty placements block and an empty cache', () => {
    const rec = newGardenRecord('sp-a', 1);
    expect(rec.placements).toEqual({});
    expect(rec.habitats).toEqual({});
    expect(emptyPlacements()).toEqual({});
  });

  it('upgrade fills an empty placements block and cache on a legacy record', () => {
    const legacy = newGardenRecord('sp-a', 1);
    delete legacy.placements;
    delete legacy.habitats;
    const upgraded = upgradeGardenRecord(legacy, 'sp-a', 1);
    expect(upgraded.placements).toEqual({});
    expect(upgraded.habitats).toEqual({});
  });

  it('upgrade preserves placements a record already carries', () => {
    const rec = placed('zone-a', '0,0', 'item-a');
    const upgraded = upgradeGardenRecord(rec, 'sp-a', 1);
    expect(upgraded.placements).toEqual({ 'zone-a': { '0,0': { itemId: 'item-a', rotation: 0 } } });
  });

  it('setPlacementCell adds a cell without mutating the input record', () => {
    const before = newGardenRecord('sp-a', 1);
    const after = setPlacementCell(before, 'zone-a', '1,2', { itemId: 'item-a', rotation: 90 });
    expect(before.placements).toEqual({});
    expect(after.placements).toEqual({ 'zone-a': { '1,2': { itemId: 'item-a', rotation: 90 } } });
    expect(after).not.toBe(before);
  });

  it('setPlacementCell overwrites the same key and leaves other zones alone', () => {
    const rec = placed('zone-a', '0,0', 'item-a');
    const withOther = setPlacementCell(rec, 'zone-b', '9,9', { itemId: 'item-b', rotation: 0 });
    const overwritten = setPlacementCell(withOther, 'zone-a', '0,0', { itemId: 'item-c', rotation: 180 });
    expect(overwritten.placements?.['zone-a']).toEqual({ '0,0': { itemId: 'item-c', rotation: 180 } });
    expect(overwritten.placements?.['zone-b']).toEqual({ '9,9': { itemId: 'item-b', rotation: 0 } });
  });

  it('setPlacementCell stores rotation verbatim, including fractional facings', () => {
    const rec = setPlacementCell(newGardenRecord('sp-a', 1), 'zone-a', '0,0', { itemId: 'item-a', rotation: 45.5 });
    expect(rec.placements?.['zone-a']?.['0,0']?.rotation).toBe(45.5);
  });

  it('setPlacementCell throws loudly on empty zone, key, itemId, or non-finite rotation', () => {
    const rec = newGardenRecord('sp-a', 1);
    expect(() => setPlacementCell(rec, '', '0,0', { itemId: 'item-a', rotation: 0 })).toThrow(/gardenPlacement/);
    expect(() => setPlacementCell(rec, 'zone-a', '', { itemId: 'item-a', rotation: 0 })).toThrow(/gardenPlacement/);
    expect(() => setPlacementCell(rec, 'zone-a', '0,0', { itemId: '', rotation: 0 })).toThrow(/gardenPlacement/);
    expect(() => setPlacementCell(rec, 'zone-a', '0,0', { itemId: 'item-a', rotation: Number.NaN })).toThrow(/gardenPlacement/);
    expect(() => setPlacementCell(rec, 'zone-a', '0,0', { itemId: 'item-a', rotation: Number.POSITIVE_INFINITY })).toThrow(/gardenPlacement/);
  });

  it('removePlacementCell removes a cell and drops the zone when it empties', () => {
    const rec = setPlacementCell(placed('zone-a', '0,0', 'item-a'), 'zone-a', '0,1', { itemId: 'item-a', rotation: 0 });
    const oneLeft = removePlacementCell(rec, 'zone-a', '0,0');
    expect(oneLeft.placements).toEqual({ 'zone-a': { '0,1': { itemId: 'item-a', rotation: 0 } } });
    const noneLeft = removePlacementCell(oneLeft, 'zone-a', '0,1');
    expect(noneLeft.placements).toEqual({});
  });

  it('removePlacementCell of an absent cell returns the record unchanged', () => {
    const rec = placed('zone-a', '0,0', 'item-a');
    expect(removePlacementCell(rec, 'zone-a', '9,9')).toBe(rec);
    expect(removePlacementCell(rec, 'zone-nope', '0,0')).toBe(rec);
  });

  it('placementCellsInZone lists cells in zone order as copies', () => {
    const rec = setPlacementCell(placed('zone-a', '0,0', 'item-a'), 'zone-a', '0,1', { itemId: 'item-b', rotation: 90 });
    const cells = placementCellsInZone(rec, 'zone-a');
    expect(cells).toEqual([
      { key: '0,0', cell: { itemId: 'item-a', rotation: 0 } },
      { key: '0,1', cell: { itemId: 'item-b', rotation: 90 } },
    ]);
    cells[0].cell.itemId = 'mutated';
    expect(placementCellsInZone(rec, 'zone-a')[0].cell.itemId).toBe('item-a');
    expect(placementCellsInZone(rec, 'zone-nope')).toEqual([]);
  });
});

describe('W3 — solver reads over placements', () => {
  it('conversion carries cell keys as ids and categories only from the callback', () => {
    const rec = placed('zone-a', '0,0', 'item-a');
    expect(zonePlacementToHabitatPlacement(rec, 'zone-a')).toEqual({
      zoneId: 'zone-a',
      cells: [{ id: '0,0', itemId: 'item-a', categories: [] }],
    });
    const withCats = zonePlacementToHabitatPlacement(rec, 'zone-a', (itemId) =>
      itemId === 'item-a' ? ['cat-a'] : [],
    );
    expect(withCats.cells[0].categories).toEqual(['cat-a']);
  });

  it('solveZoneHabitat recognises a matching zone; extent counts cells, axes read W3 defaults', () => {
    let rec = placed('zone-a', '0,0', 'item-a');
    rec = setPlacementCell(rec, 'zone-a', '0,1', { itemId: 'item-a', rotation: 0 });
    const solved = solveZoneHabitat(rec, 'zone-a', [pairRecipe]);
    expect(solved).toEqual({ recipeId: 'hab-a', tier: 1, extent: 2, finish: 0, character: null });
  });

  it('solveZoneHabitat returns null for zone mismatch and for no match', () => {
    const rec = placed('zone-a', '0,0', 'item-a');
    expect(solveZoneHabitat(rec, 'zone-b', [zonedRecipe])).toBeNull();
    expect(solveZoneHabitat(rec, 'zone-a', [pairRecipe])).toBeNull();
  });

  it('solveZoneHabitat matches category requirements only through categoriesFor', () => {
    const catRecipe: HabitatRecipe = {
      id: 'hab-cat',
      tier: 1,
      requires: [{ category: 'cat-a', count: 1 }],
    };
    const rec = placed('zone-a', '0,0', 'item-a');
    expect(solveZoneHabitat(rec, 'zone-a', [catRecipe])).toBeNull();
    expect(solveZoneHabitat(rec, 'zone-a', [catRecipe], {
      categoriesFor: () => ['cat-a'],
    })).toEqual({ recipeId: 'hab-cat', tier: 1, extent: 1, finish: 0, character: null });
  });

  it('solveZoneHabitat honours the per-zone cap', () => {
    let rec = placed('zone-a', '0,0', 'item-a');
    rec = setPlacementCell(rec, 'zone-a', '0,1', { itemId: 'item-a', rotation: 0 });
    expect(solveZoneHabitat(rec, 'zone-a', [pairRecipe], { cap: 0 })).toBeNull();
    expect(solveZoneHabitat(rec, 'zone-a', [pairRecipe], { cap: 1 })).not.toBeNull();
  });
});

describe('W3 — derived habitats cache', () => {
  it('recomputeHabitats writes one cache entry per placed zone, null where unmatched', () => {
    let rec = placed('zone-a', '0,0', 'item-a');
    rec = setPlacementCell(rec, 'zone-a', '0,1', { itemId: 'item-a', rotation: 0 });
    rec = setPlacementCell(rec, 'zone-b', '0,0', { itemId: 'item-b', rotation: 0 });
    const recomputed = recomputeHabitats(rec, [pairRecipe]);
    expect(recomputed.habitats).toEqual({
      'zone-a': { recipeId: 'hab-a', tier: 1, extent: 2, finish: 0, character: null },
      'zone-b': null,
    });
    expect(rec.habitats).toEqual({});
  });

  it('recomputeHabitats on empty placements yields an empty cache and preserves the rest of the record', () => {
    const base = newGardenRecord('sp-a', 1);
    const rec: GardenSaveRecord = {
      ...base,
      cocoon: { active: true, startedAt: 0, endsAt: 10, targetForm: 'I' },
    };
    const recomputed = recomputeHabitats(rec, [pairRecipe]);
    expect(recomputed.habitats).toEqual({});
    expect(recomputed.cocoon).toEqual(rec.cocoon);
    expect(recomputed.farm).toEqual(rec.farm);
    expect(recomputed.garden).toEqual(rec.garden);
  });

  it('a placement change invalidates the cache until the next recompute', () => {
    let rec = placed('zone-a', '0,0', 'item-a');
    rec = setPlacementCell(rec, 'zone-a', '0,1', { itemId: 'item-a', rotation: 0 });
    rec = recomputeHabitats(rec, [pairRecipe]);
    expect(rec.habitats?.['zone-a']).not.toBeNull();
    const changed = setPlacementCell(rec, 'zone-a', '0,2', { itemId: 'item-a', rotation: 0 });
    expect(changed.habitats).toEqual({});
    const removed = removePlacementCell(rec, 'zone-a', '0,1');
    expect(removed.habitats).toEqual({});
  });

  it('farm behaviour is unchanged by the W3 addition (plant then harvest)', () => {
    const rec = newGardenRecord('sp-a', 1);
    const planted = plantPlot(rec, 'plot-1', 'seed-a', 0);
    const { rec: harvested, fruit } = harvestPlot(planted, 'plot-1', 7);
    expect(fruit).toBe('seed-a');
    expect(harvested.farm?.find((p) => p.id === 'plot-1')?.harvested).toBe(true);
  });
});

describe('W3 — staging locks (no host yet)', () => {
  it('GardenView and gameStore do not call the placement functions yet', () => {
    const gardenView = readFileSync(join(__dirname, '../components/views/GardenView.tsx'), 'utf-8');
    const gameStore = readFileSync(join(__dirname, '../store/gameStore.ts'), 'utf-8');
    for (const name of ['setPlacementCell', 'removePlacementCell', 'recomputeHabitats', 'zonePlacementToHabitatPlacement', 'solveZoneHabitat']) {
      expect(gardenView).not.toContain(name);
      expect(gameStore).not.toContain(name);
    }
  });
});
