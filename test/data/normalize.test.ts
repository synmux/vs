import { describe, expect, test } from "bun:test";
import { normalizeRow } from "../../src/data/bucket/normalize.ts";
import type { FieldSpec } from "../../src/data/bucket/normalize.ts";
import type { NormalizedEvolutionRow } from "../../src/data/raw-types.ts";

const evolutionSpec: FieldSpec = {
  page_name: "string",
  evolution: "string",
  base_weapon: "string[]",
  secondary_passive: "string",
  passive_max: "bool",
  glimmer: "string",
  gift: "bool",
};

describe("normalizeRow", () => {
  test("fills omitted fields with type-appropriate defaults", () => {
    // Real shape: Hollow Heart + Whip → Bloody Tear (no secondary/passive_max/glimmer/gift keys).
    const row = { page_name: "Hollow Heart", base_weapon: ["Whip"], evolution: "Bloody Tear" };
    expect(normalizeRow<NormalizedEvolutionRow>(row, evolutionSpec)).toEqual({
      page_name: "Hollow Heart",
      evolution: "Bloody Tear",
      base_weapon: ["Whip"],
      secondary_passive: "",
      passive_max: false,
      glimmer: "",
      gift: false,
    });
  });

  test("treats a present empty-string boolean as true (presence = true)", () => {
    // Real shape: passive_max serialises as "" when the passive must be maxed.
    const row = { page_name: "Hollow Heart", base_weapon: ["Mace"], evolution: "Stamazza", passive_max: "" };
    expect(normalizeRow<NormalizedEvolutionRow>(row, evolutionSpec).passive_max).toBe(true);
  });

  test("treats an omitted boolean as false", () => {
    expect(normalizeRow<{ gift: boolean }>({}, { gift: "bool" })).toEqual({ gift: false });
  });

  test("keeps array values for string[] fields", () => {
    const row = { base_weapon: ["Phiera Der Tuphello", "Eight The Sparrow"] };
    expect(normalizeRow<{ base_weapon: string[] }>(row, { base_weapon: "string[]" }).base_weapon).toEqual([
      "Phiera Der Tuphello",
      "Eight The Sparrow",
    ]);
  });

  test("wraps a scalar into an array for string[] fields", () => {
    expect(normalizeRow<{ base_weapon: string[] }>({ base_weapon: "Whip" }, { base_weapon: "string[]" }).base_weapon).toEqual([
      "Whip",
    ]);
  });

  test("coerces numbers and defaults missing numerics to 0", () => {
    const spec: FieldSpec = { cost: "int", move_speed: "float" };
    type Row = { cost: number; move_speed: number };
    expect(normalizeRow<Row>({ cost: 10, move_speed: 1.4 }, spec)).toEqual({ cost: 10, move_speed: 1.4 });
    expect(normalizeRow<Row>({}, spec)).toEqual({ cost: 0, move_speed: 0 });
  });

  test("parses string-encoded numbers", () => {
    expect(normalizeRow<{ cost: number }>({ cost: "7" }, { cost: "int" })).toEqual({ cost: 7 });
  });

  test("truncates floats for int fields", () => {
    expect(normalizeRow<{ n: number }>({ n: 3.9 }, { n: "int" })).toEqual({ n: 3 });
  });

  test("coerces non-string scalars to string for string fields", () => {
    expect(normalizeRow<{ n: string }>({ n: 5 }, { n: "string" })).toEqual({ n: "5" });
  });

  test("includes only fields declared in the spec", () => {
    expect(normalizeRow<{ page_name: string }>({ page_name: "X", extra: "ignored" }, { page_name: "string" })).toEqual({
      page_name: "X",
    });
  });
});
