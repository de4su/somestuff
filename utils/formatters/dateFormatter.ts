/**
 * dateFormatter
 *
 * Utilities for formatting date strings into human-readable representations.
 */

/**
 * Formats an ISO date string (or any string accepted by `Date`) into a
 * locale-aware long-form date string such as `"January 15, 2024"`.
 *
 * Returns `'Unknown'` when the input is falsy or not a valid date.
 *
 * @param dateString - ISO 8601 date string (e.g. `"2024-01-15"`)
 * @returns Formatted date string (e.g. `"January 15, 2024"`)
 *
 * @example
 * ```typescript
 * formatDate('2024-01-15'); // 'January 15, 2024'
 * formatDate('');           // 'Unknown'
 * ```
 */
export function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Formats an ISO date string as a relative time expression such as
 * `"3 days ago"` or `"2 months ago"` using the browser's `Intl.RelativeTimeFormat` API.
 *
 * Returns `'Unknown'` when the input is falsy or not a valid date.
 *
 * @param dateString - ISO 8601 date string (e.g. `"2024-01-15"`)
 * @returns Relative time string (e.g. `"3 days ago"`, `"2 months ago"`)
 *
 * @example
 * ```typescript
 * formatRelativeTime('2024-01-15'); // '3 months ago'
 * ```
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown';

  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffSecs = Math.round(diffMs / 1_000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  const diffMonths = Math.round(diffDays / 30);
  const diffYears = Math.round(diffDays / 365);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffYears) >= 1) return rtf.format(diffYears, 'year');
  if (Math.abs(diffMonths) >= 1) return rtf.format(diffMonths, 'month');
  if (Math.abs(diffDays) >= 1) return rtf.format(diffDays, 'day');
  if (Math.abs(diffHours) >= 1) return rtf.format(diffHours, 'hour');
  if (Math.abs(diffMins) >= 1) return rtf.format(diffMins, 'minute');
  return rtf.format(diffSecs, 'second');
}
