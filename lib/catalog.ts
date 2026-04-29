/**
 * Balna catalog — single source of truth for the demo.
 *
 * In production this module would be replaced by a database query (e.g. a
 * `getProducts` server function backed by Postgres / Sanity / Shopify).
 * Keeping it as a typed in-memory list keeps the storefront snappy for the
 * MVP and lets every page render on the server with zero round-trips.
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

/** Sizes are intentionally small per audience — fewer choices = less anxiety. */
export const SIZES_BY_AUDIENCE: Record<Audience, readonly string[]> = {
  men: ["S", "M", "L", "XL", "XXL"],
  kids: ["2-4y", "4-6y", "6-8y", "8-10y", "10-12y"],
};

export const ACCESSORIES_SIZE = "One Size";

export type Condition = "Like new" | "Excellent" | "Very good" | "Good";

export interface ProductImage {
  /** Pre-built CDN URL. Pass through `next/image` `unoptimized` if you don't want re-encoding. */
  url: string;
  /** Base64 placeholder from Sanity's image pipeline, used as `next/image` blur. */
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
  /** Sizes the item is available in. Use ["One Size"] for accessories. */
  sizes: readonly string[];
  /** Sale price, in your store currency, as a plain integer for clarity. */
  price: number;
  /** Original retail, used to show the savings badge. */
  originalPrice?: number;
  condition: Condition;
  /** Color emoji + soft background tone for the placeholder thumbnail. */
  accent: { emoji: string; bg: string };
  /** Real photos from Sanity. When empty/undefined, the emoji placeholder is shown. */
  images?: readonly ProductImage[];
  /** Marked sold by an editor. Filtered out at the data layer, but useful for previews. */
  isSoldOut?: boolean;
  /** Optional copy from the editor — defects, fit, fabric. */
  description?: string;
}

const P = (p: Product): Product => p;

export const PRODUCTS: readonly Product[] = [
  // ── Men ──────────────────────────────────────────────────────────────────
  P({
    id: "m-jkt-northface-puffer",
    title: "Nuptse 700 Puffer",
    brand: "The North Face",
    audience: "men",
    category: "jackets",
    sizes: ["M", "L", "XL"],
    price: 95,
    originalPrice: 280,
    condition: "Very good",
    accent: { emoji: "🧥", bg: "#d8efe8" },
  }),
  P({
    id: "m-shr-uniqlo-oxford",
    title: "Oxford Button-down Shirt",
    brand: "Uniqlo",
    audience: "men",
    category: "shirts",
    sizes: ["S", "M", "L", "XL"],
    price: 12,
    originalPrice: 39,
    condition: "Good",
    accent: { emoji: "👔", bg: "#e7eefc" },
  }),
  P({
    id: "m-pnt-carhartt-double",
    title: "Double-knee Work Pants",
    brand: "Carhartt",
    audience: "men",
    category: "pants",
    sizes: ["M", "L", "XL", "XXL"],
    price: 34,
    originalPrice: 89,
    condition: "Excellent",
    accent: { emoji: "👖", bg: "#f4ead2" },
  }),
  P({
    id: "m-shoe-adidas-samba",
    title: "Samba OG Trainers",
    brand: "Adidas",
    audience: "men",
    category: "shoes",
    sizes: ["M", "L", "XL"],
    price: 62,
    originalPrice: 110,
    condition: "Like new",
    accent: { emoji: "👟", bg: "#e2f0ff" },
  }),
  P({
    id: "m-acc-rayban-wayfarer",
    title: "Wayfarer Sunglasses",
    brand: "Ray-Ban",
    audience: "men",
    category: "accessories",
    sizes: [ACCESSORIES_SIZE],
    price: 45,
    originalPrice: 165,
    condition: "Excellent",
    accent: { emoji: "🕶️", bg: "#dee2f1" },
  }),

  // ── Kids ─────────────────────────────────────────────────────────────────
  P({
    id: "k-jkt-patagonia-fleece",
    title: "Synchilla Fleece",
    brand: "Patagonia",
    audience: "kids",
    category: "jackets",
    sizes: ["4-6y", "6-8y", "8-10y"],
    price: 28,
    originalPrice: 79,
    condition: "Excellent",
    accent: { emoji: "🧥", bg: "#fce6dd" },
  }),
  P({
    id: "k-shr-gap-tee",
    title: "Striped Cotton Tee",
    brand: "GAP",
    audience: "kids",
    category: "shirts",
    sizes: ["2-4y", "4-6y", "6-8y"],
    price: 8,
    originalPrice: 22,
    condition: "Very good",
    accent: { emoji: "👕", bg: "#e3f4ff" },
  }),
  P({
    id: "k-pnt-hm-jeans",
    title: "Slim-fit Jeans",
    brand: "H&M",
    audience: "kids",
    category: "pants",
    sizes: ["6-8y", "8-10y", "10-12y"],
    price: 11,
    originalPrice: 29,
    condition: "Good",
    accent: { emoji: "👖", bg: "#e6e2f7" },
  }),
  P({
    id: "k-shoe-vans-old-skool",
    title: "Old Skool Sneakers",
    brand: "Vans",
    audience: "kids",
    category: "shoes",
    sizes: ["2-4y", "4-6y", "6-8y", "8-10y"],
    price: 22,
    originalPrice: 55,
    condition: "Like new",
    accent: { emoji: "👟", bg: "#f1e7df" },
  }),
  P({
    id: "k-acc-adidas-cap",
    title: "Trefoil Baseball Cap",
    brand: "Adidas",
    audience: "kids",
    category: "accessories",
    sizes: [ACCESSORIES_SIZE],
    price: 9,
    originalPrice: 24,
    condition: "Excellent",
    accent: { emoji: "🧢", bg: "#dff1ec" },
  }),
];

