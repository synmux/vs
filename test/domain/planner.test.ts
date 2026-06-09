import { beforeAll, describe, expect, test } from "bun:test";
import type { EvolutionGraph } from "../../src/domain/evolution-graph.ts";
import { missingForRecipe, planBuild } from "../../src/domain/planner.ts";
import { loadFixtureGraph } from "../helpers/fixtures.ts";

let graph: EvolutionGraph;

beforeAll(async () => {
  graph = await loadFixtureGraph();
});

describe("planBuild (real fixture data)", () => {
  test("a recipe with every base and passive owned is achievable", () => {
    const owned = {
      weapons: new Set(["Whip"]),
      passives: new Set(["Hollow Heart"]),
    };
    expect(
      planBuild(graph, owned).achievable.some(
        (recipe) => recipe.result === "Bloody Tear"
      )
    ).toBe(true);
  });

  test("missing exactly one required item lands it in one-away, naming the item", () => {
    const owned = { weapons: new Set(["Whip"]), passives: new Set<string>() };
    const plan = planBuild(graph, owned);
    const bloodyTear = plan.oneAway.find(
      (entry) => entry.recipe.result === "Bloody Tear"
    );
    expect(bloodyTear?.missing).toEqual([
      { kind: "passive", key: "Hollow Heart" },
    ]);
  });

  test("a multi-base recipe requires ALL bases (AND), not any", () => {
    // Own one of Phieraggi's two bases (and its passive) → one-away on the other base.
    const owned = {
      weapons: new Set(["Phiera Der Tuphello"]),
      passives: new Set(["Tirajisú"]),
    };
    const phieraggi = planBuild(graph, owned).oneAway.find(
      (entry) => entry.recipe.result === "Phieraggi"
    );
    expect(phieraggi?.missing).toEqual([
      { kind: "weapon", key: "Eight The Sparrow" },
    ]);
  });
});

describe("missingForRecipe and passiveMax", () => {
  test("when tracking max levels, owning but not maxing the passive is unsatisfied", () => {
    const recipe = graph.recipes.find((entry) => entry.passiveMax);
    expect(recipe).toBeDefined();
    const notMaxed = {
      weapons: new Set(recipe?.bases),
      passives: new Set(recipe?.requiredPassives),
      maxedPassives: new Set<string>(),
    };
    expect(missingForRecipe(recipe!, notMaxed).length).toBeGreaterThan(0);

    const maxed = {
      weapons: new Set(recipe?.bases),
      passives: new Set(recipe?.requiredPassives),
      maxedPassives: new Set(recipe?.requiredPassives),
    };
    expect(missingForRecipe(recipe!, maxed)).toEqual([]);
  });

  test("without max-level tracking, owning the passive satisfies even passiveMax recipes", () => {
    const recipe = graph.recipes.find((entry) => entry.passiveMax);
    const owned = {
      weapons: new Set(recipe?.bases),
      passives: new Set(recipe?.requiredPassives),
    };
    expect(missingForRecipe(recipe!, owned)).toEqual([]);
  });
});
