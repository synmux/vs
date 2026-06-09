/**
 * Resolves where the app stores its cached dataset, following the XDG Base
 * Directory spec with a `VS_DATA_DIR` override for tests and power users.
 *
 * The dataset is durable user data (re-fetchable, but not throwaway scratch),
 * so it lives in the *data* dir (`~/.local/share/vs-tui`), not the cache dir.
 * `env` is injectable purely so the resolution logic can be tested.
 */
import { homedir } from "node:os";
import { join } from "node:path";

type Env = Record<string, string | undefined>;

export function dataDir(env: Env = process.env): string {
  if (env.VS_DATA_DIR) {
    return env.VS_DATA_DIR;
  }
  if (env.XDG_DATA_HOME) {
    return join(env.XDG_DATA_HOME, "vs-tui");
  }
  return join(env.HOME ?? homedir(), ".local", "share", "vs-tui");
}

export function datasetPath(env: Env = process.env): string {
  return join(dataDir(env), "dataset.json");
}
