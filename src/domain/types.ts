/**
 * Clean, camelCase domain entities — the vocabulary the TUI and CLI speak.
 * These are produced from the snake_case normalized rows by domain/entities.ts,
 * decoupling the rest of the app from the wiki's Bucket field names.
 */

export type EntityKind =
  | "weapon"
  | "passive"
  | "evolution"
  | "character"
  | "stage"
  | "arcana"
  | "bestiary";

export interface Weapon {
  description: string;
  dlc: string;
  ids: string[];
  /** True when this weapon is itself an evolved/union form. */
  isEvolution: boolean;
  name: string;
  pageName: string;
  /** Cleaned type label: Normal | Evolution | Union | Special | Gift | … */
  type: string;
}

export interface Passive {
  description: string;
  dlc: string;
  name: string;
  pageName: string;
}

/**
 * A single evolution recipe (one `passive_evolutions` row). All `bases` AND all
 * `requiredPassives` are needed together; multiple recipes for the same result
 * are alternative paths.
 */
export interface Recipe {
  bases: string[];
  gift: boolean;
  glimmer: string;
  passiveMax: boolean;
  requiredPassives: string[];
  result: string;
}

export interface CharacterStats {
  amount: number;
  area: number;
  armor: number;
  cooldown: number;
  curse: number;
  duration: number;
  greed: number;
  growth: number;
  luck: number;
  magnet: number;
  maxHealth: number;
  might: number;
  moveSpeed: number;
  recovery: number;
  speed: number;
}

export interface Character {
  cost: number;
  description: string;
  dlc: string;
  name: string;
  pageName: string;
  secret: boolean;
  startingWeapons: string[];
  stats: CharacterStats;
  unlockedBy: string;
}

export interface Stage {
  description: string;
  dlc: string;
  effects: string;
  enemyHealthBonus: number;
  goldMultiplier: number;
  luckBonus: number;
  name: string;
  pageName: string;
  stageType: string;
  timeLimit: number;
  xpBonus: number;
}

export interface Arcana {
  affects: string[];
  arcanaName: string;
  arcanaType: string;
  description: string;
  dlc: string;
  name: string;
  order: number;
  pageName: string;
}

export interface BestiaryEntry {
  description: string;
  dlc: string;
  name: string;
  number: number;
  pageName: string;
  type: string;
}
