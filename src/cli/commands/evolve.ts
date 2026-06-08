/** `vs evolve <name>` — bidirectional: how an evolved weapon is made, and/or what a base weapon evolves into. */
import type { Repository } from "../../data/repository.ts";
import { resolveByName } from "../../domain/resolve.ts";
import { evolutionsForBase, recipesForResult } from "../../domain/solver.ts";
import { CliError } from "../errors.ts";
import type { OutputOptions } from "../types.ts";

export function evolveCommand(repo: Repository, name: string, options: OutputOptions = {}): string {
  const weapon = resolveByName(repo.weapons(), name, (candidate) => candidate.name);
  if (!weapon) throw new CliError(`No weapon found matching "${name}".`);

  const graph = repo.evolutionGraph();
  const madeFrom = recipesForResult(graph, weapon.pageName);
  const evolvesInto = evolutionsForBase(graph, weapon.pageName);

  if (options.json) {
    return JSON.stringify({ weapon: weapon.name, madeFrom, evolvesInto }, null, 2);
  }

  const lines: string[] = [weapon.name];
  if (madeFrom.length > 0) {
    lines.push("", "Made from:");
    for (const recipe of madeFrom) {
      lines.push(
        `  ${recipe.bases.join(" + ")} + ${recipe.requiredPassives.join(" + ")}${recipe.passiveMax ? "  (passive at max level)" : ""}`,
      );
    }
  }
  if (evolvesInto.length > 0) {
    lines.push("", "Evolves into:");
    for (const recipe of evolvesInto) {
      lines.push(`  ${recipe.result}  — needs ${recipe.requiredPassives.join(" + ")}${recipe.passiveMax ? " (max)" : ""}`);
    }
  }
  if (madeFrom.length === 0 && evolvesInto.length === 0) {
    lines.push("", "No evolution data for this weapon.");
  }
  return lines.join("\n");
}
