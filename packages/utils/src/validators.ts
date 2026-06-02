/**
 * Common Zod-compatible validators and reusable validation helpers.
 */

/** Checks if a string is a valid decimal currency amount */
export function isValidCurrencyString(value: string): boolean {
  return /^\d+(\.\d{1,2})?$/.test(value)
}

/** Checks if a string is a non-empty UUID or slug */
export function isValidId(value: string): boolean {
  return value.trim().length > 0
}

/** Checks if a value is a valid positive number */
export function isPositive(value: number): boolean {
  return value > 0
}
