import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "../../components/Header";
import { ProductCard } from "../../components/ProductCard";
import {
  AUDIENCES,
  CATEGORIES,
  type Audience,
  type Category,
  type Product,
  type QuizFilter,
} from "@/lib/catalog";
import {
  DEFAULT_LOCALE,
  getDictionary,
  hasLocale,
  type Dictionary,
} from "@/lib/i18n";
import { format } from "@/lib/format";
import { getProducts, getSiteSettings } from "@/lib/sanity/products";
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  hreflangMap,
  jsonLdString,
} from "@/lib/seo";
import { LOCALE_META, type Locale } from "@/lib/i18n-config";

/**
 * Filtered catalog page — `/{lang}/shop?for=men&type=jackets&size=S,M`.
 *
 * The filter is parsed from `searchParams`, executed against Sanity (or the
 * local fixture if Sanity isn't configured), and the results are rendered
 * server-side. Site settings (WhatsApp number + bank details) are also fetched
 * here and threaded down so each product card knows where to send the buyer.
 */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const key = hasLocale(lang) ? lang : DEFAULT_LOCALE;
  const sp = await searchParams;
  const filter = parseFilter(sp);
  const dict = await getDictionary(key);

  const summary = buildSummary(filter, dict);
  const title = summary
    ? format(dict.shop.metadataTitle, { summary })
    : dict.shop.metadataTitleFallback;
  const description = summary
    ? format(dict.shop.metadataDescription, { summary })
    : dict.shop.metadataDescriptionFallback;

  // Filtered SERPs are not canonical destinations — search engines should
  // index the unfiltered shop and follow our internal links. We let the
  // robots crawl the *filtered* views (so the products inside are found),
  // but we set the canonical to /shop and add `noindex` only to filtered
  // permutations. That keeps PageRank flowing while preventing duplicates.
  const isFiltered = Object.keys(sp).length > 0;
  const canonicalPath = `/${key}/shop`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: hreflangMap((l) => `/${l}/shop`),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalPath,
      siteName: SITE_NAME,
      locale: LOCALE_META[key].htmlLang,
    },
    twitter: { card: "summary_large_image", title, description },
    robots: isFiltered
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const sp = await searchParams;
  const filter = parseFilter(sp);
  const [dict, results, settings] = await Promise.all([
    getDictionary(lang),
    getProducts(filter),
    getSiteSettings(),
  ]);

  const itemListLd = buildItemListLd(lang, results, dict);

  return (
    <>
      {results.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(itemListLd) }}
        />
      )}

      <Header
        lang={lang}
        dict={dict}
        action={
          <Link
            href={`/${lang}`}
            className="rounded-full border border-balna-line bg-white px-4 py-2 font-medium text-balna-ink hover:border-balna-teal hover:text-balna-teal-dark"
          >
            {dict.header.startOver}
          </Link>
        }
      />

      <FilterSummary filter={filter} count={results.length} dict={dict} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 sm:px-6">
        {results.length === 0 ? (
          <EmptyState lang={lang} dict={dict} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
            {results.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                lang={lang}
                dict={dict}
                settings={settings}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

/** Pretty, comma-joined description of the active filter (or "" if none). */
function buildSummary(filter: QuizFilter, dict: Dictionary): string {
  const parts: string[] = [];
  if (filter.audience) parts.push(dict.audience[filter.audience]);
  if (filter.category) parts.push(dict.category[filter.category]);
  if (filter.brands?.length) {
    parts.push(
      format(dict.shop.brandJoiner, { brands: filter.brands.join(", ") }),
    );
  }
  if (filter.sizes?.length) {
    parts.push(format(dict.shop.sizeJoiner, { sizes: filter.sizes.join(", ") }));
  }
  return parts.join(" · ");
}

/**
 * https://schema.org/ItemList — Google uses this to render carousel rich
 * results. Each entry is a fully-fledged Product with offers + brand so the
 * crawler can show price + availability inline.
 */
function buildItemListLd(
  lang: Locale,
  products: readonly Product[],
  dict: Dictionary,
) {
  const url = absoluteUrl(`/${lang}/shop`);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: dict.shop.eyebrow,
    url,
    numberOfItems: products.length,
    itemListElement: products.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "Product",
        "@id": `${SITE_URL}/#product-${p.id}`,
        name: p.title,
        sku: p.id,
        brand: { "@type": "Brand", name: p.brand },
        category: p.category,
        description: p.description,
        image: p.images?.map((i) => i.url) ?? [absoluteUrl("/logo.png")],
        offers: {
          "@type": "Offer",
          priceCurrency: "MAD",
          price: p.price,
          availability: p.isSoldOut
            ? "https://schema.org/SoldOut"
            : "https://schema.org/InStock",
          itemCondition: conditionToSchema(p.condition),
          url,
        },
      },
    })),
  };
}

