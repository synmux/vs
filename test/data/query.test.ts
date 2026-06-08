import { describe, expect, test } from "bun:test";
import { BucketQuery } from "../../src/data/bucket/query.ts";

describe("BucketQuery.toLua", () => {
  test("builds a whole-table select with a default limit of 5000", () => {
    expect(BucketQuery.table("infobox_weapon").select("page_name", "name").toLua()).toBe(
      "bucket('infobox_weapon').select('page_name','name').limit(5000).run()",
    );
  });

  test("includes a where clause", () => {
    expect(
      BucketQuery.table("passive_evolutions").select("evolution").where("evolution", "Bloody Tear").toLua(),
    ).toBe("bucket('passive_evolutions').select('evolution').where('evolution','Bloody Tear').limit(5000).run()");
  });

  test("chains multiple where clauses in order (AND)", () => {
    expect(BucketQuery.table("t").select("a").where("x", "1").where("y", "2").toLua()).toBe(
      "bucket('t').select('a').where('x','1').where('y','2').limit(5000).run()",
    );
  });

  test("supports orderBy, a custom limit, and an offset", () => {
    expect(BucketQuery.table("t").select("a").orderBy("a", "asc").limit(100).offset(200).toLua()).toBe(
      "bucket('t').select('a').orderBy('a','asc').limit(100).offset(200).run()",
    );
  });

  test("omits the offset clause when it is zero", () => {
    expect(BucketQuery.table("t").select("a").offset(0).toLua()).toBe(
      "bucket('t').select('a').limit(5000).run()",
    );
  });

  test("clamps the limit to the 5000 maximum", () => {
    expect(BucketQuery.table("t").select("a").limit(99999).toLua()).toBe(
      "bucket('t').select('a').limit(5000).run()",
    );
  });

  test("escapes single quotes inside string values", () => {
    expect(BucketQuery.table("t").select("name").where("name", "Vampire's Tear").toLua()).toBe(
      "bucket('t').select('name').where('name','Vampire\\'s Tear').limit(5000).run()",
    );
  });

  test("does not mutate the original query when chaining (immutability)", () => {
    const base = BucketQuery.table("t").select("a");
    base.where("x", "1");
    expect(base.toLua()).toBe("bucket('t').select('a').limit(5000).run()");
  });
});
