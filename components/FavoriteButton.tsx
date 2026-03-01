import React, { useEffect, useState } from 'react';
import { SteamUser, GameRecommendation, RawgGame } from '../types';
import { addFavorite, removeFavorite, isFavorite } from '../services/favoritesService';

interface FavoriteButtonProps {
  user: SteamUser | null;
  gameId: string;
  gameSource: 'steam' | 'rawg';
  gameTitle: string;
  gameImage: string | null;
  gameData: GameRecommendation | RawgGame;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  user,
  gameId,
  gameSource,
  gameTitle,
  gameImage,
  gameData,
}) => {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    isFavorite(user.steamId, gameId, gameSource)
      .then(setFavorited)
      .catch(console.error);
  }, [user, gameId, gameSource]);

  if (!user) return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    const previousState = favorited;
    setFavorited(!favorited); // optimistic update
    try {
      if (previousState) {
        await removeFavorite(user.steamId, gameId, gameSource);
      } else {
        await addFavorite(user.steamId, gameId, gameSource, gameTitle, gameImage, gameData);
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
      setFavorited(previousState); // revert on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
      className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all disabled:opacity-50 ${
        favorited
          ? 'bg-red-600/20 border-red-500/50 text-red-400 hover:bg-red-600/30'
          : 'bg-white/5 border-white/10 text-gray-500 hover:text-red-400 hover:border-red-500/30'
      }`}
    >
      <svg
        className="w-4 h-4"
        fill={favorited ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;
