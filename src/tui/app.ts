/**
 * Wires the shell, router, focus ring, nav history, and command palette into a
 * running app. `createApp` builds everything against a renderer and returns a
 * controller (testable headlessly via createTestRenderer); `runTui` adds a real
 * terminal renderer and blocks until quit.
 *
 * Key routing (renderer.keyInput): while the palette is open it owns all keys;
 * otherwise `/` opens the palette, Tab/Shift-Tab move focus, q/Ctrl-C quit, Esc
 * goes back (nav history) and finally returns focus to the sidebar. Arrow keys
 * fall through to whichever widget is focused (OpenTUI routes them).
 */

import type { CliRenderer, KeyEvent } from "@opentui/core";
import { SelectRenderableEvents } from "@opentui/core";
import { cacheStaleness } from "../data/cache.ts";
import type { Repository } from "../data/repository.ts";
import type { Focusable } from "./focus.ts";
import { FocusRing } from "./focus.ts";
import type { NavTarget } from "./nav.ts";
import { NavStack } from "./nav.ts";
import { Palette } from "./palette.ts";
import { Router } from "./router.ts";
import { buildSections } from "./sections.ts";
import { buildShell } from "./shell.ts";
import type { Navigate } from "./view.ts";

export interface AppController {
  destroy(): void;
  goToSection(sectionId: string, entityKey?: string): void;
  isPaletteOpen(): boolean;
  openPalette(): void;
}

export interface CreateAppOptions {
  onQuit?: () => void;
  startSection?: string;
}

export function createApp(
  renderer: CliRenderer,
  repo: Repository,
  options: CreateAppOptions = {}
): AppController {
  // Forward reference: views cross-link via `navigate`, which is only invoked
  // after the nav stack exists (on mount, after createApp returns).
  let nav: NavStack;
  const navigate: Navigate = (section, entityKey) =>
    nav.go({ section, entityKey });

  const sections = buildSections(renderer, repo, navigate);
  const sectionIndex = new Map(
    sections.map((section, index) => [section.id, index])
  );
  const stale = cacheStaleness(repo.meta().fetchedAt);
  const statusText = `  ↑↓ move · Tab focus · 1-9 jump · / search · Esc back · q quit     data ${stale.label}`;

  const shell = buildShell(
    renderer,
    sections.map((section) => ({ id: section.id, label: section.label })),
    statusText
  );
  renderer.root.add(shell.app);

  const router = new Router(
    shell.content,
    new Map(sections.map((section) => [section.id, section]))
  );
  const focus = new FocusRing();
  let suppressSidebarEvent = false;

  function updateFocus(focusContent: boolean): void {
    const targets: Focusable[] = [
      shell.sidebar,
      ...(router.active()?.focusTargets() ?? []),
    ];
    focus.setTargets(targets);
    focus.focusIndex(focusContent && targets.length > 1 ? 1 : 0);
  }

  function applyTarget(target: NavTarget, focusContent: boolean): void {
    const index = sectionIndex.get(target.section);
    if (index === undefined) {
      return;
    }
    suppressSidebarEvent = true;
    shell.sidebar.setSelectedIndex(index);
    suppressSidebarEvent = false;
    router.show(target.section, target.entityKey);
    updateFocus(focusContent);
  }

  // Revealing a specific entity focuses the content; plain section switches focus the sidebar.
  nav = new NavStack(
    (target) => applyTarget(target, Boolean(target.entityKey)),
    { section: options.startSection ?? "home" }
  );

  const palette = new Palette(
    renderer,
    repo,
    (section, entityKey) => nav.go({ section, entityKey }),
    () => focus.focusIndex(focus.currentIndex())
  );

  shell.sidebar.on(
    SelectRenderableEvents.SELECTION_CHANGED,
    (index: number) => {
      if (suppressSidebarEvent) {
        return;
      }
      const section = sections[index];
      if (section) {
        nav.replace({ section: section.id });
      }
    }
  );

  renderer.keyInput.on("keypress", (key: KeyEvent) => {
    if (palette.isOpen()) {
      palette.handleKey(key);
      return;
    }
    if (key.name === "/") {
      palette.open();
      return;
    }
    if (key.name === "tab") {
      if (key.shift) {
        focus.previous();
      } else {
        focus.next();
      }
      return;
    }
    if (key.name === "q" || (key.ctrl && key.name === "c")) {
      options.onQuit?.();
      return;
    }
    if (key.name === "escape") {
      if (!nav.back()) {
        focus.focusIndex(0);
      }
      return;
    }
    router.active()?.handleKey(key);
  });

  nav.replace({ section: options.startSection ?? "home" });

  return {
    goToSection(sectionId: string, entityKey?: string) {
      if (entityKey) {
        nav.go({ section: sectionId, entityKey });
      } else {
        nav.replace({ section: sectionId });
      }
    },
    openPalette: () => palette.open(),
    isPaletteOpen: () => palette.isOpen(),
    destroy: () => renderer.destroy(),
  };
}

export async function runTui(
  repo: Repository,
  startSection = "home",
  startEntity?: string
): Promise<void> {
  const { createCliRenderer } = await import("@opentui/core");
  const renderer = await createCliRenderer({
    exitOnCtrlC: true,
    targetFps: 30,
  });
  const app = createApp(renderer, repo, {
    startSection,
    onQuit: () => {
      renderer.destroy();
      process.exit(0);
    },
  });
  if (startEntity) {
    app.goToSection(startSection, startEntity);
  }
  await new Promise<never>(() => {}); // keep the process alive; quit via onQuit
}
