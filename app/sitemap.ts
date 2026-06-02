import type { MetadataRoute } from "next";
import { LOCALES, LOCALE_META } from "@/lib/i18n-config";
import { absoluteUrl } from "@/lib/seo";

/**
 * Static sitemap — emits the catalog landing for every supported locale,
 * with hreflang alternates so search engines understand the relationship
 * between EN and Darija. The /quiz route is intentionally excluded; it's
 * marked `noindex` in its metadata since it's an interactive helper, not a
 * destination page.
 *
 * Per-product pages aren't yet a thing in the storefront (everything lives
 * on the catalog landing with query filters), so we only ship the canonical
 * paths here. Once a `/p/[slug]` route lands, append products to this list
 * with `lastModified: product._updatedAt`.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: Array<{ path: (l: string) => string; priority: number }> = [
    { path: (l) => `/${l}`, priority: 1.0 },
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
