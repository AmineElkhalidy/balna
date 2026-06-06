import { ScrollView, Pressable, Text, View } from "react-native";
import { CATEGORIES, CATEGORY_EMOJI, type Category } from "@/lib/catalog";
import { useDict } from "@/lib/i18n/LocaleContext";
import { useResponsive } from "@/lib/useResponsive";

interface CategoryFilterProps {
  selected: Category | null;
  onChange: (next: Category | null) => void;
}

/**
 * Horizontally scrollable category chips — All / Shoes / Jackets / …
 *
 * Mirrors the web's filter rail. Active chip gets a teal fill so the
 * shopper always sees what's currently scoping the grid.
 */
export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const dict = useDict();
  const r = useResponsive();

  const chips: Array<{
    key: Category | null;
    label: string;
    emoji: string | null;
  }> = [
    { key: null, label: dict.home.categoryAll, emoji: null },
    ...CATEGORIES.map((c) => ({
      key: c,
      label: dict.category[c],
      emoji: CATEGORY_EMOJI[c],
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: r.pageGutter,
        gap: 8,
        flexDirection: "row",
      }}
    >
      {chips.map(({ key, label, emoji }) => {
        const active =
          key === null ? selected === null : selected === key;
        return (
          <Pressable
            key={key ?? "all"}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              height: r.scale(36),
              paddingHorizontal: r.isCompact ? 10 : 14,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: active ? "#11b79f" : "#e7e3d8",
              backgroundColor: active
                ? "#11b79f"
                : pressed
                  ? "#f3efe5"
                  : "#ffffff",
            })}
          >
            {emoji ? <Text style={{ fontSize: r.scale(13) }}>{emoji}</Text> : null}
            <Text
              style={{
                fontFamily: "PlusJakartaSans_700Bold",
                fontSize: r.scale(12),
                color: active ? "#ffffff" : "#0d1126",
                includeFontPadding: false,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
      <View style={{ width: 4 }} />
    </ScrollView>
  );
}
