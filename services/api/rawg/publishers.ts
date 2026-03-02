/**
 * publishers
 *
 * RAWG API functions for searching publishers and retrieving their games.
 */

import type { RawgPublisher, RawgListResponse } from '@/types';
import { rawgFetch, getController } from './rawgClient';

/**
 * Searches for game publishers by name.
 *
 * Uses an abort controller so only the most recent in-flight request is active,
 * making this safe to call on every keystroke.
 *
 * @param query - The publisher name to search for
 * @returns Paginated list of up to 5 matching `RawgPublisher` objects
 *
 * @example
 * ```typescript
 * const results = await searchPublishers('ubisoft');
 * console.log(results.results[0].name); // 'Ubisoft'
 * ```
 */
export async function searchPublishers(
  query: string,
): Promise<RawgListResponse<RawgPublisher>> {
  const signal = getController('searchPublishers');
  return rawgFetch<RawgListResponse<RawgPublisher>>(
    '/publishers',
    { search: query, page_size: 5 },
    signal,
  );
}
