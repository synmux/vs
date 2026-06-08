import { describe, expect, test } from "bun:test";
import { cleanWikiText, truncate } from "../../src/util/strings.ts";

describe("cleanWikiText", () => {
  test("strips simple wiki links, keeping the target text", () => {
    expect(cleanWikiText("Complete the [[World of Light and Dark]] Adventure.")).toBe(
      "Complete the World of Light and Dark Adventure.",
    );
  });

  test("strips piped wiki links, keeping the label", () => {
    expect(cleanWikiText("[[Whip|the whip]] hurts")).toBe("the whip hurts");
  });

  test("converts <br> variants to a single space", () => {
    expect(cleanWikiText("Normal<br/>Evolution")).toBe("Normal Evolution");
    expect(cleanWikiText("a<br>b<br />c")).toBe("a b c");
  });

  test("strips other HTML tags", () => {
    expect(cleanWikiText("<b>Bold</b> text")).toBe("Bold text");
  });

  test("decodes common HTML entities", () => {
    expect(cleanWikiText("Salt &amp; Pepper")).toBe("Salt & Pepper");
  });

  test("collapses whitespace runs and trims", () => {
    expect(cleanWikiText("  a   b \n c ")).toBe("a b c");
  });

  test("returns an empty string unchanged", () => {
    expect(cleanWikiText("")).toBe("");
  });
});

describe("truncate", () => {
  test("returns the string unchanged when within the limit", () => {
    expect(truncate("abc", 5)).toBe("abc");
    expect(truncate("abcde", 5)).toBe("abcde");
  });

  test("truncates with an ellipsis when over the limit", () => {
    expect(truncate("abcdef", 5)).toBe("abcd…");
  });

  test("handles a limit of 1", () => {
    expect(truncate("abcdef", 1)).toBe("…");
  });
});
