/** `vs character <name>` — character detail and base stats. */
import type { Repository } from "../../data/repository.ts";
import { resolveByName } from "../../domain/resolve.ts";
import { uniqueBy } from "../../util/collections.ts";
import { CliError } from "../errors.ts";
import type { OutputOptions } from "../types.ts";

export function characterCommand(repo: Repository, name: string, options: OutputOptions = {}): string {
  const characters = uniqueBy(repo.characters(), (character) => character.pageName);
  const character = resolveByName(characters, name, (candidate) => candidate.name);
  if (!character) throw new CliError(`No character found matching "${name}".`);
  if (options.json) return JSON.stringify(character, null, 2);

  const stats = character.stats;
  const lines: string[] = [character.name];
  if (character.dlc) lines.push(`DLC: ${character.dlc}`);
  if (character.startingWeapons.length > 0) lines.push(`Starts with: ${character.startingWeapons.join(", ")}`);
  lines.push(`Cost: ${character.cost}${character.secret ? " (secret)" : ""}`);
  if (character.unlockedBy) lines.push(`Unlock: ${character.unlockedBy}`);
  if (character.description) lines.push("", character.description);
  lines.push(
    "",
    `Health ${stats.maxHealth}  Armor ${stats.armor}  Might ${stats.might}  Speed ${stats.speed}  ` +
      `Area ${stats.area}  Cooldown ${stats.cooldown}  Luck ${stats.luck}`,
  );
  return lines.join("\n");
}
