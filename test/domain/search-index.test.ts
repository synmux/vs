import { beforeAll, describe, expect, test } from "bun:test";
import type {
  NormalizedArcanaRow,
  NormalizedBestiaryRow,
  NormalizedCharacterRow,
  NormalizedEvolutionRow,
  NormalizedPassiveRow,
  NormalizedStageRow,
  NormalizedWeaponRow,
} from "../../src/data/raw-types.ts";
import {
  toArcana,
  toBestiaryEntry,
  toCharacter,
  toPassive,
  toRecipe,
  toStage,
  toWeapon,
} from "../../src/domain/entities.ts";
import type { SearchEntry } from "../../src/domain/search-index.ts";
import { buildSearchIndex, search } from "../../src/domain/search-index.ts";
import { loadFixtureRows } from "../helpers/fixtures.ts";

let index: SearchEntry[];

beforeAll(async () => {
  index = buildSearchIndex({
    weapons: (await loadFixtureRows<NormalizedWeaponRow>("infobox_weapon")).map(
      toWeapon
    ),
    passives: (
      await loadFixtureRows<NormalizedPassiveRow>("infobox_passive_item")
    ).map(toPassive),
    characters: (
      await loadFixtureRows<NormalizedCharacterRow>("infobox_character")
    ).map(toCharacter),
    stages: (await loadFixtureRows<NormalizedStageRow>("infobox_stage")).map(
      toStage
    ),
    arcanas: (await loadFixtureRows<NormalizedArcanaRow>("infobox_arcana")).map(
      toArcana
    ),
    bestiary: (
      await loadFixtureRows<NormalizedBestiaryRow>("infobox_bestiary")
    ).map(toBestiaryEntry),
    recipes: (
      await loadFixtureRows<NormalizedEvolutionRow>("passive_evolutions")
    ).map(toRecipe),
  });
});

describe("search (real fixture data)", () => {
  test("finds an entity by fuzzy name, ranking the best match first", () => {
    expect(search(index, "bloody")[0]?.label).toBe("Bloody Tear");
  });

  test("returns typed hits including the weapon kind", () => {
    expect(
      search(index, "whip").some(
        (hit) => hit.kind === "weapon" && hit.label === "Whip"
      )
    ).toBe(true);
  });

  test("an empty or whitespace query returns nothing", () => {
    expect(search(index, "  ")).toEqual([]);
  });

  test("respects the result limit", () => {
    expect(search(index, "a", 5).length).toBeLessThanOrEqual(5);
  });

  test("includes evolution recipes with a how-to-make subtitle", () => {
    const evolutionHit = search(index, "bloody").find(
      (hit) => hit.kind === "evolution"
    );
    expect(evolutionHit?.subtitle).toContain("Whip");
  });
});
