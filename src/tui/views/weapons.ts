/** Weapons browser: list of all weapons with a detail panel (type, DLC, evolution). */
import type { CliRenderer } from "@opentui/core";
import type { Repository } from "../../data/repository.ts";
import { ListDetailView } from "../view.ts";
import type { ListItem } from "../view.ts";

export class WeaponsView extends ListDetailView {
  readonly id = "weapons";
  readonly title = "Weapons";

  constructor(
    ctx: CliRenderer,
    private readonly repo: Repository,
  ) {
    super(ctx);
  }

  protected buildItems(): ListItem[] {
    return this.repo.weapons().map((weapon) => ({
      key: weapon.pageName,
      name: weapon.name,
      description: weapon.type,
    }));
  }

  protected renderDetail(key: string): string {
    const weapon = this.repo.weapons().find((candidate) => candidate.pageName === key);
    if (!weapon) return "";
    return [
      weapon.name,
      `Type: ${weapon.type || "—"}`,
      weapon.dlc ? `DLC: ${weapon.dlc}` : "",
      weapon.description ? `\n${weapon.description}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
}