export interface QuizFilter {
  audience?: Audience;
  category?: Category;
  /** Optional list of brand names. Empty / missing means "any brand". */
  brands?: readonly string[];
  sizes?: readonly string[];
}

/** Returns products matching every provided filter. Missing filters are ignored. */
export function filterProducts(
  filter: QuizFilter,
  products: readonly Product[] = PRODUCTS,
): Product[] {
  const wantedSizes =
    filter.sizes && filter.sizes.length > 0 ? filter.sizes : null;
  const wantedBrands =
    filter.brands && filter.brands.length > 0 ? new Set(filter.brands) : null;

  return products.filter((p) => {
    if (filter.audience && p.audience !== filter.audience) return false;
    if (filter.category && p.category !== filter.category) return false;
    if (wantedBrands && !wantedBrands.has(p.brand)) return false;
    if (wantedSizes && !p.sizes.some((s) => wantedSizes.includes(s)))
      return false;
    return true;
  });
}

/**
 * Distinct, sorted list of brand names available for the given audience +
 * category combination. Empty list means "no products matched". The Quiz uses
 * this to render Step 3 dynamically — only brands actually in stock for the
 * shopper's audience+category get shown.
 */
export function availableBrands(
  filter: Pick<QuizFilter, "audience" | "category">,
  products: readonly Product[] = PRODUCTS,
): string[] {
  const set = new Set<string>();
  for (const p of products) {
    if (filter.audience && p.audience !== filter.audience) continue;
    if (filter.category && p.category !== filter.category) continue;
    set.add(p.brand);
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** Every brand that appears anywhere in the catalog. */
export const BRANDS: readonly string[] = [
  ...new Set(PRODUCTS.map((p) => p.brand)),
].sort((a, b) => a.localeCompare(b));

/** Pretty labels for UI. Keep separate from the data so URLs stay lowercase. */
export const AUDIENCE_LABEL: Record<Audience, string> = {
  men: "Men",
  kids: "Kids",
};

export const CATEGORY_LABEL: Record<Category, string> = {
  shoes: "Shoes",
  jackets: "Jackets",
  shirts: "Shirts",
  pants: "Pants",
  accessories: "Accessories",
};

export const CATEGORY_EMOJI: Record<Category, string> = {
  shoes: "👟",
  jackets: "🧥",
  shirts: "👕",
  pants: "👖",
  accessories: "👜",
};

export const AUDIENCE_EMOJI: Record<Audience, string> = {
  men: "👨",
  kids: "🧒",
};

/**
 * Visual style for each brand chip — background, foreground, and an optional
 * short "wordmark" label (e.g. "TNF" for The North Face). Unknown brands fall
 * back to a neutral teal/navy chip via {@link getBrandStyle}.
 */
export interface BrandStyle {
  bg: string;
  fg: string;
  /** Override for the visible label inside the chip (defaults to the brand name). */
  mark?: string;
}

export const BRAND_META: Record<string, BrandStyle> = {
  Nike: { bg: "#0a0a0a", fg: "#ffffff" },
  Adidas: { bg: "#000000", fg: "#ffffff", mark: "adidas" },
  "The North Face": { bg: "#1a1a1a", fg: "#ffffff", mark: "TNF" },
  Patagonia: { bg: "#0c2c54", fg: "#ffffff" },
  Uniqlo: { bg: "#bf0000", fg: "#ffffff", mark: "UNIQLO" },
  Carhartt: { bg: "#f5a800", fg: "#1a1a1a" },
  "Ray-Ban": { bg: "#0a0a0a", fg: "#ffffff" },
  GAP: { bg: "#002868", fg: "#ffffff" },
  "H&M": { bg: "#e50010", fg: "#ffffff" },
  Vans: { bg: "#0a0a0a", fg: "#ffffff", mark: "VANS" },
};

export function getBrandStyle(brand: string): BrandStyle {
  return BRAND_META[brand] ?? { bg: "#1a2a52", fg: "#ffffff" };
}
