/**
 * Typed views of the NORMALIZED rows stored in the cache (one interface per
 * Bucket table). These describe the shape after {@link normalizeRow} has run —
 * every field present, defaulted, and coerced — so the repository can cast the
 * cached `Record<string, unknown>[]` to a precise type for the domain layer.
 *
 * Field names are snake_case to match the Bucket source; the domain layer
 * (domain/entities.ts) maps these into clean camelCase entities. Keep these in
 * sync with src/data/schema.ts.
 */

export interface NormalizedWeaponRow {
  description: string;
  dlc: string;
  id: string[];
  is_default: boolean;
  name: string;
  order: number;
  page_name: string;
  type: string;
}

export interface NormalizedPassiveRow {
  description: string;
  dlc: string;
  id: string[];
  is_default: boolean;
  name: string;
  order: number;
  page_name: string;
}

export interface NormalizedEvolutionRow {
  base_weapon: string[];
  evolution: string;
  gift: boolean;
  glimmer: string;
  page_name: string;
  passive_max: boolean;
  secondary_passive: string;
}

export interface NormalizedCharacterRow {
  amount: number;
  area: number;
  armor: number;
  cooldown: number;
  cost: number;
  curse: number;
  description: string;
  dlc: string;
  duration: number;
  greed: number;
  growth: number;
  luck: number;
  magnet: number;
  max_health: number;
  might: number;
  move_speed: number;
  name: string;
  page_name: string;
  recovery: number;
  secret_character: boolean;
  speed: number;
  starting_weapon: string[];
  stats_json: string;
  unlocked_by: string;
}

export interface NormalizedStageRow {
  adventure_only: boolean;
  description: string;
  dlc: string;
  effects: string;
  enemy_health_bonus: number;
  gold_multiplier: number;
  id: string[];
  luck_bonus: number;
  name: string;
  page_name: string;
  stage_type: string;
  theme: string[];
  time_limit: number;
  xp_bonus: number;
}

export interface NormalizedArcanaRow {
  affects: string[];
  arcana_name: string;
  arcana_type: string;
  description: string;
  dlc: string;
  name: string;
  notes: string;
  order: number;
  page_name: string;
  unlocked_by: string;
}

export interface NormalizedBestiaryRow {
  bestiary_number: number;
  description: string;
  dlc: string;
  name: string;
  page_name: string;
  theme: string[];
  type: string;
}
