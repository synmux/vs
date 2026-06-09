/** Shared data loading for commands: load the repository once, with a friendly offline error. */
import { NoCacheOfflineError, Repository } from "../data/repository.ts";

export async function withRepo(
  options: { refresh?: boolean },
  run: (repo: Repository) => Promise<void> | void
): Promise<void> {
  let repo: Repository;
  try {
    repo = await Repository.load({ forceRefresh: Boolean(options.refresh) });
  } catch (error) {
    if (error instanceof NoCacheOfflineError) {
      console.error(error.message);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
  await run(repo);
}
