import { View, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { Wordmark } from "./Wordmark";
import { LangSwitcher } from "./LangSwitcher";
import { AudienceTabs } from "./AudienceTabs";
import { useDict } from "@/lib/i18n/LocaleContext";
import { useResponsive } from "@/lib/useResponsive";
import type { Audience } from "@/lib/catalog";
import { Ionicon } from "./icons/Ionicon";

interface HeaderProps {
  variant?: "catalog" | "minimal";
  selectedAudience?: Audience | null;
  onAudienceChange?: (next: Audience | null) => void;
  /** Optional custom right-side action (e.g. "Back to browse"). */
  rightAction?: React.ReactNode;
}

/**
 * Sticky brand header. Lives at the top of every screen.
 *
 * - `variant="catalog"` → full nav: wordmark + audience tabs + Quick-find
 *   pill + lang switcher. Used on the catalog (home) screen.
 * - `variant="minimal"` → just wordmark + optional right action + lang
 *   switcher. Used on /quiz so the header isn't busy mid-flow.
 */
export function Header({
  variant = "catalog",
  selectedAudience,
  onAudienceChange,
  rightAction,
}: HeaderProps) {
  const dict = useDict();
  const router = useRouter();
  const r = useResponsive();

  // On really compact phones the wordmark + Quick-find label + lang pill
  // can squeeze each other. Two graceful fallbacks:
  //   1. Wordmark shrinks one step (`sm`) on compact screens.
  //   2. Quick-find collapses to icon-only on compact screens.
  // On tablets we go the other way and use the larger wordmark variant.
  const wordmarkSize = r.isCompact ? "sm" : r.isTablet || r.isWide ? "lg" : "md";
  const compactQuickFind = r.isCompact;

  return (
    <View
      // NB: avoid `bg-white/80` and `shadow-*` here — those are the
      // NativeWind + Expo Router CSS-interop race-condition triggers in
      // root layouts. We use a plain solid colour + a hairline border.
      style={{
        backgroundColor: "#ffffff",
        borderBottomColor: "#e7e3d8",
        borderBottomWidth: 1,
      }}
    >
      {/* Top row: wordmark on the start side, actions on the end side. */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: r.pageGutter,
          paddingVertical: r.isCompact ? r.scale(8) : r.scale(12),
          gap: r.scale(10),
        }}
      >
        <Pressable
          onPress={() => router.push("/")}
          accessibilityRole="link"
          accessibilityLabel={dict.header.homeAria}
          hitSlop={8}
        >
          <Wordmark size={wordmarkSize} />
        </Pressable>

        <View style={{ flex: 1 }} />

        {variant === "catalog" ? (
          <>
            <Pressable
              onPress={() => router.push("/quiz")}
              accessibilityRole="link"
              accessibilityLabel={dict.header.quickFindAria}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                backgroundColor: pressed ? "#d8f0e8" : "#e9f8f4",
                paddingHorizontal: compactQuickFind ? 0 : 12,
                width: compactQuickFind ? 36 : undefined,
                height: 36,
                borderRadius: 999,
                justifyContent: "center",
              })}
            >
              <Ionicon name="sparkles" size={14} color="#0c9281" />
              {compactQuickFind ? null : (
                <Text
                  style={{
                    fontFamily: "PlusJakartaSans_700Bold",
                    color: "#0c9281",
                    fontSize: r.scale(13),
                    includeFontPadding: false,
                  }}
                >
                  {dict.header.quickFind}
                </Text>
              )}
            </Pressable>
            <LangSwitcher />
          </>
        ) : (
          <>
            {rightAction}
            <LangSwitcher />
          </>
        )}
      </View>

      {variant === "catalog" && (
        <View
          style={{
            paddingHorizontal: r.pageGutter,
            paddingBottom: r.isCompact ? r.scale(8) : r.scale(12),
            borderTopColor: "#f3efe5",
            borderTopWidth: 1,
            paddingTop: r.isCompact ? r.scale(6) : r.scale(10),
          }}
        >
          <AudienceTabs
            selected={selectedAudience ?? null}
            onChange={onAudienceChange ?? (() => {})}
          />
        </View>
      )}
    </View>
  );
}
