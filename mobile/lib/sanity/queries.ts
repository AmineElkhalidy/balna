/**
 * GROQ queries for the mobile app.
 *
 * Kept in sync with the web's `lib/sanity/queries.ts` (same projection, same
 * filter logic, same sort selector) so both surfaces deserialise to the same
 * shape and any schema change in Sanity Studio applies to both at once.
 *
 * Important: we don't depend on `next-sanity` here (it's a Next.js helper
 * that would drag in server-only code). The strings are passed directly to
 * `@sanity/client`, which accepts any `groq` literal.
 */

const PRODUCT_PROJECTION = /* groq */ `{
  "id": _id,
  "slug": slug.current,
  title,
  price,
  originalPrice,
  audience,
  category,
  sizes,
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

export const brandIndexQuery = /* groq */ `
  *[_type == "product" && !isSoldOut && defined(brand->name)]{
    audience,
    category,
    "brand": brand->name
  }
`;

export const productsQuery = /* groq */ `
  *[
    _type == "product"
    && !isSoldOut
    && (count($audiences) == 0 || audience in $audiences)
    && (count($categories) == 0 || category in $categories)
    && (count($brands) == 0 || brand->name in $brands)
    && (count($sizes) == 0 || count(sizes[@ in $sizes]) > 0)
  ] | order(
    select(
      $sort == "priceAsc" => price,
      $sort == "priceDesc" => 0,
      0
    ) asc,
    select(
      $sort == "priceDesc" => price,
      0
    ) desc,
    _createdAt desc
  ) ${PRODUCT_PROJECTION}
`;

export const siteSettingsQuery = /* groq */ `
  *[_type == "siteSettings"][0]{
    whatsappNumber,
    bankTransfer
  }
`;
