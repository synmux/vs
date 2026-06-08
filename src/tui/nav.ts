/**
 * Navigation history for cross-linking. `go` records where we were and moves to
 * a new section/entity; `back` returns. The actual rendering is delegated to a
 * `navigate` callback, so this is testable without a renderer.
 */

export interface NavTarget {
  section: string;
  entityKey?: string;
}

export class NavStack {
  private readonly history: NavTarget[] = [];
  private current: NavTarget;

  constructor(
    private readonly navigate: (target: NavTarget) => void,
    initial: NavTarget,
  ) {
    this.current = initial;
  }

  go(target: NavTarget): void {
    this.history.push(this.current);
    this.current = target;
    this.navigate(target);
  }

  back(): boolean {
    const previous = this.history.pop();
    if (previous === undefined) return false;
    this.current = previous;
    this.navigate(previous);
    return true;
  }

  currentTarget(): NavTarget {
    return this.current;
  }
}
