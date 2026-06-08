/**
 * The data façade the rest of the app uses. It hides the cache-vs-fetch
 * decision behind {@link Repository.load}, maps raw cache rows into domain
 * entities, and memoizes the derived evolution graph and search index.
 *
 * Casts from the cache's `Record<string, unknown>[]` to the Normalized*Row
 * types are sound: normalizeRow guarantees each shape at cache-write time.
 */
import {
  toArcana,
  toBestiaryEntry,
  toCharacter,
  toPassive,
  toRecipe,
  toStage,
  toWeapon,
} from "../domain/entities.ts";
import { buildEvolutionGraph } from "../domain/evolution-graph.ts";
import type { EvolutionGraph } from "../domain/evolution-graph.ts";
import { buildSearchIndex } from "../domain/search-index.ts";
import type { SearchEntry } from "../domain/search-index.ts";
import type { Arcana, BestiaryEntry, Character, Passive, Recipe, Stage, Weapon } from "../domain/types.ts";
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
  private weaponsCache?: Weapon[];
  private passivesCache?: Passive[];
  private charactersCache?: Character[];
  private stagesCache?: Stage[];
  private arcanasCache?: Arcana[];
  private bestiaryCache?: BestiaryEntry[];
  private recipesCache?: Recipe[];
  private graphCache?: EvolutionGraph;
  private searchIndexCache?: SearchEntry[];

  private constructor(private readonly dataset: Dataset) {}

  /** Construct directly from an in-memory dataset (used by tests and refresh). */
  static fromDataset(dataset: Dataset): Repository {
    return new Repository(dataset);
  }

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

  weapons(): Weapon[] {
    this.weaponsCache ??= (this.dataset.tables.infobox_weapon as unknown as NormalizedWeaponRow[]).map(toWeapon);
    return this.weaponsCache;
  }

  passives(): Passive[] {
    this.passivesCache ??= (this.dataset.tables.infobox_passive_item as unknown as NormalizedPassiveRow[]).map(toPassive);
    return this.passivesCache;
  }

  characters(): Character[] {
    this.charactersCache ??= (this.dataset.tables.infobox_character as unknown as NormalizedCharacterRow[]).map(toCharacter);
    return this.charactersCache;
  }

  stages(): Stage[] {
    this.stagesCache ??= (this.dataset.tables.infobox_stage as unknown as NormalizedStageRow[]).map(toStage);
    return this.stagesCache;
  }

  arcanas(): Arcana[] {
    this.arcanasCache ??= (this.dataset.tables.infobox_arcana as unknown as NormalizedArcanaRow[]).map(toArcana);
    return this.arcanasCache;
  }

  bestiary(): BestiaryEntry[] {
    this.bestiaryCache ??= (this.dataset.tables.infobox_bestiary as unknown as NormalizedBestiaryRow[]).map(toBestiaryEntry);
    return this.bestiaryCache;
  }

  recipes(): Recipe[] {
    this.recipesCache ??= (this.dataset.tables.passive_evolutions as unknown as NormalizedEvolutionRow[]).map(toRecipe);
    return this.recipesCache;
  }

  evolutionGraph(): EvolutionGraph {
    this.graphCache ??= buildEvolutionGraph(this.recipes(), this.weapons());
    return this.graphCache;
  }

  searchIndex(): SearchEntry[] {
    this.searchIndexCache ??= buildSearchIndex({
      weapons: this.weapons(),
      passives: this.passives(),
      characters: this.characters(),
      stages: this.stages(),
      arcanas: this.arcanas(),
      bestiary: this.bestiary(),
      recipes: this.recipes(),
    });
    return this.searchIndexCache;
  }
}
