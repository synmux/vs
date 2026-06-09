import { describe, expect, test } from "bun:test";
import {
  BucketError,
  fetchBucket,
  parseBucketResponse,
} from "../../src/data/bucket/client.ts";
import { BucketQuery } from "../../src/data/bucket/query.ts";

describe("parseBucketResponse", () => {
  test("returns the bucket rows array", () => {
    expect(parseBucketResponse({ bucket: [{ a: 1 }, { a: 2 }] })).toEqual([
      { a: 1 },
      { a: 2 },
    ]);
  });

  test("returns an empty array when bucket is missing", () => {
    expect(parseBucketResponse({ bucketQuery: "x" })).toEqual([]);
  });

  test("throws BucketError when the response carries an error string", () => {
    expect(() => parseBucketResponse({ error: "Query timed out" })).toThrow(
      BucketError
    );
  });

  test("throws when the payload is not an object", () => {
    expect(() => parseBucketResponse("nope")).toThrow(BucketError);
  });
});

describe("fetchBucket", () => {
  test("calls the bucket endpoint with the encoded query and a User-Agent, returning rows", async () => {
    const query = BucketQuery.table("infobox_weapon").select("page_name");
    let calledUrl = "";
    let calledHeaders: Record<string, string> = {};
    const fakeFetch = (async (url: string | URL, init?: RequestInit) => {
      calledUrl = String(url);
      calledHeaders = (init?.headers ?? {}) as Record<string, string>;
      return new Response(JSON.stringify({ bucket: [{ page_name: "Whip" }] }), {
        status: 200,
      });
    }) as unknown as typeof fetch;

    const rows = await fetchBucket(query, { fetchImpl: fakeFetch });

    expect(rows).toEqual([{ page_name: "Whip" }]);
    expect(calledUrl).toContain("action=bucket");
    expect(calledUrl).toContain(encodeURIComponent("bucket('infobox_weapon')"));
    expect(calledHeaders["User-Agent"]).toContain("vs-tui");
  });

  test("throws BucketError on a non-OK HTTP status", () => {
    const query = BucketQuery.table("t").select("a");
    const fakeFetch = (async () =>
      new Response("oops", { status: 500 })) as unknown as typeof fetch;
    expect(fetchBucket(query, { fetchImpl: fakeFetch })).rejects.toThrow(
      BucketError
    );
  });
});
