import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useDict } from "@/lib/i18n/LocaleContext";
import type { Product } from "@/lib/catalog";
import { format } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/sanity/products";
import { useResponsive } from "@/lib/useResponsive";
import { CheckoutSheet } from "./CheckoutSheet";

interface ProductCardProps {
  product: Product;
  settings: SiteSettings | null;
}

/**
 * Card tile in the product grid.
 *
 * Press → opens the {@link CheckoutSheet}. We don't ship a separate
 * product-detail screen for v1 (strict parity with the web), so the card
 * is both browse + checkout entry-point.
 *
 * Image strategy:
 *   - Use `expo-image` for cached, blurhash-friendly remote loading.
 *   - When Sanity didn't ship a photo, fall back to the brand emoji on a
 *     soft accent background (same trick as the web placeholder).
 */
export function ProductCard({ product, settings }: ProductCardProps) {
  const dict = useDict();
  const r = useResponsive();
  const [open, setOpen] = useState(false);

  const firstImage = product.images?.[0];
  const isSoldOut = product.isSoldOut === true;
  const savings =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100,
        )
      : null;

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={isSoldOut}
        accessibilityRole="button"
        accessibilityLabel={`${product.brand} ${product.title} — ${product.price} MAD`}
        accessibilityState={{ disabled: isSoldOut }}
        style={({ pressed }) => [
          styles.card,
          {
            opacity: isSoldOut ? 0.6 : pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View
          style={[
            styles.thumb,
            { backgroundColor: product.accent.bg ?? "#e9f8f4" },
          ]}
        >
          {firstImage?.url ? (
            <Image
              source={{ uri: firstImage.url }}
              placeholder={firstImage.lqip ? { blurhash: firstImage.lqip } : undefined}
              contentFit="cover"
              transition={150}
              style={StyleSheet.absoluteFill}
              accessibilityLabel={firstImage.alt}
            />
          ) : (
            <Text style={styles.emoji}>{product.accent.emoji}</Text>
          )}

          {isSoldOut ? (
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>{dict.product.soldOut}</Text>
            </View>
          ) : (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>{dict.product.new}</Text>
            </View>
          )}

          {savings ? (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>
                {format(dict.product.savings, { percent: savings })}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.body, { padding: r.scale(12) }]}>
          <Text
            style={[styles.brand, { fontSize: r.scale(11) }]}
            numberOfLines={1}
          >
            {product.brand}
          </Text>
          <Text
            style={[
              styles.title,
              {
                fontSize: r.scale(13.5),
                lineHeight: r.scale(18),
                minHeight: r.scale(36),
              },
            ]}
            numberOfLines={2}
          >
            {product.title}
          </Text>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { fontSize: r.scale(15) }]}>
              {product.price} MAD
            </Text>
            {product.originalPrice && product.originalPrice > product.price ? (
              <Text
                style={[styles.priceOriginal, { fontSize: r.scale(11) }]}
              >
                {product.originalPrice} MAD
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      <CheckoutSheet
        visible={open}
        product={product}
        settings={settings}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e7e3d8",
    overflow: "hidden",
  },
  thumb: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  emoji: {
    fontSize: 56,
  },
  // `padding` set inline (driven by useResponsive).
  body: {
    gap: 4,
  },
  brand: {
    fontFamily: "PlusJakartaSans_700Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#0c9281",
    includeFontPadding: false,
  },
  title: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#0d1126",
    includeFontPadding: false,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginTop: 2,
  },
  price: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    color: "#0d1126",
    includeFontPadding: false,
  },
  priceOriginal: {
    fontFamily: "PlusJakartaSans_500Medium",
    color: "#5b6379",
    textDecorationLine: "line-through",
    includeFontPadding: false,
  },
  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#0d1126",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  newText: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 9,
    letterSpacing: 1,
    color: "#ffffff",
    includeFontPadding: false,
  },
  savingsBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#11b79f",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  savingsText: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 10,
    letterSpacing: 0.4,
    color: "#ffffff",
    includeFontPadding: false,
  },
  soldBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#0d1126",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  soldText: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 10,
    letterSpacing: 1,
    color: "#ffffff",
    includeFontPadding: false,
  },
});
