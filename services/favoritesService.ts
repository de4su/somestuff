import { supabase } from './supabaseClient';
import { FavoriteGame } from '../types';

export async function getFavorites(steamId: string): Promise<FavoriteGame[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select('*')
    .eq('steam_id', steamId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as FavoriteGame[]) ?? [];
}

export async function addFavorite(
  steamId: string,
  gameId: string,
  gameSource: 'rawg' | 'steam',
  gameTitle: string,
  gameImage: string | null,
  gameData: Record<string, unknown> | null,
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

export async function removeFavorite(steamId: string, gameId: string, gameSource: 'rawg' | 'steam'): Promise<void> {
  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('steam_id', steamId)
    .eq('game_id', gameId)
    .eq('game_source', gameSource);
  if (error) throw error;
}

export async function isFavorite(steamId: string, gameId: string, gameSource: 'rawg' | 'steam'): Promise<boolean> {
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
