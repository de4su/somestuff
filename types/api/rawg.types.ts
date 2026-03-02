/**
 * rawg.types
 *
 * Type definitions for the RAWG Video Games Database API.
 * Based on https://rawg.io/apidocs
 */

/**
 * A game object as returned by the RAWG API list and detail endpoints.
 */
export interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  genres: Array<{ id: number; name: string }>;
  parent_platforms?: Array<{ platform: { id: number; name: string; slug: string } }>;
  platforms?: Array<{ platform: { id: number; name: string; slug: string } }>;
  tags?: Array<{ id: number; name: string; slug: string }>;
  developers?: Array<{ id: number; name: string; slug: string }>;
  publishers?: Array<{ id: number; name: string; slug: string }>;
  description_raw?: string;
}

/**
 * A screenshot object returned by the RAWG screenshots endpoint.
 */
export interface RawgScreenshot {
  id: number;
  image: string;
}

/**
 * A developer object as returned by the RAWG `/developers` endpoint.
 */
export interface RawgDeveloper {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string | null;
}

/**
 * A publisher object as returned by the RAWG `/publishers` endpoint.
 */
export interface RawgPublisher {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string | null;
}

/**
 * Generic paginated list response from the RAWG API.
 *
 * @template T - The type of items in the `results` array
 */
export interface RawgListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Category of a search suggestion. */
export type SuggestionKind = 'game' | 'developer' | 'publisher';

/**
 * A unified autocomplete suggestion item returned by `fetchSuggestions`.
 * Normalises games, developers, and publishers into a single shape.
 */
export interface Suggestion {
  kind: SuggestionKind;
  id: number;
  name: string;
  imageUrl: string | null;
  /** e.g. genre list for games, games_count for devs/publishers */
  extra?: string;
}

/**
 * Filter options for RAWG game search requests.
 */
export interface GameFilters {
  platforms?: number[];
  genres?: number[];
  tags?: number[];
  ordering?: string;
  page?: number;
  pageSize?: number;
}
