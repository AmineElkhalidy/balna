/**
 * Mobile-side data layer over Sanity.
 *
 * Mirrors the web's `lib/sanity/products.ts` API surface so screens written
 * for either platform speak the same language. Differences from the web:
 *
 *   - No `next: { revalidate, tags }` cache hints (Next.js-specific).
 *   - No "server-only" guard (RN bundles have no SSR).
 *   - No local fixture fallback. If Sanity isn't configured, the empty state
 *     renders. The mobile app is meant to be shipped to a store with a real
 *     dataset, so silent fallbacks would mask config bugs.
 */
import { getSanityClient, isSanityConfigured } from "./client";
import {
  brandIndexQuery,
  productsQuery,
  siteSettingsQuery,
} from "./queries";
import {
  AUDIENCES,
  CATEGORIES,
  type Audience,
  type Category,
  type Product,
  type QuizFilter,
} from "@/lib/catalog";

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

interface SanityProductDoc {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  audience: Audience;
  category: Category;
  sizes: string[];
  isSoldOut?: boolean;
  description?: string;
  brand: { name: string; accentBg?: string };
  images?: Array<{
    url?: string;
    lqip?: string | null;
    alt?: string;
    dimensions?: { width?: number; height?: number };
  }>;
}

export async function getProducts(filter: QuizFilter): Promise<Product[]> {
  if (!isSanityConfigured) return [];

  const params = {
    audiences: filter.audience ? [filter.audience] : [],
    categories: filter.category ? [filter.category] : [],
    brands: filter.brands && filter.brands.length > 0 ? [...filter.brands] : [],
    sizes: filter.sizes && filter.sizes.length > 0 ? [...filter.sizes] : [],
    sort: filter.sort ?? "newest",
  };
  const docs = await getSanityClient().fetch<SanityProductDoc[]>(
    productsQuery,
    params,
  );
  return docs.map(toProduct);
}

export async function getBrandIndex(): Promise<BrandIndex> {
  const out: BrandIndex = {};
  for (const a of AUDIENCES) {
    for (const c of CATEGORIES) {
      out[`${a}:${c}`] = [];
    }
  }
  if (!isSanityConfigured) return out;

  const rows = await getSanityClient().fetch<
    Array<{ audience: Audience; category: Category; brand: string }>
  >(brandIndexQuery);
  for (const row of rows) {
    const key = `${row.audience}:${row.category}`;
    const list = out[key];
    if (list && row.brand && !list.includes(row.brand)) list.push(row.brand);
  }
  for (const key of Object.keys(out)) {
    out[key]!.sort((a, b) => a.localeCompare(b));
  }
  return out;
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!isSanityConfigured) {
    const fallbackPhone = process.env.EXPO_PUBLIC_MINOR_WHATSAPP ?? "";
    return fallbackPhone
      ? { whatsappNumber: fallbackPhone, bankTransfer: null }
      : null;
  }

  const doc = await getSanityClient().fetch<{
    whatsappNumber?: string;
    bankTransfer?: BankTransfer | null;
  } | null>(siteSettingsQuery);

  const envPhone = process.env.EXPO_PUBLIC_MINOR_WHATSAPP ?? "";
  const phone = (doc?.whatsappNumber || "").replace(/\D/g, "") || envPhone;
  if (!phone) return null;

  return {
    whatsappNumber: phone,
    bankTransfer: doc?.bankTransfer
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

function toProduct(doc: SanityProductDoc): Product {
  return {
    id: doc.id,
    title: doc.title,
    brand: doc.brand.name,
    audience: doc.audience,
    category: doc.category,
    sizes: doc.sizes ?? [],
    price: doc.price,
    originalPrice: doc.originalPrice,
    accent: {
      emoji: emojiForCategory(doc.category),
      bg: doc.brand.accentBg ?? "#e9f8f4",
    },
    images: (doc.images ?? [])
      .map((img) => ({
        url: img.url ?? "",
        lqip: img.lqip ?? null,
        alt: img.alt ?? doc.title,
        width: img.dimensions?.width ?? null,
        height: img.dimensions?.height ?? null,
      }))
      .filter((img) => img.url),
    isSoldOut: doc.isSoldOut === true,
    description: doc.description,
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
