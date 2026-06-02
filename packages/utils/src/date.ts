import { format, parseISO, formatDistanceToNow, isValid } from "date-fns"
import { tr, enUS, ar } from "date-fns/locale"

type SupportedLocale = "tr" | "en" | "ar"

const LOCALE_MAP = {
  tr,
  en: enUS,
  ar,
}

/**
 * Parses an RFC 3339 / ISO 8601 date string from the backend.
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = parseISO(dateString)
    return isValid(date) ? date : null
  } catch {
    return null
  }
}

/**
 * Formats a date for display. Uses locale-aware formatting.
 *
 * @example
 * formatDate("2024-06-15T14:30:00Z", "tr") // "15 Haz 2024"
 * formatDate("2024-06-15T14:30:00Z", "ar") // "١٥ يونيو ٢٠٢٤"
 */
export function formatDate(
  dateString: string,
  locale: SupportedLocale = "tr",
  pattern: string = "dd MMM yyyy",
): string {
  const date = parseDate(dateString)
  if (!date) return "-"

  return format(date, pattern, { locale: LOCALE_MAP[locale] })
}

/**
 * Formats a datetime for display.
 */
export function formatDateTime(
  dateString: string,
  locale: SupportedLocale = "tr",
): string {
  return formatDate(dateString, locale, "dd MMM yyyy, HH:mm")
}

/**
 * Returns relative time string ("2 saat önce" etc.)
 */
export function formatRelativeTime(
  dateString: string,
  locale: SupportedLocale = "tr",
): string {
  const date = parseDate(dateString)
  if (!date) return "-"

  return formatDistanceToNow(date, {
    addSuffix: true,
    locale: LOCALE_MAP[locale],
  })
}

/**
 * Converts a Date to RFC 3339 string for API requests.
 */
export function toRFC3339(date: Date): string {
  return date.toISOString()
}
