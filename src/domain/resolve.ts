/**
 * Resolve a user-typed name to the best-matching entity: an exact
 * (case-insensitive) name match if there is one, otherwise the highest-scoring
 * fuzzy match. Used by the CLI to turn `vs evolve "bloody tear"` into an entity.
 */
import { fuzzyScore } from "../util/fuzzy.ts";

export function resolveByName<T>(items: T[], query: string, nameOf: (item: T) => string): T | undefined {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) return undefined;

  for (const item of items) {
    if (nameOf(item).toLowerCase() === normalized) return item;
  }

  let best: T | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const item of items) {
    const score = fuzzyScore(normalized, nameOf(item));
    if (score !== null && score > bestScore) {
      bestScore = score;
      best = item;
    }
  }
  return best;
}
