
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
