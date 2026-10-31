// Habitat List — the collection indexed by place (teardown-bw2, T-B4).
//
// Systems source: BW2's Habitat List (public documentation, DEEP
// grade). A pure derivation over two facts that already exist — the
// area encounter stock (ecology / spawn tables) and the dex record
// (gameStore.dex: Record<string, string>, 'seen' | 'caught'). This
// module stores nothing and invents no data shape; callers pass stock
// rows in, pages come out.
//
// BW2's rules, kept exactly:
// - Universal registration: a species' dex status applies on EVERY
//   area page that stocks it. That holds here by construction — every
//   page reads the same dex record.
// - Completion is stamped per section (method), then per area: seen
//   complete (hollow stamp), caught complete (filled stamp), and a
//   fully caught area earns its index mark.
// - Declared exclusions: callers pass RANDOM-ENCOUNTER STOCK ONLY.
//   Swarm/overlay-only, gift and one-off species are excluded by the
//   caller and the exclusion is stated on the page (the view's job);
//   a page must always be able to honestly reach 100%.

export interface HabitatSectionStock {
  /** Encounter method, in the stock tables' own idiom (e.g. field / water / fishing). */
  method: string;
  speciesIds: string[];
}

export interface HabitatAreaStock {
  areaId: string;
  sections: HabitatSectionStock[];
}

export interface HabitatSectionPage {
  method: string;
  speciesIds: string[];
  seenCount: number;
  caughtCount: number;
  /** Hollow stamp: every stocked species in this section seen. */
  seenComplete: boolean;
  /** Filled stamp: every stocked species in this section caught. */
  caughtComplete: boolean;
}

export interface HabitatAreaPage {
  areaId: string;
  sections: HabitatSectionPage[];
  seenComplete: boolean;
  /** The area index mark: every non-empty section caught-complete. */
  caughtComplete: boolean;
}

function sectionPage(stock: HabitatSectionStock, dex: Record<string, string>): HabitatSectionPage {
  let seenCount = 0;
  let caughtCount = 0;
  for (const id of stock.speciesIds) {
    const status = dex[id];
    if (status === "seen" || status === "caught") seenCount++;
    if (status === "caught") caughtCount++;
  }
  const total = stock.speciesIds.length;
  return {
    method: stock.method,
    speciesIds: [...stock.speciesIds],
    seenCount,
    caughtCount,
    seenComplete: total > 0 && seenCount === total,
    caughtComplete: total > 0 && caughtCount === total,
  };
}

export function habitatPage(area: HabitatAreaStock, dex: Record<string, string>): HabitatAreaPage {
  const sections = area.sections.map((s) => sectionPage(s, dex));
  const stocked = sections.filter((s) => s.speciesIds.length > 0);
  return {
    areaId: area.areaId,
    sections,
    seenComplete: stocked.length > 0 && stocked.every((s) => s.seenComplete),
    caughtComplete: stocked.length > 0 && stocked.every((s) => s.caughtComplete),
  };
}

export function habitatIndex(areas: HabitatAreaStock[], dex: Record<string, string>): HabitatAreaPage[] {
  return areas.map((a) => habitatPage(a, dex));
}
