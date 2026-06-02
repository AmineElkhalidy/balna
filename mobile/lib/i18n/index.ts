/**
 * Mobile i18n — mirrors the web app's contract so dictionary keys carry
 * straight over. Two locales: English and Moroccan Arabic (Darija).
 *
 * Locale resolution order:
 *   1. User-selected (persisted in AsyncStorage)
 *   2. Device's primary language via expo-localization
 *   3. DEFAULT_LOCALE
 *
 * RTL: Arabic flips the entire layout via React Native's `I18nManager`. We
 * call `forceRTL` exactly once at app boot (root `_layout.tsx`); flipping
 * mid-session requires a JS reload, which we trigger via `Updates.reloadAsync`
 * from the LangSwitcher.
 */
import en from "@/dictionaries/en.json";
import ar from "@/dictionaries/ar.json";

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export type Dictionary = typeof en;

const DICTS: Record<Locale, Dictionary> = { en, ar: ar as Dictionary };

export function getDictionary(lang: Locale): Dictionary {
  return DICTS[lang] ?? DICTS[DEFAULT_LOCALE];
}

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "ar";
}

export const LOCALE_META: Record<
  Locale,
  { label: string; htmlLang: string; dir: "ltr" | "rtl" }
> = {
  en: { label: "EN", htmlLang: "en", dir: "ltr" },
  ar: { label: "AR", htmlLang: "ar-MA", dir: "rtl" },
};

/**
 * Lightweight `format(template, params)` — supports `{name}` interpolation
 * and a tiny ICU-ish plural form: `{count, plural, one {…} other {…}}`.
 *
 * Mirrors the web's lib/format.ts so dictionary strings render the same on
 * both platforms. Kept inline here (not imported) to avoid pulling in any
 * Node-specific helpers.
 */
export function format(
  template: string,
  params: Record<string, string | number> = {},
): string {
  return template.replace(
    /\{(\w+)(?:,\s*plural,\s*([^{}]+(?:\{[^}]*\}[^{}]*)+))?\}/g,
    (_match, key: string, pluralBody: string | undefined) => {
      const value = params[key];

      if (pluralBody !== undefined && typeof value === "number") {
        const cases = parsePluralCases(pluralBody);
        const branch = value === 1 ? cases.one ?? cases.other : cases.other;
        return (branch ?? "").replace(/#/g, String(value));
      }
      return value !== undefined ? String(value) : "";
    },
  );
}

function parsePluralCases(body: string): { one?: string; other?: string } {
  const cases: { one?: string; other?: string } = {};
  // Match `keyword {content}` pairs at the top level.
  const re = /(\w+)\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(body)) !== null) {
    const k = m[1];
    if (k === "one" || k === "other") cases[k] = m[2];
  }
  return cases;
}
