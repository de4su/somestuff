/**
 * rawgService
 *
 * Re-exports all RAWG API functions from their organized sub-modules.
 * Kept for backward compatibility — prefer importing directly from the sub-modules:
 *   - `./api/rawg/games`
 *   - `./api/rawg/developers`
 *   - `./api/rawg/publishers`
 *   - `./api/rawg/filters`
 *   - `./api/rawg/search`
 */

export { searchGames, searchGamesWithFilters, getGameDetails, getGameScreenshots, getGamesByDeveloper, getGamesByPublisher } from './api/rawg/games';
export { searchDevelopers } from './api/rawg/developers';
export { searchPublishers } from './api/rawg/publishers';
export { fetchPlatforms, fetchGenres, fetchTags } from './api/rawg/filters';
export { fetchSuggestions } from './api/rawg/search';
