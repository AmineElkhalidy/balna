import type { Product } from "./catalog";
import type { Dictionary } from "./i18n";

/**
 * Default WhatsApp number used when neither Sanity nor an env var has supplied
 * one. Production should always set `NEXT_PUBLIC_BALNA_WHATSAPP` or fill in
 * the field on the Site settings document — this stub exists only so dev
 * builds without a Sanity project still produce a valid `wa.me` link.
 */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_BALNA_WHATSAPP?.replace(/\D/g, "") || "15555550123";

/**
 * Build a `wa.me` deep link with a pre-filled message in the user's language.
 * Brand + product title remain in English (they're brand identifiers).
 */
export function whatsappLinkForProduct(
  p: Product,
  dict: Dictionary,
  /** Override phone number (e.g. one fetched from Sanity site settings). */
  phone: string = WHATSAPP_NUMBER,
): string {
  const number = phone.replace(/\D/g, "") || WHATSAPP_NUMBER;
  const w = dict.whatsapp;
  const lines = [
    w.intro,
    ``,
    `• ${p.brand} — ${p.title}`,
    `• ${w.labelSizes}: ${p.sizes.join(", ")}`,
    `• ${w.labelPrice}: $${p.price}`,
    `• ${w.labelRef}: ${p.id}`,
    ``,
    w.outro,
  ];
  const text = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${number}?text=${text}`;
}
