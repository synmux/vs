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
  page_name: string;
  name: string;
  type: string;
  description: string;
  id: string[];
  dlc: string;
  is_default: boolean;
  order: number;
}

export interface NormalizedPassiveRow {
  page_name: string;
  name: string;
  description: string;
  id: string[];
  dlc: string;
  is_default: boolean;
  order: number;
}

export interface NormalizedEvolutionRow {
  page_name: string;
  evolution: string;
  base_weapon: string[];
  secondary_passive: string;
  passive_max: boolean;
  glimmer: string;
  gift: boolean;
}

export interface NormalizedCharacterRow {
  page_name: string;
  name: string;
  dlc: string;
  description: string;
  starting_weapon: string[];
  unlocked_by: string;
  cost: number;
  secret_character: boolean;
  max_health: number;
  recovery: number;
  armor: number;
  amount: number;
  move_speed: number;
  might: number;
  speed: number;
  duration: number;
  area: number;
  cooldown: number;
  magnet: number;
  luck: number;
  growth: number;
  greed: number;
  curse: number;
  stats_json: string;
}

export interface NormalizedStageRow {
  page_name: string;
  name: string;
  dlc: string;
  description: string;
  id: string[];
  effects: string;
  stage_type: string;
  time_limit: number;
  gold_multiplier: number;
  luck_bonus: number;
  xp_bonus: number;
  enemy_health_bonus: number;
  theme: string[];
  adventure_only: boolean;
}

export interface NormalizedArcanaRow {
  page_name: string;
  name: string;
  dlc: string;
  description: string;
  arcana_name: string;
  order: number;
  arcana_type: string;
  affects: string[];
  notes: string;
  unlocked_by: string;
}

export interface NormalizedBestiaryRow {
  page_name: string;
  name: string;
  dlc: string;
  description: string;
  type: string;
  bestiary_number: number;
  theme: string[];
}
