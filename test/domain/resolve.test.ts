import { beforeAll, describe, expect, test } from "bun:test";
import type { NormalizedWeaponRow } from "../../src/data/raw-types.ts";
import { toWeapon } from "../../src/domain/entities.ts";
import { resolveByName } from "../../src/domain/resolve.ts";
import type { Weapon } from "../../src/domain/types.ts";
import { loadFixtureRows } from "../helpers/fixtures.ts";

let weapons: Weapon[];

beforeAll(async () => {
  weapons = (await loadFixtureRows<NormalizedWeaponRow>("infobox_weapon")).map(toWeapon);
});

describe("resolveByName", () => {
  test("an exact name match wins, case-insensitively", () => {
    expect(resolveByName(weapons, "whip", (weapon) => weapon.name)?.name).toBe("Whip");
  });

  test("falls back to a fuzzy match", () => {
    expect(resolveByName(weapons, "bloodytear", (weapon) => weapon.name)?.name).toBe("Bloody Tear");
  });

  test("returns undefined when nothing matches", () => {
    expect(resolveByName(weapons, "zzzzzz", (weapon) => weapon.name)).toBeUndefined();
  });

  test("returns undefined for an empty query", () => {
    expect(resolveByName(weapons, "  ", (weapon) => weapon.name)).toBeUndefined();
  });
});
