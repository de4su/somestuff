import React from 'react';
import { RawgGame } from '../types';

interface RawgGameCardProps {
  game: RawgGame;
}

const RawgGameCard: React.FC<RawgGameCardProps> = ({ game }) => {
  const ratingColor =
    game.rating >= 4 ? 'text-green-400' : game.rating >= 3 ? 'text-blue-400' : 'text-yellow-400';

  return (
    <div className="steam-card rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl group">
      <div className="relative h-48 w-full overflow-hidden bg-black">
        {game.background_image ? (
          <img
            src={game.background_image}
            alt={game.name}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs font-black uppercase tracking-widest">
            No Image
          </div>
        )}

        {game.metacritic !== null && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-700/90 border border-green-500/50 rounded text-[10px] font-black text-white backdrop-blur-sm">
            MC {game.metacritic}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight line-clamp-2 mb-2">
          {game.name}
        </h3>

        <div className="flex items-center gap-2 mb-3">
          <span className={`text-sm font-bold ${ratingColor}`}>★ {game.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-600">({game.ratings_count.toLocaleString()} ratings)</span>
        </div>

        {game.genres && game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {game.genres.slice(0, 3).map((g) => (
              <span
                key={g.id}
                className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-full"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}

        {game.released && (
          <p className="text-[11px] text-gray-600 mt-auto font-medium">
            Released: {game.released}
          </p>
        )}
      </div>
    </div>
  );
};

export default RawgGameCard;
