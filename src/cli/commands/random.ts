/** `vs random` — suggest a random character and its starting weapon's evolution path. */
import type { Repository } from "../../data/repository.ts";
import { evolutionsForBase } from "../../domain/solver.ts";
import { uniqueBy } from "../../util/collections.ts";
import { CliError } from "../errors.ts";
import type { OutputOptions } from "../types.ts";

export function randomCommand(
  repo: Repository,
  options: OutputOptions & { rng?: () => number } = {}
): string {
  const rng = options.rng ?? Math.random;
  const characters = uniqueBy(
    repo.characters(),
    (character) => character.pageName
  );
  if (characters.length === 0) {
    throw new CliError("No characters available.");
  }

  const character = characters[Math.floor(rng() * characters.length)]!;
  const graph = repo.evolutionGraph();

  const paths = character.startingWeapons.map((weapon) => ({
    weapon,
    evolutions: evolutionsForBase(graph, weapon).map((recipe) => ({
      result: recipe.result,
      requiredPassives: recipe.requiredPassives,
    })),
  }));

  if (options.json) {
    return JSON.stringify(
      { character: character.name, dlc: character.dlc, paths },
      null,
      2
    );
  }

  const lines: string[] = [
    `Try: ${character.name}${character.dlc ? `  (${character.dlc})` : ""}`,
  ];
  if (character.startingWeapons.length > 0) {
    lines.push(`Starts with: ${character.startingWeapons.join(", ")}`);
  }
  for (const path of paths) {
    if (path.evolutions.length === 0) {
      continue;
    }
    lines.push("", `${path.weapon} evolves into:`);
    for (const evolution of path.evolutions) {
      lines.push(
        `  ${evolution.result}  — needs ${evolution.requiredPassives.join(" + ")}`
      );
    }
  }
  return lines.join("\n");
}
