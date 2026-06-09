/**
 * Build planner: given the weapons and passives a player currently owns, work
 * out which evolutions are achievable now and which are exactly one item away.
 *
 * A recipe needs ALL its bases AND all its required passives together (the
 * multi-base case is an AND). When `maxedPassives` is supplied, a `passiveMax`
 * recipe only counts a passive as satisfied if it is also maxed; without that
 * set we assume ownership is enough and surface the max requirement elsewhere.
 */
import type { EvolutionGraph } from "./evolution-graph.ts";
import type { Recipe } from "./types.ts";

export interface OwnedSet {
  /** Optional: which passives are at max level (enables the passiveMax check). */
  maxedPassives?: Set<string>;
  passives: Set<string>;
  weapons: Set<string>;
}

export interface MissingItem {
  key: string;
  kind: "weapon" | "passive";
}

export interface PlannedEvolution {
  missing: MissingItem[];
  recipe: Recipe;
}

export interface PlanResult {
  achievable: Recipe[];
  oneAway: PlannedEvolution[];
}

/** The items still needed for a recipe given what is owned (empty = achievable). */
export function missingForRecipe(
  recipe: Recipe,
  owned: OwnedSet
): MissingItem[] {
  const missing: MissingItem[] = [];

  for (const base of recipe.bases) {
    if (!owned.weapons.has(base)) {
      missing.push({ kind: "weapon", key: base });
    }
  }

  for (const passive of recipe.requiredPassives) {
    const owns = owned.passives.has(passive);
    const mustBeMaxed = recipe.passiveMax && owned.maxedPassives !== undefined;
    const satisfied =
      owns && (!mustBeMaxed || owned.maxedPassives?.has(passive));
    if (!satisfied) {
      missing.push({ kind: "passive", key: passive });
    }
  }

  return missing;
}

export function planBuild(graph: EvolutionGraph, owned: OwnedSet): PlanResult {
  const achievable: Recipe[] = [];
  const oneAway: PlannedEvolution[] = [];

  for (const recipe of graph.recipes) {
    const missing = missingForRecipe(recipe, owned);
    if (missing.length === 0) {
      achievable.push(recipe);
    } else if (missing.length === 1) {
      oneAway.push({ recipe, missing });
    }
  }

  return { achievable, oneAway };
}
