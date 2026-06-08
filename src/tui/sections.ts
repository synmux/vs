/** Registry of TUI sections (sidebar entries + their view factories). */
import type { CliRenderer } from "@opentui/core";
import type { Repository } from "../data/repository.ts";
import type { SectionDef } from "./router.ts";
import { HomeView } from "./views/home.ts";
import { WeaponsView } from "./views/weapons.ts";

export function buildSections(ctx: CliRenderer, repo: Repository): SectionDef[] {
  return [
    { id: "home", label: "Home", create: () => new HomeView(ctx, repo) },
    { id: "weapons", label: "Weapons", create: () => new WeaponsView(ctx, repo) },
  ];
}
