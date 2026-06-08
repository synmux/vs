import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { main } from "../../src/cli/main.ts";
import { writeDataset } from "../../src/data/cache.ts";
import { loadFixtureDataset } from "../helpers/fixtures.ts";

let dir: string;
let logs: string[];
let errors: string[];
const originalLog = console.log;
const originalError = console.error;

beforeEach(async () => {
  dir = mkdtempSync(join(tmpdir(), "vs-cli-"));
  process.env.VS_DATA_DIR = dir;
  await writeDataset(await loadFixtureDataset(), { VS_DATA_DIR: dir });
  logs = [];
  errors = [];
  console.log = (...args: unknown[]) => logs.push(args.join(" "));
  console.error = (...args: unknown[]) => errors.push(args.join(" "));
});

afterEach(() => {
  console.log = originalLog;
  console.error = originalError;
  delete process.env.VS_DATA_DIR;
  rmSync(dir, { recursive: true, force: true });
  process.exitCode = 0;
});

describe("main (offline, via cached fixtures)", () => {
  test("evolve --json prints recipe JSON", async () => {
    await main(["bun", "vs", "evolve", "Bloody Tear", "--json"]);
    expect(JSON.parse(logs.join("\n")).weapon).toBe("Bloody Tear");
  });

  test("search prints matches", async () => {
    await main(["bun", "vs", "search", "bloody"]);
    expect(logs.join("\n")).toContain("Bloody Tear");
  });

  test("build --have lists achievable evolutions", async () => {
    await main(["bun", "vs", "build", "--have", "Whip, Hollow Heart"]);
    expect(logs.join("\n")).toContain("Bloody Tear");
  });

  test("a section command falls back to a stdout listing when piped (no TTY)", async () => {
    await main(["bun", "vs", "evolutions"]);
    expect(logs.join("\n")).toContain("Bloody Tear");
  });

  test("an unknown weapon prints a friendly error and sets a non-zero exit code", async () => {
    await main(["bun", "vs", "evolve", "zzzzzz"]);
    expect(errors.join("\n").toLowerCase()).toContain("no weapon");
    expect(process.exitCode).toBe(1);
  });
});
