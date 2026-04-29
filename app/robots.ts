import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * /robots.txt — block the embedded Sanity Studio and any Next.js internals,
 * advertise the sitemap, and let everything else through.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/studio", "/studio/", "/api/", "/_next/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
