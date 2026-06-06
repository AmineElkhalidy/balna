import { View, Pressable, Text } from "react-native";
import { useDict } from "@/lib/i18n/LocaleContext";
import { AUDIENCES, type Audience } from "@/lib/catalog";

interface AudienceTabsProps {
  selected: Audience | null;
  onChange: (next: Audience | null) => void;
}

/**
 * Top-level audience navigation: All / Men / Kids.
 *
 * Renders as a pill-group with the active tab in white-on-grey. Tapping
 * a tab is purely local state on mobile — no URL writes, no full reloads,
 * just instantaneous filter updates handled by the catalog screen.
 */
export function AudienceTabs({ selected, onChange }: AudienceTabsProps) {
  const dict = useDict();

  const tabs: Array<{ key: Audience | null; label: string }> = [
    { key: null, label: dict.header.audienceAll },
    ...AUDIENCES.map((a) => ({ key: a, label: dict.audience[a] })),
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f3efe5",
        borderRadius: 999,
        padding: 4,
        // Fill the width of the header row so tabs are evenly distributed
        alignSelf: "stretch",
      }}
    >
      {tabs.map(({ key, label }) => {
        const active =
          key === null ? selected === null : selected === key;
        return (
          <Pressable
            key={key ?? "all"}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => ({
              flex: 1,
              paddingHorizontal: 8,
              height: 32,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active
                ? "#ffffff"
                : pressed
                  ? "#e7e3d8"
                  : "transparent",
            })}
          >
            <Text
              style={{
                fontFamily: active
                  ? "PlusJakartaSans_700Bold"
                  : "PlusJakartaSans_600SemiBold",
                fontSize: 13,
                color: active ? "#0d1126" : "#5b6379",
                includeFontPadding: false,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
