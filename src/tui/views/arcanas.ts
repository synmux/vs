/** Arcanas browser: effect text and what the arcana affects. */
import type { CliRenderer } from "@opentui/core";
import type { Repository } from "../../data/repository.ts";
import type { DetailContent, LinkTarget, ListItem, Navigate } from "../view.ts";
import { ListDetailView } from "../view.ts";

export class ArcanasView extends ListDetailView {
  readonly id = "arcanas";
  readonly title = "Arcanas";

  constructor(
    ctx: CliRenderer,
    private readonly repo: Repository,
    navigate?: Navigate
  ) {
    super(ctx, navigate);
  }

  private sortedArcanas() {
    return [...this.repo.arcanas()].sort(
      (first, second) => first.order - second.order
    );
  }

  protected buildItems(): ListItem[] {
    return this.sortedArcanas().map((arcana) => ({
      key: arcana.pageName,
      name: arcana.arcanaName
        ? `${arcana.arcanaName} · ${arcana.name}`
        : arcana.name,
      description: arcana.arcanaType,
    }));
  }

  protected renderDetail(key: string): DetailContent {
    const arcana = this.repo
      .arcanas()
      .find((candidate) => candidate.pageName === key);
    if (!arcana) {
      return { text: "" };
    }

    const lines: string[] = [
      arcana.arcanaName ? `${arcana.arcanaName} — ${arcana.name}` : arcana.name,
    ];
    if (arcana.arcanaType) {
      lines.push(`Type: ${arcana.arcanaType}`);
    }
    if (arcana.dlc) {
      lines.push(`DLC: ${arcana.dlc}`);
    }
    if (arcana.description) {
      lines.push("", arcana.description);
    }

    const links: LinkTarget[] = [];
    if (arcana.affects.length > 0) {
      lines.push("", `Affects: ${arcana.affects.join(", ")}`);
      for (const affected of arcana.affects) {
        links.push({
          section: "weapons",
          key: affected,
          label: `${affected} (weapon)`,
        });
      }
    }
    return { text: lines.join("\n"), links };
  }
}
