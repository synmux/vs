/** `vs search <query>` — ranked fuzzy matches across every entity kind. */
import type { Repository } from "../../data/repository.ts";
import { search } from "../../domain/search-index.ts";
import type { OutputOptions } from "../types.ts";

export function searchCommand(
  repo: Repository,
  query: string,
  options: OutputOptions & { limit?: number } = {}
): string {
  const hits = search(repo.searchIndex(), query, options.limit ?? 20);

  if (options.json) {
    return JSON.stringify(hits, null, 2);
  }
  if (hits.length === 0) {
    return `No results for "${query}".`;
  }

  const labelWidth = Math.max(...hits.map((hit) => hit.label.length));
  return hits
    .map(
      (hit) =>
        `${hit.label.padEnd(labelWidth)}  ${hit.kind.padEnd(10)} ${hit.subtitle}`
    )
    .join("\n");
}
