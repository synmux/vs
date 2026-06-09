/** Characters browser: base stats, unlock, cost, and a jump to the starting weapon. */
import type { CliRenderer } from "@opentui/core";
import type { Repository } from "../../data/repository.ts";
import type { Character } from "../../domain/types.ts";
import { uniqueBy } from "../../util/collections.ts";
import type { DetailContent, LinkTarget, ListItem, Navigate } from "../view.ts";
import { ListDetailView } from "../view.ts";

export class CharactersView extends ListDetailView {
  readonly id = "characters";
  readonly title = "Characters";

  constructor(
    ctx: CliRenderer,
    private readonly repo: Repository,
    navigate?: Navigate
  ) {
    super(ctx, navigate);
  }

  /** Characters have duplicate page names (skins/legacy variants); show one each. */
  private uniqueCharacters(): Character[] {
    return uniqueBy(this.repo.characters(), (character) => character.pageName);
  }

  protected buildItems(): ListItem[] {
    return this.uniqueCharacters().map((character) => ({
      key: character.pageName,
      name: character.name,
      description: character.dlc,
    }));
  }

  protected renderDetail(key: string): DetailContent {
    const character = this.uniqueCharacters().find(
      (candidate) => candidate.pageName === key
    );
    if (!character) {
      return { text: "" };
    }

    const lines: string[] = [character.name];
    if (character.dlc) {
      lines.push(`DLC: ${character.dlc}`);
    }
    if (character.startingWeapons.length > 0) {
      lines.push(`Starts with: ${character.startingWeapons.join(", ")}`);
    }
    lines.push(
      `Cost: ${character.cost}${character.secret ? "  · secret" : ""}`
    );
    if (character.unlockedBy) {
      lines.push(`Unlock: ${character.unlockedBy}`);
    }
    if (character.description) {
      lines.push("", character.description);
    }

    const stats = character.stats;
    lines.push(
      "",
      "Base stats:",
      `  Health ${stats.maxHealth}   Armor ${stats.armor}   Recovery ${stats.recovery}`,
      `  Might ${stats.might}   Speed ${stats.speed}   Area ${stats.area}   Cooldown ${stats.cooldown}`,
      `  Amount ${stats.amount}   Duration ${stats.duration}   Move ${stats.moveSpeed}`,
      `  Luck ${stats.luck}   Growth ${stats.growth}   Greed ${stats.greed}   Magnet ${stats.magnet}`
    );

    const links: LinkTarget[] = character.startingWeapons.map((weapon) => ({
      section: "weapons",
      key: weapon,
      label: `${weapon} (starting weapon)`,
    }));
    return { text: lines.join("\n"), links };
  }
}
