/**
 * The data façade the rest of the app uses. It hides the cache-vs-fetch
 * decision behind {@link Repository.load} and exposes typed getters for each
 * table. Domain indexes (evolution graph, search index) are layered on in
 * Phase 2 and memoized here.
 */
import { readDataset, writeDataset } from "./cache.ts";
import { fetchAllTables } from "./fetcher.ts";
import type {
  NormalizedArcanaRow,
  NormalizedBestiaryRow,
  NormalizedCharacterRow,
  NormalizedEvolutionRow,
  NormalizedPassiveRow,
  NormalizedStageRow,
  NormalizedWeaponRow,
} from "./raw-types.ts";
import type { Dataset, DatasetMeta } from "./schema.ts";

type Env = Record<string, string | undefined>;

export class NoCacheOfflineError extends Error {
  constructor() {
    super(
      "No cached data is available and the wiki could not be reached. Run `vs refresh` while online to populate the cache.",
    );
    this.name = "NoCacheOfflineError";
  }
}

export interface LoadOptions {
  /** Skip the cache and fetch fresh from the wiki. */
  forceRefresh?: boolean;
  /** When false, never fetch — fail with {@link NoCacheOfflineError} if no cache. */
  allowNetwork?: boolean;
  env?: Env;
  fetchImpl?: typeof fetch;
}

export class Repository {
  private constructor(private readonly dataset: Dataset) {}

  static async load(options: LoadOptions = {}): Promise<Repository> {
    const { forceRefresh = false, allowNetwork = true, env = process.env, fetchImpl } = options;

    if (!forceRefresh) {
      const cached = await readDataset(env);
      if (cached) return new Repository(cached);
    }
    if (!allowNetwork) throw new NoCacheOfflineError();

    const dataset = await fetchAllTables({ fetchImpl });
    await writeDataset(dataset, env);
    return new Repository(dataset);
  }

  meta(): DatasetMeta {
    return this.dataset.meta;
  }

  // Casts are sound: normalizeRow guarantees each table's shape at cache-write time.
  weapons(): NormalizedWeaponRow[] {
    return this.dataset.tables.infobox_weapon as unknown as NormalizedWeaponRow[];
  }

  passives(): NormalizedPassiveRow[] {
    return this.dataset.tables.infobox_passive_item as unknown as NormalizedPassiveRow[];
  }

  evolutions(): NormalizedEvolutionRow[] {
    return this.dataset.tables.passive_evolutions as unknown as NormalizedEvolutionRow[];
  }

  characters(): NormalizedCharacterRow[] {
    return this.dataset.tables.infobox_character as unknown as NormalizedCharacterRow[];
  }

  stages(): NormalizedStageRow[] {
    return this.dataset.tables.infobox_stage as unknown as NormalizedStageRow[];
  }

  arcanas(): NormalizedArcanaRow[] {
    return this.dataset.tables.infobox_arcana as unknown as NormalizedArcanaRow[];
  }

  bestiary(): NormalizedBestiaryRow[] {
    return this.dataset.tables.infobox_bestiary as unknown as NormalizedBestiaryRow[];
  }
}
