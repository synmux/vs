import { describe, expect, test } from "bun:test";
import type {
  NormalizedCharacterRow,
  NormalizedEvolutionRow,
  NormalizedPassiveRow,
  NormalizedWeaponRow,
} from "../../src/data/raw-types.ts";
import {
  toCharacter,
  toPassive,
  toRecipe,
  toWeapon,
} from "../../src/domain/entities.ts";

function evoRow(over: Partial<NormalizedEvolutionRow>): NormalizedEvolutionRow {
  return {
    page_name: "",
    evolution: "",
    base_weapon: [],
    secondary_passive: "",
    passive_max: false,
    glimmer: "",
    gift: false,
    ...over,
  };
}

function weaponRow(over: Partial<NormalizedWeaponRow>): NormalizedWeaponRow {
  return {
    page_name: "",
    name: "",
    type: "",
    description: "",
    id: [],
    dlc: "",
    is_default: false,
    order: 0,
    ...over,
  };
}

function passiveRow(over: Partial<NormalizedPassiveRow>): NormalizedPassiveRow {
  return {
    page_name: "",
    name: "",
    description: "",
    id: [],
    dlc: "",
    is_default: false,
    order: 0,
    ...over,
  };
}

function charRow(
  over: Partial<NormalizedCharacterRow>
): NormalizedCharacterRow {
  return {
    page_name: "",
    name: "",
    dlc: "",
    description: "",
    starting_weapon: [],
    unlocked_by: "",
    cost: 0,
    secret_character: false,
    max_health: 0,
    recovery: 0,
    armor: 0,
    amount: 0,
    move_speed: 0,
    might: 0,
    speed: 0,
    duration: 0,
    area: 0,
    cooldown: 0,
    magnet: 0,
    luck: 0,
    growth: 0,
    greed: 0,
    curse: 0,
    stats_json: "",
    ...over,
  };
}

describe("toRecipe", () => {
  test("assembles required passives from the page passive alone", () => {
    const recipe = toRecipe(
      evoRow({
        page_name: "Hollow Heart",
        base_weapon: ["Whip"],
        evolution: "Bloody Tear",
      })
    );
    expect(recipe).toEqual({
      result: "Bloody Tear",
      bases: ["Whip"],
      requiredPassives: ["Hollow Heart"],
      passiveMax: false,
      glimmer: "",
      gift: false,
    });
  });

  test("includes the secondary passive for union recipes", () => {
    const recipe = toRecipe(
      evoRow({
        page_name: "Hollow Heart",
        base_weapon: ["Metal Claw"],
        evolution: "Big Fuzzy Fist",
        secondary_passive: "Weapon Power-Up",
      })
    );
    expect(recipe.requiredPassives).toEqual([
      "Hollow Heart",
      "Weapon Power-Up",
    ]);
  });

  test("carries multiple bases (AND) and the passiveMax flag", () => {
    const recipe = toRecipe(
      evoRow({
        page_name: "Tirajisú",
        base_weapon: ["Phiera Der Tuphello", "Eight The Sparrow"],
        evolution: "Phieraggi",
        passive_max: true,
      })
    );
    expect(recipe.bases).toEqual(["Phiera Der Tuphello", "Eight The Sparrow"]);
    expect(recipe.passiveMax).toBe(true);
  });
});

describe("toWeapon", () => {
  test("cleans the type field and derives isEvolution", () => {
    const weapon = toWeapon(
      weaponRow({
        page_name: "Mixed",
        name: "Mixed",
        type: "Normal<br/>Evolution",
      })
    );
    expect(weapon.type).toBe("Normal Evolution");
    expect(weapon.isEvolution).toBe(true);
  });

  test("a Normal weapon is not an evolution", () => {
    expect(toWeapon(weaponRow({ type: "Normal" })).isEvolution).toBe(false);
  });
});

describe("toPassive", () => {
  test("cleans wiki markup in the description", () => {
    const passive = toPassive(
      passiveRow({ name: "Spinach", description: "Raises [[Might]] by 10%." })
    );
    expect(passive.description).toBe("Raises Might by 10%.");
  });
});

describe("toCharacter", () => {
  test("groups flat stat fields into a stats object", () => {
    const character = toCharacter(
      charRow({ name: "Imelda", max_health: 100, might: 1.1, move_speed: 1.4 })
    );
    expect(character.name).toBe("Imelda");
    expect(character.stats.maxHealth).toBe(100);
    expect(character.stats.might).toBe(1.1);
    expect(character.stats.moveSpeed).toBe(1.4);
  });
});
