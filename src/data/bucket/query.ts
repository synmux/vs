/**
 * Immutable builder for the Bucket extension's Lua-style query string.
 *
 * The wiki's `action=bucket` endpoint takes a `query` parameter containing a
 * dot-notation method chain, e.g.
 *   bucket('infobox_weapon').select('page_name','name').limit(5000).run()
 * We only compose that string here — we never execute Lua.
 *
 * Only the `=` operator is supported in `where()` (the only one our queries
 * need); whole-table fetches use no `where` at all. Every chaining method
 * returns a new instance so a partially-built query can be safely reused.
 */

const MAX_LIMIT = 5000;

interface WhereClause {
  field: string;
  value: string | number;
}

interface OrderClause {
  field: string;
  direction: "asc" | "desc";
}

function quote(value: string): string {
  return `'${value.replace(/'/g, "\\'")}'`;
}

export class BucketQuery {
  private constructor(
    private readonly tableName: string,
    private readonly fields: readonly string[],
    private readonly wheres: readonly WhereClause[],
    private readonly order: OrderClause | undefined,
    private readonly limitValue: number,
    private readonly offsetValue: number,
  ) {}

  static table(name: string): BucketQuery {
    return new BucketQuery(name, [], [], undefined, MAX_LIMIT, 0);
  }

  select(...fields: string[]): BucketQuery {
    return new BucketQuery(this.tableName, [...this.fields, ...fields], this.wheres, this.order, this.limitValue, this.offsetValue);
  }

  where(field: string, value: string | number): BucketQuery {
    return new BucketQuery(this.tableName, this.fields, [...this.wheres, { field, value }], this.order, this.limitValue, this.offsetValue);
  }

  orderBy(field: string, direction: "asc" | "desc" = "asc"): BucketQuery {
    return new BucketQuery(this.tableName, this.fields, this.wheres, { field, direction }, this.limitValue, this.offsetValue);
  }

  limit(count: number): BucketQuery {
    return new BucketQuery(this.tableName, this.fields, this.wheres, this.order, Math.min(count, MAX_LIMIT), this.offsetValue);
  }

  offset(count: number): BucketQuery {
    return new BucketQuery(this.tableName, this.fields, this.wheres, this.order, this.limitValue, count);
  }

  toLua(): string {
    const parts: string[] = [`bucket(${quote(this.tableName)})`, `.select(${this.fields.map(quote).join(",")})`];
    for (const clause of this.wheres) {
      const renderedValue = typeof clause.value === "number" ? String(clause.value) : quote(clause.value);
      parts.push(`.where(${quote(clause.field)},${renderedValue})`);
    }
    if (this.order) parts.push(`.orderBy(${quote(this.order.field)},${quote(this.order.direction)})`);
    parts.push(`.limit(${this.limitValue})`);
    if (this.offsetValue > 0) parts.push(`.offset(${this.offsetValue})`);
    parts.push(".run()");
    return parts.join("");
  }
}
