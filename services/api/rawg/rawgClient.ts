/**
 * rawgClient
 *
 * Base HTTP client for the RAWG API.
 * Provides authenticated fetch, in-memory caching, and abort controller management
 * shared by all RAWG service modules.
 */

import type { GameFilters } from '@/types';

const BASE_URL = 'https://api.rawg.io/api';

/** Lazily reads the RAWG API key from the Vite environment. */
const getKey = () => (import.meta.env.VITE_RAWG_API_KEY as string) ?? '';

// ── In-memory cache ──────────────────────────────────────────────────────────
/** Cache keyed by fully-qualified request URL (including API key + query params). */
const cache = new Map<string, unknown>();

/**
 * Makes an authenticated GET request to the RAWG API.
 * Results are cached in-memory by full URL so identical requests are never
 * sent twice within the same browser session.
 *
 * @param path - API path relative to base URL (e.g. `'/games'`)
 * @param params - Query parameters to append to the request URL
 * @param signal - Optional `AbortSignal` for cancelling in-flight requests
 * @returns Parsed JSON response typed as `T`
 * @throws {Error} When the HTTP response status is not OK
 *
 * @example
 * ```typescript
 * const data = await rawgFetch<RawgListResponse<RawgGame>>('/games', { search: 'portal' });
 * ```
 */
export async function rawgFetch<T>(
  path: string,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<T> {
  const key = getKey();
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('key', key);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }

  const cacheKey = url.toString();
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as T;
  }

  const response = await fetch(url.toString(), { signal });
  if (!response.ok) {
    throw new Error(`RAWG API error: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as T;
  cache.set(cacheKey, data);
  return data;
}

// ── Abort controller management ──────────────────────────────────────────────
/** Active AbortControllers keyed by operation name. */
const controllers = new Map<string, AbortController>();

/**
 * Returns an `AbortSignal` for the given operation key, cancelling any previous
 * in-flight request registered under the same key.
 *
 * This pattern ensures that only the most recent request for a given operation
 * (e.g. a typeahead query) is active at any time.
 *
 * @param key - Unique identifier for the operation (e.g. `'typeahead'`)
 * @returns `AbortSignal` that will be aborted when the next call for this key runs
 *
 * @example
 * ```typescript
 * const signal = getController('typeahead');
 * const data = await rawgFetch('/games', { search: query }, signal);
 * ```
 */
export function getController(key: string): AbortSignal {
  const prev = controllers.get(key);
  if (prev) prev.abort();
  const next = new AbortController();
  controllers.set(key, next);
  return next.signal;
}

/**
 * Mutates a params object by appending filter values from a `GameFilters` object.
 * Only non-empty filter arrays and defined ordering are applied.
 *
 * @param params - The query-params object to mutate in place
 * @param filters - Filter values to apply (platforms, genres, tags, ordering)
 *
 * @example
 * ```typescript
 * const params: Record<string, string | number> = { search: 'portal' };
 * applyFilters(params, { platforms: [4], genres: [51] });
 * // params.platforms === '4', params.genres === '51'
 * ```
 */
export function applyFilters(
  params: Record<string, string | number>,
  filters: GameFilters,
): void {
  if (filters.platforms && filters.platforms.length > 0) {
    params.platforms = filters.platforms.join(',');
  }
  if (filters.genres && filters.genres.length > 0) {
    params.genres = filters.genres.join(',');
  }
  if (filters.tags && filters.tags.length > 0) {
    params.tags = filters.tags.join(',');
  }
  if (filters.ordering) {
    params.ordering = filters.ordering;
  }
}
