import React, { useEffect, useState } from 'react';
import { GameFilters } from '../types';
import { fetchPlatforms, fetchGenres } from '../services/rawgService';

interface SearchFiltersProps {
  filters: GameFilters;
  onChange: (filters: GameFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: '-rating', label: 'Rating (High → Low)' },
  { value: 'rating', label: 'Rating (Low → High)' },
  { value: '-metacritic', label: 'Metacritic (High → Low)' },
  { value: '-released', label: 'Release Date (Newest)' },
  { value: 'released', label: 'Release Date (Oldest)' },
  { value: '-added', label: 'Most Popular' },
];

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onChange, isOpen, onToggle }) => {
  const [platforms, setPlatforms] = useState<Array<{ id: number; name: string }>>([]);
  const [genres, setGenres] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    fetchPlatforms().then(setPlatforms).catch(console.error);
    fetchGenres().then(setGenres).catch(console.error);
  }, []);

  const activeCount = [
    (filters.platforms?.length ?? 0) > 0,
    (filters.genres?.length ?? 0) > 0,
    (filters.metacriticMin ?? 0) > 0,
    !!filters.ordering,
  ].filter(Boolean).length;

  const togglePlatform = (id: number) => {
    const current = filters.platforms ?? [];
    const updated = current.includes(id) ? current.filter((p) => p !== id) : [...current, id];
    onChange({ ...filters, platforms: updated });
  };

  const toggleGenre = (id: number) => {
    const current = filters.genres ?? [];
    const updated = current.includes(id) ? current.filter((g) => g !== id) : [...current, id];
    onChange({ ...filters, genres: updated });
  };

  const handleMetacritic = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, metacriticMin: Number(e.target.value) });
  };

  const handleOrdering = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, ordering: e.target.value || undefined });
  };

  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className="relative">
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filters
        {activeCount > 0 && (
          <span className="bg-blue-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-[#1e2130] border border-white/10 rounded-2xl shadow-2xl z-50 p-5 space-y-5">
          {/* Sort */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Sort By</label>
            <select
              value={filters.ordering ?? ''}
              onChange={handleOrdering}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1e2130]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Metacritic */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
              Metacritic Min: <span className="text-blue-400">{filters.metacriticMin ?? 0}</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={filters.metacriticMin ?? 0}
              onChange={handleMetacritic}
              className="w-full accent-blue-500"
            />
          </div>

          {/* Platforms */}
          {platforms.length > 0 && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Platforms</label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {platforms.map((p) => {
                  const active = (filters.platforms ?? []).includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                        active
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Genres */}
          {genres.length > 0 && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Genres</label>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                {genres.map((g) => {
                  const active = (filters.genres ?? []).includes(g.id);
                  return (
                    <button
                      key={g.id}
                      onClick={() => toggleGenre(g.id)}
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-all ${
                        active
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {g.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Clear */}
          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
