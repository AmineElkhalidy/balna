import { TagIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

/**
 * Brand
 *
 * A separate document type so each brand has its own logo, slug, and accent
 * colours — and so editors can manage the brand list without re-typing it on
 * every product. Products reference a brand by `_ref`.
 */
export const brand = defineType({
  name: "brand",
  title: "Brand",
  type: "document",
  icon: TagIcon,
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (R) => R.required().min(1).max(60),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 80 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      description:
        "Square or wide PNG/SVG with a transparent background. Used in the brand chip on the quiz and the product card.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "accentBg",
      title: "Accent background",
      description:
        "Hex colour used behind the wordmark when no logo is uploaded. Defaults to navy.",
      type: "string",
      validation: (R) =>
        R.regex(/^#?[0-9a-fA-F]{3,8}$/).warning("Use a hex colour like #11b79f"),
    }),
    defineField({
      name: "accentFg",
      title: "Accent foreground",
      description: "Hex colour for text on top of the accent background.",
      type: "string",
      validation: (R) =>
        R.regex(/^#?[0-9a-fA-F]{3,8}$/).warning("Use a hex colour like #ffffff"),
    }),
  ],
  preview: {
    select: { title: "name", media: "logo" },
  },
});
