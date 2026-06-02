/**
 * Catalog types — kept identical to the web app's `lib/catalog.ts` so the
 * GROQ projection deserialises into the same shape on both surfaces. The
 * mobile app doesn't ship local fixtures (the web does, as a Sanity-less
 * fallback for previews); when Sanity isn't configured here, we just show
 * the empty state. The store is the source of truth.
 */

export const AUDIENCES = ["men", "kids"] as const;
export type Audience = (typeof AUDIENCES)[number];

export const CATEGORIES = [
  "shoes",
  "jackets",
  "shirts",
  "pants",
  "accessories",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const SIZES_BY_AUDIENCE: Record<Audience, readonly string[]> = {
  men: ["S", "M", "L", "XL", "XXL"],
  kids: ["2-4y", "4-6y", "6-8y", "8-10y", "10-12y"],
};

export const ACCESSORIES_SIZE = "One Size";

export const CATEGORY_EMOJI: Record<Category, string> = {
  shoes: "👟",
  jackets: "🧥",
  shirts: "👔",
  pants: "👖",
  accessories: "🎒",
};

export const AUDIENCE_EMOJI: Record<Audience, string> = {
  men: "👨",
  kids: "🧒",
};

export const SORT_KEYS = ["newest", "priceAsc", "priceDesc"] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export const DEFAULT_SORT: SortKey = "newest";

export interface ProductImage {
  url: string;
  lqip: string | null;
  alt: string;
  width: number | null;
  height: number | null;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  audience: Audience;
  category: Category;
  sizes: readonly string[];
  price: number;
  originalPrice?: number;
  accent: { emoji: string; bg: string };
  images?: readonly ProductImage[];
  isSoldOut?: boolean;
  description?: string;
}

export interface QuizFilter {
  audience?: Audience;
  category?: Category;
  brands?: readonly string[];
  sizes?: readonly string[];
  sort?: SortKey;
}
