/**
 * gemini.types
 *
 * Type definitions for the Google Gemini AI game recommendation service.
 */

/**
 * User preferences collected by the quiz, used as input to the Gemini prompt.
 */
export interface QuizAnswers {
  preferredGenres: string[];
  playstyle: 'casual' | 'balanced' | 'hardcore';
  timeAvailability: 'short' | 'medium' | 'long';
  specificKeywords: string;
  difficultyPreference: 'easy' | 'normal' | 'challenging';
}

/**
 * A single game recommendation produced by the Gemini AI service,
 * enriched with Steam Store pricing and gg.deals deal data.
 */
export interface GameRecommendation {
  id: string;
  steamAppId: string;
  title: string;
  description: string;
  genres: string[];
  tags: string[];
  /** Typical hours to finish the main story. */
  mainStoryTime: number;
  /** Hours required for 100% completion. */
  completionistTime: number;
  /** How well this game matches the user's preferences (0–100). */
  suitabilityScore: number;
  imageUrl: string;
  gifUrl?: string;
  developer: string;
  reasonForPick: string;
  /** Official Steam Store price (e.g. `"$19.99"`). */
  steamPrice?: string;
  /** Absolute cheapest price found on gg.deals (e.g. `"$4.99"`). */
  cheapestPrice?: string;
  /** Link to the gg.deals listing. */
  dealUrl?: string;
}

/**
 * Overall accuracy rating for a set of Gemini recommendations,
 * explaining how well the results match the user's quiz answers.
 */
export interface QuizAccuracy {
  percentage: number;
  reasoning: string;
}

/**
 * Full response returned by `getGameRecommendations`, containing
 * the ranked list of games and the accuracy assessment.
 */
export interface RecommendationResponse {
  recommendations: GameRecommendation[];
  accuracy: QuizAccuracy;
}
