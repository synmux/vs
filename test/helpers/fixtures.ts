/** Loads a captured fixture table and normalizes it, for real-data domain tests. */
import { normalizeRow } from "../../src/data/bucket/normalize.ts";
import { DATASET_VERSION, TABLES, TABLE_NAMES } from "../../src/data/schema.ts";
import type { Dataset, TableName } from "../../src/data/schema.ts";
import type { NormalizedEvolutionRow, NormalizedWeaponRow } from "../../src/data/raw-types.ts";
import { toRecipe, toWeapon } from "../../src/domain/entities.ts";
import { buildEvolutionGraph } from "../../src/domain/evolution-graph.ts";
import type { EvolutionGraph } from "../../src/domain/evolution-graph.ts";

export async function loadFixtureRows<T>(table: TableName): Promise<T[]> {
  const path = new URL(`../fixtures/${table}.json`, import.meta.url);
  const json = (await Bun.file(path).json()) as { bucket?: Record<string, unknown>[] };
  return (json.bucket ?? []).map((row) => normalizeRow<T>(row, TABLES[table]));
}

/** Build the evolution graph from real fixtures (shared by domain tests). */
export async function loadFixtureGraph(): Promise<EvolutionGraph> {
  const recipes = (await loadFixtureRows<NormalizedEvolutionRow>("passive_evolutions")).map(toRecipe);
  const weapons = (await loadFixtureRows<NormalizedWeaponRow>("infobox_weapon")).map(toWeapon);
  return buildEvolutionGraph(recipes, weapons);
}

/** Assemble a full normalized {@link Dataset} from every fixture table. */
export async function loadFixtureDataset(): Promise<Dataset> {
  const tables = {} as Dataset["tables"];
  for (const table of TABLE_NAMES) {
    tables[table] = await loadFixtureRows<Record<string, unknown>>(table);
  }
  return {
    meta: { version: DATASET_VERSION, fetchedAt: "2026-06-01T00:00:00.000Z", appVersion: "0.1.0", wikiId: "en_vswiki", counts: {} },
    tables,
  };
}
