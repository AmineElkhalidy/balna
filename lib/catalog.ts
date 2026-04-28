/**
 * Balna catalog — single source of truth for the demo.
 *
 * In production this module would be replaced by a database query (e.g. a
 * `getProducts` server function backed by Postgres / Sanity / Shopify).
 * Keeping it as a typed in-memory list keeps the storefront snappy for the
 * MVP and lets every page render on the server with zero round-trips.
 */

export const AUDIENCES = ["women", "men", "kids"] as const;
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
  women: ["XS", "S", "M", "L", "XL"],
  men: ["S", "M", "L", "XL", "XXL"],
  kids: ["2-4y", "4-6y", "6-8y", "8-10y", "10-12y"],
};

export const ACCESSORIES_SIZE = "One Size";

export type Condition = "Like new" | "Excellent" | "Very good" | "Good";

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
}

const P = (p: Product): Product => p;

export const PRODUCTS: readonly Product[] = [
  // ── Women ────────────────────────────────────────────────────────────────
  P({
    id: "w-jkt-levi-trucker",
    title: "Trucker Denim Jacket",
    brand: "Levi's",
    audience: "women",
    category: "jackets",
    sizes: ["S", "M", "L"],
    price: 38,
    originalPrice: 110,
    condition: "Excellent",
    accent: { emoji: "🧥", bg: "#dde7ff" },
  }),
  P({
    id: "w-shr-zara-blouse",
    title: "Linen Button-up Blouse",
    brand: "Zara",
    audience: "women",
    category: "shirts",
    sizes: ["XS", "S", "M"],
    price: 16,
    originalPrice: 49,
    condition: "Like new",
    accent: { emoji: "👚", bg: "#fde6ee" },
  }),
  P({
    id: "w-pnt-cos-trousers",
    title: "Wide-leg Wool Trousers",
    brand: "COS",
    audience: "women",
    category: "pants",
    sizes: ["S", "M", "L", "XL"],
    price: 29,
    originalPrice: 95,
    condition: "Very good",
    accent: { emoji: "👖", bg: "#e8e3ff" },
  }),
  P({
    id: "w-shoe-nike-airmax",
    title: "Air Max 90 Sneakers",
    brand: "Nike",
    audience: "women",
    category: "shoes",
    sizes: ["S", "M", "L"],
    price: 54,
    originalPrice: 130,
    condition: "Excellent",
    accent: { emoji: "👟", bg: "#fff1d6" },
  }),
  P({
    id: "w-acc-coach-bag",
    title: "Mini Tabby Shoulder Bag",
    brand: "Coach",
    audience: "women",
    category: "accessories",
    sizes: [ACCESSORIES_SIZE],
    price: 89,
    originalPrice: 295,
    condition: "Like new",
    accent: { emoji: "👜", bg: "#ffe1d4" },
  }),

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
  sizes?: readonly string[];
}

/** Returns products matching every provided filter. Missing filters are ignored. */
export function filterProducts(
  filter: QuizFilter,
  products: readonly Product[] = PRODUCTS,
): Product[] {
  const wantedSizes =
    filter.sizes && filter.sizes.length > 0 ? filter.sizes : null;

  return products.filter((p) => {
    if (filter.audience && p.audience !== filter.audience) return false;
    if (filter.category && p.category !== filter.category) return false;
    if (wantedSizes && !p.sizes.some((s) => wantedSizes.includes(s)))
      return false;
    return true;
  });
}

/** Pretty labels for UI. Keep separate from the data so URLs stay lowercase. */
export const AUDIENCE_LABEL: Record<Audience, string> = {
  women: "Women",
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
  women: "👩",
  men: "👨",
  kids: "🧒",
};
