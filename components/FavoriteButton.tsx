import React, { useState, useEffect } from 'react';
import { addFavorite, removeFavorite, isFavorite } from '../services/favoritesService';
import { GameRecommendation, RawgGame, SteamUser } from '../types';

interface Props {
  user: SteamUser | null;
  gameId: string;
  gameSource: 'steam' | 'rawg';
  gameTitle: string;
  gameImage: string | null;
  gameData: GameRecommendation | RawgGame;
  className?: string;
}

const FavoriteButton: React.FC<Props> = ({
  user,
  gameId,
  gameSource,
  gameTitle,
  gameImage,
  gameData,
  className = '',
}) => {
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.steamId) {
      setFavorited(false);
      return;
    }
    isFavorite(user.steamId, gameId, gameSource).then(setFavorited);
  }, [user?.steamId, gameId, gameSource]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user?.steamId) {
      alert('Please sign in with Steam to save favorites');
      return;
    }

    setLoading(true);
    try {
      if (favorited) {
        await removeFavorite(user.steamId, gameId, gameSource);
        setFavorited(false);
      } else {
        await addFavorite(user.steamId, gameId, gameSource, gameTitle, gameImage, gameData);
        setFavorited(true);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`group flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
        favorited
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className={`w-5 h-5 transition-transform ${favorited ? 'scale-110' : 'group-hover:scale-110'}`}
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
      <span className="text-sm font-bold">{favorited ? 'Saved' : 'Save'}</span>
    </button>
  );
};

export default FavoriteButton;
