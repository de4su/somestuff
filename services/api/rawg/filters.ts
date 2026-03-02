/**
 * filters
 *
 * RAWG API functions for fetching filter option lists: platforms, genres, and tags.
 * Results are cached automatically by `rawgFetch` so repeated calls are free.
 */

import type { RawgListResponse } from '@/types';
import { rawgFetch } from './rawgClient';

/** Minimal shape returned for platform, genre, and tag list items. */
interface FilterItem {
  id: number;
  name: string;
  slug: string;
}

/**
 * Fetches the list of all platforms available on RAWG.
 *
 * @returns Paginated list of platform filter items (id, name, slug)
 *
 * @example
 * ```typescript
 * const platforms = await fetchPlatforms();
 * platforms.results.forEach(p => console.log(p.name)); // 'PC', 'PlayStation 5', …
 * ```
 */
export async function fetchPlatforms(): Promise<RawgListResponse<FilterItem>> {
  return rawgFetch('/platforms', { page_size: 50 });
}

/**
 * Fetches the list of all genres available on RAWG.
 *
 * @returns Paginated list of genre filter items (id, name, slug)
 *
 * @example
 * ```typescript
 * const genres = await fetchGenres();
 * genres.results.forEach(g => console.log(g.name)); // 'Action', 'RPG', …
 * ```
 */
export async function fetchGenres(): Promise<RawgListResponse<FilterItem>> {
  return rawgFetch('/genres', { page_size: 50 });
}

/**
 * Fetches the list of popular tags available on RAWG.
 *
 * @returns Paginated list of tag filter items (id, name, slug)
 *
 * @example
 * ```typescript
 * const tags = await fetchTags();
 * tags.results.forEach(t => console.log(t.name)); // 'Singleplayer', 'Multiplayer', …
 * ```
 */
export async function fetchTags(): Promise<RawgListResponse<FilterItem>> {
  return rawgFetch('/tags', { page_size: 50 });
}
