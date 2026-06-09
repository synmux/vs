/** Landing view: a welcome, the cache freshness, and dataset counts. */

import type { CliRenderer } from "@opentui/core";
import { BoxRenderable, TextRenderable } from "@opentui/core";
import { cacheStaleness } from "../../data/cache.ts";
import type { Repository } from "../../data/repository.ts";
import type { Focusable } from "../focus.ts";
import { theme } from "../theme.ts";
import type { View } from "../view.ts";

export class HomeView implements View {
  readonly id = "home";
  readonly title = "Home";
  private root?: BoxRenderable;
  private container?: BoxRenderable;

  constructor(
    private readonly ctx: CliRenderer,
    private readonly repo: Repository
  ) {}

  mount(container: BoxRenderable): void {
    this.container = container;
    this.root = new BoxRenderable(this.ctx, {
      id: "home",
      flexGrow: 1,
      padding: 1,
      border: true,
      borderStyle: theme.borderStyle,
      borderColor: theme.border,
      title: " Home ",
    });
    container.add(this.root);

    const stale = cacheStaleness(this.repo.meta().fetchedAt);
    const lines = [
      "Vampire Survivors — companion",
      "",
      `Data ${stale.label}${stale.stale ? "  (stale — run: vs refresh)" : ""}`,
      "",
      `Weapons    ${this.repo.weapons().length}`,
      `Passives   ${this.repo.passives().length}`,
      `Evolutions ${this.repo.recipes().length}`,
      `Characters ${this.repo.characters().length}`,
      `Stages     ${this.repo.stages().length}`,
      `Arcanas    ${this.repo.arcanas().length}`,
      `Bestiary   ${this.repo.bestiary().length}`,
      "",
      "↑/↓ pick a section · Tab focus it · / search · q quit",
    ];
    const text = new TextRenderable(this.ctx, {
      id: "home-text",
      content: lines.join("\n"),
      fg: theme.text,
    });
    this.root.add(text);
  }

  unmount(): void {
    this.container?.remove("home");
    this.root?.destroyRecursively();
    this.root = undefined;
  }

  focusTargets(): Focusable[] {
    return [];
  }

  handleKey(): boolean {
    return false;
  }

  showEntity(): void {}
}
