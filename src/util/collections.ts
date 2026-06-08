/** Small collection helpers. */

/** Keep the first item for each derived key, preserving order. */
export function uniqueBy<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const derived = key(item);
    if (!seen.has(derived)) {
      seen.add(derived);
      result.push(item);
    }
  }
  return result;
}
