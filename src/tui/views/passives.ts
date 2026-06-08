/** Passive items browser: description plus the evolutions each passive enables. */
import type { CliRenderer } from "@opentui/core";
import type { Repository } from "../../data/repository.ts";
import { ListDetailView } from "../view.ts";
import type { DetailContent, LinkTarget, ListItem, Navigate } from "../view.ts";

export class PassivesView extends ListDetailView {
  readonly id = "passives";
  readonly title = "Passives";

  constructor(
    ctx: CliRenderer,
    private readonly repo: Repository,
    navigate?: Navigate,
  ) {
    super(ctx, navigate);
  }

  protected buildItems(): ListItem[] {
    return this.repo.passives().map((passive) => ({ key: passive.pageName, name: passive.name, description: passive.dlc }));
  }

  protected renderDetail(key: string): DetailContent {
    const passive = this.repo.passives().find((candidate) => candidate.pageName === key);
    if (!passive) return { text: "" };
    const lines: string[] = [passive.name];
    if (passive.dlc) lines.push(`DLC: ${passive.dlc}`);
    if (passive.description) lines.push("", passive.description);

    const recipes = this.repo.evolutionGraph().byPassive.get(passive.pageName) ?? [];
    const links: LinkTarget[] = [];
    if (recipes.length > 0) {
      lines.push("", `Enables ${recipes.length} evolution${recipes.length === 1 ? "" : "s"}:`);
      for (const recipe of recipes) {
        lines.push(`  ${recipe.bases.join(" + ")} → ${recipe.result}`);
        links.push({ section: "evolutions", key: recipe.result, label: `${recipe.result} (evolution)` });
      }
    }
    return { text: lines.join("\n"), links };
  }
}
