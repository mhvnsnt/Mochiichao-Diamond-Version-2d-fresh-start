import { describe, expect, it } from "vitest";
import { habitatIndex, habitatPage, type HabitatAreaStock } from "./habitatList";

const AREA: HabitatAreaStock = {
  areaId: "route-topaz",
  sections: [
    { method: "field", speciesIds: ["mochii", "sproutle", "kittember"] },
    { method: "fishing", speciesIds: ["flickfin"] },
  ],
};

describe("habitatPage", () => {
  it("derives counts and stamps from the dex record", () => {
    const page = habitatPage(AREA, { mochii: "caught", sproutle: "seen", flickfin: "caught" });
    const field = page.sections[0];
    expect(field.seenCount).toBe(2);
    expect(field.caughtCount).toBe(1);
    expect(field.seenComplete).toBe(false);
    expect(page.sections[1].caughtComplete).toBe(true);
    expect(page.caughtComplete).toBe(false);
  });

  it("marks an area complete only when every stocked section is complete", () => {
    const dex = { mochii: "caught", sproutle: "caught", kittember: "caught", flickfin: "caught" };
    const page = habitatPage(AREA, dex);
    expect(page.seenComplete).toBe(true);
    expect(page.caughtComplete).toBe(true);
  });

  it("universal registration: the same dex record serves every page", () => {
    const other: HabitatAreaStock = {
      areaId: "route-emerald",
      sections: [{ method: "field", speciesIds: ["mochii"] }],
    };
    const pages = habitatIndex([AREA, other], { mochii: "seen" });
    expect(pages[1].sections[0].seenCount).toBe(1);
    expect(pages[0].sections[0].seenCount).toBe(1);
  });

  it("an area with no stocked sections is never complete", () => {
    const page = habitatPage({ areaId: "empty", sections: [] }, {});
    expect(page.seenComplete).toBe(false);
    expect(page.caughtComplete).toBe(false);
  });
});
