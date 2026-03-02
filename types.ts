/**
 * types
 *
 * Root type barrel — re-exports all application type definitions from their
 * organized sub-modules. Existing imports of `'./types'` or `'../types'`
 * continue to work without any changes.
 *
 * For new code, prefer importing directly from the sub-modules:
 *   - `./types/api/rawg.types`
 *   - `./types/api/steam.types`
 *   - `./types/api/gemini.types`
 *   - `./types/database/favorites.types`
 *   - `./types/database/quizResults.types`
 */

export type { RawgGame, RawgScreenshot, RawgDeveloper, RawgPublisher, RawgListResponse, SuggestionKind, Suggestion, GameFilters } from './types/api/rawg.types';
export type { SteamUser } from './types/api/steam.types';
export type { QuizAnswers, GameRecommendation, QuizAccuracy, RecommendationResponse } from './types/api/gemini.types';
export type { FavoriteGame } from './types/database/favorites.types';
export type { QuizResultRecord } from './types/database/quizResults.types';
