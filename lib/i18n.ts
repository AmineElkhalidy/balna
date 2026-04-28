import "server-only";
import type { Locale } from "./i18n-config";
import type EnDictionary from "@/dictionaries/en.json";

export * from "./i18n-config";

/**
 * The English dictionary is the source of truth for the shape; every other
 * language is structurally typed against it. `import type` keeps this purely
 * compile-time so we don't ship the dictionary twice.
 */
export type Dictionary = typeof EnDictionary;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () =>
    import("@/dictionaries/en.json").then((m) => m.default as Dictionary),
  ar: () =>
    import("@/dictionaries/ar.json").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
