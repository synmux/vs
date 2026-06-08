/** `vs build --have "A,B,C"` — evolutions achievable now and those one item away. */
import type { Repository } from "../../data/repository.ts";
import { planBuild } from "../../domain/planner.ts";
import { resolveByName } from "../../domain/resolve.ts";
import type { OutputOptions } from "../types.ts";

const ONE_AWAY_LIMIT = 25;

export function buildCommand(repo: Repository, have: string, options: OutputOptions = {}): string {
  const tokens = have
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean);

  const owned = { weapons: new Set<string>(), passives: new Set<string>() };
  const unresolved: string[] = [];

  for (const token of tokens) {
    const weapon = resolveByName(repo.weapons(), token, (candidate) => candidate.name);
    const passive = resolveByName(repo.passives(), token, (candidate) => candidate.name);
    const weaponExact = weapon?.name.toLowerCase() === token.toLowerCase();
    const passiveExact = passive?.name.toLowerCase() === token.toLowerCase();

    if (weaponExact && weapon) owned.weapons.add(weapon.pageName);
    else if (passiveExact && passive) owned.passives.add(passive.pageName);
    else if (weapon) owned.weapons.add(weapon.pageName);
    else if (passive) owned.passives.add(passive.pageName);
    else unresolved.push(token);
  }

  const plan = planBuild(repo.evolutionGraph(), owned);

  if (options.json) {
    return JSON.stringify(
      {
        owned: { weapons: [...owned.weapons], passives: [...owned.passives] },
        unresolved,
        achievable: plan.achievable,
        oneAway: plan.oneAway,
      },
      null,
      2,
    );
  }

  const lines: string[] = [];
  if (unresolved.length > 0) lines.push(`Unrecognised: ${unresolved.join(", ")}`, "");

  lines.push(`Achievable now (${plan.achievable.length}):`);
  if (plan.achievable.length === 0) lines.push("  (none)");
  for (const recipe of plan.achievable) {
    lines.push(`  ${recipe.result}  ← ${recipe.bases.join(" + ")} + ${recipe.requiredPassives.join(" + ")}`);
  }

  lines.push("", `One item away (${plan.oneAway.length}):`);
  for (const entry of plan.oneAway.slice(0, ONE_AWAY_LIMIT)) {
    lines.push(`  ${entry.recipe.result}  (need: ${entry.missing.map((item) => item.key).join(", ")})`);
  }
  if (plan.oneAway.length > ONE_AWAY_LIMIT) lines.push(`  …and ${plan.oneAway.length - ONE_AWAY_LIMIT} more`);

  return lines.join("\n");
}
