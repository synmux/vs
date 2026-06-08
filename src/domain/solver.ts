/**
 * Bidirectional lookups over the evolution graph. Thin wrappers that give the
 * CLI and TUI a clear vocabulary and safe empty-array defaults for unknown keys.
 */
import type { EvolutionGraph } from "./evolution-graph.ts";
import type { Recipe } from "./types.ts";

/** Recipes that produce the given evolved weapon ("what do I need for X?"). */
export function recipesForResult(graph: EvolutionGraph, resultPageName: string): Recipe[] {
  return graph.byResult.get(resultPageName) ?? [];
}

/** Recipes the given base weapon participates in ("what does X evolve into?"). */
export function evolutionsForBase(graph: EvolutionGraph, basePageName: string): Recipe[] {
  return graph.byBase.get(basePageName) ?? [];
}

/** Recipes that require the given passive item. */
export function recipesForPassive(graph: EvolutionGraph, passivePageName: string): Recipe[] {
  return graph.byPassive.get(passivePageName) ?? [];
}
