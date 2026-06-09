import { describe, expect, test } from "bun:test";
import type { Focusable } from "../../src/tui/focus.ts";
import { FocusRing } from "../../src/tui/focus.ts";

function fakeFocusable(): Focusable & {
  focusCount: number;
  blurCount: number;
} {
  return {
    focusCount: 0,
    blurCount: 0,
    focus() {
      this.focusCount++;
    },
    blur() {
      this.blurCount++;
    },
  };
}

describe("FocusRing", () => {
  test("focusFirst focuses the first target", () => {
    const a = fakeFocusable();
    const b = fakeFocusable();
    const ring = new FocusRing();
    ring.setTargets([a, b]);
    ring.focusFirst();
    expect(a.focusCount).toBe(1);
    expect(ring.current()).toBe(a);
  });

  test("next blurs the current and focuses the following target", () => {
    const a = fakeFocusable();
    const b = fakeFocusable();
    const ring = new FocusRing();
    ring.setTargets([a, b]);
    ring.focusFirst();
    ring.next();
    expect(a.blurCount).toBe(1);
    expect(b.focusCount).toBe(1);
    expect(ring.current()).toBe(b);
  });

  test("next wraps around from the last target to the first", () => {
    const a = fakeFocusable();
    const b = fakeFocusable();
    const ring = new FocusRing();
    ring.setTargets([a, b]);
    ring.focusFirst();
    ring.next();
    ring.next();
    expect(ring.current()).toBe(a);
  });

  test("previous wraps around from the first target to the last", () => {
    const a = fakeFocusable();
    const b = fakeFocusable();
    const ring = new FocusRing();
    ring.setTargets([a, b]);
    ring.focusFirst();
    ring.previous();
    expect(ring.current()).toBe(b);
  });

  test("setTargets resets focus position", () => {
    const a = fakeFocusable();
    const b = fakeFocusable();
    const ring = new FocusRing();
    ring.setTargets([a]);
    ring.focusFirst();
    ring.setTargets([a, b]);
    expect(ring.currentIndex()).toBe(0);
  });
});
