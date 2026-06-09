/**
 * An explicit focus ring. OpenTUI auto-routes keys to the focused renderable but
 * does NOT move focus between widgets, so we own that: an ordered list of
 * focusable targets cycled by Tab / Shift-Tab. Targets only need focus()/blur(),
 * which keeps this unit testable without a renderer.
 */

export interface Focusable {
  blur(): void;
  focus(): void;
}

export class FocusRing {
  private targets: Focusable[] = [];
  private index = 0;

  setTargets(targets: Focusable[]): void {
    this.targets = targets;
    this.index = 0;
  }

  focusFirst(): void {
    this.focusIndex(0);
  }

  focusIndex(index: number): void {
    if (this.targets.length === 0) {
      return;
    }
    const next =
      ((index % this.targets.length) + this.targets.length) %
      this.targets.length;
    for (let position = 0; position < this.targets.length; position++) {
      if (position === next) {
        this.targets[position]?.focus();
      } else {
        this.targets[position]?.blur();
      }
    }
    this.index = next;
  }

  next(): void {
    this.focusIndex(this.index + 1);
  }

  previous(): void {
    this.focusIndex(this.index - 1);
  }

  current(): Focusable | undefined {
    return this.targets[this.index];
  }

  currentIndex(): number {
    return this.index;
  }
}
