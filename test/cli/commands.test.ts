import { beforeAll, describe, expect, test } from "bun:test";
import { buildCommand } from "../../src/cli/commands/build.ts";
import { characterCommand } from "../../src/cli/commands/character.ts";
import { evolveCommand } from "../../src/cli/commands/evolve.ts";
import { randomCommand } from "../../src/cli/commands/random.ts";
import { searchCommand } from "../../src/cli/commands/search.ts";
import { weaponCommand } from "../../src/cli/commands/weapon.ts";
import { CliError } from "../../src/cli/errors.ts";
import type { Repository } from "../../src/data/repository.ts";
import { loadFixtureRepo } from "../helpers/fixtures.ts";

let repo: Repository;

beforeAll(async () => {
  repo = await loadFixtureRepo();
});

describe("evolve", () => {
  test("shows how an evolved weapon is made", () => {
    const output = evolveCommand(repo, "Bloody Tear");
    expect(output).toContain("Made from");
    expect(output).toContain("Whip");
    expect(output).toContain("Hollow Heart");
  });

  test("shows what a base weapon evolves into", () => {
    const output = evolveCommand(repo, "Whip");
    expect(output).toContain("Evolves into");
    expect(output).toContain("Bloody Tear");
  });

  test("emits JSON with the json option", () => {
    const data = JSON.parse(evolveCommand(repo, "Bloody Tear", { json: true }));
    expect(data.weapon).toBe("Bloody Tear");
    expect(data.madeFrom.length).toBeGreaterThan(0);
  });

  test("throws CliError for an unknown weapon", () => {
    expect(() => evolveCommand(repo, "zzzzzz")).toThrow(CliError);
  });
});

describe("build", () => {
  test("lists evolutions achievable from owned items", () => {
    expect(buildCommand(repo, "Whip, Hollow Heart")).toContain("Bloody Tear");
  });

  test("reports unrecognised tokens", () => {
    expect(buildCommand(repo, "Whip, Zzzzzz").toLowerCase()).toContain(
      "zzzzzz"
    );
  });

  test("emits JSON with the json option", () => {
    const data = JSON.parse(
      buildCommand(repo, "Whip, Hollow Heart", { json: true })
    );
    expect(Array.isArray(data.achievable)).toBe(true);
  });
});

describe("search", () => {
  test("lists fuzzy matches", () => {
    expect(searchCommand(repo, "bloody")).toContain("Bloody Tear");
  });

  test("reports no results", () => {
    expect(searchCommand(repo, "zzzzzz").toLowerCase()).toContain("no results");
  });
});

describe("weapon and character", () => {
  test("weapon shows its type", () => {
    expect(weaponCommand(repo, "Whip")).toContain("Type:");
  });

  test("character shows base stats", () => {
    expect(characterCommand(repo, "Antonio")).toContain("Health");
  });

  test("unknown weapon throws CliError", () => {
    expect(() => weaponCommand(repo, "zzzzzz")).toThrow(CliError);
  });
});

describe("random", () => {
  test("suggests a character and its starting weapon's evolution path", () => {
    const output = randomCommand(repo, { rng: () => 0 }); // deterministic: first character
    expect(output).toContain("Antonio Belpaese");
    expect(output).toContain("Whip");
    expect(output).toContain("Bloody Tear");
  });

  test("emits JSON with the json option", () => {
    const data = JSON.parse(randomCommand(repo, { rng: () => 0, json: true }));
    expect(data.character).toBe("Antonio Belpaese");
  });
});
