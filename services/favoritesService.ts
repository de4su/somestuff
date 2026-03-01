import { supabase } from './supabaseClient';
import { FavoriteGame, GameRecommendation, RawgGame } from '../types';

export async function addFavorite(
  steamId: string,
  gameId: string,
  gameSource: 'steam' | 'rawg',
  gameTitle: string,
  gameImage: string | null,
  gameData: GameRecommendation | RawgGame,
): Promise<void> {
  const { error } = await supabase.from('user_favorites').insert({
    steam_id: steamId,
    game_id: gameId,
    game_source: gameSource,
    game_title: gameTitle,
    game_image: gameImage,
    game_data: gameData,
  });
  if (error) throw error;
}

export async function removeFavorite(steamId: string, gameId: string, gameSource: 'steam' | 'rawg'): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('steam_id', steamId)
    .eq('game_id', gameId)
    .eq('game_source', gameSource);
  if (error) throw error;
}

export async function getFavorites(steamId: string): Promise<FavoriteGame[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('steam_id', steamId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as FavoriteGame[]) ?? [];
}

export async function isFavorite(steamId: string, gameId: string, gameSource: 'steam' | 'rawg'): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('steam_id', steamId)
    .eq('game_id', gameId)
    .eq('game_source', gameSource)
    .maybeSingle();
  if (error) throw error;
  return data !== null;
}
