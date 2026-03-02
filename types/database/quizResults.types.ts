/**
 * quizResults.types
 *
 * Type definitions for the quiz result cache stored in Supabase.
 * Identical quiz submissions are deduplicated using a hash of the answers.
 */

import type { QuizAnswers, RecommendationResponse } from '../api/gemini.types';

/**
 * A cached quiz result row from the `quiz_results` Supabase table.
 *
 * `answers_hash` is a base64-encoded, sorted representation of `QuizAnswers`
 * used as a cache key so that identical quiz submissions are served from
 * Supabase rather than re-queried from Gemini.
 */
export interface QuizResultRecord {
  id: string;
  steam_id: string;
  answers_hash: string;
  answers: QuizAnswers;
  results: RecommendationResponse;
  created_at: string;
}
