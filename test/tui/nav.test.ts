import { describe, expect, test } from "bun:test";
import { NavStack } from "../../src/tui/nav.ts";
import type { NavTarget } from "../../src/tui/nav.ts";

describe("NavStack", () => {
  test("go navigates to the target", () => {
    const visited: NavTarget[] = [];
    const nav = new NavStack((target) => visited.push(target), { section: "home" });
    nav.go({ section: "weapons", entityKey: "Whip" });
    expect(visited).toEqual([{ section: "weapons", entityKey: "Whip" }]);
    expect(nav.currentTarget()).toEqual({ section: "weapons", entityKey: "Whip" });
  });

  test("back returns to the previous target", () => {
    const visited: NavTarget[] = [];
    const nav = new NavStack((target) => visited.push(target), { section: "home" });
    nav.go({ section: "weapons", entityKey: "Whip" });
    nav.go({ section: "evolutions", entityKey: "Bloody Tear" });
    expect(nav.back()).toBe(true);
    expect(nav.currentTarget()).toEqual({ section: "weapons", entityKey: "Whip" });
    expect(visited.at(-1)).toEqual({ section: "weapons", entityKey: "Whip" });
  });

  test("back unwinds all the way to the initial target, then reports empty", () => {
    const nav = new NavStack(() => {}, { section: "home" });
    nav.go({ section: "weapons" });
    expect(nav.back()).toBe(true);
    expect(nav.currentTarget()).toEqual({ section: "home" });
    expect(nav.back()).toBe(false);
  });
});
