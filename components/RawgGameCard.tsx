import React, { useState, useRef, useEffect } from 'react';
import { RawgGame } from '../types';
import { getGameScreenshots } from '../services/rawgService';

interface RawgGameCardProps {
  game: RawgGame;
  onClick?: (game: RawgGame) => void;
}

// Map RAWG parent platform slugs to display labels
const PLATFORM_LABELS: Record<string, string> = {
  pc: 'PC',
  playstation: 'PlayStation',
  xbox: 'Xbox',
  nintendo: 'Nintendo',
  ios: 'iOS',
  android: 'Android',
  mac: 'macOS',
  linux: 'Linux',
  atari: 'Atari',
  'commodore-amiga': 'Amiga',
  sega: 'SEGA',
  '3do': '3DO',
  'neo-geo': 'Neo Geo',
  web: 'Web',
};

const RawgGameCard: React.FC<RawgGameCardProps> = ({ game, onClick }) => {
  const ratingColor =
    game.rating >= 4 ? 'text-green-400' : game.rating >= 3 ? 'text-blue-400' : 'text-yellow-400';

  const [isHovered, setIsHovered] = useState(false);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [screenshotsRequested, setScreenshotsRequested] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const imageUrls: string[] = React.useMemo(() => {
    if (screenshots.length > 0) return screenshots;
    return game.background_image ? [game.background_image] : [];
  }, [screenshots, game.background_image]);

  // Fetch screenshots on first hover (cached by rawgService)
  useEffect(() => {
    if (!isHovered || screenshotsRequested) return;
    setScreenshotsRequested(true);
    getGameScreenshots(game.id)
      .then((results) => {
        setScreenshots(results.map((s) => s.image));
      })
      .catch((err) => {
        console.error('RAWG screenshot fetch error for game', game.id, err);
      });
  }, [isHovered, screenshotsRequested, game.id]);

  // Slideshow when hovered
  useEffect(() => {
    if (isHovered && imageUrls.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
      }, 1500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentImageIndex(0);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, imageUrls.length]);

  const platforms = game.parent_platforms
    ? game.parent_platforms.map(({ platform }) =>
        PLATFORM_LABELS[platform.slug] ?? platform.name,
      )
    : [];

  return (
    <div
      className="steam-card rounded-2xl overflow-hidden flex flex-col h-full shadow-2xl group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(game)}
    >
      <div className="relative h-48 w-full overflow-hidden bg-black group-hover:shadow-[0_0_30px_rgba(102,192,244,0.3)] transition-all duration-500">
        {imageUrls.length > 0 ? (
          imageUrls.map((url, idx) => (
            <img
              key={idx}
              src={url}
              alt={`${game.name} screenshot ${idx + 1}`}
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                isHovered && idx === currentImageIndex
                  ? 'scale-110 opacity-100'
                  : !isHovered && idx === 0
                  ? 'scale-100 opacity-100'
                  : 'opacity-0 scale-105'
              }`}
              style={{ zIndex: idx === currentImageIndex ? 2 : 1 }}
            />
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs font-black uppercase tracking-widest">
            No Image
          </div>
        )}

        {/* Gallery badge */}
        {isHovered && imageUrls.length > 1 && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 bg-black/60 backdrop-blur-md border border-blue-500/50 rounded text-[10px] font-black text-white z-20">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            GALLERY
          </div>
        )}

        {game.metacritic !== null && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-green-700/90 border border-green-500/50 rounded text-[10px] font-black text-white backdrop-blur-sm z-10">
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

        {platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {platforms.slice(0, 5).map((p) => (
              <span
                key={p}
                className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-white/5 border border-white/10 text-gray-400 rounded-full"
              >
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
          {game.released && (
            <p className="text-[11px] text-gray-600 font-medium">
              Released: {game.released}
            </p>
          )}
          {onClick && (
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              Enrich →
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RawgGameCard;
