/** Stages browser: type, time limit, and gameplay modifiers. */
import type { CliRenderer } from "@opentui/core";
import type { Repository } from "../../data/repository.ts";
import type { Stage } from "../../domain/types.ts";
import { uniqueBy } from "../../util/collections.ts";
import type { DetailContent, ListItem, Navigate } from "../view.ts";
import { ListDetailView } from "../view.ts";

export class StagesView extends ListDetailView {
  readonly id = "stages";
  readonly title = "Stages";

  constructor(
    ctx: CliRenderer,
    private readonly repo: Repository,
    navigate?: Navigate
  ) {
    super(ctx, navigate);
  }

  private uniqueStages(): Stage[] {
    return uniqueBy(this.repo.stages(), (stage) => stage.pageName);
  }

  protected buildItems(): ListItem[] {
    return this.uniqueStages().map((stage) => ({
      key: stage.pageName,
      name: stage.name,
      description: stage.stageType,
    }));
  }

  protected renderDetail(key: string): DetailContent {
    const stage = this.uniqueStages().find(
      (candidate) => candidate.pageName === key
    );
    if (!stage) {
      return { text: "" };
    }

    const lines: string[] = [stage.name];
    if (stage.stageType) {
      lines.push(`Type: ${stage.stageType}`);
    }
    if (stage.dlc) {
      lines.push(`DLC: ${stage.dlc}`);
    }
    if (stage.timeLimit) {
      lines.push(`Time limit: ${stage.timeLimit}s`);
    }

    const modifiers: string[] = [];
    if (stage.goldMultiplier) {
      modifiers.push(`Gold x${stage.goldMultiplier}`);
    }
    if (stage.luckBonus) {
      modifiers.push(`Luck +${stage.luckBonus}`);
    }
    if (stage.xpBonus) {
      modifiers.push(`XP +${stage.xpBonus}`);
    }
    if (stage.enemyHealthBonus) {
      modifiers.push(`Enemy HP +${stage.enemyHealthBonus}`);
    }
    if (modifiers.length > 0) {
      lines.push("", `Modifiers: ${modifiers.join(", ")}`);
    }

    if (stage.effects) {
      lines.push("", stage.effects);
    }
    if (stage.description) {
      lines.push("", stage.description);
    }
    return { text: lines.join("\n") };
  }
}
