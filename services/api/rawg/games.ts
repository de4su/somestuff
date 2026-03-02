/**
 * games
 *
 * RAWG API functions for searching and retrieving game data.
 * Covers general game search, filtered search, and individual game/screenshot lookups.
 */

import type { RawgGame, RawgListResponse, RawgScreenshot, GameFilters } from '@/types';
import { rawgFetch, applyFilters } from './rawgClient';

/**
 * Searches for games by text query with optional pagination.
 *
 * @param query - The search query string
 * @param page - Page number (default: `1`)
 * @param pageSize - Number of results per page (default: `20`)
 * @returns Paginated list of matching `RawgGame` objects
 *
 * @example
 * ```typescript
 * const results = await searchGames('portal', 1, 10);
 * console.log(results.results[0].name); // 'Portal'
 * ```
 */
export async function searchGames(
  query: string,
  page = 1,
  pageSize = 20,
): Promise<RawgListResponse<RawgGame>> {
  return rawgFetch<RawgListResponse<RawgGame>>('/games', {
    search: query,
    page,
    page_size: pageSize,
  });
}

/**
 * Searches for games by text query with full filter support and an optional abort signal.
 *
 * Applies platform, genre, tag, and ordering filters from the provided `GameFilters`
 * object. Pagination is also read from `filters.page` and `filters.pageSize`.
 *
 * @param query - The search query string
 * @param filters - Optional filters to narrow results (default: `{}`)
 * @param signal - Optional `AbortSignal` for cancelling the request
 * @returns Paginated list of matching `RawgGame` objects
 *
 * @example
 * ```typescript
 * const results = await searchGamesWithFilters('action', { platforms: [4], genres: [4] });
 * ```
 */
export async function searchGamesWithFilters(
  query: string,
  filters: GameFilters = {},
  signal?: AbortSignal,
): Promise<RawgListResponse<RawgGame>> {
  const params: Record<string, string | number> = {
    search: query,
    page: filters.page ?? 1,
    page_size: filters.pageSize ?? 20,
  };

  applyFilters(params, filters);

  return rawgFetch<RawgListResponse<RawgGame>>('/games', params, signal);
}

/**
 * Retrieves detailed information for a single game by its RAWG ID.
 *
 * @param gameId - The RAWG numeric game ID
 * @returns Full `RawgGame` object with extended details
 *
 * @example
 * ```typescript
 * const game = await getGameDetails(3498); // Red Dead Redemption 2
 * console.log(game.name); // 'Red Dead Redemption 2'
 * ```
 */
export async function getGameDetails(gameId: number): Promise<RawgGame> {
  return rawgFetch<RawgGame>(`/games/${gameId}`, {});
}

/**
 * Fetches all available screenshots for a game.
 *
 * @param gameId - The RAWG numeric game ID
 * @returns Array of `RawgScreenshot` objects containing image URLs
 *
 * @example
 * ```typescript
 * const screenshots = await getGameScreenshots(3498);
 * screenshots.forEach(s => console.log(s.image));
 * ```
 */
export async function getGameScreenshots(gameId: number): Promise<RawgScreenshot[]> {
  const data = await rawgFetch<RawgListResponse<RawgScreenshot>>(
    `/games/${gameId}/screenshots`,
    {},
  );
  return data.results;
}

/**
 * Retrieves games filtered by a developer's RAWG ID, with optional additional filters.
 *
 * @param developerId - The RAWG numeric developer ID
 * @param page - Page number (default: `1`)
 * @param pageSize - Number of results per page (default: `20`)
 * @param filters - Optional additional filters (genres, tags, ordering)
 * @returns Paginated list of `RawgGame` objects from that developer
 *
 * @example
 * ```typescript
 * const games = await getGamesByDeveloper(3612, 1, 20, { ordering: '-rating' });
 * ```
 */
export async function getGamesByDeveloper(
  developerId: number,
  page = 1,
  pageSize = 20,
  filters: GameFilters = {},
): Promise<RawgListResponse<RawgGame>> {
  const params: Record<string, string | number> = {
    developers: developerId,
    page,
    page_size: pageSize,
  };
  applyFilters(params, filters);
  return rawgFetch<RawgListResponse<RawgGame>>('/games', params);
}

/**
 * Retrieves games filtered by a publisher's RAWG ID, with optional additional filters.
 *
 * @param publisherId - The RAWG numeric publisher ID
 * @param page - Page number (default: `1`)
 * @param pageSize - Number of results per page (default: `20`)
 * @param filters - Optional additional filters (genres, tags, ordering)
 * @returns Paginated list of `RawgGame` objects from that publisher
 *
 * @example
 * ```typescript
 * const games = await getGamesByPublisher(354, 1, 20, { ordering: '-metacritic' });
 * ```
 */
export async function getGamesByPublisher(
  publisherId: number,
  page = 1,
  pageSize = 20,
  filters: GameFilters = {},
): Promise<RawgListResponse<RawgGame>> {
  const params: Record<string, string | number> = {
    publishers: publisherId,
    page,
    page_size: pageSize,
  };
  applyFilters(params, filters);
  return rawgFetch<RawgListResponse<RawgGame>>('/games', params);
}
