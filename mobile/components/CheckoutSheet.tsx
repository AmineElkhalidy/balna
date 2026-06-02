import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useDict } from "@/lib/i18n/LocaleContext";
import { format } from "@/lib/i18n";
import type { Product } from "@/lib/catalog";
import { ACCESSORIES_SIZE } from "@/lib/catalog";
import type { SiteSettings } from "@/lib/sanity/products";
import { useResponsive } from "@/lib/useResponsive";
import { buildRefCode, openWhatsAppOrder } from "@/lib/whatsapp";
import { Ionicon } from "./icons/Ionicon";

interface CheckoutSheetProps {
  visible: boolean;
  product: Product;
  settings: SiteSettings | null;
  onClose: () => void;
}

/**
 * Checkout flow as a bottom sheet. Two tabs:
 *   1. WhatsApp — composes the same message the web sends and deep-links
 *      into the WhatsApp app (falls back to wa.me on the browser).
 *   2. Bank transfer — shows the IBAN/SWIFT/instructions from Sanity site
 *      settings, with copy-to-clipboard helpers.
 *
 * Sizes: the user can multi-select sizes before submitting; if none are
 * picked we just send the product without a size line, matching the web.
 */
export function CheckoutSheet({
  visible,
  product,
  settings,
  onClose,
}: CheckoutSheetProps) {
  const dict = useDict();
  const r = useResponsive();
  const [tab, setTab] = useState<"whatsapp" | "bank">("whatsapp");
  const [pickedSizes, setPickedSizes] = useState<string[]>([]);
  const refCode = useMemo(() => buildRefCode(product.id), [product.id]);

  // Cap the body scroll at half the viewport (or 420 dp on small phones)
  // so the sheet never grows past the available real estate.
  const bodyMaxHeight = Math.min(420, Math.round(r.height * 0.5));
  // On tablets / landscape, the sheet is centred with a max width so it
  // doesn't stretch to fill a 1000-pixel canvas.
  const isWide = r.isTablet || r.isWide || r.isLandscape;

  const isAccessory =
    product.sizes.length === 1 && product.sizes[0] === ACCESSORIES_SIZE;

  const phone = settings?.whatsappNumber;
  const bank = settings?.bankTransfer ?? null;

  function toggleSize(s: string) {
    setPickedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  async function onWhatsApp() {
    if (!phone) return;
    await openWhatsAppOrder({
      phone,
      product,
      selectedSizes: pickedSizes,
      dict,
      refCode,
    });
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={[
          styles.backdrop,
          // Centre the sheet horizontally on wide screens. On phones we
          // keep the default behaviour where it docks to the bottom edge.
          isWide && {
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          style={[
            styles.sheet,
            isWide && {
              width: r.modalMaxWidth,
              maxWidth: "100%",
              borderRadius: 28,
            },
          ]}
          accessibilityViewIsModal
        >
          {/* Header strip */}
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.brand}>{product.brand}</Text>
              <Text style={styles.title} numberOfLines={2}>
                {product.title}
              </Text>
              <Text style={styles.price}>{product.price} MAD</Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityLabel={dict.checkout.close}
              hitSlop={12}
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: pressed ? "#f3efe5" : "transparent",
              })}
            >
              <Ionicon name="close" size={20} color="#0d1126" />
            </Pressable>
          </View>

          {/* Sizes — only when not a single-size accessory */}
          {!isAccessory ? (
            <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
              <Text style={styles.sectionLabel}>{dict.size.label}</Text>
              <View style={styles.sizeRow}>
                {product.sizes.map((s) => {
                  const active = pickedSizes.includes(s);
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => toggleSize(s)}
                      style={[styles.sizeChip, active && styles.sizeChipActive]}
                    >
                      <Text
                        style={[
                          styles.sizeChipText,
                          active && styles.sizeChipTextActive,
                        ]}
                      >
                        {s}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Tabs */}
          <View style={styles.tabRow}>
            <TabButton
              label={dict.checkout.tabs.whatsapp}
              active={tab === "whatsapp"}
              onPress={() => setTab("whatsapp")}
            />
            <TabButton
              label={dict.checkout.tabs.bank}
              active={tab === "bank"}
              onPress={() => setTab("bank")}
            />
          </View>

          <ScrollView
            style={{ maxHeight: bodyMaxHeight }}
            contentContainerStyle={{ padding: 20 }}
          >
            {tab === "whatsapp" ? (
              <WhatsAppPanel
                bodyText={dict.checkout.whatsapp.body}
                ctaText={dict.checkout.whatsapp.cta}
                onPress={onWhatsApp}
                disabled={!phone}
              />
            ) : (
              <BankPanel
                bank={bank}
                refCode={refCode}
                dict={dict}
                onCopy={(value) => Clipboard.setStringAsync(value)}
              />
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {format(dict.checkout.referenceFooter, { ref: refCode })}
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ─── Sub-components ────────────────────────────────────────────────────── */

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tabBtn,
        active && styles.tabBtnActive,
        !active && pressed && { backgroundColor: "#f3efe5" },
      ]}
    >
      <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function WhatsAppPanel({
  bodyText,
  ctaText,
  onPress,
  disabled,
}: {
  bodyText: string;
  ctaText: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.bodyText}>{bodyText}</Text>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => ({
          height: 52,
          borderRadius: 999,
          backgroundColor: disabled
            ? "#bfd9c9"
            : pressed
              ? "#1ebd5b"
              : "#25d366",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        })}
      >
        <Ionicon name="logo-whatsapp" size={22} color="#ffffff" />
        <Text style={styles.ctaText}>{ctaText}</Text>
      </Pressable>
    </View>
  );
}

function BankPanel({
  bank,
  refCode,
  dict,
  onCopy,
}: {
  bank: NonNullable<SiteSettings["bankTransfer"]> | null;
  refCode: string;
  dict: ReturnType<typeof useDict>;
  onCopy: (v: string) => void;
}) {
  if (!bank) {
    return (
      <Text style={[styles.bodyText, { color: "#5b6379" }]}>
        {dict.checkout.bank.unavailable}
      </Text>
    );
  }

  const rows: Array<{ label: string; value: string; copy?: boolean }> = [
    { label: dict.checkout.bank.bankName, value: bank.bankName },
    { label: dict.checkout.bank.accountHolder, value: bank.accountHolder },
    { label: dict.checkout.bank.iban, value: bank.iban, copy: true },
    { label: dict.checkout.bank.swift, value: bank.swift, copy: true },
    { label: dict.checkout.bank.reference, value: refCode, copy: true },
  ].filter((r) => r.value);

  return (
    <View style={{ gap: 12 }}>
      {rows.map((row) => (
        <View key={row.label} style={styles.bankRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bankLabel}>{row.label}</Text>
            <Text style={styles.bankValue}>{row.value}</Text>
          </View>
          {row.copy ? (
            <Pressable
              onPress={() => onCopy(row.value)}
              hitSlop={6}
              style={({ pressed }) => ({
                paddingHorizontal: 12,
                height: 32,
                borderRadius: 999,
                backgroundColor: pressed ? "#d8f0e8" : "#e9f8f4",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Text
                style={{
                  fontFamily: "PlusJakartaSans_700Bold",
                  fontSize: 12,
                  color: "#0c9281",
                  includeFontPadding: false,
                }}
              >
                {dict.checkout.bank.copy}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ))}
      {bank.instructions ? (
        <Text style={[styles.bodyText, { color: "#5b6379" }]}>
          {bank.instructions}
        </Text>
      ) : null}
    </View>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(13,17,38,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  brand: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#0c9281",
    includeFontPadding: false,
  },
  title: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 18,
    color: "#0d1126",
    marginTop: 4,
    includeFontPadding: false,
  },
  price: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 18,
    color: "#0d1126",
    marginTop: 6,
    includeFontPadding: false,
  },
  sectionLabel: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#5b6379",
    marginBottom: 8,
    includeFontPadding: false,
  },
  sizeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeChip: {
    minWidth: 48,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e7e3d8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  sizeChipActive: {
    backgroundColor: "#0d1126",
    borderColor: "#0d1126",
  },
  sizeChipText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 13,
    color: "#0d1126",
    includeFontPadding: false,
  },
  sizeChipTextActive: {
    color: "#ffffff",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#f3efe5",
    margin: 20,
    marginTop: 4,
    padding: 4,
    borderRadius: 999,
  },
  tabBtn: {
    flex: 1,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
  },
  tabBtnActive: {
    backgroundColor: "#ffffff",
  },
  tabBtnText: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    color: "#5b6379",
    includeFontPadding: false,
  },
  tabBtnTextActive: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0d1126",
  },
  bodyText: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 14,
    lineHeight: 21,
    color: "#0d1126",
    includeFontPadding: false,
  },
  ctaText: {
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 15,
    color: "#ffffff",
    includeFontPadding: false,
  },
  bankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#f3efe5",
    borderBottomWidth: 1,
    gap: 10,
  },
  bankLabel: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: "#5b6379",
    includeFontPadding: false,
  },
  bankValue: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
    color: "#0d1126",
    marginTop: 2,
    includeFontPadding: false,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 4,
    backgroundColor: "#fbf9f5",
  },
  footerText: {
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 11,
    color: "#5b6379",
    textAlign: "center",
    includeFontPadding: false,
  },
});
