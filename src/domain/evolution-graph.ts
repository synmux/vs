/**
 * The in-memory evolution graph: every recipe indexed three ways (by result, by
 * base weapon, by required passive) plus the list of base weapons that have no
 * evolution. Built once from recipes + weapons; the repository memoizes it.
 *
 * Recipes for the same result are alternative paths. A multi-base recipe is
 * indexed under each of its bases (you still need all of them — see planner).
 */
import type { Recipe, Weapon } from "./types.ts";

export interface EvolutionGraph {
  byBase: Map<string, Recipe[]>;
  byPassive: Map<string, Recipe[]>;
  byResult: Map<string, Recipe[]>;
  recipes: Recipe[];
  /** Non-fatal data issues (e.g. a base/result that has no weapon page). */
  warnings: string[];
  /** Page names of non-evolution weapons that are never a base in any recipe. */
  weaponsWithoutEvolution: string[];
}

function index(map: Map<string, Recipe[]>, key: string, recipe: Recipe): void {
  const existing = map.get(key);
  if (existing) {
    existing.push(recipe);
  } else {
    map.set(key, [recipe]);
  }
}

export function buildEvolutionGraph(
  recipes: Recipe[],
  weapons: Weapon[]
): EvolutionGraph {
  const byResult = new Map<string, Recipe[]>();
  const byBase = new Map<string, Recipe[]>();
  const byPassive = new Map<string, Recipe[]>();
  const weaponPages = new Set(weapons.map((weapon) => weapon.pageName));
  const warnings: string[] = [];

  for (const recipe of recipes) {
    index(byResult, recipe.result, recipe);
    for (const base of recipe.bases) {
      index(byBase, base, recipe);
    }
    for (const passive of recipe.requiredPassives) {
      index(byPassive, passive, recipe);
    }

    if (!weaponPages.has(recipe.result)) {
      warnings.push(
        `Evolution result not found as a weapon page: ${recipe.result}`
      );
    }
    for (const base of recipe.bases) {
      if (!weaponPages.has(base)) {
        warnings.push(`Base weapon not found as a weapon page: ${base}`);
      }
    }
  }

  const weaponsWithoutEvolution = weapons
    .filter((weapon) => !(weapon.isEvolution || byBase.has(weapon.pageName)))
    .map((weapon) => weapon.pageName);

  return {
    recipes,
    byResult,
    byBase,
    byPassive,
    weaponsWithoutEvolution,
    warnings,
  };
}
