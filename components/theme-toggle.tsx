"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useLocale } from "@/components/locale-provider";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, cycleTheme, mounted } = useTheme();
  const { t } = useLocale();

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background ${className}`}
        disabled
      />
    );
  }

  const title =
    theme === "dark"
      ? t.theme.light
      : theme === "light"
        ? t.theme.dark
        : t.theme.system;

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={title}
      title={title}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition hover:bg-accent ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400" />
      ) : theme === "light" ? (
        <Moon className="h-4 w-4 text-indigo-600" />
      ) : (
        <Monitor className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}
