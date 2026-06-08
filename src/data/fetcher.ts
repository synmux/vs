/**
 * Pulls every configured Bucket table and assembles a normalized {@link Dataset}.
 *
 * Each table is fetched as a single narrow `.limit(5000)` select (no joins — we
 * join in the domain layer to respect the 2s server timeout), all tables in
 * parallel. A pagination fallback handles the theoretical case of a table with
 * more than 5000 rows. Rows are normalized at fetch time so the cache only ever
 * holds clean, typed data.
 */
import { APP_VERSION } from "../version.ts";
import { fetchBucket } from "./bucket/client.ts";
import type { BucketRow, FetchBucketOptions } from "./bucket/client.ts";
import { normalizeRow } from "./bucket/normalize.ts";
import { BucketQuery } from "./bucket/query.ts";
import { DATASET_VERSION, TABLES, TABLE_NAMES } from "./schema.ts";
import type { Dataset, TableName } from "./schema.ts";

const WIKI_ID = "en_vswiki";
const PAGE_SIZE = 5000;

export interface FetchAllOptions {
  fetchImpl?: typeof fetch;
  now?: Date;
}

/** Fetch one table, following offset pagination if it ever exceeds the page size. */
async function fetchTablePaged(table: TableName, options: FetchBucketOptions): Promise<BucketRow[]> {
  const fields = Object.keys(TABLES[table]);
  const baseQuery = BucketQuery.table(table).select(...fields).limit(PAGE_SIZE);

  const rows: BucketRow[] = [];
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const page = await fetchBucket(baseQuery.offset(offset), options);
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

export async function fetchAllTables(options: FetchAllOptions = {}): Promise<Dataset> {
  const { fetchImpl, now = new Date() } = options;

  const entries = await Promise.all(
    TABLE_NAMES.map(async (table) => {
      const spec = TABLES[table];
      const rawRows = await fetchTablePaged(table, { fetchImpl });
      const rows = rawRows.map((row) => normalizeRow(row, spec));
      return [table, rows] as const;
    }),
  );

  const tables = Object.fromEntries(entries) as unknown as Dataset["tables"];
  const counts: Record<string, number> = {};
  for (const [table, rows] of entries) counts[table] = rows.length;

  return {
    meta: {
      version: DATASET_VERSION,
      fetchedAt: now.toISOString(),
      appVersion: APP_VERSION,
      wikiId: WIKI_ID,
      counts,
    },
    tables,
  };
}
