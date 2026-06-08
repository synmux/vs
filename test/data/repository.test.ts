import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeDataset } from "../../src/data/cache.ts";
import { NoCacheOfflineError, Repository } from "../../src/data/repository.ts";
import { makeTestDataset } from "../helpers/dataset.ts";

let dir: string;
let env: Record<string, string>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "vs-repo-"));
  env = { VS_DATA_DIR: dir };
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function fakeFetch(): typeof fetch {
  return (async (url: string | URL) => {
    if (String(url).includes(encodeURIComponent("bucket('infobox_weapon')"))) {
      return new Response(JSON.stringify({ bucket: [{ page_name: "Whip", name: "Whip", type: "Normal", id: ["WHIP"] }] }));
    }
    return new Response(JSON.stringify({ bucket: [] }));
  }) as unknown as typeof fetch;
}

const WHIP_ROW = {
  page_name: "Whip",
  name: "Whip",
  type: "Normal",
  description: "",
  id: ["WHIP"],
  dlc: "",
  is_default: false,
  order: 0,
};

describe("Repository.load", () => {
  test("loads from cache without touching the network", async () => {
    await writeDataset(makeTestDataset({ tables: { infobox_weapon: [WHIP_ROW] } }), env);
    const repo = await Repository.load({ env, allowNetwork: false });
    expect(repo.weapons()[0]?.name).toBe("Whip");
  });

  test("throws NoCacheOfflineError when no cache exists and network is disallowed", () => {
    expect(Repository.load({ env, allowNetwork: false })).rejects.toThrow(NoCacheOfflineError);
  });

  test("force-refresh fetches, returns data, and populates the cache for next time", async () => {
    const repo = await Repository.load({ env, forceRefresh: true, fetchImpl: fakeFetch() });
    expect(repo.meta().counts.infobox_weapon).toBe(1);
    expect(repo.weapons()[0]?.name).toBe("Whip");

    // The cache is now populated, so a later offline load succeeds.
    const reopened = await Repository.load({ env, allowNetwork: false });
    expect(reopened.weapons()[0]?.name).toBe("Whip");
  });
});
