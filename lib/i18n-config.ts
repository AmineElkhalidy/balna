/**
 * Locale constants safe to import from both Server and Client Components.
 * Keep this file free of `import "server-only"` and free of dictionary
 * `import()`s — those live in `./i18n.ts`.
 */

export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export type Direction = "ltr" | "rtl";

export const LOCALE_META: Record<
  Locale,
  { htmlLang: string; dir: Direction; nativeLabel: string; shortLabel: string }
> = {
  en: { htmlLang: "en", dir: "ltr", nativeLabel: "English", shortLabel: "EN" },
  ar: {
    htmlLang: "ar-MA",
    dir: "rtl",
    nativeLabel: "الدارجة",
    shortLabel: "AR",
  },
};

export function hasLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function getDirection(locale: Locale): Direction {
  return LOCALE_META[locale].dir;
}
