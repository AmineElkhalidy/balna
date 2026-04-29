import "server-only";
import { isSanityConfigured } from "@/sanity/env";
import { getSanityClient } from "./client";
import {
  brandIndexQuery,
  productsQuery,
  siteSettingsQuery,
} from "./queries";
import type { SanityProduct, SanitySiteSettings } from "./types";
import {
  AUDIENCES,
  BRAND_META,
  CATEGORIES,
  PRODUCTS as LOCAL_PRODUCTS,
  type Audience,
  type Category,
  type Product,
  type QuizFilter,
} from "@/lib/catalog";
import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

/**
 * Bridge between Sanity and the rest of the app.
 *
 * Every public function gracefully falls back to the local in-memory catalog
 * when `NEXT_PUBLIC_SANITY_PROJECT_ID` is unset. That means:
 *
 *   • Devs cloning the repo can run `npm run dev` straight away.
 *   • Tests don't need a live Sanity project.
 *   • Once env vars are filled in, Sanity becomes the source of truth and the
 *     local fixture is effectively retired.
 *
 * The conversion functions normalise Sanity documents into the existing
 * `Product` / `BankTransfer` shapes so call-sites don't need to know whether
 * the data is local or remote.
 */

export interface BankTransfer {
  bankName: string;
  accountHolder: string;
  iban: string;
  swift: string;
  instructions: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  bankTransfer: BankTransfer | null;
}

export type BrandIndex = Record<string, string[]>;

/* ──────────────────────────────────────────────────────────────────────── */
/*  Public API                                                              */
/* ──────────────────────────────────────────────────────────────────────── */

export async function getProducts(filter: QuizFilter): Promise<Product[]> {
  if (!isSanityConfigured) {
    return localFilter(filter);
  }
  const params = {
    audiences: filter.audience ? [filter.audience] : [],
    categories: filter.category ? [filter.category] : [],
    brands: filter.brands && filter.brands.length > 0 ? [...filter.brands] : [],
    sizes: filter.sizes && filter.sizes.length > 0 ? [...filter.sizes] : [],
  };
  const docs = await getSanityClient().fetch<SanityProduct[]>(
    productsQuery,
    params,
    { next: { revalidate: 60, tags: ["product"] } },
  );
  return docs.map(toProduct);
}

/**
 * Pre-computes a `"audience:category" → brand[]` lookup once per page render.
 * The Quiz uses this table to render Step 3 without any client-side data
 * fetching — every (audience, category) decision instantly knows its brands.
 */
export async function getBrandIndex(): Promise<BrandIndex> {
  const out: BrandIndex = {};
  for (const a of AUDIENCES) {
    for (const c of CATEGORIES) {
      out[`${a}:${c}`] = [];
    }
  }

  if (!isSanityConfigured) {
    for (const p of LOCAL_PRODUCTS) {
      const key = `${p.audience}:${p.category}`;
      const list = out[key];
      if (list && !list.includes(p.brand)) list.push(p.brand);
    }
  } else {
    const rows = await getSanityClient().fetch<
      Array<{ audience: Audience; category: Category; brand: string }>
    >(brandIndexQuery, {}, { next: { revalidate: 60, tags: ["product"] } });
    for (const row of rows) {
      const key = `${row.audience}:${row.category}`;
      const list = out[key];
      if (list && row.brand && !list.includes(row.brand)) list.push(row.brand);
    }
  }

  for (const key of Object.keys(out)) {
    out[key]!.sort((a, b) => a.localeCompare(b));
  }
  return out;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const fallback: SiteSettings = {
    whatsappNumber: WHATSAPP_NUMBER,
    bankTransfer: null,
  };

  if (!isSanityConfigured) return fallback;

  const doc = await getSanityClient().fetch<SanitySiteSettings | null>(
    siteSettingsQuery,
    {},
    { next: { revalidate: 300, tags: ["siteSettings"] } },
  );
  if (!doc) return fallback;

  return {
    whatsappNumber: (doc.whatsappNumber || "").replace(/\D/g, "") || fallback.whatsappNumber,
    bankTransfer: doc.bankTransfer
      ? {
          bankName: doc.bankTransfer.bankName ?? "",
          accountHolder: doc.bankTransfer.accountHolder ?? "",
          iban: doc.bankTransfer.iban ?? "",
          swift: doc.bankTransfer.swift ?? "",
          instructions: doc.bankTransfer.instructions ?? "",
        }
      : null,
  };
}

/* ──────────────────────────────────────────────────────────────────────── */
/*  Internals                                                               */
/* ──────────────────────────────────────────────────────────────────────── */

function localFilter(filter: QuizFilter): Product[] {
  const wantedSizes =
    filter.sizes && filter.sizes.length > 0 ? filter.sizes : null;
  const wantedBrands =
    filter.brands && filter.brands.length > 0 ? new Set(filter.brands) : null;

  return LOCAL_PRODUCTS.filter((p) => {
    if (filter.audience && p.audience !== filter.audience) return false;
    if (filter.category && p.category !== filter.category) return false;
    if (wantedBrands && !wantedBrands.has(p.brand)) return false;
    if (wantedSizes && !p.sizes.some((s) => wantedSizes.includes(s)))
      return false;
    return true;
  });
}

function toProduct(doc: SanityProduct): Product {
  const accentSeed = BRAND_META[doc.brand.name];
  return {
    id: doc.id,
    title: doc.title,
    brand: doc.brand.name,
    audience: doc.audience,
    category: doc.category,
    sizes: doc.sizes,
    price: doc.price,
    originalPrice: doc.originalPrice ?? undefined,
    condition: doc.condition,
    accent: {
      emoji: emojiForCategory(doc.category),
      bg: doc.brand.accentBg ?? accentSeed?.bg ?? "#e9f8f4",
    },
    images: (doc.images ?? [])
      .map((img) => ({
        url: img.url,
        lqip: img.lqip,
        alt: img.alt ?? doc.title,
        width: img.dimensions?.width ?? null,
        height: img.dimensions?.height ?? null,
      }))
      .filter((img) => img.url) as Product["images"],
    isSoldOut: doc.isSoldOut === true,
    description: doc.description ?? undefined,
  };
}

function emojiForCategory(c: Category): string {
  switch (c) {
    case "shoes":
      return "👟";
    case "jackets":
      return "🧥";
    case "shirts":
      return "👕";
    case "pants":
      return "👖";
    case "accessories":
      return "👜";
  }
}
