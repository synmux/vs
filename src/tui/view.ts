/**
 * The View abstraction the router swaps in and out of the content pane, plus a
 * ListDetailView base that most sections share: a selectable list on the left,
 * a scrollable detail panel on the right, kept in sync on selection change.
 *
 * Cross-linking: a view's detail can declare {@link LinkTarget}s (related
 * entities). The base renders them as a numbered "Jump:" list and turns digit
 * keys 1–9 into navigation, so e.g. an evolution can jump to its base weapon or
 * required passive. This is the "navigate data in useful ways" core.
 */

import type { CliRenderer, KeyEvent } from "@opentui/core";
import {
  BoxRenderable,
  ScrollBoxRenderable,
  SelectRenderable,
  SelectRenderableEvents,
  TextRenderable,
} from "@opentui/core";
import type { Focusable } from "./focus.ts";
import { theme } from "./theme.ts";

/** Navigate to another section, optionally revealing a specific entity. */
export type Navigate = (section: string, entityKey: string) => void;

export interface View {
  focusTargets(): Focusable[];
  handleKey(key: KeyEvent): boolean;
  readonly id: string;
  mount(container: BoxRenderable): void;
  showEntity(key: string): void;
  readonly title: string;
  unmount(): void;
}

export interface ListItem {
  description: string;
  key: string;
  name: string;
}

/** A jumpable related entity shown in a detail panel. */
export interface LinkTarget {
  key: string;
  label: string;
  section: string;
}

export interface DetailContent {
  links?: LinkTarget[];
  text: string;
}

export abstract class ListDetailView implements View {
  abstract readonly id: string;
  abstract readonly title: string;

  protected list!: SelectRenderable;
  protected detailScroll!: ScrollBoxRenderable;
  protected detailText!: TextRenderable;
  private root?: BoxRenderable;
  private container?: BoxRenderable;
  private itemKeys: string[] = [];
  private currentLinks: LinkTarget[] = [];

  constructor(
    protected readonly ctx: CliRenderer,
    protected readonly navigate?: Navigate
  ) {}

  /** Subclass: the rows to list (key is the entity page name). */
  protected abstract buildItems(): ListItem[];
  /** Subclass: detail content (text + optional cross-links) for an entity key. */
  protected abstract renderDetail(key: string): DetailContent;

  mount(container: BoxRenderable): void {
    this.container = container;
    const items = this.buildItems();
    this.itemKeys = items.map((item) => item.key);

    this.root = new BoxRenderable(this.ctx, {
      id: `${this.id}-row`,
      flexDirection: "row",
      flexGrow: 1,
      gap: 1,
    });
    container.add(this.root);

    const listBox = new BoxRenderable(this.ctx, {
      id: `${this.id}-listbox`,
      width: "42%",
      border: true,
      borderStyle: theme.borderStyle,
      borderColor: theme.border,
      focusedBorderColor: theme.borderFocused,
      title: ` ${this.title} `,
    });
    this.root.add(listBox);

    this.list = new SelectRenderable(this.ctx, {
      id: `${this.id}-list`,
      flexGrow: 1,
      options: items.map((item) => ({
        name: item.name,
        description: item.description,
      })),
      showDescription: false,
      showScrollIndicator: true,
      wrapSelection: true,
      selectedBackgroundColor: theme.selectedBg,
      selectedTextColor: theme.selectedText,
    });
    listBox.add(this.list);

    const detailBox = new BoxRenderable(this.ctx, {
      id: `${this.id}-detailbox`,
      flexGrow: 1,
      border: true,
      borderStyle: theme.borderStyle,
      borderColor: theme.border,
      focusedBorderColor: theme.borderFocused,
      title: " Detail ",
    });
    this.root.add(detailBox);

    this.detailScroll = new ScrollBoxRenderable(this.ctx, {
      id: `${this.id}-detailscroll`,
      flexGrow: 1,
      paddingLeft: 1,
      paddingRight: 1,
    });
    detailBox.add(this.detailScroll);
    this.detailText = new TextRenderable(this.ctx, {
      id: `${this.id}-detailtext`,
      content: "",
      fg: theme.text,
    });
    this.detailScroll.add(this.detailText);

    this.list.on(SelectRenderableEvents.SELECTION_CHANGED, (index: number) =>
      this.updateDetail(index)
    );
    if (items.length > 0) {
      this.updateDetail(0);
    }
  }

  private updateDetail(index: number): void {
    const key = this.itemKeys[index];
    if (!key) {
      this.detailText.content = "";
      this.currentLinks = [];
      return;
    }
    const { text, links = [] } = this.renderDetail(key);
    this.currentLinks = links.slice(0, 9);

    let content = text;
    if (this.currentLinks.length > 0 && this.navigate) {
      content +=
        "\n\nJump:\n" +
        this.currentLinks
          .map((link, position) => `  [${position + 1}] ${link.label}`)
          .join("\n");
    }
    this.detailText.content = content;
  }

  unmount(): void {
    if (!this.root) {
      return;
    }
    this.container?.remove(`${this.id}-row`);
    this.root.destroyRecursively();
    this.root = undefined;
  }

  focusTargets(): Focusable[] {
    return [this.list, this.detailScroll];
  }

  handleKey(key: KeyEvent): boolean {
    if (this.navigate && key.name && /^[1-9]$/.test(key.name)) {
      const link = this.currentLinks[Number(key.name) - 1];
      if (link) {
        this.navigate(link.section, link.key);
        return true;
      }
    }
    return false;
  }

  showEntity(key: string): void {
    const index = this.itemKeys.indexOf(key);
    if (index >= 0) {
      this.list.setSelectedIndex(index);
      this.updateDetail(index);
    }
  }
}
