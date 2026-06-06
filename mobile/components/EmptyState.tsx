import { View, Text, Pressable, Linking, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useDict } from "@/lib/i18n/LocaleContext";
import { useResponsive } from "@/lib/useResponsive";
import type { SiteSettings } from "@/lib/sanity/products";
import { Ionicon } from "./icons/Ionicon";

interface EmptyStateProps {
  isFiltered: boolean;
  settings: SiteSettings | null;
  onClear?: () => void;
}

/**
 * Two-flavour empty state:
 *
 *  - `isFiltered === false` → "Our first drop is on its way" + WhatsApp CTA.
 *    Used when the dataset itself is empty (Sanity unconfigured or zero
 *    published products).
 *
 *  - `isFiltered === true`  → "Nothing matches that yet" + Clear filters
 *    + Take the quiz. Used when filters exclude everything.
 */
export function EmptyState({ isFiltered, settings, onClear }: EmptyStateProps) {
  const dict = useDict();
  const router = useRouter();
  const r = useResponsive();
  const e = dict.home.emptyState;

  const phone = settings?.whatsappNumber;
  const waHref = phone ? `https://wa.me/${phone.replace(/\D/g, "")}` : null;

  return (
    <View
      style={[
        styles.wrap,
        {
          // Stretch to fill the available width, constrained by maxWidth so
          // it doesn't look barren on tablets. marginHorizontal provides
          // breathing room on both sides.
          alignSelf: "stretch",
          maxWidth: r.contentMaxWidth,
          marginHorizontal: r.pageGutter,
          marginTop: r.isCompact ? 16 : 24,
          padding: r.isCompact ? 20 : 28,
        },
      ]}
    >
      <Text style={[styles.icon, { fontSize: r.isCompact ? 44 : 56 }]}>
        {isFiltered ? "🪧" : "🧵"}
      </Text>
      <Text style={styles.eyebrow}>{e.eyebrow}</Text>
      <Text style={[styles.title, { fontSize: r.scale(r.isCompact ? 18 : 22) }]}>
        {isFiltered ? e.titleFiltered : e.titleAll}
      </Text>
      <Text style={[styles.body, { fontSize: r.scale(13) }]}>
        {isFiltered ? e.bodyFiltered : e.bodyAll}
      </Text>

      <View style={[styles.actions, r.isCompact && styles.actionsCompact]}>
        {isFiltered ? (
          <>
            <Pressable
              onPress={onClear}
              style={({ pressed }) => [
                styles.btnSecondary,
                r.isCompact && styles.btnFull,
                pressed && { backgroundColor: "#f3efe5" },
              ]}
            >
              <Text style={styles.btnSecondaryText}>{e.clearAll}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/quiz")}
              style={({ pressed }) => [
                styles.btnPrimary,
                r.isCompact && styles.btnFull,
                pressed && { backgroundColor: "#0f1d3d" },
              ]}
            >
              <Text style={styles.btnPrimaryText}>{e.tryQuiz}</Text>
            </Pressable>
          </>
        ) : (
          waHref && (
            <Pressable
              onPress={() => Linking.openURL(waHref)}
              style={({ pressed }) => [
                styles.btnWhatsApp,
                r.isCompact && styles.btnFull,
                pressed && { backgroundColor: "#1ebd5b" },
              ]}
            >
              <Ionicon name="logo-whatsapp" size={18} color="#ffffff" />
              <Text style={styles.btnPrimaryText}>{e.whatsappCta}</Text>
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // `marginTop`, `padding`, `marginHorizontal` set inline (driven by useResponsive).
  wrap: {
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#e7e3d8",
    backgroundColor: "#ffffff",
    alignItems: "center",
  },
  icon: {
    // fontSize set inline (r.isCompact ? 44 : 56)
  },
  eyebrow: {
    marginTop: 14,
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#0c9281",
    includeFontPadding: false,
  },
  title: {
    marginTop: 8,
    fontFamily: "PlusJakartaSans_800ExtraBold",
    fontSize: 22,
    textAlign: "center",
    color: "#0d1126",
    includeFontPadding: false,
  },
  body: {
    marginTop: 8,
    fontFamily: "PlusJakartaSans_500Medium",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#5b6379",
    includeFontPadding: false,
  },
  actions: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  actionsCompact: {
    flexDirection: "column",
    alignItems: "stretch",
    width: "100%",
  },
  btnFull: {
    width: "100%",
  },
  btnPrimary: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#1a2a52",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  btnPrimaryText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
    color: "#ffffff",
    includeFontPadding: false,
  },
  btnSecondary: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e7e3d8",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    fontFamily: "PlusJakartaSans_700Bold",
    fontSize: 14,
    color: "#0d1126",
    includeFontPadding: false,
  },
  btnWhatsApp: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#25d366",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
