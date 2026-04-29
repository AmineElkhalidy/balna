import type { MetadataRoute } from "next";
import { LOCALES, LOCALE_META } from "@/lib/i18n-config";
import { absoluteUrl } from "@/lib/seo";

/**
 * Static sitemap — emits the home + shop landing for every supported locale,
 * with hreflang alternates so search engines understand the relationship
 * between EN and Darija.
 *
 * Per-product pages aren't yet a thing in the storefront (everything lives
 * on /shop with query filters), so we only ship the canonical paths here.
 * Once a `/shop/[slug]` route lands, append products to this list with
 * `lastModified: product._updatedAt`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: Array<{ path: (l: string) => string; priority: number }> = [
    { path: (l) => `/${l}`, priority: 1.0 },
    { path: (l) => `/${l}/shop`, priority: 0.8 },
  ];

  return routes.flatMap(({ path, priority }) =>
    LOCALES.map((lang) => ({
      url: absoluteUrl(path(lang)),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [LOCALE_META[l].htmlLang, absoluteUrl(path(l))]),
        ),
      },
    })),
  );
}
