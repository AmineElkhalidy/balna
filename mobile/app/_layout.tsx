import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import * as SplashScreen from "expo-splash-screen";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts as useJakarta,
} from "@expo-google-fonts/plus-jakarta-sans";
import {
  Cairo_400Regular,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  useFonts as useCairo,
} from "@expo-google-fonts/cairo";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LocaleProvider } from "@/lib/i18n/LocaleContext";

// Hold the splash screen until fonts + locale are ready. Failure of the
// `preventAutoHideAsync` call (e.g. when the splash plugin isn't running on
// web) is non-fatal, so we swallow it.
SplashScreen.preventAutoHideAsync().catch(() => {});

// Cream background under any system UI gaps (gesture-nav home indicator on
// Android 10+, or the area behind translucent status bars).
SystemUI.setBackgroundColorAsync("#fbf9f5").catch(() => {});

export default function RootLayout() {
  // Load both font families in parallel — the cream/teal landing splash
  // covers the brief async window before the bundle is interactive.
  const [jakartaLoaded, jakartaErr] = useJakarta({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [cairoLoaded, cairoErr] = useCairo({
    Cairo_400Regular,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });

  const ready = jakartaLoaded && cairoLoaded;

  useEffect(() => {
    if (ready || jakartaErr || cairoErr) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, jakartaErr, cairoErr]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LocaleProvider>
          <StatusBar style="dark" />
          {/*
            Custom Header is rendered per-screen; the Stack below is
            headerless so we control look and feel completely.
          */}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fbf9f5" },
              animation: "fade",
            }}
          />
        </LocaleProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
