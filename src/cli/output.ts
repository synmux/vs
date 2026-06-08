/** Plain-text section listings used when a TUI command is run without a TTY (piped). */
import type { Repository } from "../data/repository.ts";
import { uniqueBy } from "../util/collections.ts";
import type { OutputOptions } from "./types.ts";

function simpleList(names: string[], options: OutputOptions): string {
  return options.json ? JSON.stringify(names, null, 2) : names.join("\n");
}

export function sectionList(repo: Repository, section: string, options: OutputOptions = {}): string {
  switch (section) {
    case "evolutions": {
      const recipes = repo.recipes();
      if (options.json) return JSON.stringify(recipes, null, 2);
      return recipes
        .map((recipe) => `${recipe.result}  ← ${recipe.bases.join(" + ")} + ${recipe.requiredPassives.join(" + ")}`)
        .join("\n");
    }
    case "weapons":
      return simpleList(repo.weapons().map((weapon) => weapon.name), options);
    case "passives":
      return simpleList(repo.passives().map((passive) => passive.name), options);
    case "characters":
      return simpleList(uniqueBy(repo.characters(), (c) => c.pageName).map((c) => c.name), options);
    case "stages":
      return simpleList(uniqueBy(repo.stages(), (s) => s.pageName).map((s) => s.name), options);
    case "arcanas":
      return simpleList(repo.arcanas().map((arcana) => arcana.name), options);
    case "bestiary":
      return simpleList(uniqueBy(repo.bestiary(), (b) => b.pageName).map((b) => b.name), options);
    default:
      return "";
  }
}
