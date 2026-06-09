/**
 * The `/` command palette: a fuzzy search overlay over every entity. Rendered as
 * an absolute, high-zIndex box (the spike confirmed this occludes content). The
 * input is focused while open; the app routes keys here first so typing filters,
 * up/down move the result, Enter jumps to the entity, and Esc closes.
 */

import type { CliRenderer, KeyEvent } from "@opentui/core";
import {
  BoxRenderable,
  InputRenderable,
  InputRenderableEvents,
  SelectRenderable,
  SelectRenderableEvents,
} from "@opentui/core";
import type { Repository } from "../data/repository.ts";
import type { SearchHit } from "../domain/search-index.ts";
import { search } from "../domain/search-index.ts";
import type { EntityKind } from "../domain/types.ts";
import { theme } from "./theme.ts";

const KIND_TO_SECTION: Record<EntityKind, string> = {
  weapon: "weapons",
  passive: "passives",
  evolution: "evolutions",
  character: "characters",
  stage: "stages",
  arcana: "arcanas",
  bestiary: "bestiary",
};

export class Palette {
  private overlay?: BoxRenderable;
  private input?: InputRenderable;
  private results?: SelectRenderable;
  private hits: SearchHit[] = [];
  private opened = false;

  constructor(
    private readonly ctx: CliRenderer,
    private readonly repo: Repository,
    private readonly onSelect: (section: string, entityKey: string) => void,
    private readonly onClose: () => void
  ) {}

  isOpen(): boolean {
    return this.opened;
  }

  open(): void {
    if (this.opened) {
      return;
    }
    this.opened = true;

    this.overlay = new BoxRenderable(this.ctx, {
      id: "palette",
      position: "absolute",
      top: 2,
      left: 8,
      right: 8,
      height: 16,
      zIndex: 1000,
      backgroundColor: theme.overlayBg,
      border: true,
      borderStyle: theme.borderStyle,
      borderColor: theme.borderFocused,
      title: " Search — Enter to open · Esc to close ",
      flexDirection: "column",
      padding: 1,
    });
    this.ctx.root.add(this.overlay);

    this.input = new InputRenderable(this.ctx, {
      id: "palette-input",
      width: "100%",
      placeholder: "Type to search weapons, evolutions, passives…",
      backgroundColor: theme.bg,
      textColor: theme.text,
    });
    this.overlay.add(this.input);

    this.results = new SelectRenderable(this.ctx, {
      id: "palette-results",
      flexGrow: 1,
      options: [],
      showDescription: true,
      selectedBackgroundColor: theme.selectedBg,
      selectedTextColor: theme.selectedText,
    });
    this.overlay.add(this.results);

    this.input.on(InputRenderableEvents.INPUT, () =>
      this.refilter(this.input?.value ?? "")
    );
    this.results.on(SelectRenderableEvents.ITEM_SELECTED, (index: number) =>
      this.choose(index)
    );

    this.refilter("");
    this.input.focus();
  }

  close(): void {
    if (!this.opened) {
      return;
    }
    this.opened = false;
    if (this.overlay) {
      this.ctx.root.remove("palette");
      this.overlay.destroyRecursively();
    }
    this.overlay = undefined;
    this.input = undefined;
    this.results = undefined;
    this.hits = [];
    this.onClose();
  }

  /** Returns true if the key was consumed by the palette. */
  handleKey(key: KeyEvent): boolean {
    if (!this.opened) {
      return false;
    }
    if (key.name === "escape") {
      this.close();
      return true;
    }
    if (key.name === "return" || key.name === "enter") {
      this.choose(this.results?.getSelectedIndex() ?? 0);
      return true;
    }
    if (key.name === "up") {
      this.move(-1);
      return true;
    }
    if (key.name === "down") {
      this.move(1);
      return true;
    }
    return false; // let the focused input handle typing/backspace
  }

  private move(delta: number): void {
    if (!this.results || this.hits.length === 0) {
      return;
    }
    const next = Math.max(
      0,
      Math.min(this.hits.length - 1, this.results.getSelectedIndex() + delta)
    );
    this.results.setSelectedIndex(next);
  }

  private refilter(query: string): void {
    this.hits = search(this.repo.searchIndex(), query, 50);
    if (this.results) {
      this.results.options = this.hits.map((hit) => ({
        name: hit.label,
        description: `${hit.kind} · ${hit.subtitle}`,
      }));
    }
  }

  private choose(index: number): void {
    const hit = this.hits[index];
    if (!hit) {
      return;
    }
    const section = KIND_TO_SECTION[hit.kind];
    this.close();
    this.onSelect(section, hit.key);
  }
}
