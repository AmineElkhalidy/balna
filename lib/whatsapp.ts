import type { Product } from "./catalog";
import type { Dictionary } from "./i18n";

/**
 * Phone number for the Balna WhatsApp inbox.
 *
 * Wrapped so it can be swapped out via `NEXT_PUBLIC_BALNA_WHATSAPP` at deploy
 * time without touching components. Must include the country code, no `+`.
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
): string {
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
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
