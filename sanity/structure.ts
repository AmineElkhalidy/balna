import type { StructureResolver } from "sanity/structure";

/**
 * Custom Sanity Studio sidebar.
 *
 * - Site settings is a singleton: edited as one document, never listed.
 * - Brands and Products are normal lists.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Balna")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.divider(),
      S.documentTypeListItem("product").title("Products"),
      S.documentTypeListItem("brand").title("Brands"),
    ]);
