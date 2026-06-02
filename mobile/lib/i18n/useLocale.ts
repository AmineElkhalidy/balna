import { useCallback, useEffect, useState } from "react";
import { I18nManager } from "react-native";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./index";

const STORAGE_KEY = "minor_locale";

/**
 * Resolves the active locale and exposes a setter that persists the choice
 * and flips RTL via `I18nManager`. Switching languages requires a JS reload
 * for the layout direction to swap correctly — the caller is expected to
 * trigger that reload (e.g. via `expo-updates`'s `Updates.reloadAsync()`,
 * or simply by remounting the app root for dev).
 *
 * Resolution order on first launch:
 *   1. AsyncStorage (previous user choice)
 *   2. Device's primary language via expo-localization
 *   3. DEFAULT_LOCALE
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isReady, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (!cancelled && isLocale(saved)) {
          setLocaleState(saved);
          syncRtl(saved);
          setReady(true);
          return;
        }
      } catch {
        // Storage errors are non-fatal — fall through to device detection.
      }

      const device = (Localization.getLocales()[0]?.languageCode ??
        "en") as string;
      const resolved: Locale = device.startsWith("ar") ? "ar" : "en";
      if (!cancelled) {
        setLocaleState(resolved);
        syncRtl(resolved);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setLocale = useCallback(async (next: Locale) => {
    setLocaleState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Same fallback rationale as above — non-fatal.
    }
    syncRtl(next);
  }, []);

  return { locale, setLocale, isReady };
}

function syncRtl(locale: Locale) {
  const wantRtl = locale === "ar";
  if (I18nManager.isRTL !== wantRtl) {
    I18nManager.allowRTL(wantRtl);
    I18nManager.forceRTL(wantRtl);
    // The caller decides whether to reload (production: reloadAsync;
    // dev: live-reload picks it up on the next bundler refresh).
  }
}
