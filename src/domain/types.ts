/**
 * Clean, camelCase domain entities — the vocabulary the TUI and CLI speak.
 * These are produced from the snake_case normalized rows by domain/entities.ts,
 * decoupling the rest of the app from the wiki's Bucket field names.
 */

export type EntityKind = "weapon" | "passive" | "evolution" | "character" | "stage" | "arcana" | "bestiary";

export interface Weapon {
  pageName: string;
  name: string;
  /** Cleaned type label: Normal | Evolution | Union | Special | Gift | … */
  type: string;
  description: string;
  ids: string[];
  dlc: string;
  /** True when this weapon is itself an evolved/union form. */
  isEvolution: boolean;
}

export interface Passive {
  pageName: string;
  name: string;
  description: string;
  dlc: string;
}

/**
 * A single evolution recipe (one `passive_evolutions` row). All `bases` AND all
 * `requiredPassives` are needed together; multiple recipes for the same result
 * are alternative paths.
 */
export interface Recipe {
  result: string;
  bases: string[];
  requiredPassives: string[];
  passiveMax: boolean;
  glimmer: string;
  gift: boolean;
}

export interface CharacterStats {
  maxHealth: number;
  recovery: number;
  armor: number;
  amount: number;
  moveSpeed: number;
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
}

export interface Character {
  pageName: string;
  name: string;
  dlc: string;
  description: string;
  startingWeapons: string[];
  unlockedBy: string;
  cost: number;
  secret: boolean;
  stats: CharacterStats;
}

export interface Stage {
  pageName: string;
  name: string;
  dlc: string;
  description: string;
  effects: string;
  stageType: string;
  timeLimit: number;
  goldMultiplier: number;
  luckBonus: number;
  xpBonus: number;
  enemyHealthBonus: number;
}

export interface Arcana {
  pageName: string;
  name: string;
  arcanaName: string;
  dlc: string;
  description: string;
  arcanaType: string;
  affects: string[];
  order: number;
}

export interface BestiaryEntry {
  pageName: string;
  name: string;
  dlc: string;
  description: string;
  type: string;
  number: number;
}
