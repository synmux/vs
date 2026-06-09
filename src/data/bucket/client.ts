/**
 * HTTP client for the wiki's `action=bucket` endpoint.
 *
 * `parseBucketResponse` is split out as a pure function so the response-shape
 * handling (error strings, missing `bucket`, non-array payloads) is unit-tested
 * without any network. `fetchBucket` takes an injectable `fetchImpl` so the
 * request construction can be tested without hitting the wiki.
 */
import { APP_VERSION } from "../../version.ts";
import type { BucketQuery } from "./query.ts";

const API_BASE = "https://vampire.survivors.wiki/api.php"; // NOT /w/api.php (301 redirect)
export const USER_AGENT = `vs-tui/${APP_VERSION} (https://github.com/syn; syn@syn.as)`;
const DEFAULT_TIMEOUT_MS = 15_000;

export type BucketRow = Record<string, unknown>;

export class BucketError extends Error {
  readonly query: string | undefined;
  constructor(message: string, query?: string) {
    super(message);
    this.name = "BucketError";
    this.query = query;
  }
}

/** Validate and extract the rows from a raw Bucket API response body. */
export function parseBucketResponse(
  json: unknown,
  query?: string
): BucketRow[] {
  if (typeof json !== "object" || json === null) {
    throw new BucketError("Bucket response was not a JSON object", query);
  }
  const body = json as { bucket?: unknown; error?: unknown };
  if (typeof body.error === "string" && body.error.length > 0) {
    throw new BucketError(body.error, query);
  }
  if (body.bucket === undefined) {
    return [];
  }
  if (!Array.isArray(body.bucket)) {
    throw new BucketError(
      "Bucket response 'bucket' field was not an array",
      query
    );
  }
  return body.bucket as BucketRow[];
}

export interface FetchBucketOptions {
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export async function fetchBucket(
  query: BucketQuery,
  options: FetchBucketOptions = {}
): Promise<BucketRow[]> {
  const { fetchImpl = fetch, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;
  const lua = query.toLua();
  const url = `${API_BASE}?action=bucket&format=json&query=${encodeURIComponent(lua)}`;

  const response = await fetchImpl(url, {
    headers: { "User-Agent": USER_AGENT },
    signal: signal ?? AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new BucketError(`HTTP ${response.status} from Bucket API`, lua);
  }
  return parseBucketResponse(await response.json(), lua);
}
