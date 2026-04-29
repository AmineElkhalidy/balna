import { defineQuery } from "next-sanity";

/* ──────────────────────────────────────────────────────────────────────── */
/*  Reusable projections                                                    */
/* ──────────────────────────────────────────────────────────────────────── */

const PRODUCT_PROJECTION = /* groq */ `{
  "id": _id,
  "slug": slug.current,
  title,
  price,
  originalPrice,
  audience,
  category,
  sizes,
  condition,
  isSoldOut,
  description,
  "brand": brand->{
    "id": _id,
    "slug": slug.current,
    name,
    logo,
    accentBg,
    accentFg
  },
  "images": images[]{
    _key,
    "url": asset->url,
    "lqip": asset->metadata.lqip,
    "dimensions": asset->metadata.dimensions{ width, height },
    alt
  }
}`;

/* ──────────────────────────────────────────────────────────────────────── */
/*  Queries                                                                 */
/* ──────────────────────────────────────────────────────────────────────── */

/**
 * Distinct brands grouped by audience+category, used by the Quiz to render
 * Step 3. Sold-out products are excluded so we never advertise a brand we
 * can't fulfil.
 */
export const brandIndexQuery = defineQuery(/* groq */ `
  *[_type == "product" && !isSoldOut && defined(brand->name)]{
    audience,
    category,
    "brand": brand->name
  }
`);

/**
 * Filtered, sorted product list for /shop. All filter params are optional —
 * an empty array is treated as "no constraint" thanks to `count(...) == 0`.
 *
 * Strings come straight from the URL search params and are escaped by the
 * GROQ runtime, so this is safe to call with untrusted input.
 */
export const productsQuery = defineQuery(/* groq */ `
  *[
    _type == "product"
    && !isSoldOut
    && (count($audiences) == 0 || audience in $audiences)
    && (count($categories) == 0 || category in $categories)
    && (count($brands) == 0 || brand->name in $brands)
    && (count($sizes) == 0 || count(sizes[@ in $sizes]) > 0)
  ] | order(_createdAt desc) ${PRODUCT_PROJECTION}
`);

/**
 * Singleton site settings.
 */
export const siteSettingsQuery = defineQuery(/* groq */ `
  *[_type == "siteSettings"][0]{
    whatsappNumber,
    bankTransfer
  }
`);
