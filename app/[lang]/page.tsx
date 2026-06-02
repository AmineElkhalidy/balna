import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "../components/Header";
import { CategoryFilter } from "../components/CategoryFilter";
import { ProductCard } from "../components/ProductCard";
import { SocialLinks } from "../components/SocialLinks";
import { SortDropdown } from "../components/SortDropdown";
import {
  AUDIENCES,
  CATEGORIES,
  SORT_KEYS,
  type Audience,
  type Category,
  type Product,
  type QuizFilter,
  type SortKey,
} from "@/lib/catalog";
import {
  DEFAULT_LOCALE,
  getDictionary,
  hasLocale,
  type Dictionary,
} from "@/lib/i18n";
import { format } from "@/lib/format";
import {
  getProducts,
  getSiteSettings,
  type SiteSettings,
} from "@/lib/sanity/products";
import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  hreflangMap,
  jsonLdString,
} from "@/lib/seo";
import { LOCALE_META, type Locale } from "@/lib/i18n-config";

/**
 * Catalog landing — `/{lang}`.
 *
 * The store is the home page. Visitors land directly on the product grid;
 * the header doubles as primary navigation (audience tabs + Quick-find link
 * to the optional /quiz wizard) and a sticky filter row carries category +
 * sort. All filter state lives in `searchParams` so URLs are shareable and
 * back/forward navigation preserves the shopper's view.
 *
 * Server-side rendering is the rule: products, dictionary, and site settings
 * are fetched in parallel and the grid is fully streamed before any JS runs.
 * The handful of client components (audience tabs, category chips, sort
 * dropdown) only handle URL mutation.
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

  const audienceLabel = filter.audience ? dict.audience[filter.audience] : null;
  const categoryLabel = filter.category ? dict.category[filter.category] : null;
  let title: string;
  let summary: string;
  if (audienceLabel && categoryLabel) {
    title = format(dict.home.metadataTitleCombo, {
      audience: audienceLabel,
      category: categoryLabel,
    });
    summary = title;
  } else if (audienceLabel) {
    title = format(dict.home.metadataTitleAudience, {
      audience: audienceLabel,
    });
    summary = audienceLabel;
  } else if (categoryLabel) {
    title = format(dict.home.metadataTitleCategory, {
      category: categoryLabel,
    });
    summary = categoryLabel;
  } else {
    title = SITE_NAME;
    summary = "";
  }
  const description = summary
    ? format(dict.home.metadataDescription, { summary })
    : dict.home.metadataDescriptionFallback;

  // Filtered permutations are not canonical — the unfiltered catalog is.
  // We let robots follow internal links so the products inside are still
  // discovered, but we noindex the filtered URLs to avoid SERP duplicates.
  const isFiltered = Object.keys(sp).length > 0;
  const canonicalPath = `/${key}`;

  return {
    title: isFiltered ? `${title} · ${SITE_NAME}` : undefined,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: hreflangMap((l) => `/${l}`),
    },
    openGraph: {
      type: "website",
      title: isFiltered ? title : undefined,
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

export default async function CatalogPage({
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
  const [dict, products, settings] = await Promise.all([
    getDictionary(lang),
    getProducts(filter),
    getSiteSettings(),
  ]);

  const phone = settings?.whatsappNumber ?? process.env.NEXT_PUBLIC_MINOR_WHATSAPP;
  const orgLd = buildOrganizationLd(lang, dict, phone);
  const siteLd = buildWebsiteLd(lang, dict);
  const itemListLd =
    products.length > 0 ? buildItemListLd(lang, products) : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(orgLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(siteLd) }}
      />
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdString(itemListLd) }}
        />
      )}

      <Header lang={lang} dict={dict} variant="catalog" />

      <Suspense fallback={<FilterBarFallback />}>
        <FilterBar dict={dict} count={products.length} />
      </Suspense>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6">
        {products.length === 0 ? (
          <EmptyState
            dict={dict}
            settings={settings}
            isFiltered={isFiltered(filter)}
            lang={lang}
          />
        ) : (
          <ProductGrid
            products={products}
            lang={lang}
            dict={dict}
            settings={settings}
          />
        )}
      </main>

      <FooterNote dict={dict} />
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sections                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

function FilterBar({
  dict,
  count,
}: {
  dict: Dictionary;
  count: number;
}) {
  return (
    <section
      aria-label={dict.home.sortBy}
      className="sticky top-16 z-20 border-b border-balna-line/70 bg-balna-cream/90 backdrop-blur sm:top-16"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-balna-ink">
            {format(dict.home.stockCount, { count })}
          </p>
          <SortDropdown dict={dict} />
        </div>
        <CategoryFilter dict={dict} />
      </div>
    </section>
  );
}

function FilterBarFallback() {
  return (
    <div className="sticky top-16 z-20 border-b border-balna-line/70 bg-balna-cream/90 backdrop-blur">
      <div className="mx-auto flex h-24 w-full max-w-6xl items-center px-4 sm:px-6">
        <span
          aria-hidden
          className="inline-block h-10 w-full rounded-full bg-balna-line/40"
        />
      </div>
    </div>
  );
}

function ProductGrid({
  products,
  lang,
  dict,
  settings,
}: {
  products: Product[];
  lang: Locale;
  dict: Dictionary;
  settings: SiteSettings;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          lang={lang}
          dict={dict}
          settings={settings}
        />
      ))}
    </div>
  );
}

function EmptyState({
  dict,
  settings,
  isFiltered,
  lang,
}: {
  dict: Dictionary;
  settings: SiteSettings;
  isFiltered: boolean;
  lang: Locale;
}) {
  const phone = settings?.whatsappNumber;
  const waHref = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : null;
  const e = dict.home.emptyState;

  return (
    <section
      className="mx-auto mt-8 max-w-xl rounded-3xl border-2 border-dashed border-balna-line bg-white p-8 text-center sm:p-10"
    >
      <span aria-hidden className="text-5xl sm:text-6xl">
        {isFiltered ? "🪧" : "🧵"}
      </span>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-balna-teal-dark">
        {e.eyebrow}
      </p>
      <h2 className="mt-2 font-balna-display text-2xl font-extrabold text-balna-ink sm:text-3xl">
        {isFiltered ? e.titleFiltered : e.titleAll}
      </h2>
      <p className="mt-3 text-balna-muted">
        {isFiltered ? e.bodyFiltered : e.bodyAll}
      </p>

      <div className="mt-6 flex flex-col items-center gap-4">
        {isFiltered ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/${lang}`}
              className="inline-flex h-12 items-center justify-center rounded-full border border-balna-line bg-white px-6 text-sm font-semibold text-balna-ink transition hover:border-balna-teal hover:text-balna-teal-dark"
            >
              {e.clearAll}
            </Link>
            <Link
              href={`/${lang}/quiz`}
              className="inline-flex h-12 items-center justify-center rounded-full bg-balna-navy px-6 text-sm font-semibold text-white transition hover:bg-balna-navy-dark active:scale-[0.99]"
            >
              {e.tryQuiz}
            </Link>
          </div>
        ) : (
          waHref && (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-balna-whatsapp px-6 text-sm font-semibold text-white transition hover:bg-balna-whatsapp-dark active:scale-[0.99]"
            >
              <WhatsAppIcon className="h-4 w-4" />
              {e.whatsappCta}
            </a>
          )
        )}
        {!isFiltered && <SocialLinks dict={dict} variant="footer" />}
      </div>
    </section>
  );
}

function FooterNote({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-auto border-t border-balna-line bg-balna-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-5 py-6 text-center text-sm text-balna-muted sm:px-6">
        <SocialLinks dict={dict} variant="footer" />
        <p>{dict.footer.tagline}</p>
        <p className="text-xs">
          {dict.footer.developedBy}{" "}
          <a
            href="https://amineelkhalidy.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-balna-ink underline-offset-2 hover:text-balna-teal-dark hover:underline"
          >
            Amine Elkhalidy
          </a>
        </p>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Filter parsing + JSON-LD                                                  */
