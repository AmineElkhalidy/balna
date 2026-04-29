import "server-only";
import { createClient, type SanityClient } from "next-sanity";
import {
  apiVersion,
  dataset,
  isSanityConfigured,
  projectId,
  readToken,
} from "@/sanity/env";

/**
 * Sanity read-only client.
 *
 * Constructed lazily because `createClient` throws when `projectId` is empty,
 * and we want the storefront to keep working in local dev without any Sanity
 * env vars at all (in that mode the data layer transparently falls back to
 * the in-memory fixture catalog).
 *
 * - `useCdn: true` — content is fetched from Sanity's edge CDN.
 * - `perspective: "published"` — never serve drafts to anonymous visitors.
 * - The optional read token is only attached if it's set, to enable preview
 *   mode later.
 */
let _client: SanityClient | null = null;

function buildClient(): SanityClient {
  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: "published",
    token: readToken || undefined,
    stega: false,
  });
}

export function getSanityClient(): SanityClient {
  if (!isSanityConfigured) {
    throw new Error(
      "Sanity is not configured. Set NEXT_PUBLIC_SANITY_PROJECT_ID before calling getSanityClient().",
    );
  }
  if (!_client) _client = buildClient();
  return _client;
}
