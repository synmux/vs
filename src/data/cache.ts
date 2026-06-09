/**
 * Local on-disk cache for the normalized {@link Dataset}.
 *
 * Reads tolerate a missing/corrupt/incompatible file by returning `null` (the
 * caller then fetches fresh). Writes are atomic — written to a temp file and
 * renamed — so a crash mid-write can never leave a half-written cache. The
 * parent directory is created explicitly (we do not rely on Bun.write's
 * directory-creation behaviour).
 */
import { mkdir, rename } from "node:fs/promises";
import { dirname } from "node:path";
import { datasetPath } from "../util/paths.ts";
import type { Dataset } from "./schema.ts";
import { DATASET_VERSION } from "./schema.ts";

type Env = Record<string, string | undefined>;

const STALE_AFTER_DAYS = 14;
const MS_PER_DAY = 86_400_000;

export async function readDataset(
  env: Env = process.env
): Promise<Dataset | null> {
  const file = Bun.file(datasetPath(env));
  if (!(await file.exists())) {
    return null;
  }
  try {
    const data = (await file.json()) as Dataset;
    if (data?.meta?.version !== DATASET_VERSION) {
      return null;
    }
    return data;
  } catch {
    return null; // corrupt JSON → treat as no cache
  }
}

export async function writeDataset(
  dataset: Dataset,
  env: Env = process.env
): Promise<void> {
  const path = datasetPath(env);
  await mkdir(dirname(path), { recursive: true });
  const tempPath = `${path}.tmp`;
  await Bun.write(tempPath, JSON.stringify(dataset));
  await rename(tempPath, path);
}

export interface CacheStaleness {
  days: number;
  label: string;
  stale: boolean;
}

/** Describe how old a cache is, for the status bar and refresh hints. */
export function cacheStaleness(
  fetchedAt: string,
  now: Date = new Date()
): CacheStaleness {
  const days = Math.floor(
    (now.getTime() - new Date(fetchedAt).getTime()) / MS_PER_DAY
  );
  const stale = days > STALE_AFTER_DAYS;
  const label =
    days <= 0 ? "fetched today" : days === 1 ? "1 day old" : `${days} days old`;
  return { days, label, stale };
}
