import { LOCALES, LOCALE_META, type Locale } from "./i18n-config";

/**
 * Canonical site origin. Falls back to the production Vercel URL so that
 * builds in CI without `.env` still produce sensible absolute links.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://balna.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Balna";

/** Build an absolute URL from a path. Pass it any locale-aware path. */
export function absoluteUrl(path: string): string {
  if (!path.startsWith("/")) path = `/${path}`;
  return `${SITE_URL}${path}`;
}

/**
 * `<link rel="alternate" hreflang>` map for a given locale-prefixed path.
 * Handed straight to `Metadata.alternates.languages`.
 */
export function hreflangMap(localizedPath: (l: Locale) => string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const locale of LOCALES) {
    map[LOCALE_META[locale].htmlLang] = absoluteUrl(localizedPath(locale));
  }
  // x-default for unknown audiences — point to the source-of-truth English page.
  map["x-default"] = absoluteUrl(localizedPath("en"));
  return map;
}

/**
 * Renders an object as a `<script type="application/ld+json">` payload string.
 * `</` is escaped so the closing script tag inside a string literal can't
 * break out of the surrounding `<script>` element.
 */
export function jsonLdString(payload: object): string {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

/** Strict allow-list — lets non-Latin search query input pass to keywords too. */
export const BASE_KEYWORDS = [
  "thrift",
  "second-hand",
  "preloved",
  "branded clothing",
  "Morocco",
  "WhatsApp shop",
  "balna",
];
