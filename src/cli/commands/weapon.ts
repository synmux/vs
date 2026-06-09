/** `vs weapon <name>` — weapon detail plus its evolution relationships. */
import type { Repository } from "../../data/repository.ts";
import { resolveByName } from "../../domain/resolve.ts";
import { evolutionsForBase, recipesForResult } from "../../domain/solver.ts";
import { CliError } from "../errors.ts";
import type { OutputOptions } from "../types.ts";

export function weaponCommand(
  repo: Repository,
  name: string,
  options: OutputOptions = {}
): string {
  const weapon = resolveByName(
    repo.weapons(),
    name,
    (candidate) => candidate.name
  );
  if (!weapon) {
    throw new CliError(`No weapon found matching "${name}".`);
  }
  if (options.json) {
    return JSON.stringify(weapon, null, 2);
  }

  const graph = repo.evolutionGraph();
  const lines: string[] = [weapon.name, `Type: ${weapon.type || "—"}`];
  if (weapon.dlc) {
    lines.push(`DLC: ${weapon.dlc}`);
  }
  if (weapon.description) {
    lines.push("", weapon.description);
  }

  const evolvesInto = evolutionsForBase(graph, weapon.pageName);
  if (evolvesInto.length > 0) {
    lines.push("", "Evolves into:");
    for (const recipe of evolvesInto) {
      lines.push(
        `  ${recipe.result} (with ${recipe.requiredPassives.join(" + ")})`
      );
    }
  }
  const madeFrom = recipesForResult(graph, weapon.pageName);
  if (madeFrom.length > 0) {
    lines.push("", "Made from:");
    for (const recipe of madeFrom) {
      lines.push(
        `  ${recipe.bases.join(" + ")} + ${recipe.requiredPassives.join(" + ")}`
      );
    }
  }
  return lines.join("\n");
}
