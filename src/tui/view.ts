/**
 * The View abstraction the router swaps in and out of the content pane, plus a
 * ListDetailView base that most sections share: a selectable list on the left,
 * a scrollable detail panel on the right, kept in sync on selection change.
 *
 * Views are constructed with the renderer (their drawing context) and add their
 * renderables to the container passed to mount(); unmount tears them down so the
 * router can destroy+recreate views cleanly on section change.
 */
import { BoxRenderable, ScrollBoxRenderable, SelectRenderable, SelectRenderableEvents, TextRenderable } from "@opentui/core";
import type { CliRenderer, KeyEvent } from "@opentui/core";
import type { Focusable } from "./focus.ts";
import { theme } from "./theme.ts";

export interface View {
  readonly id: string;
  readonly title: string;
  mount(container: BoxRenderable): void;
  unmount(): void;
  /** Widgets this view contributes to the focus ring, in order. */
  focusTargets(): Focusable[];
  /** Handle a key the global handler didn't consume; return true if handled. */
  handleKey(key: KeyEvent): boolean;
  /** Select and reveal a specific entity (cross-link / palette target). */
  showEntity(key: string): void;
}

export interface ListItem {
  key: string;
  name: string;
  description: string;
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

  constructor(protected readonly ctx: CliRenderer) {}

  /** Subclass: the rows to list (key is the entity page name). */
  protected abstract buildItems(): ListItem[];
  /** Subclass: detail text for the selected entity key. */
  protected abstract renderDetail(key: string): string;

  mount(container: BoxRenderable): void {
    this.container = container;
    const items = this.buildItems();
    this.itemKeys = items.map((item) => item.key);

    this.root = new BoxRenderable(this.ctx, { id: `${this.id}-row`, flexDirection: "row", flexGrow: 1, gap: 1 });
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
      options: items.map((item) => ({ name: item.name, description: item.description })),
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

    this.detailScroll = new ScrollBoxRenderable(this.ctx, { id: `${this.id}-detailscroll`, flexGrow: 1 });
    detailBox.add(this.detailScroll);
    this.detailText = new TextRenderable(this.ctx, { id: `${this.id}-detailtext`, content: "", fg: theme.text });
    this.detailScroll.add(this.detailText);

    this.list.on(SelectRenderableEvents.SELECTION_CHANGED, (index: number) => this.updateDetail(index));
    if (items.length > 0) this.updateDetail(0);
  }

  private updateDetail(index: number): void {
    const key = this.itemKeys[index];
    this.detailText.content = key ? this.renderDetail(key) : "";
  }

  unmount(): void {
    if (!this.root) return;
    this.container?.remove(`${this.id}-row`);
    this.root.destroyRecursively();
    this.root = undefined;
  }

  focusTargets(): Focusable[] {
    return [this.list, this.detailScroll];
  }

  handleKey(): boolean {
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
