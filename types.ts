
export interface GameRecommendation {
  id: string;
  steamAppId: string; // The official Steam App ID for constructing asset URLs
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
