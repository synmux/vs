import { describe, expect, test } from "bun:test";
import { join } from "node:path";
import { dataDir, datasetPath } from "../../src/util/paths.ts";

describe("dataDir", () => {
  test("prefers VS_DATA_DIR when set", () => {
    expect(dataDir({ VS_DATA_DIR: "/tmp/custom", HOME: "/home/x" })).toBe(
      "/tmp/custom"
    );
  });

  test("falls back to XDG_DATA_HOME/vs-tui", () => {
    expect(dataDir({ XDG_DATA_HOME: "/home/x/.share", HOME: "/home/x" })).toBe(
      join("/home/x/.share", "vs-tui")
    );
  });

  test("defaults to ~/.local/share/vs-tui", () => {
    expect(dataDir({ HOME: "/home/x" })).toBe(
      join("/home/x", ".local", "share", "vs-tui")
    );
  });
});

describe("datasetPath", () => {
  test("is dataset.json within the data dir", () => {
    expect(datasetPath({ VS_DATA_DIR: "/tmp/custom" })).toBe(
      join("/tmp/custom", "dataset.json")
    );
  });
});
