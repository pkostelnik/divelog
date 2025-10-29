"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

import { localeOptions, translations, type SupportedLocale } from "@/i18n/translations";

type TranslationContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, defaultValue?: string) => string;
  availableLocales: typeof localeOptions;
};

const I18nContext = createContext<TranslationContextValue | undefined>(undefined);

const STORAGE_KEY = "divelog.locale";
const DEFAULT_LOCALE: SupportedLocale = "de";
export const PREFERRED_LOCALE_EVENT = "divelog:preferred-locale";

function resolveInitialLocale(): SupportedLocale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
  if (stored && stored in translations) {
    return stored;
  }

  const navigatorLocale = window.navigator.language.slice(0, 2) as SupportedLocale;
  if (navigatorLocale && navigatorLocale in translations) {
    return navigatorLocale;
  }

  return DEFAULT_LOCALE;
}

function getTranslation(locale: SupportedLocale, key: string): string | undefined {
  const dictionary = translations[locale];
  if (!dictionary) {
    return undefined;
  }

  if (key in dictionary) {
    return dictionary[key];
  }

  const segments = key.split(".");
  let cursor: unknown = dictionary;
  for (const segment of segments) {
    if (!cursor || typeof cursor !== "object" || !(segment in cursor)) {
      return undefined;
    }
    cursor = (cursor as Record<string, unknown>)[segment];
  }

  return typeof cursor === "string" ? cursor : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    const preferredLocale = resolveInitialLocale();
    setLocaleState((current) => (preferredLocale !== current ? preferredLocale : current));
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handler = (event: Event) => {
      const nextLocale = (event as CustomEvent<SupportedLocale>).detail;
      if (!nextLocale) {
        return;
      }

      setLocaleState((current) => (nextLocale !== current ? nextLocale : current));
    };

    window.addEventListener(PREFERRED_LOCALE_EVENT, handler as EventListener);
    return () => {
      window.removeEventListener(PREFERRED_LOCALE_EVENT, handler as EventListener);
    };
  }, []);

  const setLocale = useCallback((nextLocale: SupportedLocale) => {
    setLocaleState(nextLocale);
  }, []);

  const translate = useCallback(
    (key: string, defaultValue?: string) => {
      const value = getTranslation(locale, key) ?? defaultValue;
      return value ?? key;
    },
    [locale]
  );

  const value = useMemo<TranslationContextValue>(() => ({
    locale,
    setLocale,
    t: translate,
    availableLocales: localeOptions
  }), [locale, setLocale, translate]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}
