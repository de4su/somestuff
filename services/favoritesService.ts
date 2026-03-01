import { supabase } from './supabaseClient';
import { FavoriteGame, GameRecommendation, RawgGame } from '../types';

export async function addFavorite(
  steamId: string,
  gameId: string,
  gameSource: 'steam' | 'rawg',
  gameTitle: string,
  gameImage: string | null,
  gameData: GameRecommendation | RawgGame,
): Promise<FavoriteGame | null> {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        steam_id: steamId,
        game_id: gameId,
        game_source: gameSource,
        game_title: gameTitle,
        game_image: gameImage,
        game_data: gameData,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.log('Game already in favorites');
        return null;
      }
      throw error;
    }

    return data as FavoriteGame;
  } catch (err) {
    console.error('Failed to add favorite:', err);
    throw err;
  }
}

export async function removeFavorite(
  steamId: string,
  gameId: string,
  gameSource: 'steam' | 'rawg',
): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('steam_id', steamId)
      .eq('game_id', gameId)
      .eq('game_source', gameSource);

    if (error) throw error;
  } catch (err) {
    console.error('Failed to remove favorite:', err);
    throw err;
  }
}

export async function getFavorites(steamId: string): Promise<FavoriteGame[]> {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('steam_id', steamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as FavoriteGame[]) ?? [];
  } catch (err) {
    console.error('Failed to fetch favorites:', err);
    return [];
  }
}

export async function isFavorite(
  steamId: string,
  gameId: string,
  gameSource: 'steam' | 'rawg',
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('steam_id', steamId)
      .eq('game_id', gameId)
      .eq('game_source', gameSource)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (err) {
    console.error('Failed to check favorite status:', err);
    return false;
  }
}
