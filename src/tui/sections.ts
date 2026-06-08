/** Registry of TUI sections (sidebar entries + their view factories). */
import type { CliRenderer } from "@opentui/core";
import type { Repository } from "../data/repository.ts";
import type { SectionDef } from "./router.ts";
import type { Navigate } from "./view.ts";
import { ArcanasView } from "./views/arcanas.ts";
import { BestiaryView } from "./views/bestiary.ts";
import { CharactersView } from "./views/characters.ts";
import { EvolutionsView } from "./views/evolutions.ts";
import { HomeView } from "./views/home.ts";
import { PassivesView } from "./views/passives.ts";
import { StagesView } from "./views/stages.ts";
import { WeaponsView } from "./views/weapons.ts";

export function buildSections(ctx: CliRenderer, repo: Repository, navigate: Navigate): SectionDef[] {
  return [
    { id: "home", label: "Home", create: () => new HomeView(ctx, repo) },
    { id: "evolutions", label: "Evolutions", create: () => new EvolutionsView(ctx, repo, navigate) },
    { id: "weapons", label: "Weapons", create: () => new WeaponsView(ctx, repo, navigate) },
    { id: "passives", label: "Passives", create: () => new PassivesView(ctx, repo, navigate) },
    { id: "characters", label: "Characters", create: () => new CharactersView(ctx, repo, navigate) },
    { id: "stages", label: "Stages", create: () => new StagesView(ctx, repo, navigate) },
    { id: "arcanas", label: "Arcanas", create: () => new ArcanasView(ctx, repo, navigate) },
    { id: "bestiary", label: "Bestiary", create: () => new BestiaryView(ctx, repo, navigate) },
  ];
}
