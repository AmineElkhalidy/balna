import { Alert, Linking } from "react-native";
import type { Product } from "./catalog";
import { format, type Dictionary } from "./i18n";

/**
 * Compose the same WhatsApp message the web app sends and try to open it
 * in the WhatsApp app. We attempt the `whatsapp://send?phone=…&text=…`
 * scheme first (jumps straight into the chat), and fall back to the
 * universal `https://wa.me/…` URL if WhatsApp isn't installed (the OS will
 * route that to the browser → WhatsApp Web → "Open in WhatsApp" prompt,
 * which is fine on modern Android).
 */
export async function openWhatsAppOrder({
  phone,
  product,
  selectedSizes,
  dict,
  refCode,
}: {
  phone: string;
  product: Product;
  selectedSizes: readonly string[];
  dict: Dictionary;
  refCode?: string;
}): Promise<boolean> {
  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) {
    Alert.alert("Setup needed", "WhatsApp number is not configured.");
    return false;
  }

  const text = composeMessage({ product, selectedSizes, dict, refCode });
  const encoded = encodeURIComponent(text);
  const native = `whatsapp://send?phone=${cleanPhone}&text=${encoded}`;
  const web = `https://wa.me/${cleanPhone}?text=${encoded}`;

  try {
    const canOpenNative = await Linking.canOpenURL(native);
    await Linking.openURL(canOpenNative ? native : web);
    return true;
  } catch {
    try {
      await Linking.openURL(web);
      return true;
    } catch (err) {
      Alert.alert("Couldn't open WhatsApp", String(err));
      return false;
    }
  }
}

function composeMessage({
  product,
  selectedSizes,
  dict,
  refCode,
}: {
  product: Product;
  selectedSizes: readonly string[];
  dict: Dictionary;
  refCode?: string;
}): string {
  const lines: string[] = [];
  lines.push(dict.whatsapp.intro);
  lines.push(`• ${product.brand} — ${product.title}`);
  if (selectedSizes.length > 0) {
    lines.push(`  ${dict.whatsapp.labelSizes}: ${selectedSizes.join(", ")}`);
  }
  lines.push(`  ${dict.whatsapp.labelPrice}: ${product.price} MAD`);
  if (refCode) lines.push(`  ${dict.whatsapp.labelRef}: ${refCode}`);
  lines.push("");
  lines.push(dict.whatsapp.outro);
  return lines.join("\n");
}

/** Stable per-product reference code, identical to the web's MS-#### scheme. */
export function buildRefCode(productId: string): string {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 31 + productId.charCodeAt(i)) >>> 0;
  }
  return `MS-${(hash % 10000).toString().padStart(4, "0")}`;
}

// Suppress unused-import lint if `format` ends up unused in a build variant.
void format;
