import React, { useEffect, useState } from 'react';
import { GameFilters, RawgGame } from '../types';
import { fetchPlatforms, fetchGenres } from '../services/api/rawg/filters';

interface FilterOption {
  id: number;
  name: string;
  slug: string;
}

interface SearchFiltersProps {
  filters: GameFilters;
  onChange: (filters: GameFilters) => void;
  isOpen: boolean;
  onToggle: () => void;
  currentGames: RawgGame[];
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onChange, isOpen, onToggle, currentGames }) => {
  const [platforms, setPlatforms] = useState<FilterOption[]>([]);
  const [genres, setGenres] = useState<FilterOption[]>([]);

  useEffect(() => {
    fetchPlatforms()
      .then((res) => setPlatforms(res.results))
      .catch((err) => { console.error('Failed to fetch platforms:', err); });
    fetchGenres()
      .then((res) => setGenres(res.results))
      .catch((err) => { console.error('Failed to fetch genres:', err); });
  }, []);

  const availablePlatformCounts = React.useMemo(() => {
    const counts = new Map<number, number>();
    currentGames.forEach(game => {
      game.platforms?.forEach(p => {
        counts.set(p.platform.id, (counts.get(p.platform.id) || 0) + 1);
      });
    });
    return counts;
  }, [currentGames]);

  const availableGenreCounts = React.useMemo(() => {
    const counts = new Map<number, number>();
    currentGames.forEach(game => {
      game.genres?.forEach(g => {
        counts.set(g.id, (counts.get(g.id) || 0) + 1);
      });
    });
    return counts;
  }, [currentGames]);

  const availableTagCounts = React.useMemo(() => {
    const counts = new Map<number, { name: string; count: number }>();
    currentGames.forEach(game => {
      game.tags?.forEach(t => {
        const existing = counts.get(t.id);
        counts.set(t.id, { name: t.name, count: (existing?.count || 0) + 1 });
      });
    });
    return Array.from(counts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 20);
  }, [currentGames]);

  const toggleId = (current: number[] | undefined, id: number): number[] => {
    const arr = current ?? [];
    return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
  };

  const hasActiveFilters =
    (filters.platforms && filters.platforms.length > 0) ||
    (filters.genres && filters.genres.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    (filters.ordering && filters.ordering !== '');

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`px-5 py-2 rounded-full transition-all text-xs font-black tracking-widest uppercase border ${
          hasActiveFilters
            ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30'
            : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border-white/5'
        }`}
      >
        {hasActiveFilters ? '⚙ Filters (active)' : '⚙ Filters'}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-[400px] max-h-[600px] overflow-y-auto bg-[#1b2838] border border-white/10 rounded-2xl shadow-2xl z-50 p-5 space-y-5">

          {/* Platforms / Consoles */}
          {platforms.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 pb-2 border-b border-white/5">
                Platforms / Consoles
              </p>
              <div className="flex flex-wrap gap-1.5">
                {platforms.map((p) => {
                  const active = filters.platforms?.includes(p.id);
                  const count = availablePlatformCounts.get(p.id) || 0;
                  const available = count > 0;
                  return (
                    <button
                      key={p.id}
                      onClick={() => available && onChange({ ...filters, platforms: toggleId(filters.platforms, p.id) })}
                      disabled={!available}
                      className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border transition-all ${
                        active
                          ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                          : available
                            ? 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white cursor-pointer'
                            : 'bg-white/5 border-white/5 text-gray-700 cursor-not-allowed opacity-40'
                      }`}
                    >
                      {p.name}
                      {available && <span className="ml-1 opacity-60">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Genres */}
          {genres.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 pb-2 border-b border-white/5">
                Genres
              </p>
              <div className="flex flex-wrap gap-1.5">
                {genres.map((g) => {
                  const active = filters.genres?.includes(g.id);
                  const count = availableGenreCounts.get(g.id) || 0;
                  const available = count > 0;
                  return (
                    <button
                      key={g.id}
                      onClick={() => available && onChange({ ...filters, genres: toggleId(filters.genres, g.id) })}
                      disabled={!available}
                      className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border transition-all ${
                        active
                          ? 'bg-blue-600/30 border-blue-500/50 text-blue-300'
                          : available
                            ? 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white cursor-pointer'
                            : 'bg-white/5 border-white/5 text-gray-700 cursor-not-allowed opacity-40'
                      }`}
                    >
                      {g.name}
                      {available && <span className="ml-1 opacity-60">({count})</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {availableTagCounts.length > 0 && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 pb-2 border-b border-white/5">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {availableTagCounts.map(([tagId, { name, count }]) => {
                  const active = filters.tags?.includes(tagId);
                  return (
                    <button
                      key={tagId}
                      onClick={() => onChange({ ...filters, tags: toggleId(filters.tags, tagId) })}
                      className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-full border transition-all ${
                        active
                          ? 'bg-green-600/30 border-green-500/50 text-green-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white cursor-pointer'
                      }`}
                    >
                      {name}
                      <span className="ml-1 opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sort By */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 pb-2 border-b border-white/5">
              Sort By
            </p>
            <select
              value={filters.ordering || ''}
              onChange={(e) => onChange({ ...filters, ordering: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white font-black uppercase tracking-wider focus:outline-none focus:border-blue-500/50"
            >
              <option value="">Relevance</option>
              <option value="-rating">Rating (High → Low)</option>
              <option value="rating">Rating (Low → High)</option>
              <option value="-metacritic">Metacritic (High → Low)</option>
              <option value="-released">Newest First</option>
              <option value="released">Oldest First</option>
              <option value="-added">Most Added</option>
            </select>
          </div>

          {/* Clear All */}
          {hasActiveFilters && (
            <button
              onClick={() => onChange({ ordering: filters.ordering })}
              className="w-full py-2 text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-full transition-all"
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
