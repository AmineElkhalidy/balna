"use client";

/**
 * Embedded Sanity Studio.
 *
 * The catch-all `[[...tool]]` segment hands every URL under `/studio` to the
 * Studio's own client-side router. The page itself is a thin wrapper around
 * `NextStudio` from `next-sanity`, which knows how to mount the Studio shell.
 */
import { NextStudio } from "next-sanity/studio";
import config from "../../../sanity.config";

export const dynamic = "force-static";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
