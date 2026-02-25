// ── RAWG API types ──────────────────────────────────────────────────────────

export interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  ratings_count: number;
  metacritic: number | null;
  genres: Array<{ id: number; name: string }>;
  developers?: Array<{ id: number; name: string; slug: string }>;
  publishers?: Array<{ id: number; name: string; slug: string }>;
  description_raw?: string;
}

export interface RawgDeveloper {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string | null;
}

export interface RawgPublisher {
  id: number;
  name: string;
  slug: string;
  games_count: number;
  image_background: string | null;
}

export interface RawgListResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type SuggestionKind = 'game' | 'developer' | 'publisher';

export interface Suggestion {
  kind: SuggestionKind;
  id: number;
  name: string;
  imageUrl: string | null;
  extra?: string; // e.g. genre list for games, games_count for devs/pubs
}

// ── Existing types ───────────────────────────────────────────────────────────

export interface GameRecommendation {
  id: string;
  steamAppId: string;
  title: string;
  description: string;
  genres: string[];
  tags: string[];
  mainStoryTime: number; // Hours
  completionistTime: number; // Hours
  suitabilityScore: number; // 0-100
  imageUrl: string;
  gifUrl?: string; 
  developer: string;
  reasonForPick: string;
  steamPrice?: string; // Official Steam Store price
  cheapestPrice?: string; // Absolute cheapest price found on gg.deals
  dealUrl?: string; // Link to gg.deals
}

export interface QuizAnswers {
  preferredGenres: string[];
  playstyle: 'casual' | 'balanced' | 'hardcore';
  timeAvailability: 'short' | 'medium' | 'long';
  specificKeywords: string;
  difficultyPreference: 'easy' | 'normal' | 'challenging';
}

export interface QuizAccuracy {
  percentage: number;
  reasoning: string;
}

export interface RecommendationResponse {
  recommendations: GameRecommendation[];
  accuracy: QuizAccuracy;
}
