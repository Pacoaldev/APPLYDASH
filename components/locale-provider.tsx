"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translations, type Locale } from "@/lib/i18n/translations";

const STORAGE_KEY = "applydash-locale";

type Messages = (typeof translations)[Locale];

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
  mounted: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "es") setLocaleState(stored);
    } catch {
      // ponytail: ignore blocked storage
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ponytail: ignore
    }
  }, []);

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, t: translations[locale], mounted }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
