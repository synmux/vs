import { beforeAll, describe, expect, test } from "bun:test";
import type { EvolutionGraph } from "../../src/domain/evolution-graph.ts";
import { evolutionsForBase, recipesForPassive, recipesForResult } from "../../src/domain/solver.ts";
import { loadFixtureGraph } from "../helpers/fixtures.ts";

let graph: EvolutionGraph;

beforeAll(async () => {
  graph = await loadFixtureGraph();
});

describe("solver (real fixture data)", () => {
  test("recipesForResult returns the recipes that produce a weapon", () => {
    expect(recipesForResult(graph, "Bloody Tear").some((recipe) => recipe.bases.includes("Whip"))).toBe(true);
  });

  test("evolutionsForBase returns the recipes a base participates in", () => {
    expect(evolutionsForBase(graph, "Whip").some((recipe) => recipe.result === "Bloody Tear")).toBe(true);
  });

  test("the two directions reference the same recipe", () => {
    const viaBase = evolutionsForBase(graph, "Whip").find((recipe) => recipe.result === "Bloody Tear");
    const viaResult = recipesForResult(graph, "Bloody Tear").find((recipe) => recipe.bases.includes("Whip"));
    expect(viaBase).toEqual(viaResult);
  });

  test("recipesForPassive returns recipes requiring that passive", () => {
    expect(recipesForPassive(graph, "Hollow Heart").every((recipe) => recipe.requiredPassives.includes("Hollow Heart"))).toBe(
      true,
    );
  });

  test("unknown keys return empty arrays", () => {
    expect(recipesForResult(graph, "Nonexistent")).toEqual([]);
    expect(evolutionsForBase(graph, "Nonexistent")).toEqual([]);
    expect(recipesForPassive(graph, "Nonexistent")).toEqual([]);
  });
});
