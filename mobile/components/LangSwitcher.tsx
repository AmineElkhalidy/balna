import { Pressable, Text, Alert } from "react-native";
import { useLocaleCtx } from "@/lib/i18n/LocaleContext";
import { LOCALE_META, type Locale } from "@/lib/i18n";

/**
 * Compact EN / AR toggle. Tapping flips the active locale; if the new
 * direction differs (LTR ↔ RTL) we ask the user to relaunch the app so
 * `I18nManager.forceRTL` takes effect — RN can't safely flip layout
 * direction mid-session without a JS reload.
 */
export function LangSwitcher() {
  const { locale, setLocale, dict } = useLocaleCtx();
  const next: Locale = locale === "en" ? "ar" : "en";
  const nextLabel = LOCALE_META[next].label;

  const onPress = async () => {
    const fromRtl = LOCALE_META[locale].dir === "rtl";
    const toRtl = LOCALE_META[next].dir === "rtl";
    await setLocale(next);
    if (fromRtl !== toRtl) {
      Alert.alert(
        dict.header.switchTo
          .replace("{language}", nextLabel)
          .replace(/^./, (c) => c.toUpperCase()),
        "Please relaunch the app to switch direction.",
      );
    }
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={dict.header.switchTo.replace("{language}", nextLabel)}
      style={({ pressed }) => ({
        height: 34,
        minWidth: 48,
        paddingHorizontal: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#e7e3d8",
        backgroundColor: pressed ? "#f3efe5" : "#ffffff",
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <Text
        style={{
          fontFamily: "PlusJakartaSans_700Bold",
          fontSize: 12,
          color: "#0d1126",
          includeFontPadding: false,
        }}
      >
        {nextLabel}
      </Text>
    </Pressable>
  );
}
