/*
 * ProfilePage — Displays a logged-in user's quiz history and favorites fetched from Supabase.
 * Results are ordered newest-first and rendered as an accordion so the page stays
 * scannable; clicking a row expands the full game list for that session.
 */
import React, { useEffect, useState } from 'react';
import { SteamUser, QuizResultRecord, FavoriteGame } from '../types';
import { supabase } from '../services/supabaseClient';
import { getFavorites, removeFavorite } from '../services/favoritesService';

interface ProfilePageProps {
  user: SteamUser;
  onBack: () => void;
}

type ProfileTab = 'history' | 'favorites';

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('history');
  const [history, setHistory] = useState<QuizResultRecord[]>([]);
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [{ data, error: fetchError }, favs] = await Promise.all([
          supabase
            .from('quiz_results')
            .select('*')
            .eq('steam_id', user.steamId)
            .order('created_at', { ascending: false }),
          getFavorites(user.steamId).catch(() => [] as FavoriteGame[]),
        ]);

        if (fetchError) throw fetchError;
        setHistory((data as QuizResultRecord[]) ?? []);
        setFavorites(favs);
      } catch (err: unknown) {
        console.error('Failed to fetch profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user.steamId]);

  const handleRemoveFavorite = async (fav: FavoriteGame) => {
    try {
      await removeFavorite(user.steamId, fav.game_id, fav.game_source);
      setFavorites((prev) => prev.filter((f) => f.id !== fav.id));
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  return (
    <div className="animate-results w-full max-w-4xl mx-auto pointer-events-auto">
      {/* Header */}
      <div className="mb-10 p-8 steam-card rounded-2xl flex flex-col md:flex-row items-center md:items-start gap-6 shadow-2xl border-l-8 border-l-blue-600">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-20 h-20 rounded-full border-4 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black">
            {user.username.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-1">{user.username}</h2>
          <p className="text-gray-500 text-sm font-mono">Steam ID: {user.steamId}</p>
          <p className="text-blue-400 text-sm mt-2 font-semibold">
            {history.length} quiz result{history.length !== 1 ? 's' : ''} &bull; {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onBack}
          className="md:ml-auto px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-full transition-all text-xs font-black tracking-widest uppercase border border-white/5"
        >
          &larr; Back
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div className="py-20 text-center flex flex-col items-center animate-pulse">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Loading Profile…</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-500/30 text-red-200 font-mono text-sm rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                activeTab === 'history'
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                  : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'
              }`}
            >
              Quiz History ({history.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border ${
                activeTab === 'favorites'
                  ? 'bg-pink-600/20 border-pink-500/50 text-pink-400'
                  : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'
              }`}
            >
              ♥ Wishlist ({favorites.length})
            </button>
          </div>

          {/* Quiz History Tab */}
          {activeTab === 'history' && (
            <>
              {history.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-gray-600 font-black uppercase tracking-widest text-sm">No quiz results yet.</p>
                  <p className="text-gray-700 text-xs mt-2">Complete a quiz to see your history here.</p>
                </div>
              )}
              {history.length > 0 && (
                <div className="space-y-4">
                  {history.map((record) => {
                    const date = new Date(record.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric',
                    });
                    const isOpen = expanded === record.id;

                    return (
                      <div key={record.id} className="steam-card rounded-xl overflow-hidden shadow-xl">
                        <button
                          className="w-full p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-left hover:bg-white/5 transition-colors"
                          onClick={() => setExpanded(isOpen ? null : record.id)}
                        >
                          <div>
                            <p className="text-white font-black uppercase tracking-tight text-sm">
                              {record.answers.preferredGenres.join(', ') || 'Any Genre'} &mdash; {record.answers.playstyle}
                            </p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {record.results.recommendations.length} recommendations &bull; {record.answers.timeAvailability} session &bull; {date}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-blue-400 font-black text-xl">
                              {record.results.accuracy?.percentage ?? 0}%
                            </span>
                            <span className="text-gray-600 text-xs">{isOpen ? '▲' : '▼'}</span>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="border-t border-white/5 p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {record.results.recommendations.map((game, idx) => (
                              <a
                                key={game.steamAppId ?? idx}
                                href={`https://store.steampowered.com/app/${game.steamAppId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all group"
                              >
                                <img
                                  src={`https://cdn.akamai.steamstatic.com/steam/apps/${game.steamAppId}/header.jpg`}
                                  alt={game.title}
                                  className="w-16 h-9 object-cover rounded shrink-0"
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                <div className="min-w-0">
                                  <p className="text-white text-xs font-black truncate group-hover:text-blue-400 transition-colors">
                                    {game.title}
                                  </p>
                                  <p className="text-gray-600 text-[10px]">{game.suitabilityScore}% match</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <>
              {favorites.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-gray-600 font-black uppercase tracking-widest text-sm">No favorites yet.</p>
                  <p className="text-gray-700 text-xs mt-2">Click the ♥ on any game to add it to your wishlist.</p>
                </div>
              )}
              {favorites.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="steam-card rounded-xl overflow-hidden shadow-xl flex flex-col group"
                    >
                      {fav.game_image && (
                        <img
                          src={fav.game_image}
                          alt={fav.game_title}
                          className="w-full h-32 object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="p-4 flex flex-col flex-grow">
                        <p className="text-white text-sm font-black uppercase tracking-tight line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                          {fav.game_title}
                        </p>
                        <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-3">
                          {fav.game_source === 'rawg' ? 'RAWG' : 'Steam'}
                        </p>
                        <button
                          onClick={() => handleRemoveFavorite(fav)}
                          className="mt-auto text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 rounded-full py-1.5 transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ProfilePage;
