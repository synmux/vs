/** Bestiary browser: enemy number, type, and description. */
import type { CliRenderer } from "@opentui/core";
import type { Repository } from "../../data/repository.ts";
import type { BestiaryEntry } from "../../domain/types.ts";
import { uniqueBy } from "../../util/collections.ts";
import type { DetailContent, ListItem, Navigate } from "../view.ts";
import { ListDetailView } from "../view.ts";

export class BestiaryView extends ListDetailView {
  readonly id = "bestiary";
  readonly title = "Bestiary";

  constructor(
    ctx: CliRenderer,
    private readonly repo: Repository,
    navigate?: Navigate
  ) {
    super(ctx, navigate);
  }

  private entries(): BestiaryEntry[] {
    return uniqueBy(this.repo.bestiary(), (entry) => entry.pageName);
  }

  protected buildItems(): ListItem[] {
    return this.entries().map((entry) => ({
      key: entry.pageName,
      name: entry.name,
      description: entry.type,
    }));
  }

  protected renderDetail(key: string): DetailContent {
    const entry = this.entries().find(
      (candidate) => candidate.pageName === key
    );
    if (!entry) {
      return { text: "" };
    }
    const lines: string[] = [entry.name];
    if (entry.number) {
      lines.push(`Bestiary No. ${entry.number}`);
    }
    if (entry.type) {
      lines.push(`Type: ${entry.type}`);
    }
    if (entry.dlc) {
      lines.push(`DLC: ${entry.dlc}`);
    }
    if (entry.description) {
      lines.push("", entry.description);
    }
    return { text: lines.join("\n") };
  }
}