function conditionToSchema(c: Product["condition"]): string {
  // schema.org only has 4 buckets — we map our friendly grades onto the
  // closest official enum value so search engines can render them.
  switch (c) {
    case "Like new":
      return "https://schema.org/NewCondition";
    case "Excellent":
    case "Very good":
      return "https://schema.org/UsedCondition";
    case "Good":
    default:
      return "https://schema.org/UsedCondition";
  }
}

/* ────────────────────────────────────────────────────────────────────────── */

function parseFilter(sp: {
  [k: string]: string | string[] | undefined;
}): QuizFilter {
  const audience = pick(sp.for, AUDIENCES) as Audience | undefined;
  const category = pick(sp.type, CATEGORIES) as Category | undefined;
  const sizes = splitList(sp.size);
  // Brand strings come from a curated quiz selection, but a tampered URL is
  // still safe — Sanity's GROQ params are pre-bound, so passing an unknown
  // brand simply matches no products.
  const brands = splitList(sp.brand);
  return { audience, category, brands, sizes };
}

function splitList(v: string | string[] | undefined): string[] {
  const raw = typeof v === "string" ? v : "";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function pick<T extends string>(
  v: string | string[] | undefined,
  allowed: readonly T[],
): T | undefined {
  const value = Array.isArray(v) ? v[0] : v;
  if (!value) return undefined;
  return (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}

function FilterSummary({
  filter,
  count,
  dict,
}: {
  filter: QuizFilter;
  count: number;
  dict: Dictionary;
}) {
  const parts: string[] = [];
  if (filter.audience) parts.push(dict.audience[filter.audience]);
  if (filter.category) parts.push(dict.category[filter.category]);
  if (filter.brands && filter.brands.length) {
    parts.push(
      format(dict.shop.brandJoiner, { brands: filter.brands.join(", ") }),
    );
  }
  if (filter.sizes && filter.sizes.length) {
    parts.push(format(dict.shop.sizeJoiner, { sizes: filter.sizes.join(", ") }));
  }
  const summary = parts.length > 0 ? parts.join(" · ") : dict.shop.everything;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-4 pt-6 sm:px-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-balna-teal-dark">
            {dict.shop.eyebrow}
          </p>
          <h1 className="mt-1 font-balna-display text-2xl font-extrabold tracking-tight text-balna-ink sm:text-3xl">
            {summary}
          </h1>
        </div>
        <p className="text-sm text-balna-muted">
          {format(dict.shop.itemCount, { count })}
        </p>
      </div>
    </section>
  );
}

function EmptyState({ lang, dict }: { lang: string; dict: Dictionary }) {
  return (
    <div className="mx-auto mt-10 max-w-md rounded-3xl border-2 border-dashed border-balna-line bg-white p-8 text-center">
      <span aria-hidden className="text-5xl">
        🧺
      </span>
      <h2 className="mt-4 text-xl font-bold text-balna-ink">
        {dict.shop.empty.title}
      </h2>
      <p className="mt-2 text-balna-muted">{dict.shop.empty.body}</p>
      <Link
        href={`/${lang}`}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-balna-navy px-6 font-semibold text-white hover:bg-balna-navy-dark"
      >
        {dict.shop.empty.cta}
      </Link>
    </div>
  );
}
