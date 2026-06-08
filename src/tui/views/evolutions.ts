/**
 * The centerpiece: every evolution recipe, navigable by result. The detail shows
 * the full recipe(s) — bases, required passives, max-level/glimmer/gift
 * conditions — and offers cross-link jumps to each base weapon, each passive, and
 * the resulting weapon.
 */
import type { CliRenderer } from "@opentui/core";
import type { Repository } from "../../data/repository.ts";
import { recipesForResult } from "../../domain/solver.ts";
import { ListDetailView } from "../view.ts";
import type { DetailContent, LinkTarget, ListItem, Navigate } from "../view.ts";

export class EvolutionsView extends ListDetailView {
  readonly id = "evolutions";
  readonly title = "Evolutions";

  constructor(
    ctx: CliRenderer,
    private readonly repo: Repository,
    navigate?: Navigate,
  ) {
    super(ctx, navigate);
  }

  protected buildItems(): ListItem[] {
    const graph = this.repo.evolutionGraph();
    return [...graph.byResult.keys()]
      .sort((first, second) => first.localeCompare(second))
      .map((result) => {
        const recipe = graph.byResult.get(result)?.[0];
        return { key: result, name: result, description: recipe ? recipe.bases.join(" + ") : "" };
      });
  }

  protected renderDetail(key: string): DetailContent {
    const recipes = recipesForResult(this.repo.evolutionGraph(), key);
    const lines: string[] = [key, ""];
    const links: LinkTarget[] = [{ section: "weapons", key, label: `${key} (weapon)` }];

    recipes.forEach((recipe, index) => {
      if (recipes.length > 1) lines.push(`Recipe ${index + 1}:`);
      lines.push(`  Base:    ${recipe.bases.join(" + ")}`);
      lines.push(`  Passive: ${recipe.requiredPassives.join(" + ")}${recipe.passiveMax ? " (at max level)" : ""}`);
      if (recipe.glimmer) lines.push(`  Glimmer: ${recipe.glimmer}`);
      if (recipe.gift) lines.push("  Unlocked as a gift");
      if (recipes.length > 1) lines.push("");
      for (const base of recipe.bases) links.push({ section: "weapons", key: base, label: `${base} (base weapon)` });
      for (const passive of recipe.requiredPassives) links.push({ section: "passives", key: passive, label: `${passive} (passive)` });
    });

    const seen = new Set<string>();
    const uniqueLinks = links.filter((link) => {
      const id = `${link.section}:${link.key}`;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });

    return { text: lines.join("\n"), links: uniqueLinks };
  }
}
