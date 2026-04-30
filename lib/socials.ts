import { WHATSAPP_NUMBER } from "./whatsapp";

/**
 * Public social profiles for Balna.
 *
 * Hardcoded on purpose — these don't change often, and editing them in code is
 * faster than threading another singleton field through Sanity. The WhatsApp
 * link is derived from the same number used by the checkout flow so there's
 * one source of truth for "how to reach Balna on WhatsApp".
 *
 * If we ever need to manage these from the CMS, swap this for fields on the
 * `siteSettings` document and inject the resolved URLs at the page level.
 */
export type SocialKey = "instagram" | "facebook" | "whatsapp";

export const SOCIAL_LINKS: Record<SocialKey, { href: string }> = {
  instagram: { href: "https://instagram.com/balna" },
  facebook: { href: "https://facebook.com/balna" },
  whatsapp: { href: `https://wa.me/${WHATSAPP_NUMBER}` },
};

/** Stable rendering order — used by the `<SocialLinks />` component. */
export const SOCIAL_ORDER: readonly SocialKey[] = [
  "instagram",
  "facebook",
  "whatsapp",
] as const;
