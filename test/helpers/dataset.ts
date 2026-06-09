/** Shared test helper: builds a complete (all-tables) {@link Dataset} for tests. */

import type { Dataset } from "../../src/data/schema.ts";
import { DATASET_VERSION, TABLE_NAMES } from "../../src/data/schema.ts";

export function makeTestDataset(partial?: {
  fetchedAt?: string;
  tables?: Partial<Dataset["tables"]>;
}): Dataset {
  const emptyTables = Object.fromEntries(
    TABLE_NAMES.map((table) => [table, []])
  ) as unknown as Dataset["tables"];
  return {
    meta: {
      version: DATASET_VERSION,
      fetchedAt: partial?.fetchedAt ?? "2026-06-01T00:00:00.000Z",
      appVersion: "0.1.0",
      wikiId: "en_vswiki",
      counts: {},
    },
    tables: { ...emptyTables, ...(partial?.tables ?? {}) },
  };
}
