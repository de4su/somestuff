import React, { useState, useEffect } from 'react';
import { GameFilters } from '../types';
import { fetchPlatforms, fetchGenres } from '../services/rawgService';

interface Props {
  filters: GameFilters;
  onChange: (filters: GameFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SearchFilters: React.FC<Props> = ({ filters, onChange, isOpen, onToggle }) => {
  const [platforms, setPlatforms] = useState<Array<{ id: number; name: string }>>([]);
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    Promise.all([fetchPlatforms(), fetchGenres()])
      .then(([platformsRes, genresRes]) => {
        setPlatforms(platformsRes.results.slice(0, 10));
        setGenres(genresRes.results);
      })
      .catch((err) => {
        console.error('Failed to load filter options:', err);
      });
  }, []);

  const handlePlatformToggle = (id: number) => {
    const current = filters.platforms ?? [];
    const updated = current.includes(id) ? current.filter((p) => p !== id) : [...current, id];
    onChange({ ...filters, platforms: updated });
  };

  const handleGenreToggle = (id: number) => {
    const current = filters.genres ?? [];
    const updated = current.includes(id) ? current.filter((g) => g !== id) : [...current, id];
    onChange({ ...filters, genres: updated });
  };

  const activeCount = (filters.platforms?.length ?? 0) + (filters.genres?.length ?? 0);

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-black/60 border border-white/10 rounded-full text-white text-sm font-bold hover:bg-black/80 transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 w-96 bg-[#1b2838] border border-white/10 rounded-xl shadow-2xl z-[100] p-6 max-h-[600px] overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Platforms</h3>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filters.platforms?.includes(platform.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {platform.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreToggle(genre.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    filters.genres?.includes(genre.id)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Min Metacritic Score</h3>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filters.metacriticMin ?? 0}
              onChange={(e) => onChange({ ...filters, metacriticMin: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="text-gray-400 text-xs mt-1">{filters.metacriticMin ?? 0}+</div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-bold text-sm mb-3 uppercase tracking-wider">Sort By</h3>
            <select
              value={filters.ordering ?? '-relevance'}
              onChange={(e) => onChange({ ...filters, ordering: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-white text-sm"
            >
              <option value="-relevance">Relevance</option>
              <option value="-rating">Highest Rated</option>
              <option value="-released">Release Date</option>
              <option value="-added">Recently Added</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          <button
            onClick={() => onChange({})}
            className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm font-bold transition-all"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
