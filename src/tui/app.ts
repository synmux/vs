/**
 * Wires the shell, router, and focus ring into a running app. `createApp` builds
 * everything against a renderer and returns a controller (testable headlessly
 * with createTestRenderer); `runTui` adds a real terminal renderer and blocks
 * until quit.
 *
 * Global keys are handled on renderer.keyInput: Tab/Shift-Tab move the focus
 * ring, q/Ctrl-C quit. Arrow keys are left to whichever widget is focused (the
 * sidebar Select or a view's list), which OpenTUI routes automatically.
 */
import { SelectRenderableEvents } from "@opentui/core";
import type { CliRenderer, KeyEvent } from "@opentui/core";
import { cacheStaleness } from "../data/cache.ts";
import type { Repository } from "../data/repository.ts";
import { FocusRing } from "./focus.ts";
import type { Focusable } from "./focus.ts";
import { Router } from "./router.ts";
import { buildSections } from "./sections.ts";
import { buildShell } from "./shell.ts";

export interface AppController {
  goToSection(sectionId: string, entityKey?: string, focusContent?: boolean): void;
  destroy(): void;
}

export function createApp(renderer: CliRenderer, repo: Repository, options: { onQuit?: () => void } = {}): AppController {
  const sections = buildSections(renderer, repo);
  const sectionIndex = new Map(sections.map((section, index) => [section.id, index]));
  const stale = cacheStaleness(repo.meta().fetchedAt);
  const statusText = `  ↑↓ move · Tab focus · / search · q quit        data ${stale.label}`;

  const shell = buildShell(renderer, sections.map((section) => ({ id: section.id, label: section.label })), statusText);
  renderer.root.add(shell.app);

  const router = new Router(shell.content, new Map(sections.map((section) => [section.id, section])));
  const focus = new FocusRing();
  let suppressSidebarEvent = false;

  function updateFocus(focusContent: boolean): void {
    const targets: Focusable[] = [shell.sidebar, ...(router.active()?.focusTargets() ?? [])];
    focus.setTargets(targets);
    focus.focusIndex(focusContent && targets.length > 1 ? 1 : 0);
  }

  function goToSection(sectionId: string, entityKey?: string, focusContent = false): void {
    const index = sectionIndex.get(sectionId);
    if (index === undefined) return;
    suppressSidebarEvent = true;
    shell.sidebar.setSelectedIndex(index);
    suppressSidebarEvent = false;
    router.show(sectionId, entityKey);
    updateFocus(focusContent);
  }

  shell.sidebar.on(SelectRenderableEvents.SELECTION_CHANGED, (index: number) => {
    if (suppressSidebarEvent) return;
    const section = sections[index];
    if (!section) return;
    router.show(section.id);
    updateFocus(false);
  });

  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    if (key.name === "tab") {
      if (key.shift) focus.previous();
      else focus.next();
      return;
    }
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      options.onQuit?.();
      return;
    }
    router.active()?.handleKey(key);
  });

  router.show(sections[0]!.id);
  updateFocus(false);

  return {
    goToSection,
    destroy() {
      renderer.destroy();
    },
  };
}

export async function runTui(repo: Repository, startSection = "home", startEntity?: string): Promise<void> {
  const { createCliRenderer } = await import("@opentui/core");
  const renderer = await createCliRenderer({ exitOnCtrlC: true, targetFps: 30 });
  createApp(renderer, repo, {
    onQuit: () => {
      renderer.destroy();
      process.exit(0);
    },
  }).goToSection(startSection, startEntity, Boolean(startEntity));
  await new Promise<never>(() => {}); // keep the process alive; quit via onQuit
}
