import { describe, expect, test } from "bun:test";
import { createTestRenderer } from "@opentui/core/testing";
import type { CliRenderer } from "@opentui/core";
import { Repository } from "../../src/data/repository.ts";
import { createApp } from "../../src/tui/app.ts";
import { loadFixtureDataset } from "../helpers/fixtures.ts";

async function setup() {
  const repo = Repository.fromDataset(await loadFixtureDataset());
  const harness = await createTestRenderer({ width: 80, height: 24 });
  const app = createApp(harness.renderer as CliRenderer, repo, { onQuit: () => {} });
  await harness.flush();
  return { harness, app };
}

describe("TUI app shell", () => {
  test("renders the sidebar sections", async () => {
    const { harness } = await setup();
    const frame = harness.captureCharFrame();
    expect(frame).toContain("Home");
    expect(frame).toContain("Weapons");
    harness.renderer.destroy();
  });

  test("shows the Home view content initially", async () => {
    const { harness } = await setup();
    expect(harness.captureCharFrame()).toContain("Vampire Survivors");
    harness.renderer.destroy();
  });

  test("switching to the Weapons section lists weapons", async () => {
    const { harness, app } = await setup();
    app.goToSection("weapons");
    await harness.flush();
    expect(harness.captureCharFrame()).toContain("Whip");
    harness.renderer.destroy();
  });
});
