import type { Locale } from "@/lib/i18n/translations";

const en = {
  page: "Page",
  to: "to",
  of: "of",
  pageSizeSelectorLabel: "Page Size:",
  noRowsToShow: "No rows to show",
  loadingOoo: "Loading...",
  firstPage: "First Page",
  previousPage: "Previous Page",
  nextPage: "Next Page",
  lastPage: "Last Page",
};

const es = {
  page: "Página",
  to: "a",
  of: "de",
  pageSizeSelectorLabel: "Tamaño de página:",
  noRowsToShow: "Sin filas que mostrar",
  loadingOoo: "Cargando...",
  firstPage: "Primera página",
  previousPage: "Página anterior",
  nextPage: "Página siguiente",
  lastPage: "Última página",
};

export function getAgGridLocale(locale: Locale) {
  return locale === "es" ? es : en;
}
