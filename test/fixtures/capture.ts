#!/usr/bin/env bun
/**
 * Manual, NON-CI fixture capture for the Vampire Survivors wiki Bucket API.
 *
 * Usage:   bun run test/fixtures/capture.ts
 *
 * Hits the live wiki (https://vampire.survivors.wiki/api.php) and writes one
 * <table>.json per Bucket table into this directory, storing the RAW API
 * response ({ bucketQuery, bucket: [...] }) so that data-layer tests parse the
 * exact shape the client receives in production. Re-run only when the wiki
 * schema changes. Tests must NEVER hit the network — they read these committed
 * files.
 *
 * The field lists below mirror src/data/schema.ts. Keep them in sync.
 */
import { join } from "node:path";

const API = "https://vampire.survivors.wiki/api.php";
const USER_AGENT = "vs-tui/0.1.0 (https://github.com/syn; syn@syn.as; fixture-capture)";
const OUT_DIR = import.meta.dir;

/** Tables and the fields to request. Mirrors src/data/schema.ts selects. */
const TABLES: Record<string, string[]> = {
  infobox_weapon: ["page_name", "name", "type", "description", "id", "dlc", "is_default", "order"],
  infobox_passive_item: ["page_name", "name", "description", "id", "dlc", "is_default", "order"],
  passive_evolutions: ["page_name", "evolution", "base_weapon", "secondary_passive", "passive_max", "glimmer", "gift"],
  infobox_character: [
    "page_name", "name", "dlc", "description", "starting_weapon", "unlocked_by", "cost", "secret_character",
    "max_health", "recovery", "armor", "amount", "move_speed", "might", "speed", "duration", "area",
    "cooldown", "magnet", "luck", "growth", "greed", "curse", "stats_json",
  ],
  infobox_stage: [
    "page_name", "name", "dlc", "description", "id", "effects", "stage_type", "time_limit",
    "gold_multiplier", "luck_bonus", "xp_bonus", "enemy_health_bonus", "theme", "adventure_only",
  ],
  infobox_arcana: ["page_name", "name", "dlc", "description", "arcana_name", "order", "arcana_type", "affects", "notes", "unlocked_by"],
  infobox_bestiary: ["page_name", "name", "dlc", "description", "bestiary_number", "type", "theme"],
};

function buildQuery(table: string, fields: string[]): string {
  const select = fields.map((field) => `'${field}'`).join(",");
  return `bucket('${table}').select(${select}).limit(5000).run()`;
}

interface BucketResponse {
  bucketQuery?: string;
  bucket?: unknown[];
  error?: string;
}

let failed = 0;
for (const [table, fields] of Object.entries(TABLES)) {
  const query = buildQuery(table, fields);
  const url = `${API}?action=bucket&format=json&query=${encodeURIComponent(query)}`;
  try {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = (await response.json()) as BucketResponse;
    if (json.error) throw new Error(json.error);
    const rows = json.bucket ?? [];
    const outPath = join(OUT_DIR, `${table}.json`);
    await Bun.write(outPath, JSON.stringify(json, null, 2) + "\n");
    console.log(`✓ ${table.padEnd(22)} ${String(rows.length).padStart(4)} rows → ${outPath}`);
  } catch (error) {
    failed++;
    console.error(`✗ ${table.padEnd(22)} ${(error as Error).message}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} table(s) failed.`);
  process.exit(1);
}
console.log("\nFixture capture complete.");
