/**
 * Pure mappers from normalized (snake_case) Bucket rows to domain entities.
 * Text fields are run through {@link cleanWikiText} so consumers never see wiki
 * markup. The recipe mapper is the important one: it assembles the full set of
 * required passives (page passive ∪ optional secondary passive).
 */
import type {
  NormalizedArcanaRow,
  NormalizedBestiaryRow,
  NormalizedCharacterRow,
  NormalizedEvolutionRow,
  NormalizedPassiveRow,
  NormalizedStageRow,
  NormalizedWeaponRow,
} from "../data/raw-types.ts";
import { cleanWikiText } from "../util/strings.ts";
import type {
  Arcana,
  BestiaryEntry,
  Character,
  Passive,
  Recipe,
  Stage,
  Weapon,
} from "./types.ts";

export function toWeapon(row: NormalizedWeaponRow): Weapon {
  const type = cleanWikiText(row.type);
  return {
    pageName: row.page_name,
    name: row.name,
    type,
    description: cleanWikiText(row.description),
    ids: row.id,
    dlc: row.dlc,
    isEvolution: type.includes("Evolution") || type.includes("Union"),
  };
}

export function toPassive(row: NormalizedPassiveRow): Passive {
  return {
    pageName: row.page_name,
    name: row.name,
    description: cleanWikiText(row.description),
    dlc: row.dlc,
  };
}

export function toRecipe(row: NormalizedEvolutionRow): Recipe {
  const requiredPassives = [
    row.page_name,
    ...(row.secondary_passive ? [row.secondary_passive] : []),
  ];
  return {
    result: row.evolution,
    bases: row.base_weapon,
    requiredPassives,
    passiveMax: row.passive_max,
    glimmer: row.glimmer,
    gift: row.gift,
  };
}

export function toCharacter(row: NormalizedCharacterRow): Character {
  return {
    pageName: row.page_name,
    name: row.name,
    dlc: row.dlc,
    description: cleanWikiText(row.description),
    startingWeapons: row.starting_weapon,
    unlockedBy: cleanWikiText(row.unlocked_by),
    cost: row.cost,
    secret: row.secret_character,
    stats: {
      maxHealth: row.max_health,
      recovery: row.recovery,
      armor: row.armor,
      amount: row.amount,
      moveSpeed: row.move_speed,
      might: row.might,
      speed: row.speed,
      duration: row.duration,
      area: row.area,
      cooldown: row.cooldown,
      magnet: row.magnet,
      luck: row.luck,
      growth: row.growth,
      greed: row.greed,
      curse: row.curse,
    },
  };
}

export function toStage(row: NormalizedStageRow): Stage {
  return {
    pageName: row.page_name,
    name: row.name,
    dlc: row.dlc,
    description: cleanWikiText(row.description),
    effects: cleanWikiText(row.effects),
    stageType: row.stage_type,
    timeLimit: row.time_limit,
    goldMultiplier: row.gold_multiplier,
    luckBonus: row.luck_bonus,
    xpBonus: row.xp_bonus,
    enemyHealthBonus: row.enemy_health_bonus,
  };
}

export function toArcana(row: NormalizedArcanaRow): Arcana {
  return {
    pageName: row.page_name,
    name: row.name,
    arcanaName: row.arcana_name,
    dlc: row.dlc,
    description: cleanWikiText(row.description),
    arcanaType: row.arcana_type,
    affects: row.affects,
    order: row.order,
  };
}

export function toBestiaryEntry(row: NormalizedBestiaryRow): BestiaryEntry {
  return {
    pageName: row.page_name,
    name: row.name,
    dlc: row.dlc,
    description: cleanWikiText(row.description),
    type: row.type,
    number: row.bestiary_number,
  };
}
