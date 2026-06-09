/**
 * Swaps the active section view inside the content pane. Switching sections
 * destroys the old view and creates a fresh one (datasets are tiny, so rebuild
 * is instant and avoids stale-state/focus bugs). Re-selecting the active section
 * just reveals the requested entity.
 */
import type { BoxRenderable } from "@opentui/core";
import type { View } from "./view.ts";

export interface SectionDef {
  create: () => View;
  id: string;
  label: string;
}

export class Router {
  private currentView?: View;

  constructor(
    private readonly content: BoxRenderable,
    private readonly sections: Map<string, SectionDef>
  ) {}

  show(sectionId: string, entityKey?: string): View | undefined {
    const def = this.sections.get(sectionId);
    if (!def) {
      return this.currentView;
    }

    if (this.currentView?.id === sectionId) {
      if (entityKey) {
        this.currentView.showEntity(entityKey);
      }
      return this.currentView;
    }

    this.currentView?.unmount();
    const view = def.create();
    view.mount(this.content);
    this.currentView = view;
    if (entityKey) {
      view.showEntity(entityKey);
    }
    return view;
  }

  active(): View | undefined {
    return this.currentView;
  }
}
