/**
 * Builds the static frame: a vertical app box containing a horizontal main row
 * (sidebar section list + content pane) above a one-line status bar. The status
 * bar is a normal flex row (not absolute) to avoid positioning surprises.
 */
import { BoxRenderable, SelectRenderable, TextRenderable } from "@opentui/core";
import type { CliRenderer } from "@opentui/core";
import { theme } from "./theme.ts";

export interface SectionMeta {
  id: string;
  label: string;
}

export interface Shell {
  app: BoxRenderable;
  sidebar: SelectRenderable;
  content: BoxRenderable;
  statusbar: TextRenderable;
}

export function buildShell(ctx: CliRenderer, sections: SectionMeta[], statusText: string): Shell {
  const app = new BoxRenderable(ctx, {
    id: "app",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    backgroundColor: theme.bg,
  });

  const main = new BoxRenderable(ctx, { id: "main", flexDirection: "row", flexGrow: 1 });
  app.add(main);

  const sidebarBox = new BoxRenderable(ctx, {
    id: "sidebar-box",
    width: 22,
    flexShrink: 0,
    border: true,
    borderStyle: theme.borderStyle,
    borderColor: theme.border,
    focusedBorderColor: theme.borderFocused,
    title: " vs ",
  });
  main.add(sidebarBox);

  const sidebar = new SelectRenderable(ctx, {
    id: "sidebar",
    flexGrow: 1,
    options: sections.map((section) => ({ name: section.label, description: "" })),
    showDescription: false,
    wrapSelection: true,
    selectedBackgroundColor: theme.selectedBg,
    selectedTextColor: theme.selectedText,
  });
  sidebarBox.add(sidebar);

  const content = new BoxRenderable(ctx, { id: "content", flexGrow: 1, flexDirection: "column" });
  main.add(content);

  const statusbar = new TextRenderable(ctx, { id: "statusbar", content: statusText, fg: theme.dim, height: 1 });
  app.add(statusbar);

  return { app, sidebar, content, statusbar };
}
