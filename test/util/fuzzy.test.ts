import { describe, expect, test } from "bun:test";
import { fuzzyScore } from "../../src/util/fuzzy.ts";

describe("fuzzyScore", () => {
  test("returns null when the query is not a subsequence of the target", () => {
    expect(fuzzyScore("zzz", "Whip")).toBeNull();
  });

  test("matches case-insensitively", () => {
    expect(fuzzyScore("WHIP", "whip")).not.toBeNull();
  });

  test("an empty query matches with a neutral score of 0", () => {
    expect(fuzzyScore("", "anything")).toBe(0);
  });

  test("scores a contiguous prefix higher than a scattered match", () => {
    expect(fuzzyScore("whip", "Whip")!).toBeGreaterThan(fuzzyScore("whip", "Warship")!);
  });

  test("scores an earlier match higher than a later one", () => {
    expect(fuzzyScore("w", "Whip")!).toBeGreaterThan(fuzzyScore("w", "Glow Worm")!);
  });

  test("matches across word boundaries (initials)", () => {
    expect(fuzzyScore("bt", "Bloody Tear")).not.toBeNull();
  });
});
