/**
 * Currency utilities.
 *
 * RULE: Backend always sends/receives amounts as decimal strings ("1250.50").
 * NEVER use float for monetary values.
 */

/**
 * Formats a decimal string amount for display using Intl.NumberFormat.
 * Locale is driven by the current i18n language.
 *
 * @example
 * formatCurrency("1250.50", "TRY", "tr-TR") // "₺1.250,50"
 * formatCurrency("1250.50", "USD", "en-US") // "$1,250.50"
 */
export function formatCurrency(
  amount: string,
  currency: string = "TRY",
  locale: string = "tr-TR",
): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return amount

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Parses a user-input string into a backend-safe decimal string.
 * Strips currency symbols, normalizes decimal separators.
 *
 * @example
 * parseCurrencyInput("1.250,50") // "1250.50"
 * parseCurrencyInput("1,250.50") // "1250.50"
 */
export function parseCurrencyInput(input: string): string {
  const cleaned = input.replace(/[^0-9.,]/g, "")

  // Detect format: if comma comes after dot → English format (1,250.50)
  const lastDot = cleaned.lastIndexOf(".")
  const lastComma = cleaned.lastIndexOf(",")

  let normalized: string
  if (lastDot > lastComma) {
    // English: 1,250.50 → remove commas
    normalized = cleaned.replace(/,/g, "")
  } else {
    // Turkish/European: 1.250,50 → remove dots, replace comma
    normalized = cleaned.replace(/\./g, "").replace(",", ".")
  }

  const parsed = parseFloat(normalized)
  if (isNaN(parsed)) return "0.00"

  return parsed.toFixed(2)
}
