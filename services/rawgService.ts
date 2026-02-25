import {
  RawgGame,
  RawgDeveloper,
  RawgPublisher,
  RawgListResponse,
} from '../types';

const BASE_URL = 'https://api.rawg.io/api';
const getKey = () => import.meta.env.VITE_RAWG_API_KEY as string ?? '';

// ── In-memory cache ──────────────────────────────────────────────────────────
const cache = new Map<string, unknown>();

async function rawgFetch<T>(
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
const controllers = new Map<string, AbortController>();

function getController(key: string): AbortSignal {
  const prev = controllers.get(key);
  if (prev) prev.abort();
  const next = new AbortController();
  controllers.set(key, next);
  return next.signal;
}

// ── Public API ───────────────────────────────────────────────────────────────

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

export async function getGamesByDeveloper(
  developerId: number,
  page = 1,
  pageSize = 20,
): Promise<RawgListResponse<RawgGame>> {
  return rawgFetch<RawgListResponse<RawgGame>>('/games', {
    developers: developerId,
    page,
    page_size: pageSize,
  });
}

export async function getGamesByPublisher(
  publisherId: number,
  page = 1,
  pageSize = 20,
): Promise<RawgListResponse<RawgGame>> {
  return rawgFetch<RawgListResponse<RawgGame>>('/games', {
    publishers: publisherId,
    page,
    page_size: pageSize,
  });
}

// ── Typeahead helper (debounced internally via AbortController) ───────────────
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
