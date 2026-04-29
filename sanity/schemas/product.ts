import { PackageIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

/** Audiences and categories — keep these aligned with `lib/catalog.ts`. */
const AUDIENCE_OPTIONS = [
  { title: "Men", value: "men" },
  { title: "Kids", value: "kids" },
];

const CATEGORY_OPTIONS = [
  { title: "Shoes", value: "shoes" },
  { title: "Jackets", value: "jackets" },
  { title: "Shirts", value: "shirts" },
  { title: "Pants", value: "pants" },
  { title: "Accessories", value: "accessories" },
];

const CONDITION_OPTIONS = [
  { title: "Like new", value: "Like new" },
  { title: "Excellent", value: "Excellent" },
  { title: "Very good", value: "Very good" },
  { title: "Good", value: "Good" },
];

/**
 * Product
 *
 * Each product is a one-of-one thrift item. `isSoldOut` is the operational
 * flag — Balna doesn't track inventory counts because every product is unique.
 * When a piece sells the editor flips the toggle and it disappears from the
 * storefront on the next ISR revalidation.
 */
export const product = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: PackageIcon,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (R) => R.required().min(2).max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "reference",
      to: [{ type: "brand" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "audience",
      title: "Target",
      type: "string",
      options: { list: AUDIENCE_OPTIONS, layout: "radio", direction: "horizontal" },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "category",
      title: "Item type",
      type: "string",
      options: { list: CATEGORY_OPTIONS, layout: "radio", direction: "horizontal" },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "sizes",
      title: "Sizes available",
      description:
        "For accessories, just add 'One Size'. Sizes are matched as-is against quiz answers.",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
      validation: (R) => R.required().min(1),
    }),
    defineField({
      name: "price",
      title: "Price",
      description: "Sale price in your store currency, as an integer (e.g. 38).",
      type: "number",
      validation: (R) => R.required().min(0).integer(),
    }),
    defineField({
      name: "originalPrice",
      title: "Original retail",
      description: "Optional. Shown as a strike-through when higher than price.",
      type: "number",
      validation: (R) => R.min(0).integer(),
    }),
    defineField({
      name: "condition",
      title: "Condition",
      type: "string",
      options: { list: CONDITION_OPTIONS },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "images",
      title: "Photos",
      description: "First image is used as the cover.",
      type: "array",
      of: [defineArrayMember({ type: "image", options: { hotspot: true } })],
      validation: (R) => R.min(1).max(8),
    }),
    defineField({
      name: "description",
      title: "Description",
      description: "Optional notes — defects, fit, fabric.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "isSoldOut",
      title: "Sold out",
      description: "Flip this when the piece has been picked up. Hides it from the storefront.",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      brand: "brand.name",
      price: "price",
      isSoldOut: "isSoldOut",
      media: "images.0",
    },
    prepare({ title, brand, price, isSoldOut, media }) {
      return {
        title: [brand, title].filter(Boolean).join(" — "),
        subtitle: [isSoldOut ? "SOLD" : null, price ? `$${price}` : null]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
  orderings: [
    {
      title: "Newest",
      name: "newest",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
    {
      title: "Price (low → high)",
      name: "priceAsc",
      by: [{ field: "price", direction: "asc" }],
    },
  ],
});
