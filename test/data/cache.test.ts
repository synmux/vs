import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { cacheStaleness, readDataset, writeDataset } from "../../src/data/cache.ts";
import type { Dataset } from "../../src/data/schema.ts";
import { makeTestDataset } from "../helpers/dataset.ts";

function makeDataset(fetchedAt: string): Dataset {
  return makeTestDataset({ fetchedAt, tables: { infobox_weapon: [{ page_name: "Whip", name: "Whip" }] } });
}

let dir: string;
let env: Record<string, string>;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "vs-cache-"));
  env = { VS_DATA_DIR: dir };
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe("readDataset / writeDataset", () => {
  test("returns null when no cache file exists", async () => {
    expect(await readDataset(env)).toBeNull();
  });

  test("round-trips a dataset through write then read", async () => {
    const dataset = makeDataset("2026-06-01T00:00:00.000Z");
    await writeDataset(dataset, env);
    expect(await readDataset(env)).toEqual(dataset);
  });

  test("creates the data directory if it does not exist", async () => {
    const nested = { VS_DATA_DIR: join(dir, "deep", "nested") };
    const dataset = makeDataset("2026-06-01T00:00:00.000Z");
    await writeDataset(dataset, nested);
    expect(await readDataset(nested)).toEqual(dataset);
  });

  test("returns null for a dataset written by an incompatible schema version", async () => {
    const dataset = makeDataset("2026-06-01T00:00:00.000Z");
    dataset.meta.version = 0;
    await writeDataset(dataset, env);
    expect(await readDataset(env)).toBeNull();
  });

  test("returns null for corrupt JSON rather than throwing", async () => {
    await Bun.write(join(dir, "dataset.json"), "{ not valid json");
    expect(await readDataset(env)).toBeNull();
  });
});

describe("cacheStaleness", () => {
  test("reports a fresh cache below the threshold", () => {
    const result = cacheStaleness("2026-06-08T00:00:00.000Z", new Date("2026-06-09T00:00:00.000Z"));
    expect(result.days).toBe(1);
    expect(result.stale).toBe(false);
  });

  test("reports a stale cache beyond the threshold", () => {
    const result = cacheStaleness("2026-06-01T00:00:00.000Z", new Date("2026-06-30T00:00:00.000Z"));
    expect(result.stale).toBe(true);
  });
});
