/**
 * A unified, typed search index across every entity kind, with fuzzy ranking.
 * Powers the TUI command palette and the `vs search` command. Built once from
 * the domain entities; matching is client-side via {@link fuzzyScore}.
 */
import { fuzzyScore } from "../util/fuzzy.ts";
import type {
  Arcana,
  BestiaryEntry,
  Character,
  EntityKind,
  Passive,
  Recipe,
  Stage,
  Weapon,
} from "./types.ts";

export interface SearchEntry {
  /** Page name (or evolution result) used to navigate to the entity. */
  key: string;
  kind: EntityKind;
  label: string;
  subtitle: string;
}

export interface SearchHit extends SearchEntry {
  score: number;
}

export interface SearchableData {
  arcanas: Arcana[];
  bestiary: BestiaryEntry[];
  characters: Character[];
  passives: Passive[];
  recipes: Recipe[];
  stages: Stage[];
  weapons: Weapon[];
}

export function buildSearchIndex(data: SearchableData): SearchEntry[] {
  const entries: SearchEntry[] = [];

  for (const weapon of data.weapons) {
    entries.push({
      kind: "weapon",
      key: weapon.pageName,
      label: weapon.name,
      subtitle: weapon.type || "Weapon",
    });
  }
  for (const passive of data.passives) {
    entries.push({
      kind: "passive",
      key: passive.pageName,
      label: passive.name,
      subtitle: "Passive item",
    });
  }
  for (const character of data.characters) {
    entries.push({
      kind: "character",
      key: character.pageName,
      label: character.name,
      subtitle: character.dlc || "Character",
    });
  }
  for (const stage of data.stages) {
    entries.push({
      kind: "stage",
      key: stage.pageName,
      label: stage.name,
      subtitle: stage.stageType || "Stage",
    });
  }
  for (const arcana of data.arcanas) {
    entries.push({
      kind: "arcana",
      key: arcana.pageName,
      label: arcana.name,
      subtitle: arcana.arcanaName || "Arcana",
    });
  }
  for (const enemy of data.bestiary) {
    entries.push({
      kind: "bestiary",
      key: enemy.pageName,
      label: enemy.name,
      subtitle: "Enemy",
    });
  }
  for (const recipe of data.recipes) {
    const ingredients = [...recipe.bases, ...recipe.requiredPassives].join(
      " + "
    );
    entries.push({
      kind: "evolution",
      key: recipe.result,
      label: recipe.result,
      subtitle: ingredients,
    });
  }

  return entries;
}

export function search(
  index: SearchEntry[],
  query: string,
  limit = 30
): SearchHit[] {
  const trimmed = query.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const hits: SearchHit[] = [];
  for (const entry of index) {
    const score = fuzzyScore(trimmed, entry.label);
    if (score !== null) {
      hits.push({ ...entry, score });
    }
  }

  hits.sort(
    (first, second) =>
      second.score - first.score || first.label.localeCompare(second.label)
  );
  return hits.slice(0, limit);
}
