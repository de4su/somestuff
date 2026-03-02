/**
 * types/index
 *
 * Barrel export for all application type definitions.
 * Imports from this file resolve to the correct sub-module automatically.
 */

export type { RawgGame, RawgScreenshot, RawgDeveloper, RawgPublisher, RawgListResponse, SuggestionKind, Suggestion, GameFilters } from './api/rawg.types';
export type { SteamUser } from './api/steam.types';
export type { QuizAnswers, GameRecommendation, QuizAccuracy, RecommendationResponse } from './api/gemini.types';
export type { FavoriteGame } from './database/favorites.types';
export type { QuizResultRecord } from './database/quizResults.types';
