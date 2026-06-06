import { View, Pressable, Text, StyleSheet } from "react-native";
import { useDict } from "@/lib/i18n/LocaleContext";
import { AUDIENCES, type Audience } from "@/lib/catalog";
import { useResponsive } from "@/lib/useResponsive";

interface AudienceTabsProps {
  selected: Audience | null;
  onChange: (next: Audience | null) => void;
}

/**
 * Top-level audience navigation: All / Men / Kids.
 *
 * Renders as a segmented-control pill. Each tab has a generous minWidth so
 * labels never crowd each other — the pill sizes to its content and sits
 * centred in the header row. The active segment gets a white chip with a
 * hairline shadow so the selection is immediately obvious.
 */
export function AudienceTabs({ selected, onChange }: AudienceTabsProps) {
  const dict = useDict();
  const r = useResponsive();

  const tabs: Array<{ key: Audience | null; label: string }> = [
    { key: null, label: dict.header.audienceAll },
    ...AUDIENCES.map((a) => ({ key: a, label: dict.audience[a] })),
  ];

  // Tab font size scales down on tiny phones so the pill still fits.
  const tabFontSize = r.isCompact ? 12 : 13;
  // Minimum horizontal padding per tab — gives enough breathing room so
  // adjacent labels never visually merge.
  const tabPadX = r.isCompact ? 16 : 20;

  return (
    <View style={styles.track}>
      {tabs.map(({ key, label }) => {
        const active = key === null ? selected === null : selected === key;
        return (
          <Pressable
            key={key ?? "all"}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.tab,
              {
                paddingHorizontal: tabPadX,
                // Active chip: white pill that floats above the track.
                backgroundColor: active
                  ? "#ffffff"
                  : pressed
                    ? "#e9e5db"
                    : "transparent",
              },
              // Subtle elevation for the active chip only.
              active && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.label,
                { fontSize: tabFontSize },
                active ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",          // pill sizes to content, sits centred
    backgroundColor: "#f0ece2",
    borderRadius: 999,
    padding: 3,
    gap: 2,                       // small but visible gap between chips
  },
  tab: {
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: {
    // Lifted white chip — visible on both light & dark backgrounds.
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,                 // Android shadow
  },
  label: {
    includeFontPadding: false,
  },
  labelActive: {
    fontFamily: "PlusJakartaSans_700Bold",
    color: "#0d1126",
  },
  labelInactive: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    color: "#5b6379",
  },
});
