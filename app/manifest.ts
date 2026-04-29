import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

/**
 * Web app manifest — turns Balna into an installable PWA shell on Android
 * and gives iOS Safari the right colour/title hints when added to the home
 * screen. The `start_url` doesn't include a locale so the proxy can pick the
 * right one based on `Accept-Language`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Pre-loved branded thrift`,
    short_name: SITE_NAME,
    description:
      "Pre-owned branded clothing made simple. Answer 4 questions and shop only what fits.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf9f5",
    theme_color: "#11b79f",
    categories: ["shopping", "lifestyle"],
    lang: "en",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
