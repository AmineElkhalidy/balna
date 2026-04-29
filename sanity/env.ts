/**
 * Centralised access to Sanity env vars.
 *
 * `projectId` and `dataset` are exposed via `NEXT_PUBLIC_*` so they can be
 * inlined into the Studio bundle as well as the storefront. The optional
 * `SANITY_API_READ_TOKEN` stays server-only for previewing drafts later.
 */
export const apiVersion = "2025-01-01";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const studioBasePath = "/studio";

/** Whether Sanity is configured. When `false` the storefront falls back to local data. */
export const isSanityConfigured = projectId.length > 0;

export const readToken = process.env.SANITY_API_READ_TOKEN || "";
