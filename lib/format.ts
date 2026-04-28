/**
 * Tiny ICU-ish message formatter.
 *
 * Supports two patterns inside a translation string:
 *   1. Simple replacement:  "Hi {name}!"
 *   2. Binary plural:       "{count, plural, one {# item} other {# items}}"
 *
 * Plural categories are limited to `one` (n === 1) and `other`. That covers
 * English perfectly and is a sane informal fallback for Darija — the full
 * Arabic plural rules (zero/one/two/few/many/other) are overkill for the
 * one place we use it ("# items in stock").
 */
export type FormatValues = Record<string, string | number>;

export function format(template: string, values: FormatValues = {}): string {
  let out = template;

  out = out.replace(
    /\{(\w+),\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\}\}/g,
    (_, name: string, oneCase: string, otherCase: string) => {
      const raw = values[name];
      const n = typeof raw === "number" ? raw : Number(raw);
      const branch = n === 1 ? oneCase : otherCase;
      return branch.replace(/#/g, String(n));
    },
  );

  out = out.replace(/\{(\w+)\}/g, (_, name: string) => {
    const v = values[name];
    return v === undefined ? `{${name}}` : String(v);
  });

  return out;
}
