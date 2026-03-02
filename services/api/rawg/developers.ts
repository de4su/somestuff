/**
 * developers
 *
 * RAWG API functions for searching developers and retrieving their games.
 */

import type { RawgDeveloper, RawgListResponse } from '@/types';
import { rawgFetch, getController } from './rawgClient';

/**
 * Searches for game developers by name.
 *
 * Uses an abort controller so only the most recent in-flight request is active,
 * making this safe to call on every keystroke.
 *
 * @param query - The developer name to search for
 * @returns Paginated list of up to 5 matching `RawgDeveloper` objects
 *
 * @example
 * ```typescript
 * const results = await searchDevelopers('valve');
 * console.log(results.results[0].name); // 'Valve'
 * ```
 */
export async function searchDevelopers(
  query: string,
): Promise<RawgListResponse<RawgDeveloper>> {
  const signal = getController('searchDevelopers');
  return rawgFetch<RawgListResponse<RawgDeveloper>>(
    '/developers',
    { search: query, page_size: 5 },
    signal,
  );
}
