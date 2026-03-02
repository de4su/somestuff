/**
 * search
 *
 * RAWG API autocomplete / typeahead helper.
 * Fetches suggestions across games, developers, and publishers in a single call.
 */

import type { RawgGame, RawgDeveloper, RawgPublisher, RawgListResponse } from '@/types';
import { rawgFetch, getController } from './rawgClient';

/**
 * Fetches typeahead suggestions for a search query across three categories:
 * games, developers, and publishers.
 *
 * All three requests share a single `AbortController` so typing quickly cancels
 * the previous batch before issuing a new one.
 *
 * @param query - The partial search string entered by the user
 * @returns Object with arrays of matching games, developers, and publishers
 *
 * @example
 * ```typescript
 * const suggestions = await fetchSuggestions('valve');
 * suggestions.games.forEach(g => console.log(g.name));
 * suggestions.developers.forEach(d => console.log(d.name));
 * suggestions.publishers.forEach(p => console.log(p.name));
 * ```
 */
export async function fetchSuggestions(query: string): Promise<{
  games: RawgGame[];
  developers: RawgDeveloper[];
  publishers: RawgPublisher[];
}> {
  const signal = getController('typeahead');

  const [gamesRes, devsRes, pubsRes] = await Promise.all([
    rawgFetch<RawgListResponse<RawgGame>>(
      '/games',
      { search: query, page_size: 5 },
      signal,
    ),
    rawgFetch<RawgListResponse<RawgDeveloper>>(
      '/developers',
      { search: query, page_size: 3 },
      signal,
    ),
    rawgFetch<RawgListResponse<RawgPublisher>>(
      '/publishers',
      { search: query, page_size: 3 },
      signal,
    ),
  ]);

  return {
    games: gamesRes.results,
    developers: devsRes.results,
    publishers: pubsRes.results,
  };
}
