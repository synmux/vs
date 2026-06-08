import { describe, expect, test } from "bun:test";
import { fetchAllTables } from "../../src/data/fetcher.ts";
import { TABLE_NAMES } from "../../src/data/schema.ts";

/** Fake fetch that returns one canned row for the weapon and evolution tables, empty otherwise. */
function fakeFetch(): typeof fetch {
  return (async (url: string | URL) => {
    const target = String(url);
    if (target.includes(encodeURIComponent("bucket('passive_evolutions')"))) {
      return new Response(
        JSON.stringify({
          bucket: [{ page_name: "Hollow Heart", base_weapon: ["Whip"], evolution: "Bloody Tear", passive_max: "" }],
        }),
      );
    }
    if (target.includes(encodeURIComponent("bucket('infobox_weapon')"))) {
      return new Response(JSON.stringify({ bucket: [{ page_name: "Whip", name: "Whip", type: "Normal", id: ["WHIP"] }] }));
    }
    return new Response(JSON.stringify({ bucket: [] }));
  }) as unknown as typeof fetch;
}

describe("fetchAllTables", () => {
  test("fetches and normalizes every table into a dataset", async () => {
    const dataset = await fetchAllTables({ fetchImpl: fakeFetch(), now: new Date("2026-06-09T00:00:00.000Z") });

    for (const table of TABLE_NAMES) {
      expect(dataset.tables[table]).toBeDefined();
    }
  });

  test("normalizes weapon rows, defaulting omitted fields", async () => {
    const dataset = await fetchAllTables({ fetchImpl: fakeFetch() });
    expect(dataset.tables.infobox_weapon[0]).toEqual({
      page_name: "Whip",
      name: "Whip",
      type: "Normal",
      description: "",
      id: ["WHIP"],
      dlc: "",
      is_default: false,
      order: 0,
    });
  });

  test("normalizes evolution rows, treating passive_max as boolean-by-presence", async () => {
    const dataset = await fetchAllTables({ fetchImpl: fakeFetch() });
    expect(dataset.tables.passive_evolutions[0]).toMatchObject({
      page_name: "Hollow Heart",
      evolution: "Bloody Tear",
      base_weapon: ["Whip"],
      passive_max: true,
      secondary_passive: "",
      gift: false,
    });
  });

  test("records meta with version, timestamp, and per-table counts", async () => {
    const dataset = await fetchAllTables({ fetchImpl: fakeFetch(), now: new Date("2026-06-09T00:00:00.000Z") });
    expect(dataset.meta.version).toBe(1);
    expect(dataset.meta.fetchedAt).toBe("2026-06-09T00:00:00.000Z");
    expect(dataset.meta.counts.infobox_weapon).toBe(1);
    expect(dataset.meta.counts.passive_evolutions).toBe(1);
    expect(dataset.meta.counts.infobox_bestiary).toBe(0);
  });
});
