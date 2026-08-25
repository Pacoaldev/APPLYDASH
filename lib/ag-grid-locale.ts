import type { Locale } from "@/lib/i18n/translations";

const en = {
  noRowsToShow: "No rows to show",
  loadingOoo: "Loading...",
};

const es = {
  noRowsToShow: "Sin filas que mostrar",
  loadingOoo: "Cargando...",
};

export function getAgGridLocale(locale: Locale) {
  return locale === "es" ? es : en;
}
