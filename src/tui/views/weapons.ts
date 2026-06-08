/** Weapons browser: type/DLC/description plus cross-links to its evolutions or how it is made. */
import type { CliRenderer } from "@opentui/core";
import type { Repository } from "../../data/repository.ts";
import { ListDetailView } from "../view.ts";
import type { DetailContent, ListItem, Navigate } from "../view.ts";

export class WeaponsView extends ListDetailView {
  readonly id = "weapons";
  readonly title = "Weapons";

  constructor(
    ctx: CliRenderer,
    private readonly repo: Repository,
    navigate?: Navigate,
  ) {
    super(ctx, navigate);
  }

  protected buildItems(): ListItem[] {
    return this.repo.weapons().map((weapon) => ({ key: weapon.pageName, name: weapon.name, description: weapon.type }));
  }

  protected renderDetail(key: string): DetailContent {
    const weapon = this.repo.weapons().find((candidate) => candidate.pageName === key);
    if (!weapon) return { text: "" };
    const graph = this.repo.evolutionGraph();
    const lines: string[] = [weapon.name, `Type: ${weapon.type || "—"}`];
    if (weapon.dlc) lines.push(`DLC: ${weapon.dlc}`);
    if (weapon.description) lines.push("", weapon.description);

    const links: { section: string; key: string; label: string }[] = [];

    const evolvesInto = graph.byBase.get(weapon.pageName) ?? [];
    if (evolvesInto.length > 0) {
      lines.push("", "Evolves into:");
      for (const recipe of evolvesInto) {
        lines.push(`  ${recipe.result}  — needs ${recipe.requiredPassives.join(" + ")}${recipe.passiveMax ? " (max)" : ""}`);
        links.push({ section: "evolutions", key: recipe.result, label: `${recipe.result} (evolution)` });
      }
    }

    const madeFrom = graph.byResult.get(weapon.pageName) ?? [];
    if (madeFrom.length > 0) {
      lines.push("", "Made from:");
      for (const recipe of madeFrom) {
        lines.push(`  ${recipe.bases.join(" + ")} + ${recipe.requiredPassives.join(" + ")}`);
        for (const base of recipe.bases) links.push({ section: "weapons", key: base, label: `${base} (base)` });
        for (const passive of recipe.requiredPassives) links.push({ section: "passives", key: passive, label: `${passive} (passive)` });
      }
    }

    return { text: lines.join("\n"), links };
  }
}
