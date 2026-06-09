import { beforeAll, describe, expect, test } from "bun:test";
import type {
  NormalizedEvolutionRow,
  NormalizedWeaponRow,
} from "../../src/data/raw-types.ts";
import { toRecipe, toWeapon } from "../../src/domain/entities.ts";
import type { EvolutionGraph } from "../../src/domain/evolution-graph.ts";
import { buildEvolutionGraph } from "../../src/domain/evolution-graph.ts";
import { loadFixtureRows } from "../helpers/fixtures.ts";

let graph: EvolutionGraph;

beforeAll(async () => {
  const recipes = (
    await loadFixtureRows<NormalizedEvolutionRow>("passive_evolutions")
  ).map(toRecipe);
  const weapons = (
    await loadFixtureRows<NormalizedWeaponRow>("infobox_weapon")
  ).map(toWeapon);
  graph = buildEvolutionGraph(recipes, weapons);
});

describe("buildEvolutionGraph (real fixture data)", () => {
  test("indexes recipes by result weapon", () => {
    const recipes = graph.byResult.get("Bloody Tear");
    expect(recipes).toBeDefined();
    expect(recipes?.[0]).toMatchObject({
      bases: ["Whip"],
      requiredPassives: ["Hollow Heart"],
    });
  });

  test("indexes recipes by base weapon", () => {
    const fromWhip = graph.byBase.get("Whip") ?? [];
    expect(fromWhip.some((recipe) => recipe.result === "Bloody Tear")).toBe(
      true
    );
  });

  test("indexes recipes by required passive", () => {
    // Hollow Heart evolves several different weapons.
    expect((graph.byPassive.get("Hollow Heart") ?? []).length).toBeGreaterThan(
      1
    );
  });

  test("models a multi-base recipe under every one of its bases", () => {
    expect(graph.byResult.get("Phieraggi")?.[0]?.bases).toEqual([
      "Phiera Der Tuphello",
      "Eight The Sparrow",
    ]);
    expect(
      graph.byBase
        .get("Phiera Der Tuphello")
        ?.some((recipe) => recipe.result === "Phieraggi")
    ).toBe(true);
    expect(
      graph.byBase
        .get("Eight The Sparrow")
        ?.some((recipe) => recipe.result === "Phieraggi")
    ).toBe(true);
  });

  test("lists base weapons with no evolution, excluding ones that evolve", () => {
    expect(graph.weaponsWithoutEvolution).not.toContain("Whip");
    expect(graph.weaponsWithoutEvolution.length).toBeGreaterThan(0);
  });

  test("reports no dangling evolution results (all results resolve to a weapon page)", () => {
    expect(
      graph.warnings.filter((warning) =>
        warning.startsWith("Evolution result not found")
      )
    ).toEqual([]);
  });
});
