import { useTranslation } from "@erp/i18n"
import { formatCurrency, formatDate, formatDateTime, formatRelativeTime } from "@erp/utils"
import type { Language } from "./stores/ui.store"

const LOCALE_MAP: Record<Language, string> = {
  tr: "tr-TR",
  en: "en-US",
  ar: "ar-SA",
}

/**
 * Returns locale-aware formatting helpers.
 * Always reads the current language from i18n — no manual locale passing needed.
 *
 * @example
 * const { formatCurrency, formatDate } = useLocaleFormat()
 * formatCurrency("1250.50", "TRY") // "₺1.250,50" in tr, "$1,250.50" in en
 */
export function useLocaleFormat() {
  const { i18n } = useTranslation()
  const lang = (i18n.language ?? "tr") as Language
  const locale = LOCALE_MAP[lang] ?? "tr-TR"

  return {
    formatCurrency: (amount: string, currency: string = "TRY") =>
      formatCurrency(amount, currency, locale),

    formatDate: (dateString: string) => formatDate(dateString, lang),

    formatDateTime: (dateString: string) => formatDateTime(dateString, lang),

    formatRelativeTime: (dateString: string) => formatRelativeTime(dateString, lang),
  }
}
