/**
 * Dependency-free fuzzy subsequence matcher with positional scoring.
 *
 * Required because the Bucket API has no substring/`like` operator, so all
 * search-as-you-type filtering happens client-side over a few hundred entries.
 * Returns `null` when `query` is not a (case-insensitive) subsequence of
 * `target`; otherwise a score where higher is a better match. Scores are only
 * meaningful relative to each other for the same query.
 */

const BASE = 10;
const CONSECUTIVE_BONUS = 15;
const WORD_BOUNDARY_BONUS = 10;
const DISTANCE_PENALTY = 0.5;
const MAX_DISTANCE_PENALTY = 10;
const COVERAGE_WEIGHT = 20;

function isWordBoundary(target: string, indexInTarget: number): boolean {
  if (indexInTarget === 0) return true;
  const previous = target[indexInTarget - 1];
  return previous === " " || previous === "-" || previous === "_";
}

export function fuzzyScore(query: string, target: string): number | null {
  const needle = query.toLowerCase();
  const haystack = target.toLowerCase();
  if (needle.length === 0) return 0;

  let score = 0;
  let needleIndex = 0;
  let previousMatch = -2;

  for (let position = 0; position < haystack.length && needleIndex < needle.length; position++) {
    if (haystack[position] !== needle[needleIndex]) continue;

    let charScore = BASE;
    if (position === previousMatch + 1) charScore += CONSECUTIVE_BONUS;
    if (isWordBoundary(haystack, position)) charScore += WORD_BOUNDARY_BONUS;
    charScore -= Math.min(position, MAX_DISTANCE_PENALTY) * DISTANCE_PENALTY;

    score += charScore;
    previousMatch = position;
    needleIndex++;
  }

  if (needleIndex !== needle.length) return null;

  // Coverage: a query that fills more of the target is a tighter match. This
  // breaks prefix ties in favour of the shorter, more relevant entity.
  score += (needle.length / haystack.length) * COVERAGE_WEIGHT;
  return score;
}
