import { describe, expect, test } from "bun:test";
import { uniqueBy } from "../../src/util/collections.ts";

describe("uniqueBy", () => {
  test("keeps the first item for each key, preserving order", () => {
    const items = [
      { id: "a", n: 1 },
      { id: "b", n: 2 },
      { id: "a", n: 3 },
    ];
    expect(uniqueBy(items, (item) => item.id)).toEqual([
      { id: "a", n: 1 },
      { id: "b", n: 2 },
    ]);
  });

  test("returns an empty array unchanged", () => {
    expect(uniqueBy([], (item: { id: string }) => item.id)).toEqual([]);
  });
});
