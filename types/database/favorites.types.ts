/**
 * favorites.types
 *
 * Type definitions for the user favorites/wishlist feature stored in Supabase.
 */

/**
 * A favorited game row from the `user_favorites` Supabase table.
 */
export interface FavoriteGame {
  id: string;
  steam_id: string;
  game_id: string;
  game_source: 'rawg' | 'steam';
  game_title: string;
  game_image: string | null;
  game_data: Record<string, unknown> | null;
  created_at: string;
}
