/**
 * Sanity Studio configuration.
 *
 * Mounted at `/studio` via `app/studio/[[...tool]]/page.tsx`. The Studio is a
 * single-page React app; once Next renders it, all routing inside happens
 * client-side.
 */
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";
import {
  apiVersion,
  dataset,
  projectId,
  studioBasePath,
} from "./sanity/env";

export default defineConfig({
  basePath: studioBasePath,
  name: "balna",
  title: "Balna Studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
