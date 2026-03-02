/**
 * numberFormatter
 *
 * Utilities for formatting large numbers into concise human-readable strings.
 * Follows common conventions: 1 000 → "1K", 1 500 000 → "1.5M".
 */

/**
 * Formats a number into a concise abbreviated string.
 *
 * - Numbers ≥ 1 000 000 are expressed in millions (e.g. `"1.5M"`)
 * - Numbers ≥ 1 000 are expressed in thousands (e.g. `"12.3K"`)
 * - Smaller numbers are returned as plain strings (e.g. `"999"`)
 *
 * @param num - The number to format
 * @returns Abbreviated string representation
 *
 * @example
 * ```typescript
 * formatNumber(1500000); // '1.5M'
 * formatNumber(12345);   // '12.3K'
 * formatNumber(999);     // '999'
 * ```
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(num);
}
