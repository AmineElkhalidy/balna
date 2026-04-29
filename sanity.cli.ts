import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./sanity/env";

/**
 * Used by the `sanity` CLI for `sanity dataset import`, `sanity deploy`, etc.
 * The actual project ID + dataset come from env so the CLI works in CI too.
 */
export default defineCliConfig({
  api: { projectId, dataset },
  autoUpdates: true,
});
