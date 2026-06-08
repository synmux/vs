/**
 * Schema-driven normalisation of raw Bucket rows.
 *
 * The Bucket API has three quirks that make raw rows hard to consume directly:
 *  1. Empty/default fields are OMITTED from the row object entirely (no null).
 *  2. Boolean-true serialises as an empty string `""`; false is just absent.
 *     → a field's truth must be decided by KEY PRESENCE, never by truthiness.
 *  3. Repeated fields are arrays, but a single value may arrive as a scalar.
 *
 * `normalizeRow` resolves all of this against a declared {@link FieldSpec}, so
 * the rest of the codebase only ever sees fully-populated, typed objects. It is
 * applied once, at cache-write time.
 */

export type FieldType = "string" | "string[]" | "bool" | "int" | "float";

/** Maps each output field name to the type it should be coerced into. */
export type FieldSpec = Record<string, FieldType>;

export function normalizeRow<T = Record<string, unknown>>(
  raw: Record<string, unknown>,
  spec: FieldSpec,
): T {
  const out: Record<string, unknown> = {};

  for (const [field, type] of Object.entries(spec)) {
    const present = Object.hasOwn(raw, field);
    const value = raw[field];

    switch (type) {
      case "string":
        out[field] = present && value != null ? String(value) : "";
        break;
      case "string[]":
        out[field] = !present || value == null
          ? []
          : Array.isArray(value)
            ? value.map((item) => String(item))
            : [String(value)];
        break;
      case "bool":
        out[field] = present;
        break;
      case "int": {
        const parsed = present ? Number(value) : 0;
        out[field] = Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
        break;
      }
      case "float": {
        const parsed = present ? Number(value) : 0;
        out[field] = Number.isFinite(parsed) ? parsed : 0;
        break;
      }
    }
  }

  return out as T;
}
