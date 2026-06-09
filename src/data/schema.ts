/**
 * The single source of truth for which Bucket tables we pull and how each field
 * is typed. The keys of each spec ARE the `select` field list sent to the API,
 * and the spec drives {@link normalizeRow} when caching.
 *
 * Field choices reflect the real data (verified against captured fixtures):
 *  - `infobox_weapon` carries no description/order/is_default in practice, but
 *    they are kept for forward-compatibility (they normalise to empty/0/false).
 *  - character/stage numeric fields can be fractional multipliers → `float`.
 */
import type { FieldSpec } from "./bucket/normalize.ts";

export const DATASET_VERSION = 1;

export const TABLES = {
  infobox_weapon: {
    page_name: "string",
    name: "string",
    type: "string",
    description: "string",
    id: "string[]",
    dlc: "string",
    is_default: "bool",
    order: "int",
  },
  infobox_passive_item: {
    page_name: "string",
    name: "string",
    description: "string",
    id: "string[]",
    dlc: "string",
    is_default: "bool",
    order: "int",
  },
  passive_evolutions: {
    page_name: "string",
    evolution: "string",
    base_weapon: "string[]",
    secondary_passive: "string",
    passive_max: "bool",
    glimmer: "string",
    gift: "bool",
  },
  infobox_character: {
    page_name: "string",
    name: "string",
    dlc: "string",
    description: "string",
    starting_weapon: "string[]",
    unlocked_by: "string",
    cost: "int",
    secret_character: "bool",
    max_health: "float",
    recovery: "float",
    armor: "float",
    amount: "float",
    move_speed: "float",
    might: "float",
    speed: "float",
    duration: "float",
    area: "float",
    cooldown: "float",
    magnet: "float",
    luck: "float",
    growth: "float",
    greed: "float",
    curse: "float",
    stats_json: "string",
  },
  infobox_stage: {
    page_name: "string",
    name: "string",
    dlc: "string",
    description: "string",
    id: "string[]",
    effects: "string",
    stage_type: "string",
    time_limit: "int",
    gold_multiplier: "float",
    luck_bonus: "float",
    xp_bonus: "float",
    enemy_health_bonus: "float",
    theme: "string[]",
    adventure_only: "bool",
  },
  infobox_arcana: {
    page_name: "string",
    name: "string",
    dlc: "string",
    description: "string",
    arcana_name: "string",
    order: "int",
    arcana_type: "string",
    affects: "string[]",
    notes: "string",
    unlocked_by: "string",
  },
  infobox_bestiary: {
    page_name: "string",
    name: "string",
    dlc: "string",
    description: "string",
    type: "string",
    bestiary_number: "int",
    theme: "string[]",
  },
} satisfies Record<string, FieldSpec>;

export type TableName = keyof typeof TABLES;

export const TABLE_NAMES = Object.keys(TABLES) as TableName[];

export interface DatasetMeta {
  appVersion: string;
  counts: Record<string, number>;
  /** ISO-8601 timestamp of when the data was fetched. */
  fetchedAt: string;
  version: number;
  wikiId: string;
}

/** The complete cached bundle: metadata + normalized rows for every table. */
export interface Dataset {
  meta: DatasetMeta;
  tables: Record<TableName, Record<string, unknown>[]>;
}
