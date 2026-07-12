"use client";

import { useLocale } from "@/components/locale-provider";
import type { Locale } from "@/lib/i18n/translations";

export function LocaleToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t, mounted } = useLocale();

  if (!mounted) return null;

  const next: Locale = locale === "en" ? "es" : "en";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      title={t.locale[next]}
      className={`inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-2 text-xs font-semibold text-foreground transition hover:bg-accent ${className}`}
    >
      {locale.toUpperCase()}
    </button>
  );
}
