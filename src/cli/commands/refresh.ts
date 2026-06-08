/** `vs refresh` — re-fetch every table from the wiki into the local cache. */
import { Repository } from "../../data/repository.ts";

export async function refreshCommand(): Promise<string> {
  const repo = await Repository.load({ forceRefresh: true });
  const counts = repo.meta().counts;
  const lines = ["Refreshed data from the wiki:"];
  for (const [table, count] of Object.entries(counts)) {
    lines.push(`  ${table.padEnd(22)} ${count}`);
  }
  return lines.join("\n");
}
