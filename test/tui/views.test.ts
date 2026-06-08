import { describe, expect, test } from "bun:test";
import { createTestRenderer } from "@opentui/core/testing";
import type { CliRenderer } from "@opentui/core";
import { Repository } from "../../src/data/repository.ts";
import { createApp } from "../../src/tui/app.ts";
import { loadFixtureDataset } from "../helpers/fixtures.ts";

async function setup() {
  const repo = Repository.fromDataset(await loadFixtureDataset());
  const harness = await createTestRenderer({ width: 90, height: 26 });
  const app = createApp(harness.renderer as CliRenderer, repo, { onQuit: () => {} });
  await harness.flush();
  return { harness, app };
}

describe("Evolutions view", () => {
  test("reveals a specific recipe with its bases and required passives", async () => {
    const { harness, app } = await setup();
    app.goToSection("evolutions", "Bloody Tear");
    await harness.flush();
    const frame = harness.captureCharFrame();
    expect(frame).toContain("Bloody Tear");
    expect(frame).toContain("Whip");
    expect(frame).toContain("Hollow Heart");
    harness.renderer.destroy();
  });

  test("a jump digit cross-links to the related entity", async () => {
    const { harness, app } = await setup();
    app.goToSection("evolutions", "Bloody Tear");
    await harness.flush();
    // Jump links: [1] Bloody Tear (weapon) · [2] Whip (base) · [3] Hollow Heart (passive)
    harness.mockInput.pressKey("2");
    await harness.flush();
    const frame = harness.captureCharFrame();
    expect(frame).toContain("Whip");
    expect(frame).toContain("Evolves into"); // the Whip weapon detail
    harness.renderer.destroy();
  });
});

describe("Command palette", () => {
  test("opens, fuzzy-filters, and jumps to the chosen result", async () => {
    const { harness, app } = await setup();
    app.openPalette();
    await harness.flush();
    expect(app.isPaletteOpen()).toBe(true);

    await harness.mockInput.typeText("bloody");
    await harness.flush();
    expect(harness.captureCharFrame()).toContain("Bloody Tear");

    harness.mockInput.pressEnter();
    await harness.flush();
    expect(app.isPaletteOpen()).toBe(false);
    expect(harness.captureCharFrame()).toContain("Bloody Tear");
    harness.renderer.destroy();
  });
});

describe("All sections render", () => {
  const sectionIds = ["home", "evolutions", "weapons", "passives", "characters", "stages", "arcanas", "bestiary"];
  for (const sectionId of sectionIds) {
    test(`${sectionId} mounts and renders content`, async () => {
      const { harness, app } = await setup();
      app.goToSection(sectionId);
      await harness.flush();
      expect(harness.captureCharFrame().trim().length).toBeGreaterThan(0);
      harness.renderer.destroy();
    });
  }
});
