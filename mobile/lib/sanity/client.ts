/**
 * Public, read-only Sanity client for the mobile app.
 *
 * Uses Expo's `EXPO_PUBLIC_*` env convention so values are baked into the
 * JS bundle at build time — these aren't secrets, they're the same project
 * ID and dataset name embedded in the web's HTML and discoverable via any
 * GROQ playground. We pin the API version so schema additions never break
 * the bundle in flight.
 */
import { createClient, type SanityClient } from "@sanity/client";

const projectId = process.env.EXPO_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.EXPO_PUBLIC_SANITY_DATASET ?? "production";

export const isSanityConfigured = Boolean(projectId);

let cached: SanityClient | null = null;

export function getSanityClient(): SanityClient {
  if (!isSanityConfigured) {
    throw new Error(
      "[mobile] Sanity is not configured. Set EXPO_PUBLIC_SANITY_PROJECT_ID in mobile/.env.local.",
    );
  }
  if (cached) return cached;
  cached = createClient({
    projectId: projectId!,
    dataset,
    apiVersion: "2024-09-01",
    useCdn: true,
    perspective: "published",
    // Mobile networks are spotty; let the client retry idempotent reads.
    maxRetries: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
  });
  return cached;
}
