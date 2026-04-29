import type { Audience, Category, Condition } from "@/lib/catalog";

/**
 * TypeScript shapes mirroring the GROQ projections in `./queries.ts`.
 *
 * In a larger project you'd generate these with `@sanity/typegen` from the
 * GROQ source. For an MVP, keeping them hand-written is fine — when we change
 * a projection we update the type next to it.
 */

export interface SanityImage {
  _key: string;
  url: string | null;
  lqip: string | null;
  dimensions: { width: number; height: number } | null;
  alt: string | null;
}

export interface SanityBrand {
  id: string;
  slug: string;
  name: string;
  logo: { _ref: string } | null;
  accentBg: string | null;
  accentFg: string | null;
}

export interface SanityProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice: number | null;
  audience: Audience;
  category: Category;
  sizes: string[];
  condition: Condition;
  isSoldOut: boolean;
  description: string | null;
  brand: SanityBrand;
  images: SanityImage[] | null;
}

export interface SanityBankTransfer {
  bankName: string | null;
  accountHolder: string | null;
  iban: string | null;
  swift: string | null;
  instructions: string | null;
}

export interface SanitySiteSettings {
  whatsappNumber: string | null;
  bankTransfer: SanityBankTransfer | null;
}