/* ────────────────────────────────────────────────────────────────────────── */

function parseFilter(sp: {
  [k: string]: string | string[] | undefined;
}): QuizFilter {
  const audience = pick(sp.for, AUDIENCES) as Audience | undefined;
  const category = pick(sp.type, CATEGORIES) as Category | undefined;
  const sort = pick(sp.sort, SORT_KEYS) as SortKey | undefined;
  const sizes = splitList(sp.size);
  // Brand strings are validated downstream — passing an unknown brand simply
  // matches no products thanks to GROQ's parameterised `in` operator.
  const brands = splitList(sp.brand);
  return { audience, category, brands, sizes, sort };
}

function isFiltered(filter: QuizFilter): boolean {
  return Boolean(
    filter.audience ||
      filter.category ||
      (filter.brands && filter.brands.length > 0) ||
      (filter.sizes && filter.sizes.length > 0),
  );
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

function buildOrganizationLd(
  lang: Locale,
  dict: Dictionary,
  phone: string | undefined,
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/logo.png"),
    description: dict.footer.tagline,
    inLanguage: LOCALE_META[lang].htmlLang,
    ...(phone
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              contactType: "customer service",
              telephone: `+${phone.replace(/\D/g, "")}`,
              availableLanguage: ["en", "ar"],
              areaServed: "MA",
            },
          ],
        }
      : {}),
  };
}

function buildWebsiteLd(lang: Locale, dict: Dictionary) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: absoluteUrl(`/${lang}`),
    description: dict.footer.tagline,
    inLanguage: LOCALE_META[lang].htmlLang,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}

function buildItemListLd(lang: Locale, products: readonly Product[]) {
  const url = absoluteUrl(`/${lang}`);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: SITE_NAME,
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
          itemCondition: "https://schema.org/NewCondition",
          url,
        },
      },
    })),
  };
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.11 4.91A10 10 0 0 0 4.05 18.27L3 22l3.83-1A10 10 0 1 0 19.1 4.92ZM12 20.13a8.13 8.13 0 0 1-4.13-1.13l-.3-.18-2.27.6.61-2.21-.2-.32A8.13 8.13 0 1 1 12 20.13Zm4.45-6.07c-.24-.12-1.44-.71-1.66-.79s-.39-.12-.55.12-.63.79-.78.95-.29.18-.53.06a6.66 6.66 0 0 1-3.34-2.93c-.25-.43.25-.4.72-1.34a.45.45 0 0 0 0-.43c-.06-.12-.55-1.32-.75-1.81s-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.3 2.74 2.74 0 0 0-.86 2.05 4.78 4.78 0 0 0 1 2.55 11 11 0 0 0 4.21 3.71c.59.26 1 .41 1.4.53a3.41 3.41 0 0 0 1.55.1 2.54 2.54 0 0 0 1.66-1.18 2.06 2.06 0 0 0 .14-1.18c-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}
