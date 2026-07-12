"use client";

import { useLocale } from "@/components/locale-provider";

export function DashboardHeader() {
  const { t } = useLocale();
  return (
    <h1 className="text-xl sm:text-2xl font-extrabold mb-3 leading-tight">
      <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
        ApplyDash
      </span>{" "}
      {t.dashboard.title}
    </h1>
  );
}
