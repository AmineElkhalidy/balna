import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocale } from "./useLocale";
import { getDictionary, type Dictionary, type Locale } from "./index";

interface LocaleContextValue {
  locale: Locale;
  dict: Dictionary;
  setLocale: (next: Locale) => Promise<void> | void;
  isReady: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/**
 * Wraps the app so any screen / component can read the active locale and
 * its corresponding dictionary in O(1) without prop-drilling. Pairs with
 * `useLocaleCtx()` and `useDict()` below.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const { locale, setLocale, isReady } = useLocale();
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dict: getDictionary(locale),
      setLocale,
      isReady,
    }),
    [locale, setLocale, isReady],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocaleCtx(): LocaleContextValue {
  const v = useContext(LocaleContext);
  if (!v) {
    throw new Error("useLocaleCtx must be used inside <LocaleProvider>.");
  }
  return v;
}

/** Convenience: just the dictionary, when callers don't need the locale. */
export function useDict(): Dictionary {
  return useLocaleCtx().dict;
}
